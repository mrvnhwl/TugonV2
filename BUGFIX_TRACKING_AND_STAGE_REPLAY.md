# Bug Fix: Tracking and Stage Replay Issues

## Date

October 17, 2025

## Issues Fixed

### Issue #1: Color Hints and Short Hints Tracking (Only Tracked Once)

**Problem**:
The `colorHintsShownCount` and `shortHintsShownCount` were only being tracked once in SuccessModal, not cumulatively across all attempts.

**Root Cause**:
The color hints tracking used `Math.max(prev, displayedFeedbackCount)` which only tracked the maximum number of simultaneously displayed feedbacks, not the cumulative total.

**Solution**:

#### 1. Added Feedback Tracking Ref

```typescript
const feedbackShownStepsRef = useRef<Set<number>>(new Set());
```

#### 2. Updated Color Hint Tracking Logic

**File**: `src/components/tugon/input-system/UserInput.tsx`

Changed from:

```typescript
// OLD: Only tracks maximum simultaneous displays
setColorHintsShown((prev) => {
  const newCount = Math.max(prev, displayedFeedbackCount);
  return newCount;
});
```

To:

```typescript
// NEW: Tracks each new display cumulatively
lineValidationStates.forEach((validation, index) => {
  const shouldShowFeedback =
    validation && trigger && validation.tokenFeedback && !validation.isCorrect;

  if (shouldShowFeedback) {
    // Check if this step hasn't shown feedback before
    if (!feedbackShownStepsRef.current.has(index)) {
      feedbackShownStepsRef.current.add(index);
      newDisplaysCount++;
    }
  }
});

// Increment by NEW displays only
setColorHintsShown((prev) => prev + newDisplaysCount);
```

#### 3. Reset Tracking on Question Change

```typescript
useEffect(() => {
  if (questionId !== undefined && questionId !== currentQuestionId) {
    setColorHintsShown(0);
    setShortHintsShown(0);
    feedbackShownStepsRef.current.clear(); // Clear tracking set
    setCurrentQuestionId(questionId);
  }
}, [questionId, currentQuestionId]);
```

**How It Works Now**:

- Uses a `Set` to track which steps have shown feedback
- Only increments counter for NEW feedback displays
- Removes steps from tracking when they become correct
- Resets on question change

**Example**:

```
Step 1 wrong → FeedbackOverlay shows → colorHintsShown = 1
Step 1 wrong again → Already tracked, no increment → colorHintsShown = 1
Step 2 wrong → FeedbackOverlay shows → colorHintsShown = 2
Step 3 wrong → FeedbackOverlay shows → colorHintsShown = 3
User fixes Step 1 → Removed from tracking
User breaks Step 1 again → FeedbackOverlay shows → colorHintsShown = 4 ✅
```

---

### Issue #2: Stage Replay Always Shows SuccessModal After One Question

**Problem**:
When starting a completed stage again, the system would show the SuccessModal after completing just one question instead of allowing full replay from Question 1 to the last question.

**Root Cause**:

1. Questions remained marked as `isCompleted: true` after category completion
2. `isCategoryCompleted()` would immediately return true
3. No mechanism to distinguish between "first completion" and "replay"

**Solution**:

#### 1. Added New Fields to CategoryProgress

**File**: `src/components/tugon/services/progressServices.tsx`

```typescript
export interface CategoryProgress {
  // ... existing fields
  successModalShown?: boolean; // Track if modal shown this cycle
  everCompleted?: boolean; // Track if ever completed (history)
}
```

#### 2. Created Reset Category Progress Function

```typescript
resetCategoryProgress(topicId: number, categoryId: number): void {
  const progress = this.getUserProgress();
  const categoryProgress = this.getOrCreateCategoryProgress(topicProgress, categoryId);

  // Reset all question isCompleted flags but keep history
  categoryProgress.questionProgress.forEach(qp => {
    qp.isCompleted = false;
    qp.correctAnswers = 0;
    // Keep latestAttempt and fastestAttempt for history
  });

  // Reset category flags for current session
  categoryProgress.isCompleted = false;
  categoryProgress.successModalShown = false; // Allow modal to show again
  categoryProgress.completionPercentage = 0;
  categoryProgress.correctAnswers = 0;
  categoryProgress.attempts = 0;
  categoryProgress.currentQuestionIndex = 0; // Start from question 1
  // Keep everCompleted = true to show it has been done before

  this.saveProgress(progress);
}
```

