# Visual Guide: Toast Emphasis & Modal Timing

## 🎨 Toast Enhancement - Before & After

### Before: Plain Text Toast

```
┌─────────────────────────────────────────────────────────┐
│  ┃                                                       │
│  ┃  ┌─────┐                                             │
│  ┃  │ ⚠️  │   Hey there,                                │
│  ┃  └─────┘                                             │
│  ┃                                                       │
│  ┃         I see you're confusing plus and minus signs  │
│  ┃         with "-" in the substitution. Double-check   │
│  ┃         those operations!                            │
│  ┃                                                       │
│  ┃         (all text is same gray color)                │
│  ┃                                                       │
└─────────────────────────────────────────────────────────┘
```

### After: Emphasized Toast ✨

```
┌─────────────────────────────────────────────────────────┐
│  ┃                                                       │
│  ┃  ┌─────┐                                             │
│  ┃  │ ⚠️  │   Hey there,                                │
│  ┃  └─────┘                                             │
│  ┃                                                       │
│  ┃         I see you're confusing plus and minus signs  │
│  ┃         with  "-"  in the substitution. Double-check │
│  ┃              ╔═══╗        ‾‾‾‾‾‾‾‾‾‾‾‾               │
│  ┃              ║RED║        TEAL UNDERLINE             │
│  ┃              ║BG ║                                   │
│  ┃              ╚═══╝                                   │
│  ┃         those operations!                            │
│  ┃                                                       │
└─────────────────────────────────────────────────────────┘

Legend:
• Wrong parts (quoted): BOLD RED text with RED-50 background + rounded pill
• Step labels: SEMIBOLD TEAL-700 text with TEAL-300 underline (2px thick)
```

---

## 🎯 Wrong Token Emphasis Styles

### Style 1: Single Token Error

```
Input: User enters "+" when "-" is correct

Toast text:
"Hey there, check "+", in the substitution."
                   ^^^

Rendered as:
Hey there, check  "+"  in the substitution.
                 ┌───┐      ‾‾‾‾‾‾‾‾‾‾‾‾
                 │RED│      TEAL UNDERLINE
                 │BG │
                 └───┘

CSS Classes:
• font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded
```

### Style 2: Multiple Token Errors

```
Input: User enters "+", "x", "7" incorrectly

Toast text:
"Issues with "+", "x" and 1 more in evaluation."

Rendered as:
Issues with  "+"  "x"  and 1 more in evaluation.
            ┌───┐┌───┐                 ‾‾‾‾‾‾‾‾‾‾
            │RED││RED│                 TEAL UNDERLINE
            └───┘└───┘

Note: Each quoted token gets individual emphasis
```

### Style 3: Step Label Emphasis

```
Toast text:
"Review your work on the substitution step."

Rendered as:
Review your work on the substitution step.
                         ‾‾‾‾‾‾‾‾‾‾‾‾
                         TEAL-700 with
                         TEAL-300 underline (2px)

CSS Classes:
• font-semibold text-teal-700 underline decoration-teal-300 decoration-2
```

---

## 📊 Modal Timing Comparison

### Before: Modal at 12th Attempt

```
┌─────────────────────────────────────────────────────────────┐
│                    BEFORE (OLD TIMING)                      │
└─────────────────────────────────────────────────────────────┘

Attempt  Counter  Cycle   Event
──────────────────────────────────────────────────────────────
  1        1       -      (silent)
  2        2       -      (silent)
  3        3       1      💬 Toast #1
  ─────────────────────────────────────────
  4        1       -      (silent)
  5        2       -      (silent)
  6        3       2      💬 Toast #2
  ─────────────────────────────────────────
  7        1       -      (silent)
  8        2       -      (silent)
  9        3       3      💬 Toast #3
  ─────────────────────────────────────────
 10        1       -      (silent)
 11        2       -      (silent)
 12        3       4      🚨 MODAL ← Triggered here
 ─────────────────────────────────────────
 13+     cycle     5+     💬 Toast resumes

Student sees 3 toasts before modal
```

### After: Modal at 15th Attempt ✨

```
┌─────────────────────────────────────────────────────────────┐
│                    AFTER (NEW TIMING)                       │
└─────────────────────────────────────────────────────────────┘

Attempt  Counter  Cycle   Event
──────────────────────────────────────────────────────────────
  1        1       -      (silent)
  2        2       -      (silent)
  3        3       1      💬 Toast #1 (emphasized)
  ─────────────────────────────────────────
  4        1       -      (silent)
  5        2       -      (silent)
  6        3       2      💬 Toast #2 (emphasized)
  ─────────────────────────────────────────
  7        1       -      (silent)
  8        2       -      (silent)
  9        3       3      💬 Toast #3 (emphasized)
  ─────────────────────────────────────────
 10        1       -      (silent)
 11        2       -      (silent)
 12        3       4      💬 Toast #4 (emphasized) ← NEW!
  ─────────────────────────────────────────
 13        1       -      (silent)
 14        2       -      (silent)
 15        3       5      🚨 MODAL ← Triggered here
  ─────────────────────────────────────────
 16+     cycle     6+     💬 Toast resumes

Student sees 4 toasts before modal (+1 extra chance!)
```

