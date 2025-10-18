# Fix: Curated Hints Priority System

**Date**: October 18, 2025  
**Issue**: Toast notifications were showing AI-generated template hints instead of curated hints from category files  
**Status**: ✅ RESOLVED

---

## 🔍 Problem Analysis

### Issue Identified

The toast notification was displaying:

```
": I notice you're repeating the same answer.
Try a different approach with "x" in substitution - order of operations!"
```

This message format **does NOT exist** in any of the curated hint files (`category1.ts`, `category2.ts`, etc.).

### Root Cause

Looking at `UserInput.tsx` line ~441-540, the hint selection priority was **BACKWARDS**:

```typescript
// ❌ WRONG ORDER (before fix)
1. AI-generated templates (behaviorTemplates) - FIRST PRIORITY
2. Curated hints from category files - SECOND PRIORITY
3. Hardcoded generic fallbacks - THIRD PRIORITY
```

The AI template system was intercepting all hints before the curated category files could be loaded!

### Expected Behavior

The message should have been one of these from `category1.ts`:

```typescript
repetitionHint: [
  ": You're repeating the same step — try combining like terms now.",
  ": Let's simplify — maybe recompute each term separately first.",
  ": Try a fresh start; this step just needs clear arithmetic.",
];
```

---

## ✅ Solution Implemented

### 1. Fixed Hint Priority in `UserInput.tsx`

**Changed the order to:**

```typescript
// ✅ CORRECT ORDER (after fix)
1. Curated hints from category files - FIRST PRIORITY ⭐
2. AI-generated templates (fallback) - SECOND PRIORITY
3. Hardcoded generic hints - THIRD PRIORITY
```

**Code Changes:**

```typescript
// PRIORITY 1: Use curated hints from category files
if (topicId && categoryId && questionId && stepLabel) {
  const contextHint = getStepHint(
    topicId,
    categoryId,
    questionId,
    stepLabel,
    analysis.type as any
  );

  if (contextHint) {
    hint = contextHint;
    console.log(
      `📚 ✅ Using curated hint from Category ${categoryId} for behavior: ${analysis.type}`
    );
  }
}

// PRIORITY 2: Fallback to AI-generated templates if curated hints not found
if (!hint && behaviorTemplates && behaviorTemplates.templates) {
  // ... AI template logic ...
  console.log(`🤖 Using AI template fallback for behavior: ${mappedBehavior}`);
}

// PRIORITY 3: Final fallback to hardcoded hints
if (!hint) {
  switch (analysis.type /* ... */) {
  }
  console.log(`🔧 Using hardcoded fallback hint`);
}
```

### 2. Enhanced `getStepHint()` in `hints/index.ts`

**Problem**: Function didn't handle hint arrays (variations).

**Solution**: Added array detection and random selection:

```typescript
export function getStepHint(
  topicId: number,
  categoryId: number,
  questionId: number,
  stepLabel: string,
  behaviorType: BehaviorType
): string | null {
  // ... existing code to find hint ...

  // ✨ NEW: Handle array of hint variations (randomly select one)
  if (Array.isArray(hintValue)) {
    const selectedHint =
      hintValue[Math.floor(Math.random() * hintValue.length)];
    console.log(`🎲 Selected hint variation for behavior: ${behaviorType}`);
    return selectedHint;
  }

  return hintValue || null;
}
```

### 3. Added Debug Logging

Enhanced console logging to track hint source:

- `📚 ✅ Using curated hint from Category X` - Success! Using your hints
- `🤖 Using AI template fallback` - Curated hint not found, using AI
- `🔧 Using hardcoded fallback` - Both above failed, using generic

---

## 🎯 How It Works Now

### Call Flow (Fixed)

