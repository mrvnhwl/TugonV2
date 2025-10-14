# FEATURE: Toast Replacement and Modal Dismissal

## Overview

Implemented intelligent toast notification management to prevent multiple toast hints from stacking and to automatically dismiss toasts when the FeedbackModal opens.

## Problem

Previously, when users made multiple wrong attempts:

- Multiple toast notifications would stack on screen
- Old toasts remained visible when new hints appeared
- Toasts continued showing when FeedbackModal opened, creating visual clutter
- No mechanism to clear previous toasts before showing new ones

## Solution

Added smart toast lifecycle management:

1. **Toast Replacement**: New toast dismisses the previous one
2. **Modal Dismissal**: Opening FeedbackModal clears any active toast
3. **Correct Answer Cleanup**: Dismisses toast when user gets correct answer
4. **Question Reset Cleanup**: Clears toast when moving to new question

## Implementation Details

### 1. Added Toast ID Tracking

```typescript
const activeToastIdRef = useRef<string | null>(null); // Track active toast for dismissal
```

**Purpose**: Store the ID of the currently displayed toast so we can dismiss it later.

### 2. Modified `showHintMessage` Function

**Location**: `src/components/tugon/input-system/UserInput.tsx` (lines ~535-580)

**Changes**:

```typescript
// ✨ Dismiss previous toast before showing new one
if (activeToastIdRef.current) {
  toast.dismiss(activeToastIdRef.current);
  console.log(`🗑️ Dismissed previous toast: ${activeToastIdRef.current}`);
}

// Display toast with curated message
const toastId = toast.custom(
  (t) => (
    // ... toast JSX ...
  ),
  {
    duration: 3500,
    position: 'top-center',
  }
);

// Store the toast ID for future dismissal
activeToastIdRef.current = toastId;
console.log(`📌 Stored new toast ID: ${toastId}`);
```

**Behavior**:

- Before showing a new toast, dismiss the previous one if it exists
- Capture the new toast ID and store it
- Ensures only one hint toast is visible at a time

### 3. Enhanced Modal Open Logic

**Location**: `src/components/tugon/input-system/UserInput.tsx` (lines ~900-920)

**Changes**:

```typescript
if (newHintCount === 5 && !modalShown) {
  console.log(`🚨 TRIGGERING MODAL - 15th wrong attempt reached`);

  // ✨ Dismiss active toast before showing modal
  if (activeToastIdRef.current) {
    toast.dismiss(activeToastIdRef.current);
    activeToastIdRef.current = null;
    console.log(`🗑️ Dismissed active toast before opening modal`);
  }

  setModalData({ userInput: sanitizedInput, correctAnswer });
  setIsModalOpen(true);
  setModalShown(true);
}
```

**Behavior**:

- When FeedbackModal is about to open, dismiss any active toast
- Clear the toast ID reference to prevent stale data
- Ensures modal appears without competing toast notifications

### 4. Added Cleanup on Correct Answer

**Location**: `src/components/tugon/input-system/UserInput.tsx` (lines ~850-865)

**Changes**:

```typescript
if (validation.isCorrect) {
  showSuccessMessage(attemptCount);
  setWrongAttemptCounter(0);
  setAttemptHistory([]);
  setShortHintCounter(0);
  setModalShown(false);

  // ✨ Clear any active toast on correct answer
  if (activeToastIdRef.current) {
    toast.dismiss(activeToastIdRef.current);
    activeToastIdRef.current = null;
    console.log(`🗑️ Dismissed toast on correct answer`);
  }
}
```

**Behavior**:

- When user submits correct answer, dismiss any lingering toast
- Clean slate for next question

### 5. Enhanced Modal Close Handler

**Location**: `src/components/tugon/input-system/UserInput.tsx` (lines ~1695-1707)

**Changes**:

```typescript
const handleModalClose = () => {
  console.log("📕 Modal closed - short hints resume");
  setIsModalOpen(false);

  // ✨ Clear toast ID reference when modal closes
  if (activeToastIdRef.current) {
    activeToastIdRef.current = null;
    console.log(`🗑️ Cleared toast reference on modal close`);
  }
};
```

**Behavior**:

- Clear the toast ID reference when modal closes
- Prepare for new toasts to appear
- Note: Modal itself stays marked as shown for the question

### 6. Added Cleanup on Question Reset

**Location**: `src/components/tugon/input-system/UserInput.tsx` (lines ~640-665)

**Changes**:

```typescript
useEffect(() => {
  if (topicId && categoryId && questionId) {
    // ... reset all state ...

    // ✨ Clear any active toast on question reset
    if (activeToastIdRef.current) {
      toast.dismiss(activeToastIdRef.current);
      activeToastIdRef.current = null;
      console.log(`🗑️ Dismissed toast on question reset`);
    }
  }
}, [topicId, categoryId, questionId]);
```

**Behavior**:

- When user moves to new question, dismiss any active toast
- Ensures fresh start for new question

## Toast Lifecycle Flow

### Scenario 1: Multiple Wrong Attempts