---

## 🎨 Complete Toast Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  ┃ ← 8px teal border-left (border-teal-500)                 │
│  ┃                                                           │
│  ┃  ┌──────────┐                                            │
│  ┃  │    ⚠️    │   Hey there, ← Bold XL teal-600           │
│  ┃  │  40x40   │   ‾‾‾‾‾‾‾‾‾                                │
│  ┃  │  teal-   │                                            │
│  ┃  │  500 bg  │                                            │
│  ┃  └──────────┘                                            │
│  ┃                                                           │
│  ┃         I see you're confusing plus and minus signs      │
│  ┃         with  "-"  in the substitution. Double-check     │
│  ┃              ┌───┐      ‾‾‾‾‾‾‾‾‾‾‾‾                     │
│  ┃              │   │      • font-semibold                  │
│  ┃              │RED│      • text-teal-700                  │
│  ┃         • font-bold     • underline                      │
│  ┃         • text-red-600  • decoration-teal-300            │
│  ┃         • bg-red-50     • decoration-2 (2px)             │
│  ┃         • px-1.5 py-0.5                                  │
│  ┃         • rounded                                        │
│  ┃              └───┘                                       │
│  ┃         those operations!                                │
│  ┃                                                           │
│  ┃         ↑ ml-12 (48px left margin, aligns with text)     │
│  ┃                                                           │
└─────────────────────────────────────────────────────────────┘
  ↑
  max-w-md w-full
  bg-white
  shadow-xl
  rounded-xl
  p-5 mb-4
```

---

## 🔍 renderEnhancedHint() Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Input: Raw Hint Text                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
    "⚠️ Hey there, check "-" in the substitution."
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Step 1: Remove Emoji Prefix                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
    "Hey there, check "-" in the substitution."
                            ↓
┌─────────────────────────────────────────────────────────────┐
│       Step 2: Split by Quotes & Word Boundaries            │
│       Regex: /(".*?"|'.*?'|\b\w+\b)/g                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
    ["Hey", " ", "there", ",", " ", "check", " ", '"-"',
     " ", "in", " ", "the", " ", "substitution", "."]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Step 3: Map Each Part to React Element             │
└─────────────────────────────────────────────────────────────┘
                            ↓
    ┌────────────────────────────────────────┐
    │ For each part, check:                  │
    │                                        │
    │ 1. Is it quoted? ('"-"' match)        │
    │    → <span className="font-bold...">  │
    │                                        │
    │ 2. Is it stepLabel? ("substitution")   │
    │    → <span className="font-semibold...│
    │                                        │
    │ 3. Otherwise:                          │
    │    → <span>{part}</span>               │
    └────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                Step 4: Return JSX Array                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
    [
      <span key={0}>Hey</span>,
      <span key={1}> </span>,
      <span key={2}>there</span>,
      <span key={3}>,</span>,
      <span key={4}> </span>,
      <span key={5}>check</span>,
      <span key={6}> </span>,
      <span key={7} className="font-bold text-red-600 bg-red-50...">
        "-"
      </span>,
      <span key={8}> </span>,
      <span key={9}>in</span>,
      <span key={10}> </span>,
      <span key={11}>the</span>,
      <span key={12}> </span>,
      <span key={13} className="font-semibold text-teal-700...">
        substitution
      </span>,
      <span key={14}>.</span>
    ]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Step 5: React Renders Array                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
    Hey there, check  "-"  in the substitution.
                     ┌───┐      ‾‾‾‾‾‾‾‾‾‾‾‾
                     │RED│      TEAL UNDERLINE
                     └───┘
```

---

## 🎯 Real-World Examples

### Example 1: Sign Error

```
Scenario:
  Question: Substitute x=2 into 3x+5
  Correct: 11
  User: 1 (used minus instead of plus)
  Token: "-" is wrong

Toast Display:
┌─────────────────────────────────────────────────────────┐
│  ┃  ┌─────┐                                             │
│  ┃  │ ⚠️  │   Hey there,                                │
│  ┃  └─────┘                                             │
│  ┃                                                       │
│  ┃         Double-check your signs with  "-"  in the    │
│  ┃         substitution. The magnitude looks right!     │
│  ┃                                      ┌───┐           │
│  ┃                                      │RED│           │
│  ┃                                      └───┘           │
│  ┃                            ‾‾‾‾‾‾‾‾‾‾‾‾               │
│  ┃                            TEAL UNDERLINE            │
└─────────────────────────────────────────────────────────┘
```

### Example 2: Multiple Errors

