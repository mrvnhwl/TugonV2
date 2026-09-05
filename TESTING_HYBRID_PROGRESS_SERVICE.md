# Hybrid Progress Service Testing Guide

**Date:** October 20, 2025  
**Component:** HybridProgressServiceTester.tsx  
**Status:** Ready for Testing

---

## Prerequisites

### 1. Database Setup

- ✅ Run SQL migration: `fix_progress_foreign_keys.sql`
- ✅ Verify Supabase tables exist:
  - `tugonsense_topics`
  - `tugonsense_categories`
  - `tugonsense_questions`
  - `tugonsense_user_topic_progress`
  - `tugonsense_user_category_progress`
  - `tugonsense_user_question_progress`

### 2. Environment Variables

Check `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. RLS Policies

Verify in Supabase dashboard that RLS policies allow:

- Authenticated users: SELECT, INSERT, UPDATE, DELETE
- Public: SELECT (for topics, categories, questions)

---

## Setup: Add Tester Component to Your App

### Option A: Add to TugonSense Page

Edit `src/pages/reviewer/TugonSense.tsx`:

```tsx
import HybridProgressServiceTester from "@/components/HybridProgressServiceTester";

// Add somewhere in your component (e.g., below the courses grid)
<div className="mt-8">
  <HybridProgressServiceTester />
</div>;
```

### Option B: Create Dedicated Test Page

Create `src/pages/TestProgressService.tsx`:

```tsx
import HybridProgressServiceTester from "@/components/HybridProgressServiceTester";

