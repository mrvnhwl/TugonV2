# Quick Reference: Question Selector Usage

## How to Access Questions

1. **Navigate to Topic Selector** (`/topicselector`)
2. **Click on a Topic** to expand it
3. **Click the FileQuestion icon** (teal button) on any category
4. **Question Selector Modal opens** showing all questions for that category

## Available Actions

### 👁️ View Question (Gray Eye Icon)

- **Purpose**: See full question details in read-only mode
- **Shows**: All fields with LaTeX rendering
- **Action**: Click → View modal opens → Click "Close" to return

### ✏️ Edit Question (Blue Pencil Icon)

- **Purpose**: Modify question details
- **Editable**:
  - Question Text (required)
  - Question Type (EVALUATION, SIMPLIFICATION, GENERAL)
  - Answer Type (multiLine, singleLine)
  - Category Text (optional)
  - Guide Text (optional)
- **Action**: Click → Edit form opens → Modify → "Save Changes"

### 🗑️ Delete Question (Red Trash Icon)

- **Purpose**: Remove question from database
- **Warning**: Also deletes all answer steps (CASCADE)
- **Action**: Click → Confirmation modal → Read warning → "Delete"

## Button Color Guide

| Color   | Icon            | Action         | Purpose                     |
| ------- | --------------- | -------------- | --------------------------- |
| 🟢 Teal | 📄 FileQuestion | View Questions | Opens question selector     |
| ⚪ Gray | 👁️ Eye          | View Details   | Shows question in read-only |
| 🔵 Blue | ✏️ Pencil       | Edit           | Modify question fields      |
| 🔴 Red  | 🗑️ Trash        | Delete         | Remove question             |

## Question Card Layout

```
┌─────────────────────────────────────────────────────────┐
│ [1]  [EVALUATION] [multiLine]                           │
│                                                          │
│ Evaluate $f(x) = 3x + 4$ when $x = 5$                  │
│ EVALUATION STAGE                                        │
│ Guide: Substitute the value...                          │
│                                              [👁️][✏️][🗑️] │
└─────────────────────────────────────────────────────────┘
```

## Modal Workflow

### Scenario 1: Quick View

```
Category Card → Click FileQuestion (teal) → Question Selector opens
→ Click Eye (gray) on question → View modal opens (read-only)
→ Click "Close" → Back to Question Selector
→ Click X → Back to category list
```

### Scenario 2: Edit Question

```
Category Card → Click FileQuestion (teal) → Question Selector opens
→ Click Pencil (blue) on question → Edit modal opens
→ Modify fields → Click "Save Changes" → Updates applied
→ Back to Question Selector (question updated)
→ Click X → Back to category list
```

### Scenario 3: Delete Question

```
Category Card → Click FileQuestion (teal) → Question Selector opens
→ Click Trash (red) on question → Confirmation modal opens
→ Read CASCADE warning → Click "Delete" → Question removed
→ Back to Question Selector (question gone)
→ Click X → Back to category list
```

## Database Integration

### Queries Questions By:

- `topic_id` (from selected category)
- `category_id` (from selected category)
- Orders by `question_id` ascending

### Updates Track:

- `updated_at` (auto-updated by trigger)
- `updated_by` (current user ID)

### Deletes CASCADE:

- Question → Answer Steps (all deleted together)

## LaTeX Support Examples

### Simple Evaluation

```
Question: "Evaluate $f(x) = 2x + 1$ at $x = 3$"
```

### Complex Expression

```
Question: "Simplify $$\frac{x^2 - 4}{x - 2}$$"
Guide: "Factor the numerator using difference of squares"
```

### Function Notation

```
Category Text: "FUNCTION NOTATION"
Question: "Express using proper function notation: $y = 5x - 3$"
```

## Empty States

### No Questions in Category

```
┌─────────────────────────────────────┐
│         📄 (gray icon)              │
│                                     │
│      No questions yet               │
│  Questions for this category        │
│      will appear here               │
└─────────────────────────────────────┘
```

## Keyboard Shortcuts

- **Esc**: Close any modal
- **Enter**: Save changes in edit modal

## Status Indicators

### Loading

- Spinner with "Loading questions..." text

### Saving

- Button text changes to "Saving..." or "Deleting..."
- Buttons disabled during operation

### Success

- Modal closes automatically
- Changes appear immediately in list

## Common Workflows

### 1. Review All Questions

```
Click FileQuestion → Browse list → Click Eye on each → Review
```

### 2. Bulk Update Questions

```
Click FileQuestion → Edit question 1 → Save → Edit question 2 → Save...
```

### 3. Clean Up Category

```
Click FileQuestion → Delete unwanted questions → Confirm each
```

## Tips

✅ **Do:**

- Review question details before editing
- Read CASCADE warnings before deleting
- Use LaTeX for mathematical expressions
- Keep question_text concise and clear

❌ **Don't:**

- Delete questions without checking answer steps
- Leave question_text empty (required field)
- Forget to save changes before closing

## Troubleshooting

**Modal won't open?**

- Check browser console for errors
- Verify category has valid topic_id and category_id

**Questions not loading?**

- Check Supabase connection
- Verify RLS policies allow SELECT on tugonsense_questions

**Can't edit question?**

- Ensure you're signed in
- Check question_text is not empty

**Delete fails?**

- Check for database constraints
- Verify CASCADE is properly configured

---

_Quick Reference Guide_
_For detailed documentation, see COMPLETE_QUESTION_SELECTOR.md_
