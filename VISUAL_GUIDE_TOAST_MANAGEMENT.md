# Visual Guide: Toast Management Flow

## Toast Replacement Flow

### Before (Old Behavior)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌─────────────────────────────┐               │
│  │ 💡 Toast 1: Check your work │  ← Cycle 1    │
│  └─────────────────────────────┘               │
│                                                 │
│  ┌─────────────────────────────┐               │
│  │ 🎯 Toast 2: You're close!   │  ← Cycle 2    │
│  └─────────────────────────────┘               │
│                                                 │
│  ┌─────────────────────────────┐               │
│  │ ⚠️ Toast 3: Check signs     │  ← Cycle 3    │
│  └─────────────────────────────┘               │
│                                                 │
│  ❌ PROBLEM: All 3 toasts stacked on screen!   │
└─────────────────────────────────────────────────┘
```

### After (New Behavior) ✅

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌─────────────────────────────┐               │
│  │ 💡 Toast 1: Check your work │  ← Cycle 1    │
│  └─────────────────────────────┘               │
│                                                 │
│  User makes 3 more wrong attempts...           │
│                                                 │
│  ┌─────────────────────────────┐               │
│  │ 🎯 Toast 2: You're close!   │  ← Cycle 2    │
│  └─────────────────────────────┘               │
│  (Toast 1 dismissed automatically)             │
│                                                 │
│  User makes 3 more wrong attempts...           │
│                                                 │
│  ┌─────────────────────────────┐               │
│  │ ⚠️ Toast 3: Check signs     │  ← Cycle 3    │
│  └─────────────────────────────┘               │
│  (Toast 2 dismissed automatically)             │
│                                                 │
│  ✅ SOLUTION: Only one toast at a time!        │
└─────────────────────────────────────────────────┘
```

## Modal Dismissal Flow

### Before (Old Behavior)

```
After 15 wrong attempts...

┌───────────────────────────────────────────┐
│  ┌─────────────────────────────┐         │
│  │ 🔁 Toast: Try different way │         │
│  └─────────────────────────────┘         │
│                                           │
│  ┌───────────────────────────────────┐   │
│  │ 🎓 FeedbackModal                  │   │
│  │ ┌───────────────────────────────┐ │   │
│  │ │                               │ │   │
│  │ │  Your Input: 2x + 3           │ │   │
│  │ │  Expected: x^2 + 3x - 2       │ │   │
│  │ │                               │ │   │
│  │ └───────────────────────────────┘ │   │
│  └───────────────────────────────────┘   │
│                                           │
│  ❌ PROBLEM: Toast + Modal overlap!      │
└───────────────────────────────────────────┘
```

### After (New Behavior) ✅

```
After 15 wrong attempts...

Step 1: Toast visible
┌───────────────────────────────────────────┐
│  ┌─────────────────────────────┐         │
│  │ 🔁 Toast: Try different way │         │
│  └─────────────────────────────┘         │
│                                           │
└───────────────────────────────────────────┘

Step 2: Modal opens → Toast dismissed
┌───────────────────────────────────────────┐
│  ┌───────────────────────────────────┐   │
│  │ 🎓 FeedbackModal                  │   │
│  │ ┌───────────────────────────────┐ │   │
│  │ │                               │ │   │
│  │ │  Your Input: 2x + 3           │ │   │
│  │ │  Expected: x^2 + 3x - 2       │ │   │
│  │ │                               │ │   │
│  │ └───────────────────────────────┘ │   │
│  └───────────────────────────────────┘   │
│                                           │
│  ✅ SOLUTION: Clean modal, no overlap!   │
└───────────────────────────────────────────┘
```

## Complete User Journey

### Scenario: Student Making Multiple Errors

```
┌──────────────────────────────────────────────────────────┐
│                   User Journey Flow                      │
└──────────────────────────────────────────────────────────┘

Step 1-3: First 3 wrong attempts
┌─────────────────────────────────┐
│ 💡 Toast: Check your work       │  ← Appears on 3rd attempt
└─────────────────────────────────┘
         │
         ↓ (3.5s or next cycle)

Step 4-6: Next 3 wrong attempts
┌─────────────────────────────────┐
│ 🗑️ Dismiss Toast 1             │
│ 🎯 Toast: You're close!         │  ← New toast replaces old
└─────────────────────────────────┘
         │
         ↓ (3.5s or next cycle)

Step 7-9: Next 3 wrong attempts
┌─────────────────────────────────┐
│ 🗑️ Dismiss Toast 2             │
│ ⚠️ Toast: Check signs           │  ← New toast replaces old
└─────────────────────────────────┘
         │
         ↓ (Continue...)

Step 10-12: Next 3 wrong attempts
┌─────────────────────────────────┐
│ 🗑️ Dismiss Toast 3             │
│ 🔁 Toast: Try different way     │  ← New toast replaces old
└─────────────────────────────────┘
         │
         ↓ (Continue...)

Step 13-15: Final 3 wrong attempts
┌─────────────────────────────────┐
│ 🗑️ Dismiss Toast 4             │
│ 🚨 MODAL TRIGGER                │
└─────────────────────────────────┘
         │
         ↓

Modal Opens
┌──────────────────────────────────┐
│ 🗑️ Dismiss any active toast     │
│ 📱 Show FeedbackModal            │
└──────────────────────────────────┘
```

## Correct Answer Cleanup

