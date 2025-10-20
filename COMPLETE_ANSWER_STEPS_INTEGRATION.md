# Answer Steps Integration - Complete Implementation

## Overview

The Edit Question Modal now includes **complete Answer Steps management** with database integration to `tugonsense_answer_steps` table.

## Features Implemented

### 1. ✅ Add Question Button in Question Selector

- **Location**: Top-right corner of Question Selector Modal (next to Close button)
- **Styling**: White border button with Plus icon
- **Status**: Placeholder (shows "coming soon" alert)
- **Future**: Will open form to add new questions

### 2. ✅ Guide Text Removed

- **Field Removed**: Guide Text input field no longer appears in Edit Question Modal
- **Database**: `guide_text` column is no longer updated (left empty/null)
- **UI Clean**: Simplified interface focuses on essential fields

### 3. ✅ Answer Steps in Edit Question Modal

#### Layout Design

```
┌──────────────────────────────────────────────────────┐
│ Edit Question                                    [X] │ ← Ocean blue header
├──────────────────────────────────────────────────────┤
│ QUESTION DETAILS                                     │
│ • Question Text (textarea, required)                 │
│ • Question Type (dropdown)                           │
│ • Answer Type (dropdown)                             │
│ • Category Text (input, optional)                    │
│                                                      │
│ ───────────────────────────────────────────────────  │
│                                                      │
│ ANSWER STEPS                                         │
│ Steps (Max 10): [4] [Submit Steps]                  │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [1] STEP 1                                      │ │
│ │ Direction: [f(x) = 5                         ]  │ │
│ │ Label: [Substitution ▼]                         │ │
│ │ Answer Variants:                                │ │
│ │   [Variant 1                                 ]  │ │
│ │   [+ Add Variant]                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [2] STEP 2                                      │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│           [Cancel]  [Save Question & Steps]          │
└──────────────────────────────────────────────────────┘
```

#### Steps Configuration

- **Steps Input**: Number input (1-10) at top-right
- **Submit Steps Button**: Generates N step forms
- **Once Generated**: Number input disabled until modal closes
- **Max Steps**: 10 (as per spec)

#### Per Step Form Fields

**1. Direction (Placeholder)**

- **UI**: Text input field
- **Database**: Maps to `placeholder` column
- **Auto-wrapping**: Input wrapped in `\text{your input}` before saving
- **Example**: User types "f(x) = 5" → Saved as `\text{f(x) = 5}`

**2. Label (Dropdown)**

- **Options**:
  - Substitution
  - Evaluation
  - Simplification
  - Final
- **Database**: Maps to `label` column
- **Default**: "Substitution"

**3. Answer Variants (Dynamic Array)**

- **UI**: Multiple text inputs (1-5 variants)
- **Database**: Maps to `answer_variants` JSONB column (array of strings)
- **Controls**:
  - Start with 1 variant
  - "+ Add Variant" button (max 5)
  - X button to remove (min 1)
- **Storage**: Array of non-empty strings

#### Step Card Design

```
┌─────────────────────────────────────────────────────┐
│ [1] STEP 1                      ← Teal badge + label│
│                                                      │
│ DIRECTION                                            │
│ [f(x) = 5                                         ]  │
│                                                      │
│ LABEL                                                │
│ [Substitution ▼]                                     │
│                                                      │
│ ANSWER VARIANTS                                      │
│ [Variant 1                                       ] [X]│
│ [Variant 2                                       ] [X]│
│ [+ Add Variant]                                      │
└─────────────────────────────────────────────────────┘
```

## Database Integration

### Answer Steps Schema

```sql
create table public.tugonsense_answer_steps (
  id bigserial not null,
  topic_id integer not null,
  category_id integer not null,
  question_id integer not null,
  step_order integer not null,
  label text not null,
  answer_variants jsonb not null,
  placeholder text null,
  -- Constraints ensure unique (topic_id, category_id, question_id, step_order)
);
```

### Save Operation Flow

```typescript
saveQuestionAndSteps() {
  // 1. Update question in tugonsense_questions
  UPDATE tugonsense_questions SET
    question_text = ?,
    question_type = ?,
    answer_type = ?,
    category_text = ?
  WHERE id = ?;

  // 2. Delete existing answer steps
  DELETE FROM tugonsense_answer_steps
  WHERE topic_id = ? AND category_id = ? AND question_id = ?;

  // 3. Insert new answer steps
  INSERT INTO tugonsense_answer_steps (
    topic_id, category_id, question_id, step_order,
    label, answer_variants, placeholder, created_by
  ) VALUES
    (?, ?, ?, 1, 'Substitution', '["variant1"]', '\\text{f(x) = 5}', ?),
    (?, ?, ?, 2, 'Evaluation', '["variant2"]', '\\text{fx}', ?),
    ...;
}
```

