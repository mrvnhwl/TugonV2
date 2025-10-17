# Process Flow: UserInput with UserInputValidator

## Overview

Complete documentation of the validation process flow from user input through validation, feedback, and progress tracking.

---

## 1. Component Initialization

### UserInput Component Setup

```typescript
// State Initialization
const [lines, setLines] = useState<string[]>(value);
const [lineValidationStates, setLineValidationStates] = useState<
  Map<number, SimpleValidationResult | null>
>(new Map());
const [validationTriggers, setValidationTriggers] = useState<
  Map<number, "enter" | null>
>(new Map());
const [wrongAttemptCounter, setWrongAttemptCounter] = useState<number>(0);
const [attemptHistory, setAttemptHistory] = useState<string[]>([]);
```

**Flow:**

```
Question Loads
     ↓
Initialize State
     ↓
Load Expected Steps (from answers/topic1/categoryX.ts)
     ↓
Ready for User Input
```

---

## 2. User Input Process

### Input Entry Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TYPES IN MATHFIELD                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              MathField Captures LaTeX Input                 │
│  Example: "x^2 + 3x - 5" → "\frac{x}{5}"                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│             Real-Time Color Feedback (Optional)              │
│  • Character-by-character comparison                        │
│  • Applies \textcolor{green}{} or \textcolor{red}{}         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER PRESSES ENTER                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   VALIDATION TRIGGERED
```

---

## 3. Validation Process Flow

### Main Validation Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 1: Extract Raw Value from MathField                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    InputValidator.extractMathFieldValue(mathField)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  • Get LaTeX value: mathField.getValue()                         │
│  • Strip color commands: stripColorCommands()                    │
│  • Remove invisible Unicode & quotes                             │
│  • Convert to readable format                                    │
└──────────────────────────────────────────────────────────────────┘
    Output: Plain text string (e.g., "x^2+3x-5")
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: Sanitize User Input                                    │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    InputValidator.sanitizeTextMathLive(userInput)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Check if LaTeX:                                                 │
│  • Contains \, {, }, ^, or _?                                   │
│    YES → Use MathLive conversion (convertLatexToAsciiMath)      │
│    NO  → Basic text sanitization                                │
│                                                                  │
│  Process:                                                        │
│  1. Remove invisible Unicode characters                          │
│  2. Remove quotes                                                │
│  3. Convert LaTeX to ASCII Math (if applicable)                  │
│  4. Remove all whitespace                                        │
│  5. Convert to lowercase                                         │
└──────────────────────────────────────────────────────────────────┘
    Output: Sanitized string (e.g., "x^2+3x-5")
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Sanitize Expected Answer(s)                            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    For each answer variant in Step.answer[]
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  • Apply same sanitization as user input                         │
│  • Handle multiple acceptable answers                            │
│  • Use first answer as reference for feedback                    │
└──────────────────────────────────────────────────────────────────┘
    Output: Array of sanitized expected answers
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Call validateStepSimple()                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    InputValidator.validateStepSimple(
        userInput,
        expectedStep.answer,  // Can be string or string[]
        stepLabel,
        currentStepIndex,
        allExpectedSteps
    )
```

---

## 4. validateStepSimple() Internal Process

```
┌──────────────────────────────────────────────────────────────────┐
│  validateStepSimple() - Core Validation Logic                   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4a: Match Against All Answer Variants                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    matchesAnyAnswer(userInput, expectedAnswers)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  For each answer variant:                                        │
│    1. Sanitize variant                                           │
│    2. Compare: cleanUser === cleanExpected                       │
│    3. If match found → Return success                            │
│    4. If no match → Try next variant                             │
│                                                                  │
│  Return:                                                         │
│    { matches: boolean,                                           │
│      matchedVariant: string | null,                             │
│      totalVariants: number }                                    │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4b: Generate Token Feedback (Wordle-style)                │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    1. tokenizeMathString(userInput)
    2. tokenizeMathString(referenceAnswer)
    3. generateTokenFeedback(userTokens, expectedTokens)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Token Comparison:                                               │
│    • 'correct' → Token in correct position (green)              │
│    • 'present' → Token exists but wrong position (yellow)       │
│    • 'absent'  → Token not in expected answer (red)             │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4c: Check for Final Answer Detection                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    Is user trying to skip steps?
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  1. Get final step from allExpectedSteps                         │
│  2. Match user input against final step answers                  │
│  3. If matches AND currentStepIndex < finalStepIndex:            │
│     → Set finalAnswerDetected = true                             │
│     → Reject as incorrect (force step-by-step)                   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4d: Return Validation Result                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    return {
        isCorrect: matches && !finalAnswerDetected,
        finalAnswerDetected: boolean,
        tokenFeedback: TokenFeedback[]
    }
```

