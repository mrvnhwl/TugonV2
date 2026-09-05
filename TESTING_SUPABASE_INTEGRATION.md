# How to Test Supabase Topics Integration

## ✅ Prerequisites

1. **SQL Migration Complete:** Run the migration script in Supabase SQL Editor
2. **Topics Data Inserted:** 5 topics should exist in `tugonsense_topics` table
3. **Environment Variables Set:** `.env` file has:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🧪 Testing Methods

### Method 1: Visual Test (Easiest)

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

2. **Navigate to TugonSense:**

   - Open browser to `http://localhost:5173` (or your dev URL)
   - Click on "TugonSense" or navigate to `/tugonsense`

3. **Check for loading spinner:**

   - Should briefly show "Loading topics from Supabase..."

4. **Verify CourseCard displays Supabase data:**

   - Look at the topic title (should be from Supabase `name` column)
   - Look at description (should be from Supabase `description` column)

5. **Open Browser Console (F12):**
   - Should see: `✅ Loaded topics from Supabase: [Array]`
   - If you see: `⚠️ No topics in Supabase, using local data` → Check database
   - If you see: `❌ Failed to load topics` → Check connection

### Method 2: Database Verification

1. **Go to Supabase Dashboard**
2. **Navigate to:** Table Editor → `tugonsense_topics`
3. **Verify 5 rows exist:**
   ```
   id | name                               | description
   ---|------------------------------------|--------------
   1  | Mastering All Types of Functions!  | Learn about...
   2  | Evaluating Functions               | Practice...
   3  | Piecewise-Defined Functions        | Understand...
   4  | Operations on Functions            | Add, subtract...
   5  | Composition of Functions           | Compose...
   ```

### Method 3: Run Test Script

1. **In your browser console (F12), run:**

   ```javascript
   import("./src/lib/testSupabaseConnection.ts").then((m) =>
     m.testSupabaseConnection()
   );
   ```

2. **Or add to TugonSense temporarily:**

   ```typescript
   import { testSupabaseConnection } from "../../lib/testSupabaseConnection";

   useEffect(() => {
     testSupabaseConnection();
   }, []);
   ```

### Method 4: API Test (Postman/Thunder Client)

1. **GET Request:**

   ```
   URL: https://your-project.supabase.co/rest/v1/tugonsense_topics
   Headers:
     - apikey: your-anon-key
     - Authorization: Bearer your-anon-key
   ```

2. **Expected Response:**
   ```json
   [
     {
       "id": 1,
       "name": "Mastering All Types of Functions!",
       "description": "Learn about functions, notation, domain, and range.",
       "created_at": "2025-01-20T...",
       "updated_at": "2025-01-20T..."
     },
     ...
   ]
   ```

## 🐛 Troubleshooting

### Issue: "Failed to load topics from Supabase"

**Possible Causes:**

1. ❌ Environment variables not set
   - Check `.env` file exists
   - Restart dev server after adding `.env`
2. ❌ RLS policies blocking access
   - Run in SQL Editor:
     ```sql
     SELECT * FROM tugonsense_topics;
     ```
   - If it fails, RLS policies are too strict
3. ❌ Supabase URL/Key incorrect
   - Go to Project Settings → API
   - Copy URL and anon key
   - Update `.env`

### Issue: "No topics in Supabase, using local data"

**Possible Causes:**

1. ❌ Migration didn't insert topics
   - Run this in SQL Editor:
     ```sql
     SELECT COUNT(*) FROM tugonsense_topics;
     ```
   - Should return 5
2. ❌ Topics deleted accidentally
   - Re-run the INSERT statement from migration

### Issue: CourseCard shows wrong data

**Check:**

1. Browser console - which data source was used?
2. Inspect the CourseCard props in React DevTools
3. Verify the topic ID matches between Supabase and local data

## ✨ Expected Behavior

### Success Flow:

1. Page loads → Shows loading spinner
2. Fetches from Supabase (1-2 seconds)
3. Console logs: "✅ Loaded topics from Supabase"
4. CourseCard displays Supabase data
5. User can navigate between topics

### Fallback Flow:

1. Page loads → Shows loading spinner
2. Supabase fetch fails
3. Console logs: "❌ Failed to load topics" + error
4. Console logs: "📁 Falling back to local data"
5. CourseCard displays local TypeScript data
6. Everything still works (just not from database)

## 📊 Comparison: Local vs Supabase

| Feature     | Local (TypeScript)   | Supabase (Database)    |
| ----------- | -------------------- | ---------------------- |
| Load time   | Instant              | 1-2 seconds            |
| Updates     | Requires code deploy | Update via SQL/Admin   |
| Offline     | ✅ Works             | ❌ Requires connection |
| Scalability | Limited to bundle    | ✅ Unlimited           |
| Multi-user  | ❌ No sync           | ✅ Real-time           |

## 🎯 Next Steps After Successful Test

1. ✅ **Categories:** Integrate `tugonsense_categories` table
2. ✅ **Questions:** Integrate `tugonsense_questions` table
3. ✅ **Answer Steps:** Integrate `tugonsense_answer_steps` table
4. ✅ **Admin Panel:** Build UI to manage topics
5. ✅ **Caching:** Add React Query for better performance

---

**Need Help?** Check the integration document: `INTEGRATION_SUPABASE_TOPICS.md`
