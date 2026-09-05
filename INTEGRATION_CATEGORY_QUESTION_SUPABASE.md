# 🎯 CategoryQuestion Supabase Integration

## Overview

This document explains how the `CategoryQuestion` component now loads data from Supabase instead of hardcoded TypeScript files.

---

## 🔄 What Changed

### 1. **New Service Function: `fetchCategoryQuestionData()`**

Location: `src/lib/supabaseCategories.ts`

This function fetches both category and question data in a single efficient call:

```typescript
export async function fetchCategoryQuestionData(
  topicId: number,
  categoryId: number,
  questionId: number
): Promise<{
  categoryQuestion: string | null; // Category title (e.g., "Solve for y:")
  categoryText: string | null; // The actual math problem
  questionText: string; // Question number text
  questionType: "step-by-step" | "direct" | "multiple-choice";
  answerType: "multiLine" | "singleLine" | null;
} | null>;
```

**What it does:**

1. Fetches category from `tugonsense_categories` table to get `category_question`
2. Fetches specific question from `tugonsense_questions` table
3. Returns combined data in a single object

---

### 2. **Updated CategoryQuestion Component**

Location: `src/components/tugon/question-system/CategoryQuestion.tsx`

#### Old Behavior (Hardcoded):

```typescript
// Find the specific category from defaultTopics
const categoryData = React.useMemo(() => {
  const topic = defaultTopics.find((t) => t.id === topicId);
  if (topic) {
    return topic.level.find((q) => q.category_id === categoryId);
  }
  return null;
}, [topicId, categoryId]);
```

#### New Behavior (Supabase):

```typescript
// Fetch from Supabase
React.useEffect(() => {
  const loadQuestionData = async () => {
    const data = await fetchCategoryQuestionData(
      topicId,
      categoryId,
      questionId
    );
    if (data) {
      setCategoryQuestion(data.categoryQuestion);
      setCategoryText(data.categoryText);
      setQuestionText(data.questionText);
      setAnswerType(data.answerType);
    }
  };
  loadQuestionData();
}, [topicId, categoryId, questionId]);
```

---

## 📊 Data Flow

### Complete Flow from ProgressMap to CategoryQuestion

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS "START STAGE" BUTTON IN PROGRESSMAP             │
│    ProgressMap → onStartStage(topicId, categoryId, questionId) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. TUGONSENSE HANDLES THE START                                │
│    TugonSense.tsx → handleStartStage()                         │
│    Navigate to: /tugonplay?topic=1&category=2&question=3       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. TUGONPLAY EXTRACTS URL PARAMETERS                           │
│    const topicId = Number(searchParams.get("topic"))           │
│    const categoryId = Number(searchParams.get("category"))     │
│    const questionId = Number(searchParams.get("question"))     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CATEGORYQUESTION RECEIVES IDS AS PROPS                      │
│    <CategoryQuestion                                           │
│      topicId={topicId}                                         │
│      categoryId={categoryId}                                   │
│      questionId={questionId}                                   │
│    />                                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. CATEGORYQUESTION FETCHES FROM SUPABASE                      │
│    fetchCategoryQuestionData(topicId, categoryId, questionId)  │
│                                                                 │
│    Query 1: tugonsense_categories                              │
│      SELECT category_question                                  │
│      WHERE topic_id = 1 AND category_id = 2                    │
│                                                                 │
│    Query 2: tugonsense_questions                               │
│      SELECT *                                                   │
│      WHERE topic_id = 1                                         │
│        AND category_id = 2                                      │
│        AND question_id = 3                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DATA DISPLAYED IN UI                                        │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ {categoryQuestion} {questionText}                       │ │
│    │ "Solve for y:" "Question 1"                             │ │
│    ├─────────────────────────────────────────────────────────┤ │
│    │                                                         │ │
│    │         {categoryText}                                  │ │
│    │       "2x + 3y = 12"                                    │ │
│    │                                                         │ │
│    └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components Rendered

### 1. **Header Section** (if both exist)

```tsx
{
  categoryText && questionText && (
    <div className="mb-3 text-white ...">
      {categoryQuestion} <span className="font-bold">{questionText}</span>
    </div>
  );
}
```

**Example Output:**

```
Solve for y: Question 1
```

### 2. **Question Display Section**

#### For Text-Based Questions (answerLabel === "text"):

```tsx
<div style={{ color: "white", fontSize: "1.5rem", ... }}>
  {categoryText}
</div>
```

**Example Output:**

```
Simplify the expression
```

#### For Math Expressions (LaTeX):

```tsx
<math-field
  value={formattedCategoryText}
  read-only={true}
  style={{ color: "white", fontSize: "2.5rem", ... }}
/>
```

**Example Output (rendered LaTeX):**

```
2x + 3y = 12
```

---

## 🔐 Database Schema Reference

### `tugonsense_categories`

```sql
CREATE TABLE tugonsense_categories (
  topic_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  category_question TEXT,  -- ← This is the category title
  title TEXT,
  ...
);
```

**Example Data:**
| topic_id | category_id | category_question | title |
|----------|-------------|-------------------|-------|
| 1 | 1 | Solve for y: | Linear Equations |
| 1 | 2 | Simplify: | Algebraic Expressions |

### `tugonsense_questions`

```sql
CREATE TABLE tugonsense_questions (
  topic_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  category_text TEXT,      -- ← The actual math problem
  question_text TEXT,      -- ← Question number/label
  question_type question_type_enum,
  answer_type answer_type_enum,
  ...
);
```