### Data Transformations

#### Placeholder Wrapping

```typescript
// User Input → Database
Input: "f(x) = 5";
Saved: "\\text{f(x) = 5}";

// Empty placeholder
Input: "";
Saved: null;
```

#### Answer Variants Array

```typescript
// User Input → Database
Input: ["35x+4", "f(x)=35x+4", ""];
Saved: ["35x+4", "f(x)=35x+4"]; // Empty strings filtered
```

## State Management

```typescript
// Answer steps data (loaded from DB)
const [answerSteps, setAnswerSteps] = useState<AnswerStep[]>([]);
const [loadingAnswerSteps, setLoadingAnswerSteps] = useState(false);

// Step forms (user input)
const [maxSteps, setMaxSteps] = useState(4);
const [stepForms, setStepForms] = useState<
  Array<{
    placeholder: string;
    label: string;
    variants: string[];
  }>
>([]);
```

## Key Functions

### `loadAnswerSteps(topicId, categoryId, questionId)`

```typescript
// Loads existing answer steps when editing question
// Populates stepForms if steps exist
// Auto-sets maxSteps to existing step count
```

### `initializeSteps()`

```typescript
// Creates N empty step forms based on maxSteps
// Disables maxSteps input after generation
// Each form starts with: placeholder="", label="Substitution", variants=[""]
```

### `updateStepForm(index, field, value)`

```typescript
// Updates specific field in specific step form
// Fields: 'placeholder', 'label', or 'variants'
```

### `addVariant(stepIndex)`

```typescript
// Adds empty variant to step (max 5)
// Button disabled when 5 variants reached
```

### `updateVariant(stepIndex, variantIndex, value)`

```typescript
// Updates specific variant in specific step
```

### `removeVariant(stepIndex, variantIndex)`

```typescript
// Removes variant from step (min 1)
// X button hidden when only 1 variant
```

### `saveQuestionAndSteps()`

```typescript
// Main save function
// 1. Validates question_text (required)
// 2. Updates question in DB
// 3. Deletes old answer steps
// 4. Inserts new answer steps
// 5. Wraps placeholder in \text{}
// 6. Filters empty variants
// 7. Shows success alert
```

## UI/UX Features

### Modal Scrolling

- **Height**: max-h-[90vh] (90% viewport height)
- **Scrollable Area**: Question fields + Answer steps
- **Fixed Header**: Ocean blue, always visible
- **Fixed Footer**: Cancel + Save buttons, always visible

### Step Forms Styling

- **Background**: Light teal tint (`${color.teal}05`)
- **Border**: Subtle gray border
- **Badge**: Teal circle with white number
- **Layout**: Vertical stack with spacing

### Variant Management

- **Add Button**: Dashed border, teal color
- **Remove Button**: Red background, X icon
- **Min/Max**: 1-5 variants per step
- **Responsive**: Full width inputs

### Button States

- **Submit Steps**:
  - Enabled: Before step forms generated
  - Disabled: After forms generated (teal with 50% opacity)
- **Save Question & Steps**:
  - Enabled: When question_text not empty
  - Disabled: When saving or question_text empty
  - Text changes: "Save Question & Steps" → "Saving..."

## Workflow Example

### Scenario: Edit Question with 4 Steps

**1. Click Edit (Pencil icon) on question**

```
→ Modal opens
→ Question fields populate
→ Answer steps load from DB
→ If steps exist: Forms auto-populate
→ If no steps: Empty, ready for "Submit Steps"
```

**2. User sees question data**

```
Question Text: "Evaluate $f(x) = 3x + 4$"
Question Type: EVALUATION
Answer Type: multiLine
Category Text: "EVALUATION STAGE"
```

**3. User configures steps**

```
Steps (Max 10): [4] [Submit Steps] ← Click button
→ 4 step forms appear
→ Number input disabled
```

**4. User fills Step 1**

```
Direction: f(x) = 5
Label: Substitution
Variants:
  - f(5)
  - [+ Add Variant] ← Click
  - f(x=5)  ← Add second variant
```

**5. User fills Steps 2-4**

```
Step 2: Evaluation, f(5)=3(5)+4
Step 3: Simplification, f(5)=15+4
Step 4: Final, 19
```

**6. User clicks "Save Question & Steps"**

```
→ Button shows "Saving..."
→ Question updates
→ Old steps deleted
→ New steps inserted:
  * step_order=1, label="Substitution", placeholder="\\text{f(x) = 5}", variants=["f(5)", "f(x=5)"]
  * step_order=2, label="Evaluation", placeholder="\\text{f(5)=3(5)+4}", variants=["15+4"]
  * ...
→ Alert: "Question and steps saved successfully!"
→ Modal closes
→ Question list refreshes
```