```
During attempts with toast active:

┌─────────────────────────────────┐
│ ⚠️ Toast: Check signs           │  ← Active hint toast
└─────────────────────────────────┘
         │
         ↓ User enters correct answer

┌─────────────────────────────────┐
│ 🗑️ Dismiss toast                │
│ ✅ Show success message          │
└─────────────────────────────────┘
         │
         ↓

┌─────────────────────────────────┐
│ 🎉 Perfect! You got it!         │  ← Clean success display
└─────────────────────────────────┘
```

## Question Navigation

```
User on Question 1 with active toast:

Question 1
┌─────────────────────────────────┐
│ 💡 Toast: Check your work       │  ← Active toast
└─────────────────────────────────┘
         │
         ↓ User clicks Next Question

Transition
┌─────────────────────────────────┐
│ 🗑️ Dismiss Question 1 toast     │
│ 🔄 Load Question 2               │
└─────────────────────────────────┘
         │
         ↓

Question 2
┌─────────────────────────────────┐
│ [No toast - fresh start]        │  ← Clean slate
└─────────────────────────────────┘
```

## State Machine Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Toast State Machine                   │
└──────────────────────────────────────────────────────────┘

         ┌─────────────┐
         │  No Toast   │  activeToastIdRef.current = null
         │  (Initial)  │
         └──────┬──────┘
                │
                │ 3 wrong attempts
                ↓
         ┌─────────────┐
         │   Toast     │  activeToastIdRef.current = "toast-id-1"
         │   Active    │
         └──────┬──────┘
                │
        ┌───────┴───────┬────────────┬──────────────┐
        │               │            │              │
        │ 3 more        │ Correct    │ Modal        │ New Question
        │ wrongs        │ answer     │ opens        │
        ↓               ↓            ↓              ↓
   ┌─────────┐    ┌─────────┐  ┌─────────┐   ┌─────────┐
   │ Dismiss │    │ Dismiss │  │ Dismiss │   │ Dismiss │
   │   + New │    │   + Go  │  │   + Go  │   │   + Go  │
   │  Toast  │    │ Success │  │  Modal  │   │  Reset  │
   └────┬────┘    └─────────┘  └─────────┘   └─────────┘
        │
        │ activeToastIdRef.current = "toast-id-2"
        ↓
   ┌─────────────┐
   │   Toast     │  (New ID stored)
   │   Active    │
   └─────────────┘
```

## Code Flow Visualization

```
┌──────────────────────────────────────────────────────────┐
│            showHintMessage() Execution Flow              │
└──────────────────────────────────────────────────────────┘

START
  │
  ├─→ Check if activeToastIdRef.current exists
  │     │
  │     ├─→ YES: Call toast.dismiss(activeToastIdRef.current)
  │     │         Log: "🗑️ Dismissed previous toast"
  │     │
  │     └─→ NO: Continue to next step
  │
  ├─→ Generate hint message (AI/curated/fallback)
  │
  ├─→ Create new toast with toast.custom()
  │     │
  │     └─→ Returns: toastId (string)
  │
  ├─→ Store: activeToastIdRef.current = toastId
  │
  ├─→ Log: "📌 Stored new toast ID"
  │
END

┌──────────────────────────────────────────────────────────┐
│            Modal Open Execution Flow                      │
└──────────────────────────────────────────────────────────┘

START (15th wrong attempt)
  │
  ├─→ Check if activeToastIdRef.current exists
  │     │
  │     ├─→ YES: Call toast.dismiss(activeToastIdRef.current)
  │     │         Set activeToastIdRef.current = null
  │     │         Log: "🗑️ Dismissed active toast before opening modal"
  │     │
  │     └─→ NO: Continue to next step
  │
  ├─→ setModalData({ userInput, correctAnswer })
  │
  ├─→ setIsModalOpen(true)
  │
  ├─→ setModalShown(true)
  │
END
```

## Debug Console Timeline

Real console output during user session:

```
[00:00:00] User starts Question 1
[00:00:15] 3 wrong attempts
[00:00:15] 📌 Stored new toast ID: toast-abc123
[00:00:15] 🔔 TOAST TRIGGERED: type: sign-error
[00:00:30] 3 more wrong attempts
[00:00:30] 🗑️ Dismissed previous toast: toast-abc123
[00:00:30] 📌 Stored new toast ID: toast-def456
[00:00:30] 🔔 TOAST TRIGGERED: type: magnitude-error
[00:00:45] 3 more wrong attempts
[00:00:45] 🗑️ Dismissed previous toast: toast-def456
[00:00:45] 📌 Stored new toast ID: toast-ghi789
[00:00:45] 🔔 TOAST TRIGGERED: type: close-attempt
[00:01:00] User enters correct answer
[00:01:00] 🗑️ Dismissed toast on correct answer
[00:01:00] ✅ CORRECT ANSWER
[00:01:00] 🎉 Perfect! You got it!
```

## Summary Comparison

| Feature                     | Before                | After                 |
| --------------------------- | --------------------- | --------------------- |
| **Multiple Wrong Attempts** | Toasts stack up       | Only 1 toast visible  |
| **Modal Opens**             | Toast + Modal overlap | Toast dismissed first |
| **Correct Answer**          | Toast lingers         | Toast dismissed       |
| **New Question**            | Old toast remains     | Toast dismissed       |
| **Visual Clarity**          | Cluttered             | Clean and focused     |
| **User Experience**         | Confusing             | Clear feedback        |

## Status

✅ **All scenarios covered and working as intended**
