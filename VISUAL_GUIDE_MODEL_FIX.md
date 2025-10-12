# Visual: Model Mismatch Fix

## 🔍 The Problem (Before)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (hintGenerator.ts)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                POST /api/gemini-hint
                {
                  model: "gemini-2.5-flash" ❌ INCOMPLETE
                }
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (gemini-hint.ts)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ IGNORES model parameter
                            │
            URL = "gemini-2.5-flash-preview-05-20" ✅ CORRECT
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini API                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ❌ 404 NOT FOUND
    "models/gemini-1.5-flash is not found"

    WHY? Backend logs showed it was trying gemini-1.5-flash
    even though code had gemini-2.5-flash-preview-05-20
```

---

## ✅ The Solution (After)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (hintGenerator.ts)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                POST /api/gemini-hint
                {
                  model: "gemini-2.5-flash-preview-05-20" ✅ FULL NAME
                }
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (gemini-hint.ts)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ READS model from request
                            │
            const modelName = model || 'gemini-2.5-flash-preview-05-20'
            URL = `...models/${modelName}:generateContent...`
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini API                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ✅ 200 SUCCESS
    {
      "candidates": [{
        "content": {
          "parts": [{ "text": "{\"templates\":[...]}" }]
        }
      }]
    }
```

---

## 📊 Code Changes Side-by-Side

### Frontend (hintGenerator.ts)

```diff
  body: JSON.stringify({
-   model: 'gemini-2.5-flash',                    // ❌ OLD: Incomplete
+   model: 'gemini-2.5-flash-preview-05-20',      // ✅ NEW: Full official name
    constraints: {
      maxTokens: 1200,
      temperature: 0.9,
      format: 'json'
    },
    prompt
  })
```

### Backend (gemini-hint.ts)

```diff
- // ❌ OLD: Hardcoded model
- const url =
-   "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" +
-   encodeURIComponent(apiKey);

+ // ✅ NEW: Dynamic model from request
+ const modelName = model || 'gemini-2.5-flash-preview-05-20';
+ console.log('🤖 Using model:', modelName);
+
+ const url =
+   `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
```

---

## 🎯 Testing Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Start Backend                                      │
└─────────────────────────────────────────────────────────────┘
  npm run dev:api
        │
        ▼
  Console shows:
  🚀 Server running on http://localhost:3000

┌─────────────────────────────────────────────────────────────┐
│ Step 2: Open Frontend                                      │
└─────────────────────────────────────────────────────────────┘
  npm run dev
        │
        ▼
  Component mounts
        │
        ▼
  useEffect triggers
        │
        ▼
  hintGenerator.generateBehaviorTemplates()

┌─────────────────────────────────────────────────────────────┐
│ Step 3: API Call                                           │
└─────────────────────────────────────────────────────────────┘
  Frontend → Backend
  POST /api/gemini-hint
  {
    model: "gemini-2.5-flash-preview-05-20",
    prompt: "Generate templates..."
  }

┌─────────────────────────────────────────────────────────────┐
│ Step 4: Backend Logs                                       │
└─────────────────────────────────────────────────────────────┘
  🔥 NEW API CODE IS RUNNING!
  📥 Received payload: { model: "gemini-2.5-flash-preview-05-20" }
  🤖 Using model: gemini-2.5-flash-preview-05-20
  🚀 Enhanced prompt: ...
  📤 Sending to Gemini: {...}

┌─────────────────────────────────────────────────────────────┐
│ Step 5: Gemini Response                                    │
└─────────────────────────────────────────────────────────────┘
  📥 Gemini response: {
    "candidates": [{
      "content": {
        "parts": [{
          "text": "{\"templates\":[...]}"
        }]
      }
    }]
  }

┌─────────────────────────────────────────────────────────────┐
│ Step 6: Frontend Console                                   │
└─────────────────────────────────────────────────────────────┘
  🤖 Generating universal behavior templates...
  ✅ Generated behavior templates: 8 behaviors
  ✅ AI behavior templates loaded: {templates: Array(8), ...}

┌─────────────────────────────────────────────────────────────┐
│ Step 7: Enter Wrong Answer 3x                              │
└─────────────────────────────────────────────────────────────┘
  User enters: "2-3" (wrong)
  User enters: "2-3" (wrong)
  User enters: "2-3" (wrong)
        │
        ▼
  wrongAttemptCounter === 3
        │
        ▼
  showHintMessage() triggered

┌─────────────────────────────────────────────────────────────┐
│ Step 8: Toast Displays                                     │
└─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │  ┃  ┌─────┐                             │
  │  ┃  │ ⚠️  │   Hey there,                │
  │  ┃  └─────┘                             │
  │  ┃                                       │
  │  ┃     I see you're confusing plus      │
  │  ┃     and minus signs with  "-"        │
  │  ┃     in the substitution!             │
  │  ┃                          ^^^         │
  │  ┃                    (RED BOLD BG)     │
  └─────────────────────────────────────────┘
```

---

## 🚨 Expected Console Output

### ✅ Success (What You Should See)

**Backend Console:**

```
🔥 NEW API CODE IS RUNNING!
📥 Received payload: { model: "gemini-2.5-flash-preview-05-20", ... }
🤖 Using model: gemini-2.5-flash-preview-05-20
🚀 Enhanced prompt: You are a friendly math tutor...
📤 Sending to Gemini: { contents: [...], generationConfig: {...} }
📥 Gemini response: { candidates: [...] }
✅ Generated hint: {...}
```

**Frontend Console:**

```
🤖 Generating universal behavior templates...
✅ Generated behavior templates: 8 behaviors
✅ AI behavior templates loaded: {
  templates: Array(8),
  generatedAt: 1728734400000,
  expiresIn: 86400000
}
```

**Browser Network Tab:**

```
POST /api/gemini-hint
Status: 200 OK
Response: { hint: "{\"templates\":[...]}" }
```

---

### ❌ Failure (What You Should NOT See)

**Backend Console:**

```
❌ [dev-api] Gemini error 404
❌ "models/gemini-1.5-flash is not found"
❌ "models/gemini-2.5-flash is not found"
```

**Frontend Console:**

```
❌ Failed to load behavior templates
❌ API error: 404
```

**Browser Network Tab:**

```
POST /api/gemini-hint
Status: 500 Internal Server Error
```

---

## 🔄 Troubleshooting Decision Tree

```
                    Start Here
                        │
                        ▼
            Is backend running? ────NO──→ Start: npm run dev:api
                        │
                       YES
                        │
                        ▼
       Backend shows "NEW API CODE"? ────NO──→ Restart backend
                        │
                       YES
                        │
                        ▼
        Backend logs "Using model: ..."? ────NO──→ Check file saved
                        │
                       YES
                        │
                        ▼
              Still getting 404? ────YES──→ Check API key
                        │                    Check model name
                       NO                    Test curl command
                        │
                        ▼
                  ✅ SUCCESS!
         Templates loaded, toast works
```

---

## 📝 Quick Reference

### Model Names

```
✅ CORRECT: gemini-2.5-flash-preview-05-20
❌ WRONG:   gemini-2.5-flash
❌ WRONG:   gemini-1.5-flash
```

### Files Changed

```
✅ src/components/tugon/services/hintGenerator.ts (line 95)
✅ api/gemini-hint.ts (lines 69-73)
```

### Commands

```bash
# Restart backend
npm run dev:api

# Check running processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Clear browser cache
Ctrl+Shift+R (hard refresh)
localStorage.clear() in console
```

---

**Status:** ✅ Fixed and Ready to Test  
**Next Action:** Restart backend → Test in browser
