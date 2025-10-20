# Quick Start: Add Progress Tester to Your App

## Option 1: Add to Existing TugonSense Page (Recommended)

1. Open `src/pages/reviewer/TugonSense.tsx`

2. Add the import at the top:

```tsx
import HybridProgressServiceTester from "@/components/HybridProgressServiceTester";
```

3. Add the component in your JSX (after the courses section):

```tsx
{
  /* Existing courses code... */
}

{
  /* Add this at the end before closing tags */
}
<div className="mt-12">
  <HybridProgressServiceTester />
</div>;
```

4. Save and the tester will appear at the bottom of TugonSense page

---

## Option 2: Create Dedicated Test Route

1. Create new file: `src/pages/TestProgressService.tsx`

```tsx
import HybridProgressServiceTester from "@/components/HybridProgressServiceTester";

export default function TestProgressService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Progress Service Testing Dashboard
        </h1>
        <HybridProgressServiceTester />
      </div>
    </div>
  );
}
```

2. Add route in your router (e.g., `src/App.tsx` or router file):

```tsx
import TestProgressService from "./pages/TestProgressService";

// In your routes:
<Route path="/test-progress" element={<TestProgressService />} />;
```

3. Access at: `http://localhost:5173/test-progress`

---

## Option 3: Temporary Test (No File Changes)

If you want to test WITHOUT modifying your app:

1. Open browser console (F12)

2. Paste this code to mount the component temporarily:

```javascript
// Import React and the tester
const { createElement: h } = await import("react");
const { createRoot } = await import("react-dom/client");
const HybridTester = (
  await import("./src/components/HybridProgressServiceTester")
).default;

// Create container
const container = document.createElement("div");
container.id = "temp-tester";
container.style.cssText =
  "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: rgba(0,0,0,0.8); overflow: auto; padding: 20px;";

// Add close button
const closeBtn = document.createElement("button");
closeBtn.textContent = "✕ Close";
closeBtn.style.cssText =
  "position: fixed; top: 20px; right: 20px; z-index: 10000; background: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;";
closeBtn.onclick = () => container.remove();
container.appendChild(closeBtn);

// Render component
document.body.appendChild(container);
const root = createRoot(container);
root.render(h(HybridTester));

console.log("✅ Tester mounted! Click the X button to close.");
```

---

## Usage Instructions

Once the tester is visible on your page:

### Quick Test Flow

1. **Check Authentication Status**

   - Top of tester shows: "✅ Authenticated" or "🔓 Guest Mode"
   - Shows which backend is active: "localStorage" or "Supabase"

2. **Test Guest Mode**

   - Log out (if logged in)
   - Click "Test 1: Guest Mode"
   - Watch the test console

3. **Test Authenticated Mode**

   - Log in
   - Click "Test 2: Authenticated Mode"
   - Check Supabase dashboard for data

4. **Test Migration**

   - Log out
   - Click "Test 3: Migration Setup"
   - Log back in
   - Watch browser console for migration messages

5. **View Progress**
   - Click "Test 4: View Progress"
   - See detailed breakdown of all progress

---

## Example: Adding to TugonSense.tsx

Here's a complete example showing where to add it:

```tsx
// src/pages/reviewer/TugonSense.tsx

import { useState, useEffect } from "react";
import CourseCard from "@/components/CourseCard";
import { fetchTopics } from "@/lib/supabaseTopics";
import { defaultTopics } from "@/components/data/questions/index";
import HybridProgressServiceTester from "@/components/HybridProgressServiceTester"; // ← ADD THIS

export default function TugonSense() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... existing code ...

  return (
    <div className="min-h-screen">
      {/* ... existing header and courses grid ... */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* ADD TESTER HERE ↓ */}
      <div className="mt-12">
        <HybridProgressServiceTester />
      </div>
      {/* ADD TESTER HERE ↑ */}
    </div>
  );
}
```

---

## Testing Workflow

### 1. Initial Setup (Do Once)

```
✓ Add tester component to page
✓ Verify it renders with auth status
✓ Check browser console for errors
```

### 2. Guest Mode Test (5 minutes)

```
✓ Log out
✓ Run Test 1
✓ Check localStorage in DevTools
✓ Verify test passes
```

### 3. Authenticated Mode Test (5 minutes)

```
✓ Log in
✓ Run Test 2
✓ Check Supabase dashboard
✓ Verify test passes
```

### 4. Migration Test (10 minutes)

```
✓ Log out
✓ Run Test 3 (setup)
✓ Log in (watch console!)
✓ Run Test 4 (verify)
✓ Check both localStorage and Supabase
```

**Total Testing Time: ~20-25 minutes**

---

## Quick Verification Checklist

After adding the tester, verify these work:

**Visual Checks:**

- [ ] Tester component renders without errors
- [ ] Authentication status shows correctly
- [ ] Test buttons are clickable
- [ ] Test console is visible

**Functional Checks:**

- [ ] Can run Test 1 when logged out
- [ ] Can run Test 2 when logged in
- [ ] Test 3 sets up migration data
- [ ] Test 4 shows current progress
- [ ] Clear button works

**Data Checks:**

- [ ] Guest mode saves to localStorage
- [ ] Auth mode saves to Supabase
- [ ] Migration transfers data correctly
- [ ] No data loss occurs

---

## Troubleshooting

### Tester doesn't render

```typescript
// Check if import path is correct
import HybridProgressServiceTester from "@/components/HybridProgressServiceTester";

// Or try relative path:
import HybridProgressServiceTester from "../components/HybridProgressServiceTester";
```

### TypeScript errors

```bash
# Restart TypeScript server in VS Code:
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Component not found

```bash
# Verify file exists:
ls src/components/HybridProgressServiceTester.tsx

# If not found, create it from the earlier code
```

### Styling issues

```tsx
// Make sure Tailwind classes are working
// Add this import if needed:
import "@/styles/globals.css";
```

---

## Next Steps

1. ✅ Add tester component to your app
2. ✅ Run all 4 tests
3. ✅ Verify data in localStorage and Supabase
4. ✅ Document test results
5. ✅ Remove/hide tester in production (optional)

---

## Production Considerations

### Option A: Hide in Production

```tsx
// Only show in development
{
  import.meta.env.DEV && <HybridProgressServiceTester />;
}
```

### Option B: Admin-Only Access

```tsx
// Only show for admin users
{
  user?.role === "admin" && <HybridProgressServiceTester />;
}
```

### Option C: Separate Route

```tsx
// Keep on /test-progress route
// Don't link from main navigation
// Only accessible by typing URL
```

---

Ready to test! Follow the steps above and refer to `TESTING_HYBRID_PROGRESS_SERVICE.md` for detailed testing instructions. 🚀
