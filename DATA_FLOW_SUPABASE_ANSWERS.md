# 🔄 Data Flow: Supabase Answers to Validation

## ❓ Your Questions Answered

### Q1: How do I know if the answer is currently being loaded by Supabase?

**Check the browser console!** Look for these log messages:

```javascript
// When loading starts:
🔄 Fetching answer steps from Supabase: Topic 2, Category 1, Question 1

// When successfully loaded:
✅ Loaded answer steps from Supabase: {questionId: 1, steps: [...]}

// If using provided prop instead:
📝 Using provided expectedAnswers prop

// If no steps found:
⚠️ No answer steps found

// If error occurs:
❌ Error loading answer steps: [error details]
```

**Visual Indicators:**

- **Loading State**: Spinner with "Loading answer steps..." message
- **Error State**: Red card with "Failed to load answer steps from database"
- **Success State**: Normal AnswerWizard UI appears

---

### Q2: Where is UserInput and UserInputValidator's expectedAnswers coming from?

Let me trace the complete data flow for you:

---

## 📊 Complete Data Flow

### Step 1: AnswerWizard Fetches from Supabase

**File:** `AnswerWizard.tsx` (Lines 109-170)

```typescript
// State to store fetched answers
const [answersSource, setAnswersSource] = useState<PredefinedAnswer[]>([]);
const [answersLoading, setAnswersLoading] = useState<boolean>(true);

// useEffect runs when component mounts or IDs change
useEffect(() => {
  const loadAnswerSteps = async () => {
    // Priority 1: Use prop if provided
    if (expectedAnswers && expectedAnswers.length > 0) {
      console.log("📝 Using provided expectedAnswers prop");
      setAnswersSource(expectedAnswers);
      return;
    }

    // Priority 2: Fetch from Supabase
    if (topicId && categoryId && questionId) {
      console.log(`🔄 Fetching answer steps from Supabase`);

      const steps = await getAnswerForQuestionHybrid(
        topicId,
        categoryId,
        questionId,
        getAnswerForQuestion // ⚠️ Fallback to hardcoded
      );

      if (steps && steps.length > 0) {
        const predefinedAnswer: PredefinedAnswer = {
          questionId: questionId,
          questionText: `Question ${questionId}`,
          type: "multiLine",
          steps: steps, // 👈 This is the answer array!
        };
        setAnswersSource([predefinedAnswer]);
        console.log("✅ Loaded answer steps from Supabase:", predefinedAnswer);
      }
    }
  };

  loadAnswerSteps();
}, [topicId, categoryId, questionId, expectedAnswers]);
```

**Result:** `answersSource` state now contains:

```typescript
[
  {
    questionId: 1,
    questionText: "Question 1",
    type: "multiLine",
    steps: [
      {
        label: "substitution",
        answer: ["f(5) = 2(5) + 3", "f(5)=2(5)+3"],
        placeholder: "...",
      },
      {
        label: "simplification",
        answer: ["f(5) = 10 + 3", "f(5)=10+3"],
        placeholder: "...",
      },
      { label: "final", answer: ["13", "f(5) = 13"], placeholder: "..." },
    ],
  },
];
```

---

### Step 2: AnswerWizard Extracts Expected Steps

**File:** `AnswerWizard.tsx` (Line 399)

```typescript
const handleInputChange = (lines: string[]) => {
  // 👇 Extract steps from answersSource for current index
  const expectedSteps = answersSource?.[index]?.steps;
  //                    ^^^^^^^^^^^^^ State from Supabase
  //                                   ^^^^^ Current question (usually 0)
  //                                          ^^^^^ Array of Step objects

  InputValidator.logValidation(lines, expectedSteps, index);
  // ... rest of input handling
};
```

**Result:** `expectedSteps` is now:

```typescript
[
  {
    label: "substitution",
    answer: ["f(5) = 2(5) + 3", "f(5)=2(5)+3"],
    placeholder: "...",
  },
  {
    label: "simplification",
    answer: ["f(5) = 10 + 3", "f(5)=10+3"],
    placeholder: "...",
  },
  { label: "final", answer: ["13", "f(5) = 13"], placeholder: "..." },
];
```

---

### Step 3: AnswerWizard Passes to UserInput Component

**File:** `AnswerWizard.tsx` (Line 591)

```typescript
<UserInput
  key={`user-input-${index}-${topicId}-${categoryId}-${questionId}`}
  value={answerLines}
  onChange={handleInputChange}
  expectedSteps={expectedSteps} // 👈 Passed as prop!
  //             ^^^^^^^^^^^^^^ From answersSource[index].steps
  onSubmit={handleEnterSubmission}
  topicId={topicId}
  categoryId={categoryId}
  questionId={questionId}
  // ... other props
/>
```

---

### Step 4: UserInput Receives Expected Steps

**File:** `UserInput.tsx` (Lines 73-102)

```typescript
export interface UserInputProps {
  // ... other props
  expectedSteps: Step[];  // 👈 Received from AnswerWizard!
  // ... other props
}

export default function UserInput({
  value = [''],
  onChange,
  expectedSteps,  // 👈 Available here!
  topicId,
  categoryId,
  questionId,
  onValidationResult,
  // ... other props
}: UserInputProps) {
  // UserInput now has access to expectedSteps from Supabase!
```

---

### Step 5: UserInput Uses Expected Steps for Validation

**File:** `UserInput.tsx` (Search for "expectedSteps" usage)

UserInput passes `expectedSteps` to **UserInputValidator**:

