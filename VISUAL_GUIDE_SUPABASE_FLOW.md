# Visual Guide: From Database to Display

## 🎯 Complete Flow Visualization

### 1. Database Structure

```
tugonsense_topics                    tugonsense_categories                tugonsense_questions
┌──────────────────┐                ┌────────────────────────┐           ┌───────────────────────────┐
│ id: 1            │◄───────────────│ topic_id: 1            │◄──────────│ topic_id: 1               │
│ name: "Functions"│                │ category_id: 1         │           │ category_id: 1            │
│ description: ... │                │ title: "EVALUATION"    │           │ question_id: 1            │
└──────────────────┘                │ category_question: ... │           │ question_text: "f(8)"     │
                                    └────────────────────────┘           │ question_type: "step..."  │
                                                                          └───────────────────────────┘
```

### 2. Fetch from Database

```typescript
// supabaseCategories.ts
fetchTopicsWithCategoriesAndQuestions()
  ↓
┌─────────────────────────────────────────────────────┐
│ Returns:                                            │
│ [                                                   │
│   {                                                 │
│     id: 1,                                         │
│     name: "Functions",                             │
│     categories: [                                  │
│       {                                            │
│         topic_id: 1,                              │
│         category_id: 1,                           │
│         title: "EVALUATION STAGE",                │
│         questions: [                               │
│           { question_id: 1, question_text: "..." },│
│           { question_id: 2, question_text: "..." } │
│         ]                                          │
│       }                                            │
│     ]                                              │
│   }                                                │
│ ]                                                  │
└─────────────────────────────────────────────────────┘
```

### 3. Display in ProgressMap

```
┌────────────────────────────────────────────────────────┐
│              📚 PROGRESS MAP                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Level 1: Introduction to Functions                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Progress: ████████░░░░░░░░░░░░░░░░ 40%              │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🎯 Stage 1: EVALUATION STAGE                   │  │
│  │                                                 │  │
│  │ Provide Complete Solution, Given:              │  │
│  │                                                 │  │
│  │ Progress: ██████████░░░░░░░░ 50%               │  │
│  │ 2 of 4 questions correct                       │  │
│  │                                                 │  │
│  │ ┌─────────────────────────────────────┐       │  │
│  │ │ 1️⃣ Question 1: evaluate using f(8) │       │  │
│  │ │    NEXT UP • 3 attempts             │       │  │
│  │ └─────────────────────────────────────┘       │  │
│  │                                                 │  │
│  │ [Start Stage] ←── BUTTON CLICK                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4. Button Click Handler

```typescript
// When user clicks "Start Stage"
<button
  onClick={async () => {
    // 1. Get next question ID from progress
    const nextQuestionId = await getNextQuestionId(1, 1); // Returns: 2

    // 2. Call parent callback
    onStartStage?.(1, 1, 2); // topicId, categoryId, questionId
  }}
>
  Start Stage
</button>
```

### 5. Parent Component Handler

```typescript
// TugonSense.tsx or parent
const handleStartStage = async (topicId, categoryId, questionId) => {
  // Fetch from Supabase
  const question = await fetchQuestion(topicId, categoryId, questionId);

  // question = {
  //   topic_id: 1,
  //   category_id: 1,
  //   question_id: 2,
  //   question_text: "Find g(4)",
  //   category_text: "g(x) = x² + 2x + 1",
  //   question_type: "step-by-step",
  //   guide_text: "Replace x with 4.",
  // }

  // Load into question player
  setCurrentQuestion(question);
  navigate("/play");
};
```

### 6. Question Display

```
┌────────────────────────────────────────────────────────┐
│              🎮 TUGON PLAY                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Topic 1 › Stage 1 › Question 2                       │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ Given:                                          │  │
│  │ g(x) = x² + 2x + 1                             │  │
│  │                                                 │  │
│  │ Find g(4)                                       │  │
│  │                                                 │  │
│  │ 💡 Hint: Replace x with 4.                     │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Your Answer:                                          │
│  ┌────────────────────────────────────────────────┐  │
│  │ [Type your solution here...]                   │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  [Submit Answer]                                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Data Flow

