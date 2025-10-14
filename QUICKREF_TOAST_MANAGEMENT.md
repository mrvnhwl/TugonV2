# Quick Reference: Toast Management System

## Overview

Smart toast notification management that prevents stacking and handles cleanup.

## Key Features

### 🔄 Toast Replacement

**What**: New hint toasts automatically replace old ones
**When**: Every 3rd wrong attempt
**Result**: Only one hint toast visible at a time

### 🚪 Modal Dismissal

**What**: Opening FeedbackModal dismisses active toasts
**When**: 15th wrong attempt (5th cycle)
**Result**: Clean modal appearance without competing notifications

### ✅ Correct Answer Cleanup

**What**: Correct answer dismisses any active hint toast
**When**: User submits correct answer
**Result**: Clean slate with success message

### 🔄 Question Reset

**What**: New question dismisses previous question's toasts
**When**: User navigates to new question
**Result**: No carryover from previous questions

## Implementation Summary

### State

```typescript
const activeToastIdRef = useRef<string | null>(null);
```

### Toast Creation (showHintMessage)

```typescript
// Dismiss old
if (activeToastIdRef.current) {
  toast.dismiss(activeToastIdRef.current);
}

// Create new
const toastId = toast.custom(...);
activeToastIdRef.current = toastId;
```

### Modal Opening

```typescript
if (activeToastIdRef.current) {
  toast.dismiss(activeToastIdRef.current);
  activeToastIdRef.current = null;
}
setIsModalOpen(true);
```

### Correct Answer

```typescript
if (validation.isCorrect) {
  if (activeToastIdRef.current) {
    toast.dismiss(activeToastIdRef.current);
    activeToastIdRef.current = null;
  }
  showSuccessMessage();
}
```

### Question Reset

```typescript
useEffect(() => {
  if (topicId && categoryId && questionId) {
    if (activeToastIdRef.current) {
      toast.dismiss(activeToastIdRef.current);
      activeToastIdRef.current = null;
    }
    // ... reset other state
  }
}, [topicId, categoryId, questionId]);
```

## Console Messages

| Message                                          | Meaning                       |
| ------------------------------------------------ | ----------------------------- |
| `🗑️ Dismissed previous toast: [id]`              | Old toast removed for new one |
| `📌 Stored new toast ID: [id]`                   | New toast ID saved            |
| `🗑️ Dismissed active toast before opening modal` | Cleared for modal             |
| `🗑️ Dismissed toast on correct answer`           | Cleared on success            |
| `🗑️ Dismissed toast on question reset`           | Cleared on navigation         |
| `🗑️ Cleared toast reference on modal close`      | Reference reset               |

## Testing Quick Checks

### ✅ Toast Replacement

1. Make 3 wrong attempts → Toast appears
2. Make 3 more wrong attempts → New toast replaces old one
3. **Check**: Only one toast visible

### ✅ Modal Dismissal

1. Make 15 wrong attempts
2. Modal appears
3. **Check**: No toast visible with modal

### ✅ Correct Answer

1. Make wrong attempts → Toast visible
2. Enter correct answer
3. **Check**: Toast dismissed, success message shows

### ✅ Question Change

1. Wrong attempt → Toast appears
2. Navigate to new question
3. **Check**: Toast from old question gone

## Debugging

### Check Active Toast

```javascript
// In browser console during development
console.log(activeToastIdRef.current);
```

### Force Dismiss All Toasts

```javascript
// Emergency cleanup in console
toast.dismiss();
```

### Verify Toast ID Storage

Look for these console messages:

- `📌 Stored new toast ID:` - Confirms storage
- `🗑️ Dismissed previous toast:` - Confirms dismissal

## Common Issues

### Multiple Toasts Stacking

**Problem**: Old implementation didn't dismiss previous toasts
**Solution**: Now dismisses before creating new one

### Toast + Modal Overlap

**Problem**: Toast remained when modal opened
**Solution**: Modal opening dismisses active toast

### Stale Toasts on Navigation

**Problem**: Previous question's toasts carried over
**Solution**: Question reset dismisses toasts

## File Location

`src/components/tugon/input-system/UserInput.tsx`

**Key Sections**:

- Line 133: Toast ID ref declaration
- Lines 535-580: Toast creation with dismissal
- Lines 850-865: Correct answer cleanup
- Lines 900-920: Modal opening cleanup
- Lines 640-665: Question reset cleanup
- Lines 1695-1707: Modal close handler

## Related Commands

```typescript
// Dismiss specific toast
toast.dismiss(toastId);

// Dismiss all toasts
toast.dismiss();

// Create custom toast with ID
const id = toast.custom(...);
```

## Best Practices

1. **Always store toast ID**: When creating custom toasts
2. **Dismiss before new**: Clear previous toast before showing new one
3. **Clean on transitions**: Dismiss on question changes, correct answers
4. **Clear references**: Set to `null` after dismissing
5. **Log everything**: Use console messages for debugging

## Status

✅ **Production Ready** - All scenarios covered and tested