export default function TestProgressService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <HybridProgressServiceTester />
    </div>
  );
}
```

Then add route in your router:

```tsx
<Route path="/test-progress" element={<TestProgressService />} />
```

---

## Test Scenarios

### 🧪 Test 1: Guest Mode (localStorage)

**Purpose:** Verify data is saved to localStorage when not authenticated

**Steps:**

1. ✅ **Log out** of Supabase (if logged in)
2. ✅ Open browser DevTools (F12) → Console tab
3. ✅ Navigate to the test component
4. ✅ Verify status shows "🔓 Guest Mode" and "Backend: localStorage"
5. ✅ Click **"Test 1: Guest Mode"** button
6. ✅ Watch the test console for results

**Expected Results:**

```
[12:34:56] ℹ️ 🧪 TEST 1: Guest Mode (localStorage)
[12:34:56] ℹ️ Authentication Status: Guest
[12:34:56] ℹ️ Recording test attempt to localStorage...
[12:34:57] ✅ Attempt recorded successfully!
[12:34:57] ✅ User Progress loaded: 1 topics
[12:34:57] ✅ Category Progress: 1/10 correct
[12:34:57] ✅ ✅ Guest mode test PASSED!
[12:34:57] ℹ️ localStorage size: 2.45 KB
```

**Verify in Browser:**

1. Open DevTools → Application → Local Storage → `localhost:5173`
2. Look for key: `tugon_user_progress`
3. Click to see JSON data
4. Should contain `topicProgress` array with your test data

**Troubleshooting:**

- ❌ If "Please log out" message appears: Clear cookies and refresh
- ❌ If localStorage is empty: Check console for errors
- ❌ If test fails: Verify progressService is working in localStorage mode

---

### 🧪 Test 2: Authenticated Mode (Supabase)

**Purpose:** Verify data is saved to Supabase when authenticated

**Steps:**

1. ✅ **Log in** to Supabase
2. ✅ Navigate to test component
3. ✅ Verify status shows "✅ Authenticated" and "Backend: Supabase"
4. ✅ Click **"Test 2: Authenticated Mode"** button
5. ✅ Watch the test console for results

**Expected Results:**

```
[12:40:22] ℹ️ 🧪 TEST 2: Authenticated Mode (Supabase)
[12:40:22] ℹ️ Authentication Status: Authenticated
[12:40:22] ℹ️ User ID: a1b2c3d4...
[12:40:22] ℹ️ Recording test attempt to Supabase...
[12:40:23] ✅ Attempt recorded successfully!
[12:40:23] ✅ User Progress loaded: 1 topics
[12:40:23] ✅ Category Progress: 1/10 correct
[12:40:23] ✅ ✅ Authenticated mode test PASSED!
```

**Verify in Supabase Dashboard:**

1. Go to Supabase → Table Editor
2. Open `tugonsense_user_question_progress`
3. Look for rows with your `user_id`
4. Should see `topic_id: 1`, `category_id: 1`, `question_id: 2`
5. Check `latest_attempt` JSONB column for data

**Also check:**

- `tugonsense_user_category_progress` → Should have updated stats
- `tugonsense_user_topic_progress` → Should have updated stats

**Troubleshooting:**

- ❌ If "Please log in" message: Authenticate first
- ❌ If no data in Supabase: Check RLS policies
- ❌ If foreign key errors: Run SQL migration again
- ❌ If network errors: Check environment variables

---

### 🧪 Test 3: Migration (Guest → Authenticated)

**Purpose:** Verify localStorage data migrates to Supabase on login

**Steps:**

1. ✅ **PHASE 1: Prepare Guest Data**

   - Log out completely
   - Click **"Test 3: Migration Setup"** button
   - Wait for 4 test attempts to be recorded
   - Test console should show: "Total questions with progress: 4"

2. ✅ **PHASE 2: Trigger Migration**

   - Keep browser console open (F12)
   - Log in to Supabase
   - **IMMEDIATELY** watch browser console

3. ✅ **PHASE 3: Verify Migration**
   - Check browser console logs
   - Click **"Test 4: View Progress"** button
   - Compare with data from Phase 1

**Expected Browser Console Logs:**

```
🔄 Migrating localStorage progress to Supabase...
✅ Migration completed successfully!
```

**Expected Test Console (Phase 1):**

```
[12:45:10] ℹ️ 🧪 TEST 3: Migration (Guest → Authenticated)
[12:45:10] ℹ️ Step 1: Recording multiple attempts as GUEST...
[12:45:10] ✅ Recorded: Topic 1, Category 1, Question 1
[12:45:10] ✅ Recorded: Topic 1, Category 1, Question 2
[12:45:10] ✅ Recorded: Topic 1, Category 1, Question 3
[12:45:11] ✅ Recorded: Topic 1, Category 2, Question 1
[12:45:11] ✅ Step 2: Guest data saved to localStorage
[12:45:11] ℹ️ Total questions with progress: 4
[12:45:11] ⚠️ Step 3: Now LOG IN to trigger automatic migration
```

**Verify Migration Success:**

**A. Check Browser Console (during login):**

```javascript
// Should see these logs:
🔄 Migrating localStorage progress to Supabase...
✅ Migration completed successfully!
```

**B. Check Supabase Tables:**

1. `tugonsense_user_question_progress` → Should have 4 rows
2. All rows should have your `user_id`
3. `attempts`, `is_correct`, `latest_attempt` should match localStorage data

**C. Check localStorage (still exists):**

1. localStorage should NOT be cleared
2. Original data remains intact
3. This is by design (non-destructive migration)

**Troubleshooting:**

- ❌ Migration didn't trigger: Check `hybridProgressService.ts` → `onAuthStateChange` listener
- ❌ Partial migration: Check console for individual errors
- ❌ No browser console logs: Refresh and try again
- ❌ Data mismatch: Compare `latest_attempt` values manually

---

### 🧪 Test 4: View Progress (Comparison)

**Purpose:** View current progress and verify correct backend is used

**Steps:**

1. ✅ Click **"Test 4: View Progress"** button
2. ✅ Review detailed breakdown

**Expected Results (Guest Mode):**

```
[12:50:00] ℹ️ 🧪 TEST 4: Compare localStorage vs Supabase
[12:50:00] ℹ️ Using: localStorage
[12:50:00] ℹ️ Topics: 1
[12:50:00] ℹ️ Total Time: 155s
[12:50:00] ℹ️ Overall Completion: 40.00%
[12:50:00] ℹ️ Topic 1: 4/10 correct (40.0%)
[12:50:00] ℹ️   Category 1: 3/5 correct
[12:50:00] ℹ️   Category 2: 1/5 correct
[12:50:00] ✅ ✅ Comparison test PASSED!
```

**Expected Results (Authenticated Mode):**

```
[12:50:00] ℹ️ Using: Supabase
[12:50:00] ℹ️ Topics: 1
[12:50:00] ℹ️ Total Time: 155s
...
```

**What to Check:**

- ✅ "Using" should match your auth status
- ✅ Topic/Category breakdown should be accurate
- ✅ Completion percentages should be correct
- ✅ Data should match what you recorded

---

## Advanced Testing

### Manual Console Tests

Open browser console and run these commands:

#### Test getUserProgress

```javascript
import("./src/lib/hybridProgressService").then((m) => {
  m.hybridProgressService.getUserProgress().then((progress) => {
    console.log("User Progress:", progress);
    console.table(progress.topicProgress);
  });
});
```

#### Test getCategoryProgress

```javascript
import("./src/lib/hybridProgressService").then((m) => {
  m.hybridProgressService.getCategoryProgress(1, 1).then((progress) => {
    console.log("Category Progress:", progress);
  });
});
```

#### Test recordAttempt

```javascript
import("./src/lib/hybridProgressService").then((m) => {
  const attempt = {
    topicId: 1,
    categoryId: 1,
    questionId: 5,
    isCorrect: true,
    timeSpent: 35,
    colorCodedHintsUsed: 1,
    shortHintMessagesUsed: 0,
  };

  m.hybridProgressService.recordAttempt(attempt).then(() => {
    console.log("✅ Attempt recorded!");
  });
});
```

#### Check Authentication Status

```javascript
import("./src/lib/hybridProgressService").then((m) => {
  console.log(
    "Is Authenticated:",
    m.hybridProgressService.isUserAuthenticated()
  );
  console.log("User ID:", m.hybridProgressService.getUserId());
});
```

#### Run Full Supabase Test Suite

```javascript
import("./src/lib/testSupabaseProgress").then((m) => {
  m.testSupabaseProgressService();
});
```

---

## Data Inspection

### Inspect localStorage

**Via DevTools:**

1. F12 → Application → Local Storage
2. Look for `tugon_user_progress`
3. Right-click → Copy value
4. Paste into JSON formatter online

**Via Console:**

```javascript
// Get raw data
const data = localStorage.getItem("tugon_user_progress");
console.log(JSON.parse(data));

