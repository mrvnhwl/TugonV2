# 🐛 DIAGNOSIS: Why Supabase Answers Are NOT Being Used

## 🔍 Root Cause Found!

**The issue:** Even though we integrated Supabase in `AnswerWizard.tsx`, the system is **STILL using hardcoded answers** from `src/components/data/answers/index.ts`!

---

## 📊 The Problem Chain

### 1️⃣ TugonPlay.tsx (LINE 8)

```typescript
import {
  getAnswerForQuestion,
  answersByTopicAndCategory,
} from "../../components/data/answers/index";
//                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ HARDCODED ANSWERS!
```

### 2️⃣ TugonPlay.tsx (LINES 123-134)

```typescript
const expectedAnswers = useMemo(() => {
  const topic =
    answersByTopicAndCategory[
      topicId as keyof typeof answersByTopicAndCategory
    ];
  //            ^^^^^^^^^^^^^^^^^^^^^^^^^ ⚠️ USING HARDCODED ANSWERS!
  if (!topic) return undefined;

  const category = topic[finalCategoryId as keyof typeof topic];
  if (!category || !Array.isArray(category)) return undefined;

  // Find the specific question by questionId
  const specificAnswer = category.find(
    (answer) => answer.questionId === questionId
  );
  return specificAnswer ? [specificAnswer] : undefined;
}, [topicId, finalCategoryId, questionId]);
```

**Result:** `expectedAnswers` contains hardcoded data from `answers/index.ts`!

### 3️⃣ TugonPlay.tsx (LINE 615)

```typescript
<QuestionTemplate
  key={`mobile-template-${topicId}-${finalCategoryId}-${questionId}`}
  topicId={topicId}
  categoryId={finalCategoryId}
  questionId={questionId}
  expectedAnswers={expectedAnswers} // ⚠️ Passing hardcoded answers!
  onValidationResult={...}
  onSubmit={handleSubmit}
  ...
/>
```

### 4️⃣ QuestionTemplate.tsx (LINE 96)

```typescript
<AnswerWizard
  key={`step-by-step-${topicId}-${categoryId}-${questionId}`}
  topicId={topicId}
  categoryId={categoryId}
  questionId={questionId}
  steps={[]}
  expectedAnswers={expectedAnswers} // ⚠️ Prop override from hardcoded data!
  onValidationResult={onValidationResult}
  onSubmit={onSubmit}
  ...
/>
```

### 5️⃣ AnswerWizard.tsx (LINES 112-117)

```typescript
useEffect(() => {
  const loadAnswerSteps = async () => {
    // Priority 1: Use provided expectedAnswers prop
    if (expectedAnswers && expectedAnswers.length > 0) {
      console.log("📝 Using provided expectedAnswers prop"); // ← THIS IS TRIGGERED!
      setAnswersSource(expectedAnswers); // ← Using hardcoded data!
      setAnswersLoading(false);
      return; // ← EXITS EARLY, NEVER REACHES SUPABASE CODE!
    }

    // Priority 2: Fetch from Supabase (NEVER REACHED!)
    if (topicId && categoryId && questionId) {
      // ... Supabase code here ...
    }
  };
}, [topicId, categoryId, questionId, expectedAnswers]);
```

---

## 🎯 Why Console Doesn't Show Supabase Message

You're looking for:

```javascript
✅ Loaded answer steps from Supabase: {...}
```

**But you never see it because:**

1. `TugonPlay.tsx` passes `expectedAnswers` prop with hardcoded data
2. `AnswerWizard.tsx` checks `if (expectedAnswers && expectedAnswers.length > 0)` **FIRST**
3. It finds hardcoded data, prints `📝 Using provided expectedAnswers prop`
4. **Returns early** - never reaches Supabase fetch code!

---

## 🔄 The Data Flow (Current - Broken)

```
TugonPlay.tsx
    ↓
answersByTopicAndCategory (hardcoded from answers/index.ts)
    ↓
expectedAnswers = useMemo(() => get from hardcoded)
    ↓
<QuestionTemplate expectedAnswers={expectedAnswers} />
    ↓
<AnswerWizard expectedAnswers={expectedAnswers} />
    ↓
useEffect sees expectedAnswers prop
    ↓
📝 Using provided expectedAnswers prop
    ↓
setAnswersSource(expectedAnswers) ← HARDCODED DATA!
    ↓
NEVER REACHES SUPABASE CODE ❌
```

---

## ✅ The Fix

**Option 1: Remove expectedAnswers prop (Recommended)**

