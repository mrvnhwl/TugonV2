# Quick Reference: QuestionTemplate Supabase Integration

## What Changed?

**QuestionTemplate.tsx** now fetches questions from Supabase database instead of local JSON files.

## Quick Test

```typescript
// Use in any component
<QuestionTemplate
  topicId={1}
  categoryId={1}
  questionId={1}
  onValidationResult={(type, step) => console.log(type, step)}
  onSubmit={(steps) => console.log(steps)}
  onIndexChange={(index) => console.log(index)}
/>
```

## Database Query Used

```typescript
supabase
  .from("tugonsense_questions")
  .select("*")
  .eq("topic_id", topicId)
  .eq("category_id", categoryId)
  .eq("question_id", questionId)
  .single();
```

## Question Types Supported

| Database Value    | Component Rendered     | Status         |
| ----------------- | ---------------------- | -------------- |
| `step-by-step`    | `AnswerWizard`         | ✅ Working     |
| `fill-in-blanks`  | `FillInBlanksTemplate` | ✅ Working     |
| `multiple-choice` | Placeholder            | ⏳ Coming Soon |
| `true-false`      | Placeholder            | ⏳ Coming Soon |

## Important Notes

⚠️ **Enum Mismatch**: Database uses `fill-in-blank` but TypeScript expects `fill-in-blanks`

⚠️ **Database Migration Needed**: Update enum from old values (`EVALUATION`, `SIMPLIFICATION`, `GENERAL`) to new values

## Loading States

- **Loading**: Shows animated skeleton
- **Error**: Shows red error message
- **Not Found**: Shows warning message
- **Success**: Renders appropriate question template

## Troubleshooting

### Question Not Loading?

1. Check Supabase connection (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
2. Verify question exists in database with correct IDs
3. Check browser console for errors

### Wrong Template Rendering?

1. Check `question_type` value in database
2. Ensure enum value matches one of the supported types
3. Update database if using old enum values

### Type Errors?

1. Make sure `question_type` in database matches TypeScript type
2. Update `GivenQuestion` interface if needed
3. Cast database value if necessary: `data.question_type as GivenQuestion["question_type"]`

## Files Modified

- ✅ `src/components/tugon/template/QuestionTemplate.tsx` - Updated to use Supabase
- 📄 `INTEGRATION_QUESTION_TEMPLATE_SUPABASE.md` - Full documentation
- 📄 `QUICKREF_QUESTION_TEMPLATE_SUPABASE.md` - This file
