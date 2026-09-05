# Quick Reference: Testing FeedbackModal Color Stripping

## Run Tests in Browser Console

```javascript
// Import and run all tests
import("./components/tugon/feedback/FeedbackModal.test").then((tests) => {
  tests.default.runFeedbackModalTests();
  tests.default.runIntegrationTests();
});
```

## Manual Test Cases

### Test 1: Basic Color Stripping

```javascript
const input = "\\textcolor{red}{5} + \\textcolor{green}{3}";
// Expected output: "5 + 3"
// No "textcolor", no "red", no "green", no "{}"
```

### Test 2: Function Evaluation

```javascript
const input =
  "g(\\textcolor{red}{5}) = \\textcolor{green}{2}(\\textcolor{red}{5}) - \\textcolor{teal}{8}";
// Expected output: "g(5) = 2(5) - 8"
```

### Test 3: Fraction

```javascript
const input = "\\frac{\\textcolor{red}{x}}{\\textcolor{green}{5}}";
// Expected output: "\\frac{x}{5}" or "(x/5)" in ASCII
```

### Test 4: Nested Colors

```javascript
const input = "\\textcolor{red}{\\textcolor{green}{x}}";
// Expected output: "x"
```

## Visual Checklist

When viewing the FeedbackModal:

- [ ] **No `\textcolor` commands visible**
- [ ] **No color keywords** (red, green, teal, etc.)
- [ ] **No extra curly brackets** from color commands
- [ ] **Math expressions are clean** and readable
- [ ] **MathLive renders properly** (or ASCII fallback works)
- [ ] **Scaffold hint is clean** and helpful

## Expected vs Actual

### Before Fix ❌

```
Your Input: \textcolor{red}{2}(\textcolor{red}{-3}) - \textcolor{red}{8}
Expected: 2(-3) - 8
```

### After Fix ✅

```
Your Input: 2(-3) - 8
Expected: 2(-3) - 8
```

## Quick Debug

If colors still appear:

1. **Check console logs:**

   ```javascript
   // Should see: "🧹 Stripped X layers of colors..."
   ```

2. **Verify import:**

   ```typescript
   import { stripColorCommands } from "../input-system/mathColorComparison";
   ```

3. **Test function directly:**
   ```javascript
   const { cleanLatexForDisplay } = await import(
     "./components/tugon/feedback/FeedbackModal.test"
   );
   console.log(cleanLatexForDisplay("\\textcolor{red}{test}"));
   // Should output: "test"
   ```

## Performance Notes

- Color stripping: Max 50 iterations for nested colors
- MathLive loading: Dynamic import (lazy loaded)
- ASCII fallback: Always available
- Test suite: ~10 tests complete in <100ms

## Common Issues

1. **MathLive not rendering:**

   - Check if `mathlive` package is installed
   - Check browser console for import errors
   - ASCII fallback should still work

2. **Colors still visible:**

   - Verify `stripColorCommands()` is imported correctly
   - Check if input is being cleaned before display
   - Look for console warnings about max iterations

3. **Empty display:**
   - Check if input is empty or undefined
   - Verify ASCII fallback is working
   - Check console for conversion errors
