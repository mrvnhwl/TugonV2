# Update: Best/Latest Attempt Statistics with Time Display

**Date**: October 17, 2025  
**Update**: Show best attempt data and include time spent in statistics  
**Status**: ✅ COMPLETED

---

## Overview

Enhanced the ProgressMap question statistics to:

1. **Include time spent** in a 2x2 grid layout (4 metrics total)
2. **Show best attempt data** for completed questions (fastestAttempt)
3. **Show latest attempt data** for in-progress questions
4. **Display "Best" badge** when showing fastest attempt

---

## Key Changes

### 1. Smart Data Selection

The statistics now intelligently choose which data to display:

```typescript
const displayData =
  questionProgress.isCompleted && questionProgress.fastestAttempt
    ? questionProgress.fastestAttempt // ✅ Best attempt for completed
    : questionProgress.latestAttempt || {
        // 📊 Latest attempt for in-progress
        timeSpent: questionProgress.timeSpent,
        attempts: questionProgress.attempts,
        colorHintsUsed: questionProgress.colorCodedHintsUsed,
        shortHintsUsed: questionProgress.shortHintMessagesUsed,
      };
```

#### Logic:

- **Completed Questions**: Shows `fastestAttempt` (best performance)
- **In-Progress Questions**: Shows `latestAttempt` (most recent attempt)
- **Fallback**: Uses cumulative data if attempt-specific data unavailable

### 2. Visual Indicator

Added a "Best" badge for completed questions showing fastest attempt:

```tsx
{
  questionProgress.fastestAttempt && (
    <div className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
      Best
    </div>
  );
}
```

### 3. Updated Grid Layout

Changed from 3-column to 2x2 grid to accommodate time display:

#### Before (3 metrics)

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│    3    │  │    2    │  │    1    │
│Attempts │  │  Color  │  │ Context │
└─────────┘  └─────────┘  └─────────┘
```

#### After (4 metrics in 2x2)

```
┌─────────┐  ┌─────────┐
│   45s   │  │    3    │
│  Time   │  │Attempts │
└─────────┘  └─────────┘

┌─────────┐  ┌─────────┐
│    2    │  │    1    │
│  Color  │  │ Context │
└─────────┘  └─────────┘
```

---

## Statistics Display

### Four Metrics Shown

1. **🟣 Time Spent** (`bg-purple-50`, `text-purple-600/700`)

   - Formatted as "45s" or "1m 30s"
   - Uses `formatTime()` helper function

2. **🔵 Attempts** (`bg-blue-50`, `text-blue-600/700`)

   - Number of submission attempts

3. **🟠 Color Hints** (`bg-orange-50`, `text-orange-600/700`)

   - Number of color-coded feedback overlays shown

4. **🩷 Context Hints** (`bg-pink-50`, `text-pink-600/700`)
   - Number of toast hint messages displayed

---

## Data Sources

### From QuestionProgress Interface

```typescript
interface QuestionProgress {
  // Cumulative totals
  timeSpent: number;
  attempts: number;
  colorCodedHintsUsed: number;
  shortHintMessagesUsed: number;

  // Latest attempt (most recent)
  latestAttempt?: {
    timestamp: Date;
    timeSpent: number;
    attempts: number;
    colorHintsUsed: number;
    shortHintsUsed: number;
  };

  // Best attempt (fastest time)
  fastestAttempt?: {
    timestamp: Date;
    timeSpent: number;
    attempts: number;
    colorHintsUsed: number;
    shortHintsUsed: number;
  };
}
```

---

## Visual Examples

### Completed Question (Shows Best Attempt)

```
┌────────────────────────────────────┐
│ ✓  Question 1          [Best]     │
│                                     │
│ ┌────────┐  ┌────────┐            │
│ │  45s   │  │   3    │            │
│ │  Time  │  │Attempts│            │
│ └────────┘  └────────┘            │
│                                     │
│ ┌────────┐  ┌────────┐            │
│ │   2    │  │   1    │            │
│ │ Color  │  │Context │            │
│ └────────┘  └────────┘            │
└────────────────────────────────────┘
```

### In-Progress Question (Shows Latest Attempt)

```
┌────────────────────────────────────┐
│ 🟧  Question 2                     │
│                                     │
│ ┌────────┐  ┌────────┐            │
│ │ 1m 15s │  │   5    │            │
│ │  Time  │  │Attempts│            │
│ └────────┘  └────────┘            │
│                                     │
│ ┌────────┐  ┌────────┐            │
│ │   4    │  │   2    │            │
│ │ Color  │  │Context │            │
│ └────────┘  └────────┘            │
└────────────────────────────────────┘
```

---

## Implementation Details

### IIFE for Data Selection

Used an Immediately Invoked Function Expression (IIFE) to compute display data:

```tsx
{
  (() => {
    const displayData =
      questionProgress.isCompleted && questionProgress.fastestAttempt
        ? questionProgress.fastestAttempt
        : questionProgress.latestAttempt || fallbackData;

    return (
      <div className="grid grid-cols-2 gap-2 text-xs">{/* Stats boxes */}</div>
    );
  })();
}
```

This keeps the logic contained and makes the data source explicit.

### Header with Badge

```tsx
<div className="flex-1 flex items-center justify-between">
  <div className="text-sm font-bold text-gray-800">
    Question {question.questionId}
  </div>
  {questionProgress.fastestAttempt && (
    <div className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
      Best
    </div>
  )}
