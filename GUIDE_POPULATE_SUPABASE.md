# Quick Guide: Populate Supabase Database

## Overview

This guide shows you how to insert your existing hardcoded question data into Supabase tables.

---

## 📋 Example: Convert category1.ts to Database Rows

### Your Current TypeScript File:

```typescript
// category1.ts
export const Topic1_Category1: Question = {
  category_id: 1,
  title: "EVALUATION STAGE",
  category_question: "Provide Complete Solution, Given:",
  given_question: [
    {
      question_id: 1,
      category_text: "f(x) = 2x - 7",
      question_text: "evaluate using f(8).",
      question_type: "step-by-step",
      guide_text: "Substitute 8 for x and solve.",
    },
    {
      question_id: 2,
      category_text: "g(x) = x² + 2x + 1",
      question_text: "Find g(4)",
      question_type: "step-by-step",
      guide_text: "Replace x with 4.",
    },
    {
      question_id: 3,
      category_text: "m(x) = 2x³ - x + 6",
      question_text: "Find m(2)",
      question_type: "step-by-step",
      guide_text: "Plug in -2 for x.",
    },
  ],
};
```

---

## 🔄 SQL to Insert This Data

### Step 1: Insert Topic (if not exists)

```sql
-- Insert Topic 1: Introduction to Functions
INSERT INTO tugonsense_topics (id, name, description)
VALUES (
  1,
  'Introduction to Functions',
  'Learn to wield important tools in number sense and computation.'
)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Insert Category

```sql
-- Insert Category 1 under Topic 1
INSERT INTO tugonsense_categories (topic_id, category_id, title, category_question)
VALUES (
  1,  -- topic_id
  1,  -- category_id
  'EVALUATION STAGE',  -- title
  'Provide Complete Solution, Given:'  -- category_question
)
ON CONFLICT (topic_id, category_id) DO NOTHING;
```

### Step 3: Insert Questions

```sql
-- Insert Question 1
INSERT INTO tugonsense_questions (
  topic_id,
  category_id,
  question_id,
  category_text,
  question_text,
  question_type,
  guide_text,
  answer_type
)
VALUES (
  1,  -- topic_id
  1,  -- category_id
  1,  -- question_id
  'f(x) = 2x - 7',  -- category_text
  'evaluate using f(8).',  -- question_text
  'step-by-step',  -- question_type (enum)
  'Substitute 8 for x and solve.',  -- guide_text
  'multiLine'  -- answer_type (default)
)
ON CONFLICT (topic_id, category_id, question_id) DO NOTHING;

-- Insert Question 2
INSERT INTO tugonsense_questions (
  topic_id,
  category_id,
  question_id,
  category_text,
  question_text,
  question_type,
  guide_text,
  answer_type
)
VALUES (
  1,
  1,
  2,
  'g(x) = x² + 2x + 1',
  'Find g(4)',
  'step-by-step',
  'Replace x with 4.',
  'multiLine'
)
ON CONFLICT (topic_id, category_id, question_id) DO NOTHING;

-- Insert Question 3
INSERT INTO tugonsense_questions (
  topic_id,
  category_id,
  question_id,
  category_text,
  question_text,
  question_type,
  guide_text,
  answer_type
)
VALUES (
  1,
  1,
  3,
  'm(x) = 2x³ - x + 6',
  'Find m(2)',
  'step-by-step',
  'Plug in -2 for x.',
  'multiLine'
)
ON CONFLICT (topic_id, category_id, question_id) DO NOTHING;
```

---

## 🚀 Complete Script Template

Here's a complete script you can copy and modify:

```sql
-- ==========================================
-- POPULATE SUPABASE DATABASE
-- Topic 1, Category 1: Evaluation Stage
-- ==========================================

