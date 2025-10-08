# 🚀 Quick Start: Real-Time Color Feedback

## TL;DR

Real-time color feedback is **already integrated** into your UserInput component. It will automatically show green/red colored text as students type in MathLive fields.

## What You Get (Out of the Box)

### ✅ Automatic Features

- **Real-time coloring** as students type (300ms debounce)
- **Term-level comparison** (default mode)
- **Green text** for correct parts
- **Red text** for incorrect parts
- **Similarity tracking** in console logs
- **Cursor position preserved** during updates

## Testing It Now

### 1. Start Your Dev Server

```bash
npm run dev
# or
yarn dev
```

### 2. Navigate to TugonPlay

```
http://localhost:5173/tugonplay?topic=1&category=1&question=1
```

### 3. Start Typing in a Math Field

Watch as the text turns **green** (correct) or **red** (incorrect) as you type!

### 4. Check Console

Open browser DevTools (F12) and look for:

```
🎨 Applying real-time coloring for step 0
📊 Similarity: 75.0% - Good progress! Keep going 💪
```

## How to Customize

### Option 1: Disable Real-Time Coloring

**File:** `UserInput.tsx` (line 166)

```typescript
// Change this line:
const [realtimeColoringEnabled, setRealtimeColoringEnabled] =
  useState<boolean>(true);

// To:
const [realtimeColoringEnabled, setRealtimeColoringEnabled] =
  useState<boolean>(false);
```

### Option 2: Switch to Character-Level Comparison

**File:** `UserInput.tsx` (line 167)

```typescript
// Change this line:
const [colorComparisonMode, setColorComparisonMode] = useState<
  "character" | "term"
>("term");

// To:
const [colorComparisonMode, setColorComparisonMode] = useState<
  "character" | "term"
>("character");
```

### Option 3: Adjust Debounce Speed

**File:** `UserInput.tsx` (line 168)

```typescript
// Current (300ms):
const debouncedColoringRef = useRef(createDebouncedColoringFunction(300));

// Faster response (200ms):
const debouncedColoringRef = useRef(createDebouncedColoringFunction(200));

// Slower, more performance-friendly (500ms):
const debouncedColoringRef = useRef(createDebouncedColoringFunction(500));
```

## Expected Behavior

### Example 1: Correct Input

```
Expected: 2x + 3
Student types: 2x + 3
Result: ALL TEXT GREEN ✅
```

### Example 2: Wrong Term

```
Expected: 2x + 3
Student types: x2 + 3
Result: "x2" is RED ❌, "+ 3" is GREEN ✅
```

### Example 3: Partial Input

```
Expected: 2x + 3y
Student types: 2x
Result: "2x" is GREEN ✅, rest grayed out
```

## Troubleshooting

### Problem: No Colors Showing

**Check:**

1. Is `realtimeColoringEnabled` set to `true`?
2. Does the step have an `answer` field in `expectedSteps`?
3. Is the student using a MathLive field (not a text input)?

**Console Log:**
Look for: `🎨 Applying real-time coloring for step X`

### Problem: Colors Appear Late

**Solution:** Reduce debounce delay from 300ms to 200ms or 100ms.

### Problem: Cursor Jumps Around

**Solution:** Increase debounce delay from 300ms to 500ms.

### Problem: Wrong Colors

**Solution:** Try switching from 'term' to 'character' mode (or vice versa).

## Integration with Feedback Pipeline

Your complete feedback flow is now:

```
┌─────────────────────────────────────────┐
│  1. Real-Time Color (INSTANT)           │
│     → Green/Red text as you type        │
│     → 300ms debounced                   │
│     → No validation required            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. Color-Coded Borders (ON ENTER)      │
│     → Red/Green border feedback         │
│     → After validation                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Short Hints (AFTER ATTEMPTS)        │
│     → Context-aware text hints          │
│     → Behavior-based suggestions        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. Modal (AFTER STRUGGLE)              │
│     → Detailed scaffold with blanks     │
│     → Full comparison view              │
└─────────────────────────────────────────┘
```

## Files Involved

### Core Logic

`src/components/tugon/input-system/mathColorComparison.ts`

- Tokenization
- Comparison algorithms
- Color application

### Integration

`src/components/tugon/input-system/UserInput.tsx`

- State management (lines 166-168)
- Input handler (lines 1127-1137)

### Documentation

- `REALTIME_COLOR_FEEDBACK.md` - Full docs
- `IMPLEMENTATION_REALTIME_COLOR.md` - Implementation details
- `QUICKSTART_REALTIME_COLOR.md` - This file

## Next Steps

### For Testing:

1. ✅ Test with correct answers
2. ✅ Test with wrong answers
3. ✅ Test with partial answers
4. ✅ Test typing speed (fast vs slow)
5. ✅ Check console logs for similarity scores

### For Analytics (Future):

```typescript
// Track color feedback events
if (similarity > 90) {
  analytics.track("near_correct", { similarity, step: index });
}
```

### For Advanced Features (Future):

```typescript
// Progressive hint revealing
if (similarity < 50 && attempts > 3) {
  revealHint(index, "partial");
}
```

## FAQ

**Q: Does this work on mobile?**  
A: Yes! It works with MathLive's virtual keyboard.

**Q: Does it affect performance?**  
A: Minimal impact thanks to debouncing (300ms default).

**Q: Can I customize colors?**  
A: Yes! Edit LaTeX `\textcolor{}` in `mathColorComparison.ts`.

**Q: Does it work with all question types?**  
A: Only MathLive fields (steps with `shouldUseMathMode() === true`).

**Q: What if I want to disable it temporarily?**  
A: Set `realtimeColoringEnabled = false` in UserInput state.

## Support

**Documentation:**

- Full docs: `REALTIME_COLOR_FEEDBACK.md`
- Implementation: `IMPLEMENTATION_REALTIME_COLOR.md`

**Code:**

- Comparison logic: `mathColorComparison.ts`
- Integration: `UserInput.tsx` (search for "🎨 NEW")

**Console Logs:**

- Look for `🎨` emoji in browser console
- Shows similarity scores and feedback

---

**Status:** ✅ Ready to Use  
**Default:** Enabled  
**Mode:** Term-level comparison  
**Debounce:** 300ms
