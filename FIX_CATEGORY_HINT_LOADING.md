# FIX: Category-Specific Hint Loading

## Problem Identified

Only `{T1C1}:` hints were being loaded for ALL categories (1, 2, 3, 4). The issue was in `UserInput.tsx`.

## Root Cause

The `UserInput` component was calling `generateBehaviorTemplates()` which loads **generic** AI templates, NOT the **context-aware** curated hints from the specific category files.

```typescript
// ❌ OLD CODE - Always loaded generic templates
const templates = await hintService.generateBehaviorTemplates();
```

This meant:

- Category 1 questions → Got generic templates (happened to work)
- Category 2 questions → Got same generic templates ❌
- Category 3 questions → Got same generic templates ❌
- Category 4 questions → Got same generic templates ❌

## Solution Applied

Changed `UserInput.tsx` to call `generateContextualTemplates()` with the current `topicId`, `categoryId`, and `questionId`:

```typescript
// ✅ NEW CODE - Loads context-specific templates
const templates = await hintService.generateContextualTemplates(
  topicId,
  categoryId,
  questionId
);
```

Now the flow is:

1. UserInput receives `topicId`, `categoryId`, `questionId` as props
2. On mount or when context changes, load templates for that specific context
3. `generateContextualTemplates()` calls `CuratedHintLoader.getContextualTemplates()`
4. CuratedHintLoader looks up the registry with key `"1-2"` for Topic 1, Category 2
5. Returns hints from the correct category file (e.g., `category2.ts`)

## Files Modified

### `src/components/tugon/input-system/UserInput.tsx`

**Changed:**

- Template loading logic to use `generateContextualTemplates(topicId, categoryId, questionId)`
- Added dependency array `[topicId, categoryId, questionId]` so templates reload when navigating between questions
- Added debug logging to show context being loaded

**Before:**

```typescript
useEffect(() => {
  const templates = await hintService.generateBehaviorTemplates();
  // ...
}, []); // Only ran once on mount
```

**After:**

```typescript
useEffect(() => {
  console.log("🔄 Loading templates for context:", {
    topicId,
    categoryId,
    questionId,
  });
  const templates = await hintService.generateContextualTemplates(
    topicId,
    categoryId,
    questionId
  );
  // ...
}, [topicId, categoryId, questionId]); // Reloads when context changes
```

## Expected Behavior Now

### Category 1 (Function Evaluation)

- URL: `?topic=1&category=1&question=1`
- Should show hints with `{T1C1}:` prefix
- Hints from `src/components/data/hints/topic1/category1.ts`

### Category 2 (Piecewise Functions)

- URL: `?topic=1&category=2&question=1`
- Should show hints with `{T1C2}:` prefix ✅
- Hints from `src/components/data/hints/topic1/category2.ts`

### Category 3 (Operations on Functions)

- URL: `?topic=1&category=3&question=1`
- Should show hints with `{T1C3}:` prefix ✅
- Hints from `src/components/data/hints/topic1/category3.ts`

### Category 4 (Function Composition)

- URL: `?topic=1&category=4&question=1`
- Should show hints with `{T1C4}:` prefix ✅
- Hints from `src/components/data/hints/topic1/category4.ts`

## How to Test

1. **Start your dev server** (if not already running)
2. **Navigate to Category 2**: `localhost:5173/tugonplay?topic=1&category=2&question=1`
3. **Make an error** to trigger a hint
4. **Check the hint text** - should see `{T1C2}:` at the beginning
5. **Repeat for Categories 3 and 4**

### What to Look For in Console

When you navigate to a question, you should see:

```
🔄 Loading templates for context: {topicId: 1, categoryId: 2, questionId: 1}
🎯 CONTEXTUAL HINT LOADER: Getting hints for context: ...
🔑 CuratedHintLoader: Looking for registry key: "1-2"
📚 CuratedHintLoader: Available keys: ["1-1", "1-2", "1-3", "1-4"]
✅ CuratedHintLoader: Found category "Piecewise Functions" with 3 questions
✅ CuratedHintLoader: Found question 1 - "Let f(x) = {  x + 2,  x < 0   |   x²,  0 ≤ x ≤ 3   |   5,  x > 3  }.  Find f(-3)."
✅ Context-aware behavior templates loaded
```

## Additional Changes Made Earlier

### Debug Logging Added

- `curatedHintLoader.ts`: Comprehensive logging for registration and lookup
- Shows exactly which category is being loaded
- Shows which questions are available
- Shows which steps are found

### Debug Prefixes Added

All hint template files now have visual indicators:

- `category1.ts`: All hints start with `{T1C1}:`
- `category2.ts`: All hints start with `{T1C2}:`
- `category3.ts`: All hints start with `{T1C3}:`
- `category4.ts`: All hints start with `{T1C4}:`

## Troubleshooting

If you still see the wrong category prefix:

1. **Check console logs** - Do you see the correct context being loaded?
2. **Check registry keys** - Are all 4 categories registered?
3. **Hard refresh** - Clear cache and reload: `Ctrl + Shift + R` or `Cmd + Shift + R`
4. **Check URL** - Make sure `category=2` parameter matches what you expect

## Next Steps

Once you confirm this is working:

1. Remove the debug prefixes `{T1C1}:`, `{T1C2}:`, etc. from the hint files
2. Optionally reduce console logging verbosity
3. Add more categories/topics as needed using the same pattern
