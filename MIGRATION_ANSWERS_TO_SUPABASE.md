# 🔄 Migration Guide: Hardcoded Answers → Supabase

## Quick Reference

### TypeScript Format (OLD)

```typescript
// src/components/data/answers/topic2/category1.ts
export const Topic2_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Evaluate f(x) = 2x + 3 when x = 5",
    type: "multiLine",
    steps: [
      {
        label: "substitution",
        answer: "f(5) = 2(5) + 3",
        placeholder: "Substitute x = 5",
      },
      {
        label: "simplification",
        answer: "f(5) = 10 + 3",
      },
      {
        label: "final",
        answer: "13",
      },
    ],
  },
];
```

### SQL Format (NEW)

```sql
INSERT INTO tugonsense_answer_steps
  (topic_id, category_id, question_id, step_order, label, answer_variants, placeholder)
VALUES
  (2, 1, 1, 1, 'substitution', '["f(5) = 2(5) + 3", "f(5)=2(5)+3"]'::jsonb, 'Substitute x = 5'),
  (2, 1, 1, 2, 'simplification', '["f(5) = 10 + 3", "f(5)=10+3"]'::jsonb, NULL),
  (2, 1, 1, 3, 'final', '["13", "f(5) = 13", "f(5)=13"]'::jsonb, NULL);
```

---

## Step-by-Step Migration

### Step 1: Identify Your Structure

From `src/components/data/answers/index.ts`:

```typescript
export const answersByTopicAndCategory = {
  1: {
    // Topic 1: Introduction to Functions
    1: Topic1_Category1_Answers,
    2: Topic1_Category2_Answers,
    // ...
  },
  2: {
    // Topic 2: Evaluating Functions
    1: Topic2_Category1_Answers,
    2: Topic2_Category2_Answers,
    // ...
  },
  // ...
};
```

### Step 2: Extract Values

For each answer file (e.g., `topic2/category1.ts`):

- **Topic ID**: 2
- **Category ID**: 1
- **Questions**: Array of PredefinedAnswer objects

### Step 3: Convert Each Question

**Template:**

```sql
-- Question {questionId}
INSERT INTO tugonsense_answer_steps
  (topic_id, category_id, question_id, step_order, label, answer_variants, placeholder)
VALUES
  ({topic_id}, {category_id}, {questionId}, 1, '{step1.label}',
   '{step1.answer_variants}'::jsonb,
   '{step1.placeholder}'),

  ({topic_id}, {category_id}, {questionId}, 2, '{step2.label}',
   '{step2.answer_variants}'::jsonb,
   '{step2.placeholder}'),

  -- ... more steps
```

---

## 🔧 Conversion Script (Node.js)

Create a file `scripts/migrateAnswersToSQL.js`:

```javascript
const fs = require("fs");
const path = require("path");

// Import your answers
const {
  answersByTopicAndCategory,
} = require("../src/components/data/answers/index");

function escapeString(str) {
  if (!str) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

function convertToJsonb(answer) {
  // Convert answer to array if it isn't already
  const variants = Array.isArray(answer) ? answer : [answer];

  // Add common variations automatically
  const expanded = new Set(variants);
  variants.forEach((variant) => {
    // Add version without spaces
    expanded.add(variant.replace(/\s+/g, ""));
    // Add version with spaces around operators
    expanded.add(variant.replace(/([+\-*/=])/g, " $1 "));
  });

  return `'${JSON.stringify([...expanded])}'::jsonb`;
}

function generateSQL() {
  let sql = `-- Auto-generated SQL migration
-- Date: ${new Date().toISOString()}
-- Source: src/components/data/answers/

`;

  Object.entries(answersByTopicAndCategory).forEach(([topicId, categories]) => {
    sql += `\n-- ========================================\n`;
    sql += `-- TOPIC ${topicId}\n`;
    sql += `-- ========================================\n\n`;

    Object.entries(categories).forEach(([categoryId, answers]) => {
      if (!Array.isArray(answers)) return;

      sql += `-- Topic ${topicId}, Category ${categoryId}\n`;
      sql += `INSERT INTO tugonsense_answer_steps \n`;
      sql += `  (topic_id, category_id, question_id, step_order, label, answer_variants, placeholder)\n`;
      sql += `VALUES\n`;

      const values = [];

      answers.forEach((answer) => {
        const questionId = answer.questionId;

        answer.steps.forEach((step, index) => {
          const stepOrder = index + 1;
          const label = escapeString(step.label);
          const answerVariants = convertToJsonb(step.answer);
          const placeholder = escapeString(step.placeholder);

          values.push(
            `  (${topicId}, ${categoryId}, ${questionId}, ${stepOrder}, ${label}, ${answerVariants}, ${placeholder})`
          );
        });
      });

      sql += values.join(",\n");
      sql += `\nON CONFLICT (topic_id, category_id, question_id, step_order)\n`;
      sql += `DO UPDATE SET\n`;
      sql += `  label = EXCLUDED.label,\n`;
      sql += `  answer_variants = EXCLUDED.answer_variants,\n`;
      sql += `  placeholder = EXCLUDED.placeholder,\n`;
      sql += `  updated_at = NOW();\n\n`;
    });
  });

  // Write to file
  const outputPath = path.join(
    __dirname,
    "../supabase/migrations/migrate_answers.sql"
  );
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ SQL migration generated: ${outputPath}`);
  console.log(`📊 Total lines: ${sql.split("\n").length}`);
}

