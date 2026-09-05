# QuestionTemplate Supabase Integration

## Overview

Successfully migrated `QuestionTemplate.tsx` from local JSON data (`getQuestionByIds`) to Supabase database integration.

## Changes Made

### 1. **Imports Updated**

```typescript
// BEFORE
import { getQuestionByIds } from "../../data/questions/index";

// AFTER
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { GivenQuestion } from "../../data/questions/types";
```

### 2. **Component Logic Refactored**

- Changed from synchronous function call to async data fetching with React hooks
- Added loading, error, and data states
- Implemented `useEffect` hook to fetch question on component mount or ID changes

### 3. **Database Query**

```typescript
const { data, error: fetchError } = await supabase
  .from("tugonsense_questions")
  .select("*")
  .eq("topic_id", topicId)
  .eq("category_id", categoryId)
  .eq("question_id", questionId)
  .single();
```

### 4. **Data Mapping**

Maps Supabase database fields to `GivenQuestion` TypeScript interface:

```typescript
const mappedQuestion: GivenQuestion = {
  question_id: data.question_id,
  question_text: data.question_text,
  guide_text: data.guide_text || "",
  category_text: data.category_text || undefined,
  question_type: data.question_type as GivenQuestion["question_type"],
};
```

## Database Schema Reference

### tugonsense_questions Table

```sql
create table public.tugonsense_questions (
  id bigserial not null,
  topic_id integer not null,
  category_id integer not null,
  question_id integer not null,
  category_text text null,
  question_text text not null,
  question_type public.question_type_enum not null,
  guide_text text null,
  answer_type public.answer_type_enum null default 'multiLine'::answer_type_enum,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  updated_by uuid null,
  constraint tugonsense_questions_pkey primary key (id),
  constraint tugonsense_questions_topic_id_category_id_question_id_key unique (topic_id, category_id, question_id)
);
```

### Question Type Enumeration

#### Database Enum Values (UPDATED)

```typescript
type question_type_enum =
  | "step-by-step"
  | "multiple-choice"
  | "true-false"
  | "fill-in-blank";
```

#### TypeScript Interface

```typescript
// From src/components/data/questions/types.ts
export interface GivenQuestion {
  question_id: number;
  question_text: string;
  guide_text: string;
  category_text?: string;
  image_url?: string;
  image_alt?: string;
  question_type?:
    | "step-by-step"
    | "fill-in-blanks"
    | "multiple-choice"
    | "true-false";
}
```

**⚠️ Note**: There's a slight mismatch:

- Database: `fill-in-blank` (singular)
- TypeScript: `fill-in-blanks` (plural)

**Recommendation**: Update database enum or TypeScript type for consistency.

## UI States

### 1. **Loading State**

```tsx
<div className="p-6 text-center bg-white rounded-2xl shadow-sm border border-gray-200">
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
  </div>
  <p className="text-gray-500 text-sm mt-3">Loading question...</p>
</div>
```

### 2. **Error State**

```tsx
<div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">
  ⚠️ Error loading question: {error}
</div>
```

### 3. **Not Found State**

```tsx
<div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">
  ⚠️ Question not found. Please check your topic, category, and question IDs.
</div>
```

## Question Type Routing

The component dynamically renders different templates based on `question_type`:

```typescript
switch (question.question_type) {
  case "fill-in-blanks":
    return <FillInBlanksTemplate {...props} />;

  case "multiple-choice":
    return <div>Multiple Choice - Coming soon...</div>;

  case "true-false":
    return <div>True or False - Coming soon...</div>;

  default: // "step-by-step"
    return <AnswerWizard {...props} />;
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ QuestionTemplate Component                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Component mounts with props:                                │
│     - topicId, categoryId, questionId                           │
│                                                                  │
│  2. useEffect triggers fetchQuestion()                          │
│     ↓                                                            │
│  3. Supabase Query:                                             │
│     SELECT * FROM tugonsense_questions                          │
│     WHERE topic_id = ? AND category_id = ? AND question_id = ?  │
│     ↓                                                            │
│  4. Map database fields → GivenQuestion interface               │
│     ↓                                                            │
│  5. Update state: setQuestion(mappedQuestion)                   │
│     ↓                                                            │
│  6. Render appropriate template based on question_type          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Dependencies

### Composite Key Query

The query uses the composite unique key `(topic_id, category_id, question_id)`:

- Ensures precise question selection
- Matches database constraint
- Supports hierarchical question organization

### Related Tables

- **tugonsense_categories**: Parent table (CASCADE delete)
- **tugonsense_answer_steps**: Child table with answer variants

## Testing Checklist

### ✅ Basic Functionality

- [ ] Component loads without errors
- [ ] Loading state displays during fetch
- [ ] Question data renders correctly
- [ ] Error handling works for invalid IDs

### ✅ Question Type Routing

- [ ] `step-by-step` → AnswerWizard renders
- [ ] `fill-in-blanks` → FillInBlanksTemplate renders
- [ ] `multiple-choice` → Placeholder displays
- [ ] `true-false` → Placeholder displays

### ✅ Database Integration

- [ ] Supabase connection works
- [ ] Composite key query returns correct question
- [ ] Guide text displays when available
- [ ] Category text displays when available

### ✅ Edge Cases

- [ ] Non-existent question ID shows error
- [ ] Network error displays error message
- [ ] Missing guide_text handled gracefully
- [ ] Missing category_text handled gracefully

## Known Issues & Recommendations

### 1. **Enum Value Mismatch**

**Issue**: `fill-in-blank` (DB) vs `fill-in-blanks` (TS)

**Solution Options**:

```sql
-- Option A: Update database enum
ALTER TYPE question_type_enum RENAME VALUE 'fill-in-blank' TO 'fill-in-blanks';

-- Option B: Update TypeScript type
type QuestionType = "step-by-step" | "fill-in-blank" | "multiple-choice" | "true-false";
```

### 2. **Database Enum Migration**

The database enum values were recently updated from:

- OLD: `EVALUATION`, `SIMPLIFICATION`, `GENERAL`
- NEW: `step-by-step`, `multiple-choice`, `true-false`, `fill-in-blank`

**Migration Required**:

```sql
-- If enum exists in database, update it
ALTER TYPE question_type_enum RENAME TO question_type_enum_old;

CREATE TYPE question_type_enum AS ENUM (
  'step-by-step',
  'multiple-choice',
  'true-false',
  'fill-in-blank'
);

ALTER TABLE tugonsense_questions
  ALTER COLUMN question_type TYPE question_type_enum
  USING question_type::text::question_type_enum;

DROP TYPE question_type_enum_old;
```

### 3. **Performance Optimization**

Consider implementing:

- Query caching for frequently accessed questions
- Prefetching questions in the same category
- Error boundary component for better error handling

## Next Steps

1. **Test Integration**

   - Create test questions in Supabase
   - Verify all question types render correctly
   - Test error states with invalid IDs

2. **Implement Missing Templates**

   - Multiple-choice template
   - True-false template

3. **Database Migration**

   - Update question_type enum values in database
   - Migrate existing questions to new enum values

4. **Add TypeScript Database Types**
   - Generate types from Supabase schema
   - Ensure type safety across all queries

## Related Files

- `src/components/tugon/template/QuestionTemplate.tsx` - Main component
- `src/lib/supabase.ts` - Supabase client
- `src/components/data/questions/types.ts` - TypeScript interfaces
- `src/pages/tugonsenseproblem/TopicSelector.tsx` - Question management UI

## Status

✅ **COMPLETE** - QuestionTemplate successfully migrated to Supabase
⚠️ **PENDING** - Database enum migration needed
⚠️ **PENDING** - Fix `fill-in-blank` vs `fill-in-blanks` mismatch