```
User Input (Wrong) → Toast 1 Appears
                    ↓
                    (3.5s duration)
                    ↓
User Input (Wrong) → Toast 1 Dismissed → Toast 2 Appears
                    ↓
                    (3.5s duration)
                    ↓
User Input (Wrong) → Toast 2 Dismissed → Toast 3 Appears
```

**Result**: Only one toast visible at a time, no stacking.

### Scenario 2: Modal Opens

```
User Input (Wrong) → Toast Appears
                    ↓
                    (After 15 wrong attempts)
                    ↓
Modal Opens        → Toast Dismissed → Modal Visible
```

**Result**: Clean transition from toast to modal, no overlap.

### Scenario 3: Correct Answer

```
User Input (Wrong) → Toast Appears
                    ↓
User Input (Correct) → Toast Dismissed → Success Message
```

**Result**: Error toast cleared, success message shown cleanly.

### Scenario 4: New Question

```
Question 1 → Toast Appears → New Question Selected → Toast Dismissed
```

**Result**: Old question's toasts don't carry over to new question.

## Benefits

1. **✨ Clean UI**: Only one toast visible at a time
2. **🎯 Clear Focus**: Modal appears without competing notifications
3. **🧹 Automatic Cleanup**: Toasts dismissed on correct answer and question changes
4. **📱 Better UX**: Prevents visual clutter and confusion
5. **🔧 Maintainable**: Centralized toast ID management

## Technical Notes

### Why useRef for Toast ID?

- `useRef` persists across renders without causing re-renders
- Perfect for storing mutable values like toast IDs
- Doesn't need to be in dependency arrays

### Toast.custom() Return Value

- Returns a string ID that uniquely identifies the toast
- Can be passed to `toast.dismiss(id)` to remove specific toast
- Different from `toast.dismiss()` which dismisses all toasts

### Timing Considerations

- Toasts have 3.5s duration (automatic dismissal)
- Manual dismissal happens before natural expiration
- Prevents race conditions with stale toast references

## Testing Scenarios

### Test 1: Toast Replacement

1. Enter 3 wrong answers → Toast 1 appears
2. Enter 3 more wrong answers → Toast 2 appears (Toast 1 dismissed)
3. **Expected**: Only Toast 2 visible, no stacking

### Test 2: Modal Dismissal

1. Enter 15 wrong answers → Toasts appear every 3 attempts
2. On 15th attempt → Modal opens
3. **Expected**: Last toast dismissed, modal appears cleanly

### Test 3: Correct Answer Cleanup

1. Enter 3 wrong answers → Toast appears
2. Enter correct answer → Success message
3. **Expected**: Toast dismissed, success message shows

### Test 4: Question Navigation

1. Enter wrong answer → Toast appears
2. Navigate to different question
3. **Expected**: Toast from previous question dismissed

### Test 5: Modal Close and Continue

1. Trigger modal (15 wrong attempts)
2. Close modal
3. Continue making wrong attempts
4. **Expected**: New toasts can appear, properly managed

## Debug Console Messages

The implementation includes comprehensive logging:

- `🗑️ Dismissed previous toast: [id]` - Old toast removed before new one
- `📌 Stored new toast ID: [id]` - New toast ID saved
- `🗑️ Dismissed active toast before opening modal` - Toast cleared for modal
- `🗑️ Dismissed toast on correct answer` - Toast cleared on success
- `🗑️ Dismissed toast on question reset` - Toast cleared on navigation
- `🗑️ Cleared toast reference on modal close` - Reference reset

## Files Modified

### `src/components/tugon/input-system/UserInput.tsx`

**Lines Changed**:

- Line 133: Added `activeToastIdRef` for toast ID tracking
- Lines 535-580: Modified `showHintMessage` to dismiss previous toast
- Lines 850-865: Added toast dismissal on correct answer
- Lines 900-920: Added toast dismissal before modal opens
- Lines 640-665: Added toast dismissal on question reset
- Lines 1695-1707: Enhanced modal close handler

## Dependencies

- `react-hot-toast` library for toast management
- Toast.custom() API for custom toast rendering
- Toast.dismiss(id) API for programmatic dismissal

## Future Enhancements

1. **Animation Improvements**: Smooth transition between toasts
2. **Priority System**: Different toast types with different dismissal rules
3. **Queue Management**: Queue toasts if multiple need to appear
4. **User Preferences**: Allow users to control toast behavior
5. **Accessibility**: Screen reader announcements for toast changes

## Related Documentation

- `INFORMATION_FLOW_TOAST_HINTS.md` - Toast hint system overview
- `IMPLEMENTATION_AI_BEHAVIOR_TEMPLATES.md` - Behavior template integration
- `QUICKREF_AI_BEHAVIOR_TEMPLATES.md` - Quick reference for templates
- `FIX_FEEDBACK_MODAL_COLOR_STRIPPING.md` - FeedbackModal enhancements

## Status

🟢 **COMPLETE AND TESTED**

All requirements met:

- ✅ New toasts replace current toast notifications
- ✅ FeedbackModal opening dismisses active toasts
- ✅ Correct answers clear toasts
- ✅ Question navigation clears toasts
- ✅ Modal closing resets toast tracking
- ✅ No compilation errors
- ✅ Comprehensive logging for debugging
