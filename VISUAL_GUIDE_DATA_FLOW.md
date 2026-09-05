# 🎨 Visual Guide: Answer Data Flow

## 📊 Complete Data Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                              │
│                                                                     │
│  Table: tugonsense_answer_steps                                    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │ topic_id │ cat_id │ q_id │ step │ label │ answer_variants │    │
│  ├──────────┼────────┼──────┼──────┼───────┼─────────────────┤    │
│  │    2     │   1    │  1   │  1   │ sub   │ ["f(5)=...", ]│    │
│  │    2     │   1    │  1   │  2   │ simp  │ ["10+3", ...]  │    │
│  │    2     │   1    │  1   │  3   │ final │ ["13", ...]    │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ fetchAnswerSteps(2, 1, 1)
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│              src/lib/supabaseAnswers.ts                             │
│                                                                     │
│  export async function fetchAnswerSteps(                           │
│    topicId: number,                                                │
│    categoryId: number,                                             │
│    questionId: number                                              │
│  ): Promise<Step[]> {                                              │
│    // Query Supabase                                               │
│    const { data, error } = await supabase                          │
│      .from('tugonsense_answer_steps')                              │
│      .select('*')                                                  │
│      .eq('topic_id', topicId)                                      │
│      .eq('category_id', categoryId)                                │
│      .eq('question_id', questionId)                                │
│      .order('step_order', { ascending: true });                    │
│                                                                     │
│    // Convert to Step[] format                                     │
│    return data.map(row => ({                                       │
│      label: row.label,                                             │
│      answer: row.answer_variants, // JSONB array → string[]        │
│      placeholder: row.placeholder                                  │
│    }));                                                            │
│  }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Returns Step[]
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│     src/components/tugon/input-system/AnswerWizard.tsx              │
│                                                                     │
│  // State to hold fetched data                                     │
│  const [answersSource, setAnswersSource] = useState<               │
│    PredefinedAnswer[]                                              │
│  >([]);                                                            │
│                                                                     │
│  useEffect(() => {                                                 │
│    const loadAnswerSteps = async () => {                           │
│      console.log('🔄 Fetching answer steps from Supabase ONLY'); │
│                                                                     │
│      const steps = await fetchAnswerSteps(                         │
│        topicId, categoryId, questionId                             │
│      );                                                            │
│                                                                     │
│      if (steps && steps.length > 0) {                              │
│        const predefinedAnswer: PredefinedAnswer = {                │
│          questionId: questionId,                                   │
│          questionText: `Question ${questionId}`,                   │
│          type: 'multiLine',                                        │
│          steps: steps  // ← Step[] from Supabase                   │
│        };                                                          │
│        setAnswersSource([predefinedAnswer]);                       │
│        console.log('✅ Loaded answer steps from Supabase');       │
│      }                                                             │
│    };                                                              │
│    loadAnswerSteps();                                              │
│  }, [topicId, categoryId, questionId]);                            │
│                                                                     │
│  // Extract steps for current question                             │
│  const expectedSteps = answersSource?.[index]?.steps;              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Pass as prop
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│       src/components/tugon/input-system/UserInput.tsx               │
│                                                                     │
│  export interface UserInputProps {                                 │
│    expectedSteps: Step[];  // ← Received from AnswerWizard         │
│    // ... other props                                              │
│  }                                                                 │
│                                                                     │
│  export default function UserInput({                               │
│    expectedSteps,  // ← Available here!                            │
│    // ... other props                                              │
│  }: UserInputProps) {                                              │
│                                                                     │
│    // When user presses Enter:                                     │
│    const handleSubmit = () => {                                    │
│      const result = UserInputValidator.validateStepSimple(         │
│        currentStepIndex,                                           │
│        userInputLines,                                             │
│        expectedSteps  // ← Pass to validator                       │
│      );                                                            │
│    };                                                              │
│  }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Pass as parameter
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│   src/components/tugon/input-system/UserInputValidator.tsx         │
│                                                                     │
│  public static validateStepSimple(                                 │
│    stepIndex: number,                                              │
│    userInputLines: string[],                                       │
│    expectedSteps: Step[]  // ← From Supabase!                      │
│  ): SimpleValidationResult {                                       │
│                                                                     │
│    // Get the expected answer for this step                        │
│    const expectedStep = expectedSteps?.[stepIndex];                │
│    const expectedAnswer = expectedStep.answer;                     │
│    // expectedAnswer is string[] from JSONB answer_variants        │
│                                                                     │
│    // Check if user input matches any variant                      │
│    const { matches } = this.matchesAnyAnswer(                      │
│      userInput,                                                    │
│      expectedAnswer  // ← ["f(5)=2(5)+3", "f(5)=2*5+3", ...]      │
│    );                                                              │
│                                                                     │
│    return {                                                        │
│      isCorrect: matches,  // ← true if any variant matched         │
│      feedback: matches ? 'Correct!' : 'Incorrect'                  │
│    };                                                              │
│  }                                                                 │
│                                                                     │
│  private static matchesAnyAnswer(                                  │
│    userInput: string,                                              │
│    expectedAnswers: string | string[]                              │
│  ) {                                                               │
│    // Convert to array if needed                                   │
│    const answerArray = Array.isArray(expectedAnswers)              │
│      ? expectedAnswers                                             │
│      : [expectedAnswers];                                          │
│                                                                     │
│    // Check each variant                                           │
│    for (const variant of answerArray) {                            │
│      if (sanitize(userInput) === sanitize(variant)) {              │
│        return { matches: true, matchedVariant: variant };          │
│      }                                                             │
│    }                                                               │
│    return { matches: false, matchedVariant: null };                │
│  }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Returns validation result
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        USER SEES FEEDBACK                           │
│                                                                     │
│  ┌────────────────────────────────────┐                            │
│  │  Step 1: Substitution              │                            │
│  │  f(5) = 2(5) + 3                   │  ← Input field turns GREEN│
│  │                                    │                            │
│  │  ✓ Correct!                        │  ← Feedback message       │
│  └────────────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Console Log Timeline