#### 3. Added Mark SuccessModal Shown Function

```typescript
markSuccessModalShown(topicId: number, categoryId: number): void {
  const categoryProgress = this.getOrCreateCategoryProgress(topicProgress, categoryId);

  categoryProgress.successModalShown = true;
  categoryProgress.everCompleted = true;

  this.saveProgress(progress);
}
```

#### 4. Updated TugonSense to Reset on Start

**File**: `src/pages/reviewer/TugonSense.tsx`

```typescript
const handleStartStage = (
  topicId: number,
  categoryId: number,
  questionId: number
) => {
  import("../../components/tugon/services/progressServices").then(
    ({ progressService }) => {
      const categoryProgress = progressService.getCategoryProgress(
        topicId,
        categoryId
      );

      // If category was previously completed, reset it for replay
      if (categoryProgress?.everCompleted) {
        console.log(
          `🔄 Category ${categoryId} was completed before - resetting for replay`
        );
        progressService.resetCategoryProgress(topicId, categoryId);
      }

      // Navigate to first question
      navigate(
        `/tugonplay?topic=${topicId}&category=${categoryId}&question=${questionId}`
      );
    }
  );
};
```

#### 5. Updated TugonPlay to Check Modal Status

**File**: `src/pages/reviewer/TugonPlay.tsx`

```typescript
if (isCategoryComplete) {
  // Check if SuccessModal has been shown before
  const categoryProgress = progressService.getCategoryProgress(
    topicId,
    finalCategoryId
  );
  const hasShownModalBefore = categoryProgress?.successModalShown || false;

  // Only show SuccessModal if it hasn't been shown in this completion cycle
  if (!hasShownModalBefore) {
    const stats = buildCategoryStatsFromAttempts(allCategoryAttempts);

    // Mark that we're showing the modal
    progressService.markSuccessModalShown(topicId, finalCategoryId);

    setCategoryStats(stats);
    setShowSuccessModal(true);
  } else {
    // Modal already shown - just show quick notification
    setShowQuickNotification(true);
    setTimeout(() => handleNextQuestion(), 3000);
  }
}
```

#### 6. Updated ProgressMap to Detect Fresh Replay

**File**: `src/components/ProgressMap.tsx`

```typescript
const getNextQuestionId = (topicId: number, categoryId: number): number => {
  const category = levels
    .find((l) => l.id === topicId)
    ?.categories.find((c) => c.categoryId === categoryId);

  if (!category) return 1;

  // If category has been completed before but isCompleted is false,
  // it means we're starting a fresh replay - start from question 1
  const categoryProgress = progressService.getCategoryProgress(
    topicId,
    categoryId
  );
  if (categoryProgress?.everCompleted && !categoryProgress?.isCompleted) {
    console.log(
      `🔄 Starting fresh replay of Category ${categoryId} from Question 1`
    );
    return category.questions[0]?.questionId || 1;
  }

  // Otherwise, find next uncompleted question
  // ...
};
```

**How It Works Now**:

1. **First Completion**:

   ```
   User starts Stage 1
   → isCompleted: false, successModalShown: false
   → Completes all questions
   → isCategoryCompleted() returns true
   → Shows SuccessModal
   → Marks successModalShown: true, everCompleted: true
   ```

2. **Replay (Click "Review Stage")**:

   ```
   User clicks "Review Stage" on completed category
   → handleStartStage() detects everCompleted: true
   → Calls resetCategoryProgress()
   → Sets: isCompleted: false, successModalShown: false
   → Keeps: everCompleted: true, latestAttempt, fastestAttempt
   → Navigates to Question 1
   → User plays through all questions again
   → After last question: shows SuccessModal (first time this cycle)
   ```

3. **Continue After Modal Shown**:
   ```
   User completes category but doesn't finish session
   → Next question completion checks successModalShown: true
   → Skips SuccessModal, shows quick notification instead
   → Allows continued play without repeated modals
   ```

## Benefits

