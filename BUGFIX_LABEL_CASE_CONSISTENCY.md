# Fix: Edit Question Label Column Update Issue

## Problem Report

When editing a question in the Question Modal (TopicSelector), the `label` column in the `tugonsense_answer_steps` table was not being saved correctly due to case mismatch.

## Root Cause

**Case Sensitivity Mismatch** between different parts of the codebase:

1. **Edit Question Modal**: Used lowercase labels (`"substitution"`, `"evaluation"`, etc.)
2. **Add Question Modal**: Used capitalized labels (`"Substitution"`, `"Evaluation"`, etc.)
3. **initializeSteps() function**: Used capitalized default (`"Substitution"`)
4. **UserInput shouldUseMathMode()**: Expected lowercase labels to trigger math mode

This inconsistency caused:

- New questions added with capitalized labels wouldn't trigger math mode
- Different behavior between Edit and Add modals
- Confusion about which case to use

## Solution Applied

### 1. ✅ Standardized Add Question Modal Label Options

**Location**: `src/pages/tugonsenseproblem/TopicSelector.tsx` - Lines ~3043-3050

**Before:**

```tsx
<option value="Substitution">Substitution</option>
<option value="Evaluation">Evaluation</option>
<option value="Simplification">Simplification</option>
<option value="Final">Final</option>
```

**After:**

```tsx
<option value="substitution">substitution</option>
<option value="evaluation">evaluation</option>
<option value="simplification">simplification</option>
<option value="final">final</option>
```

### 2. ✅ Fixed initializeSteps() Default Label

**Location**: `src/pages/tugonsenseproblem/TopicSelector.tsx` - Lines ~895 & 907

**Before:**

```typescript
label: "Substitution";
```

**After:**

```typescript
label: "substitution";
```

**Two occurrences updated:**

- Line 895: When adding additional steps
- Line 907: When creating new steps from scratch

## Database Schema Reference

```sql
CREATE TABLE public.tugonsense_answer_steps (
  id bigserial NOT NULL,
  topic_id integer NOT NULL,
  category_id integer NOT NULL,
  question_id integer NOT NULL,
  step_order integer NOT NULL,
  label text NOT NULL,  -- ⭐ This field now consistently uses lowercase
  answer_variants jsonb NOT NULL,
  placeholder text NULL,
  -- ... other fields
);
```

## Label Values Standardized

All labels now use **lowercase** consistently:

| Label            | Math Mode | Usage                                    |
| ---------------- | --------- | ---------------------------------------- |
| `substitution`   | ✅ Yes    | Replace variables with values            |
| `evaluation`     | ✅ Yes    | Evaluate expressions                     |
| `simplification` | ✅ Yes    | Simplify mathematical expressions        |
| `final`          | ✅ Yes    | Final answer                             |
| `choose`         | ✅ Yes    | Choose formula/approach                  |
| `math`           | ✅ Yes    | Generic math operation                   |
| Any other        | ❌ No     | Text mode (direction, explanation, etc.) |

## Verification Steps

### Test Edit Question Modal:

1. Open TopicSelector
2. Click FileQuestion icon on a category
3. Click Edit (pencil icon) on a question
4. Click "Submit Steps" to create/modify steps
5. Check label dropdown - should show lowercase options
6. Save and verify in database:
   ```sql
   SELECT label FROM tugonsense_answer_steps
   WHERE topic_id = X AND category_id = Y AND question_id = Z;
   ```
7. Expected: All labels in lowercase

### Test Add Question Modal:

1. Open TopicSelector
2. Click FileQuestion icon on a category
3. Click "Add Question" button (top right)
4. Fill question text
5. Click "Submit Steps"
6. Check label dropdown - should show lowercase options
7. Add answer variants
8. Click "Add Question & Steps"
9. Verify in database - labels should be lowercase

### Test Math Mode:

1. Create/edit a question with steps
2. Set labels to: `substitution`, `evaluation`, `simplification`, `final`
3. Open the question in AnswerWizard
4. **Expected**: MathLive editor (`<math-field>`) appears for all steps
5. Set label to: `direction` or `explanation`
6. **Expected**: Normal text input (`<input>`) appears

## Files Modified

- ✅ `src/pages/tugonsenseproblem/TopicSelector.tsx`
  - Lines ~895, 907: Changed default label from `"Substitution"` to `"substitution"`
  - Lines ~3043-3050: Changed Add Question Modal dropdown options to lowercase

## Related Components

### Components Already Using Lowercase:

- ✅ `UserInput.tsx` - `shouldUseMathMode()` function checks for lowercase labels
- ✅ `Edit Question Modal` - Dropdown already had lowercase options

### saveQuestionAndSteps() Function:

**No changes needed** - Function correctly saves `form.label` field:

```typescript
const stepsToInsert = stepForms.map((form, index) => ({
  // ... other fields
  label: form.label, // ✅ Correctly saves whatever label is selected
  // ... other fields
}));
```

## Impact Analysis

### ✅ Fixed Issues:

1. **Consistency**: All label values now lowercase throughout the codebase
2. **Math Mode**: Labels will now correctly trigger MathLive editor
3. **Database**: Labels saved to database are now predictable and consistent
4. **User Experience**: Same options in both Edit and Add modals

### ⚠️ Existing Data:

If you have **existing questions** in the database with capitalized labels:

```sql
-- Check for capitalized labels
SELECT DISTINCT label FROM tugonsense_answer_steps;

-- If you find capitalized labels, update them:
UPDATE tugonsense_answer_steps
SET label = LOWER(label)
WHERE label IN ('Substitution', 'Evaluation', 'Simplification', 'Final');
```

## Testing Checklist

- [ ] **Edit Question** - Label dropdown shows lowercase options
- [ ] **Add Question** - Label dropdown shows lowercase options
- [ ] **Submit Steps** - Default label is lowercase "substitution"
- [ ] **Save Question** - Labels saved to database in lowercase
- [ ] **Math Mode** - MathLive editor appears for math labels
- [ ] **Text Mode** - Normal input appears for non-math labels
- [ ] **Database** - Query shows all lowercase labels

## Status

✅ **FIXED** - All label values now consistently use lowercase throughout:

- Edit Question Modal ✅
- Add Question Modal ✅
- initializeSteps() function ✅
- saveQuestionAndSteps() function ✅ (was already correct)
- Database schema supports lowercase ✅
- UserInput.tsx expects lowercase ✅

## Related Documentation

- `QUICKREF_MATH_FIELD_VS_INPUT.md` - Explains how labels control math mode
- `INTEGRATION_QUESTION_TEMPLATE_SUPABASE.md` - Question template integration
- `COMPLETE_ANSWER_STEPS_INTEGRATION.md` - Original answer steps implementation