```
Time 0ms: User navigates to question
├─ AnswerWizard mounts
└─ useEffect triggers

Time 10ms: Loading starts
├─ Console: 🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
├─ UI: Shows loading spinner
└─ State: answersLoading = true

Time 200ms: Supabase query completes (SUCCESS)
├─ Console: ✅ Loaded answer steps from Supabase: {questionId: 1, steps: Array(3)}
├─ State: answersSource = [{questionId: 1, steps: [...]}]
├─ State: answersLoading = false
└─ UI: Renders input fields

Time 5000ms: User types "f(5) = 2(5) + 3"
├─ UserInput receives keystrokes
└─ No validation yet

Time 5500ms: User presses Enter
├─ UserInput.handleSubmit()
├─ UserInputValidator.validateStepSimple(0, ["f(5) = 2(5) + 3"], expectedSteps)
├─ matchesAnyAnswer("f(5) = 2(5) + 3", ["f(5) = 2(5) + 3", "f(5)=2(5)+3"])
├─ Returns: { isCorrect: true }
├─ UI: Input field turns GREEN
└─ UI: Shows "✓ Correct!" message
```

---

## 🎨 UI State Transitions

```
STATE 1: INITIAL / LOADING
┌─────────────────────────────────┐
│                                 │
│   ◯ Loading answer steps...    │
│                                 │
└─────────────────────────────────┘
Console: 🔄 Fetching answer steps from Supabase ONLY...


        ↓ (200ms later, if SUCCESS)


STATE 2: READY / NORMAL
┌─────────────────────────────────┐
│  Step 1: Substitution           │
│  ┌─────────────────────────┐   │
│  │ [Type your answer...]   │   │ ← User can type
│  └─────────────────────────┘   │
│                                 │
│  Hint: Substitute x = 5         │
└─────────────────────────────────┘
Console: ✅ Loaded answer steps from Supabase: {questionId: 1, ...}


        ↓ (User presses Enter)


STATE 3a: CORRECT ANSWER
┌─────────────────────────────────┐
│  Step 1: Substitution           │
│  ┌─────────────────────────┐   │
│  │ f(5) = 2(5) + 3      ✓  │   │ ← GREEN border
│  └─────────────────────────┘   │
│                                 │
│  ✓ Correct!                     │ ← Success message
└─────────────────────────────────┘


STATE 3b: INCORRECT ANSWER
┌─────────────────────────────────┐
│  Step 1: Substitution           │
│  ┌─────────────────────────┐   │
│  │ f(5) = 2x + 3        ✗  │   │ ← RED border
│  └─────────────────────────┘   │
│                                 │
│  ✗ Incorrect. Try again.        │ ← Error message
└─────────────────────────────────┘


        ↓ (200ms later, if EMPTY RESULT from Supabase)


STATE 4: ERROR (NO DATA)
┌─────────────────────────────────────┐
│  ⚠️ ERROR                           │
│                                     │
│  No answer steps found in database. │
│  Please add answer data for this    │
│  question.                          │
│                                     │
│  Please check if the question has   │
│  been configured in the database.   │
└─────────────────────────────────────┘
Console: ⚠️ No answer steps found in Supabase database


        ↓ (If Supabase query fails)


STATE 5: ERROR (CONNECTION FAILED)
┌─────────────────────────────────────┐
│  ⚠️ ERROR                           │
│                                     │
│  Failed to load answer steps from   │
│  database. Check console for        │
│  details.                           │
│                                     │
│  Please check if the question has   │
│  been configured in the database.   │
└─────────────────────────────────────┘
Console: ❌ Error loading answer steps from Supabase: [error details]
```

