# Action Plan: Integrating Supabase Progress into ProgressMap

## 🚨 CRITICAL ISSUE FOUND

Your progress table schemas have a **foreign key mismatch**:

### Current Problem:

```sql
-- Your schema references database PRIMARY KEYS (bigserial)
category_id BIGINT REFERENCES tugonsense_categories(id)
question_id BIGINT REFERENCES tugonsense_questions(id)

-- But your app uses LOGICAL IDs:
Topic 1, Category 1 (logical category_id = 1)
Topic 1, Category 2 (logical category_id = 2)
Topic 2, Category 1 (logical category_id = 1) ← Same as above!
```

### Why This Is a Problem:

- `tugonsense_categories.id` is an auto-incrementing bigserial (1, 2, 3, 4...)
- But your app uses `category_id` which resets per topic (1, 2, 3, 1, 2, 3...)
- Progress tables are referencing the **wrong ID**!

---

## ✅ SOLUTION

### Step 1: Run SQL Migration

Run this in Supabase SQL Editor:

```sql
-- File: supabase/migrations/fix_progress_foreign_keys.sql
```

This will:

1. ✅ Change `category_id` from BIGINT → INTEGER
2. ✅ Change `question_id` from BIGINT → INTEGER
3. ✅ Update foreign keys to reference composite keys (topic_id, category_id)
4. ✅ Maintain CASCADE delete behavior

### Step 2: Use Supabase Progress Service

File created: `src/lib/supabaseProgress.ts`

This service provides:

- `getCategoryProgress(topicId, categoryId)` - Get progress for a category
- `getTopicProgress(topicId)` - Get full topic progress
- `recordAttempt(attemptResult)` - Save user attempt
- `getCategoryStats(topicId, categoryId)` - Lightweight stats for ProgressMap
- `resetCategoryProgress(topicId, categoryId)` - Reset for replay

### Step 3: Create Hybrid Service (Supabase + localStorage fallback)

Create: `src/lib/hybridProgressService.ts`

```typescript
import { supabase } from "./supabase";
import { progressService } from "../components/tugon/services/progressServices";
import { supabaseProgressService } from "./supabaseProgress";

class HybridProgressService {
  async isAuthenticated(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  }

  async getCategoryProgress(topicId: number, categoryId: number) {
    if (await this.isAuthenticated()) {
      // Use Supabase
      return await supabaseProgressService.getCategoryProgress(
        topicId,
        categoryId
      );
    } else {
      // Fall back to localStorage
      return progressService.getCategoryProgress(topicId, categoryId);
    }
  }

  async getCategoryStats(topicId: number, categoryId: number) {
    if (await this.isAuthenticated()) {
      return await supabaseProgressService.getCategoryStats(
        topicId,
        categoryId
      );
    } else {
      return progressService.getCategoryStats(topicId, categoryId);
    }
  }

  async recordAttempt(attemptResult: AttemptResult) {
    if (await this.isAuthenticated()) {
      await supabaseProgressService.recordAttempt(attemptResult);
    } else {
      progressService.recordAttempt(attemptResult);
    }
  }

  // ... other methods
}

export const hybridProgressService = new HybridProgressService();
```

### Step 4: Update ProgressMap

Replace this line in `ProgressMap.tsx`:

```typescript
// OLD:
const [userProgress, setUserProgress] = useState(
  progressService.getUserProgress()
);

// NEW:
const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadProgress = async () => {
    if (await hybridProgressService.isAuthenticated()) {
      // Load from Supabase
      const topics = await Promise.all(
        levels.map((level) => hybridProgressService.getTopicProgress(level.id))
      );
      setUserProgress({
        userId: "supabase-user",
        topicProgress: topics.filter(Boolean),
        // ... other fields
      });
    } else {
      // Load from localStorage
      setUserProgress(progressService.getUserProgress());
    }
    setLoading(false);
  };

  loadProgress();
}, []);
```

---

## 📋 Step-by-Step Implementation

### ✅ 1. Run SQL Migration

```bash
# In Supabase Dashboard → SQL Editor
# Copy-paste content from: supabase/migrations/fix_progress_foreign_keys.sql
# Click "Run"
```

### ✅ 2. Test Supabase Service

```typescript
// In browser console or test file
import { supabaseProgressService } from "./lib/supabaseProgress";

// Test getting progress
const progress = await supabaseProgressService.getCategoryProgress(1, 1);
console.log("Category progress:", progress);
```

### ✅ 3. Create Hybrid Service

```bash
# Create: src/lib/hybridProgressService.ts
# (Implementation above)
```

### ✅ 4. Update ProgressMap

```typescript
// Import hybrid service
import { hybridProgressService } from "../lib/hybridProgressService";

// Replace progressService calls with hybridProgressService
```

### ✅ 5. Test Both Modes

1. **Logged Out** → Should use localStorage
2. **Logged In** → Should use Supabase
3. **Record Attempt** → Should save to correct location

---

## 🧪 Testing Checklist

### Before Migration:

- [ ] Backup current localStorage data
- [ ] Verify Supabase connection works

### After Migration:

- [ ] Foreign keys updated correctly
- [ ] No orphaned records
- [ ] Progress queries return data

### Integration Testing:

- [ ] Authenticated user sees Supabase progress
- [ ] Unauthenticated user sees localStorage progress
- [ ] Recording attempt saves correctly
- [ ] Category completion triggers recalculation
- [ ] Reset category works
- [ ] Latest/fastest attempts stored properly

---

## 🔧 Files Modified/Created

### Created:

1. ✅ `src/lib/supabaseProgress.ts` - Supabase progress service
2. ✅ `supabase/migrations/fix_progress_foreign_keys.sql` - Schema fix
3. ⏳ `src/lib/hybridProgressService.ts` - Hybrid service (you create this)

### To Modify:

1. ⏳ `src/components/ProgressMap.tsx` - Use hybrid service
2. ⏳ `src/pages/reviewer/TugonPlay.tsx` - Use hybrid service for recording attempts

---

## ⚠️ Important Notes

1. **Run Migration First** - Don't update code until schema is fixed
2. **Test Incrementally** - Test each component separately
3. **Keep localStorage** - Don't delete it; use as fallback
4. **Monitor Console** - Look for Supabase errors

---

## 🚀 Ready to Start?

**Next Action:** Run the SQL migration in Supabase, then let me know when it's complete. I'll help you create the hybrid service and update ProgressMap.

Would you like me to:

1. Create the hybrid service file?
2. Show you how to update ProgressMap?
3. Explain the migration in more detail?