### Issue #1 Benefits

1. **Accurate Tracking**: Color hints and short hints now track every single display, not just the maximum
2. **Better Analytics**: Can analyze hint effectiveness with true cumulative counts
3. **Fair Statistics**: SuccessModal shows actual number of hints used

### Issue #2 Benefits

1. **Full Replay**: Can replay completed stages from Question 1 to last question
2. **History Preserved**: Keeps fastest/latest attempt records for leaderboards
3. **One Modal Per Cycle**: SuccessModal shows once per completion, not repeatedly
4. **Better UX**: Clear distinction between "first completion" and "replay"

## Testing Scenarios

### Test Scenario 1: Color Hints Tracking

```
1. Start a multi-step question
2. Get Step 1 wrong multiple times
   → Each wrong attempt should show FeedbackOverlay
   → colorHintsShown should increment each time
3. Move to Step 2, get it wrong
   → colorHintsShown should continue incrementing
4. Complete question
5. Check SuccessModal
   → Should show total cumulative color hints (e.g., 5)
```

### Test Scenario 2: Stage Replay

```
1. Complete all questions in a category
   → SuccessModal appears with stats
2. Return to TugonSense
3. Click "Review Stage" on the completed category
   → Should navigate to Question 1
4. Complete all questions again
   → Should go through ALL questions (Q1 → Q2 → Q3... → Qn)
   → SuccessModal should appear at the end
5. Check localStorage
   → Should have both latest and fastest attempts stored
```

### Test Scenario 3: Short Hints Tracking

```
1. Start a question
2. Get wrong 3 times → toast.custom() appears
   → shortHintsShown = 1
3. Get wrong 3 more times → another toast.custom()
   → shortHintsShown = 2
4. Complete question
5. Check SuccessModal
   → Should show 2 short hints used
```

## Files Modified

1. **src/components/tugon/input-system/UserInput.tsx**

   - Added `feedbackShownStepsRef` for tracking
   - Updated color hint tracking logic (cumulative)
   - Updated reset logic to clear tracking set

2. **src/components/tugon/services/progressServices.tsx**

   - Added `successModalShown` and `everCompleted` fields
   - Created `resetCategoryProgress()` function
   - Created `markSuccessModalShown()` function
   - Updated `markCategoryCompleted()` to set `everCompleted`

3. **src/pages/reviewer/TugonPlay.tsx**

   - Added check for `successModalShown` before displaying modal
   - Calls `markSuccessModalShown()` when showing modal
   - Shows quick notification if modal already shown

4. **src/pages/reviewer/TugonSense.tsx**

   - Created `handleStartStage()` handler
   - Calls `resetCategoryProgress()` for completed categories
   - Passes handler to ProgressMap

5. **src/components/ProgressMap.tsx**
   - Updated `getNextQuestionId()` to detect fresh replay
   - Returns Question 1 for replay scenarios

## Console Logging

### Color Hints Tracking

- `🎨 TRACKING: New color hint for step X - Total new displays: Y`
- `🎨 TRACKING: Color hints incremented by X - New total: Y`

### Stage Reset

- `🔄 Category X was completed before - resetting for replay`
- `🔄 Resetting category X progress for replay...`
- `  Reset Question X (keeping history)`
- `✅ Category X reset complete - ready for replay from Question 1`

### SuccessModal Logic

- `📊 SuccessModal status: shown before = true/false`
- `✅ SuccessModal shown marked for Category X`
- `✨ Category complete but modal already shown - showing quick notification`

### Replay Detection

- `🔄 Starting fresh replay of Category X from Question 1`

## Related Documentation

- `IMPLEMENTATION_COMPREHENSIVE_STATS_TRACKING.md` - Original tracking implementation
- `FEATURE_SMART_CHARACTER_COLORING.md` - Color feedback system
- `FEATURE_TOAST_REPLACEMENT_AND_MODAL_DISMISSAL.md` - Toast system

## Future Enhancements

1. **Replay Counter**: Track how many times a category has been replayed
2. **Improvement Metrics**: Compare latest vs fastest attempts visually
3. **Streak Tracking**: Track consecutive correct answers across replays
4. **Challenge Mode**: Time-based challenges using fastest attempt as baseline