```typescript
// When user presses Enter or validation is triggered:
const result = UserInputValidator.validateStepSimple(
  currentStepIndex,
  userInputLines,
  expectedSteps, // 👈 Passed to validator!
  topicId,
  categoryId,
  questionId
);
```

---

### Step 6: UserInputValidator Validates Against Expected Steps

**File:** `UserInputValidator.tsx`

```typescript
public static validateStepSimple(
  stepIndex: number,
  userInputLines: string[],
  expectedSteps: Step[],  // 👈 Received from UserInput!
  topicId?: number,
  categoryId?: number,
  questionId?: number
): SimpleValidationResult {

  // Get the specific step we're validating
  const expectedStep = expectedSteps?.[stepIndex];
  //                   ^^^^^^^^^^^^^^ Array from Supabase

  if (!expectedStep) {
    return { isCorrect: false, feedback: 'No expected answer defined', status: 'incomplete' };
  }

  const userInput = userInputLines.join('\n').trim();
  const expectedAnswer = expectedStep.answer;  // 👈 The answer from database!
  //                     ^^^^^^^^^^^^^^^^^^^^ Can be string | string[]

  // Check if user's answer matches any of the expected variants
  const { matches, matchedVariant } = this.matchesAnyAnswer(
    userInput,
    expectedAnswer  // 👈 Compares against database answers!
  );

  return {
    isCorrect: matches,
    feedback: matches ? 'Correct!' : 'Incorrect',
    status: matches ? 'complete' : 'incomplete'
  };
}
```

---

## 🎯 Summary: The Complete Journey

```
1. Supabase Database
   └─ tugonsense_answer_steps table
      └─ JSONB answer_variants: ["f(5) = 2(5) + 3", "f(5)=2(5)+3"]

2. AnswerWizard.tsx (useEffect)
   └─ getAnswerForQuestionHybrid(topicId, categoryId, questionId)
      └─ fetchAnswerSteps() from supabaseAnswers.ts
         └─ Queries database, converts to Step[] format
            └─ setAnswersSource([{ questionId: 1, steps: [...] }])

3. AnswerWizard.tsx (render)
   └─ answersSource[index].steps → expectedSteps variable
      └─ <UserInput expectedSteps={expectedSteps} />

4. UserInput.tsx (props)
   └─ Receives expectedSteps: Step[] prop
      └─ UserInputValidator.validateStepSimple(stepIndex, userInputLines, expectedSteps)

5. UserInputValidator.tsx (validation)
   └─ expectedSteps[stepIndex].answer
      └─ matchesAnyAnswer(userInput, expectedAnswer)
         └─ Returns { isCorrect: true/false }
```

---

## 🔍 How to Debug

### Check if Supabase is being used:

**Open Browser Console (F12) and look for:**

```javascript
// ✅ Successfully loading from Supabase:
🔄 Fetching answer steps from Supabase: Topic 2, Category 1, Question 1
✅ Loaded answer steps from Supabase: {questionId: 1, steps: Array(3)}

// ⚠️ Falling back to hardcoded:
🔄 Fetching answer steps from Supabase: Topic 2, Category 1, Question 1
⚠️ No answer steps found
// (Then silently falls back to getAnswerForQuestion())

// ❌ Error state:
🔄 Fetching answer steps from Supabase: Topic 2, Category 1, Question 1
❌ Error loading answer steps: [error details]
```

### Check what data is loaded:

**Add this to your component:**

```typescript
// In AnswerWizard.tsx, add after answersSource is set:
useEffect(() => {
  console.log("🔍 DEBUG: answersSource state:", answersSource);
  console.log(
    "🔍 DEBUG: expectedSteps for current index:",
    answersSource?.[index]?.steps
  );
}, [answersSource, index]);
```

### Check SQL data:

**Run this in Supabase SQL Editor:**

```sql
SELECT
  topic_id,
  category_id,
  question_id,
  step_order,
  label,
  answer_variants,
  placeholder
FROM tugonsense_answer_steps
WHERE topic_id = 2
  AND category_id = 1
  AND question_id = 1
ORDER BY step_order;
```

---

## 🚨 Current Issue: Hybrid Fallback

**The problem:** When Supabase returns empty results, the system silently falls back to hardcoded answers. You might not realize it's using old data!

**The solution:** Remove fallback support so it ONLY uses Supabase.

**What happens after removal:**

- ✅ If data exists in Supabase → Works perfectly
- ❌ If data missing from Supabase → Shows error message (good! you'll know to add data)
- 🚫 No more silent fallback to hardcoded answers

---

## 📍 Where Data Comes From: Quick Reference

| Component              | Variable         | Source                                                 |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| **AnswerWizard**       | `answersSource`  | `useState()` populated by `useEffect` calling Supabase |
| **AnswerWizard**       | `expectedSteps`  | `answersSource[index].steps`                           |
| **UserInput**          | `expectedSteps`  | Prop received from AnswerWizard                        |
| **UserInputValidator** | `expectedSteps`  | Parameter passed from UserInput                        |
| **UserInputValidator** | `expectedAnswer` | `expectedSteps[stepIndex].answer`                      |

---

## 🎓 Key Takeaways

1. **Source of Truth:** `answersSource` state in AnswerWizard
2. **Populated By:** Supabase query via `getAnswerForQuestionHybrid()`
3. **Passed Down:** AnswerWizard → UserInput → UserInputValidator
4. **Used For:** Validation in `matchesAnyAnswer()` function
5. **Check Logs:** Browser console shows "✅ Loaded answer steps from Supabase"

---

**Next Step:** Remove the fallback so you ONLY use Supabase! 🚀
