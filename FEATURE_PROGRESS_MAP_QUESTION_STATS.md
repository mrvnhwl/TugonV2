# Feature: Question Statistics Dropdown in ProgressMap

**Date**: October 17, 2025  
**Feature**: Show detailed statistics for each question in ProgressMap  
**Status**: ✅ COMPLETED

---

## Overview

Added expandable/collapsible dropdown sections in the ProgressMap component that display detailed statistics for each question within a category/stage. This mirrors the data shown in the SuccessModal, providing users with visibility into their performance history.

---

## Features Added

### 1. **Expandable Category Statistics**

Each category card now has a clickable footer that expands to show question-level statistics:

- **Click to Expand**: Click the footer (where "✓ Complete" / "⚡ In Progress" is shown)
- **Click to Collapse**: Click again to hide the statistics
- **Animated**: Smooth slide-in animation when expanding

### 2. **Per-Question Statistics Display**

For each question that has been attempted, the dropdown shows:

#### **Visual Indicators**

- ✓ Green badge for completed questions
- Orange badge with question ID for incomplete questions
- Color-coded backgrounds (green for complete, yellow for in-progress)

#### **Statistics Grid** (4 metrics)

1. **⏱️ Time Spent**: Total time spent on the question (formatted as "Xs" or "Xm Ys")
2. **🎯 Attempt Count**: Number of submission attempts made
3. **🎨 Color Hints**: Number of color-coded feedback overlays shown
4. **💬 Context Hints**: Number of toast hint messages displayed

#### **Example Display**

```
┌─────────────────────────────────────┐
│ ✓  Q1: Evaluate f(x) = 2x^2 + 3    │
│                                      │
│ ⏱️ 45s        🎯 3 attempts          │
│ 🎨 2 hints    💬 1 hint              │
└─────────────────────────────────────┘
```

### 3. **Smart Filtering**

- Only shows questions that have been attempted (attempts > 0)
- Shows "No statistics yet" message if no questions have been attempted
- Hides questions with no data to keep the UI clean

---

## Implementation Details

### State Management

```typescript
const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
  new Set()
);
```

- Tracks which categories are currently expanded
- Uses a Set for efficient lookup and management
- Each category can be independently expanded/collapsed

### Helper Functions

```typescript
const toggleCategoryExpansion = (categoryId: number) => {
  setExpandedCategories((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    return newSet;
  });
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
};
```

### Data Fetching

```typescript
const fullCategoryProgress = progressService.getCategoryProgress(
  topicId,
  categoryId
);
const questionProgress = fullCategoryProgress?.questionProgress?.find(
  (qp: any) => qp.questionId === question.questionId
);
```

- Uses `progressService.getCategoryProgress()` to get full category data
- Includes the `questionProgress` array with all question-level statistics
- Filters to find specific question data

---

## Code Changes

### File: `src/components/ProgressMap.tsx`

#### 1. Added State and Helpers (Lines 70-97)

```typescript
const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

const toggleCategoryExpansion = (categoryId: number) => { ... };
const formatTime = (seconds: number): string => { ... };
```

#### 2. Desktop View - Expandable Stats (Lines ~720-810)

- Replaced static footer with clickable button
- Added chevron icon that rotates on expand/collapse
- Implemented dropdown with question cards
- Added stats grid with 4 metrics per question

#### 3. Mobile View - Expandable Stats (Lines ~500-590)

- Same functionality as desktop
- Optimized layout for mobile screens
- Responsive grid layout for statistics

---

## User Experience

### Before

```
┌─────────────────────────┐
│ Stage 1                 │
│ ━━━━━━━━━━ 3/3          │
│                         │
│ [Start Stage]           │
│                         │
│ ✓ Complete              │
└─────────────────────────┘
```

### After

```
┌─────────────────────────┐
│ Stage 1                 │
│ ━━━━━━━━━━ 3/3          │
│                         │
│ [Start Stage]           │
│                         │
│ ✓ Complete      ▼       │  ← Click to expand
├─────────────────────────┤
│ ✓ Q1: Evaluate f(x)     │
│ ⏱️ 45s    🎯 3 attempts  │
│ 🎨 2 hints 💬 1 hint    │
│                         │
│ ✓ Q2: Simplify 2x + 3   │
│ ⏱️ 30s    🎯 2 attempts  │
│ 🎨 1 hint  💬 0 hints   │
│                         │
│ ✓ Q3: Final answer      │
│ ⏱️ 1m 15s 🎯 4 attempts  │
│ 🎨 3 hints 💬 2 hints   │
└─────────────────────────┘
```

---

## Statistics Tracked

All statistics match what's shown in the SuccessModal:

### From QuestionProgress Interface

```typescript
interface QuestionProgress {
  questionId: number;
  isCompleted: boolean;
  attempts: number; // 🎯 Shown
  timeSpent: number; // ⏱️ Shown (in seconds)
  colorCodedHintsUsed: number; // 🎨 Shown
  shortHintMessagesUsed: number; // 💬 Shown
  // ... other fields
}
```

### Data Source

- **Time Spent**: Accumulated from UserInput session timers
- **Attempts**: Incremented each time "Enter" is pressed with validation
- **Color Hints**: Tracked when FeedbackOverlay displays (Wordle-like colors)
- **Context Hints**: Tracked when toast.custom() is called (every 3rd wrong attempt)

---

## Testing Scenarios

### Test Case 1: Fresh Category (No Stats)

```
1. View a category that hasn't been started
2. Click the footer to expand
3. Expected: "No statistics yet. Start the stage to track your progress!"
```

### Test Case 2: Partial Progress

```
1. Start a stage and complete Q1 with 2 wrong attempts (showing color hints)
2. Leave Q2 and Q3 incomplete
3. Return to ProgressMap and expand the category
4. Expected:
   - Only Q1 shows statistics
   - Shows: time, 3 attempts (2 wrong + 1 correct), color hints, context hints
   - Q2 and Q3 don't appear
```

### Test Case 3: Completed Category

```
1. Complete all 3 questions in a stage
2. Each question used different amounts of hints
3. Expand the category dropdown
4. Expected:
   - All 3 questions show with green ✓ badges
   - Each shows individual statistics
   - Statistics match what was shown in SuccessModal
```

### Test Case 4: Multiple Categories

```
1. Expand Category 1 dropdown
2. Expand Category 2 dropdown
3. Expected: Both remain open independently
4. Click Category 1 footer again
5. Expected: Category 1 closes, Category 2 stays open
```

### Test Case 5: Mobile View

```
1. Resize window to mobile width
2. Swipe through topics
3. Click footer to expand statistics
4. Expected: Same functionality, optimized layout for small screens
```

---

## Visual Design

### Color Scheme

- **Completed Questions**:

  - Background: `#F0FDF4` (light green)
  - Border: `#BBF7D0` (green)
  - Badge: Gradient green `#10B981` → `#059669`

- **In-Progress Questions**:
  - Background: `#FEF3C7` (light yellow)
  - Border: `#FDE68A` (yellow)
  - Badge: Gradient orange `#F59E0B` → `#D97706`

### Icons

- ⏱️ Time spent
- 🎯 Attempts
- 🎨 Color hints
- 💬 Context hints

### Animations

- Smooth slide-in animation (`animate-in slide-in-from-top-2`)
- Chevron rotation on expand/collapse
- Hover opacity effect on clickable areas

---

## Benefits

1. **Transparency**: Users can see their detailed performance without re-entering stages
2. **Progress Tracking**: Easy to identify which questions need more practice
3. **Data Visibility**: All SuccessModal statistics are now accessible from the main screen
4. **Performance Review**: Users can compare their stats across different questions
5. **Motivation**: Visual feedback on improvement and mastery

---

## Future Enhancements

Potential improvements for future versions:

1. **Sorting**: Sort questions by time spent, attempts, or hints used
2. **Filtering**: Filter to show only incomplete or struggling questions
3. **Comparison**: Compare current attempt vs best attempt
4. **Graphs**: Add mini charts showing progress over time
5. **Export**: Allow exporting statistics to CSV or PDF
6. **Trends**: Show improvement trends (faster times, fewer hints over multiple attempts)

---

## Related Files

- ✅ `src/components/ProgressMap.tsx` - Main component with dropdown implementation
- ✅ `src/components/tugon/services/progressServices.tsx` - Data source for statistics
- ✅ `src/components/tugon/input-system/UserInput.tsx` - Tracks color/context hints
- ✅ `src/pages/reviewer/TugonPlay.tsx` - Records attempts and timing

---

## Notes

- Statistics only appear for questions that have been attempted
- Data persists across sessions (stored in localStorage via progressService)
- Each category can be independently expanded/collapsed
- Mobile and desktop views have identical functionality with responsive layouts
- Statistics automatically update when new attempts are made

---

## Commit Message

```
feat: Add expandable question statistics dropdown to ProgressMap

Added collapsible statistics panels for each category showing:
- Time spent per question
- Attempt count per question
- Color hints used per question
- Context hints used per question

Features:
- Click category footer to expand/collapse
- Only shows questions with attempts
- Color-coded by completion status
- Responsive mobile/desktop layouts
- Smooth animations

Matches SuccessModal statistics display for consistency.
```