Remove the prop passing chain so AnswerWizard fetches from Supabase:

### File 1: TugonPlay.tsx

```typescript
// REMOVE this import:
// import { getAnswerForQuestion, answersByTopicAndCategory } from "../../components/data/answers/index";

// REMOVE this useMemo:
// const expectedAnswers = useMemo(() => { ... }, [...]);

// CHANGE this:
<QuestionTemplate
  key={`mobile-template-${topicId}-${finalCategoryId}-${questionId}`}
  topicId={topicId}
  categoryId={finalCategoryId}
  questionId={questionId}
  // expectedAnswers={expectedAnswers} ← REMOVE THIS LINE!
  onValidationResult={...}
  onSubmit={handleSubmit}
  onIndexChange={handleIndexChange}
  onAnswerChange={resetIdle}
  onAttemptUpdate={handleAttemptUpdate}
/>
```

### File 2: QuestionTemplate.tsx

```typescript
interface QuestionTemplateProps {
  topicId: number;
  categoryId: number;
  questionId: number;
  onValidationResult: (
    type: "correct" | "incorrect" | "partial",
    currentStep: number
  ) => void;
  onAnswerChange?: () => void;
  onSubmit: (finalSteps: WizardStep[], validationResult?: any) => void;
  onIndexChange: (index: number) => void;
  onAttemptUpdate?: (attempt: any) => void;
  // expectedAnswers: any; ← REMOVE THIS LINE!
}

export default function QuestionTemplate({
  topicId,
  categoryId,
  questionId,
  onValidationResult,
  // expectedAnswers, ← REMOVE THIS LINE!
  onSubmit,
  onIndexChange,
  onAnswerChange,
  onAttemptUpdate,
}: QuestionTemplateProps) {
  // ... rest of code ...

  return (
    <div className="p-4">
      <AnswerWizard
        key={`step-by-step-${topicId}-${categoryId}-${questionId}`}
        topicId={topicId}
        categoryId={categoryId}
        questionId={questionId}
        steps={[]}
        // expectedAnswers={expectedAnswers} ← REMOVE THIS LINE!
        onValidationResult={onValidationResult}
        onSubmit={onSubmit}
        onIndexChange={onIndexChange}
        onAnswerChange={onAnswerChange}
        onAttemptUpdate={onAttemptUpdate}
      />
    </div>
  );
}
```

---

## 🎯 After The Fix

### New Data Flow:

```
TugonPlay.tsx
    ↓
<QuestionTemplate topicId={2} categoryId={1} questionId={1} />
    ↓
<AnswerWizard topicId={2} categoryId={1} questionId={1} />
    ↓
useEffect runs
    ↓
NO expectedAnswers prop!
    ↓
🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
    ↓
fetchAnswerSteps(2, 1, 1)
    ↓
Supabase query to tugonsense_answer_steps table
    ↓
✅ Loaded answer steps from Supabase: {questionId: 1, steps: Array(3)}
    ↓
setAnswersSource([{ questionId: 1, steps: [...] }])
    ↓
answersSource[0].steps → UserInput expectedSteps prop
    ↓
VALIDATION USES SUPABASE DATA! ✅
```

### Console Messages You'll See:

```javascript
🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
✅ Loaded answer steps from Supabase: {
  questionId: 1,
  questionText: "Question 1",
  type: "multiLine",
  steps: [
    { label: "substitution", answer: ["f(5) = 2(5) + 3", "f(5)=2(5)+3"], placeholder: "..." },
    { label: "simplification", answer: ["f(5) = 10 + 3", "f(5)=10+3"], placeholder: "..." },
    { label: "final", answer: ["13", "f(5) = 13"], placeholder: "..." }
  ]
}
```

---

## 🧪 Testing After Fix

1. **Make the changes** above
2. **Restart dev server**
3. **Open browser console** (F12)
4. **Navigate to a question**
5. **Look for:** `✅ Loaded answer steps from Supabase`
6. **Verify:** Validation now uses database data!

---

## 📝 Summary

**Problem:** `expectedAnswers` prop from hardcoded files was overriding Supabase fetch

**Solution:** Remove `expectedAnswers` prop chain completely

**Files to modify:**

1. ✅ `src/pages/reviewer/TugonPlay.tsx` - Remove import, useMemo, and prop
2. ✅ `src/components/tugon/template/QuestionTemplate.tsx` - Remove prop from interface and component

**Result:** AnswerWizard will fetch from Supabase as designed! 🎉
