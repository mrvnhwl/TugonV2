# Debug Template Indicators

## Overview

All hint templates now include debug prefixes to verify which category file they're loaded from.

## Format

- \*\*\*\* - Topic 1, Category 1 (Function Evaluation)
- **{T1C2}** - Topic 1, Category 2 (Piecewise Functions)
- **{T1C3}** - Topic 1, Category 3 (Operations on Functions)
- **{T1C4}** - Topic 1, Category 4 (Function Composition)

## Examples

### Category 1 (Function Evaluation) - Question 1

When answering question about f(8) = 2x - 7, you'll see hints like:

- `: Hey there, you're making sign errors. Check your calculation in your substitution - make sure to replace x with 8!`
- `: I see you're struggling. Review your arithmetic during evaluation - watch those signs carefully!`
- `: 💡 Calculate: (4)^2 = 16, then 2(4) = 8. Write: g(4) = 16 + 8 + 1`

### Category 2 (Piecewise Functions) - Question 1

When working on piecewise functions, you'll see:

- ` Hey there, you're guessing. Check which condition -3 satisfies in your choose - determine which piece applies for -3!`
- ` So close! You're close to the answer. Just fix your substitution in your substitution - write f(-3) = -3 + 2!`

### Category 3 (Operations on Functions) - Question 1

For function addition/subtraction:

- ` Hey there, you're making magnitude errors. Check your setup in your substitution - set up the function addition!`
- ` I see you're repeating mistakes. Focus on combining terms in your simplification - combine like terms: 3x + x and -4 + 5!`

### Category 4 (Function Composition) - Question 1

For function composition:

- ` Hey there, you're making errors. Check composition notation in your choose - understand function composition notation!`
- ` So close! You're almost there. Just fix the order in your choose - g ∘ f means g(f(x))!`

## How to Test

1. **Start the app** and navigate to any question
2. **Make an intentional error** to trigger a hint
3. **Look at the toast notification** - the prefix will show which category the hint came from
4. **Verify the prefix matches**:
   - Topic 1, Category 1, Question 1 → should show `:`
   - Topic 1, Category 2, Question 2 → should show ``
   - Topic 1, Category 3, Question 1 → should show ``
   - Topic 1, Category 4, Question 3 → should show ``

## Files Modified

### Hint Template Files

- ✅ `src/components/data/hints/topic1/category1.ts` - Added `:` prefix
- ✅ `src/components/data/hints/topic1/category2.ts` - Added `` prefix
- ✅ `src/components/data/hints/topic1/category3.ts` - Added `` prefix
- ✅ `src/components/data/hints/topic1/category4.ts` - Added `` prefix

### Service Files

- ✅ `src/components/tugon/services/curatedHintLoader.ts` - Removed redundant debug prefixes (now in templates)

## Removing Debug Indicators

Once you've verified the correct templates are loading, you can remove these prefixes by running:

```powershell
# Remove : from category1.ts
(Get-Content "category1.ts") -replace '\{T1C1\}: ', '' | Set-Content "category1.ts"

# Remove  from category2.ts
(Get-Content "category2.ts") -replace '\{T1C2\}: ', '' | Set-Content "category2.ts"

# Remove  from category3.ts
(Get-Content "category3.ts") -replace '\{T1C3\}: ', '' | Set-Content "category3.ts"

# Remove  from category4.ts
(Get-Content "category4.ts") -replace '\{T1C4\}: ', '' | Set-Content "category4.ts"
```

Or do them all at once from the hints directory:

```powershell
cd src/components/data/hints/topic1
Get-ChildItem category*.ts | ForEach-Object {
    $content = Get-Content $_.FullName
    $content -replace '\{T1C[1-4]\}: ', '' | Set-Content $_.FullName
}
```

## Notes

- These prefixes appear **before** the placeholder replacements happen
- The prefix helps you identify which **source file** the hint came from
- After placeholders are filled (behavior, wrongPart, stepLabel), you'll see complete hints like:
  - `: Hey there, you're making sign errors. Check your subtraction in your evaluation - watch those signs carefully!`
