# Integration: Supabase Categories & Questions

## Overview

This document explains how **ProgressMap** now displays stages (categories) and questions directly from **Supabase database** instead of hardcoded TypeScript files.

---

## 🎯 What Changed

### Before (Hardcoded)

```typescript
// ❌ OLD: Used hardcoded data from TypeScript files
import { defaultTopics } from "../components/data/questions/index";

const levels = defaultTopics.map((topic) => ({
  // ... mapped from hardcoded files
}));
```

### After (Supabase)

```typescript
// ✅ NEW: Fetches from Supabase database
import { fetchTopicsWithCategoriesAndQuestions } from "../lib/supabaseCategories";

const supabaseTopics = await fetchTopicsWithCategoriesAndQuestions();
const levels = supabaseTopics.map((topic) => ({
  // ... mapped from database
}));
```

---

## 📋 Database Schema Used

### 1. **tugonsense_topics**

```sql
- id (integer, PK)
- name (text)
- description (text)
```

### 2. **tugonsense_categories**

```sql
- id (bigserial, PK)
- topic_id (integer, FK → tugonsense_topics.id)
- category_id (integer)
- title (text)
- category_question (text)
- UNIQUE(topic_id, category_id)
```

### 3. **tugonsense_questions**

```sql
- id (bigserial, PK)
- topic_id (integer)
- category_id (integer)
- question_id (integer)
- category_text (text)
- question_text (text)
- question_type (enum: 'step-by-step' | 'direct' | 'multiple-choice')
- guide_text (text)
- answer_type (enum: 'multiLine' | 'singleLine')
- UNIQUE(topic_id, category_id, question_id)
- FK → tugonsense_categories(topic_id, category_id)
```

---

## 🔧 Implementation Details

### New File: `src/lib/supabaseCategories.ts`

This service handles all database queries for topics, categories, and questions.

#### Key Functions:

```typescript
// 1. Main function - fetches everything
fetchTopicsWithCategoriesAndQuestions(): Promise<SupabaseTopic[]>

// 2. Get categories for specific topic
fetchCategoriesByTopic(topicId: number): Promise<SupabaseCategory[]>

// 3. Get questions for specific category
fetchQuestionsByCategory(topicId: number, categoryId: number): Promise<SupabaseQuestion[]>

// 4. Get single question
fetchQuestion(topicId: number, categoryId: number, questionId: number): Promise<SupabaseQuestion | null>

// 5. Conversion helpers (for backward compatibility)
convertToLegacyTopicFormat(topic: SupabaseTopic)
convertToLegacyCategoryFormat(category: SupabaseCategory)
convertToLegacyQuestionFormat(question: SupabaseQuestion)
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  tugonsense_topics                                   │   │
│  │  - id: 1, name: "Functions"                         │   │
│  │  - id: 2, name: "Algebra"                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                       ↓                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  tugonsense_categories                               │   │
│  │  - topic_id: 1, category_id: 1, title: "Evaluation" │   │
│  │  - topic_id: 1, category_id: 2, title: "Graphing"   │   │
│  └─────────────────────────────────────────────────────┘   │
│                       ↓                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  tugonsense_questions                                │   │
│  │  - topic_id: 1, category_id: 1, question_id: 1      │   │
│  │  - topic_id: 1, category_id: 1, question_id: 2      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         supabaseCategories.ts Service Layer                 │
│  - fetchTopicsWithCategoriesAndQuestions()                  │
│  - Groups questions by category                             │
│  - Groups categories by topic                               │
│  - Converts to legacy format                                │
└─────────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  ProgressMap Component                      │
│  - Displays topics as "Levels"                              │
│  - Displays categories as "Stages"                          │
│  - Displays questions within each stage                     │
│  - Tracks progress with hybridProgressService               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 ProgressMap Updates

### 1. **New State Variables**

```typescript
const [supabaseTopics, setSupabaseTopics] = useState<any[]>([]);
const [topicsLoading, setTopicsLoading] = useState(true);
const [topicsError, setTopicsError] = useState<string | null>(null);
```

### 2. **Load Topics on Mount**

```typescript
useEffect(() => {
  const loadTopics = async () => {
    try {
      const topics = await fetchTopicsWithCategoriesAndQuestions();

      if (topics && topics.length > 0) {
        const legacyTopics = topics.map(convertToLegacyTopicFormat);
        setSupabaseTopics(legacyTopics);
      } else {
        // Fallback to hardcoded if database is empty
        setSupabaseTopics(defaultTopics);
      }
    } catch (error) {
      console.error("Error loading topics:", error);
      setSupabaseTopics(defaultTopics); // Fallback on error
    } finally {
      setTopicsLoading(false);
    }
  };

  loadTopics();
}, []);
```

### 3. **Use Supabase Topics in Levels**

```typescript
const levels: Level[] = useMemo(() => {
  // ✅ Use Supabase topics instead of hardcoded
  const topicsToUse =
    supabaseTopics.length > 0 ? supabaseTopics : defaultTopics;

  return topicsToUse.map((topic) => ({
    id: topic.id,
    name: `Level ${topic.id}`,
    topic: topic.name,
    description: topic.description || "...",
    categories: topic.level.map((category) => ({
      categoryId: category.category_id,
      categoryName: category.category_question,
      categoryTitle: category.title,
      questions: category.given_question.map((question) => ({
        questionId: question.question_id,
        questionText: question.question_text,
        // ... progress data
      })),
    })),
  }));
}, [userProgress, supabaseTopics]); // ✨ Added supabaseTopics dependency
```

### 4. **Updated Loading State**

```typescript
// Show loading when either topics or progress is loading
if (isLoading || topicsLoading) {
  return (
    <LoadingSpinner
      message={topicsLoading ? "Loading Topics..." : "Loading Progress..."}
    />
  );
}
```

---

## 🎮 Button Behavior: Start Stage

### The Button

```tsx
<button
  onClick={async () => {
    const nextQuestionId = await getNextQuestionId(
      currentLevel.id,
      category.categoryId
    );
    onStartStage?.(currentLevel.id, category.categoryId, nextQuestionId);
  }}
