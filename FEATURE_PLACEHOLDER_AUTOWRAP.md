# Feature: Automatic \text{} Wrapper for Placeholder

## Overview

The Direction input field (mapped to `placeholder` column) now **passively handles** the `\text{}` LaTeX wrapper. Users work with plain text, and the system automatically wraps/unwraps the `\text{}` formatting during save/load operations.

## User Experience Flow

### Scenario 1: Adding New Steps

**Step 1: User enters plain text in Direction field**

```
User Input: "This is a placeholder direction for user"
```

**Step 2: User clicks "Save Question & Steps"**

```
Database Saved: "\\text{This is a placeholder direction for user}"
```

### Scenario 2: Editing Existing Steps

**Step 1: User opens Edit Question Modal**

```
Database Value: "\\text{This is a placeholder direction for user}"
Direction Field Shows: "This is a placeholder direction for user"  ← Automatically unwrapped
```

**Step 2: User edits the text**

```
User Edits To: "Updated placeholder text"
```

**Step 3: User saves changes**

```
Database Saved: "\\text{Updated placeholder text}"  ← Automatically wrapped
```

## Implementation Details

### Load Operation (Unwrapping)

**Location**: `loadAnswerSteps()` function (lines ~720-755)

```typescript
const loadAnswerSteps = async (
  topicId: number,
  categoryId: number,
  questionId: number
) => {
  // ... fetch data from database ...

  if (data && data.length > 0) {
    setStepForms(
      data.map((step) => {
        // Unwrap \text{} from placeholder when loading for editing
        let unwrappedPlaceholder = step.placeholder || "";
        if (unwrappedPlaceholder) {
          // Remove \text{ from start and } from end if present
          const textMatch = unwrappedPlaceholder.match(/^\\text\{(.*)\}$/);
          if (textMatch) {
            unwrappedPlaceholder = textMatch[1];
          }
        }

        return {
          placeholder: unwrappedPlaceholder, // Clean text for editing
          label: step.label,
          variants: step.answer_variants,
        };
      })
    );
  }
};
```

**Regex Explanation**:

- `/^\\text\{(.*)\}$/` - Matches `\text{...}` pattern
- `^` - Start of string
- `\\text\{` - Literal `\text{`
- `(.*)` - Capture group: any content inside
- `\}` - Literal closing brace
- `$` - End of string

**Examples**:

```typescript
// Input from database → Output to form
"\\text{f(x) = 5}"          → "f(x) = 5"
"\\text{Substitute x=5}"    → "Substitute x=5"
"\\text{}"                  → ""
null                        → ""
"Plain text without wrap"   → "Plain text without wrap" (unchanged)
```

### Save Operation (Wrapping)

**Location**: `saveQuestionAndSteps()` function (line 857)

```typescript
const saveQuestionAndSteps = async () => {
  // ... validation and question update ...

  const stepsToInsert = stepForms.map((form, index) => ({
    topic_id: questionToEdit.topic_id,
    category_id: questionToEdit.category_id,
    question_id: questionToEdit.question_id,
    step_order: index + 1,
    label: form.label,
    answer_variants: form.variants.filter((v) => v.trim() !== ""),
    placeholder: form.placeholder.trim()
      ? `\\text{${form.placeholder.trim()}}`
      : null, // Auto-wrap non-empty text
    created_by: user?.id,
  }));

  await supabase.from("tugonsense_answer_steps").insert(stepsToInsert);
};
```

**Logic**:

1. If `form.placeholder.trim()` is **empty** → Save as `null`
2. If `form.placeholder.trim()` is **non-empty** → Wrap in `\text{}` and save

**Examples**:

```typescript
// Input from form → Output to database
"f(x) = 5"          → "\\text{f(x) = 5}"
"Substitute x=5"    → "\\text{Substitute x=5}"
"   "               → null (trimmed to empty)
""                  → null
```

## Database Storage Format

### tugonsense_answer_steps.placeholder Column

**Always stored with `\text{}` wrapper** (when non-null):

```sql
-- Example records
placeholder: "\\text{f(x) = 5}"
placeholder: "\\text{Substitute the value}"
placeholder: "\\text{Evaluate the expression}"
placeholder: null
```

**Why wrap in `\text{}`?**

- LaTeX requirement: Non-math text in math mode needs `\text{}` wrapper
- Consistent formatting across all steps
- Proper rendering in MathJax components
- Future-proof for LaTeX processing

## User Interface

### Direction Input Field

**Label**: "Direction (optional)"

**Placeholder**: `"Enter direction (will be wrapped in \\text{} when saved)"`

**User sees**: Plain text only

