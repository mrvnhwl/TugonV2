# Information Flow: Toast.Custom Hints

## Overview

This document explains the complete data flow for generating intelligent toast hints in the TugonPlay application.

## Date Created

October 13, 2025

---

## Complete Information Flow

### 1. **User Input Submission**

**Location:** `UserInput.tsx` → `handleOnBlur()` function (Line ~800)

When user submits an answer:

```typescript
const validation = InputValidator.validateStepSimple(
  line.trim(), // User's input
  expectedStep.answer, // Expected answer(s) - string or string[]
  expectedStep.label, // Step label (e.g., "substitution", "evaluation")
  lineIndex, // Current step index
  expectedSteps // All steps for context
);
```

---

### 2. **Validation & Token Analysis**

**Location:** `UserInputValidator.tsx` → `validateStepSimple()` (Line ~204)

The validator:

#### A. Checks if answer is correct

```typescript
const matchResult = InputValidator.matchesAnyAnswer(userInput, expectedAnswer);
const isCorrect = matchResult.matches;
```

#### B. Generates Token Feedback (Wordle-style coloring)

```typescript
const userTokens = tokenizeMathString(userInput.trim());
const expectedTokens = tokenizeMathString(referenceAnswer.trim());
const tokenFeedback = generateTokenFeedback(userTokens, expectedTokens);
```

**Token Feedback Structure:**

```typescript
{
  token: string,           // The actual character/symbol
  status: 'correct' | 'wrong-position' | 'wrong' | 'extra',
  position: number         // Index in user input
}
```

#### C. Returns validation result

```typescript
return {
  isCorrect: boolean,
  finalAnswerDetected: boolean,
  tokenFeedback: TokenFeedback[]  // ← THIS IS KEY FOR HINTS
};
```

---

### 3. **Storing Validation State**

**Location:** `UserInput.tsx` → `handleOnBlur()` (Line ~812)

```typescript
setLineValidationStates((prev) => {
  const newMap = new Map(prev);
  newMap.set(lineIndex, validation); // ← Stores tokenFeedback here
  return newMap;
});
```

---

### 4. **Triggering Hint Display (If Wrong)**

**Location:** `UserInput.tsx` → `handleOnBlur()` (Line ~850+)

If answer is wrong:

```typescript
showHintMessage(
  sanitizedInput, // User's input
  correctAnswer, // Expected answer
  [...prev, sanitizedInput], // Attempt history
  lineIndex // Current step index
);
```

---

### 5. **Analyzing User Behavior**

**Location:** `UserInput.tsx` → `showHintMessage()` (Line ~330)

#### A. Behavior Analysis

```typescript
const analysis = BehaviorAnalyzer.analyze(
  userInput, // Current input
  correctAnswer, // Expected answer
  attemptHistory // Previous attempts
);
```

**Returns:** `{ type: 'sign-error' | 'repetition' | 'close-attempt' | 'magnitude-error' | 'guessing' | 'random' | 'default' }`

#### B. Get Step Information

```typescript
const stepLabel = expectedSteps[lineIndex]?.label || "this step";
```

**Possible stepLabels:**

- `"choose"` - Selection step
- `"substitution"` - Substituting values
- `"simplification"` - Simplifying expressions
- `"evaluation"` - Evaluating results
- `"final"` - Final answer
- `"math"` - Math expression
- `"text"` - Text input
- `"domain"` - Domain specification
- `"range"` - Range specification
- `"set"` - Set notation

---

### 6. **Extracting Wrong Tokens**

**Location:** `UserInput.tsx` → `showHintMessage()` (Line ~351)

```typescript
const currentValidation = lineValidationStates.get(lineIndex);
let wrongPart = "that part"; // Default fallback

if (currentValidation?.tokenFeedback) {
  const extracted = extractWrongTokensFromFeedback(
    currentValidation.tokenFeedback
  );
  wrongPart = formatWrongTokensForHint(
    extracted.wrongTokens, // Completely wrong tokens
    extracted.misplacedTokens, // Right token, wrong position
    extracted.extraTokens // Unexpected extra tokens
  );
}
```

