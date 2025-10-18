# Update: Session-Based Attempt Tracking & Border Color Indicators

## Summary
Fixed the statistics display in ProgressMap to show per-session attempt data instead of cumulative attempts, and added color-coded borders to category cards for better visual status indication.

## Changes Made

### Task 1: Session-Based Attempt Tracking ✅

#### Problem
The `latestAttempt` statistics were showing cumulative attempts across all time, not the attempts made during the specific completion session. For example:
- User attempts Question 1: tries 5 times, gets it right
- User attempts Question 1 again later: tries 3 times, gets it right
- **Before**: Latest attempt showed `attempts: 8` (cumulative)
- **After**: Latest attempt shows `attempts: 3` (this session only)

#### Solution
Added session-based attempt tracking to properly record attempts per completion.

##### 1. Updated QuestionProgress Interface
**File**: `src/components/tugon/services/progressServices.tsx`

```tsx
export interface QuestionProgress {
  questionId: number;
  isCompleted: boolean;
  attempts: number; // Cumulative total (kept for overall stats)
  correctAnswers: number;
  timeSpent: number;
  lastAttemptDate: Date;
  bestScore?: number;
  colorCodedHintsUsed: number;
  shortHintMessagesUsed: number;
  currentSessionAttempts?: number; // ✨ NEW: Tracks attempts for current session
  latestAttempt?: {
    timestamp: Date;
    timeSpent: number;
    attempts: number; // ✨ Now shows session attempts, not cumulative
    colorHintsUsed: number;
    shortHintsUsed: number;
  };
  fastestAttempt?: {
    timestamp: Date;
    timeSpent: number;
    attempts: number; // ✨ Now shows session attempts, not cumulative
    colorHintsUsed: number;
    shortHintsUsed: number;
  };
}
```

**Key Addition**: `currentSessionAttempts?: number` tracks attempts since the question was started/reset.

##### 2. Updated recordAttempt() Function
**Lines 256-315 (approx)**

**Before**:
```tsx
questionProgress.latestAttempt = {
  timestamp: new Date(),
  timeSpent: attemptResult.timeSpent,
  attempts: questionProgress.attempts, // ❌ Cumulative!
  colorHintsUsed: attemptResult.colorCodedHintsUsed || 0,
  shortHintsUsed: attemptResult.shortHintMessagesUsed || 0,
};
```

**After**:
```tsx
// Initialize session attempts if not exists
if (questionProgress.currentSessionAttempts === undefined) {
  questionProgress.currentSessionAttempts = 0;
}

// Update both cumulative and session attempts
questionProgress.attempts++; // Cumulative total
questionProgress.currentSessionAttempts++; // Session-specific

// Save with session attempts
questionProgress.latestAttempt = {
  timestamp: new Date(),
  timeSpent: attemptResult.timeSpent,
  attempts: questionProgress.currentSessionAttempts, // ✅ Session only!
  colorHintsUsed: attemptResult.colorCodedHintsUsed || 0,
  shortHintsUsed: attemptResult.shortHintMessagesUsed || 0,
};

// Reset session counter after successful completion
questionProgress.currentSessionAttempts = 0;
```

##### 3. Updated Question Initialization
**Function**: `getOrCreateQuestionProgress()`

```tsx
if (!questionProgress) {
  questionProgress = {
    questionId,
    isCompleted: false,
    attempts: 0,
    correctAnswers: 0,
    timeSpent: 0,
    lastAttemptDate: new Date(),
    colorCodedHintsUsed: 0,
    shortHintMessagesUsed: 0,
    currentSessionAttempts: 0, // ✨ Initialize session counter
  };
  categoryProgress.questionProgress.push(questionProgress);
}
```

#### How It Works

1. **Question Start**: `currentSessionAttempts` initializes to 0
2. **Each Attempt**: Both `attempts` (cumulative) and `currentSessionAttempts` increment
3. **Correct Answer**: 
   - Save `latestAttempt` with `currentSessionAttempts` value
   - Reset `currentSessionAttempts` to 0 for next session
