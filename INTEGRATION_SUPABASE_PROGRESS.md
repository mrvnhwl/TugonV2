# Supabase Progress Service Integration Guide

## Overview

This document outlines how to integrate Supabase progress tracking into ProgressMap and TugonPlay.

## Database Schema Summary

Based on your provided schemas, here's what we have:

### 1. **tugonsense_topics**

```sql
- id: integer (PK)
- name: text
- description: text
- created_at, updated_at, created_by, updated_by
```

### 2. **tugonsense_categories**

```sql
- id: bigserial (PK)
- topic_id: integer (FK → tugonsense_topics)
- category_id: integer (logical ID, CHECK > 0)
- title: text
- category_question: text
- UNIQUE(topic_id, category_id)
```

### 3. **tugonsense_questions** (you didn't provide this, but based on foreign keys):

```sql
- id: bigserial (PK)
- topic_id: integer
- category_id: integer
- question_id: integer
- question_text: text
- (other fields...)
```

### 4. **tugonsense_answer_steps** (you mentioned but didn't provide schema)

### 5. **Progress Tables**

#### **tugonsense_user_topic_progress**

```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- topic_id: integer (FK → tugonsense_topics)
- is_completed: boolean
- completion_percentage: numeric(5,2)
- correct_answers: integer
- total_questions: integer
- first_started_at: timestamp
- completed_at: timestamp
- UNIQUE(user_id, topic_id)
```

#### **tugonsense_user_category_progress**

```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- topic_id: integer (FK → tugonsense_topics)
- category_id: bigint (FK → tugonsense_categories.id) ⚠️ NOTE: References PK, not logical category_id
- is_completed: boolean
- completion_percentage: numeric(5,2)
- correct_answers: integer
- total_questions: integer
- current_question_index: integer
- attempts: integer
- success_modal_shown: boolean
- ever_completed: boolean
- first_started_at: timestamp
- completed_at: timestamp
- UNIQUE(user_id, topic_id, category_id)
```

#### **tugonsense_user_question_progress**

```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- topic_id: integer (FK → tugonsense_topics)
- category_id: bigint (FK → tugonsense_categories.id)
- question_id: bigint (FK → tugonsense_questions.id) ⚠️ NOTE: References PK, not logical question_id
- is_completed: boolean
- attempts: integer
- correct_answers: integer
- time_spent: integer (seconds)
- best_score: numeric(5,2)
- color_coded_hints_used: integer
- short_hint_messages_used: integer
- current_session_attempts: integer
- latest_attempt: jsonb
- fastest_attempt: jsonb
- last_attempt_at: timestamp
- UNIQUE(user_id, topic_id, category_id, question_id)
```

## ⚠️ CRITICAL ISSUE: Foreign Key Mismatch

Your progress tables reference **database PKs (bigserial)** instead of **logical IDs**:

```sql
-- Problem: category_id references categories.id (bigserial PK)
category_id: bigint FK → tugonsense_categories(id)

-- But your app uses logical category_id:
Topic 1, Category 1
Topic 1, Category 2
Topic 2, Category 1  ← Same logical ID, different FK!
```

### **Solution Options:**

#### **Option A: Change Progress Table Schema (Recommended)**

Change foreign keys to reference composite keys instead:

```sql
ALTER TABLE tugonsense_user_category_progress
  DROP CONSTRAINT tugonsense_user_category_progress_category_id_fkey;

-- Add composite foreign key
ALTER TABLE tugonsense_user_category_progress
  ADD CONSTRAINT tugonsense_user_category_progress_topic_category_fkey
  FOREIGN KEY (topic_id, category_id)
  REFERENCES tugonsense_categories(topic_id, category_id);

-- Update column type
ALTER TABLE tugonsense_user_category_progress
  ALTER COLUMN category_id TYPE INTEGER;
```

#### **Option B: Use JOIN Queries (Current workaround)**

Keep schema as-is but always join to get correct category:

```sql
SELECT cp.*, c.category_id as logical_category_id
FROM tugonsense_user_category_progress cp
JOIN tugonsense_categories c ON c.id = cp.category_id
WHERE cp.user_id = ? AND c.topic_id = ? AND c.category_id = ?
```

## Implementation Plan

### Phase 1: Fix Schema (Option A - Recommended)

1. Run migration to fix foreign key constraints
2. Update progress tables to use logical IDs
3. Update Supabase service to match

### Phase 2: Create Hybrid Service

Since you already have localStorage data, create a service that:

1. **Checks if user is authenticated** → Use Supabase
2. **If not authenticated** → Fall back to localStorage
3. **Migration helper** → Move localStorage data to Supabase on first login

### Phase 3: Update Components

1. **ProgressMap** → Use hybrid service instead of direct progressService
2. **TugonPlay** → Use hybrid service for recording attempts
3. **CourseCard** → Already uses Supabase for topics

## Files Created

### ✅ `src/lib/supabaseProgress.ts`

- Supabase progress service
- Mirrors localStorage progressService API
- Methods:
  - `getCategoryProgress(topicId, categoryId)`
  - `getTopicProgress(topicId)`
  - `recordAttempt(attemptResult)`
  - `getCategoryStats(topicId, categoryId)`
  - `resetCategoryProgress(topicId, categoryId)`

## Next Steps

1. **Fix Schema** (if using Option A)
2. **Create Hybrid Service** that chooses Supabase vs localStorage
3. **Update ProgressMap** to use hybrid service
4. **Test** with authenticated user
5. **Add Migration Tool** for existing localStorage users

## Testing Checklist

- [ ] Authenticated user can see progress from Supabase
- [ ] Unauthenticated user falls back to localStorage
- [ ] Recording attempt updates Supabase correctly
- [ ] Category progress recalculates properly
- [ ] Topic progress aggregates correctly
- [ ] Reset category works
- [ ] Latest/fastest attempts stored in JSONB
- [ ] Session attempts reset after completion
- [ ] ProgressMap displays Supabase data
- [ ] TugonPlay records to Supabase

---

**Status:** ⚠️ Schema issue needs resolution before full integration  
**Recommendation:** Use Option A (fix foreign keys) for cleaner long-term solution