</div>
```

---

## Updated Files

- ✅ `src/components/ProgressMap.tsx`
  - Mobile view: Lines ~540-590 (best/latest attempt logic + 2x2 grid)
  - Desktop view: Lines ~880-930 (best/latest attempt logic + 2x2 grid)

---

## Benefits

### 1. **Performance Tracking**

- Users can see their **best performance** on completed questions
- Shows **latest attempt** for in-progress work

### 2. **Time Awareness**

- Time spent is now visible (was previously removed)
- Helps users gauge difficulty and efficiency

### 3. **Visual Clarity**

- Green "Best" badge indicates fastest attempt
- 2x2 grid is well-balanced and scannable

### 4. **Smart Fallback**

- Works even if `latestAttempt` or `fastestAttempt` is undefined
- Falls back to cumulative data seamlessly

### 5. **Motivation**

- Seeing "Best" attempt encourages improvement
- Clear metrics for self-assessment

---

## Color Scheme

| Metric        | Background     | Text Color            | Use Case              |
| ------------- | -------------- | --------------------- | --------------------- |
| Time          | `bg-purple-50` | `text-purple-600/700` | Duration measurement  |
| Attempts      | `bg-blue-50`   | `text-blue-600/700`   | Submission count      |
| Color Hints   | `bg-orange-50` | `text-orange-600/700` | Visual feedback usage |
| Context Hints | `bg-pink-50`   | `text-pink-600/700`   | Contextual help usage |

---

## Testing Scenarios

### Test Case 1: Completed Question with Best Attempt

```
1. Complete a question with 3 attempts in 45 seconds
2. Complete it again with 2 attempts in 30 seconds (new best)
3. View ProgressMap statistics
4. Expected: Shows "Best" badge with 30s, 2 attempts
```

### Test Case 2: In-Progress Question

```
1. Start a question but don't complete it (3 attempts)
2. View ProgressMap statistics
3. Expected: Shows latest attempt data (no "Best" badge)
```

### Test Case 3: No Attempt Data Available

```
1. Question has cumulative data but no latestAttempt/fastestAttempt
2. View ProgressMap statistics
3. Expected: Falls back to cumulative totals
```

### Test Case 4: Time Formatting

```
1. View question with 45s time spent
2. Expected: Displays "45s"
3. View question with 90s time spent
4. Expected: Displays "1m 30s"
```

---

## Future Enhancements

Potential improvements:

1. **Toggle between Best and Latest**: Allow users to switch views
2. **Timestamp Display**: Show when best/latest attempt was made
3. **Comparison View**: Side-by-side best vs latest
4. **Trend Indicators**: Arrow showing improvement/decline
5. **Average Stats**: Show average across all attempts
6. **Export Feature**: Download statistics as CSV

---

## Notes

- The `formatTime()` helper function is now actively used (no longer unused)
- Both mobile and desktop views have identical logic
- "Best" badge only appears when `fastestAttempt` exists
- Grid layout changed from 3-column to 2x2 for better balance
- Purple color scheme added for time metric

---

## Commit Message

```
feat: Add best/latest attempt stats with time display

Enhanced ProgressMap statistics to show:
- Best attempt data for completed questions (fastestAttempt)
- Latest attempt data for in-progress questions
- Time spent metric in purple box
- Green "Best" badge indicator
- 2x2 grid layout (Time, Attempts, Color Hints, Context Hints)

Logic:
- Completed + fastestAttempt exists → show best
- Otherwise → show latestAttempt
- Fallback → cumulative data

Applied to both mobile and desktop views.
```