**Example Output:**

- `"the + sign"` - If user used + instead of -
- `"the number 42"` - If number is wrong
- `"the x² term"` - If term is incorrect

---

### 7. **Generating Hint Message**

**Location:** `UserInput.tsx` → `showHintMessage()` (Line ~380)

Three-tier system:

#### **Tier 1: AI-Generated Templates (Preferred)**

```typescript
if (behaviorTemplates && behaviorTemplates.templates) {
  const selectedTemplate = templateObj.templates[randomIndex];

  // Fill placeholders with runtime data
  hint = fillHintTemplate(
    selectedTemplate,
    behaviorDescription, // e.g., "confusing plus and minus signs"
    wrongPart, // e.g., "the + sign"
    stepLabel // e.g., "substitution"
  );
}
```

**Template Example:**

```
"Hey there, I see you're {behavior}. Take another look at {wrongPart} in your {stepLabel}."
```

**Filled Example:**

```
"Hey there, I see you're confusing plus and minus signs. Take another look at the + sign in your substitution."
```

#### **Tier 2: Curated Context Hints (Fallback)**

```typescript
const contextHint = getStepHint(
  topicId, // Current topic (1-5)
  categoryId, // Category within topic
  questionId, // Specific question
  stepLabel, // Current step
  analysis.type // Behavior type
);
```

#### **Tier 3: Hardcoded Generic Hints (Final Fallback)**

