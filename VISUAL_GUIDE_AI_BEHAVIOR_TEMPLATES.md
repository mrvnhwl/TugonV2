# Visual Guide: AI Behavior Templates Flow

## 🎨 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Component Mount (Once)                         │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  HintGeneratorService   │
                    │  .generateBehaviorTemplates() │
                    └─────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌───────────┐            ┌──────────────┐
            │ Cache Hit │            │  API Call    │
            │ (Reuse)   │            │ Gemini 2.0   │
            └───────────┘            └──────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  24 Templates Cached    │
                    │  8 behaviors × 3 each   │
                    │  Valid for 24 hours     │
                    └─────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      User Interaction Flow                          │
└─────────────────────────────────────────────────────────────────────┘

    User enters wrong answer
            │
            ▼
    ┌─────────────────┐
    │ UserInputValidator│
    │  validates input  │
    └─────────────────┘
            │
            ▼
    ┌─────────────────┐
    │ FeedbackOverlay  │
    │ generates tokens │
    └─────────────────┘
            │
            ▼
    ┌─────────────────────────────┐
    │  TokenFeedback Array        │
    │  [                          │
    │    {token: "+", status: "red"}  │
    │    {token: "2", status: "yellow"}│
    │  ]                          │
    └─────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────┐
    │ wrongAttemptCounter++       │
    │ (increments each wrong)     │
    └─────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────┐
    │  Counter === 3?             │
    │  (Every 3rd attempt)        │
    └─────────────────────────────┘
            │
            ▼ YES
    ┌─────────────────────────────┐
    │  showHintMessage()          │
    │  triggered                  │
    └─────────────────────────────┘
```

---

## 🔄 showHintMessage() Internal Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    showHintMessage() Execution                      │
└─────────────────────────────────────────────────────────────────────┘

    1. Debounce Check (500ms)
            │
            ▼
    2. BehaviorAnalyzer.analyze()
       ┌──────────────────────────┐
       │  userInput              │
       │  correctAnswer          │──▶ { type: "sign-error" }
       │  attemptHistory[]       │
       └──────────────────────────┘
            │
            ▼
    3. Extract Wrong Tokens
       ┌──────────────────────────────┐
       │ extractWrongTokensFromFeedback │
       │  (tokenFeedback)              │
       └──────────────────────────────┘
            │
            ▼
       ┌──────────────────────────────┐
       │  wrongTokens: ["+"]          │
       │  misplacedTokens: ["-"]      │──▶ wrongPart = '"+"/"-"'
       │  extraTokens: []             │
       └──────────────────────────────┘
            │
            ▼
    4. Map Behavior to Description
       ┌──────────────────────────────┐
       │  "sign-error"               │
       │        ↓                    │──▶ "confusing plus and minus signs"
       │  behaviorDescriptions{}     │
       └──────────────────────────────┘
            │
            ▼
    5. Select Template (Priority Order)
       ┌────────────────────────────────┐
       │  ┌──────────────────────────┐ │
       │  │ 1. AI Templates (if available)│
       │  └──────────────────────────┘ │
       │           │                   │
       │           ▼ NOT FOUND         │
       │  ┌──────────────────────────┐ │
       │  │ 2. Curated Hints Registry│ │
       │  └──────────────────────────┘ │
       │           │                   │
       │           ▼ NOT FOUND         │
       │  ┌──────────────────────────┐ │
       │  │ 3. Hardcoded Fallbacks   │ │
       │  └──────────────────────────┘ │
       └────────────────────────────────┘
            │
            ▼
    6. Fill Template with Context
       ┌──────────────────────────────────────┐
       │  Template:                          │
       │  "Hey there, I see you're {behavior}│
       │   with {wrongPart} in {stepLabel}." │
       └──────────────────────────────────────┘
                      │
                      ▼
       ┌──────────────────────────────────────┐
       │  Replace placeholders:              │
       │  {behavior} → "confusing..."        │
       │  {wrongPart} → '"+"/"-"'            │
       │  {stepLabel} → "substitution"       │
       └──────────────────────────────────────┘
                      │
                      ▼
       ┌──────────────────────────────────────┐
       │  Filled Hint:                       │
       │  "Hey there, I see you're confusing │
       │   plus and minus signs with "+"/"-" │
       │   in the substitution."             │
       └──────────────────────────────────────┘
            │
            ▼
    7. Display Toast
       ┌──────────────────────────────────────┐
       │  toast.custom()                     │
       │  ┌────────────────────────────────┐ │
       │  │  ┌──────┐                      │ │
       │  │  │  ⚠️  │  Hey there,          │ │
       │  │  └──────┘                      │ │
       │  │       I see you're confusing...│ │
       │  └────────────────────────────────┘ │
       │  Position: top-center               │
       │  Duration: 3.5s                     │
       └──────────────────────────────────────┘
```