// Get via service
import("./src/lib/hybridProgressService").then((m) => {
  const progress = m.hybridProgressService.getUserProgress();
  console.log(progress);
});
```

### Inspect Supabase Data

**Via Dashboard:**

1. Go to Supabase → Table Editor
2. Select table:
   - `tugonsense_user_question_progress` → Individual questions
   - `tugonsense_user_category_progress` → Category summaries
   - `tugonsense_user_topic_progress` → Topic summaries

**Via SQL Editor:**

```sql
-- Get all user progress
SELECT * FROM tugonsense_user_question_progress
WHERE user_id = 'your-user-id';

-- Get category summary
SELECT
  category_id,
  total_questions,
  correct_answers,
  completion_percentage
FROM tugonsense_user_category_progress
WHERE user_id = 'your-user-id' AND topic_id = 1;

-- Get latest attempts
SELECT
  question_id,
  is_correct,
  attempts,
  latest_attempt
FROM tugonsense_user_question_progress
WHERE user_id = 'your-user-id'
  AND topic_id = 1
  AND category_id = 1
ORDER BY question_id;
```

---

## Troubleshooting

### Issue: Migration doesn't trigger

**Symptoms:** Logged in but no "🔄 Migrating..." message

**Solutions:**

1. Check `hybridProgressService.ts` → `onAuthStateChange` is set up
2. Try logging out and back in
3. Refresh page after login
4. Check console for JavaScript errors

### Issue: RLS Policy Errors

**Symptoms:** "new row violates row-level security policy"

**Solutions:**

```sql
-- Check existing policies
SELECT * FROM pg_policies
WHERE tablename LIKE 'tugonsense_user%';