>
  {isCompleted
    ? "Review Stage"
    : hasProgress
    ? "Continue Stage"
    : "Start Stage"}
</button>
```

### What Happens When Clicked:

1. **Get Next Question**

   ```typescript
   const nextQuestionId = await getNextQuestionId(
     currentLevel.id,
     category.categoryId
   );
   ```

   - Fetches from **hybridProgressService** (localStorage or Supabase)
   - Finds first incomplete question
   - Returns question ID from **database** (not hardcoded)

2. **Call onStartStage Callback**
   ```typescript
   onStartStage?.(topicId, categoryId, nextQuestionId);
   ```
   - This callback is passed from parent component (likely TugonSense)
   - Parent component loads the **actual question data from Supabase**

### How Parent Should Handle It:

```typescript
// In TugonSense.tsx or parent component
const handleStartStage = async (
  topicId: number,
  categoryId: number,
  questionId: number
) => {
  // ✅ Fetch question from Supabase
  const question = await fetchQuestion(topicId, categoryId, questionId);

  if (question) {
    // Load question into TugonPlay or question component
    setCurrentQuestion(question);
    navigate("/play");
  }
};

<ProgressMap
  onStartStage={handleStartStage}
  // ... other props
/>;
```

---

## ✅ Benefits

### 1. **Dynamic Content**

- ✅ Add/edit questions in Supabase → Instantly reflects in UI
- ✅ No code changes needed for content updates
- ✅ Non-technical users can manage questions via Supabase dashboard

### 2. **Centralized Data**

- ✅ Single source of truth (database)
- ✅ No sync issues between files
- ✅ Easier to maintain and scale

### 3. **Backward Compatible**

- ✅ Falls back to hardcoded data if Supabase fails
- ✅ Converts database format to legacy format
- ✅ Existing code continues to work

### 4. **Progress Tracking Works**

- ✅ `hybridProgressService` uses (topic_id, category_id, question_id) composite keys
- ✅ Matches database schema perfectly
- ✅ No changes needed to progress tracking

---

## 🔍 Debugging Tips

### Check if Supabase data is loading:

```typescript
console.log("Supabase Topics:", supabaseTopics);
console.log("Topics Loading:", topicsLoading);
console.log("Topics Error:", topicsError);
```

### Check data structure:

```typescript
console.log(
  "Topics structure:",
  supabaseTopics.map((t) => ({
    id: t.id,
    name: t.name,
    categoriesCount: t.level?.length || 0,
    totalQuestions:
      t.level?.reduce((sum, c) => sum + (c.given_question?.length || 0), 0) ||
      0,
  }))
);
```

### Check button click data:

```typescript
const nextQuestionId = await getNextQuestionId(
  currentLevel.id,
  category.categoryId
);
console.log("Next Question ID:", nextQuestionId);
console.log("Current Level:", currentLevel);
console.log("Category:", category);
```

---

## 🚀 Next Steps

### 1. **Update TugonSense to fetch questions from Supabase**

- Currently TugonSense may still use hardcoded data
- Update to use `fetchQuestion()` function

### 2. **Update TugonPlay to use Supabase questions**

- Load question data dynamically
- Fetch answer steps from `tugonsense_answer_steps` table

### 3. **Test end-to-end flow**

- Click "Start Stage" button
- Verify correct question loads from database
- Verify progress tracking still works

---

## 📊 Data Mapping

### Database → ProgressMap

| Database Column              | ProgressMap Field        | Description            |
| ---------------------------- | ------------------------ | ---------------------- |
| `topic.id`                   | `level.id`               | Topic/Level identifier |
| `topic.name`                 | `level.topic`            | Topic name             |
| `topic.description`          | `level.description`      | Topic description      |
| `category.category_id`       | `category.categoryId`    | Stage number           |
| `category.title`             | `category.categoryTitle` | Stage title            |
| `category.category_question` | `category.categoryName`  | Stage description      |
| `question.question_id`       | `question.questionId`    | Question number        |
| `question.question_text`     | `question.questionText`  | Question text          |

---

## ⚠️ Important Notes

### 1. **Composite Keys**

- Always use `(topic_id, category_id, question_id)` together
- These match your database constraints
- Progress tracking uses the same keys

### 2. **Fallback Strategy**

```typescript
// Always has fallback to hardcoded data
const topicsToUse = supabaseTopics.length > 0 ? supabaseTopics : defaultTopics;
```

### 3. **Progress Compatibility**

- `hybridProgressService` works with both localStorage and Supabase
- Uses same composite key structure
- No changes needed to progress tracking

### 4. **Answer Steps**

- Not yet integrated (separate table: `tugonsense_answer_steps`)
- Will be added in next phase

---

## 🎉 Summary

✅ **ProgressMap now displays categories from Supabase**  
✅ **Questions come from database, not hardcoded files**  
✅ **Button clicks use database IDs**  
✅ **Fallback to hardcoded data if database fails**  
✅ **Progress tracking compatible with new structure**

**Next:** Update parent components to fetch question content from Supabase when user clicks "Start Stage"