```typescript
switch (analysis.type) {
  case "sign-error":
    hint = "⚠️ Double-check your signs (+ or -). The magnitude looks right!";
    break;
  case "repetition":
    hint = `🔁 You've tried "${userInput}" multiple times. Try a different approach.`;
    break;
  // ... more cases
}
```

---

### 8. **Rendering Enhanced Toast**

**Location:** `UserInput.tsx` → `showHintMessage()` (Line ~520)

#### A. Render with Visual Emphasis

```typescript
const renderEnhancedHint = (hintText: string) => {
  const parts = cleanHint.split(/(".*?"|'.*?'|\b\w+\b)/g);

  return parts.map((part, index) => {
    // Emphasize quoted wrong parts → Red bold background
    if (part.match(/^["'].*["']$/)) {
      return <span className="font-bold text-red-600 bg-red-50">{part}</span>;
    }

    // Emphasize step labels → Teal underlined
    if (stepLabel && part.toLowerCase() === stepLabel.toLowerCase()) {
      return (
        <span className="font-semibold text-teal-700 underline">{part}</span>
      );
    }

    return <span>{part}</span>;
  });
};
```

#### B. Display Toast

```typescript
toast.custom(
  (t) => (
    <div className="max-w-md bg-white border-l-8 border-teal-500 shadow-xl rounded-xl p-5">
      {/* Header with emoji and greeting */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-teal-500 rounded-full">
          {icon} {/* Emoji from hint message */}
        </div>
        <span className="font-bold text-xl text-teal-600">Hey there,</span>
      </div>

      {/* Message body with emphasized parts */}
      <div className="ml-12 text-gray-700 text-base leading-relaxed">
        {renderEnhancedHint(hint)} {/* ← Final hint with visual emphasis */}
      </div>
    </div>
  ),
  { duration: 3500, position: "top-center" }
);
```

---

## Data Sources Summary

### Input Data

| Source           | Data                              | Example                |
| ---------------- | --------------------------------- | ---------------------- |
| User             | `userInput`                       | `"2+3x"`               |
| Expected Answers | `expectedStep.answer`             | `["2+3x", "3x+2"]`     |
| Step Definition  | `expectedStep.label`              | `"substitution"`       |
| Attempt History  | `attemptHistory[]`                | `["2x", "3x", "2+3x"]` |
| Question Context | `topicId, categoryId, questionId` | `1, 2, 3`              |

### Generated Data

| Source            | Data              | Purpose                           |
| ----------------- | ----------------- | --------------------------------- |
| Tokenizer         | `userTokens[]`    | `["2", "+", "3", "x"]`            |
| Validator         | `tokenFeedback[]` | `[{token: "+", status: "wrong"}]` |
| Behavior Analyzer | `analysis.type`   | `"sign-error"`                    |
| Token Extractor   | `wrongPart`       | `"the + sign"`                    |
| Template System   | `hint`            | Full hint message                 |
| Icon Extractor    | `icon`            | `"⚠️"`                            |

### Processed Data

| Component              | Input                   | Output            |
| ---------------------- | ----------------------- | ----------------- |
| `fillHintTemplate()`   | Template + placeholders | Filled hint       |
| `renderEnhancedHint()` | Hint text               | JSX with emphasis |
| `toast.custom()`       | JSX + config            | Visual toast      |

---

## Example Complete Flow

### Input

- **User types:** `"2+3x"`
- **Expected answer:** `"2-3x"`
- **Step label:** `"substitution"`
- **Topic/Category/Question:** `1/2/3`

### Process

1. **Validator:** Tokenizes and compares

   - Finds `"+"` should be `"-"`
   - Generates `tokenFeedback: [{token: "+", status: "wrong"}]`

2. **Behavior Analyzer:** Detects `"sign-error"`

3. **Token Extractor:** Formats as `"the + sign"`

4. **Hint Generator:**

   - Looks for AI template for `"sign-error"`
   - Fills template: `"Hey there, I see you're confusing plus and minus signs. Take another look at the + sign in your substitution."`

5. **Renderer:**
   - Emphasizes `"the + sign"` in red bold
   - Emphasizes `"substitution"` in teal underlined
   - Shows with ⚠️ emoji badge

### Output

```
┌────────────────────────────────────────┐
│ ⚠️ Hey there,                          │
│                                        │
│    I see you're confusing plus and    │
│    minus signs. Take another look at  │
│    the + sign in your substitution.   │
│                                        │
│    [+ sign shown in red background]   │
│    [substitution shown with teal      │
│     underline]                         │
└────────────────────────────────────────┘
```

---

## Key Files

| File                     | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `UserInput.tsx`          | Main orchestration, state management, hint triggering |
| `UserInputValidator.tsx` | Validation logic, token feedback generation           |
| `tokenUtils.ts`          | Tokenization and token comparison                     |
| `BehaviorAnalyzer.ts`    | Behavior pattern detection                            |
| `feedbackExtractor.ts`   | Extract wrong tokens from feedback                    |
| `hintGenerator.ts`       | AI template generation service                        |
| `hints/index.ts`         | Curated hint registry                                 |

---

## Configuration

### Toast Settings

- **Duration:** 3500ms (3.5 seconds)
- **Position:** `top-center`
- **Style:** Teal border-left, white background, shadow

### Visual Emphasis

- **Wrong parts:** Red bold text, light red background
- **Step labels:** Teal bold text, teal underline

### Behavior Types

- `sign-error` - Wrong +/- signs
- `repetition` - Repeated attempts
- `close-attempt` - Nearly correct
- `magnitude-error` - Off by large amount
- `guessing` - Random attempts
- `random` - General mistakes
- `default` - Fallback

---

## Future Enhancements

1. **Context-Aware Templates**

   - Use topic/category-specific language
   - Reference specific problem context

2. **Adaptive Hints**

   - More detailed hints after multiple attempts
   - Simplified hints for quick mistakes

3. **Multilingual Support**

   - Generate templates in multiple languages
   - User preference selection

4. **Hint Effectiveness Tracking**
   - Track which hints lead to correct answers
   - A/B test different hint styles
