# 🔧 API Troubleshooting Guide

## Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

### What This Means

This error occurs when the API endpoint is returning HTML (usually a 404 error page) instead of JSON. This typically happens when:

1. The API endpoint hasn't been deployed yet
2. The API file path is incorrect
3. Vercel hasn't built the function yet

---

## ✅ Quick Fixes Applied

### 1. **Fixed API URL**

Changed from conditional development/production URL to always use production:

```typescript
// Before (WRONG - causes issues in dev)
const apiUrl =
  import.meta.env.MODE === "production"
    ? "https://tugon-v2-eta.vercel.app/api/topic-creation"
    : "/api/topic-creation"; // ❌ This doesn't exist locally

// After (CORRECT)
const apiUrl = "https://tugon-v2-eta.vercel.app/api/topic-creation"; // ✅ Always use deployed API
```

### 2. **Added Response Type Check**

Now checks if response is JSON before trying to parse:

```typescript
const contentType = response.headers.get("content-type");
if (!contentType || !contentType.includes("application/json")) {
  const text = await response.text();
  console.error("❌ Non-JSON response:", text);
  throw new Error(
    "API returned non-JSON response. Check if the endpoint exists."
  );
}
```

### 3. **Enhanced Error Messages**

Shows clearer error when JSON parsing fails:

```typescript
if (errorMessage.includes("Unexpected token")) {
  errorMessage =
    "API Error: The backend endpoint may not be deployed correctly. " +
    "Please ensure 'api/topic-creation.ts' is committed and deployed to Vercel.";
}
```

---

## 🧪 How to Test

### Test 1: Check if API Endpoint Exists

Open your browser and go to:

```
https://tugon-v2-eta.vercel.app/api/topic-creation
```

**Expected Response:**

- If working: `{"error":"Method not allowed"}` (because it expects POST)
- If broken: 404 HTML page or Vercel error page

### Test 2: Test with curl (PowerShell)

```powershell
$body = @{
    submissionId = "test-id"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tugon-v2-eta.vercel.app/api/topic-creation" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  | Select-Object -ExpandProperty Content
```

**Expected Response:**
Should return JSON (even if it's an error about invalid submission ID)

### Test 3: Check Vercel Deployment

1. Go to https://vercel.com/dashboard
2. Find your `TugonV2` project
3. Click on the latest deployment
4. Go to "Functions" tab
5. Look for `api/topic-creation.func`

**Should show:**

- ✅ Function exists and is deployed
- Size, invocations, etc.

---

## 🚀 Deployment Checklist

### If API is NOT working:

1. **Verify file exists locally:**

   ```powershell
   Get-Item api/topic-creation.ts
   ```

2. **Check git status:**

   ```powershell
   git status
   ```

3. **Commit if needed:**

   ```powershell
   git add api/topic-creation.ts
   git commit -m "Add topic creation API endpoint"
   ```

4. **Push to trigger deployment:**

   ```powershell
   git push
   ```

5. **Wait for Vercel deployment** (~2-3 minutes)

   - Watch at: https://vercel.com/dashboard
   - Look for "Building..." → "Ready"

6. **Test the endpoint again:**
   ```
   https://tugon-v2-eta.vercel.app/api/topic-creation
   ```

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console

When you submit a topic, open DevTools (F12) and check Console for:

```
📤 Calling API: https://tugon-v2-eta.vercel.app/api/topic-creation
📥 API Response status: 200 (or 404, 500, etc.)
❌ Non-JSON response received: <!DOCTYPE html>... (if error)
```

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Submit a topic
3. Find the `topic-creation` request
4. Click on it
5. Check the "Response" tab

**If you see HTML:**

- API is not deployed or wrong URL

**If you see JSON:**

- API is working! Check the actual error message

### Step 3: Check Vercel Logs

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Logs" or "Functions"
4. Filter by `topic-creation`
5. Look for errors in function execution

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Cannot find module" in Vercel logs

**Solution:**

```powershell
# Install missing dependencies
npm install @vercel/node @supabase/supabase-js
git add package.json package-lock.json
git commit -m "Add API dependencies"
git push
```

### Issue 2: CORS errors

**Solution:**
The API already has CORS headers. If you still see CORS errors, check:

1. Are you using HTTPS? (not HTTP)
2. Is the domain correct?

### Issue 3: Environment variables not set

**Solution:**
Check Vercel dashboard → Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GENAI_API_KEY`

If missing, add them and redeploy.

### Issue 4: 404 on API route

**Solution:**
Ensure `vercel.json` has correct configuration:

```json
{
  "functions": {
    "api/**/*.[jt]s": {
      "runtime": "@vercel/node@5.3.14"
    }
  }
}
```

---

## ✅ Working Example

If everything is working, you should see this flow:

1. **Submit topic** → Console shows:

   ```
   ✅ Submission created: abc-123-def
   📤 Calling API: https://tugon-v2-eta.vercel.app/api/topic-creation
   📥 API Response status: 200
   📥 API Result: { success: true, draftTopicId: "xyz-456" }
   ```

2. **Success alert:**

   ```
   ✅ Topic submitted successfully! It has been sent to teachers for review.
   ```

3. **Check Supabase:**
   - New row in `topic_submissions`
   - New row in `validation_results`
   - New row in `teacher_topics`

---

## 📞 Still Not Working?

### Quick Test Script

Run this in your browser console on the tugon-topics page:

```javascript
// Test API directly
fetch("https://tugon-v2-eta.vercel.app/api/topic-creation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ submissionId: "test-123" }),
})
  .then((r) => {
    console.log("Status:", r.status);
    console.log("Content-Type:", r.headers.get("content-type"));
    return r.text();
  })
  .then((text) => {
    console.log("Raw response:", text);
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
    } catch (e) {
      console.error("Not JSON! Response is:", text.substring(0, 200));
    }
  })
  .catch((err) => console.error("Fetch error:", err));
```

**Expected output:**

```
Status: 404 or 500 (with error about invalid submission ID)
Content-Type: application/json
Parsed JSON: { error: "..." }
```

**If you see:**

```
Status: 404
Content-Type: text/html
Not JSON! Response is: <!DOCTYPE html>...
```

Then the API endpoint is **NOT deployed**. Follow deployment checklist above.

---

## 🎯 Next Steps

1. ✅ Changes applied to `tugon_topics.tsx`
2. 🔄 Commit and push changes:
   ```powershell
   git add src/pages/topic_creation/tugon_topics.tsx
   git commit -m "Fix API endpoint and add better error handling"
   git push
   ```
3. ⏰ Wait for Vercel deployment
4. 🧪 Test the submission form
5. ✅ Should work now!

---

_Last updated: After fixing API URL and error handling_