-- 1. Insert Topic
INSERT INTO tugonsense_topics (id, name, description)
VALUES (
  1,
  'Introduction to Functions',
  'Learn to wield important tools in number sense and computation.'
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. Insert Category
INSERT INTO tugonsense_categories (topic_id, category_id, title, category_question)
VALUES (
  1,
  1,
  'EVALUATION STAGE',
  'Provide Complete Solution, Given:'
)
ON CONFLICT (topic_id, category_id) DO UPDATE
SET
  title = EXCLUDED.title,
  category_question = EXCLUDED.category_question;

-- 3. Insert Questions
INSERT INTO tugonsense_questions (
  topic_id, category_id, question_id,
  category_text, question_text, question_type, guide_text, answer_type
) VALUES
(1, 1, 1, 'f(x) = 2x - 7', 'evaluate using f(8).', 'step-by-step', 'Substitute 8 for x and solve.', 'multiLine'),
(1, 1, 2, 'g(x) = x² + 2x + 1', 'Find g(4)', 'step-by-step', 'Replace x with 4.', 'multiLine'),
(1, 1, 3, 'm(x) = 2x³ - x + 6', 'Find m(2)', 'step-by-step', 'Plug in -2 for x.', 'multiLine')
ON CONFLICT (topic_id, category_id, question_id) DO UPDATE
SET
  category_text = EXCLUDED.category_text,
  question_text = EXCLUDED.question_text,
  question_type = EXCLUDED.question_type,
  guide_text = EXCLUDED.guide_text,
  answer_type = EXCLUDED.answer_type;

-- Verify insertion
SELECT
  t.id as topic_id,
  t.name as topic_name,
  c.category_id,
  c.title as category_title,
  q.question_id,
  q.question_text
FROM tugonsense_topics t
JOIN tugonsense_categories c ON t.id = c.topic_id
JOIN tugonsense_questions q ON c.topic_id = q.topic_id AND c.category_id = q.category_id
WHERE t.id = 1 AND c.category_id = 1
ORDER BY q.question_id;
```

---

## 📝 How to Run This Script

### Option 1: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"+ New query"**
3. Paste the script above
4. Click **"Run"** (or press Ctrl+Enter)
5. Check the results table at the bottom

### Option 2: Using Supabase Client in Node.js

```typescript
import { supabase } from "./lib/supabaseClient";

async function populateDatabase() {
  // Insert topic
  const { error: topicError } = await supabase
    .from("tugonsense_topics")
    .upsert({ id: 1, name: "Introduction to Functions", description: "..." });

  // Insert category
  const { error: categoryError } = await supabase
    .from("tugonsense_categories")
    .upsert({
      topic_id: 1,
      category_id: 1,
      title: "EVALUATION STAGE",
      category_question: "...",
    });

  // Insert questions
  const { error: questionsError } = await supabase
    .from("tugonsense_questions")
    .upsert([
      {
        topic_id: 1,
        category_id: 1,
        question_id: 1,
        question_text: "..." /* ... */,
      },
      {
        topic_id: 1,
        category_id: 1,
        question_id: 2,
        question_text: "..." /* ... */,
      },
      {
        topic_id: 1,
        category_id: 1,
        question_id: 3,
        question_text: "..." /* ... */,
      },
    ]);

  console.log("Database populated!");
}
```

---

## 🔍 Verification Queries

### Check Topics

```sql
SELECT * FROM tugonsense_topics ORDER BY id;
```

### Check Categories for Topic 1

```sql
SELECT * FROM tugonsense_categories WHERE topic_id = 1 ORDER BY category_id;
```

### Check Questions for Category 1

```sql
SELECT * FROM tugonsense_questions
WHERE topic_id = 1 AND category_id = 1
ORDER BY question_id;
```

### Check Full Hierarchy

```sql
SELECT
  t.id as topic_id,
  t.name as topic_name,
  c.category_id,
  c.title as category_title,
  COUNT(q.id) as question_count
FROM tugonsense_topics t
LEFT JOIN tugonsense_categories c ON t.id = c.topic_id
LEFT JOIN tugonsense_questions q ON c.topic_id = q.topic_id AND c.category_id = q.category_id
GROUP BY t.id, t.name, c.category_id, c.title
ORDER BY t.id, c.category_id;
```

---

## 🎯 Bulk Import Strategy

### For Multiple Categories:

Create a script that loops through all your TypeScript files:

```typescript
// scripts/importToSupabase.ts
import { supabase } from "../src/lib/supabaseClient";
import { Topic1_Category1 } from "../src/components/data/questions/topic1/category1";
import { Topic1_Category2 } from "../src/components/data/questions/topic1/category2";
// ... import all categories

const allCategories = [
  { topicId: 1, data: Topic1_Category1 },
  { topicId: 1, data: Topic1_Category2 },
  // ... add all categories
];

async function importAll() {
  for (const { topicId, data } of allCategories) {
    // Insert category
    await supabase.from("tugonsense_categories").upsert({
      topic_id: topicId,
      category_id: data.category_id,
      title: data.title,
      category_question: data.category_question,
    });

    // Insert questions
    const questions = data.given_question.map((q) => ({
      topic_id: topicId,
      category_id: data.category_id,
      question_id: q.question_id,
      category_text: q.category_text,
      question_text: q.question_text,
      question_type: q.question_type,
      guide_text: q.guide_text,
      answer_type: "multiLine",
    }));

    await supabase.from("tugonsense_questions").upsert(questions);

    console.log(`✅ Imported Topic ${topicId}, Category ${data.category_id}`);
  }
}

importAll().then(() => console.log("🎉 Import complete!"));
```

Run with:

```bash
npx tsx scripts/importToSupabase.ts
```

---

## ⚠️ Important Notes

### 1. **Enum Values**

Make sure `question_type` matches your database enum:

```sql
-- Check enum values
SELECT
  t.typname AS enum_type,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'question_type_enum';

-- Should return:
-- 'step-by-step'
-- 'direct'
-- 'multiple-choice'
```

### 2. **Composite Keys**

Always use `(topic_id, category_id, question_id)` together:

```sql
-- ✅ Good
WHERE topic_id = 1 AND category_id = 1 AND question_id = 1

-- ❌ Bad (might return multiple rows)
WHERE question_id = 1
```

### 3. **Foreign Key Constraints**

Insert in order:

1. **Topics first** (parent)
2. **Categories second** (child of topics)
3. **Questions last** (child of categories)

### 4. **RLS Policies**

If you have Row Level Security enabled:

- Make sure you're authenticated as a user
- Or temporarily disable RLS for data import:
  ```sql
  ALTER TABLE tugonsense_questions DISABLE ROW LEVEL SECURITY;
  -- Import data
  ALTER TABLE tugonsense_questions ENABLE ROW LEVEL SECURITY;
  ```

---

## 🎉 After Import

### Test in ProgressMap:

1. Refresh your app
2. Open ProgressMap
3. You should see:
   - ✅ Topics from database
   - ✅ Categories as "Stages"
   - ✅ Questions listed under each stage
   - ✅ "Start Stage" button works

### Debug Console Output:

Look for these logs:

```
🔄 Loading topics from Supabase...
✅ Fetched 1 topics
✅ Fetched 1 categories
✅ Fetched 3 questions
✅ Successfully structured topics with categories and questions
📊 Topics structure: [{ id: 1, name: 'Introduction to Functions', categoriesCount: 1, totalQuestions: 3 }]
✅ Loaded topics from Supabase: [...]
```

---

## 📚 Next Steps

1. ✅ **Populate database** with this script
2. ✅ **Verify data** with verification queries
3. ✅ **Test ProgressMap** displays correctly
4. ✅ **Update parent component** to fetch question content from Supabase
5. ✅ **Add answer steps** (separate table)

---

## 🔗 Related Files

- `src/lib/supabaseCategories.ts` - Service to fetch data
- `src/components/ProgressMap.tsx` - Displays data
- `INTEGRATION_SUPABASE_CATEGORIES.md` - Full integration docs