```
USER ACTION                     DATA SOURCE              COMPONENT STATE
─────────────────────────────────────────────────────────────────────────

1. Open ProgressMap
                                ↓
                           [Supabase DB]
                          Fetch all topics
                      Fetch all categories
                      Fetch all questions
                                ↓
                         [supabaseCategories.ts]
                    fetchTopicsWithCategoriesAndQuestions()
                                ↓
                         [ProgressMap.tsx]
                      setSupabaseTopics([...])
                                ↓
                         Display: Levels & Stages
─────────────────────────────────────────────────────────────────────────

2. Click "Start Stage"
                                ↓
                       [hybridProgressService]
                      getNextQuestionId(1, 1)
                   Returns: nextQuestionId = 2
                                ↓
                      onStartStage(1, 1, 2)
                                ↓
                       [Parent Component]
                    handleStartStage(1, 1, 2)
                                ↓
                           [Supabase DB]
                     SELECT * FROM questions
                     WHERE topic_id = 1
                       AND category_id = 1
                       AND question_id = 2
                                ↓
                         [supabaseCategories.ts]
                        fetchQuestion(1, 1, 2)
                                ↓
                        Returns: Question object
                                ↓
                       [Parent Component]
                     setCurrentQuestion({...})
                        navigate('/play')
                                ↓
                         [TugonPlay.tsx]
                      Display: Question content
─────────────────────────────────────────────────────────────────────────

3. Answer Question
                                ↓
                       [hybridProgressService]
                    recordAttempt(1, 1, 2, {...})
                                ↓
                      [Supabase DB or localStorage]
                    Update: user_question_progress
                                ↓
                         [ProgressMap]
                      Refresh: Progress stats
                                ↓
                    Display: Updated progress bars
```

---

## 🎨 Visual Comparison

### Before (Hardcoded)

```
TypeScript Files          ProgressMap           Display
────────────────────────────────────────────────────────
category1.ts  ─────►     defaultTopics  ────►  Stages
category2.ts  ─────►     (hardcoded)    ────►  Questions
category3.ts  ─────►
     ⚠️ Static
     ⚠️ Needs code changes to update content
```

### After (Supabase)

```
Supabase Database        Service Layer        ProgressMap        Display
────────────────────────────────────────────────────────────────────────
topics table    ─────►  supabaseCategories  ─────►  levels    ─────►  Stages
categories table ─────►  .fetchTopics()     ─────►  categories ────►  Questions
questions table  ─────►  .convertToLegacy() ─────►             ────►
     ✅ Dynamic
     ✅ Update via Supabase dashboard (no code changes!)
     ✅ Single source of truth
```

---

## 📊 State Management

### ProgressMap State:

```typescript
┌─────────────────────────────────────────────┐
│ Component State                             │
├─────────────────────────────────────────────┤
│ supabaseTopics: [...] ← From database      │
│ userProgress: {...}   ← From hybridService │
│ topicsLoading: false  ← Loading indicator  │
│ topicsError: null     ← Error handling     │
│ levels: [...]         ← Computed from above│
└─────────────────────────────────────────────┘
```

### Data Dependencies:

```
supabaseTopics + userProgress
        ↓
   useMemo(() => {
     // Compute levels with progress
     return topicsToUse.map(...)
   }, [supabaseTopics, userProgress])
        ↓
    levels: Level[]
        ↓
   Render UI
```

---

## 🚀 Quick Reference

### To Display Stages:

```typescript
// ✅ Already works!
// ProgressMap fetches from Supabase automatically
<ProgressMap onStartStage={handleStartStage} />
```

### To Get Question Data:

```typescript
import { fetchQuestion } from "../lib/supabaseCategories";

const question = await fetchQuestion(topicId, categoryId, questionId);
```

### To Get All Category Questions:

```typescript
import { fetchQuestionsByCategory } from "../lib/supabaseCategories";

const questions = await fetchQuestionsByCategory(topicId, categoryId);
```

### To Check Question Count:

```typescript
import { getQuestionCount } from "../lib/supabaseCategories";

const count = await getQuestionCount(topicId, categoryId);
```

---

## ✅ Checklist

### Setup:

- ✅ `supabaseCategories.ts` created
- ✅ `ProgressMap.tsx` updated
- ✅ Documentation created

### Your Tasks:

- [ ] Populate Supabase database (see `GUIDE_POPULATE_SUPABASE.md`)
- [ ] Update parent component to use `fetchQuestion()`
- [ ] Test "Start Stage" button loads from database
- [ ] Verify progress tracking works
- [ ] (Optional) Remove hardcoded fallback

---

## 🎯 Key Takeaways

1. **ProgressMap displays database data automatically** ✅
2. **Button passes correct IDs from database** ✅
3. **Parent component needs to fetch question content** ⏳
4. **Progress tracking uses same composite keys** ✅
5. **Fallback to hardcoded data if database empty** ✅

---

## 📞 Need Help?

Check these files:

- `SUMMARY_SUPABASE_CATEGORIES.md` - Complete summary
- `INTEGRATION_SUPABASE_CATEGORIES.md` - Detailed integration guide
- `GUIDE_POPULATE_SUPABASE.md` - How to add data to database

Debug checklist:

1. Check browser console for errors
2. Verify data exists in Supabase dashboard
3. Check RLS policies allow SELECT
4. Test queries in Supabase SQL Editor
5. Check network tab for API calls
