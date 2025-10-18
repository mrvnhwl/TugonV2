# Visual Flow: Hint System (Fixed)

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER MAKES 3 WRONG ATTEMPTS              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│          validateIndividualLine() detects error             │
│          wrongAttemptCounter reaches 3                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                showHintMessage() triggered                  │
│    • Analyzes behavior (BehaviorAnalyzer)                   │
│    • Gets stepLabel from expectedSteps                      │
│    • Extracts wrongPart from tokenFeedback                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃  PRIORITY 1: CURATED HINTS     ┃
        ┃  (category1.ts - category4.ts) ┃
        ┗━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━┛
                      │
                      ↓
        ┌─────────────────────────────────────┐
        │  getStepHint(topicId, categoryId,   │
        │              questionId, stepLabel,  │
        │              behaviorType)           │
        └───────────┬─────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Load HintCollections[topicId][categoryId]│
        │  Example: Topic1_Category1_Hints          │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Find question by questionId              │
        │  Example: questionId = 1                  │
        │  "If f(x) = 2x - 7, evaluate f(8)"        │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Find stepHint by stepLabel               │
        │  Example: "substitution"                  │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Get hint for behaviorType                │
        │  Example: "repetition" → repetitionHint   │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Is hint an array?                        │
        │  ✓ YES                                    │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Randomly select 1 of 3 variations        │
        │  Math.floor(Math.random() * 3)            │
        │  Example: variation[1] selected           │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────────────────────┐
        │  Return hint string                       │
        │  ": Hmm, still the same result..."  │
        └───────────┬───────────────────────────────┘
                    │
                    ↓
              ┌──────────┐
              │ Found?   │
              └──┬───┬───┘
                YES  NO
                 │    │
      ┌──────────┘    └──────────┐
      │                           │
      ↓                           ↓
┏━━━━━━━━━━━━━━━┓    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Display Hint   ┃    ┃ PRIORITY 2: AI TEMPLATES┃
┃ in toast.custom┃    ┃ (behaviorTemplates)      ┃
┗━━━━━━━━━━━━━━━┛    ┗━━━━━━━━━┯━━━━━━━━━━━━━━┛
                                  │
                                  ↓
                        ┌─────────────────────────┐
                        │ Map behavior type       │
                        │ Select random template  │
                        │ Fill placeholders       │
                        └──────────┬──────────────┘
                                   │
                                   ↓
                             ┌──────────┐
                             │ Found?   │
                             └──┬───┬───┘
                               YES  NO
                                │    │
                     ┌──────────┘    └───────────┐
                     │                            │
                     ↓                            ↓
              ┏━━━━━━━━━━━━━━━┓    ┏━━━━━━━━━━━━━━━━━━━━━┓
              ┃ Display AI Hint┃    ┃ PRIORITY 3: HARDCODED┃
              ┃ in toast.custom┃    ┃ (Generic fallback)    ┃
              ┗━━━━━━━━━━━━━━━┛    ┗━━━━━━━━━┯━━━━━━━━━━━┛
                                                 │
                                                 ↓
                                    ┌────────────────────────┐
                                    │ Use hardcoded messages │
                                    │ Based on behavior type │
                                    └──────────┬─────────────┘
                                               │
                                               ↓
                                    ┏━━━━━━━━━━━━━━━━━━━━┓
                                    ┃ Display Generic Hint┃
                                    ┃ in toast.custom     ┃
                                    ┗━━━━━━━━━━━━━━━━━━━━┛
```

---

## 📊 Before vs After

### ❌ BEFORE (Broken)

```
User makes 3 wrong attempts
    ↓
showHintMessage()
    ↓
1️⃣ Check AI Templates → ✓ FOUND → Use AI hint ❌
    (Never reaches category files!)
```

**Result**: AI template message displayed

```
": I notice you're repeating the same answer.
Try a different approach with "x" in substitution - order of operations!"
```

---

### ✅ AFTER (Fixed)

```
User makes 3 wrong attempts
    ↓