**Example Data:**
| topic_id | category_id | question_id | category_text | question_text |
|----------|-------------|-------------|---------------|---------------|
| 1 | 1 | 1 | 2x + 3y = 12 | Question 1 |
| 1 | 1 | 2 | 4x - y = 8 | Question 2 |

---

## 🎯 Loading States

### 1. **Loading State**

```tsx
<Card className="bg-[#5da295]">
  <div className="flex items-center gap-3 text-white">
    <div className="w-6 h-6 border-2 border-white animate-spin"></div>
    <span>Loading question...</span>
  </div>
</Card>
```

### 2. **Error State**

```tsx
<Card className="border-red-200 bg-red-50">
  <Text className="text-red-700">Failed to load question from database</Text>
</Card>
```

### 3. **Loaded State**

Shows the actual question content (see UI Components section above)

---

## 🔄 Fallback Mechanism

If Supabase fails, the component automatically falls back to hardcoded data:

```typescript
const loadFallbackData = () => {
  const topic = defaultTopics.find((t) => t.id === topicId);
  if (topic) {
    const category = topic.level.find((q) => q.category_id === categoryId);
    if (category) {
      const question = category.given_question.find(
        (q) => q.question_id === questionId
      );
      setCategoryQuestion(category.category_question || null);
      setCategoryText(question?.category_text || null);
      setQuestionText(question?.question_text || "");
    }
  }
};
```

**This ensures:**

- ✅ App continues working even if database is unavailable
- ✅ Smooth user experience during development
- ✅ Graceful degradation

---

## 🧪 Testing the Integration

### Step 1: Populate Database

```sql
-- Insert a test topic
INSERT INTO tugonsense_topics (id, name, description)
VALUES (1, 'Basic Algebra', 'Fundamental algebraic concepts');

-- Insert a test category
INSERT INTO tugonsense_categories (topic_id, category_id, category_question, title)
VALUES (1, 1, 'Solve for y:', 'Linear Equations');

-- Insert a test question
INSERT INTO tugonsense_questions
  (topic_id, category_id, question_id, category_text, question_text, question_type)
VALUES
  (1, 1, 1, '2x + 3y = 12', 'Question 1', 'step-by-step');
```

### Step 2: Navigate to Question

1. Open ProgressMap
2. Click "Start Stage" on Topic 1, Category 1
3. You should be redirected to: `/tugonplay?topic=1&category=1&question=1`

### Step 3: Verify Console Logs

Look for these logs in browser console:

```
🔄 Loading question data from Supabase: Topic 1, Category 1, Question 1
✅ Loaded question data from Supabase: {
  categoryQuestion: "Solve for y:",
  categoryText: "2x + 3y = 12",
  questionText: "Question 1",
  answerType: "multiLine"
}
```

### Step 4: Verify UI Display

You should see:

```
┌─────────────────────────────────────────┐
│ Solve for y: Question 1                 │
├─────────────────────────────────────────┤
│                                         │
│         2x + 3y = 12                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

- [ ] ProgressMap passes correct `topicId`, `categoryId`, `questionId` via URL
- [ ] TugonPlay extracts URL parameters correctly
- [ ] CategoryQuestion receives props correctly
- [ ] `fetchCategoryQuestionData()` queries database successfully
- [ ] Console shows "✅ Loaded question data from Supabase"
- [ ] UI displays `categoryQuestion` + `questionText` in header
- [ ] UI displays `categoryText` in main question area
- [ ] MathLive renders LaTeX correctly
- [ ] Loading spinner shows while fetching
- [ ] Error state shows if database fails
- [ ] Fallback to hardcoded data works when needed

---

## 🚀 Next Steps

### 1. **Populate Full Database**

Use the SQL script from `GUIDE_POPULATE_SUPABASE.md` to insert all your questions.

### 2. **Remove Hardcoded Dependencies** (Optional)

Once database is fully populated, you can remove:

- `src/components/data/questions/index.ts` (hardcoded topics/categories/questions)
- Fallback logic in CategoryQuestion

### 3. **Update Answer System**

Next, integrate answers from Supabase (currently still using `answersByTopicAndCategory`)

---

## 🐛 Troubleshooting

### Issue: "Loading question..." never disappears

**Solution:** Check browser console for errors. Verify:

- Supabase URL/Key are correct
- Table names match exactly
- RLS policies allow SELECT for authenticated users

### Issue: Shows "Category question not found"

**Solution:**

- Verify question exists in database with exact IDs
- Check SQL: `SELECT * FROM tugonsense_questions WHERE topic_id = ? AND category_id = ? AND question_id = ?`

### Issue: MathLive doesn't render

**Solution:**

- Ensure `category_text` contains valid LaTeX
- Check `convertToLatex()` function is working
- Verify MathLive library is loaded

---

## 📝 Summary

**Before:**

- CategoryQuestion used `defaultTopics` from hardcoded files
- Data was static and required code changes to update

**After:**

- CategoryQuestion fetches from Supabase `tugonsense_categories` and `tugonsense_questions` tables
- Data is dynamic and can be updated in database
- Graceful fallback to hardcoded data if database fails
- Loading and error states provide better UX

**Result:**
✅ Complete integration of Supabase data for question display
✅ ProgressMap → TugonSense → TugonPlay → CategoryQuestion flow working
✅ Database-driven content with fallback safety net