---

## 5. Post-Validation Actions

### Validation Result Handling

```
┌──────────────────────────────────────────────────────────────────┐
│            Validation Result Received in UserInput               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
            ✅ CORRECT         ❌ INCORRECT
                    │               │
                    ↓               ↓
```

### CORRECT ANSWER PATH ✅

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Update Validation State                                      │
└──────────────────────────────────────────────────────────────────┘
    setLineValidationStates(lineIndex, { isCorrect: true, ... })
    setValidationTriggers(lineIndex, 'enter')
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  2. Show Success Message                                         │
└──────────────────────────────────────────────────────────────────┘
    toast.success("✅ Perfect! You got it!")
    OR "🌟 First try! Impressive!" (if first attempt)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3. Reset Tracking States                                        │
└──────────────────────────────────────────────────────────────────┘
    • wrongAttemptCounter = 0
    • attemptHistory = []
    • shortHintCounter = 0
    • modalShown = false
    • Dismiss any active toast
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  4. Record Attempt                                               │
└──────────────────────────────────────────────────────────────────┘
    createUserAttempt({
        userInput,
        isCorrect: true,
        expectedAnswer,
        tokens,
        ...
    })
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  5. Update Progress                                              │
└──────────────────────────────────────────────────────────────────┘
    getCompletionStatus() → Calculate percentage
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  6. Create New Line (if not last step)                           │
└──────────────────────────────────────────────────────────────────┘
    setLines([...lines, ''])
    Focus on next line
```

### INCORRECT ANSWER PATH ❌

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Update Validation State                                      │
└──────────────────────────────────────────────────────────────────┘
    setLineValidationStates(lineIndex, { isCorrect: false, ... })
    setValidationTriggers(lineIndex, 'enter')
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  2. Update Attempt History                                       │
└──────────────────────────────────────────────────────────────────┘
    attemptHistory.push(sanitizedInput)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3. Increment Wrong Attempt Counter                              │
└──────────────────────────────────────────────────────────────────┘
    wrongAttemptCounter++
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  4. Check Counter Threshold                                      │
└──────────────────────────────────────────────────────────────────┘
                    ↓
        Is counter === 3? (Every 3rd wrong attempt)
                    ↓
            ┌───────┴───────┐
            │               │
          YES              NO
            │               │
            ↓               ↓
    Trigger Feedback    Continue
            │
            ↓
┌──────────────────────────────────────────────────────────────────┐
│  5. Increment Short Hint Counter                                 │
└──────────────────────────────────────────────────────────────────┘
    shortHintCounter++ (tracks cycles of 3)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  6. Determine Feedback Type                                      │
└──────────────────────────────────────────────────────────────────┘
                    ↓
        Is shortHintCounter === 5? (15th wrong attempt)
                    ↓
            ┌───────┴───────┐
            │               │
          YES              NO
            │               │
     SHOW MODAL      SHOW TOAST
            │               │
            ↓               ↓
```

### TOAST HINT PATH (Cycles 1-4, 6+)

