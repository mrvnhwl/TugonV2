# FIX: Category Hints Loading Priority Issue

## Problem Identified

Even after implementing context-aware template loading, ALL categories were still showing `:` hints from Category 1 instead of their respective category hints (C2, C3, C4).

## Root Cause Analysis

### The Flow Was:

1. `UserInput.tsx` calls `generateContextualTemplates(topicId, categoryId, questionId)` ✅
2. `HintGeneratorService.generateContextualTemplates()` is called ✅
3. **BUT** - The method was prioritizing AI templates over contextual curated templates ❌

### The Bug in `hintGenerator.ts`:

```typescript
// ❌ OLD CODE - AI templates prioritized first
async generateContextualTemplates(...) {
  // Try AI-generated templates first
  try {
    const aiTemplates = await this.generateBehaviorTemplates();  // <-- ALWAYS succeeded with generic AI templates
    return aiTemplates;  // <-- Never reached curated templates!
  } catch (error) {
    // Only use curated templates if AI fails
    return this.getFallbackTemplates(...);
  }
}
```

### Why This Was Wrong:

- AI template generation (`generateBehaviorTemplates()`) was **SUCCEEDING** and returning **generic templates**
- These generic AI templates had NO category context - they were universal
- The contextual curated templates (with ``, `{T1C2}`, etc.) were **NEVER being used**
- Result: All categories got the same generic AI hints

## Solution Applied

### Changed Priority Order in `hintGenerator.ts`:

```typescript
// ✅ NEW CODE - Contextual curated templates prioritized when context available
async generateContextualTemplates(
  topicId?: number,
  categoryId?: number,
  questionId?: number,
  stepLabel?: string
): Promise<BehaviorTemplates> {
  // ✨ PRIORITIZE CONTEXTUAL CURATED TEMPLATES when context is available
  if (topicId && categoryId && questionId) {
    console.log('🎯 Context available - using contextual curated templates');
    try {
      const curatedTemplates = CuratedHintLoader.getContextualTemplates(
        topicId,
        categoryId,
        questionId,
        stepLabel || ''
      );
      console.log('✅ Using contextual curated templates from category', categoryId);
      return curatedTemplates;  // <-- Returns category-specific templates!
    } catch (error) {
      console.log('⚠️ Contextual curated templates failed, trying AI templates');
    }
  }

  // Fallback to AI-generated templates if no context or curated templates failed
  try {
    const aiTemplates = await this.generateBehaviorTemplates();
    console.log('✅ Using AI-generated behavior templates');
    return aiTemplates;
  } catch (error) {
    console.log('⚠️ AI templates failed, using generic fallback templates');
    return this.getFallbackTemplates(topicId, categoryId, questionId, stepLabel);
  }
}
```

### New Priority Flow:

1. **First Priority**: Contextual curated templates from `CuratedHintLoader` (if context available)
2. **Second Priority**: AI-generated templates (if no context or curated templates fail)
3. **Last Resort**: Generic fallback templates

## Files Modified

### `src/components/tugon/services/hintGenerator.ts`

**Changed:**

- Reversed priority: Check for contextual curated templates FIRST when context is available
- AI templates are now the fallback, not the primary source
- Added detailed console logging to trace which template source is used

**Key Change:**

```diff
- // Try AI-generated templates first
+ // ✨ PRIORITIZE CONTEXTUAL CURATED TEMPLATES when context is available
+ if (topicId && categoryId && questionId) {
+   try {
+     const curatedTemplates = CuratedHintLoader.getContextualTemplates(...)
+     return curatedTemplates;
+   } catch (error) { ... }
+ }
+
+ // Fallback to AI-generated templates
  try {
    const aiTemplates = await this.generateBehaviorTemplates();
```

## Expected Behavior Now

### The Complete Flow:

1. User navigates to **Category 2**: `?topic=1&category=2&question=1`
2. `UserInput.tsx` calls `generateContextualTemplates(1, 2, 1)`
3. `HintGeneratorService` checks: "Do I have context? YES (topicId=1, categoryId=2, questionId=1)"
4. Calls `CuratedHintLoader.getContextualTemplates(1, 2, 1)`
5. `CuratedHintLoader` looks up registry key `"1-2"`
6. Returns hints from `Topic1_Category2_Hints` (from `category2.ts`)
7. All hints now have `` prefix ✅

### Category-Specific Hints:

- **Category 1**: `:` prefix from `category1.ts` ✅
- **Category 2**: ``prefix from`category2.ts` ✅
- **Category 3**: ``prefix from`category3.ts` ✅
- **Category 4**: ``prefix from`category4.ts` ✅

## How to Test

1. **Clear browser cache** (important!): `Ctrl + Shift + Delete` or hard refresh with `Ctrl + Shift + R`
2. **Navigate to Category 2**: `localhost:5173/tugonplay?topic=1&category=2&question=1`
3. **Make an error** to trigger a hint
4. **Check the hint text** - should see `` at the beginning
5. **Check console logs** - should see:

   ```
   🔄 Loading templates for context: {topicId: 1, categoryId: 2, questionId: 1}
   🎯 Context available - using contextual curated templates
   🎯 CONTEXTUAL HINT LOADER: Getting hints for context: ...
   🔑 CuratedHintLoader: Looking for registry key: "1-2"
   ✅ CuratedHintLoader: Found category "Piecewise Functions" with 3 questions
   ✅ Using contextual curated templates from category 2
   ```

6. **Repeat for Categories 3 and 4** to verify correct prefixes

## Why The Previous Fix Didn't Work

### Previous Attempt:

- Changed `UserInput.tsx` to call `generateContextualTemplates()` instead of `generateBehaviorTemplates()` ✅
- Added `topicId`, `categoryId`, `questionId` parameters ✅
- **BUT** - Didn't realize AI templates were being prioritized over curated templates inside `generateContextualTemplates()`

### This Fix:

- **Addresses the priority issue** inside `generateContextualTemplates()`
- Ensures curated templates are checked FIRST when context is available
- AI templates are now a fallback for when curated templates aren't available or fail

## Architecture Insight

### Template Loading Priority (Corrected):

```
User navigates to Category 2
         ↓
UserInput.tsx loads templates
         ↓
generateContextualTemplates(1, 2, 1)
         ↓
    Has context?
         ↓
    YES → Try CuratedHintLoader.getContextualTemplates()
         ↓
    SUCCESS → Return category2.ts hints with
         ↓
    FAIL → Try AI templates
         ↓
    FAIL → Generic fallback
```

### Key Principle:

**Curated > AI > Generic** when context is available

## Next Steps

1. **Test thoroughly** - Verify all 4 categories show correct prefixes
2. **Monitor console logs** - Ensure contextual templates are being loaded
3. **Consider removing AI templates entirely** - Since curated templates are working well, you might want to simplify by removing AI template generation for faster loading
4. **Remove debug prefixes** - Once verified working, clean up `:` etc. from hint files

## Related Files

- `src/components/tugon/services/hintGenerator.ts` - **MODIFIED** (priority fix)
- `src/components/tugon/services/curatedHintLoader.ts` - No changes needed
- `src/components/tugon/input-system/UserInput.tsx` - Already correct from previous fix
- `src/components/data/hints/topic1/category1.ts` - Has prefix
- `src/components/data/hints/topic1/category2.ts` - Has {T1C2} prefix
- `src/components/data/hints/topic1/category3.ts` - Has {T1C3} prefix
- `src/components/data/hints/topic1/category4.ts` - Has {T1C4} prefix