generateSQL();
```

### Run the Script:

```bash
node scripts/migrateAnswersToSQL.js
```

This generates `supabase/migrations/migrate_answers.sql` with all your answers converted!

---

## 🎯 Manual Conversion Example

### Source: `topic2/category1.ts`

```typescript
export const Topic2_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "f(x) = 2x + 3, find f(5)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(5) = 2(5) + 3" },
      { label: "simplification", answer: "f(5) = 10 + 3" },
      { label: "final", answer: "f(5) = 13" },
    ],
  },
  {
    questionId: 2,
    questionText: "f(x) = x^2, find f(3)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(3) = (3)^2" },
      { label: "final", answer: "f(3) = 9" },
    ],
  },
];
```

### Converted SQL:

```sql
-- Topic 2, Category 1
INSERT INTO tugonsense_answer_steps
  (topic_id, category_id, question_id, step_order, label, answer_variants, placeholder)
VALUES
  -- Question 1: f(x) = 2x + 3, find f(5)
  (2, 1, 1, 1, 'substitution',
   '["f(5) = 2(5) + 3", "f(5)=2(5)+3", "f(5) = 2 * 5 + 3"]'::jsonb,
   NULL),
  (2, 1, 1, 2, 'simplification',
   '["f(5) = 10 + 3", "f(5)=10+3", "10 + 3"]'::jsonb,
   NULL),
  (2, 1, 1, 3, 'final',
   '["f(5) = 13", "f(5)=13", "13"]'::jsonb,
   NULL),

  -- Question 2: f(x) = x^2, find f(3)
  (2, 1, 2, 1, 'substitution',
   '["f(3) = (3)^2", "f(3)=(3)^2", "f(3) = 3^2"]'::jsonb,
   NULL),
  (2, 1, 2, 2, 'final',
   '["f(3) = 9", "f(3)=9", "9"]'::jsonb,
   NULL)

ON CONFLICT (topic_id, category_id, question_id, step_order)
DO UPDATE SET
  label = EXCLUDED.label,
  answer_variants = EXCLUDED.answer_variants,
  placeholder = EXCLUDED.placeholder,
  updated_at = NOW();
```

---

## 💡 Tips for Adding Answer Variants

### Common Variations to Include:

1. **Spacing variations:**

   ```json
   ["f(5) = 13", "f(5)=13", "f(5) =13", "f(5)= 13"]
   ```

2. **Operator variations:**

   ```json
   ["2 × 5", "2 * 5", "2(5)", "2·5"]
   ```

3. **Parentheses variations:**

   ```json
   ["f(5) = 2(5) + 3", "f(5) = 2*(5) + 3", "f(5) = 2 × (5) + 3"]
   ```

4. **Order variations (if commutative):**

   ```json
   ["3 + 2x", "2x + 3"]
   ```

5. **Final answer formats:**
   ```json
   ["13", "f(5) = 13", "f(5)=13", "The answer is 13"]
   ```

### Example with Many Variants:

```sql
INSERT INTO tugonsense_answer_steps (...)
VALUES
  (2, 1, 1, 1, 'substitution',
   '[
     "f(5) = 2(5) + 3",
     "f(5)=2(5)+3",
     "f(5) = 2 × 5 + 3",
     "f(5) = 2 * 5 + 3",
     "f(5) = (2)(5) + 3",
     "f(5) = 2·5 + 3"
   ]'::jsonb,
   'Substitute x = 5');
```

---

## 🔍 Verification Queries

### Check Migration Progress

```sql
-- Count migrated questions per topic/category
SELECT
  topic_id,
  category_id,
  COUNT(DISTINCT question_id) as questions_migrated,
  SUM(CASE WHEN step_order = 1 THEN 1 ELSE 0 END) as questions_with_steps
FROM tugonsense_answer_steps
GROUP BY topic_id, category_id
ORDER BY topic_id, category_id;

-- View specific question's steps
SELECT
  step_order,
  label,
  answer_variants,
  jsonb_array_length(answer_variants) as variant_count
FROM tugonsense_answer_steps
WHERE topic_id = 2 AND category_id = 1 AND question_id = 1
ORDER BY step_order;

-- Find questions with only one answer variant (might need more)
SELECT
  topic_id,
  category_id,
  question_id,
  step_order,
  label,
  answer_variants