showHintMessage()
    ↓
1️⃣ Check category1.ts → ✓ FOUND → Use curated hint ✅
```

**Result**: Curated message from category1.ts displayed

```
": Hmm, still the same result — maybe recheck
your substitution in 2(8)-7."
```

---

## 🎯 Priority Levels

### Level 1: Curated Hints (HIGHEST PRIORITY) ⭐

- **Source**: `category1.ts`, `category2.ts`, `category3.ts`, `category4.ts`
- **Total Messages**: 225+ variations
- **Format**: 3 variations per hint type
- **Tone**: Warm, encouraging coach style
- **Example**:
  ```typescript
  repetitionHint: [
    ": You're repeating the same step — try combining like terms now.",
    ": Let's simplify — maybe recompute each term separately first.",
    ": Try a fresh start; this step just needs clear arithmetic.",
  ];
  ```

### Level 2: AI Templates (FALLBACK)

- **Source**: `behaviorTemplates` from API/JSON
- **Format**: Template with placeholders `{behavior}`, `{wrongPart}`, `{stepLabel}`
- **Tone**: Generic but structured
- **Example**:
  ```typescript
  "I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel}!";
  ```

### Level 3: Hardcoded (LAST RESORT)

- **Source**: Switch statement in `UserInput.tsx`
- **Format**: Simple generic messages
- **Tone**: Basic encouragement
- **Example**:
  ```typescript
  "💡 \"wrong\" isn't quite right. Review the problem and check your work.";
  ```

---

## 🔍 How to Verify It's Working

### Console Output (Success)

```
📚 ✅ Using curated hint from Category 1 for behavior: repetition
🎲 Selected hint variation for behavior: repetition
🔔 TOAST TRIGGERED: {
  type: 'repetition',
  hint: ": Let's simplify — maybe recompute each term separately first.",
  usingAITemplate: false,  ← Key indicator!
  ...
}
```

### Console Output (AI Fallback)

```
❌ No hints found for Topic 1, Category 1, Question 99
🤖 Using AI template fallback for behavior: general
🔔 TOAST TRIGGERED: {
  hint: "I notice you're making general mistakes...",
  usingAITemplate: true,  ← AI template used
  ...
}
```

### Console Output (Hardcoded Fallback)

```
🔧 Using hardcoded fallback hint
🔔 TOAST TRIGGERED: {
  hint: "💡 Review the problem and check your work.",
  ...
}
```

---

## 📋 Quick Debugging Guide

### Problem: Still seeing AI template messages

**Check:**

1. ✓ Are `topicId`, `categoryId`, `questionId` props correct?
2. ✓ Does `stepLabel` match exactly (case-insensitive)?
3. ✓ Is behavior type mapped correctly?
4. ✓ Are category files exported correctly?

**Console Commands:**

```javascript
// In browser console:
console.log("Props:", { topicId, categoryId, questionId, stepLabel });
console.log("Hint found:", getStepHint(1, 1, 1, "substitution", "repetition"));
```

### Problem: No hints at all

**Check:**

1. ✓ Import statements in `hints/index.ts`
2. ✓ HintCollections registry populated
3. ✓ Category files export default

**Test:**

```typescript
import { getStepHint } from "./hints/index";
console.log(getStepHint(1, 1, 1, "substitution", "repetition"));
// Should return: ": You're repeating..." (one of 3 variations)
```

---

## 🎉 Success Indicators

- ✅ Toast shows messages from your category files
- ✅ Console shows `📚 ✅ Using curated hint`
- ✅ `usingAITemplate: false` in logs
- ✅ Hints match exact text from category1-4.ts
- ✅ 3 different variations cycle randomly
- ✅ Warm, encouraging tone
- ✅ No `{behavior}`, `{wrongPart}` placeholders in display

---

**All systems operational! Your 225+ curated hints are now live!** 🚀
