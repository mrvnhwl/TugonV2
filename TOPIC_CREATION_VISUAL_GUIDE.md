# 🎨 Topic Creation Page - Visual Guide

## 📱 Page Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  TEACHER NAVBAR                                             │
│  [Tugon Logo] Dashboard | Create Quiz | ... | Topic Creation│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HEADER SECTION                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  📝 Topic Management                                        │
│  Submit new topics, track submissions, and review           │
│  AI-generated drafts                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TAB NAVIGATION                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  [+ Submit Topic]  [→ My Submissions (3)]  [👁 Review (5)] │
│   (Green/Teal)        (Ocean Blue)          (Purple)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CONTENT CARD (WHITE BACKGROUND, ROUNDED, SHADOW)           │
│  ═══════════════════════════════════════════════════════════ │
│                                                              │
│  [Active Tab Content Shows Here]                            │
│                                                              │
│  • Submit Topic Tab     → Submission Form                   │
│  • My Submissions Tab   → List of User's Submissions        │
│  • Review Drafts Tab    → Pending Teacher Reviews           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🟢 TAB 1: Submit Topic

### Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Submit a New Topic                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  [Error Alert Box - Red] (if validation fails)              │
│                                                              │
│  Topic Title *                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ e.g., Functions and Relations                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  About *                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Describe what this topic covers in General Math...│    │
│  │                                                     │    │
│  │                                                     │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Key Terms * (minimum 3)                                    │
│  ┌───────────────────────────────────────────┐ [X]         │
│  │ Term 1                                    │             │
│  └───────────────────────────────────────────┘             │
│  ┌───────────────────────────────────────────┐ [X]         │
│  │ Term 2                                    │             │
│  └───────────────────────────────────────────┘             │
│  ┌───────────────────────────────────────────┐ [X]         │
│  │ Term 3                                    │             │
│  └───────────────────────────────────────────┘             │
│  + Add another term                                        │
│                                                              │
│  Video/Image Link (Optional)                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ https://youtube.com/... or image URL              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ℹ️ NOTE: Your topic will be validated by AI to    │    │
│  │ ensure it's appropriate for General Mathematics    │    │
│  │ curriculum. If approved, teachers will review the  │    │
│  │ AI-generated content before publication.           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │       [→] Submit Topic for Review (TEAL)           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Loading State

```
┌────────────────────────────────────────────────────────┐
│       [⟳ Spinning Icon] Validating with AI...         │
│                (Button disabled)                       │
└────────────────────────────────────────────────────────┘
```

---

## 🔵 TAB 2: My Submissions

### List View

```
┌─────────────────────────────────────────────────────────────┐
│  My Submissions                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Functions and Relations            [🟡 PENDING]     │  │
│  │ ─────────────────────────────────────────────────── │  │
│  │ Explore how mathematical functions work in...       │  │
│  │                                                      │  │
│  │ [Domain] [Range] [Mapping] +2 more                  │  │
│  │                                                      │  │
│  │ Submitted: Jan 15, 2025                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Quadratic Equations                [🟢 VALIDATED]   │  │
│  │ ─────────────────────────────────────────────────── │  │
│  │ Learn to solve equations of the form ax²+bx+c...    │  │
│  │                                                      │  │
│  │ [Parabola] [Vertex] [Roots]                         │  │
│  │                                                      │  │
│  │ Submitted: Jan 14, 2025                             │  │
│  │ 👁 View Validation Details                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Biology of Cells                   [🔴 REJECTED]    │  │
│  │ ─────────────────────────────────────────────────── │  │
│  │ Understanding cellular structure and...              │  │
│  │                                                      │  │
│  │ [Mitochondria] [Nucleus] [Cytoplasm]                │  │
│  │                                                      │  │
│  │ ┌────────────────────────────────────────────────┐ │  │
│  │ │ ❌ Rejection Reason:                           │ │  │
│  │ │ This topic is not related to General           │ │  │
│  │ │ Mathematics. It belongs to Biology.            │ │  │
│  │ └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │ Submitted: Jan 13, 2025                             │  │
│  │ 👁 View Validation Details                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────────────────┐
│                       [⚠️ Alert Icon]                       │
│                                                              │
│                   No submissions yet                        │
│                                                              │
│          Submit your first topic to get started!            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🟣 TAB 3: Review Drafts (Teachers Only)

### List View

```
┌─────────────────────────────────────────────────────────────┐
│  Pending Draft Reviews                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Functions and Relations: Mapping Inputs to Outputs  │  │
│  │                                  [🟡 PENDING REVIEW] │  │
│  │ ─────────────────────────────────────────────────── │  │
│  │ In mathematics, a relation is a set of ordered      │  │
│  │ pairs that establishes a connection between...      │  │
│  │                                                      │  │
│  │ Submitted by: john@example.com • Jan 15, 2025       │  │
│  │                                                      │  │
│  │ [👁] Click to review                                │  │
│  └───────��──────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Quadratic Equations and Their Applications         │  │
│  │                                  [🟡 PENDING REVIEW] │  │
│  │ ─────────────────────────────────────────────────── │  │
│  │ Quadratic equations are fundamental in algebra...   │  │
│  │                                                      │  │
│  │ Submitted by: jane@example.com • Jan 14, 2025       │  │
│  │                                                      │  │
│  │ [👁] Click to review                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────────────────┐
│                       [✓ Check Icon]                        │
│                                                              │
│                    No pending drafts                        │
│                                                              │
│              All drafts have been reviewed!                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Validation Details Modal