4. **Display**: ProgressMap shows session attempts, not lifetime total

#### Example Flow

```
User starts Question 1 (first time):
  currentSessionAttempts: 0
  attempts: 0

User tries (wrong):
  currentSessionAttempts: 1
  attempts: 1

User tries (wrong):
  currentSessionAttempts: 2
  attempts: 2

User tries (correct!):
  currentSessionAttempts: 3
  attempts: 3
  latestAttempt saved: { attempts: 3, ... }
  currentSessionAttempts reset: 0

---Later, user tries Question 1 again---

User tries (wrong):
  currentSessionAttempts: 1
  attempts: 4

User tries (correct!):
  currentSessionAttempts: 2
  attempts: 5
  latestAttempt saved: { attempts: 2, ... } ← Shows "2" not "5"!
  currentSessionAttempts reset: 0
```

---

### Task 2: Color-Coded Border Indicators ✅

#### Problem
All category cards had the same light gray border (`#E6EDF3`) regardless of status, making it hard to distinguish completed, in-progress, and not-started stages at a glance.

#### Solution
Added dynamic border colors based on category status, with thicker borders (2px instead of 1px) for better visibility.

##### Border Color System

| Status | Color | Hex Code | Thickness |
|--------|-------|----------|-----------|
| **Completed** | 🟢 Green | `#10B981` | 2px |
| **In Progress** | 🟠 Orange | `#F59E0B` | 2px |
| **Not Started** | ⚪ Light Gray | `#E6EDF3` | 2px |

##### Updated Code (Mobile View)
**File**: `src/components/ProgressMap.tsx`
**Lines**: ~340-350

**Before**:
```tsx
style={{
  background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFE 100%)",
  border: "1px solid #E6EDF3",
  boxShadow: hasProgress ? `0 10px 20px ${color.mist}22` : "0 4px 10px rgba(2, 16, 15, 0.04)",
}}
```

**After**:
```tsx
style={{
  background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFE 100%)",
  border: `2px solid ${
    isCompleted 
      ? "#10B981" // Green border for completed
      : hasProgress 
      ? "#F59E0B" // Orange border for in progress
      : "#E6EDF3" // Light gray for not started
  }`,
  boxShadow: hasProgress ? `0 10px 20px ${color.mist}22` : "0 4px 10px rgba(2, 16, 15, 0.04)",
}}
```

##### Updated Code (Desktop View)
**File**: `src/components/ProgressMap.tsx`
**Lines**: ~730-740

Same changes applied to desktop stacked card view for consistency.

#### Visual Impact

**Before**:
```
┌─────────────────────────┐
│ Stage 1 (gray border)   │ ← All same
└─────────────────────────┘
┌─────────────────────────┐
│ Stage 2 (gray border)   │ ← Hard to distinguish
└─────────────────────────┘
```

