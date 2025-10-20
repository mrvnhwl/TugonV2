# Quick Reference: Math Field vs Input Condition

## Question: When does UserInput use `<math-field>` vs normal `<input>`?

## Answer: Based on Step Label

The condition is controlled by the `shouldUseMathMode()` function in **UserInput.tsx** (line 475).

---

## The Condition Function

```typescript
const shouldUseMathMode = useCallback(
  (lineIndex: number): boolean => {
    if (!expectedSteps || lineIndex >= expectedSteps.length) {
      return false; // Default to text mode if no step info
    }

    const stepLabel = expectedSteps[lineIndex].label;

    // Math mode for mathematical operations
    const mathLabels = [
      "choose",
      "evaluation",
      "substitution",
      "simplification",
      "final",
      "math",
    ];

    return mathLabels.includes(stepLabel); //mathlive
  },
  [expectedSteps]
);
```

**Location**: `src/components/tugon/input-system/UserInput.tsx` - Line 475

---

## How It Works

### 1. **Checks Expected Steps**

- If `expectedSteps` is undefined or the line index is out of bounds → **Returns `false`** (uses text input)
- Otherwise, checks the `label` field of the current step

### 2. **Checks Step Label**

- Gets the `label` from `expectedSteps[lineIndex].label`
- Checks if the label is in the `mathLabels` array

### 3. **Math Labels Array**

The following step labels trigger **Math Mode** (`<math-field>`):

- `"choose"`
- `"evaluation"`
- `"substitution"`
- `"simplification"`
- `"final"`
- `"math"`

### 4. **Returns Boolean**

- `true` → Renders `<math-field>` (MathLive editor)
- `false` → Renders `<input>` (normal text input)

---

## Usage in Code

### In UserInput Render (Line 2006)

```tsx
{
  shouldUseMathMode(index) ? (
    // Math Field Mode - MathLive editor
    <div className="flex-1 flex items-stretch gap-2">
      <div className="flex-1 min-w-0">
        <math-field
          ref={setInputRef(index)}
          value={line}
          placeholder={getStepPlaceholder(index)}
          // ... MathLive props
        />
      </div>
    </div>
  ) : (
    // Text Mode - Normal input
    <input
      ref={setInputRef(index)}
      type="text"
      value={line}
      onChange={(e) => handleLineChange(index, e.target.value)}
      // ... Standard input props
    />
  );
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ AnswerWizard Component                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Fetches answer steps from Supabase                          │
│     → tugonsense_answer_steps table                             │
│     → Gets: label, answer_variants, placeholder                 │
│                                                                  │
│  2. Passes expectedSteps to UserInput                           │
│     expectedSteps = answersSource?.[index]?.steps               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ UserInput Component                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  3. For each line (step):                                       │
│     → Calls shouldUseMathMode(index)                            │
│     → Checks expectedSteps[index].label                         │
│                                                                  │
│  4. Decision Logic:                                             │
│     IF label in ["choose", "evaluation", "substitution",        │
│                  "simplification", "final", "math"]             │
│        → Render <math-field> (MathLive)                         │
│     ELSE                                                         │
│        → Render <input> (Text)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Reference

### tugonsense_answer_steps Table

```sql
CREATE TABLE tugonsense_answer_steps (
  -- ... other fields
  label TEXT NOT NULL,  -- ⭐ THIS FIELD determines Math Mode
  answer_variants JSONB NOT NULL,
  placeholder TEXT,
  -- ... other fields
);
```

**Key Field**: `label`

- Stored in Supabase database
- Controls whether step uses MathLive or text input
- Set when creating/editing answer steps in TopicSelector

---

## Example Step Labels

### ✅ Math Mode Enabled (MathLive Editor)

```typescript
{
  label: "evaluation";
} // f(2) = 2² + 3
{
  label: "substitution";
} // Replace x with 2
{
  label: "simplification";
} // 4 + 3 = 7
{
  label: "final";
} // Answer: 7
{
  label: "choose";
} // Select formula
{
  label: "math";
} // Generic math operation
```

### ❌ Math Mode Disabled (Text Input)

```typescript
{
  label: "direction";
} // "Substitute x with the given value"
{
  label: "explanation";
} // "We use the power rule here"
{
  label: "note";
} // "Remember to simplify"
{
  label: "comment";
} // Any other label not in mathLabels
```

---

## Where Labels Are Set

### 1. **TopicSelector - Edit Question Modal**

- Location: `src/pages/tugonsenseproblem/TopicSelector.tsx`
- Line: ~2655 (Step Form Section)
- Dropdown with label options

### 2. **TopicSelector - Add Question Modal**

- Location: `src/pages/tugonsenseproblem/TopicSelector.tsx`
- Line: ~3070 (Step Form Section)
- Same dropdown for consistency

### 3. **Database Direct Insert**

- Can set `label` field when inserting to `tugonsense_answer_steps`
- Must use one of the recognized values for math mode

---

## Important Notes

### ⚠️ Case Sensitive

The label comparison is **case-sensitive**:

- ✅ `"evaluation"` → Math Mode
- ❌ `"Evaluation"` → Text Mode
- ❌ `"EVALUATION"` → Text Mode

### ⚠️ Default Behavior

If `expectedSteps` is not provided or is `undefined`:

- **All steps default to Text Mode** (normal `<input>`)
- Math mode requires valid `expectedSteps` data

### ⚠️ No mathMode Prop

Although `AnswerWizard` has a `mathMode?: boolean` prop defined (line 65), it is:

- **Not used** in the current implementation
- **Not passed** to `UserInput`
- The label-based approach is used instead

---

## Testing

### To Test Math Mode:

1. Go to TopicSelector → Edit/Add Question
2. Add answer steps with label: **"evaluation"** or **"substitution"**
3. Save the question
4. Open the question in AnswerWizard
5. **Result**: Step shows MathLive editor with math symbols

### To Test Text Mode:

1. Go to TopicSelector → Edit/Add Question
2. Add answer steps with label: **"direction"** or **"explanation"**
3. Save the question
4. Open the question in AnswerWizard
5. **Result**: Step shows normal text input field

---

## Related Files

- **UserInput.tsx** - Contains `shouldUseMathMode()` function
  - `src/components/tugon/input-system/UserInput.tsx`
- **AnswerWizard.tsx** - Passes `expectedSteps` to UserInput
  - `src/components/tugon/input-system/AnswerWizard.tsx`
- **TopicSelector.tsx** - UI for setting step labels
  - `src/pages/tugonsenseproblem/TopicSelector.tsx`
- **Database Table** - Stores step labels
  - `tugonsense_answer_steps` table in Supabase

---

## Quick Answer

**Q: When is `<math-field>` used instead of `<input>`?**

**A: When the step's `label` field (from Supabase) is one of these values:**

- `"choose"`
- `"evaluation"`
- `"substitution"`
- `"simplification"`
- `"final"`
- `"math"`

**All other labels use normal text input.**