## Validation Rules

### Question Level

- ✅ question_text: Required (cannot be empty)
- ✅ question_type: Required (dropdown selection)
- ✅ answer_type: Optional (defaults to "multiLine")
- ✅ category_text: Optional

### Step Level

- ✅ step_order: Auto-assigned (1, 2, 3, ...)
- ✅ label: Required (dropdown selection)
- ✅ answer_variants: Must have at least 1 non-empty variant
- ✅ placeholder: Optional (auto-wrapped in \text{})

### Constraints

- ✅ Max 10 steps per question
- ✅ Max 5 variants per step
- ✅ Min 1 variant per step
- ✅ Unique (topic_id, category_id, question_id, step_order)

## Changes from Previous Version

### Removed

❌ Guide Text field (no longer in UI)
❌ Guide Text in save operation
❌ updateQuestion() function (replaced by saveQuestionAndSteps)

### Added

✅ Answer Steps section in Edit Question Modal
✅ Steps configuration (max steps, submit button)
✅ Dynamic step forms with 3 fields each
✅ Variant management (add/remove up to 5)
✅ loadAnswerSteps() function
✅ initializeSteps() function
✅ updateStepForm() function
✅ addVariant() / updateVariant() / removeVariant() functions
✅ saveQuestionAndSteps() function (replaces updateQuestion)
✅ "Add Question" button in Question Selector header

### Modified

✅ openEditQuestionModal() - Now loads answer steps
✅ resetEditQuestionModal() - Clears answer steps state
✅ Modal size - Increased to max-w-4xl for wider layout
✅ Modal height - Increased to 90vh for more content
✅ Footer button text - "Save Changes" → "Save Question & Steps"

## Testing Checklist

### Question Selector

- [ ] Click FileQuestion icon on category
- [ ] Verify "Add Question" button appears in header
- [ ] Click "Add Question" button
- [ ] Confirm "coming soon" alert appears

### Edit Question - No Existing Steps

- [ ] Click Edit (Pencil) on question
- [ ] Verify modal opens with question data
- [ ] Verify "Answer Steps" section appears
- [ ] Verify "Steps (Max 10)" input and "Submit Steps" button
- [ ] Enter number (e.g., 4)
- [ ] Click "Submit Steps"
- [ ] Verify 4 step forms appear
- [ ] Verify number input is disabled

### Step Form Interaction

- [ ] Fill Direction input
- [ ] Select Label from dropdown
- [ ] Enter first variant
- [ ] Click "+ Add Variant"
- [ ] Verify second variant input appears
- [ ] Fill second variant
- [ ] Add up to 5 variants
- [ ] Verify "+ Add Variant" disabled at 5
- [ ] Click X on variant
- [ ] Verify variant removed
- [ ] Verify X hidden when only 1 variant

### Save Operation

- [ ] Fill all step forms
- [ ] Click "Save Question & Steps"
- [ ] Verify button shows "Saving..."
- [ ] Wait for success alert
- [ ] Verify modal closes
- [ ] Verify question updates in list
- [ ] Check Supabase console for answer_steps records

### Edit Question - With Existing Steps

- [ ] Edit question that has answer steps
- [ ] Verify step forms auto-populate
- [ ] Verify maxSteps set to existing count
- [ ] Verify number input disabled
- [ ] Modify existing steps
- [ ] Save changes
- [ ] Verify old steps deleted
- [ ] Verify new steps inserted

### Database Verification

- [ ] Check `placeholder` wrapped in `\text{}`
- [ ] Check `answer_variants` is array of strings
- [ ] Check empty variants filtered out
- [ ] Check `step_order` is sequential (1, 2, 3...)
- [ ] Check `created_by` populated
- [ ] Check unique constraint enforced

## Known Limitations

⚠️ **Add Question**: Button exists but not implemented (placeholder)
⚠️ **Edit Existing Steps**: Requires re-submitting all steps (delete + insert)
⚠️ **No Step Reordering**: Cannot drag-drop to reorder steps
⚠️ **No Individual Step Delete**: Must delete all and re-create

## Future Enhancements

1. **Add Question Modal**: Complete form to add new questions
2. **Individual Step Management**: Add/Edit/Delete individual steps without affecting others
3. **Step Reordering**: Drag-and-drop to change step order
4. **Step Templates**: Predefined step configurations for common question types
5. **Variant Preview**: Show LaTeX preview of variants
6. **Bulk Import**: Import multiple questions with steps from file

## Status

✅ **COMPLETE** - Answer Steps fully integrated in Edit Question Modal
✅ **TESTED** - Compiles without errors
⏳ **PENDING** - Add Question implementation

---

_Last Updated: October 20, 2025_
_Implementation: Complete Answer Steps Integration_
_Database: tugonsense_answer_steps fully connected_
