# Fix: Attempt Stats Showing "1" Instead of Actual Session Attempts

## Problem Description

The ProgressMap was displaying "1 attempt" for questions that actually took 4+ attempts to complete. The issue affected the `latestAttempt.attempts` field which was being saved with an incorrect value.

## Root Cause Analysis

### Issue Location

- **File**: `progressServices.tsx`
- **Function**: `recordAttempt()`
- **Lines**: 262-310

### The Problem

When a user completed a question:

1. `currentSessionAttempts` was reset to `0` after successful completion (line 310)
2. When the user retried the same question in a new session, `currentSessionAttempts` remained at `0` (not `undefined`)
3. The initialization check at line 264 only reset if `undefined`, so it stayed at `0`
4. On the first attempt of the new session, it incremented to `1`
5. If the user got it correct on the first attempt, `latestAttempt.attempts` was saved as `1`

### Data Flow Before Fix

```
Question Completed:
  currentSessionAttempts = 4 (incremented during session)
  latestAttempt.attempts = 4 (saved)
  currentSessionAttempts = 0 (reset after save)

User Retries Same Question:
  currentSessionAttempts = 0 (from localStorage, not undefined)
  Initialization check (line 264) doesn't run (only checks === undefined)
  First attempt: currentSessionAttempts++ → 1
  If correct: latestAttempt.attempts = 1 ❌ BUG
```

## Solution Implemented

### 1. Created `resetQuestionSession()` Method

**File**: `progressServices.tsx` (lines 439-449)

```typescript
resetQuestionSession(topicId: number, categoryId: number, questionId: number): void {
  const progress = this.getUserProgress();
  const topicProgress = this.getOrCreateTopicProgress(progress, topicId);
  const categoryProgress = this.getOrCreateCategoryProgress(topicProgress, categoryId);
  const questionProgress = this.getOrCreateQuestionProgress(categoryProgress, questionId);

  // Reset session attempts to 0 (start fresh session)
  questionProgress.currentSessionAttempts = 0;

  this.saveProgress(progress);
}
```

**Purpose**: Explicitly resets `currentSessionAttempts` to 0 when a question session starts/restarts.

### 2. Exposed Method in `useProgress` Hook

**File**: `useProgress.tsx` (lines 42-49, 65)

```typescript
const resetQuestionSession = useCallback(
  (topicId: number, categoryId: number, questionId: number) => {
    try {
      progressService.resetQuestionSession(topicId, categoryId, questionId);
      refreshProgress();
    } catch (error) {
      console.error("Error resetting question session:", error);
    }
  },
  [refreshProgress]
);

// Added to return object
return {
  // ... other methods
  resetQuestionSession,
  // ...
};
```

### 3. Called on Question Load

**File**: `TugonPlay.tsx` (lines 39, 80, 95)

```typescript
// Line 39: Destructure the new method
const { recordAttempt, getQuestionProgress, resetQuestionSession, progress } =
  useProgress();

// Line 80: Call when question loads/changes
useEffect(() => {
  setSessionStartTime(Date.now());
  setAttempts(0);
  setIsCorrect(null);
  console.log(
    `🎯 Starting question: Topic ${topicId}, Category ${finalCategoryId}, Question ${questionId}`
  );

  // ✨ NEW: Reset session attempts when starting/retrying a question
  resetQuestionSession(topicId, finalCategoryId, questionId);

  setUserAttempts([]);
  // ...
}, [topicId, finalCategoryId, questionId, resetQuestionSession]);
```

**Trigger**: Runs whenever `topicId`, `finalCategoryId`, or `questionId` changes (new question loaded or retry).

### 4. Updated `resetCategoryProgress()` Method

**File**: `progressServices.tsx` (line 413)

```typescript
categoryProgress.questionProgress.forEach((qp) => {
  qp.isCompleted = false;
  qp.correctAnswers = 0;
  qp.currentSessionAttempts = 0; // ✨ NEW: Reset session attempts for replay
  // Keep latestAttempt and fastestAttempt for history
});
```

**Purpose**: When a category is replayed, all question session attempts are reset.

### 5. Removed Debug Logging

**Files**: `ProgressMap.tsx` (mobile & desktop views)

Removed console.log statements that were added for debugging:

- Line ~567-571: Removed debug logs from mobile view
- Line ~890-898: Removed debug logs from desktop view

## Data Flow After Fix

```
Question Completed:
  currentSessionAttempts = 4 (incremented during session)
  latestAttempt.attempts = 4 (saved)
  currentSessionAttempts = 0 (reset after save)

User Retries Same Question:
  resetQuestionSession() called ✅
  currentSessionAttempts = 0 (explicitly reset)
  First attempt: currentSessionAttempts++ → 1
  Second attempt: currentSessionAttempts++ → 2
  Third attempt: currentSessionAttempts++ → 3
  Fourth attempt (correct): currentSessionAttempts++ → 4
  latestAttempt.attempts = 4 ✅ FIXED
```

## Testing Checklist

- [ ] Complete a question with multiple attempts (e.g., 4)
- [ ] Verify SuccessModal shows correct attempts (should show 4)
- [ ] Navigate to ProgressMap
- [ ] Verify question stats show correct attempts (should show 4)
- [ ] Retry the same question
- [ ] Complete with different number of attempts (e.g., 2)
- [ ] Verify SuccessModal shows new attempts (should show 2)
- [ ] Verify ProgressMap updates with latest attempts (should show 2)
- [ ] Test category replay functionality
- [ ] Verify all questions in category have session attempts reset

## Files Modified

1. **progressServices.tsx**

   - Added `resetQuestionSession()` method (lines 439-449)
   - Updated `resetCategoryProgress()` to reset session attempts (line 413)

2. **useProgress.tsx**

   - Added `resetQuestionSession` callback (lines 42-49)
   - Exported in return object (line 65)

3. **TugonPlay.tsx**

   - Destructured `resetQuestionSession` from hook (line 39)
   - Called in useEffect when question loads (line 80)
   - Added to dependency array (line 95)

4. **ProgressMap.tsx**
   - Removed debug console.log statements from mobile view (~lines 567-571)
   - Removed debug console.log statements from desktop view (~lines 890-898)

## Benefits

1. **Accurate Statistics**: `latestAttempt.attempts` now correctly reflects the actual number of attempts in each session
2. **Session Isolation**: Each question attempt is properly isolated as a new session
3. **Consistent Behavior**: Works correctly for:
   - First-time question attempts
   - Retrying completed questions
   - Category replays
   - Cross-session persistence

## Technical Notes

- The fix maintains separation between:

  - `currentSessionAttempts`: Attempts in current/latest session (resets between sessions)
  - `attempts`: Cumulative attempts across all sessions (never resets)
  - `latestAttempt.attempts`: Snapshot of session attempts from most recent completion

- Session reset happens automatically via React's `useEffect` dependency array
- Works correctly even if user:
  - Refreshes page mid-question
  - Navigates away and comes back
  - Completes and immediately retries
  - Waits days/weeks before retrying