---

## 🎯 Token Extraction Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                  FeedbackOverlay → feedbackExtractor                │
└─────────────────────────────────────────────────────────────────────┘

Input: TokenFeedback Array
┌────────────────────────────────────────┐
│ [                                      │
│   { token: "2", status: "green" },    │ ← SKIP (correct)
│   { token: "+", status: "red" },      │ ← EXTRACT (wrong)
│   { token: "x", status: "yellow" },   │ ← EXTRACT (misplaced)
│   { token: "7", status: "grey" }      │ ← EXTRACT (extra)
│ ]                                      │
└────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ extractWrongTokensFromFeedback()       │
│                                        │
│  ┌─────────────────────┐              │
│  │ Filter by status:   │              │
│  │ • red → wrongTokens │              │
│  │ • yellow → misplaced│              │
│  │ • grey → extraTokens│              │
│  └─────────────────────┘              │
└────────────────────────────────────────┘
            │
            ▼
Output: Categorized Tokens
┌────────────────────────────────────────┐
│ {                                      │
│   wrongTokens: ["+"],                  │
│   misplacedTokens: ["x"],              │
│   extraTokens: ["7"]                   │
│ }                                      │
└────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ formatWrongTokensForHint()             │
│                                        │
│  Combines all problematic tokens:     │
│  ["+", "x", "7"]                       │
│                                        │
│  Format rules:                         │
│  • 1 token: '"+"`                      │
│  • 2 tokens: '"+" and "x"'             │
│  • 3+ tokens: '"+", "x" and 1 more'    │
└────────────────────────────────────────┘
            │
            ▼
Output: Formatted String
┌────────────────────────────────────────┐
│  wrongPart = '"+", "x" and 1 more'     │
└────────────────────────────────────────┘
```

---

## 📊 Template Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BehaviorTemplates Object                         │
└─────────────────────────────────────────────────────────────────────┘

{
  templates: [
    ┌────────────────────────────────────────┐
    │  HintTemplate #1                       │
    ├────────────────────────────────────────┤
    │  behaviorType: "sign-error"            │
    │  templates: [                          │
    │    "⚠️ Hey there, {behavior}...",      │  Variation 1
    │    "⚠️ I notice {wrongPart}...",       │  Variation 2
    │    "⚠️ Hmm, looks like {stepLabel}..." │  Variation 3
    │  ]                                     │
    └────────────────────────────────────────┘

    ┌────────────────────────────────────────┐
    │  HintTemplate #2                       │
    ├────────────────────────────────────────┤
    │  behaviorType: "guessing"              │
    │  templates: [                          │
    │    "🎲 Hey there, {behavior}...",      │  Variation 1
    │    "🎲 I see you're {wrongPart}...",   │  Variation 2
    │    "🎲 Let's slow down, {stepLabel}..."│  Variation 3
    │  ]                                     │
    └────────────────────────────────────────┘

    ... (6 more behaviors)
  ],
  generatedAt: 1728734400000,  // Timestamp
  expiresIn: 86400000          // 24 hours
}
```

---

