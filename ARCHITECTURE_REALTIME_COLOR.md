# 📊 Real-Time Color Feedback System Architecture

## Visual Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    STUDENT TYPES IN MATHFIELD                      │
│                                                                    │
│        Expected: 2x + 3           Student Types: x2 + 3           │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│                   INPUT HANDLER (UserInput.tsx)                    │
│                                                                    │
│  1. Capture keystroke event                                       │
│  2. Extract value from MathLive                                   │
│  3. Pass to debounced coloring function (1000ms)                  │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│            COMPARISON ENGINE (mathColorComparison.ts)              │
│                                                                    │
│  ┌──────────────────┐        ┌──────────────────┐                │
│  │  TOKENIZATION    │        │   COMPARISON     │                │
│  │                  │   →    │                  │                │
│  │  "2x + 3"        │        │  Term-by-term    │                │
│  │  ["2x", "+", "3"]│        │  or char-by-char │                │
│  └──────────────────┘        └──────────────────┘                │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│                  COLORED LATEX GENERATION                          │
│                                                                    │
│  Input:  "x2 + 3"                                                 │
│  Output: "\textcolor{red}{x2} \textcolor{green}{+ 3}"            │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│                    APPLY TO MATHFIELD                              │
│                                                                    │
│  1. Save cursor position                                          │
│  2. Set MathLive value with colored LaTeX                         │
│  3. Restore cursor position                                       │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│                  VISUAL FEEDBACK TO STUDENT                        │
│                                                                    │
│              🔴 x2  ✅ + 3                                          │
│                                                                    │
│     Similarity: 66.7% - "You're on the right track 👍"            │
└────────────────────────────────────────────────────────────────────┘
```

## Complete Feedback Pipeline

```
╔═══════════════════════════════════════════════════════════════════╗
║                     FEEDBACK PIPELINE LAYERS                      ║
╚═══════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────────┐
│ LAYER 0: Real-Time Color Feedback (NEW!)                         │
│ ─────────────────────────────────────────────────────────────────│
│ Trigger:    As student types (debounced 1000ms)                  │
│ Type:       Visual text coloring                                 │
│ Colors:     🟢 Green (correct) / 🔴 Red (incorrect)               │
│ Duration:   3 seconds, then strips away                          │
│ Purpose:    Immediate guidance without interruption              │
└───────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 1: Color-Coded Borders                                     │
│ ─────────────────────────────────────────────────────────────────│
│ Trigger:    On Enter key press                                   │
│ Type:       Border color change                                  │
│ Colors:     🟢 Green border / 🔴 Red border                       │
│ Duration:   Until next input                                     │
│ Purpose:    Validation confirmation                              │
└───────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 2: Short Hints (Toast Notifications)                       │
│ ─────────────────────────────────────────────────────────────────│
│ Trigger:    After N wrong attempts (behavior-based)              │
│ Type:       Toast popup with hint text                           │
│ Content:    Context-aware suggestions                            │
│ Duration:   3-5 seconds                                          │
│ Purpose:    Gentle nudge in right direction                      │
└───────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────┐
│ LAYER 3: Feedback Modal (Detailed Help)                          │
│ ─────────────────────────────────────────────────────────────────│
│ Trigger:    After continued struggle (every 3rd wrong attempt)   │
│ Type:       Full-screen modal dialog                             │
│ Content:    - User input vs expected                             │
│             - Scaffold with blanks to fill                       │
│             - Step-by-step tips                                  │
│ Duration:   Until student closes                                 │
│ Purpose:    Comprehensive assistance and learning                │
└───────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TugonPlay.tsx                           │
│                      (Main Container)                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              QuestionTemplate.tsx                         │ │
│  │           (Question Display & Routing)                    │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │              UserInput.tsx                          │ │ │
│  │  │         (Input Management Hub)                      │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌────────────────────────────────────────────┐    │ │ │
│  │  │  │  Real-Time Color System (NEW!)            │    │ │ │
│  │  │  │  - mathColorComparison.ts                 │    │ │ │
│  │  │  │  - Debounced coloring                     │    │ │ │
│  │  │  │  - Similarity tracking                    │    │ │ │
│  │  │  └────────────────────────────────────────────┘    │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌────────────────────────────────────────────┐    │ │ │
│  │  │  │  FeedbackOverlay                          │    │ │ │
│  │  │  │  - Border color feedback                  │    │ │ │
│  │  │  └────────────────────────────────────────────┘    │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌────────────────────────────────────────────┐    │ │ │
│  │  │  │  ShortHints (Toast)                       │    │ │ │
│  │  │  │  - Context-aware hints                    │    │ │ │
│  │  │  │  - Behavior analysis                      │    │ │ │
│  │  │  └────────────────────────────────────────────┘    │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌────────────────────────────────────────────┐    │ │ │
│  │  │  │  FeedbackModal                            │    │ │ │
│  │  │  │  - Detailed scaffold                      │    │ │ │
│  │  │  │  - Full comparison view                   │    │ │ │
│  │  │  └────────────────────────────────────────────┘    │ │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Student    │
│   Keyboard   │
└──────┬───────┘
       │
       ↓ Keystroke
┌──────────────────────┐
│   MathLive Field     │
│   (math-field)       │
└──────┬───────────────┘
       │
       ↓ Input Event