```
┌──────────────────────────────────────────────────────────────────┐
│  Show Toast Hint - showHintMessage()                            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  1. Analyze User Behavior                                        │
└──────────────────────────────────────────────────────────────────┘
    BehaviorAnalyzer.analyzeBehavior(attempts)
                            ↓
    Returns: {
        type: 'sign-error' | 'magnitude-error' |
              'close-attempt' | 'repetition' |
              'guessing' | 'random',
        description: string
    }
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  2. Extract Wrong Tokens                                         │
└──────────────────────────────────────────────────────────────────┘
    extractWrongTokensFromFeedback(tokenFeedback)
                            ↓
    Identifies which specific tokens are wrong
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3. Generate Hint Message                                        │
└──────────────────────────────────────────────────────────────────┘
    Priority Order:
    1. AI Behavior Templates (if loaded)
    2. Curated Context-Specific Hints
    3. Hardcoded Fallback Hints
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3a. Try AI Template (if available)                              │
└──────────────────────────────────────────────────────────────────┘
    if (behaviorTemplates) {
        hint = fillHintTemplate(
            behaviorTemplates,
            behaviorType,
            wrongPart,
            stepLabel
        )
    }
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3b. Try Curated Hint (if AI not available)                      │
└──────────────────────────────────────────────────────────────────┘
    hint = getStepHint(
        topicId,
        categoryId,
        questionId,
        stepLabel,
        behaviorType
    )
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3c. Fallback to Generic Hint                                    │
└──────────────────────────────────────────────────────────────────┘
    switch(behaviorType) {
        case 'sign-error':
            "⚠️ Double-check your signs..."
        case 'magnitude-error':
            "📏 Your answer seems off by..."
        // ... etc
    }
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  4. Dismiss Previous Toast (if exists)                           │
└──────────────────────────────────────────────────────────────────┘
    if (activeToastIdRef.current) {
        toast.dismiss(activeToastIdRef.current)
    }
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  5. Display New Toast                                            │
└──────────────────────────────────────────────────────────────────┘
    toastId = toast.custom(
        <TealCardWithEmojiAndMessage />,
        { duration: 3500, position: 'top-center' }
    )
    activeToastIdRef.current = toastId
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  6. Reset Counter                                                │
└──────────────────────────────────────────────────────────────────┘
    wrongAttemptCounter = 0 (reset for next cycle)
```

### MODAL PATH (Cycle 5 = 15th wrong attempt)

```
┌──────────────────────────────────────────────────────────────────┐
│  Show FeedbackModal                                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  1. Dismiss Any Active Toast                                     │
└──────────────────────────────────────────────────────────────────┘
    if (activeToastIdRef.current) {
        toast.dismiss(activeToastIdRef.current)
        activeToastIdRef.current = null
    }
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  2. Set Modal Data                                               │
└──────────────────────────────────────────────────────────────────┘
    setModalData({
        userInput: sanitizedInput,
        correctAnswer: correctAnswer
    })
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3. Open Modal                                                   │
└──────────────────────────────────────────────────────────────────┘
    setIsModalOpen(true)
    setModalShown(true)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  4. Display Modal Content                                        │
└──────────────────────────────────────────────────────────────────┘
    • Your Input (with MathLive + readable text)
    • Expected Answer (with MathLive + readable text)
    • Scaffold Hint (with fill-in-the-blank)
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  5. Reset Counter (not shown again for this question)            │
└──────────────────────────────────────────────────────────────────┘
    wrongAttemptCounter = 0
    modalShown = true (prevents re-showing)
```

---

## 6. Progress Calculation

### getCompletionStatus() Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  Calculate Progress After Each Validation                        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
    InputValidator.getCompletionStatus(
        lines,
        expectedSteps,
        lineValidationStates,
        validationTriggers
    )
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  1. Count Correct Steps                                          │
└──────────────────────────────────────────────────────────────────┘
    For each line:
        if (validated AND isCorrect) {
            correctSteps++
        }
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  2. Calculate Base Progress                                      │
└──────────────────────────────────────────────────────────────────┘
    perStep = 100 / totalSteps
    baseProgress = correctSteps × perStep

    Example (3-step problem):
        perStep = 100 / 3 = 33.33%
        If 1 correct: 33.33%
        If 2 correct: 66.67%
        If 3 correct: 100%
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3. Calculate Consolation Progress                               │
└──────────────────────────────────────────────────────────────────┘
    For wrong but attempted steps:
        1. Check excess characters:
           excessChars = userLength - expectedLength

        2. If excessChars > 3:
           → Skip consolation (too much typing)

        3. If excessChars ≤ 3:
           → Award partial credit

        4. Calculate consolation:
           consolationPerChar = (perStep / expectedLength) / 2
           cappedUserLength = min(userLength, expectedLength)
           stepConsolation = cappedUserLength × consolationPerChar

    Example:
        Expected: "x^2+3x-5" (9 chars)
        User: "x^2+3x" (6 chars)
        Excess: 6 - 9 = -3 (within limit)
        Consolation: (33.33% / 9) / 2 × 6 ≈ 11.11%
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  4. Sum Total Progress                                           │
└──────────────────────────────────────────────────────────────────┘
    totalProgress = baseProgress + consolationProgress
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  5. Return Completion Status                                     │
└──────────────────────────────────────────────────────────────────┘
    return {
        totalSteps: number,
        completedSteps: number,
        correctSteps: number,
        isComplete: boolean,
        allCorrect: boolean,
        percentage: totalProgress,
        baseProgress: number,
        consolationProgress: number,
        finalAnswerDetected: boolean,
        stepCorrectness: boolean[]
    }
