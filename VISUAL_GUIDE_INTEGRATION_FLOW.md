# 🎨 Visual Guide: Complete Supabase Integration Flow

## 📋 Table of Contents

1. [Complete User Journey](#complete-user-journey)
2. [Database Structure](#database-structure)
3. [Code Architecture](#code-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)

---

## 🚀 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER OPENS PROGRESSMAP                          │
│                         /tugonsense                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  PROGRESSMAP COMPONENT MOUNTS                                           │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ useEffect(() => {                                                 │ │
│  │   const topics = await fetchTopicsWithCategoriesAndQuestions();   │ │
│  │   setSupabaseTopics(topics);                                      │ │
│  │ }, []);                                                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  FETCH FROM SUPABASE                                                    │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │ Topics Table │  │ Categories Table │  │ Questions Table         │  │
│  ├──────────────┤  ├──────────────────┤  ├─────────────────────────┤  │
│  │ id           │  │ topic_id         │  │ topic_id                │  │
│  │ name         │  │ category_id      │  │ category_id             │  │
│  │ description  │  │ category_question│  │ question_id             │  │
│  └──────────────┘  │ title            │  │ category_text           │  │
│                    └──────────────────┘  │ question_text           │  │
│                                          │ question_type           │  │
│                                          │ answer_type             │  │
│                                          └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  DISPLAY IN PROGRESSMAP UI                                              │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 📚 Level 1: Basic Algebra                                         │ │
│  │ ┌─────────────────────────────────────────────────────────────┐   │ │
│  │ │ 🎯 Category 1: Linear Equations                            │   │ │
│  │ │    Questions: 3    Completed: 0                            │   │ │
│  │ │    ┌─────────────────────┐                                 │   │ │
│  │ │    │  START STAGE  ✨    │  ← User clicks here            │   │ │
│  │ │    └─────────────────────┘                                 │   │ │
│  │ └─────────────────────────────────────────────────────────────┘   │ │
│  │ ┌─────────────────────────────────────────────────────────────┐   │ │
│  │ │ 🎯 Category 2: Quadratic Equations                         │   │ │
│  │ │    Questions: 5    Completed: 0                            │   │ │
│  │ └─────────────────────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  USER CLICKS "START STAGE" BUTTON                                       │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ onClick={() => {                                                  │ │
│  │   const questionId = await getNextQuestionId(topicId, categoryId);│ │
│  │   onStartStage(topicId, categoryId, questionId);                  │ │
│  │ }}                                                                 │ │
│  │                                                                    │ │
│  │ Example values:                                                    │ │
│  │   topicId: 1                                                       │ │
│  │   categoryId: 1                                                    │ │
│  │   questionId: 1                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  TUGONSENSE HANDLES START                                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ const handleStartStage = (topicId, categoryId, questionId) => {   │ │
│  │   navigate(`/tugonplay?topic=${topicId}                           │ │
│  │                        &category=${categoryId}                     │ │
│  │                        &question=${questionId}`);                  │ │
│  │ }                                                                  │ │
│  │                                                                    │ │
│  │ Navigates to: /tugonplay?topic=1&category=1&question=1            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  TUGONPLAY PAGE LOADS                                                   │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ const [searchParams] = useSearchParams();                         │ │
│  │ const topicId = Number(searchParams.get("topic")) || 1;           │ │
│  │ const categoryId = Number(searchParams.get("category")) || 1;     │ │
│  │ const questionId = Number(searchParams.get("question")) || 1;     │ │
│  │                                                                    │ │
│  │ Extracted values:                                                  │ │
│  │   topicId = 1                                                      │ │
│  │   categoryId = 1                                                   │ │
│  │   questionId = 1                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  CATEGORYQUESTION COMPONENT RENDERS                                     │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ <CategoryQuestion                                                 │ │
│  │   topicId={1}                                                      │ │
│  │   categoryId={1}                                                   │ │
│  │   questionId={1}                                                   │ │
│  │ />                                                                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  CATEGORYQUESTION FETCHES DATA                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ useEffect(() => {                                                 │ │
│  │   const data = await fetchCategoryQuestionData(1, 1, 1);          │ │
│  │   setCategoryQuestion(data.categoryQuestion);                      │ │
│  │   setCategoryText(data.categoryText);                             │ │
│  │   setQuestionText(data.questionText);                             │ │
│  │ }, [topicId, categoryId, questionId]);                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  FETCH FROM SUPABASE (2 QUERIES)                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Query 1: GET CATEGORY INFO                                        │ │
│  │ SELECT category_question                                          │ │
│  │ FROM tugonsense_categories                                        │ │
│  │ WHERE topic_id = 1 AND category_id = 1;                           │ │
│  │                                                                    │ │
│  │ Result: { category_question: "Solve for y:" }                     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ Query 2: GET QUESTION INFO                                        │ │
│  │ SELECT *                                                           │ │
│  │ FROM tugonsense_questions                                         │ │
│  │ WHERE topic_id = 1                                                 │ │
│  │   AND category_id = 1                                              │ │
│  │   AND question_id = 1;                                             │ │
│  │                                                                    │ │
│  │ Result: {                                                          │ │
│  │   category_text: "2x + 3y = 12",                                  │ │
│  │   question_text: "Question 1",                                     │ │
│  │   question_type: "step-by-step",                                  │ │
│  │   answer_type: "multiLine"                                        │ │
│  │ }                                                                  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  DISPLAY QUESTION IN UI                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ┌─────────────────────────────────────────────────────────────┐   │ │
│  │ │                    TUGONPLAY SCREEN                         │   │ │
│  │ ├─────────────────────────────────────────────────────────────┤   │ │
│  │ │  Solve for y: Question 1                    ← Header        │   │ │
│  │ ├─────────────────────────────────────────────────────────────┤   │ │
│  │ │                                                             │   │ │
│  │ │                  2x + 3y = 12               ← Main Question │   │ │
│  │ │                                                             │   │ │
│  │ │              (Rendered as LaTeX)                            │   │ │
│  │ ├─────────────────────────────────────────────────────────────┤   │ │
│  │ │                                                             │   │ │
│  │ │  [Answer Input Area]                                        │   │ │
│  │ │                                                             │   │ │
│  │ └─────────────────────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE SCHEMA                        │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│  tugonsense_topics        │
├───────────────────────────┤
│  id (PK)                  │  ← Topic 1, Topic 2, etc.
│  name                     │  ← "Basic Algebra"
│  description              │  ← "Fundamental algebraic concepts"
│  created_at               │
│  updated_at               │
└───────────────────────────┘
         │ 1
         │ has many
         ↓ ∞
┌───────────────────────────┐
│  tugonsense_categories    │
├───────────────────────────┤
│  topic_id (PK, FK) ───────┼──→ tugonsense_topics.id
│  category_id (PK)         │  ← Category 1, Category 2, etc.
│  category_question        │  ← "Solve for y:" 🌟 USED IN UI HEADER
│  title                    │  ← "Linear Equations"
│  created_at               │
│  updated_at               │
└───────────────────────────┘
         │ 1
         │ has many
         ↓ ∞
┌───────────────────────────┐
│  tugonsense_questions     │
├───────────────────────────┤
│  topic_id (PK, FK) ───────┼──→ tugonsense_categories.topic_id
│  category_id (PK, FK) ────┼──→ tugonsense_categories.category_id
│  question_id (PK)         │  ← Question 1, Question 2, etc.
│  category_text            │  ← "2x + 3y = 12" 🌟 MAIN QUESTION
│  question_text            │  ← "Question 1" 🌟 USED IN UI HEADER
│  question_type            │  ← 'step-by-step' | 'direct' | 'multiple-choice'
│  answer_type              │  ← 'multiLine' | 'singleLine'
│  guide_text               │
│  created_at               │
│  updated_at               │
└───────────────────────────┘
```

### Example Data Flow

```
Topic 1: Basic Algebra (id=1)
  ↓
  Category 1: Linear Equations (topic_id=1, category_id=1)
    category_question: "Solve for y:"
    ↓
    Question 1 (topic_id=1, category_id=1, question_id=1)
      category_text: "2x + 3y = 12"
      question_text: "Question 1"

    Question 2 (topic_id=1, category_id=1, question_id=2)
      category_text: "4x - y = 8"
      question_text: "Question 2"

  Category 2: Quadratic Equations (topic_id=1, category_id=2)
    category_question: "Find the roots:"
    ↓
    Question 1 (topic_id=1, category_id=2, question_id=1)
      category_text: "x² + 5x + 6 = 0"
      question_text: "Question 1"
```

---

## 🏗️ Code Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FILE STRUCTURE                              │
└─────────────────────────────────────────────────────────────────────┘

src/
├── lib/
│   ├── supabase.ts                    ← Supabase client setup
│   └── supabaseCategories.ts          ← 🆕 Service functions
│       ├── fetchTopicsWithCategoriesAndQuestions()
│       ├── fetchCategoriesByTopic(topicId)
│       ├── fetchQuestionsByCategory(topicId, categoryId)
│       ├── fetchQuestion(topicId, categoryId, questionId)
│       └── fetchCategoryQuestionData(topicId, categoryId, questionId) 🌟
│
├── pages/reviewer/
│   ├── TugonSense.tsx                 ← 🔄 Updated
│   │   └── handleStartStage(topicId, categoryId, questionId)
│   └── TugonPlay.tsx                  ← Receives URL params
│       └── <CategoryQuestion {...ids} />
│
└── components/
    ├── ProgressMap.tsx                ← 🔄 Updated
    │   ├── Fetches topics from Supabase
    │   └── "Start Stage" button passes IDs
    │
    └── tugon/question-system/
        └── CategoryQuestion.tsx       ← 🔄 Updated
            ├── Receives topicId, categoryId, questionId props
            ├── Fetches data via fetchCategoryQuestionData()
            └── Displays question UI
```

---

## 🔄 Data Flow Diagrams

### 1. Initial Page Load (ProgressMap)

```
┌──────────┐
│  User    │
│  Opens   │
│  /sense  │
└────┬─────┘
     │
     ↓
┌────────────────────────────────────┐
│  ProgressMap.tsx                   │
│  useEffect(() => {...}, [])        │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  supabaseCategories.ts             │
│  fetchTopicsWithCategories...()    │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  Supabase Database                 │
│  ├─ SELECT * FROM topics           │
│  ├─ SELECT * FROM categories       │
│  └─ SELECT * FROM questions        │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  Data Processing                   │
│  Group questions → categories      │
│  Group categories → topics         │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  ProgressMap.tsx                   │
│  setSupabaseTopics(data)           │
│  Display topics/categories/questions│
└────────────────────────────────────┘
```

### 2. User Clicks Start Button

```
┌──────────┐
│  User    │
│  Clicks  │
│  Start   │
└────┬─────┘
     │
     ↓
┌────────────────────────────────────┐
│  ProgressMap.tsx                   │
│  Get next question ID              │
│  onStartStage(1, 1, 1)             │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  TugonSense.tsx                    │
│  handleStartStage(1, 1, 1)         │
│  navigate('/tugonplay?...')        │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  TugonPlay.tsx                     │
│  Extract URL params                │
│  const topicId = 1                 │
│  const categoryId = 1              │
│  const questionId = 1              │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  CategoryQuestion.tsx              │
│  Receives props: {1, 1, 1}         │
└────────────────────────────────────┘
```

### 3. CategoryQuestion Fetches Data

```
┌────────────────────────────────────┐
│  CategoryQuestion.tsx              │
│  useEffect(() => {...}, [ids])     │
└────┬───────────────────────────────┘
     │
     ↓
┌────────────────────────────────────┐
│  supabaseCategories.ts             │
│  fetchCategoryQuestionData(1,1,1)  │
└────┬───────────────────────────────┘
     │
     ├─────────────────────────┬──────────────────────────┐
     │                         │                          │
     ↓                         ↓                          ↓
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Query 1         │  │ Query 2          │  │ Data Merge       │
│ GET category    │  │ GET question     │  │ Combine results  │
│ FROM categories │  │ FROM questions   │  │ Return object    │
└─────┬───────────┘  └────────┬─────────┘  └────────┬─────────┘
      │                       │                      │
      └───────────────────────┴──────────────────────┘
                              │
                              ↓
                ┌─────────────────────────────┐
                │ Return data: {              │
                │   categoryQuestion,         │
                │   categoryText,             │
                │   questionText,             │
                │   questionType,             │
                │   answerType                │
                │ }                           │
                └─────────────┬───────────────┘
                              │
                              ↓
                ┌─────────────────────────────┐
                │  CategoryQuestion.tsx       │
                │  setCategoryQuestion(...)   │
                │  setCategoryText(...)       │
                │  setQuestionText(...)       │
                └─────────────┬───────────────┘
                              │
                              ↓
                ┌─────────────────────────────┐
                │  UI Render                  │
                │  ┌─────────────────────┐    │
                │  │ Solve for y: Q1     │    │
                │  ├─────────────────────┤    │
                │  │   2x + 3y = 12      │    │
                │  └─────────────────────┘    │
                └─────────────────────────────┘
```

---

## 🎯 Key Integration Points

### Point 1: ProgressMap → Supabase

```typescript
// File: src/components/ProgressMap.tsx
useEffect(() => {
  const loadTopics = async () => {
    const topics = await fetchTopicsWithCategoriesAndQuestions();
    // ✅ Topics now from database, not hardcoded
    setSupabaseTopics(topics);
  };
  loadTopics();
}, []);
```

### Point 2: Button Click → Navigation

```typescript
// File: src/components/ProgressMap.tsx
const handleStartStage = async (topicId, categoryId) => {
  const questionId = await getNextQuestionId(topicId, categoryId);
  // ✅ Passes correct IDs from database
  onStartStage(topicId, categoryId, questionId);
};

// File: src/pages/reviewer/TugonSense.tsx
const handleStartStage = (topicId, categoryId, questionId) => {
  // ✅ Creates URL with database IDs
  navigate(
    `/tugonplay?topic=${topicId}&category=${categoryId}&question=${questionId}`
  );
};
```

### Point 3: URL Params → Component Props

```typescript
// File: src/pages/reviewer/TugonPlay.tsx
const topicId = Number(searchParams.get("topic")) || 1;
const categoryId = Number(searchParams.get("category")) || 1;
const questionId = Number(searchParams.get("question")) || 1;

// ✅ Props contain database IDs
<CategoryQuestion
  topicId={topicId}
  categoryId={categoryId}
  questionId={questionId}
/>;
```

### Point 4: Component → Supabase Query

```typescript
// File: src/components/tugon/question-system/CategoryQuestion.tsx
useEffect(() => {
  const loadQuestionData = async () => {
    // ✅ Fetches specific question from database
    const data = await fetchCategoryQuestionData(
      topicId,
      categoryId,
      questionId
    );
    setCategoryQuestion(data.categoryQuestion);
    setCategoryText(data.categoryText);
    setQuestionText(data.questionText);
  };
  loadQuestionData();
}, [topicId, categoryId, questionId]);
```

---

## ✅ Integration Complete!

All components are now connected and ready to use Supabase data.

**Next step:** Populate your database and test the complete flow!
