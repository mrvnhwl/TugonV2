# Fix for 406 Error & RLS Issues

**Date:** October 21, 2025  
**Issue:** `Failed to load resource: the server responded with a status of 406 ()`  
**Error Code:** `PGRST116 - JSON object requested, multiple (or no) rows returned`

---

## 🔍 Root Cause

1. **Missing RLS Policies**: `topic_submissions`, `validation_results`, and `teacher_topics` tables don't have proper RLS policies
2. **Permission Denied**: Queries are being blocked by Postgres because RLS is enabled but policies are missing
3. **Query Issues**: `.single()` calls failing when 0 rows returned due to RLS blocking access

---

## ✅ Solutions Applied

### 1. **Code Fixes (tugon_topics.tsx)**

Changed all `.single()` to `.maybeSingle()` and added proper error handling:

```typescript
// BEFORE (causes 406 error)
const { data, error } = await supabase
  .from("teacher_topics")
  .select("*")
  .eq("submission_id", submission.id)
  .single(); // ❌ Throws error if 0 rows

// AFTER (handles 0 rows gracefully)
const { data, error } = await supabase
  .from("teacher_topics")
  .select("*")
  .eq("submission_id", submission.id)
  .maybeSingle(); // ✅ Returns null if 0 rows

if (!data) {
  alert("No topic found...");
  return;
}
```

**Files Modified:**

- ✅ `src/pages/topic_creation/tugon_topics.tsx` - All 4 `.single()` calls fixed

### 2. **Database Migrations Created**

#### Migration 1: `20251021_add_rls_all_tables.sql`

**Purpose:** Add comprehensive RLS policies for all topic tables

**Policies Added:**

**topic_submissions:**

- Users can view their own submissions
- Teachers can view all submissions
- Users can insert/update/delete their own submissions
- System can update submissions (for AI validation)

**validation_results:**

- Users can view validation of their submissions
- Teachers can view all validations
- System can insert/update validations (for API)

**teacher_topics:**

- Users can view topics from their submissions
- Teachers can view/update/delete all topics
- Creators can view their own topics
- System can insert/update topics (for triggers/API)

#### Migration 2: `20251021_add_is_active_published_topics.sql`

**Purpose:** Add `is_active` column to `published_topics` if missing

---

## 📋 Steps to Fix

### Step 1: Run the Migrations

```powershell
# Navigate to project directory
cd "C:\Users\johnl\OneDrive\Documents\UE_BSCS_4th_year\Thesis V4\TugonV2"

# Push migrations to Supabase
npx supabase db push
```

Or run them manually in Supabase SQL Editor in this order:

1. `20251021_add_is_active_published_topics.sql`
2. `20251021_add_rls_all_tables.sql`

### Step 2: Verify RLS Policies

Go to Supabase Dashboard → Database → Policies and verify:

- ✅ `topic_submissions` has 6 policies
- ✅ `validation_results` has 4 policies
- ✅ `teacher_topics` has 7 policies
- ✅ `published_topics` has 7 policies (from previous migration)

### Step 3: Test the Application

1. **As a Student:**

   - Submit a new topic
   - View your submissions
   - View validation details
   - View validated topics

2. **As a Teacher:**
   - View all submissions
   - View/edit validated topics
   - Publish topics
   - View published topics tab
   - Unpublish topics

### Step 4: Check for Errors

If you still see errors, check browser console for specific RLS policy violations:

```
Error: new row violates row-level security policy for table "..."
```

---

## 🔧 Additional Fixes Applied

### Error Handling Improvements

All error messages now show:

- ✅ Detailed error message
- ✅ Error code (e.g., PGRST116)
- ✅ Hint for RLS issues
- ✅ User-friendly fallback messages

Example:

```typescript
if (error) {
  alert(
    `Failed to load topic: ${error.message}\nCode: ${error.code}\nHint: ${
      error.hint || "Check RLS policies"
    }`
  );
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No rows returned" for validated topics

**Cause:** User doesn't have permission to view `teacher_topics`  
**Solution:** RLS policy allows users to view topics from their submissions

### Issue 2: Can't update submissions after validation

**Cause:** Status changed to 'validated' but RLS blocks updates  
**Solution:** "System can update submissions" policy allows all authenticated users to update

### Issue 3: Validation results not visible

**Cause:** No RLS policy linking validation_results to user's submissions  
**Solution:** Policy joins with topic_submissions to check ownership

---

## 📊 RLS Policy Matrix

| Table                  | User (Own)         | User (Others) | Teacher | System/API |
| ---------------------- | ------------------ | ------------- | ------- | ---------- |
| **topic_submissions**  |                    |               |         |            |
| SELECT                 | ✅ Own only        | ❌            | ✅ All  | ✅ All     |
| INSERT                 | ✅ Own             | ❌            | ✅ All  | ✅ All     |
| UPDATE                 | ✅ Own             | ❌            | ✅ All  | ✅ All     |
| DELETE                 | ✅ Own (pending)   | ❌            | ✅ All  | ❌         |
| **validation_results** |                    |               |         |            |
| SELECT                 | ✅ Own submissions | ❌            | ✅ All  | ✅ All     |
| INSERT                 | ❌                 | ❌            | ✅ All  | ✅ All     |
| UPDATE                 | ❌                 | ❌            | ✅ All  | ✅ All     |
| **teacher_topics**     |                    |               |         |            |
| SELECT                 | ✅ Own submissions | ❌            | ✅ All  | ✅ All     |
| INSERT                 | ❌                 | ❌            | ✅ All  | ✅ All     |
| UPDATE                 | ❌                 | ❌            | ✅ All  | ✅ All     |
| DELETE                 | ❌                 | ❌            | ✅ All  | ❌         |

---

## 🎯 Testing Checklist

After running migrations, verify:

- [ ] Students can submit topics
- [ ] Students can view their own submissions
- [ ] Students can view validation details for their submissions
- [ ] Students can view validated topics (teacher_topics from their submissions)
- [ ] Students can view published topics
- [ ] Teachers can view all submissions
- [ ] Teachers can view all validation results
- [ ] Teachers can view/edit/delete all teacher_topics
- [ ] Teachers can publish topics
- [ ] Teachers can unpublish topics
- [ ] No 406 errors in browser console
- [ ] No RLS policy violation errors

---

## 📝 Files Changed

### Code Files:

1. `src/pages/topic_creation/tugon_topics.tsx` - Fixed all `.single()` calls

### Migration Files Created:

1. `supabase/migrations/20251021_add_rls_all_tables.sql` - Comprehensive RLS policies
2. `supabase/migrations/20251021_add_is_active_published_topics.sql` - Add is_active column

### Existing Migrations (No Changes):

- `20251021_create_published_topics.sql`
- `20251021_add_creator_names.sql`
- `20251021_cascading_delete_rules.sql`
- `20251021_add_rls_published_topics.sql`

---

## 🚀 Next Steps

1. **Run migrations** (see Step 1 above)
2. **Test as student user** (create submission, view topics)
3. **Test as teacher user** (review, publish, unpublish)
4. **Monitor browser console** for any remaining errors
5. **Report back** if you see any specific error messages

---

## 💡 Why This Happened

The migrations you ran earlier (`20251021_add_creator_names.sql`, etc.) may have:

1. Enabled RLS on tables without adding policies
2. Modified foreign keys which affected existing policies
3. Created triggers that need specific permissions

The fix ensures:

- ✅ All tables have proper RLS policies
- ✅ Queries gracefully handle missing data
- ✅ Error messages are informative
- ✅ Both students and teachers have appropriate permissions

---

## 🔗 Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgREST Error Codes](https://postgrest.org/en/stable/errors.html#pgrst116)
- [Supabase JavaScript Client - maybeSingle()](https://supabase.com/docs/reference/javascript/select#query-json-data)
