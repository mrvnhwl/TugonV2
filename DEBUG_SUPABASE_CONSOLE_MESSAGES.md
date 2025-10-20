# 🐛 DEBUG: Why "Loaded answer steps from Supabase" Not Showing

## 🎯 Debugging Steps

### Step 1: Check Browser Console for These Messages

Open your browser console (F12) and look for **ANY** of these messages when you navigate to a question:

#### ✅ Messages That Should Appear:

1. **AnswerWizard useEffect Triggered:**

   ```javascript
   🔍 ANSWERWIZARD USEEFFECT TRIGGERED: {
     topicId: 2,
     categoryId: 1,
     questionId: 1,
     hasExpectedAnswers: false,  // Should be FALSE!
     expectedAnswersLength: 0
   }
   ```

2. **Supabase Fetch Started:**

   ```javascript
   🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1
   ```

3. **Supabase Query Executing:**

   ```javascript
   📝 Fetching answer steps from Supabase for Question (2, 1, 1)
   ```

4. **Success Messages:**
   ```javascript
   ✅ Fetched 3 answer steps from Supabase
   📊 Converted steps: [...]
   ✅ Loaded answer steps from Supabase: {...}
   ```

---

### Step 2: What Each Message Means

| Message                                               | Meaning                        | What To Do If You DON'T See It                      |
| ----------------------------------------------------- | ------------------------------ | --------------------------------------------------- |
| `🔍 ANSWERWIZARD USEEFFECT TRIGGERED`                 | AnswerWizard component mounted | AnswerWizard not rendering - check QuestionTemplate |
| `hasExpectedAnswers: true`                            | Still using prop override!     | Check TugonPlay.tsx - remove expectedAnswers prop   |
| `hasExpectedAnswers: false`                           | Good! Will fetch from Supabase | Continue to next message                            |
| `📝 Using provided expectedAnswers prop`              | BAD! Using hardcoded answers   | Remove expectedAnswers prop from parent             |
| `🔄 Fetching answer steps from Supabase ONLY`         | Good! Starting Supabase fetch  | Continue to next message                            |
| `⚠️ No topicId, categoryId, or questionId`            | Missing IDs                    | Check props passed to AnswerWizard                  |
| `📝 Fetching answer steps from Supabase for Question` | Supabase query executing       | Wait for result                                     |
| `❌ Error fetching answer steps`                      | Database error                 | Check error details, Supabase config                |
| `⚠️ No answer steps found`                            | Empty database                 | Need to add data to table                           |
| `✅ Fetched X answer steps`                           | Query successful!              | Almost there!                                       |
| `✅ Loaded answer steps from Supabase`                | SUCCESS!                       | All good!                                           |

---

### Step 3: Diagnostic Scenarios

#### Scenario A: NO Console Messages At All

**Problem:** AnswerWizard not rendering

**Check:**

1. Is QuestionTemplate rendering?
2. Is AnswerWizard being rendered inside QuestionTemplate?
3. Check React DevTools - is AnswerWizard in component tree?

**Solution:**

```bash
# In browser console, run:
document.querySelector('[class*="AnswerWizard"]')
# Should return an element, not null
```

---

#### Scenario B: See "Using provided expectedAnswers prop"

**Problem:** Still passing hardcoded answers

**Check TugonPlay.tsx:**

```typescript
// This should NOT be present:
<QuestionTemplate
  expectedAnswers={expectedAnswers}  // ❌ REMOVE THIS!
  ...
/>

// Should be:
<QuestionTemplate
  topicId={topicId}
  categoryId={finalCategoryId}
  questionId={questionId}
  // No expectedAnswers prop!
  ...
/>
```

**Solution:**

1. Check if our previous edits were saved
2. Restart dev server
3. Clear browser cache (Ctrl+Shift+R)

---

#### Scenario C: See "No topicId, categoryId, or questionId provided"

**Problem:** IDs not being passed

**Check:**

