# 🎨 Real-Time Color Feedback System

## Overview

The real-time color feedback system provides immediate visual feedback to students as they type mathematical expressions in MathLive fields. This is the **first layer** of the Tugon feedback pipeline:

```
Real-time Color → Color-coded Borders → Short Hints → Modal
```

## How It Works

### 1. As the Student Types

- Every character/term is compared against the expected answer
- **Green text** = Correct
- **Red text** = Incorrect
- **Orange text** = Extra (not in expected answer)
- **Gray text** = Missing (in expected but not entered)

### 2. Comparison Modes

#### Term-Level (Default - Recommended)

```typescript
colorComparisonMode: "term";
```

- Compares algebraic terms: `2x + 3` vs `x2 + 3`
- Better for mathematical expressions
- More forgiving for different input styles

**Example:**

- Expected: `2x + 3`
- Student types: `x2 + 3`
- Display: `❌ x2` `✅ + 3`

#### Character-Level

```typescript
colorComparisonMode: "character";
```

- Strict character-by-character comparison
- Useful for exact format requirements
- Example: `2(3)+5` must be exactly that

### 3. Features

#### Debounced Input

- 300ms delay prevents excessive re-rendering
- Smoother typing experience
- Configurable via `createDebouncedColoringFunction(delay)`

#### Cursor Preservation

- Cursor position is maintained during recoloring
- No jumping or unexpected cursor movement

#### Similarity Tracking

- Calculates percentage match: 0-100%
- Provides contextual feedback messages
- Logged to console for debugging

## Implementation

### File Structure

```
src/components/tugon/input-system/
├── UserInput.tsx                 # Main component (integrated)
├── mathColorComparison.ts        # Core comparison logic
└── tokenUtils.ts                 # Token parsing utilities
```

### Key Functions

#### `applyRealtimeColoring(mathfield, expected, mode)`

Applies color comparison to a MathLive field

```typescript
import { applyRealtimeColoring } from "./mathColorComparison";

// In your input handler
applyRealtimeColoring(mathfield, expectedAnswer, "term");
```

#### `compareByTerm(expected, userInput)`

Returns colored LaTeX string using term-level comparison

```typescript
const colored = compareByTerm("2x + 3", "x2 + 3");
// Returns: "\\textcolor{red}{x2}\\textcolor{green}{ + 3}"
```

#### `compareByCharacter(expected, userInput)`

Returns colored LaTeX string using character-level comparison

```typescript
const colored = compareByCharacter("2(3)+5", "2(3)+ 5");
// Shows exact character differences
```

#### `calculateSimilarity(expected, userInput)`

Calculates percentage match between expressions

```typescript
const similarity = calculateSimilarity("2x + 3", "2x + 5");
// Returns: 66.67 (2 out of 3 tokens match)
```

## Integration in UserInput.tsx

### State Variables

```typescript
// Enable/disable real-time coloring
const [realtimeColoringEnabled, setRealtimeColoringEnabled] =
  useState<boolean>(true);

// Choose comparison mode: 'term' or 'character'
const [colorComparisonMode, setColorComparisonMode] = useState<
  "character" | "term"
>("term");

// Debounced coloring function (300ms delay)
const debouncedColoringRef = useRef(createDebouncedColoringFunction(300));
```

### Input Handler Integration

```typescript
const inputHandler = (e: any) => {
  const mathField = e.target;
  const extractedValue = InputValidator.extractMathFieldValue(mathField);

  // 🎨 Apply real-time coloring
  if (
    realtimeColoringEnabled &&
    expectedSteps &&
    index < expectedSteps.length
  ) {
    const expectedAnswer = expectedSteps[index].answer;
    if (expectedAnswer && extractedValue.trim()) {
      debouncedColoringRef.current(
        mathField,
        expectedAnswer,
        colorComparisonMode
      );

      // Track similarity
      const similarity = calculateSimilarity(expectedAnswer, extractedValue);
      console.log(`📊 Similarity: ${similarity.toFixed(1)}%`);
    }
  }

  // Continue with normal flow...
};
```