```
┌──────────────────────────────────────────────────────────┐
│  Validation Details                            [X Close]  │
│  ══════════════════════════════════════════════════════  │
│                                                           │
│  Response                                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │             ✅ Accepted (Green)                  │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  Reason                                                   │
│  All fields are appropriate for General Mathematics      │
│  curriculum and suitable for high school to college      │
│  level students.                                         │
│                                                           │
│  Field Analysis                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ {                                                │    │
│  │   "title": {                                     │    │
│  │     "valid": true,                               │    │
│  │     "issue": null                                │    │
│  │   },                                             │    │
│  │   "about": {                                     │    │
│  │     "valid": true,                               │    │
│  │     "issue": null                                │    │
│  │   },                                             │    │
│  │   "terms": {                                     │    │
│  │     "valid": true,                               │    │
│  │     "invalidTerms": []                           │    │
│  │   }                                              │    │
│  │ }                                                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  Validated At                                             │
│  January 15, 2025, 10:30 AM                              │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              [Close]  (Mist/Gray)                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎓 Draft Review Modal (Teachers)

```
┌──────────────────────────────────────────────────────────┐
│  Review AI-Generated Draft                    [X Close]  │
│  ══════════════════════════════════════════════════════  │
│                                                           │
│  ▼ SCROLLABLE CONTENT ▼                                  │
│                                                           │
│  Title                                                    │
│  Functions and Relations: Mapping Inputs to Outputs      │
│                                                           │
│  Description                                              │
│  In mathematics, a relation is a set of ordered pairs    │
│  that establishes a connection between elements from     │
│  two sets. A function is a special type of relation      │
│  where each input has exactly one output...              │
│                                                           │
│  (Second paragraph continues...)                         │
│                                                           │
│  Key Terms & Explanations                                 │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 1. Domain                                        │    │
│  │ ───────────────────────────────────────────────  │    │
│  │ The domain of a function is the complete set of  │    │
│  │ possible input values (x-values). For example,   │    │
│  │ f(x) = √x has domain x ≥ 0 because we cannot    │    │
│  │ take the square root of negative numbers in      │    │
│  │ real numbers. Real-world application: In         │    │
│  │ business, the domain could represent valid       │    │
│  │ product quantities. Common mistake: Forgetting   │    │
│  │ to check division by zero restrictions.          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 2. Range                                         │    │
│  │ ───────────────────────────────────────────────  │    │
│  │ The range is the set of all possible output...   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 3. Mapping                                       │    │
│  │ ───────────────────────────────────────────────  │    │
│  │ Mapping describes how elements from the...       │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  Media Link                                               │
│  https://youtube.com/watch?v=example                     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 📊 Metadata                                      │    │
│  │ ───────────────────────────────────────────────  │    │
│  │ Submitted by: john@example.com                   │    │
│  │ Original Title: Functions and Relations          │    │
│  │ Created: January 15, 2025, 10:45 AM             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ▲ END SCROLLABLE ▲                                      │
│                                                           │
│  ════════════════════════════════════════════════════    │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  [X] Reject (Red)│  │ [✓] Approve (Grn)│             │
│  └──────────────────┘  └──────────────────┘             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Coding Reference

### Status Badges

- 🟡 **Pending** - `#fef3c7` background, `#92400e` text
- 🟢 **Validated** - `#d1fae5` background, `#065f46` text
- 🔴 **Rejected** - `#fee2e2` background, `#991b1b` text
- 🔵 **Draft Ready** - `#dbeafe` background, `#1e40af` text

### Theme Colors

- **Teal** - `#14b8a6` (Primary actions, Submit button)
- **Ocean** - `#0ea5e9` (Secondary actions, My Submissions)
- **Steel** - `#64748b` (Text, Navbar background)
- **Mist** - `#cbd5e1` (Borders, Inactive states)
- **Deep** - `#0f172a` (Headers, Important text)
- **Purple** - `#8b5cf6` (Review Drafts tab)

### Button Colors

- **Approve** - `#10b981` (Green)
- **Reject** - `#ef4444` (Red)
- **Close/Cancel** - `#cbd5e1` (Mist gray)

---

## 📱 Responsive Breakpoints

### Mobile (<768px)

- Single column layout
- Stacked form fields
- Full-width buttons
- Collapsible navbar menu

### Tablet (768px - 1024px)

- 2-column grid for submission cards
- Side-by-side action buttons
- Expanded navbar with horizontal menu

### Desktop (>1024px)

- 3-column grid for cards (if many submissions)
- Maximum container width: 7xl (1280px)
- Hover effects on interactive elements
- Smooth transitions and animations

---

## ⚡ Interactive Elements

### Hover States

- Buttons: Slight scale (1.02x)
- Cards: Shadow elevation increase
- Links: Underline appears
- Tab buttons: Background opacity change

### Active States

- Tab buttons: Ring border (2px)
- Form inputs: Teal focus ring
- Selected items: Background tint

### Disabled States

- Opacity: 50%
- Cursor: not-allowed
- No hover effects
- Grayed out appearance

---

## 🎬 Animation Timeline

### Page Load

1. Fade in (opacity 0 → 1, 300ms)
2. Slide up (translateY 20px → 0, 300ms)
3. Content stagger (each card delays by 50ms)

### Modal Open

1. Backdrop fade in (opacity 0 → 1, 200ms)
2. Modal scale + fade (scale 0.9 → 1, 200ms)
3. Spring animation (damping: 20)

### Modal Close

1. Modal scale + fade (scale 1 → 0.9, 200ms)
2. Backdrop fade out (opacity 1 → 0, 200ms)

### Loading Spinner

- Continuous rotation (360deg, 1s linear infinite)
- Pulse effect (scale 1 → 1.2 → 1)

---

_This visual guide helps understand the complete UI structure and user interactions for the Topic Creation module._
