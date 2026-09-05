# Bug Fix: Color Hint Tracking - Count Per Attempt Instead of Per Step

**Date**: October 17, 2025  
**Issue**: Color hints and toast hints were only counted once per step, not per attempt  
**Status**: ✅ FIXED

---

## Problem Description

### Scenario

```
Step 1
├─ Attempt 1 ❌ Wrong answer → Color hint shown
├─ Attempt 2 ❌ Wrong answer → Color hint shown
└─ Attempt 3 ✅ Correct answer
```

### Expected Behavior

- `colorHintsShownCount` should equal **2** (shown twice on Step 1)
- Each wrong attempt that triggers feedback should increment the counter

### Actual Behavior (Before Fix)

- `colorHintsShownCount` equals **1** (only counted once for Step 1)
- The tracking only counted which **steps** showed feedback, not how many **times** feedback was shown

### Root Cause

In `UserInput.tsx`, the color hint tracking used a **Set** to track which steps had shown feedback:

```typescript
// ❌ OLD CODE - Tracked steps, not displays
const feedbackShownStepsRef = useRef<Set<number>>(new Set());

if (!feedbackShownStepsRef.current.has(index)) {
  feedbackShownStepsRef.current.add(index);
  newDisplaysCount++;
}
```

This meant:

- First wrong attempt on Step 1 → Add Step 1 to Set → Count = 1
- Second wrong attempt on Step 1 → Step 1 already in Set → Count stays 1
- Third wrong attempt on Step 1 → Step 1 already in Set → Count stays 1

---

## Solution

### Changed Tracking from "Steps" to "Displays"

Instead of tracking which **steps** have shown feedback, we now track **state transitions** (when feedback goes from not showing → showing).

```typescript
// ✅ NEW CODE - Tracks each display by detecting state changes
const previousValidationStatesRef = useRef<Map<number, boolean>>(new Map());

const wasShowingFeedback =
  previousValidationStatesRef.current.get(index) || false;

if (shouldShowFeedback && !wasShowingFeedback) {
  // NEW feedback display detected
  newDisplaysCount++;
  previousValidationStatesRef.current.set(index, true);
} else if (!shouldShowFeedback && wasShowingFeedback) {
  // Feedback cleared
  previousValidationStatesRef.current.set(index, false);
}
```

### How It Works Now

**Scenario: Multiple wrong attempts on Step 1**

1. **Attempt 1** (wrong):

   - User types wrong answer → Enter pressed
   - Validation fails → `shouldShowFeedback = true`
   - Previous state: `false` → Current state: `true` (transition detected)
   - **Counter incremented: 0 → 1** ✅

2. **Attempt 2** (wrong):

   - User changes input → Color feedback cleared → `shouldShowFeedback = false`
   - State updated: `wasShowingFeedback = false`
   - User types different wrong answer → Enter pressed
   - Validation fails → `shouldShowFeedback = true`
   - Previous state: `false` → Current state: `true` (transition detected again)
   - **Counter incremented: 1 → 2** ✅

3. **Attempt 3** (correct):
   - User types correct answer → Enter pressed
   - Validation succeeds → `shouldShowFeedback = false`
   - No increment (feedback not showing)
   - Final count: **2** ✅

---

## Code Changes

### File: `src/components/tugon/input-system/UserInput.tsx`

#### Change 1: Replace tracking reference (Line ~192)

```typescript
// BEFORE
const feedbackShownStepsRef = useRef<Set<number>>(new Set());

// AFTER
const previousValidationStatesRef = useRef<Map<number, boolean>>(new Map());
```

#### Change 2: Update reset logic (Line ~246)

```typescript
// BEFORE
feedbackShownStepsRef.current.clear();

// AFTER
previousValidationStatesRef.current.clear();
```

#### Change 3: Replace tracking logic (Lines ~252-283)

```typescript
// BEFORE - Tracked once per step
useEffect(() => {
  let newDisplaysCount = 0;

  lineValidationStates.forEach((validation, index) => {
    const trigger = validationTriggers.get(index);
    const shouldShowFeedback =
      validation &&
      trigger &&
      validation.tokenFeedback &&
      !validation.isCorrect;

    if (shouldShowFeedback) {
      if (!feedbackShownStepsRef.current.has(index)) {
        feedbackShownStepsRef.current.add(index);
        newDisplaysCount++;
      }
    } else if (validation && validation.isCorrect) {
      feedbackShownStepsRef.current.delete(index);
    }
  });

  if (newDisplaysCount > 0) {
    setColorHintsShown((prev) => prev + newDisplaysCount);
  }
}, [lineValidationStates, validationTriggers]);

// AFTER - Tracks every display via state transitions
useEffect(() => {
  let newDisplaysCount = 0;

  lineValidationStates.forEach((validation, index) => {
    const trigger = validationTriggers.get(index);
    const shouldShowFeedback =
      validation &&
      trigger &&
      validation.tokenFeedback &&
      !validation.isCorrect;

    const wasShowingFeedback =
      previousValidationStatesRef.current.get(index) || false;

    if (shouldShowFeedback && !wasShowingFeedback) {
      // NEW feedback display detected
      newDisplaysCount++;
      previousValidationStatesRef.current.set(index, true);
    } else if (!shouldShowFeedback && wasShowingFeedback) {
      // Feedback cleared
      previousValidationStatesRef.current.set(index, false);
    }
  });

  if (newDisplaysCount > 0) {
    setColorHintsShown((prev) => prev + newDisplaysCount);
  }
}, [lineValidationStates, validationTriggers]);
```