┌──────────────────────────────────┐
│   UserInput.tsx                  │
│   inputHandler()                 │
│                                  │
│   1. Extract value               │
│   2. Check if coloring enabled   │
│   3. Get expected answer         │
└──────┬───────────────────────────┘
       │
       ↓ Debounced (1000ms)
┌──────────────────────────────────┐
│   mathColorComparison.ts         │
│                                  │
│   1. Tokenize expressions        │
│   2. Compare term-by-term        │
│   3. Generate colored LaTeX      │
│   4. Calculate similarity        │
└──────┬───────────────────────────┘
       │
       ↓ Colored LaTeX
┌──────────────────────────────────┐
│   applyRealtimeColoring()        │
│                                  │
│   1. Save cursor position        │
│   2. Update MathLive value       │
│   3. Restore cursor              │
└──────┬───────────────────────────┘
       │
       ↓ Visual Update
┌──────────────────────────────────┐
│   Student sees:                  │
│   🟢 Correct parts (green)       │
│   🔴 Wrong parts (red)           │
│                                  │
│   Console logs:                  │
│   📊 Similarity: 75.0%           │
│   💡 "Good progress!"            │
└──────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                UserInput.tsx State Variables                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [realtimeColoringEnabled]  boolean  (default: true)       │
│      ↓ Controls whether coloring is active                 │
│                                                             │
│  [colorComparisonMode]  'term' | 'character'  (term)       │
│      ↓ Controls comparison algorithm                       │
│                                                             │
│  [debouncedColoringRef]  Function  (1000ms delay)          │
│      ↓ Prevents excessive re-renders                       │
│                                                             │
│  [colorStripTimersRef]  Map  (3000ms strip delay)          │
│      ↓ Manages color stripping timers per field            │
│                                                             │
│  [lines]  string[]  (user input for each step)             │
│      ↓ Synced with MathLive fields                         │
│                                                             │
│  [expectedSteps]  Step[]  (from props)                     │
│      ↓ Contains expected answers for comparison            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Comparison Algorithm Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    TERM-LEVEL COMPARISON                       │
│                       (Default Mode)                           │
└────────────────────────────────────────────────────────────────┘

Expected: "2x + 3"          Student: "x2 + 3"
    ↓                            ↓
Tokenize:                   Tokenize:
["2x", "+", "3"]           ["x2", "+", "3"]
    ↓                            ↓
         Compare token-by-token:
              ↓
    Token 0: "2x" ≠ "x2"  → RED
    Token 1: "+"  = "+"   → GREEN
    Token 2: "3"  = "3"   → GREEN
              ↓
    Generate LaTeX:
    "\textcolor{red}{x2} \textcolor{green}{+ 3}"
              ↓
    Apply to MathLive field


┌────────────────────────────────────────────────────────────────┐
│                 CHARACTER-LEVEL COMPARISON                     │
│                      (Alternative Mode)                        │
└────────────────────────────────────────────────────────────────┘

Expected: "2(3)+5"          Student: "2(3)+ 5"
    ↓                            ↓
    Char 0: '2' = '2'  → GREEN
    Char 1: '(' = '('  → GREEN
    Char 2: '3' = '3'  → GREEN
    Char 3: ')' = ')'  → GREEN
    Char 4: '+' = '+'  → GREEN
    Char 5: '5' ≠ ' '  → RED
    Char 6: -   ≠ '5'  → RED
              ↓
    Generate LaTeX with colors
              ↓
    Apply to MathLive field
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│                    DEBOUNCING STRATEGY                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User types: "2"                                            │
│      ↓ Timer started (1000ms)                               │
│  User types: "x"                                            │
│      ↓ Timer reset (1000ms)                                 │
│  User types: " "                                            │
│      ↓ Timer reset (1000ms)                                 │
│  User types: "+"                                            │
│      ↓ Timer reset (1000ms)                                 │
│  [Wait 1000ms]                                              │
│      ↓ Timer fires                                          │
│  Execute coloring function                                  │
│      ↓                                                       │
│  Update MathLive with colors                                │
│      ↓                                                       │
│  [Wait 3000ms]                                              │
│      ↓ Strip timer fires                                    │
│  Remove colors (clean LaTeX)                                │
│                                                              │
│  Result: Only 1 color update, then auto-strip after 3s!    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌────────────────────────────────────────────────────────────────┐
│                  FILE INTEGRATION MAP                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  mathColorComparison.ts  ←──[imports]──  UserInput.tsx        │
│         │                                      │               │
│         ├─ tokenizeExpression()               │               │
│         ├─ compareByTerm()                    │               │
│         ├─ compareByCharacter()               │               │
│         ├─ applyRealtimeColoring()            │               │
│         ├─ createDebouncedColoringFunction()  │               │
│         ├─ calculateSimilarity()              │               │
│         └─ getSimilarityFeedback()            │               │
│                                                │               │
│  UserInput.tsx  ────[uses]────>  MathLive API                 │
│         │                                      │               │
│         ├─ getValue()                          │               │
│         ├─ setValue()                          │               │
│         └─ position (cursor)                   │               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** October 7, 2025  
**Status:** ✅ Production Ready  
**Architecture Version:** 1.0