```

---

## 7. Complete User Journey Example

### Scenario: 3-Step Problem with Wrong Attempts

```
QUESTION: Solve (f ∘ g)(x) where f(x)=3x-4, g(x)=x²+2x

Expected Steps:
  Step 1: "g(x) = x^2 + 2x"
  Step 2: "f(g(x)) = 3(x^2 + 2x) - 4"
  Step 3: "f(g(x)) = 3x^2 + 6x - 4"
```

#### Timeline:

```
[00:00] User enters Step 1: "g(x) = x^2 + 2x"
        ↓ Press Enter
        → sanitizeTextMathLive("g(x) = x^2 + 2x")
        → validateStepSimple(...)
        → matchesAnyAnswer() → ✅ MATCH
        → isCorrect: true
        → Show success toast
        → Create new line
        → Progress: 33.33%

[00:15] User enters Step 2: "f(g(x)) = 3x^2 + 6x"  ❌ WRONG
        ↓ Press Enter
        → sanitizeTextMathLive("f(g(x)) = 3x^2 + 6x")
        → validateStepSimple(...)
        → matchesAnyAnswer() → ❌ NO MATCH
        → isCorrect: false
        → wrongAttemptCounter = 1
        → No toast (need 3 wrong attempts)
        → Progress: 33.33% + ~5% consolation ≈ 38%

[00:30] User enters Step 2: "3(x^2 + 2x) - 4"  ❌ WRONG
        ↓ Press Enter
        → wrongAttemptCounter = 2
        → No toast yet
        → Progress: 38% (same)

[00:45] User enters Step 2: "f(g(x)) = 3x + 2x - 4"  ❌ WRONG
        ↓ Press Enter
        → wrongAttemptCounter = 3
        → TRIGGER FEEDBACK
        → shortHintCounter = 1 (cycle 1)
        → Analyze behavior: 'magnitude-error'
        → Generate hint from AI/curated/fallback
        → Show toast: "⚠️ Check your coefficient..."
        → Reset: wrongAttemptCounter = 0
        → Progress: 38%

[01:00] User enters Step 2: "f(g(x)) = 3(x^2 + 2x) - 4"  ✅ CORRECT
        → isCorrect: true
        → Show success toast
        → Progress: 66.67%

[01:15] User enters Step 3: "f(g(x)) = 3x^2 + 6x - 4"  ✅ CORRECT
        → isCorrect: true
        → Show success toast: "🎉 Excellent work!"
        → Progress: 100%
        → All steps complete!
