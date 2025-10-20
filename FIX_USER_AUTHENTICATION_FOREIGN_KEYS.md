# Fix: User Authentication Foreign Keys

## Problem Identified

The progress tables have `user_id` columns but **no foreign key constraints** to Supabase's `auth.users` table. This creates potential issues:

1. **No referential integrity** - Could insert invalid user_ids
2. **Orphaned records** - User deletion doesn't cascade to progress tables
3. **Data inconsistency** - No guarantee user_id exists in auth.users

## Schema Analysis

### Current State (BEFORE FIX)

```sql
-- Progress tables have user_id but NO FK
tugonsense_user_topic_progress (
  user_id UUID,  -- ❌ No FK to auth.users
  ...
)

tugonsense_user_category_progress (
  user_id UUID,  -- ❌ No FK to auth.users
  ...
)

tugonsense_user_question_progress (
  user_id UUID,  -- ❌ No FK to auth.users
  ...
)
```

### After Fix

```sql
-- All progress tables reference auth.users
tugonsense_user_topic_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
)

tugonsense_user_category_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
)

tugonsense_user_question_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
)
```

## Solution Overview

### Strategy: Use Supabase Auth Users Table

✅ **RECOMMENDED APPROACH**: Reference Supabase's built-in `auth.users` table

**Why this approach:**

- ✅ Supabase Auth manages user lifecycle
- ✅ No duplicate user data
- ✅ Automatic UUID generation
- ✅ Built-in security features
- ✅ Works seamlessly with RLS policies
- ✅ ON DELETE CASCADE cleans up progress when user deleted

**Alternative (NOT recommended):** Create custom `tugonsense_users` table

- ❌ Duplicate user management
- ❌ Sync issues between tables
- ❌ More complex migration
- ❌ Unnecessary overhead

## Implementation

### Step 1: Run the Migration

Execute the SQL migration in Supabase Dashboard:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/migrations/add_user_foreign_keys.sql`
3. Click **Run**

### Step 2: What the Migration Does

```sql
-- 1. Add foreign keys to auth.users
ALTER TABLE tugonsense_user_topic_progress
  ADD CONSTRAINT tugonsense_user_topic_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- (Repeats for category and question progress tables)

-- 2. Update RLS policies
CREATE POLICY "Users can view own topic progress"
  ON tugonsense_user_topic_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- (Creates full CRUD policies for all progress tables)
```

### Step 3: Verify the Fix

Run verification queries at the end of migration:

```sql
-- Check foreign keys exist
SELECT table_name, constraint_name, foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name LIKE 'tugonsense_user%'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND column_name = 'user_id';

-- Should return:
-- tugonsense_user_topic_progress     | auth | users
-- tugonsense_user_category_progress  | auth | users
-- tugonsense_user_question_progress  | auth | users
```

## Impact on Existing Code

### ✅ No Code Changes Required

The existing code already uses `auth.uid()` correctly:

**hybridProgressService.ts:**

```typescript
// Already gets user_id from Supabase Auth ✅
const {
  data: { session },
} = await supabase.auth.getSession();
this.userId = session?.user?.id;
```

**supabaseProgress.ts:**

```typescript
// Already filters by user_id ✅
const { data, error } = await supabase
  .from("tugonsense_user_question_progress")
  .select("*")
  .eq("user_id", userId);
```

**RLS Policies:**

```sql
-- Already use auth.uid() ✅
USING (auth.uid() = user_id)
```

### What Changes

| Before                                 | After                                  |
| -------------------------------------- | -------------------------------------- |
| user_id can be any UUID                | user_id **must** exist in auth.users   |
| Deleting user leaves orphaned progress | Deleting user **cascades** to progress |
| No referential integrity               | **Enforced** foreign key constraint    |
| Manual cleanup needed                  | **Automatic** cleanup on user deletion |

## Testing the Fix

### Test 1: Valid User ID (Should Succeed)

```typescript
// User is authenticated
const user = await supabase.auth.getUser();
const userId = user.data.user?.id;

// This should work - user_id exists in auth.users
await supabase.from("tugonsense_user_question_progress").insert({
  user_id: userId,
  topic_id: 1,
  category_id: 1,
  question_id: 1,
  // ... other fields
});
```

### Test 2: Invalid User ID (Should Fail)

```typescript
// Try to insert with fake user_id
await supabase.from("tugonsense_user_question_progress").insert({
  user_id: "00000000-0000-0000-0000-000000000000", // ❌ Not in auth.users
  topic_id: 1,
  category_id: 1,
  question_id: 1,
});

// Expected error:
// "insert or update on table violates foreign key constraint"
```

### Test 3: User Deletion (Should Cascade)

```sql
-- Delete a user from auth.users
DELETE FROM auth.users WHERE id = 'some-user-id';

-- All progress records for that user should be automatically deleted
SELECT COUNT(*) FROM tugonsense_user_question_progress
WHERE user_id = 'some-user-id';
-- Expected: 0 rows
```

## Benefits

### Before Fix

❌ Could insert invalid user_ids  
❌ Orphaned records on user deletion  
❌ No data integrity guarantees  
❌ Manual cleanup required

### After Fix

✅ **Referential Integrity**: Only valid user_ids allowed  
✅ **Automatic Cleanup**: ON DELETE CASCADE removes progress  
✅ **Data Consistency**: Enforced at database level  
✅ **Security**: RLS policies + FK constraints  
✅ **Maintainability**: No manual cleanup needed

## Migration Checklist

- [ ] Backup existing progress data (optional, but recommended)
- [ ] Run `supabase/migrations/add_user_foreign_keys.sql`
- [ ] Verify foreign keys created (query at end of migration)
- [ ] Verify RLS policies updated (query at end of migration)
- [ ] Test with HybridProgressServiceTester component
- [ ] Verify authenticated user can read/write own progress
- [ ] Verify user CANNOT access other users' progress
- [ ] Test localStorage → Supabase migration still works

## Related Files

- `supabase/migrations/add_user_foreign_keys.sql` - New migration script
- `supabase/migrations/fix_progress_foreign_keys.sql` - Category/question FK fixes
- `src/lib/hybridProgressService.ts` - Already uses auth.uid() correctly
- `src/lib/supabaseProgress.ts` - Already filters by user_id correctly

## Next Steps

1. ✅ **Run the migration** in Supabase Dashboard
2. ✅ **Verify foreign keys** using verification queries
3. ✅ **Test with HybridProgressServiceTester** component
4. ✅ **Test authenticated flow** with real user login
5. ✅ **Deploy to production** after testing

## Summary

This fix establishes proper referential integrity between progress tables and Supabase's authentication system. By adding foreign key constraints to `auth.users`, we ensure:

1. Only authenticated users can have progress records
2. User deletion automatically cleans up all related progress
3. Database enforces data consistency at the schema level
4. No code changes required - existing implementation already correct

**Status**: ✅ Migration created, ready to execute  
**Impact**: Database schema only, no frontend changes  
**Risk**: Low - adds constraints that code already respects