## 🎨 Toast Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Toast Card (Teal Theme)                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ┃                                                               │
│  ┃  ┌──────────┐                                                │
│  ┃  │   ⚠️    │    Hey there,                                   │
│  ┃  │  (icon) │                                                 │
│  ┃  └──────────┘                                                │
│  ┃                                                               │
│  ┃              I see you're confusing plus and minus signs     │
│  ┃              with "+" in the substitution. Double-check      │
│  ┃              those operations!                               │
│  ┃                                                               │
└─────────────────────────────────────────────────────────────────┘
▲
│
└─ 8px teal border-left

Components:
1. Emoji badge (circular, teal background)
2. "Hey there," greeting (bold, teal text)
3. Hint message (gray text, indented)
4. White background with shadow
5. Rounded corners
6. 3.5s duration, top-center position
```

---

## 🔄 Behavior Type Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│              BehaviorAnalyzer → HintTemplate Mapping                │
└─────────────────────────────────────────────────────────────────────┘

BehaviorAnalyzer.type  →  HintTemplate.behaviorType  →  Description
─────────────────────────────────────────────────────────────────────
sign-error            →  sign-error                 →  "confusing plus and minus signs"
magnitude-error       →  magnitude-error            →  "off by a large amount"
close-attempt         →  close-attempt              →  "getting very close"
guessing              →  guessing                   →  "trying random answers"
repetition            →  repeating                  →  "repeating the same answer"
random                →  general                    →  "making general mistakes"
default               →  general                    →  "needing some guidance"
self-correction       →  self-correction            →  "making progress"

┌─────────────────────────────────────────────────────────────────────┐
│  Behavior Map Code:                                                 │
│                                                                     │
│  const behaviorMap: Record<string, string> = {                      │
│    'sign-error': 'sign-error',                                      │
│    'magnitude-error': 'magnitude-error',                            │
│    'close-attempt': 'close-attempt',                                │
│    'guessing': 'guessing',                                          │
│    'repetition': 'repeating',      // ← Name change                 │
│    'default': 'general',           // ← Fallback                    │
│    'random': 'general',            // ← Fallback                    │
│    'self-correction': 'self-correction'                             │
│  };                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Timeline Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Session Timeline                             │
└─────────────────────────────────────────────────────────────────────┘

t=0: Component Mount
│
├─► HintGeneratorService.generateBehaviorTemplates()
│   └─► Check cache (empty)
│   └─► Call Gemini AI API (~2s)
│   └─► Parse 24 templates
│   └─► Cache with expiresIn: 24h
│
t=2s: Templates Ready ✅
│
│
│  ... User solves problems ...
│
│
t=10m: Wrong Answer #1
│      └─► wrongAttemptCounter = 1
│
t=11m: Wrong Answer #2
│      └─► wrongAttemptCounter = 2
│
t=12m: Wrong Answer #3 (TRIGGER)
│      └─► wrongAttemptCounter = 3
│      └─► showHintMessage() executes
│      └─► Extract tokens (~1ms)
│      └─► Select template from cache (~1ms)
│      └─► Fill placeholders (~1ms)
│      └─► Display toast (~5ms)
│      └─► Reset counter to 0
│
│
│  ... 24 hours later ...
│
│
t=24h: Cache Expires
│      └─► Next generateBehaviorTemplates() call
│      └─► Cache miss
│      └─► New API call to regenerate
│
t=24h+2s: Fresh Templates ✅
```

---

## 💡 Example: Full Hint Generation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXAMPLE: Sign Error on Substitution              │
└─────────────────────────────────────────────────────────────────────┘

SCENARIO:
  Question: Substitute x=2 into equation: 3x + 5
  Correct:  3(2) + 5 = 11
  User:     3(2) - 5 = 1   ← Wrong sign!


STEP 1: Validation
  ┌──────────────────────────┐
  │ UserInputValidator       │
  │ validates "3(2) - 5"     │──▶ isCorrect: false
  └──────────────────────────┘