---

## 📋 Step-by-Step Example

### Example Question: Evaluate f(5) where f(x) = 2x + 3

**Database has:**

```json
[
  {
    "step_order": 1,
    "label": "substitution",
    "answer_variants": ["f(5) = 2(5) + 3", "f(5)=2(5)+3", "f(5) = 2*5 + 3"],
    "placeholder": "Substitute x = 5"
  },
  {
    "step_order": 2,
    "label": "simplification",
    "answer_variants": ["f(5) = 10 + 3", "f(5)=10+3", "10 + 3"],
    "placeholder": "Simplify multiplication"
  },
  {
    "step_order": 3,
    "label": "final",
    "answer_variants": ["13", "f(5) = 13", "f(5)=13"],
    "placeholder": "Final answer"
  }
]
```

**User Journey:**

1. **Page loads**

   ```
   Console: 🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
   ```

2. **Data fetched (200ms later)**

   ```
   Console: ✅ Loaded answer steps from Supabase: {questionId: 1, steps: Array(3)}
   UI: Shows Step 1 input field with placeholder "Substitute x = 5"
   ```

3. **User types: "f(5) = 2(5) + 3"**

   ```
   No validation yet, just typing
   ```

4. **User presses Enter**

   ```
   Validator checks: ["f(5) = 2(5) + 3"] against ["f(5) = 2(5) + 3", "f(5)=2(5)+3", "f(5) = 2*5 + 3"]
   Match found! ✓
   UI: Green border, "✓ Correct!" message
   Moves to Step 2
   ```

5. **User types: "10 + 3" in Step 2**

   ```
   User presses Enter
   Validator checks: ["10 + 3"] against ["f(5) = 10 + 3", "f(5)=10+3", "10 + 3"]
   Match found! ✓
   UI: Green border, moves to Step 3
   ```

6. **User types: "13" in Step 3**
   ```
   User presses Enter
   Validator checks: ["13"] against ["13", "f(5) = 13", "f(5)=13"]
   Match found! ✓
   UI: Green border, all steps complete! 🎉
   ```

---

## 🎯 Key Points

1. **Single Source of Truth:** Supabase `tugonsense_answer_steps` table
2. **No Fallback:** Error shown if data missing (forces you to populate DB)
3. **Clear Logging:** Console always shows what's happening
4. **Multiple Variants:** JSONB array supports different answer formats
5. **Existing Validator:** No changes needed - already supports arrays!

---

## 🚀 What You Should See

### ✅ If Everything is Working:

**Console:**

```
🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
✅ Loaded answer steps from Supabase: {questionId: 1, type: "multiLine", steps: Array(3)}
```

**UI:**

- Loading spinner for ~200ms
- Then input fields appear
- Validation works with multiple answer formats
- Green feedback for correct, red for incorrect

### ⚠️ If Data is Missing:

**Console:**

```
🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
⚠️ No answer steps found in Supabase database
```

**UI:**

- Loading spinner for ~200ms
- Then red error card appears
- Message: "No answer steps found in database"
- Tells you to add data

### ❌ If Connection Failed:

**Console:**

```
🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
❌ Error loading answer steps from Supabase: [detailed error]
```

**UI:**

- Loading spinner for ~200ms
- Then red error card appears
- Message: "Failed to load answer steps from database"
- Tells you to check console

---

## 📚 Summary

**Data flows:** Supabase → supabaseAnswers.ts → AnswerWizard → UserInput → UserInputValidator

**You'll always know the source because:**

- ✅ Console logs at every step
- ✅ Error messages are specific
- ✅ No silent fallbacks
- ✅ Database is single source of truth

**Look for:** `✅ Loaded answer steps from Supabase` = Success! 🎉