```
┌──────────────────────────────────────────────────┐
│ DIRECTION                                        │
│ ┌──────────────────────────────────────────────┐ │
│ │ This is a placeholder direction for user     │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**User does NOT see**:

- `\text{` prefix
- `}` suffix
- Escaped backslashes `\\`

## Edge Cases Handled

### Case 1: Empty Placeholder

```
User Input: ""
Database: null
On Load: ""
```

### Case 2: Whitespace Only

```
User Input: "   "
Database: null (trimmed)
On Load: ""
```

### Case 3: Already Wrapped (Accidental Double-Wrap Prevention)

```
Database: "\\text{f(x) = 5}"
On Load: "f(x) = 5" (unwrapped)
User Edits: "f(x) = 5" (no change)
On Save: "\\text{f(x) = 5}" (single wrap)
```

### Case 4: Nested Braces

```
User Input: "Use \\frac{1}{2} here"
Database: "\\text{Use \\frac{1}{2} here}"
On Load: "Use \\frac{1}{2} here" (correctly unwrapped)
```

### Case 5: Missing Wrapper in Database (Legacy Data)

```
Database: "Plain text" (no wrapper)
On Load: "Plain text" (unchanged)
On Save: "\\text{Plain text}" (wrapped)
```

## Benefits

### 1. **User-Friendly**

- Users never see LaTeX syntax noise
- Clean, intuitive text editing experience
- No need to manually type `\text{}`

### 2. **Error Prevention**

- Prevents double-wrapping (`\text{\text{...}}`)
- Prevents missing wrapper (ensures proper LaTeX)
- Consistent database format

### 3. **Maintenance**

- Centralized wrapping/unwrapping logic
- Easy to modify wrapper format if needed
- No scattered string manipulation

### 4. **Data Integrity**

- Database always has consistent format
- LaTeX rendering always works
- Migration-friendly (can bulk-update if needed)

## Testing Checklist

### Load Operation (Unwrapping)

- [ ] Load step with placeholder: `"\\text{Test}"`
- [ ] Verify Direction field shows: `"Test"`
- [ ] Load step with placeholder: `null`
- [ ] Verify Direction field shows: `""`
- [ ] Load step with nested braces: `"\\text{Use \\frac{1}{2}}"`
- [ ] Verify Direction field shows: `"Use \\frac{1}{2}"`

### Save Operation (Wrapping)

- [ ] Enter Direction: `"This is a test"`
- [ ] Save and check database: `"\\text{This is a test}"`
- [ ] Enter Direction: `"   "` (spaces only)
- [ ] Save and check database: `null`
- [ ] Enter Direction: `""`
- [ ] Save and check database: `null`
- [ ] Enter Direction with LaTeX: `"Use $x^2$ formula"`
- [ ] Save and check database: `"\\text{Use $x^2$ formula}"`

### Round-Trip Testing

- [ ] Save step with Direction: `"Original text"`
- [ ] Close and re-open Edit Question Modal
- [ ] Verify Direction shows: `"Original text"` (not `"\\text{Original text}"`)
- [ ] Edit Direction to: `"Modified text"`
- [ ] Save again
- [ ] Verify database: `"\\text{Modified text}"`

### Edge Cases

- [ ] Test with empty string
- [ ] Test with whitespace only
- [ ] Test with special characters: `<`, `>`, `&`, `"`
- [ ] Test with very long text (100+ chars)
- [ ] Test with Unicode characters: 你好, émojis 🎉

## Code Changes Summary

### Modified Functions

**1. `loadAnswerSteps()` - Added unwrapping logic**

```typescript
// BEFORE
placeholder: step.placeholder || "";

// AFTER
let unwrappedPlaceholder = step.placeholder || "";
if (unwrappedPlaceholder) {
  const textMatch = unwrappedPlaceholder.match(/^\\text\{(.*)\}$/);
  if (textMatch) {
    unwrappedPlaceholder = textMatch[1];
  }
}
```

**2. `saveQuestionAndSteps()` - Already had wrapping logic (no change needed)**

```typescript
placeholder: form.placeholder.trim()
  ? `\\text{${form.placeholder.trim()}}`
  : null;
```

### Lines Changed

- **File**: `TopicSelector.tsx`
- **Function**: `loadAnswerSteps()`
- **Lines**: ~735-745 (added unwrapping logic)
- **Total Changes**: +11 lines

## Future Enhancements

### Potential Improvements

1. **Preview Mode**: Show live LaTeX preview of Direction field
2. **Validation**: Warn if user accidentally types `\text{` manually
3. **Migration Script**: Bulk-update legacy data without wrappers
4. **Custom Wrappers**: Support other LaTeX commands (`\textbf{}`, `\textit{}`)

### Related Features

- Answer Steps display in View Question Modal (should also unwrap)
- Export/Import answer steps (preserve wrapper format)
- Answer Steps templates (pre-filled Directions with wrappers)

## Status

✅ **COMPLETE** - Passive placeholder wrapping/unwrapping implemented
✅ **Load Operation** - Unwraps `\text{}` when editing
✅ **Save Operation** - Wraps with `\text{}` when saving
✅ **Edge Cases** - Handles empty, null, and malformed data
⏳ **Testing** - Awaiting user verification

---

_Last Updated: October 21, 2025_
_Feature: Automatic \text{} Wrapper for Placeholder_
_User Experience: Plain text input → LaTeX storage_