```
Scenario:
  Question: Simplify 2x+3
  Correct: 2x+3
  User: 2x-3+7 (multiple wrong tokens)
  Tokens: "-", "7" are wrong

Toast Display:
┌─────────────────────────────────────────────────────────┐
│  ┃  ┌─────┐                                             │
│  ┃  │ 💭  │   Hey there,                                │
│  ┃  └─────┘                                             │
│  ┃                                                       │
│  ┃         Your answer has issues with  "-"  and  "7"   │
│  ┃         in the simplification. Check each term!      │
│  ┃                                    ┌───┐   ┌───┐     │
│  ┃                                    │RED│   │RED│     │
│  ┃                                    └───┘   └───┘     │
│  ┃                           ‾‾‾‾‾‾‾‾‾‾‾‾‾‾              │
│  ┃                           TEAL UNDERLINE             │
└─────────────────────────────────────────────────────────┘
```

### Example 3: Close Attempt

```
Scenario:
  Question: Evaluate expression
  Correct: 42
  User: 43 (very close)
  Behavior: close-attempt

Toast Display:
┌─────────────────────────────────────────────────────────┐
│  ┃  ┌─────┐                                             │
│  ┃  │ 🎯  │   Hey there,                                │
│  ┃  └─────┘                                             │
│  ┃                                                       │
│  ┃         You're so close with  "43"  in the final     │
│  ┃         answer! Just a small arithmetic error.       │
│  ┃                             ┌────┐                   │
│  ┃                             │RED │                   │
│  ┃                             │BG  │                   │
│  ┃                             └────┘                   │
│  ┃                       ‾‾‾‾‾‾‾‾‾‾‾‾                   │
│  ┃                       TEAL UNDERLINE                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Timing Comparison Chart

```
┌─────────────────────────────────────────────────────────────┐
│                   Toast vs Modal Progression                │
└─────────────────────────────────────────────────────────────┘

OLD TIMING (Before):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0    3    6    9    12   15   18
│    │    │    │    │    │    │
├────┴────┴────┴────┴────┴────┴─────> Attempts
│                   │
Toast #1-3       Modal
                Appears

3 toasts → Modal at attempt 12


NEW TIMING (After):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0    3    6    9    12   15   18
│    │    │    │    │    │    │
├────┴────┴────┴────┴────┴────┴─────> Attempts
│                        │
Toast #1-4            Modal
                   Appears (LATER)

4 toasts → Modal at attempt 15 (+3 more attempts)


KEY DIFFERENCE:
• Students get 1 additional toast hint at attempt 12
• Modal delayed by 3 attempts (12 → 15)
• More learning opportunities before escalation
```

---

## 🎨 Color Palette Reference

### Wrong Token Emphasis (Red Theme)

```
Text Color:      text-red-600   #dc2626  ████████
Background:      bg-red-50      #fef2f2  ░░░░░░░░
Border:          (rounded pill, no border)

CSS: font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded
```

### Step Label Emphasis (Teal Theme)

```
Text Color:      text-teal-700  #0f766e  ████████
Underline:       decoration-teal-300 #5eead4  ════════
Thickness:       decoration-2 (2px)

CSS: font-semibold text-teal-700 underline decoration-teal-300 decoration-2
```

### Toast Card (Teal Accent)

```
Border Left:     border-teal-500  #14b8a6  ████████ (8px)
Badge BG:        bg-teal-500      #14b8a6  ████████
Greeting:        text-teal-600    #0d9488  ████████
Body:            text-gray-700    #374151  ████████
```

---

## 🔧 Implementation Details

### Function Signature

```typescript
const renderEnhancedHint = (hintText: string): JSX.Element[] => {
  // 1. Remove emoji prefix
  // 2. Split by quotes and word boundaries
  // 3. Map to styled spans
  // 4. Return JSX array
};
```

### Regex Breakdown

```typescript
// Split pattern
/(".*?"|'.*?'|\b\w+\b)/g

Explanation:
(".*?")         - Match double-quoted strings (non-greedy)
|               - OR
('.*?')         - Match single-quoted strings (non-greedy)
|               - OR
\b\w+\b         - Match whole words with boundaries

/g              - Global flag (find all matches)
```

### Quote Detection

```typescript
// Check if part is quoted
part.match(/^["'].*["']$/)

Explanation:
^               - Start of string
["']            - Single or double quote
.*              - Any characters
["']            - Single or double quote
$               - End of string
```

### Case-Insensitive Step Label Match

```typescript
stepLabel && part.toLowerCase() === stepLabel.toLowerCase()

Explanation:
• Handles variations: "Substitution", "substitution", "SUBSTITUTION"
• Ensures consistent emphasis regardless of casing
```

---

## 🎯 Benefits Summary

### Visual Benefits

✅ Immediate attention to errors (red highlight)
✅ Clear context indication (teal underline)
✅ Reduced cognitive load (don't need to search)
✅ Professional appearance (consistent styling)

### UX Benefits

✅ Extra hint opportunity at attempt 12
✅ Modal delayed → more learning time
✅ Clearer feedback progression
✅ Less frustration from early modal

### Educational Benefits

✅ Students identify errors faster
✅ Context reinforcement (step names)
✅ Visual memory aids (color associations)
✅ Graduated intervention (toast → modal)

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Production Ready  
**Test in browser to see full visual effects!**
