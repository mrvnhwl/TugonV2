# Quick Reference: AI Behavior Templates System

## 🎯 What Is This?

A simplified AI-powered hint system that generates universal templates once per session and fills them with runtime context to provide personalized feedback.

---

## 🔧 Core Components

### 1. **feedbackExtractor.ts**

Extracts wrong/misplaced/extra tokens from FeedbackOverlay

```typescript
import {
  extractWrongTokensFromFeedback,
  formatWrongTokensForHint,
} from "../services/feedbackExtractor";

// Usage
const { wrongTokens, misplacedTokens, extraTokens } =
  extractWrongTokensFromFeedback(tokenFeedback);

const wrongPart = formatWrongTokensForHint(
  wrongTokens,
  misplacedTokens,
  extraTokens
);
// Returns: '"+"', '"-" and "+"', '"+" and 2 more'
```

### 2. **hintGenerator.ts**

Generates AI behavior templates with 24-hour cache

```typescript
import { HintGeneratorService } from "../services/hintGenerator";

// Usage
const hintService = new HintGeneratorService();
const templates = await hintService.generateBehaviorTemplates();

// Returns: BehaviorTemplates with 8 behaviors × 3 variations = 24 templates
```

### 3. **UserInput.tsx**

Integrates everything with toast.custom()

```typescript
// State
const [behaviorTemplates, setBehaviorTemplates] =
  useState<BehaviorTemplates | null>(null);

// Load once on mount
useEffect(() => {
  const loadTemplates = async () => {
    const hintService = new HintGeneratorService();
    const templates = await hintService.generateBehaviorTemplates();
    setBehaviorTemplates(templates);
  };
  loadTemplates();
}, []);

// Fill template with context
const fillHintTemplate = (template, behavior, wrongPart, stepLabel) => {
  return template
    .replace(/\{behavior\}/g, behavior)
    .replace(/\{wrongPart\}/g, wrongPart)
    .replace(/\{stepLabel\}/g, stepLabel);
};
```

---

## 📋 How It Works (Simplified)

```
User submits wrong answer (3rd attempt)
  ↓
Extract wrong tokens from FeedbackOverlay
  ↓
Analyze behavior pattern (BehaviorAnalyzer)
  ↓
Select matching AI template
  ↓
Fill placeholders with runtime context
  ↓
Display toast with personalized hint
```

---

## 🎨 Placeholder System

### 3 Placeholders (filled at runtime)

1. **`{behavior}`** - What the student is doing wrong

   - Example: "confusing plus and minus signs"

2. **`{wrongPart}`** - The specific wrong tokens

   - Example: '"+"/"-"' or '"42" and 2 more'

3. **`{stepLabel}`** - Current step name
   - Example: "substitution", "evaluation", "final answer"

### Example Template

```
"Hey there, I see you're {behavior} with {wrongPart} in the {stepLabel}."
```

### Filled Result

```
"Hey there, I see you're confusing plus and minus signs with "+" in the substitution."
```

---

## 🔄 Behavior Types (8 Total)

| BehaviorAnalyzer Type | HintTemplate Type | Description          |
| --------------------- | ----------------- | -------------------- |
| `sign-error`          | `sign-error`      | Confusing +/- signs  |
| `magnitude-error`     | `magnitude-error` | Off by large amount  |
| `close-attempt`       | `close-attempt`   | Nearly correct       |
| `guessing`            | `guessing`        | Random attempts      |
| `repetition`          | `repeating`       | Same answer repeated |
| `random`              | `general`         | General mistakes     |
| `default`             | `general`         | Generic errors       |
| `self-correction`     | `self-correction` | Making progress      |

---

## 💾 Caching Strategy

```typescript
// Templates cached for 24 hours
expiresIn: 86400000 ms

// Check cache on each generateBehaviorTemplates() call
if (cachedTemplates && age < expiresIn) {
  return cachedTemplates; // Reuse
}

// Otherwise, generate new templates via AI
```

**Benefits:**

- One API call per day per user session
- ~$0.001/day vs ~$0.004/question
- 97.5% cost reduction

---

## 🎯 3-Tier Hint Priority

```typescript
// 1. AI-generated templates (preferred)
if (behaviorTemplates) {
  hint = selectAndFillTemplate();
}

// 2. Curated hints from registry (if context available)
else if (topicId && categoryId && questionId) {
  hint = getStepHint(...);
}

// 3. Hardcoded fallbacks (always available)
else {
  hint = genericFallbackHint();
}
```

---

## 🧪 Quick Test

### Test Sign Error

1. Enter wrong answer with incorrect sign: `2-3` instead of `2+3`
2. Submit 3 times
3. Expect toast: "⚠️ Hey there, looks like you're confusing plus and minus signs with "-" in the substitution..."

### Test Guessing

1. Enter random answers: "abc", "xyz", "123"
2. Submit 3 times each
3. Expect toast: "🎲 I see you're trying random answers..."

---

## 📊 Debug Console Logs

```typescript
// Template loading
✅ AI behavior templates loaded: { templates: [...], generatedAt: ..., expiresIn: ... }

// Toast trigger
🔔 TOAST TRIGGERED: {
  type: "sign-error",
  wrongPart: '"-"',
  stepLabel: "substitution",
  behaviorDescription: "confusing plus and minus signs",
  usingAITemplate: true
}
```

---

## ⚙️ Configuration

### AI Endpoint

```typescript
AI_ENDPOINT = "/api/gemini-hint";
```

### Cache Duration

```typescript
expiresIn: 86400000; // 24 hours
```

### AI Settings

```typescript
temperature: 0.9; // High variety
maxTokens: 1200; // 24 templates
```

---

## 🚨 Troubleshooting

### Problem: Templates not loading

**Check:**

- Console for error messages
- Network tab for `/api/gemini-hint` call
- `behaviorTemplates` state value

### Problem: Generic hints showing instead of AI

**Check:**

- `behaviorTemplates` is not null
- `behaviorMap` correctly maps behavior types
- Template exists for behavior type

### Problem: Placeholders not filled

**Check:**

- `fillHintTemplate` function called
- All 3 arguments provided (behavior, wrongPart, stepLabel)
- Placeholder syntax matches: `{behavior}`, `{wrongPart}`, `{stepLabel}`

---

## 📚 Related Files

- `feedbackExtractor.ts` - Token extraction
- `hintGenerator.ts` - AI template generation
- `UserInput.tsx` - Integration & display
- `BehaviorAnalyzer.ts` - Behavior pattern detection
- `tokenUtils.ts` - Token feedback types
- `FeedbackOverlay.tsx` - Visual token feedback

---

## 🎉 Success Indicators

- ✅ Templates load on component mount
- ✅ Cache prevents redundant API calls
- ✅ Toast displays with teal styling
- ✅ Hints feel personalized and specific
- ✅ Fallback system works when AI fails

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Production Ready
