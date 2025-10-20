# Complete Question Selector Implementation

## Overview

The TopicSelector component now includes a **Question Selector Modal** with full CRUD operations for managing questions within categories, directly integrated with the `tugonsense_questions` table in Supabase.

## Database Schema

```sql
create table public.tugonsense_questions (
  id bigserial not null,
  topic_id integer not null,
  category_id integer not null,
  question_id integer not null,
  category_text text null,
  question_text text not null,
  question_type public.question_type_enum not null,
  guide_text text null,
  answer_type public.answer_type_enum null default 'multiLine'::answer_type_enum,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  updated_by uuid null,
  constraint tugonsense_questions_pkey primary key (id),
  constraint tugonsense_questions_topic_id_category_id_question_id_key unique (topic_id, category_id, question_id),
  constraint tugonsense_questions_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint tugonsense_questions_topic_id_category_id_fkey foreign KEY (topic_id, category_id) references tugonsense_categories (topic_id, category_id) on delete CASCADE,
  constraint tugonsense_questions_updated_by_fkey foreign KEY (updated_by) references auth.users (id),
  constraint tugonsense_questions_question_id_check check ((question_id > 0))
);
```

## Features Implemented

### 1. **Question Selector Modal** ✅

- **Trigger**: Click the FileQuestion icon (teal button) on any category card
- **Display**: Large modal showing all questions for the selected category
- **Features**:
  - Lists all questions with question_id, question_type, answer_type badges
  - Displays question_text, category_text, and guide_text with LaTeX support
  - Auto-loads questions from Supabase when modal opens
  - Shows loading spinner during fetch
  - Empty state when no questions exist
  - Modal header shows category title

### 2. **View Question** ✅

- **Location**: Eye icon button (gray) on each question card in the selector
- **Functionality**:
  - Opens a detailed view modal
  - Shows all question fields in organized sections
  - Displays badges for question_id, question_type, and answer_type
  - Full LaTeX rendering for all text fields
  - Read-only view (no editing)
- **Button**: Gray background with eye icon (20px)
- **Color Theme**: Steel (`#64748b`)
- **Z-Index**: 60 (displays above question selector)

### 3. **Edit Question** ✅

- **Location**: Pencil icon button (ocean blue) on each question card
- **Functionality**:
  - Opens ocean blue themed modal with pre-filled form
  - **Editable Fields**:
    - Question Text (required, textarea, LaTeX support)
    - Question Type (dropdown: EVALUATION, SIMPLIFICATION, GENERAL)
    - Answer Type (dropdown: multiLine, singleLine)
    - Category Text (optional, input)
    - Guide Text (optional, textarea)
  - Updates Supabase and local state
  - Sets `updated_by` to current user
  - Validation: question_text is required
- **Button**: Ocean blue background with pencil icon (20px)
- **Color Theme**: Ocean (`#0ea5e9`)
- **Z-Index**: 60 (displays above question selector)

### 4. **Delete Question** ✅

- **Location**: Trash icon button (red) on each question card
- **Functionality**:
  - Opens red-themed confirmation modal
  - Shows question details with badges and LaTeX rendering
  - Displays CASCADE warning (deletes answer_steps)
  - Deletes from Supabase
  - Updates local state
- **Button**: Light red background with trash icon (20px)
- **Color Theme**: Red (`#ef4444`)
- **Z-Index**: 60 (displays above question selector)

## UI/UX Design

### Question Selector Modal

```typescript
// Large modal (max-w-4xl) with scrollable content
- Header: Teal background with category title
- Body: Scrollable list of questions (max-h-[calc(85vh-140px)])
- Each question card shows:
  - Question number badge (teal circle)
  - Type badges (question_type, answer_type)
  - Question text with LaTeX
  - Category text (if exists)
  - Guide text (if exists, italic)
  - Three action buttons (view, edit, delete)
```

### Action Buttons

All buttons follow the same design pattern as category buttons:

- **View**: Gray (`#64748b`) - Eye icon
- **Edit**: Ocean blue (`#0ea5e9`) - Pencil icon
- **Delete**: Red (`#ef4444`) - Trash icon
- **Padding**: `p-2.5` (10px)
- **Icon Size**: 20px
- **Hover Effect**: Border appears, background opacity increases

### Modal Hierarchy

```
z-50: Question Selector Modal (main list)
z-60: View/Edit/Delete Question Modals (overlay on selector)
```

This allows users to:

1. Open Question Selector (z-50)
2. Keep it open in background
3. View/Edit/Delete individual questions (z-60)
4. Return to selector after action

## Key Functions

### `openQuestionModal(category)`

```typescript
const openQuestionModal = async (category: Category) => {
  // 1. Set selected category
  // 2. Show modal
  // 3. Load questions from Supabase
};
```

### `loadQuestions(topicId, categoryId)`

```typescript
const loadQuestions = async (topicId: number, categoryId: number) => {
  // 1. Set loading state
  // 2. Query tugonsense_questions table
  // 3. Filter by topic_id and category_id
  // 4. Order by question_id ascending
  // 5. Update questions state
};
```

### `updateQuestion()`

```typescript
const updateQuestion = async () => {
  // 1. Validate question_text (required)
  // 2. Update Supabase record
  // 3. Update local questions array
  // 4. Reset modal
};
```

### `executeDeleteQuestion()`

```typescript
const executeDeleteQuestion = async () => {
  // 1. Delete from Supabase (CASCADE deletes answer_steps)
  // 2. Filter out from local questions array
  // 3. Close confirmation modal
};
```

## State Management

```typescript
// Question selector modal
const [showQuestionModal, setShowQuestionModal] = useState(false);
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
const [questions, setQuestions] = useState<Question[]>([]);
const [loadingQuestions, setLoadingQuestions] = useState(false);

// Question view/edit/delete modals
const [showViewQuestionModal, setShowViewQuestionModal] = useState(false);
const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
const [showDeleteQuestionConfirm, setShowDeleteQuestionConfirm] =
  useState(false);
const [questionToView, setQuestionToView] = useState<Question | null>(null);
const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

// Edit question form state
const [editQuestionText, setEditQuestionText] = useState("");
const [editQuestionType, setEditQuestionType] = useState("");
const [editGuideText, setEditGuideText] = useState("");
const [editAnswerType, setEditAnswerType] = useState("");
const [editCategoryText, setEditCategoryText] = useState("");
```

## Database Triggers

The following triggers are automatically executed:

1. **`set_created_by_questions`** (BEFORE INSERT)

   - Auto-fills `created_by` field with current user ID

2. **`update_tugonsense_questions_audit`** (BEFORE UPDATE)
   - Auto-updates `updated_at` timestamp
   - Updates `updated_by` field

## Cascade Behavior

⚠️ **Important**: Deleting a question triggers CASCADE deletion:

- Question deletion → Deletes all answer_steps for that question

This is clearly communicated in the delete confirmation modal with a red warning box.

## LaTeX Support

All question text fields support LaTeX rendering:

- **Question Text**: Main question content
- **Category Text**: Additional category-specific text
- **Guide Text**: Hints or guidance for solving

Example:

```
Question Text: "Evaluate $f(x) = 3x + 4$ when $x = 5$"
Category Text: "EVALUATION STAGE"
Guide Text: "Substitute the value of $x$ into the function"
```

## Question Types

### question_type_enum

- **EVALUATION**: Function evaluation problems
- **SIMPLIFICATION**: Algebraic simplification
- **GENERAL**: General math problems

### answer_type_enum

- **multiLine**: Multiple lines of work/steps
- **singleLine**: Single answer line

## Integration Flow

```
1. User clicks topic → Topic expands
2. Categories load from tugonsense_categories
3. User clicks FileQuestion icon on category
4. Question Selector Modal opens
5. Questions load from tugonsense_questions
6. User can:
   - View question details (Eye icon)
   - Edit question (Pencil icon)
   - Delete question (Trash icon)
7. All actions update Supabase and local state
```