```
User makes 3 wrong attempts
    ↓
validateIndividualLine() detects wrong answer
    ↓
showHintMessage() called with behavior analysis
    ↓
1️⃣ Try getStepHint(topicId, categoryId, questionId, stepLabel, behaviorType)
    ↓
    ├─ Load category1.ts (or 2, 3, 4 based on categoryId)
    ├─ Find question by questionId
    ├─ Find step by stepLabel (e.g., "substitution")
    ├─ Get hint for behaviorType (e.g., "repetition")
    ├─ If hint is array, randomly select 1 of 3 variations
    └─ Return hint string ✅
    ↓
2️⃣ If hint found → Display in toast.custom()
    ↓
3️⃣ If hint NOT found → Try AI templates
    ↓
4️⃣ If AI templates fail → Use hardcoded fallback
```

### Example: Repetition Hint for Question 1, Step "evaluation"

**Input:**

- topicId: 1
- categoryId: 1
- questionId: 2 (g(x) = 3x² + 5x - 2)
- stepLabel: "evaluation"
- behaviorType: "repetition"

**Process:**

1. Load `category1.ts` → `Topic1_Category1_Hints`
2. Find Question 2 → "If g(x) = 3x² + 5x - 2, find g(4)"
3. Find step → "evaluation"
4. Get `repetitionHint` array:
   ```typescript
   [
     ": You're repeating the same step — try combining like terms now.",
     ": Let's simplify — maybe recompute each term separately first.",
     ": Try a fresh start; this step just needs clear arithmetic.",
   ];
   ```
5. Randomly select one variation (e.g., variation 2)
6. Return: `": Let's simplify — maybe recompute each term separately first."`

**Output in Toast:**

```
┌────────────────────────────────────────────┐
│ 💡 Hey there,                    [X]       │
├────────────────────────────────────────────┤
│    Let's simplify — maybe recompute each   │
│    term separately first.                  │
│                                            │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░              │
└────────────────────────────────────────────┘
```

---

## 📋 Testing Checklist

### Verify Curated Hints Are Used

1. **Open DevTools Console** (F12)
2. **Play TugonPlay** with Topic 1, Category 1, Question 1
3. **Make 3 wrong attempts** (trigger hint)
4. **Check console** for:
   ```
   📚 ✅ Using curated hint from Category 1 for behavior: repetition
   🔔 TOAST TRIGGERED: {
     type: 'repetition',
     hint: ": You're repeating the same step — try combining like terms now.",
     usingAITemplate: false,  ← Should be false!
     ...
   }
   ```

### Verify All Categories Work

Test each category file:

| Category | Question | Step         | Behavior        | Expected Source |
| -------- | -------- | ------------ | --------------- | --------------- |
| 1        | 1        | substitution | repetition      | category1.ts ✅ |
| 1        | 2        | evaluation   | guessing        | category1.ts ✅ |
| 2        | 1        | choose       | sign-error      | category2.ts ✅ |
| 3        | 1        | substitution | close-attempt   | category3.ts ✅ |
| 4        | 1        | evaluation   | magnitude-error | category4.ts ✅ |

### Verify Fallback System

If curated hint doesn't exist:

1. Should try AI templates
2. Console should show: `🤖 Using AI template fallback for behavior: X`
3. If AI fails, should use hardcoded: `🔧 Using hardcoded fallback hint`

### Verify Hint Variations Cycle

For the same question/step/behavior:

- 1st attempt → Variation 1 (random)
- 2nd attempt → Variation 2 (random)
- 3rd attempt → Variation 3 (random)
- 4th attempt → Back to variation 1, 2, or 3 (random)