STEP 2: Token Feedback
  ┌──────────────────────────────────┐
  │ FeedbackOverlay generates:       │
  │ [                                │
  │   { token: "3", status: "green" },
  │   { token: "(", status: "green" },
  │   { token: "2", status: "green" },
  │   { token: ")", status: "green" },
  │   { token: "-", status: "red" },  ← WRONG!
  │   { token: "5", status: "green" } │
  │ ]                                │
  └──────────────────────────────────┘


STEP 3: Extract Wrong Tokens
  ┌──────────────────────────────────┐
  │ extractWrongTokensFromFeedback() │
  │                                  │──▶ wrongTokens: ["-"]
  │ formatWrongTokensForHint()       │──▶ wrongPart: '"-"'
  └──────────────────────────────────┘


STEP 4: Behavior Analysis
  ┌──────────────────────────────────┐
  │ BehaviorAnalyzer.analyze()       │
  │                                  │──▶ type: "sign-error"
  │ (detects opposite sign used)    │
  └──────────────────────────────────┘


STEP 5: Map to Description
  ┌──────────────────────────────────┐
  │ behaviorDescriptions{}           │
  │ "sign-error" →                   │──▶ "confusing plus and minus signs"
  └──────────────────────────────────┘


STEP 6: Select Template
  ┌──────────────────────────────────────────────┐
  │ behaviorTemplates.templates.find()           │
  │   behaviorType: "sign-error"                 │
  │   templates: [                               │
  │     "⚠️ Hey there, I see you're {behavior}...│  ← Selected!
  │   ]                                          │
  └──────────────────────────────────────────────┘


STEP 7: Fill Placeholders
  ┌──────────────────────────────────────────────────────────┐
  │ Template:                                                │
  │ "⚠️ Hey there, I see you're {behavior} with {wrongPart}  │
  │  in the {stepLabel}. Double-check those operations!"     │
  └──────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Placeholders:                                            │
  │ {behavior}   → "confusing plus and minus signs"          │
  │ {wrongPart}  → '"-"'                                     │
  │ {stepLabel}  → "substitution"                            │
  └──────────────────────────────────────────────────────────┘
                          │
                          ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Filled Hint:                                             │
  │ "⚠️ Hey there, I see you're confusing plus and minus     │
  │  signs with "-" in the substitution. Double-check those  │
  │  operations!"                                            │
  └──────────────────────────────────────────────────────────┘


STEP 8: Display Toast
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
  └─────────────────────────────────────────────────────────┘

  Position: top-center
  Duration: 3.5 seconds
  Animation: slide-in + fade-out


RESULT:
  ✅ User sees personalized, specific hint
  ✅ Identifies exact problem: the "-" sign
  ✅ References context: "substitution" step
  ✅ Encourages without being discouraging
```

---

## 🎯 Key Visual Insights

### 1. **One-Time Generation, Unlimited Use**

```
Generate Once           Use Many Times
┌──────────┐           ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Gemini   │    →      │  Hint 1  │  │  Hint 2  │  │  Hint 3  │
│ AI Call  │           │  (0ms)   │  │  (0ms)   │  │  (0ms)   │
└──────────┘           └──────────┘  └──────────┘  └──────────┘
  ~2 seconds              Instant      Instant      Instant
  $0.001                 Cached       Cached       Cached
```

### 2. **3-Tier Fallback System**

```
┌─────────────────┐
│ AI Templates    │ ← Best (personalized, varied)
└─────────────────┘
        │ NOT AVAILABLE
        ▼
┌─────────────────┐
│ Curated Hints   │ ← Good (context-aware)
└─────────────────┘
        │ NOT AVAILABLE
        ▼
┌─────────────────┐
│ Fallback Hints  │ ← Reliable (always available)
└─────────────────┘
```

### 3. **Placeholder Magic**

```
Generic Template          +      Runtime Context       =       Specific Hint
─────────────────────────────────────────────────────────────────────────────
"I see you're            behavior: "confusing..."      "I see you're confusing
 {behavior} with         wrongPart: '"-"'               plus and minus signs
 {wrongPart} in          stepLabel: "substitution"      with "-" in the
 {stepLabel}."                                          substitution."
```

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Production Ready