```javascript
// Look for this console message:
🔍 ANSWERWIZARD USEEFFECT TRIGGERED: {
  topicId: undefined,     // ❌ Should be a number!
  categoryId: undefined,  // ❌ Should be a number!
  questionId: undefined   // ❌ Should be a number!
}
```

**Solution:**
Verify TugonPlay is passing IDs correctly:

```typescript
<QuestionTemplate
  topicId={topicId} // Should be number like 2
  categoryId={finalCategoryId} // Should be number like 1
  questionId={questionId} // Should be number like 1
/>
```

---

#### Scenario D: See "Error fetching answer steps"

**Problem:** Supabase connection issue

**Check:**

1. `.env` file has correct Supabase credentials
2. Network tab shows 401/403 errors
3. Supabase table exists
4. Supabase RLS (Row Level Security) policies allow SELECT

**Solution:**

```sql
-- Check if table exists
SELECT tablename FROM pg_tables
WHERE tablename = 'tugonsense_answer_steps';

-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'tugonsense_answer_steps';

-- If RLS is blocking, add policy:
CREATE POLICY "Allow public read access"
ON tugonsense_answer_steps
FOR SELECT
USING (true);
```

---

#### Scenario E: See "No answer steps found"

**Problem:** Database table is empty

**Check:**

```sql
-- Count rows in table
SELECT COUNT(*) FROM tugonsense_answer_steps;

-- Check for specific question
SELECT * FROM tugonsense_answer_steps
WHERE topic_id = 2
  AND category_id = 1
  AND question_id = 1;
```

**Solution:**
Insert test data:

```sql
INSERT INTO tugonsense_answer_steps
  (topic_id, category_id, question_id, step_order, label, answer_variants, placeholder)
VALUES
  (2, 1, 1, 1, 'substitution', '["f(5) = 2(5) + 3", "f(5)=2(5)+3"]'::jsonb, 'Substitute x = 5'),
  (2, 1, 1, 2, 'simplification', '["f(5) = 10 + 3", "f(5)=10+3"]'::jsonb, 'Simplify'),
  (2, 1, 1, 3, 'final', '["13", "f(5) = 13"]'::jsonb, 'Final answer');
```

---

### Step 4: Check Network Tab

**In Browser DevTools:**

1. Go to **Network** tab
2. Filter by "XHR" or "Fetch"
3. Navigate to question
4. Look for request to Supabase

**What to look for:**

- URL should contain `supabase.co`
- Request should have query parameters for `tugonsense_answer_steps`
- Status should be `200 OK`
- Response should contain JSON with `answer_variants` arrays

**If you see 401/403:**

- Authentication issue - check Supabase API key
- RLS blocking - disable RLS or add policy

**If you see 404:**

- Table doesn't exist
- Wrong table name

---

### Step 5: Verify File Saves

**Check if our changes were actually saved:**

1. **TugonPlay.tsx** should have:

   ```typescript
   // Line 8 - Should be commented:
   // import { getAnswerForQuestion, answersByTopicAndCategory } from "...";

   // Lines 123-134 - Should be commented or removed:
   // const expectedAnswers = useMemo(() => { ... }, [...]);

   // Line 615 & 692 - Should NOT have expectedAnswers prop:
   <QuestionTemplate
     topicId={topicId}
     categoryId={finalCategoryId}
     questionId={questionId}
     // expectedAnswers={expectedAnswers} ← Should NOT exist!
   ```

2. **QuestionTemplate.tsx** should have:

   ```typescript
   // Line 18 - Should be optional:
   expectedAnswers?: any;  // ✨ OPTIONAL

   // Lines 94-100 - Should use conditional spreading:
   {...(expectedAnswers && { expectedAnswers })}
   ```

3. **AnswerWizard.tsx** should have:
   ```typescript
   // Line 114 - Enhanced logging:
   console.log("📝 Using provided expectedAnswers prop");
   console.log("📝 expectedAnswers content:", expectedAnswers);
   ```

---

### Step 6: Fresh Start Checklist

If nothing works, try this:

1. **Stop dev server** (Ctrl+C)