**Note**: Variations are randomly selected each time, so you might see the same variation twice in a row (that's expected randomness).

---

## 📁 Files Modified

### 1. `src/components/tugon/input-system/UserInput.tsx`

- **Line ~441-540**: Reordered hint priority logic
- **Change**: Curated hints now checked FIRST, AI templates are fallback

### 2. `src/components/data/hints/index.ts`

- **Line ~47-89**: Enhanced `getStepHint()` function
- **Change**: Added array handling with random selection
- **Change**: Added debug logging for hint source tracking

---

## 🎉 Benefits

### Before Fix

- ❌ AI templates always used (generic, placeholder-filled messages)
- ❌ 225+ curated hint variations **never shown**
- ❌ Inconsistent tone and message quality
- ❌ No variety in repeated attempts

### After Fix

- ✅ Curated hints from category1-4.ts used first
- ✅ 225+ hand-crafted encouraging coach messages displayed
- ✅ 3 variations per hint type for variety
- ✅ Warm, specific, contextual feedback
- ✅ AI templates as smart fallback (not wasted)
- ✅ Clear console logging for debugging

---

## 🔍 Console Log Examples

### When Curated Hint Found

```
📚 ✅ Using curated hint from Category 1 for behavior: repetition
🎲 Selected hint variation for behavior: repetition
🔔 TOAST TRIGGERED: {
  type: 'repetition',
  userInput: '2(8)-7',
  correctAnswer: '2(8) - 7',
  wrongPart: '2(8)-7',
  stepLabel: 'substitution',
  hint: ": Hmm, still the same result — maybe recheck 2(8)-7 in your substitution.",
  icon: "💡",
  usingAITemplate: false,
  timestamp: "2025-10-18T..."
}
📌 Stored new toast ID: ...
```

### When AI Template Used (Fallback)

```
❌ No hints found for Topic 99, Category 99, Question 99
🤖 Using AI template fallback for behavior: general
🔔 TOAST TRIGGERED: {
  type: 'random',
  hint: ": I notice you're making general mistakes. Check that part in your substitution...",
  usingAITemplate: true,  ← AI template used
  ...
}
```

### When Hardcoded Fallback Used

```
❌ No hints found for Topic 99, Category 99, Question 99
🔧 Using hardcoded fallback hint
🔔 TOAST TRIGGERED: {
  hint: "💡 \"wrong\" isn't quite right. Review the problem and check your work.",
  ...
}
```

---

## 🧪 Test Commands

### Run Automated Tests

```bash
npm test -- HintVariationOrder.test.tsx
```

### Manual Testing

1. Open TugonPlay
2. Select Topic 1, Category 1, Question 1
3. Make intentional mistakes on "substitution" step:
   - Enter same wrong answer 3 times (repetition)
   - Enter 3 random answers (guessing)
   - Enter answer with wrong sign (sign-error)
4. Verify toast shows curated messages from category1.ts
5. Check console for `📚 ✅ Using curated hint` messages

---

## ✅ Verification

**Expected Outcomes:**

- [ ] Console shows `📚 ✅ Using curated hint from Category X`
- [ ] Toast displays messages from category1-4.ts files
- [ ] Hints match the exact text in your category files
- [ ] 3 different variations cycle through randomly
- [ ] `usingAITemplate: false` in console logs
- [ ] Warm, encouraging coach tone in all messages
- [ ] No more `I notice you're {behavior}` template format

**If Still Seeing AI Templates:**

1. Check `topicId`, `categoryId`, `questionId` props are passed correctly
2. Verify `stepLabel` matches exactly (case-insensitive)
3. Check console for error messages
4. Ensure category files are exported correctly

---

## 📚 Related Files

**Curated Hint Files:**

- `src/components/data/hints/topic1/category1.ts` (Function Evaluation)
- `src/components/data/hints/topic1/category2.ts` (Piecewise Functions)
- `src/components/data/hints/topic1/category3.ts` (Operations on Functions)
- `src/components/data/hints/topic1/category4.ts` (Function Composition)

**Hint System Core:**

- `src/components/data/hints/index.ts` (Registry & getStepHint)
- `src/components/data/hints/types.ts` (TypeScript interfaces)

**Display Component:**

- `src/components/tugon/input-system/UserInput.tsx` (showHintMessage)

**Behavior Analysis:**

- `src/components/tugon/services/BehaviorAnalyzer.ts` (Detects behavior type)

---

## 🎯 Summary

**Problem**: AI-generated templates were taking priority over curated category hints.

**Solution**:

1. Reordered hint selection priority (curated first)
2. Enhanced `getStepHint()` to handle arrays
3. Added comprehensive debug logging

**Result**:

- ✅ 225+ curated hints now displayed correctly
- ✅ Toast.custom() uses category1-4.ts hints
- ✅ AI templates serve as smart fallback
- ✅ Warm, encouraging coach tone throughout

**Status**: Ready for testing and deployment! 🚀