FROM tugonsense_answer_steps
WHERE jsonb_array_length(answer_variants) = 1
ORDER BY topic_id, category_id, question_id, step_order;
```

---

## 📋 Migration Checklist

### Pre-Migration

- [ ] Backup existing `answers/` folder
- [ ] Create `tugonsense_answer_steps` table in Supabase
- [ ] Test one question manually first

### Migration Process

- [ ] Run conversion script OR manually convert
- [ ] Review generated SQL
- [ ] Execute SQL in Supabase SQL Editor
- [ ] Verify with count queries

### Testing

- [ ] Load question in UI - check console logs
- [ ] Test answer validation with various formats
- [ ] Verify all steps validate correctly
- [ ] Test with spaces/no spaces
- [ ] Test with different operator formats

### Post-Migration

- [ ] Update AnswerWizard to use Supabase (already done!)
- [ ] Test all question types
- [ ] Monitor for validation issues
- [ ] Gradually remove hardcoded files (optional)

---

## 🎯 Migration Priority

### Phase 1: Test Questions (Week 1)

- [ ] Topic 2, Category 1, Questions 1-3
- [ ] Verify validation works
- [ ] Fix any issues

### Phase 2: Full Topic (Week 2)

- [ ] All Topic 2 questions
- [ ] Test all categories
- [ ] Document any edge cases

### Phase 3: All Topics (Week 3-4)

- [ ] Topics 1, 3, 4, 5
- [ ] Bulk conversion
- [ ] Final testing

### Phase 4: Cleanup (Week 5)

- [ ] Remove hardcoded files
- [ ] Update documentation
- [ ] Deploy to production

---

## 🚨 Common Issues

### Issue: JSONB syntax error

```
ERROR: invalid input syntax for type json
```

**Solution:** Ensure you're using single quotes for the JSON string and `::jsonb` cast

```sql
-- ❌ Wrong
answer_variants: ["value1", "value2"]

-- ✅ Correct
'["value1", "value2"]'::jsonb
```

### Issue: Duplicate key error

```
ERROR: duplicate key value violates unique constraint
```

**Solution:** Use `ON CONFLICT DO UPDATE` clause (included in script above)

### Issue: Validation still fails

**Solution:**

- Check answer sanitization in validator
- Add more variants to cover all input formats
- Check console logs for actual vs expected values

---

## 📊 Example: Complete Topic Migration

```sql
-- ========================================
-- TOPIC 2: Evaluating Functions
-- ========================================

-- Category 1: Direct Substitution
INSERT INTO tugonsense_answer_steps
  (topic_id, category_id, question_id, step_order, label, answer_variants, placeholder)
VALUES
  -- Q1: f(x) = 2x + 3, find f(5)
  (2, 1, 1, 1, 'substitution', '["f(5) = 2(5) + 3", "f(5)=2(5)+3"]'::jsonb, 'Substitute x = 5'),
  (2, 1, 1, 2, 'simplification', '["f(5) = 10 + 3", "f(5)=10+3"]'::jsonb, 'Simplify'),
  (2, 1, 1, 3, 'final', '["13", "f(5) = 13", "f(5)=13"]'::jsonb, 'Final answer'),

  -- Q2: f(x) = x^2, find f(3)
  (2, 1, 2, 1, 'substitution', '["f(3) = (3)^2", "f(3)=(3)^2", "f(3) = 3^2"]'::jsonb, NULL),
  (2, 1, 2, 2, 'final', '["9", "f(3) = 9", "f(3)=9"]'::jsonb, NULL),

  -- Q3: f(x) = 3x - 5, find f(4)
  (2, 1, 3, 1, 'substitution', '["f(4) = 3(4) - 5", "f(4)=3(4)-5"]'::jsonb, NULL),
  (2, 1, 3, 2, 'simplification', '["f(4) = 12 - 5", "f(4)=12-5"]'::jsonb, NULL),
  (2, 1, 3, 3, 'final', '["7", "f(4) = 7", "f(4)=7"]'::jsonb, NULL)

ON CONFLICT (topic_id, category_id, question_id, step_order)
DO UPDATE SET
  label = EXCLUDED.label,
  answer_variants = EXCLUDED.answer_variants,
  placeholder = EXCLUDED.placeholder,
  updated_at = NOW();

-- Category 2: ... (continue for other categories)
```

---

## 🎉 Success Criteria

✅ All questions have answer steps in database  
✅ Validation works with multiple answer formats  
✅ Console shows "✅ Loaded answer steps from Supabase"  
✅ Fallback to hardcoded answers works (hybrid mode)  
✅ No errors in production testing

---

## 📚 Resources

- Main Integration Guide: `INTEGRATION_SUPABASE_ANSWER_STEPS.md`
- Database Schema: `supabase/migrations/create_answer_steps_table.sql`
- Service Functions: `src/lib/supabaseAnswers.ts`
- Updated Component: `src/components/tugon/input-system/AnswerWizard.tsx`

Happy Migrating! 🚀
