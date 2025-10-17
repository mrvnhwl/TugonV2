# Update: Category Titles and Lucide Icons

## Summary
Added category titles from question data and replaced emoji icons with Lucide React icons in the ProgressMap component's expandable statistics section.

## Changes Made

### 1. Added Lucide Icon Imports
```tsx
import { Check, ChevronLeft, ChevronRight, ChevronDown, FileText, CheckCircle, Zap, Play } from "lucide-react";
```

**New Icons:**
- `CheckCircle` - For completed category status
- `Zap` - For current attempt indicator
- `Play` - For start statistics indicator

### 2. Updated CategoryInfo Type
Added `categoryTitle` field to display the title from question data:
```tsx
type CategoryInfo = {
  categoryId: number;
  categoryName: string;
  categoryTitle?: string; // NEW
  questions: QuestionInfo[];
  totalQuestions: number;
  currentQuestionIndex: number;
};
```

### 3. Updated Category Mapping
Added `categoryTitle` from the question data structure:
```tsx
return {
  categoryId: category.category_id,
  categoryName: category.category_question,
  categoryTitle: category.title, // NEW - from topic data
  questions,
  totalQuestions: questions.length,
  currentQuestionIndex,
};
```

### 4. Display Category Title (Mobile & Desktop)
**Before:**
```tsx
<div className="text-sm font-bold">
  Stage {category.categoryId}
</div>
```

**After:**
```tsx
<div className="text-sm font-bold">
  Stage {category.categoryId}
  {category.categoryTitle && (
    <span className="ml-2 text-xs font-semibold text-teal-600">
      • {category.categoryTitle}
    </span>
  )}
</div>
```

### 5. Replaced Emoji Icons with Lucide Icons

#### Mobile View - Footer Stats
**Before:**
```tsx
<div className="text-gray-600">⚡ {categoryProgress.attempts} attempts</div>
{isCompleted && <div className="text-emerald-600">🏆 Completed</div>}
```

**After:**
```tsx
<div className="flex items-center gap-1.5 text-gray-600">
  <Zap className="w-3.5 h-3.5" />
  <span>{categoryProgress.attempts} attempts</span>
</div>
{isCompleted && (
  <div className="flex items-center gap-1.5 text-emerald-600">
    <CheckCircle className="w-3.5 h-3.5" />
    <span>Completed</span>
  </div>
)}
```

#### Desktop View - Expandable Section Toggle
**Before:**
```tsx
{isCompleted ? "✓ See Latest Attempt" : hasProgress ? "⚡ See Current Attempt" : "▶ Try to See Statistics"}
```

**After:**
```tsx
{isCompleted ? (
  <>
    <CheckCircle className="w-3.5 h-3.5" />
    <span>See Latest Attempt</span>
  </>
) : hasProgress ? (
  <>
    <Zap className="w-3.5 h-3.5" />
    <span>See Current Attempt</span>
  </>
) : (
  <>
    <Play className="w-3.5 h-3.5" />
    <span>Try to See Statistics</span>
  </>
)}
```

## Visual Changes

### Category Header Display
- **Stage 1** now shows as **Stage 1 • EVALUATION STAGE**
- Category title appears in teal color with bullet separator
- Title is responsive and adapts to both mobile and desktop layouts

### Icon Replacements
| Old | New | Usage |
|-----|-----|-------|
| ✓ | `<CheckCircle />` | Completed status |
| ⚡ | `<Zap />` | Current/active attempt |
| ▶ | `<Play />` | Start statistics |
| 🏆 | `<CheckCircle />` | Completed badge |

## Data Source
Category titles are sourced from the question data structure:
- Example: `src/components/data/questions/topic1/category1.ts`
- Field: `title: "EVALUATION STAGE"`

## Benefits
1. ✅ **Consistent Design** - All icons now use Lucide React library
2. ✅ **Better Context** - Category titles provide immediate context about stage content
3. ✅ **Scalable** - SVG icons scale perfectly at any size
4. ✅ **Accessible** - Proper icon components with better semantics
5. ✅ **Maintainable** - Easy to customize icon sizes and colors with Tailwind classes

## Testing Checklist
- [ ] Verify category titles display correctly for all stages
- [ ] Check icon rendering in mobile view (footer stats)
- [ ] Check icon rendering in desktop view (expandable toggle)
- [ ] Test different states: not started, in progress, completed
- [ ] Verify icon sizes and colors match design
- [ ] Test expandable section with new icons
- [ ] Check that titles wrap properly on small screens
- [ ] Verify color scheme consistency (teal for titles, emerald for completed)

## Notes
- Only unused variable warnings remain (harmless)
- All icons maintain consistent sizing: `w-3.5 h-3.5` for status icons
- Category title is optional and only displays if available in data
- Both mobile and desktop layouts updated for consistency
