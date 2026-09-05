# Debug: Curated Hints Loading Issue

## Problem

Only Category 1 is loading curated hints correctly. Categories 2, 3, and 4 are falling back to generic templates.

## Debug Enhancements Added

### 1. Registration Logging

Added detailed logging when hints are registered:

```typescript
📝 CuratedHintLoader: Registered hints for Topic 1, Category 1 (Function Evaluation)
   - Questions: 1, 2, 3
   - Registry key: "1-1"
```

### 2. Lookup Logging

Added comprehensive logging when hints are requested:

```typescript
🔑 CuratedHintLoader: Looking for registry key: "1-2"
📚 CuratedHintLoader: Available keys: ["1-1", "1-2", "1-3", "1-4"]
✅ CuratedHintLoader: Found category "Piecewise Functions" with 3 questions
✅ CuratedHintLoader: Found question 1 - "Let f(x) = {  x + 2,  x < 0   |   x²,  0 ≤ x ≤ 3   |   5,  x > 3  }.  Find f(-3)."
✅ CuratedHintLoader: Found 1 relevant steps for "choose"
   Step labels: ["choose"]
```

## How to Debug

### Step 1: Check Registration

Open your browser console when the app loads. You should see:

```
📝 CuratedHintLoader: Registered hints for Topic 1, Category 1 (Function Evaluation)
📝 CuratedHintLoader: Registered hints for Topic 1, Category 2 (Piecewise Functions)
📝 CuratedHintLoader: Registered hints for Topic 1, Category 3 (Operations on Functions)
📝 CuratedHintLoader: Registered hints for Topic 1, Category 4 (Function Composition)
```

**If you don't see all 4 registrations**, there's a problem with the static initialization block.

### Step 2: Check Context Passed

When you make an error and a hint is requested, look for:

```
🎯 CONTEXTUAL HINT LOADER: Getting hints for context:
  {topicId: 1, categoryId: 2, questionId: 1, stepLabel: "choose"}
```

**Check these values match your current question:**

- If categoryId is wrong, the issue is in `TugonPlay.tsx` or how it's passed through components
- If questionId is wrong, check the question data structure
- If stepLabel is undefined, check the step detection logic

### Step 3: Check Registry Lookup

Look for:

```
🔑 CuratedHintLoader: Looking for registry key: "1-2"
📚 CuratedHintLoader: Available keys: ["1-1", "1-2", "1-3", "1-4"]
```

**If the key you're looking for is NOT in the available keys**, the hints weren't registered properly.

**If the key IS there but still falls back**, continue to next step.

### Step 4: Check Question Match

Look for:

```
✅ CuratedHintLoader: Found category "Piecewise Functions" with 3 questions
✅ CuratedHintLoader: Found question 1
```

**If you see "No question found for ID"**, check:

- The questionId being passed
- The questionId values in your hint files (category2.ts, category3.ts, category4.ts)

## Common Issues

### Issue 1: Wrong CategoryId Being Passed

**Symptom:** Looking for key "1-X" but X doesn't match the actual category

**Solution:** Check `TugonPlay.tsx` line where categoryId is determined:

```typescript
const categoryId = Number(searchParams.get("category")) || 1;
const finalCategoryId = legacyQ || categoryId;
```

Make sure the URL parameter matches: `?topic=1&category=2&question=1`

### Issue 2: Question IDs Don't Match

**Symptom:** "No question found for ID: X"

**Solution:** Check that question IDs in hint files match question IDs in answer/question files:

**category2.ts hints:**

```typescript
questions: [
  { questionId: 1, ... },  // ← Must match question data
  { questionId: 2, ... },
  { questionId: 3, ... }
]
```

**category2.ts questions:**

```typescript
given_question: [
  { question_id: 1, ... },  // ← Must match hint data
  { question_id: 2, ... },
  { question_id: 3, ... }
]
```

### Issue 3: Step Labels Don't Match

**Symptom:** "No relevant steps found for stepLabel: X"

**Solution:** Check step labels in hint files match what's expected:

Common step labels:

- Category 1: "substitution", "evaluation", "final"
- Category 2: "choose", "substitution", "final"
- Category 3: "substitution", "simplification", "evaluation", "final"
- Category 4: "choose", "substitution", "evaluation", "final"

## Testing Each Category

### Test Category 1 (Function Evaluation)

Navigate to: `?topic=1&category=1&question=1`

- Should see: `{T1C1}:` prefix in hints
- Should use curated hints from `category1.ts`

### Test Category 2 (Piecewise Functions)

Navigate to: `?topic=1&category=2&question=1`

- Should see: `{T1C2}:` prefix in hints
- Should use curated hints from `category2.ts`

### Test Category 3 (Operations on Functions)

Navigate to: `?topic=1&category=3&question=1`

- Should see: `{T1C3}:` prefix in hints
- Should use curated hints from `category3.ts`

### Test Category 4 (Function Composition)

Navigate to: `?topic=1&category=4&question=1`

- Should see: `{T1C4}:` prefix in hints
- Should use curated hints from `category4.ts`

## Next Steps

1. **Start your dev server**
2. **Open browser console**
3. **Navigate to a Category 2, 3, or 4 question**
4. **Make an intentional error to trigger a hint**
5. **Check the console logs** following the steps above
6. **Report what you see** - specifically:
   - Which logs appear?
   - Where does it fail (registration, lookup, question match, step match)?
   - What are the actual vs expected values?

## Files Modified

- ✅ `src/components/tugon/services/curatedHintLoader.ts` - Added comprehensive debug logging
- ✅ `src/components/data/hints/topic1/category1.ts` - Added `{T1C1}:` debug prefix
- ✅ `src/components/data/hints/topic1/category2.ts` - Added `{T1C2}:` debug prefix
- ✅ `src/components/data/hints/topic1/category3.ts` - Added `{T1C3}:` debug prefix
- ✅ `src/components/data/hints/topic1/category4.ts` - Added `{T1C4}:` debug prefix
