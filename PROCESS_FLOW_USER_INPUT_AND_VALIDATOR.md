# Process Flow: User Input and Validator Integration

## Overview

Complete end-to-end flow showing how user input is processed, validated, and provides feedback through the system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Interaction](#component-interaction)
3. [Detailed Process Flow](#detailed-process-flow)
4. [Validation Pipeline](#validation-pipeline)
5. [Feedback System](#feedback-system)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT SYSTEM                        │
│                                                                 │
│  ┌───────────────┐      ┌──────────────────┐                  │
│  │   UserInput   │─────▶│  InputValidator  │                  │
│  │  Component    │      │     Service      │                  │
│  └───────┬───────┘      └────────┬─────────┘                  │
│          │                       │                             │
│          │                       │                             │
│          ▼                       ▼                             │
│  ┌──────────────┐      ┌──────────────────┐                  │
│  │  MathField   │      │  Token Feedback  │                  │
│  │  (MathLive)  │      │     System       │                  │
│  └──────────────┘      └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           │                       │
           ▼                       ▼
    ┌─────────────┐       ┌─────────────┐
    │   Toast     │       │  Feedback   │
    │   Hints     │       │   Modal     │
    └─────────────┘       └─────────────┘
```

---

## Component Interaction

### 1. UserInput Component (Parent)

**Responsibilities:**

- Render MathLive input fields
- Manage user interaction (typing, Enter key)
- Track validation state for each line
- Coordinate feedback display
- Handle progress calculation

### 2. InputValidator Service (Utility)

**Responsibilities:**

- Sanitize LaTeX input
- Compare user input with expected answers
- Generate token-level feedback
- Detect final answer in wrong position
- Calculate completion status

### 3. Supporting Systems

- **Token Feedback**: Wordle-style character-by-character validation
- **Toast Hints**: Contextual hints after wrong attempts
- **FeedbackModal**: Comprehensive feedback after 15 wrong attempts

---

## Detailed Process Flow

### Phase 1: User Input Entry

```
┌──────────────────────────────────────────────────────────────┐
│                    USER TYPES IN MATHFIELD                   │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  1. MathLive captures LaTeX input                            │
│     - Input: "x^2 + 3x - 5"                                  │
│     - LaTeX: "x^{2}+3x-5"                                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Real-time Color Feedback (Optional)                      │
│     - Character-by-character comparison                      │
│     - Green: correct, Red: wrong, Gray: extra               │
│     - Updates as user types (debounced 1s)                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  3. User Presses ENTER                                       │
│     - Triggers validation pipeline                           │
│     - Line marked for validation                             │
└──────────────────────────────────────────────────────────────┘
```

### Phase 2: Input Sanitization

```
┌──────────────────────────────────────────────────────────────┐
│              INPUT VALIDATOR: sanitizeTextMathLive            │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Clean Invisible Characters                          │
│  - Remove Unicode whitespace (\u00A0, \u2000-\u200F, etc.)  │
│  - Remove quotes                                             │
│                                                              │
│  Input:  "x² + 3x - 5" (with \u00A0)                        │
│  Output: "x² + 3x - 5"                                       │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Detect LaTeX Syntax                                 │
│  - Check for: \, {, }, ^, _                                  │
│  - hasLatex = true                                           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3a: Convert LaTeX to ASCII (if hasLatex)              │
│  - Use MathLive's convertLatexToAsciiMath()                 │
│                                                              │
│  LaTeX:   "x^{2}+3x-5"                                       │
│  ASCII:   "x^2+3x-5"                                         │
│                                                              │
│  OR                                                          │
│                                                              │
│  Step 3b: Fallback Cleaning (if conversion fails)           │
│  - Manual LaTeX pattern replacement                         │
│  - \frac{a}{b} → (a)/(b)                                    │
│  - \sqrt{x} → sqrt(x)                                        │
│  - Remove remaining \ and {}                                 │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Final Normalization                                 │
│  - Remove ALL whitespace                                     │
│  - Convert to lowercase                                      │
│                                                              │
│  Output: "x^2+3x-5"                                          │
└──────────────────────────────────────────────────────────────┘
```

### Phase 3: Validation Process

```
┌──────────────────────────────────────────────────────────────┐
│         INPUT VALIDATOR: validateStepSimple()                │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Input Parameters:                                           │
│  - userInput: "x^2 + 3x - 5"                                │
│  - expectedAnswer: "x^2 + 3x - 5" OR ["x^2+3x-5", "3x+x^2-5"]│
│  - stepLabel: "final"                                        │
│  - currentStepIndex: 2                                       │
│  - allExpectedSteps: [Step, Step, Step]                     │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Multiple Answer Support                             │
│  - Call matchesAnyAnswer() helper                           │
│  - Check if user input matches ANY variant                   │
│                                                              │
│  Variants: ["x^2+3x-5", "3x+x^2-5", "x^2-5+3x"]            │
│  User:     "x^2+3x-5"                                        │
│  Result:   ✅ Match found (variant 1/3)                      │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Tokenize for Visual Feedback                       │
│  - Tokenize user input                                       │
│  - Tokenize reference answer (first variant)                 │
│  - Generate token-level feedback                             │
│                                                              │
│  User tokens:     ["x^2", "+", "3x", "-", "5"]             │
│  Expected tokens: ["x^2", "+", "3x", "-", "5"]             │
│  Feedback:        [✓, ✓, ✓, ✓, ✓]                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Final Answer Detection                              │
│  - Get final step from allExpectedSteps                      │
│  - Check if user input matches final answer                  │
│  - If current step < final step → flag as wrong position    │
│                                                              │
│  Example:                                                    │
│  Current step: 1 (substitution)                             │
│  User typed:   "3x^2 + 12x - 5" (the final answer!)        │
│  Result:       finalAnswerDetected = true                    │
│                isCorrect = false (wrong position)            │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Return Validation Result                            │
│  {                                                           │
│    isCorrect: boolean,           // true if matches & right pos│
│    finalAnswerDetected: boolean, // true if final ans wrong pos│
│    tokenFeedback: TokenFeedback[] // Wordle-style feedback   │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

### Phase 4: State Updates

```
┌──────────────────────────────────────────────────────────────┐
│         USER INPUT: validateIndividualLine()                 │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Update Validation State                             │
│  setLineValidationStates(lineIndex → validation)            │
│                                                              │
│  Map<number, SimpleValidationResult>:                        │
│  {                                                           │
│    0: { isCorrect: true, finalAnswerDetected: false, ... }  │
│    1: { isCorrect: false, finalAnswerDetected: false, ... } │
│    2: { isCorrect: true, finalAnswerDetected: false, ... }  │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Update Validation Trigger                           │
│  setValidationTriggers(lineIndex → 'enter')                 │
│                                                              │
│  Map<number, 'enter' | null>:                               │
│  {                                                           │
│    0: 'enter',  // Validated by pressing Enter              │
│    1: 'enter',  // Validated by pressing Enter              │
│    2: null      // Not yet validated                        │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

### Phase 5: Feedback Decision Tree

```
                      ┌─ VALIDATION RESULT ─┐
                      │   isCorrect: ?      │
                      └──────────┬──────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
        ┌────────────────┐              ┌────────────────┐
        │   isCorrect    │              │   isCorrect    │
        │    = TRUE      │              │    = FALSE     │
        └───────┬────────┘              └───────┬────────┘
                │                               │
                ▼                               ▼
    ┌───────────────────────┐      ┌────────────────────────┐
    │ ✅ CORRECT HANDLING   │      │ ❌ WRONG HANDLING      │
    └───────────────────────┘      └────────────────────────┘
                │                               │
                │                               │
                ▼                               ▼
    ┌───────────────────────┐      ┌────────────────────────┐
    │ 1. Show success toast │      │ 1. Increment counter   │
    │    - "Perfect!"       │      │    wrongAttemptCounter++│
    │    - "First try!"     │      │                        │
    │                       │      │ 2. Add to history      │
    │ 2. Reset counters     │      │    attemptHistory.push()│
    │    - wrongAttemptCtr=0│      │                        │
    │    - attemptHistory=[]│      │ 3. Check cycle count   │
    │    - shortHintCtr=0   │      │    if count % 3 === 0  │
    │    - modalShown=false │      │                        │
    │                       │      └───────┬────────────────┘
    │ 3. Dismiss toast      │              │
    │    if active          │              ▼
    │                       │      ┌────────────────────────┐
    │ 4. Calculate progress │      │ Every 3rd Wrong Attempt│
    │    - Mark step complete│     └────────┬───────────────┘
    │    - Update percentage │              │
    │                       │      ┌────────┴────────┐
    │ 5. Create new line    │      │                 │
    │    if not last step   │      ▼                 ▼
    └───────────────────────┘  ┌──────────┐   ┌──────────────┐
                              │ Cycles 1-4│   │  Cycle 5     │
                              │ & 6+      │   │ (15th wrong) │
                              └─────┬─────┘   └──────┬───────┘
                                    │                │
                                    ▼                ▼
                        ┌──────────────────┐  ┌─────────────┐
                        │  Show Toast Hint │  │Show Feedback│
                        │  - AI template   │  │   Modal     │
                        │  - Curated hint  │  │  - User input│
                        │  - Generic hint  │  │  - Expected  │
                        │                  │  │  - Scaffold  │
                        │  Dismiss previous│  │             │
                        │  toast first!    │  │ Dismiss toast│
                        └──────────────────┘  │ first!      │
                                              └─────────────┘
```

### Phase 6: Progress Calculation

```
┌──────────────────────────────────────────────────────────────┐
│      INPUT VALIDATOR: getCompletionStatus()                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Input Parameters:                                           │
│  - currentLines: ["x^2+4x", "g(f(x))=3(x^2+4x)-5", "..."]  │
│  - expectedSteps: [Step1, Step2, Step3]                     │
│  - lineValidationStates: Map<index, validation>             │
│  - validationTriggers: Map<index, 'enter'>                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Count Steps                                         │
│  - totalSteps = expectedSteps.length                         │
│  - nonEmptyLines = filter lines with content                 │
│  - completedSteps = nonEmptyLines.length                     │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Check Each Validated Step                           │
│  FOR each step index:                                        │
│    validatedResult = lineValidationStates.get(i)            │
│    isValidated = validationTriggers.get(i) === 'enter'      │
│                                                              │
│    IF validatedResult AND isValidated:                       │
│      IF isCorrect:                                           │
│        correctSteps++                                        │
│        stepCorrectness[i] = true                             │
│      ELSE:                                                   │
│        stepCorrectness[i] = false                            │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Calculate Progress Percentage                       │
│                                                              │
│  Base Formula:                                               │
│  perStep = 100 / totalSteps                                  │
│                                                              │
│  Example (3 steps): perStep = 33.33%                        │
│                                                              │
│  FOR each step:                                              │
│    IF correct:                                               │
│      baseProgress += perStep (33.33%)                        │
│                                                              │
│    ELSE IF wrong but attempted:                              │
│      Check consolation eligibility:                          │
│      - If userLength > expectedLength + 3: NO consolation   │
│      - Otherwise: consolation = (perStep / expectedLength   │
│                                  / 2) × min(userLength,      │
│                                           expectedLength)    │
│                                                              │
│  totalProgress = baseProgress + consolationProgress          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Return CompletionStatus                             │
│  {                                                           │
│    totalSteps: 3,                                           │
│    completedSteps: 3,                                        │
│    correctSteps: 2,                                          │
│    isComplete: true,                                         │
│    allCorrect: false,                                        │
│    percentage: 75.5,           // base + consolation        │
│    baseProgress: 66.67,         // 2 correct × 33.33%       │
│    consolationProgress: 8.83,   // partial credit           │
│    stepCorrectness: [true, false, true],                    │
│    finalAnswerDetected: false,                               │
│    finalAnswerPosition: -1                                   │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Validation Pipeline

### Multiple Answer Matching

```
┌──────────────────────────────────────────────────────────────┐
│            matchesAnyAnswer() Helper Method                  │
└──────────────────────────────────────────────────────────────┘

Input:
  userInput: "3x + x^2 - 5"
  expectedAnswers: ["x^2 + 3x - 5", "3x + x^2 - 5", "x^2 - 5 + 3x"]

Process:
  1. Normalize to array (already array)
  2. Sanitize user input: "3x+x^2-5"
  3. Loop through variants:
     - Variant 1: "x^2+3x-5" → sanitized: "x^2+3x-5"
       Compare: "3x+x^2-5" === "x^2+3x-5" → ❌ No match

     - Variant 2: "3x+x^2-5" → sanitized: "3x+x^2-5"
       Compare: "3x+x^2-5" === "3x+x^2-5" → ✅ MATCH!

  Return: {
    matches: true,
    matchedVariant: "3x + x^2 - 5",
    totalVariants: 3
  }

Console Output:
  ✅ Match found! User input matched variant 2/3: "3x + x^2 - 5"
```

### Token Feedback Generation

```
┌──────────────────────────────────────────────────────────────┐
│         tokenUtils.ts: generateTokenFeedback()               │
└──────────────────────────────────────────────────────────────┘

Example:
  User Input:    "x^2 + 2x - 5"
  Expected:      "x^2 + 3x - 5"

Step 1: Tokenize
  userTokens:     ["x^2", "+", "2x", "-", "5"]
  expectedTokens: ["x^2", "+", "3x", "-", "5"]

Step 2: Generate Feedback
  [
    { token: "x^2", status: "correct",   position: 0 },
    { token: "+",   status: "correct",   position: 1 },
    { token: "2x",  status: "wrong",     position: 2 },  ← Wrong
    { token: "-",   status: "correct",   position: 3 },
    { token: "5",   status: "correct",   position: 4 }
  ]

Visual Rendering (FeedbackOverlay):
  ┌────┬───┬────┬───┬───┐
  │ x² │ + │ 2x │ - │ 5 │
  └────┴───┴────┴───┴───┘
   🟢   🟢   🔴   🟢   🟢
```

---

## Feedback System

### Toast Hint Flow

```
┌──────────────────────────────────────────────────────────────┐
│              showHintMessage() - Toast Display               │
└──────────────────────────────────────────────────────────────┘

Trigger: Every 3rd wrong attempt (cycles 1, 2, 3, 4, 6+)

Step 1: Analyze User Behavior
  - Use BehaviorAnalyzer to classify error type
  - Types: sign-error, magnitude-error, close-attempt,
           repetition, guessing, random

Step 2: Extract Wrong Tokens
  - Get token feedback from validation
  - Identify which tokens are wrong
  - Format: "2x" (user typed "2x" instead of "3x")

Step 3: Generate Hint
  Priority Order:
    1. AI Behavior Templates (from HintGeneratorService)
       - Context-aware templates with placeholders
       - Fill: {wrongPart}, {stepLabel}, {behaviorDescription}

    2. Curated Hints (from CuratedHintLoader)
       - Topic-specific, category-specific hints
       - Keys: "topicId-categoryId-stepLabel-behaviorType"

    3. Generic Fallback Hints
       - Hardcoded generic messages
       - Used if no templates/curated hints available

Step 4: Display Toast
  - Dismiss previous toast (if active)
  - Create new toast with teal theme
  - Store toast ID for future dismissal
  - Duration: 3.5 seconds
  - Position: top-center

Step 5: Track State
  - Store activeToastIdRef.current = toastId
  - Increment attemptsSinceLastHint
  - Update lastBehaviorClassification
```

### Feedback Modal Flow

```
┌──────────────────────────────────────────────────────────────┐
│            FeedbackModal - After 15 Wrong Attempts           │
└──────────────────────────────────────────────────────────────┘

Trigger: 5th cycle (15th wrong attempt)

Step 1: Dismiss Active Toast
  - if (activeToastIdRef.current)
  - toast.dismiss(activeToastIdRef.current)
  - activeToastIdRef.current = null

Step 2: Set Modal Data
  - userInput: sanitized user's wrong answer
  - correctAnswer: expected answer (first variant)

Step 3: Open Modal
  - setIsModalOpen(true)
  - setModalShown(true) // Prevent reopening

Step 4: Modal Display
  Sections:
    1. Your Input
       - MathLive rendering
       - ASCII fallback
       - Readable text: "x to the power of 2 + 3x - 5"

    2. Expected Format
       - MathLive rendering
       - ASCII fallback
       - Readable text

    3. Scaffold Hint
       - Template with fill-in-the-blank
       - Step-by-step guide
       - Readable text

Step 5: User Closes Modal
  - handleModalClose()
  - setIsModalOpen(false)
  - Clear toast reference
  - User can continue attempting (short hints resume)
```

---

## State Management

### Key State Variables

```typescript
// User Input Component State

// Validation tracking
lineValidationStates: Map<number, SimpleValidationResult | null>
  // Stores validation result for each line
  // Updated when user presses Enter

validationTriggers: Map<number, 'enter' | null>
  // Tracks which lines were validated by Enter press
  // Used to distinguish validated vs. typed-only lines

// Wrong attempt tracking
wrongAttemptCounter: number
  // Increments on each wrong attempt
  // Resets to 0 every 3rd attempt (after triggering feedback)

attemptHistory: string[]
  // Stores all wrong attempts for current step
  // Cleared on correct answer

shortHintCounter: number
  // Tracks number of toast cycles shown
  // Cycle 1-4, skip 5 (modal), then 6+

modalShown: boolean
  // Flag to prevent modal from showing multiple times
  // Set to true after modal displays once

// Toast management
activeToastIdRef: useRef<string | null>
  // Stores ID of currently displayed toast
  // Used for dismissing before showing new toast

// Modal state
isModalOpen: boolean
  // Controls modal visibility

modalData: { userInput: string; correctAnswer: string } | null
  // Data passed to FeedbackModal
```

### State Update Sequence

```
User Presses Enter (Wrong Answer)
  │
  ├─▶ validateIndividualLine()
  │     │
  │     ├─▶ InputValidator.validateStepSimple()
  │     │     └─▶ Returns: SimpleValidationResult
  │     │
  │     ├─▶ setLineValidationStates(index, result)
  │     ├─▶ setValidationTriggers(index, 'enter')
  │     │
  │     └─▶ Check isCorrect
  │           │
  │           ├─▶ if TRUE:
  │           │     ├─ showSuccessMessage()
  │           │     ├─ setWrongAttemptCounter(0)
  │           │     ├─ setAttemptHistory([])
  │           │     ├─ setShortHintCounter(0)
  │           │     ├─ setModalShown(false)
  │           │     └─ toast.dismiss(activeToastIdRef)
  │           │
  │           └─▶ if FALSE:
  │                 ├─ setAttemptHistory(prev => [...prev, input])
  │                 └─ setWrongAttemptCounter(prev => prev + 1)
  │                       │
  │                       └─▶ if newCount === 3:
  │                             ├─ setShortHintCounter(prev => prev + 1)
  │                             │     │
  │                             │     └─▶ if newHintCount === 5:
  │                             │           ├─ toast.dismiss()
  │                             │           ├─ setModalData()
  │                             │           ├─ setIsModalOpen(true)
  │                             │           └─ setModalShown(true)
  │                             │       else:
  │                             │           └─ showHintMessage()
  │                             │
  │                             └─ return 0 (reset counter)
  │
  └─▶ getCompletionStatus()
        └─▶ Calculate progress percentage
```

---

## Error Handling

### Sanitization Fallbacks

```
┌──────────────────────────────────────────────────────────────┐
│                   LaTeX Conversion Errors                    │
└──────────────────────────────────────────────────────────────┘

Primary Method: MathLive's convertLatexToAsciiMath()
  try {
    const asciiMath = convertLatexToAsciiMath(latex);
    return asciiMath.normalize();
  } catch (error) {
    // Fallback to manual cleaning
  }

Fallback Method: cleanLatexFallback()
  - Pattern-based replacement
  - \frac{a}{b} → (a)/(b)
  - \sqrt{x} → sqrt(x)
  - Remove remaining \, {, }
  - Normalize whitespace

Edge Cases Handled:
  ✅ Empty input → return ""
  ✅ No LaTeX syntax → basic sanitization
  ✅ Invalid LaTeX → fallback cleaning
  ✅ Nested structures → recursive replacement
  ✅ Color commands → strip before processing
```

### Validation Edge Cases

```
┌──────────────────────────────────────────────────────────────┐
│                   Special Case Handling                      │
└──────────────────────────────────────────────────────────────┘

1. Final Answer in Wrong Position
   Detection:
     - User types final answer at earlier step
     - finalAnswerDetected = true
     - isCorrect = false (overridden)

   Feedback:
     - Rejected as incorrect
     - User must follow step-by-step process

2. Multiple Acceptable Answers
   Example:
     - "x^2 + 3x - 5"
     - "3x + x^2 - 5"
     - "x^2 - 5 + 3x"

   Handling:
     - Loop through all variants
     - Match on ANY variant
     - Log which variant matched

3. Empty/Default Placeholder Values
   Detection:
     - line.trim() === '7' && !trigger

   Action:
     - Skip validation
     - Don't count as attempt

4. Excess Character Penalty
   Rule:
     - If userLength > expectedLength + 3
     - No consolation progress awarded

   Rationale:
     - Prevent spam attempts from gaining progress
     - Encourage thoughtful answers

5. Non-validated Lines
   Status:
     - User typed but didn't press Enter
     - validationTriggers.get(i) !== 'enter'

   Treatment:
     - Not counted in progress
     - Not counted as correct/wrong
     - Ignored in completion status
```

---

## Summary Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPLETE USER INPUT FLOW                      │
└─────────────────────────────────────────────────────────────────┘

USER TYPES
    │
    ▼
┌────────────────┐
│   MathField    │  Real-time: Color feedback (optional)
│   (MathLive)   │  - Character-by-character comparison
└───────┬────────┘  - Debounced 1 second
        │
        │ User presses ENTER
        ▼
┌────────────────────────────────────────────┐
│     validateIndividualLine()               │
│                                            │
│  1. Get line content                       │
│  2. Get expected step                      │
│  3. Call InputValidator.validateStepSimple()│
│     │                                      │
│     ├─▶ sanitizeTextMathLive()            │
│     │   - Clean invisible chars           │
│     │   - Convert LaTeX → ASCII           │
│     │   - Normalize whitespace            │
│     │                                      │
│     ├─▶ matchesAnyAnswer()                │
│     │   - Check ALL answer variants       │
│     │   - Return match result             │
│     │                                      │
│     ├─▶ generateTokenFeedback()           │
│     │   - Tokenize user & expected        │
│     │   - Compare token-by-token          │
│     │   - Return Wordle-style feedback    │
│     │                                      │
│     └─▶ Check final answer position       │
│         - Detect if final answer too early│
│         - Flag as incorrect if so         │
│                                            │
│  4. Update lineValidationStates            │
│  5. Update validationTriggers              │
└───────────┬────────────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │   Is Correct? │
    └───────┬───────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌─────────┐    ┌──────────┐
│  TRUE   │    │  FALSE   │
└────┬────┘    └─────┬────┘
     │               │
     │               ▼
     │      ┌─────────────────┐
     │      │ wrongAttemptCtr++│
     │      └────────┬─────────┘
     │               │
     │               │ Count % 3 === 0?
     │               ├────────────────┐
     │               │                │
     │               ▼                ▼
     │         ┌─────────┐      ┌─────────┐
     │         │ Count=3 │      │ Count≠3 │
     │         └────┬────┘      └─────────┘
     │              │
     │              ▼
     │      ┌────────────────┐
     │      │ shortHintCtr++ │
     │      └───────┬────────┘
     │              │
     │              │ hintCount === 5?
     │              ├────────────────┐
     │              │                │
     │              ▼                ▼
     │      ┌──────────────┐  ┌─────────────┐
     │      │ Show Modal   │  │ Show Toast  │
     │      │ (15th wrong) │  │ Hint        │
     │      └──────────────┘  └─────────────┘
     │
     ▼
┌────────────────────┐
│ showSuccessMessage │
│ Reset counters     │
│ Dismiss toast      │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────┐
│ getCompletionStatus │
│                     │
│ Calculate:          │
│ - Base progress     │
│ - Consolation       │
│ - Total percentage  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│ Update UI:           │
│ - Progress bar       │
│ - Feedback overlay   │
│ - Line indicators    │
│ - Toast/Modal        │
└──────────────────────┘
```

---

## Key Takeaways

### For Developers

1. **Sanitization is Critical**

   - Always use `sanitizeTextMathLive()` for comparison
   - Handles LaTeX, Unicode, whitespace
   - Fallback system ensures robustness

2. **Multiple Answer Support**

   - Use `matchesAnyAnswer()` helper
   - Supports equivalent mathematical expressions
   - Logs which variant matched for debugging

3. **Token Feedback is Separate**

   - Always generated regardless of correctness
   - Used for visual Wordle-style overlay
   - Based on first answer variant (reference)

4. **Validation ≠ Typing**

   - Only count validated lines (Enter pressed)
   - Use `validationTriggers` to distinguish
   - Prevent premature progress calculation

5. **Toast Management**
   - Always dismiss previous toast before new one
   - Store toast ID in ref
   - Clear on correct answer, modal open, question reset

### For Users

1. **Real-time Feedback**

   - Colors while typing (green/red/gray)
   - Shows what's correct immediately
   - Updates as you type

2. **Step-by-Step Validation**

   - Press Enter to validate each line
   - Get immediate right/wrong feedback
   - Progress bar updates on validation

3. **Helpful Hints**

   - Toast appears every 3 wrong attempts
   - Context-aware suggestions
   - Highlight specific errors

4. **Comprehensive Feedback**
   - Modal after 15 wrong attempts
   - Shows your answer vs. expected
   - Readable text explanations
   - Step-by-step scaffold

---

## Related Documentation

- `UserInputValidator.tsx` - Validation service implementation
- `UserInput.tsx` - Main input component
- `tokenUtils.ts` - Token feedback generation
- `FEATURE_TOAST_REPLACEMENT_AND_MODAL_DISMISSAL.md` - Toast management
- `FEATURE_LATEX_TO_READABLE_TEXT.md` - LaTeX conversion
- `IMPLEMENTATION_AI_BEHAVIOR_TEMPLATES.md` - Hint generation

---

## Revision History

| Date       | Version | Changes                                          |
| ---------- | ------- | ------------------------------------------------ |
| 2025-10-15 | 1.0     | Initial comprehensive process flow documentation |