**After**:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Stage 1 (green border)  ┃ ← Completed (2px green)
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Stage 2 (orange border) ┃ ← In progress (2px orange)
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛
┌─────────────────────────┐
│ Stage 3 (gray border)   │ ← Not started (2px gray)
└─────────────────────────┘
```

---

## Files Modified

### 1. progressServices.tsx
**Path**: `src/components/tugon/services/progressServices.tsx`

**Changes**:
- ✅ Added `currentSessionAttempts?: number` to `QuestionProgress` interface
- ✅ Updated `recordAttempt()` to track and use session attempts
- ✅ Added session reset logic after successful completion
- ✅ Updated `getOrCreateQuestionProgress()` to initialize session counter
- ✅ Added comments explaining session vs cumulative tracking

### 2. ProgressMap.tsx
**Path**: `src/components/ProgressMap.tsx`

**Changes**:
- ✅ Updated mobile view category card border (line ~342)
- ✅ Updated desktop view category card border (line ~728)
- ✅ Changed border thickness from `1px` to `2px`
- ✅ Added dynamic color logic based on `isCompleted` and `hasProgress`

---

## Benefits

### Session-Based Attempt Tracking
1. ✅ **Accurate Statistics** - Shows attempts for specific completion, not lifetime total
2. ✅ **Better Performance Insight** - Users can see improvement over multiple attempts
3. ✅ **Clearer Progress** - "Latest Attempt: 2 tries" vs confusing cumulative numbers
4. ✅ **Motivational** - Lower numbers on retry encourage continued practice

### Color-Coded Borders
1. ✅ **Visual Hierarchy** - Instant status recognition at a glance
2. ✅ **Better UX** - No need to read text to know progress status
3. ✅ **Accessibility** - Thicker borders (2px) more visible for all users
4. ✅ **Professional Design** - Color system matches modern UI patterns
5. ✅ **Consistency** - Applied to both mobile and desktop views

---

## Testing Checklist

### Session Attempt Tracking
- [ ] Start a new question - verify `currentSessionAttempts` initializes to 0
- [ ] Make 3 wrong attempts, then get correct - verify `latestAttempt.attempts` shows 4
- [ ] Retry same question - verify counter resets to 0 for new session
- [ ] Make 2 attempts and succeed - verify `latestAttempt.attempts` shows 2 (not cumulative)
- [ ] Check ProgressMap statistics - verify "Attempts" shows session count
- [ ] Verify `fastestAttempt` also uses session attempts correctly
- [ ] Test across multiple questions in same category
- [ ] Verify cumulative `attempts` still increments properly for overall stats

### Border Colors
- [ ] View category with no progress - verify light gray border (#E6EDF3)
- [ ] Start a category (1+ attempts) - verify orange border (#F59E0B)
- [ ] Complete a category - verify green border (#10B981)
- [ ] Check border thickness - verify all are 2px
- [ ] Test on mobile view - verify colors display correctly
- [ ] Test on desktop view - verify colors display correctly
- [ ] Verify colors are visible against white background
- [ ] Test with multiple categories in different states
- [ ] Check accessibility - verify 2px borders are easily visible

---

## Data Structure Example

**Before Fix**:
```json
{
  "questionId": 1,
  "attempts": 8,
  "latestAttempt": {
    "attempts": 8,  // ❌ Cumulative across all time
    "timeSpent": 45
  }
}
```

**After Fix**:
```json
{
  "questionId": 1,
  "attempts": 8,  // Cumulative (kept for overall stats)
  "currentSessionAttempts": 0,  // Resets after each completion
  "latestAttempt": {
    "attempts": 3,  // ✅ Just this session!
    "timeSpent": 45
  }
}
```

---

## Technical Notes

### Session Tracking
- `currentSessionAttempts` resets to 0 after each successful completion
- Cumulative `attempts` continues to increment across all sessions
- Both values are persisted in localStorage
- Backward compatible - existing data initializes `currentSessionAttempts` to 0

### Border Colors
- Uses Tailwind color values for consistency
- Green: `#10B981` (emerald-500)
- Orange: `#F59E0B` (amber-500)
- Gray: `#E6EDF3` (custom light gray)
- 2px thickness matches modern design standards

---

## Commit Message Template

```
fix: Track per-session attempts & add status border colors

Session Attempt Tracking:
- Added currentSessionAttempts to QuestionProgress interface
- Updated recordAttempt() to track session vs cumulative attempts
- Fixed latestAttempt to show session attempts, not lifetime total
- Reset session counter after successful completion
- Initialize session counter on question creation

Border Color Indicators:
- Added green border for completed categories
- Added orange border for in-progress categories
- Increased border thickness from 1px to 2px
- Applied to both mobile and desktop views
- Improved visual hierarchy and status recognition

Files:
- src/components/tugon/services/progressServices.tsx
- src/components/ProgressMap.tsx

Fixes accurate statistics display and enhances visual UX
```

---

**Status**: ✅ Implemented and Ready for Testing  
**Date**: October 18, 2025  
**Components**: progressServices.tsx, ProgressMap.tsx