---

## Testing Scenarios

### Test Case 1: Multiple Wrong Attempts on Same Step

```
Step 1: Evaluate f(2) = 2x + 3

Attempt 1: "7" → ❌ Wrong → Color feedback shown → Count = 1
Attempt 2: "5" → ❌ Wrong → Color feedback shown → Count = 2
Attempt 3: "7" → ✅ Correct → No feedback → Final Count = 2 ✅
```

### Test Case 2: Wrong Attempts Across Multiple Steps

```
Step 1: Evaluate f(2) = 2x + 3
Attempt 1: "5" → ❌ Wrong → Count = 1
Attempt 2: "7" → ✅ Correct

Step 2: Simplify 2(2) + 3
Attempt 1: "7" → ❌ Wrong → Count = 2
Attempt 2: "7" → ✅ Correct

Step 3: Final answer
Attempt 1: "8" → ❌ Wrong → Count = 3
Attempt 2: "7" → ✅ Correct

Final Count = 3 ✅ (one per step, as expected)
```

### Test Case 3: Back-and-Forth Editing

```
Step 1:
1. Type "5" → Enter → ❌ Wrong → Feedback shown → Count = 1
2. Clear input → Feedback cleared
3. Type "6" → Enter → ❌ Wrong → Feedback shown again → Count = 2
4. Clear input → Feedback cleared
5. Type "7" → Enter → ✅ Correct

Final Count = 2 ✅
```

---

## Impact on Statistics

### SuccessModal Display

The SuccessModal now accurately reflects:

- **Color Coded Hints**: Total number of times FeedbackOverlay was displayed (per attempt, not per step)
- **Context Hints**: Total number of toast messages shown (every 3rd wrong attempt)

### Example Output

```
📊 Category Completion Statistics
├─ Questions Completed: 3/3
├─ Total Time: 45s
├─ Total Attempts: 8
├─ Color Coded Hints: 5 (shown across multiple attempts)
└─ Context Hints: 2 (toast messages)
```

---

## Related Files

- ✅ `src/components/tugon/input-system/UserInput.tsx` - Fixed tracking logic
- ✅ `src/pages/reviewer/TugonPlay.tsx` - Receives accurate counts via `UserAttempt` objects
- ✅ `src/components/tugon/services/progressServices.tsx` - Stores accurate hint counts

---

## Verification

To verify the fix works:

1. **Start a new question session**
2. **Make multiple wrong attempts on Step 1**:
   - Attempt 1: Wrong answer → Press Enter → See color feedback
   - Attempt 2: Wrong answer → Press Enter → See color feedback again
   - Attempt 3: Correct answer → Press Enter
3. **Complete the question**
4. **Check SuccessModal statistics**:
   - Color Coded Hints should show **2** (not 1)

### Console Logs to Watch

```
🎨 TRACKING: Color hint displayed for step 0 - New displays this render: 1
🎨 TRACKING: Color hints incremented by 1 - New total: 1

🎨 TRACKING: Color hint displayed for step 0 - New displays this render: 1
🎨 TRACKING: Color hints incremented by 1 - New total: 2
```

---

## Notes

### Toast Hint Tracking

The toast hint tracking (`shortHintsShown`) was already working correctly - it increments every time `showHintMessage()` is called, which happens on **every 3rd wrong attempt** (by design).

### Session-Based Tracking

Both counters reset when the question changes, ensuring each question session starts with clean tracking:

```typescript
setColorHintsShown(0);
setShortHintsShown(0);
previousValidationStatesRef.current.clear();
```

---

## Commit Message

```
fix: Track color hints per attempt instead of per step

Changed color hint tracking from Set-based (once per step) to
state-transition-based (every display). Now correctly counts
multiple feedback displays on the same step.

Fixes issue where colorHintsShownCount only counted 1 even when
color feedback was shown multiple times on the same step.
```