## Configuration

### Enable/Disable Real-Time Coloring

```typescript
setRealtimeColoringEnabled(true); // Enable
setRealtimeColoringEnabled(false); // Disable
```

### Switch Comparison Mode

```typescript
setColorComparisonMode("term"); // Term-level (default)
setColorComparisonMode("character"); // Character-level
```

### Adjust Debounce Delay

```typescript
// More responsive (200ms)
const debouncedColoringRef = useRef(createDebouncedColoringFunction(200));

// More performance-friendly (500ms)
const debouncedColoringRef = useRef(createDebouncedColoringFunction(500));
```

## Testing Scenarios

### ✅ Correct Input → All Green

```
Expected: 2x + 3
Student: 2x + 3
Result: ✅✅✅✅ (all green)
```

### ❌ Wrong Term → Red Highlight

```
Expected: 2x + 3
Student: x2 + 3
Result: ❌ x2  ✅ + 3
```

### ⚠️ Extra Symbols → Orange

```
Expected: x + 1
Student: x + 1 + 2
Result: ✅ x + 1  🟠 + 2
```

### 📝 Missing Symbols → Gray

```
Expected: 2x + 3y
Student: 2x
Result: ✅ 2x  ⚪ + 3y (grayed out missing part)
```

## Feedback Pipeline Integration

### Stage 1: Real-Time Color (Instant)

- As student types, immediate visual feedback
- No validation required
- Purely visual comparison

### Stage 2: Color-Coded Borders (On Enter)

- Border changes color based on correctness
- Red border for wrong answer
- Green border for correct answer

### Stage 3: Short Hints (After multiple attempts)

- Context-aware text hints
- Behavior-based suggestions
- AI-generated guidance

### Stage 4: Modal (After continued struggle)

- Detailed scaffold with blanks
- Step-by-step breakdown
- Comparison of user input vs expected

## Performance Considerations

### Debouncing

- Default 300ms delay is optimal for most users
- Prevents lag during fast typing
- Reduces unnecessary re-renders

### Tokenization

- Efficient regex-based parsing
- Caches token arrays
- Minimal performance impact

### Cursor Preservation

- Graceful fallback if position can't be restored
- Debug logging for troubleshooting

## Console Logging

The system provides detailed console logs for debugging:

```
🎨 Applying real-time coloring for step 0
📊 Similarity: 66.7% - You're on the right track 👍
```

## Future Enhancements

### Planned Features

- [ ] Adaptive coloring based on user behavior
- [ ] Progressive hint revealing (show correct parts gradually)
- [ ] Sound feedback for correct/incorrect terms
- [ ] Haptic feedback on mobile devices
- [ ] Color-blind friendly mode
- [ ] Animation on term correction

### Integration Ideas

- [ ] Track color feedback events for analytics
- [ ] Use similarity score to trigger different hint levels
- [ ] Combine with AI to predict student intent
- [ ] Generate dynamic hints based on common errors

## Troubleshooting

### Issue: Colors not appearing

**Solution:** Check that `realtimeColoringEnabled` is `true` and `expectedSteps[index].answer` exists.

### Issue: Cursor jumps during typing

**Solution:** Increase debounce delay or check cursor preservation logic.

### Issue: Performance lag

**Solution:** Increase debounce delay to 500ms or disable for complex expressions.

### Issue: Incorrect color highlighting

**Solution:** Switch comparison mode or check tokenization logic.

## API Reference

See `mathColorComparison.ts` for full API documentation:

- `tokenizeExpression(expr)`
- `compareByCharacter(expected, userInput)`
- `compareByTerm(expected, userInput)`
- `applyRealtimeColoring(mathfield, expected, mode)`
- `createDebouncedColoringFunction(delay)`
- `calculateSimilarity(expected, userInput)`
- `getSimilarityFeedback(similarity)`

---

**Status:** ✅ Implemented and Integrated  
**Last Updated:** October 7, 2025  
**Maintainer:** Tugon Development Team