```

---

## 8. Data Structures

### SimpleValidationResult

```typescript
{
    isCorrect: boolean,           // Did answer match?
    finalAnswerDetected: boolean, // Trying to skip steps?
    tokenFeedback: TokenFeedback[] // Wordle-style feedback
}
```

### TokenFeedback

```typescript
{
    token: string,      // The token itself (e.g., "x^2")
    status: 'correct' | 'present' | 'absent'
}
```

### CompletionStatus

```typescript
{
    totalSteps: number,           // Total expected steps
    completedSteps: number,       // Non-empty lines entered
    correctSteps: number,         // Validated correct steps
    isComplete: boolean,          // All steps entered?
    allCorrect: boolean,          // All steps correct?
    percentage: number,           // Total progress %
    baseProgress: number,         // From correct steps
    consolationProgress: number,  // From wrong attempts
    finalAnswerDetected: boolean, // User skipping?
    finalAnswerPosition: number,  // Where detected
    stepCorrectness: boolean[]    // Per-step status
}
```

### UserAttempt

```typescript
{
    attempt_id: number,
    stepIndex: number,
    stepLabel: string,
    userInput: string,
    sanitizedInput: string,
    tokens: string[],
    isCorrect: boolean,
    expectedAnswer: string,
    sanitizedExpectedAnswer: string,
    expectedTokens: string[],
    cumulativeProgress: number,
    stepStartTime: number,
    attemptTime: number,
    timeSpentOnStep?: number
}
```

---

## 9. Key Methods Reference

### InputValidator Methods

| Method                    | Purpose                        | Input                     | Output                 |
| ------------------------- | ------------------------------ | ------------------------- | ---------------------- |
| `sanitizeTextMathLive()`  | Clean and normalize input      | LaTeX string              | Plain text             |
| `extractMathFieldValue()` | Get value from MathField       | MathField element         | Plain text             |
| `matchesAnyAnswer()`      | Check against multiple answers | user, answers[]           | match result           |
| `validateStepSimple()`    | Main validation logic          | user, expected, step info | SimpleValidationResult |
| `getCompletionStatus()`   | Calculate progress             | lines, steps, states      | CompletionStatus       |
| `stripColorCommands()`    | Remove color LaTeX             | Colored LaTeX             | Clean LaTeX            |
| `tokenizeMathString()`    | Split into tokens              | Math string               | string[]               |
| `generateTokenFeedback()` | Create Wordle feedback         | user tokens, expected     | TokenFeedback[]        |

### UserInput Methods

| Method                     | Purpose                     |
| -------------------------- | --------------------------- |
| `validateIndividualLine()` | Trigger validation on Enter |
| `showHintMessage()`        | Display contextual hints    |
| `showSuccessMessage()`     | Display success feedback    |
| `createUserAttempt()`      | Record attempt data         |
| `getCompletionStatus()`    | Wrapper for progress calc   |

---

## 10. Special Cases

### Multiple Acceptable Answers

```typescript
// Step can have multiple correct answers
step: {
    label: "substitution",
    answer: [
        "f(g(x)) = 3(x^2 + 2x) - 4",  // Variant 1
        "f(g(x)) = 3x^2 + 6x - 4",    // Variant 2
        "3(x^2 + 2x) - 4"              // Variant 3
    ]
}

// Validation checks ALL variants
// User can enter ANY of these to be correct
```

### Final Answer Detection

```typescript
// Prevent users from skipping to final answer
If user enters: "f(g(x)) = 3x^2 + 6x - 4" on Step 1
→ Matches final answer (Step 3)
→ currentStepIndex (0) < finalStepIndex (2)
→ finalAnswerDetected = true
→ isCorrect = false (rejected)
→ User must do steps in order
```

### Consolation Progress Edge Case

```typescript
// No consolation if user types too much
Expected: "x^2 + 3x - 5"  (12 chars)
User: "x^2 + 3x - 5 + 7x + 2"  (20 chars)
Excess: 20 - 12 = 8 chars (> 3 limit)
→ No consolation progress awarded
→ Prevents rewarding random typing
```

### LaTeX Conversion Fallback

```typescript
// If MathLive conversion fails
try {
  asciiMath = convertLatexToAsciiMath(latex);
} catch {
  // Use fallback LaTeX cleaning
  cleaned = cleanLatexFallback(latex);
}
```

---

## 11. Summary Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER TYPES IN MATHFIELD                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER PRESSES ENTER                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│          Extract & Sanitize (strip colors, normalize)           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│        validateStepSimple (check all answer variants)           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
            ✅ CORRECT         ❌ INCORRECT
                    │               │
                    ↓               ↓
        ┌───────────────┐   ┌───────────────┐
        │ Success Toast │   │ Track Attempt │
        │ Reset Counter │   │ Increment     │
        │ Add New Line  │   │ Counter       │
        │ Update Progress│   │               │
        └───────────────┘   └───────┬───────┘
                                    │
                            Every 3rd wrong?
                                    │
                            ┌───────┴───────┐
                            │               │
                          YES              NO
                            │               │
                    15th attempt?      Continue
                            │
                    ┌───────┴───────┐
                    │               │
                  YES              NO
                    │               │
           ┌────────────┐   ┌──────────────┐
           │ Show Modal │   │ Show Toast   │
           │ Dismiss    │   │ Dismiss Old  │
           │ Toast      │   │ Toast First  │
           └────────────┘   └──────────────┘
                                    │
                            Analyze Behavior
                                    │
                            Generate Hint
                                    │
                            Display Toast
```

---

## Status

✅ **Complete Documentation** - Full validation process flow documented

## Related Files

- `src/components/tugon/input-system/UserInputValidator.tsx`
- `src/components/tugon/input-system/UserInput.tsx`
- `src/components/tugon/input-system/tokenUtils.ts`
- `src/components/tugon/services/hintGenerator.ts`
- `src/components/data/answers/topic1/categoryX.ts`