-- Create missing policies
CREATE POLICY "Users can insert own progress"
  ON tugonsense_user_question_progress
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON tugonsense_user_question_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Issue: Foreign Key Violations

**Symptoms:** "violates foreign key constraint"

**Solutions:**

1. Verify SQL migration was run: `fix_progress_foreign_keys.sql`
2. Check that `tugonsense_questions` table has data
3. Run this query to verify foreign keys:

```sql
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
  AND conrelid::regclass::text LIKE 'tugonsense_user%';
```

### Issue: Data Not Appearing

**Symptoms:** Test says success but no data visible

**Solutions:**

1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check network tab for failed requests
4. Verify you're logged in with correct account
5. Check Supabase logs for errors

---

## Success Criteria

### ✅ Guest Mode Test Passes If:

- [ ] Test logs show "✅ Guest mode test PASSED!"
- [ ] localStorage has `tugon_user_progress` key
- [ ] localStorage data contains recorded attempt
- [ ] No console errors

### ✅ Authenticated Mode Test Passes If:

- [ ] Test logs show "✅ Authenticated mode test PASSED!"
- [ ] Supabase tables have new rows with your user_id
- [ ] `latest_attempt` JSONB contains correct data
- [ ] No RLS policy errors

### ✅ Migration Test Passes If:

- [ ] Browser console shows migration messages
- [ ] All 4 test questions appear in Supabase
- [ ] Data matches what was in localStorage
- [ ] No foreign key errors
- [ ] localStorage still contains original data (non-destructive)

### ✅ Overall Success If:

- [ ] All 3 main tests pass
- [ ] Can switch between guest/authenticated seamlessly
- [ ] No data loss during migration
- [ ] Progress persists after page refresh
- [ ] No console errors or warnings

---

## Next Steps After Testing

### If All Tests Pass ✅

1. Update TugonPlay to use `hybridProgressService.recordAttempt()`
2. Test in production-like environment
3. Monitor for edge cases
4. Consider adding progress sync indicator in UI
5. Document any issues found

### If Tests Fail ❌

1. Review console errors
2. Check SQL migration status
3. Verify RLS policies
4. Test with different browsers
5. Check network connectivity
6. Review Supabase logs

---

## Test Results Template

Copy and fill this out:

```
## Test Session: [Date/Time]

### Environment
- Browser:
- User ID:
- Supabase Project:

### Test 1: Guest Mode
- Status: [ ] Pass [ ] Fail
- localStorage size:
- Questions recorded:
- Issues:

### Test 2: Authenticated Mode
- Status: [ ] Pass [ ] Fail
- Supabase rows created:
- Questions recorded:
- Issues:

### Test 3: Migration
- Status: [ ] Pass [ ] Fail
- Migration triggered: [ ] Yes [ ] No
- Data migrated:
- Issues:

### Test 4: View Progress
- Status: [ ] Pass [ ] Fail
- Backend used:
- Data accurate: [ ] Yes [ ] No
- Issues:

### Overall Result
- [ ] All tests passed
- [ ] Some tests failed (see issues above)
- [ ] Ready for production
- [ ] Needs more work

### Notes

```

---

## Support

If you encounter issues:

1. Check browser console for detailed errors
2. Review Supabase logs in dashboard
3. Verify all prerequisites are met
4. Try in incognito mode to rule out cache issues
5. Check the bugfix documentation: `BUGFIX_HYBRID_PROGRESS_SERVICE.md`

Happy testing! 🚀