2. **Clear all caches:**

   ```bash
   # Delete build folders
   rm -rf .next
   rm -rf node_modules/.cache
   rm -rf dist
   ```

3. **Restart TypeScript server in VS Code:**

   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"
   - Press Enter

4. **Restart dev server:**

   ```bash
   npm run dev
   ```

5. **Hard refresh browser:**

   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Or `Cmd+Shift+R` (Mac)

6. **Clear browser console**

7. **Navigate to question**

8. **Check for messages in order:**
   - `🔍 ANSWERWIZARD USEEFFECT TRIGGERED`
   - `hasExpectedAnswers: false` ← CRITICAL!
   - `🔄 Fetching answer steps from Supabase ONLY`
   - `📝 Fetching answer steps from Supabase for Question`
   - `✅ Fetched X answer steps from Supabase`
   - `✅ Loaded answer steps from Supabase`

---

## 🎯 Quick Diagnostic Command

**Run this in browser console:**

```javascript
// Check if AnswerWizard exists
const answWiz = document.querySelector('[class*="space-y-2"]');
console.log("AnswerWizard found:", !!answWiz);

// Check if you can access React DevTools
console.log(
  "React DevTools installed:",
  !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
);

// Check Supabase client
console.log(
  "Supabase URL configured:",
  localStorage.getItem("supabase.auth.token") !== null
);
```

---

## 📊 Expected Console Output (Success)

When everything works, you should see this **in order**:

```javascript
// 1. Component mounts
🔍 ANSWERWIZARD USEEFFECT TRIGGERED: {
  topicId: 2,
  categoryId: 1,
  questionId: 1,
  hasExpectedAnswers: false,  // ✅ GOOD!
  expectedAnswersLength: 0
}

// 2. Starts Supabase fetch
🔄 Fetching answer steps from Supabase ONLY: Topic 2, Category 1, Question 1

// 3. Query executes
📝 Fetching answer steps from Supabase for Question (2, 1, 1)

// 4. Data received
✅ Fetched 3 answer steps from Supabase

// 5. Data converted
📊 Converted steps: [
  {
    label: "substitution",
    answer: ["f(5) = 2(5) + 3", "f(5)=2(5)+3"],
    placeholder: "Substitute x = 5"
  },
  {
    label: "simplification",
    answer: ["f(5) = 10 + 3", "f(5)=10+3"],
    placeholder: "Simplify"
  },
  {
    label: "final",
    answer: ["13", "f(5) = 13"],
    placeholder: "Final answer"
  }
]

// 6. SUCCESS!
✅ Loaded answer steps from Supabase: {
  questionId: 1,
  questionText: "Question 1",
  type: "multiLine",
  steps: [...]
}

// 7. Debug info
🎯 EXPECTED STEPS DEBUG: {
  topicId: 2,
  categoryId: 1,
  questionId: 1,
  answersSource: [...],
  expectedSteps: [...]
}
```

---

## 🚨 Common Issues

### Issue 1: TypeScript Cache

**Symptoms:** Changes not reflecting

**Solution:**

- Restart TS server
- Restart VS Code
- Delete `.next` folder

### Issue 2: Browser Cache

**Symptoms:** Old code running

**Solution:**

- Hard refresh (Ctrl+Shift+R)
- Clear site data in DevTools
- Try incognito mode

### Issue 3: Supabase RLS

**Symptoms:** 401/403 errors

**Solution:**

```sql
ALTER TABLE tugonsense_answer_steps DISABLE ROW LEVEL SECURITY;
-- Or add SELECT policy for anon users
```

### Issue 4: Wrong Table Name

**Symptoms:** 404 errors

**Solution:**
Verify table name in Supabase dashboard matches `tugonsense_answer_steps` exactly

---

## 📝 What to Report Back

Please share:

1. **Which messages you see** (copy-paste from console)
2. **Which messages you DON'T see** (from expected list above)
3. **Any error messages** (red text in console)
4. **Network tab** - screenshot of Supabase request (if any)
5. **Current question IDs** - which question are you testing?

This will help me pinpoint exactly where the issue is! 🎯