## Testing Checklist

✅ **Question Selector**

- [ ] Click FileQuestion icon on any category
- [ ] Verify modal opens with category title in header
- [ ] Check that questions load from database
- [ ] Verify loading spinner appears during fetch
- [ ] Test empty state when no questions exist
- [ ] Confirm LaTeX renders correctly

✅ **View Question**

- [ ] Click Eye icon on any question
- [ ] Verify modal opens with all question details
- [ ] Check that badges display correctly
- [ ] Confirm LaTeX renders in all fields
- [ ] Test close button

✅ **Edit Question**

- [ ] Click Pencil icon on any question
- [ ] Verify form pre-fills with existing data
- [ ] Modify question_text
- [ ] Change question_type dropdown
- [ ] Change answer_type dropdown
- [ ] Update category_text and guide_text
- [ ] Click "Save Changes"
- [ ] Verify updates appear immediately
- [ ] Check Supabase console for updated fields

✅ **Delete Question**

- [ ] Click Trash icon on any question
- [ ] Verify confirmation modal shows question details
- [ ] Read CASCADE warning
- [ ] Click "Delete" button
- [ ] Verify question disappears from list
- [ ] Check Supabase console for deletion

✅ **Modal Hierarchy**

- [ ] Open Question Selector
- [ ] Click View/Edit/Delete on a question
- [ ] Verify second modal appears on top (z-60)
- [ ] Close second modal
- [ ] Verify Question Selector is still open
- [ ] Test multiple operations in sequence

## User Interface Reference

Based on the provided EVALUATION reference image, the implementation includes:

✅ **Question Cards** (similar to STEP 1 card)

- Numbered badge (like teal circle with "1")
- Type badges (like "EVALUATION" tag)
- Question text display
- Action buttons on the right

✅ **Form Fields** (similar to reference)

- Question Text (like "QUESTION TEXT" field)
- Category Text (like "MATH PROBLEM" field)
- Guide Text (like "DIRECTION" field)
- Dropdown selectors for types
- LaTeX support throughout

✅ **Color Coding**

- Teal: Primary actions (add, view selector)
- Ocean Blue: Edit actions
- Red: Delete actions
- Gray: Neutral view actions

## Next Steps

### Immediate

1. Test all question CRUD operations
2. Verify CASCADE deletion works correctly
3. Test LaTeX rendering in various scenarios
4. Test with empty categories

### Future Enhancements

1. **Add Question Functionality**

   - Add "+ Add Question" button in Question Selector
   - Create form to add new questions
   - Auto-increment question_id per category

2. **Answer Steps Integration**

   - View answer steps for each question
   - Edit/Delete answer steps
   - Link to tugonsense_answer_steps table

3. **Bulk Operations**

   - Select multiple questions
   - Delete/export multiple at once

4. **Search & Filter**

   - Search questions by text
   - Filter by question_type
   - Sort by question_id

5. **Question Reordering**
   - Drag-and-drop to reorder questions
   - Update question_id values

## Related Files

- **Component**: `src/pages/tugonsenseproblem/TopicSelector.tsx`
- **Database**: `tugonsense_questions` table in Supabase
- **Schema**: See database migration files
- **Parent Tables**: tugonsense_topics, tugonsense_categories
- **Child Tables**: tugonsense_answer_steps

## Complete Hierarchy

```
Topics (tugonsense_topics)
  └── Categories (tugonsense_categories)
        └── Questions (tugonsense_questions) ✅ NEW
              └── Answer Steps (tugonsense_answer_steps) - Future
```

## Status

✅ **COMPLETE** - Full question viewing, editing, and deletion functionality is implemented and ready for testing.

⏳ **PENDING** - Add Question functionality (button exists, opens selector only)

---

_Last Updated: October 20, 2025_
_Implementation: Complete Question Selector with View, Edit, Delete_
_Next Phase: Add Question functionality + Answer Steps integration_
