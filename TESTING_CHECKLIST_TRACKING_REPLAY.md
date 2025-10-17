# Testing Checklist: Tracking and Stage Replay Fixes

## Issue #1: Cumulative Hint Tracking

### ✅ Color Hints Tracking Test
- [ ] Start a question with multiple steps
- [ ] Get Step 1 wrong → Check console for `🎨 TRACKING: New color hint for step 0`
- [ ] Get Step 1 wrong again → Check colorHintsShown increments
- [ ] Get Step 2 wrong → Check colorHintsShown continues incrementing
- [ ] Complete question
- [ ] Open SuccessModal → Verify `colorCodedHintsUsed` shows cumulative count

**Expected Result**: Each FeedbackOverlay display should increment the counter.

**Example**:
```
Attempt 1 (Step 1 wrong): colorHintsShown = 1
Attempt 2 (Step 1 wrong): colorHintsShown = 2
Attempt 3 (Step 2 wrong): colorHintsShown = 3
SuccessModal shows: 3 color hints ✅
```

### ✅ Short Hints Tracking Test
- [ ] Start a question
- [ ] Get wrong 3 times → Toast appears → Check console for `📊 TRACKING: Context hint shown`
- [ ] Verify shortHintsShown = 1
- [ ] Get wrong 3 more times → Another toast → Verify shortHintsShown = 2
- [ ] Complete question
- [ ] Open SuccessModal → Verify `shortHintMessagesUsed` shows 2

**Expected Result**: Each toast.custom() call should increment the counter.

---

## Issue #2: Stage Replay from Question 1

### ✅ First Completion Test
- [ ] Start a fresh category (never completed before)
- [ ] Complete all questions (e.g., Q1 → Q2 → Q3)
- [ ] After last question → SuccessModal should appear
- [ ] Check localStorage → Verify `successModalShown: true`, `everCompleted: true`

**Expected Result**: Normal flow, SuccessModal appears after completing all questions.

### ✅ Stage Replay Test (Main Fix)
- [ ] Return to TugonSense after completing a category
- [ ] Find the completed category (should show "Review Stage" button)
- [ ] Click "Review Stage"
- [ ] Check console for: `🔄 Category X was completed before - resetting for replay`
- [ ] Verify navigation goes to Question 1 (not a random question)
- [ ] Complete Question 1 → Should move to Question 2 (not show modal)
- [ ] Complete Question 2 → Should move to Question 3 (not show modal)
- [ ] Complete Question 3 (last question) → SuccessModal should appear
- [ ] Check localStorage → Verify `latestAttempt` updated, `fastestAttempt` kept

**Expected Result**: 
- Full replay from Q1 to last question
- SuccessModal only appears after completing ALL questions
- History (fastest attempt) preserved

### ✅ Continue After Modal Shown Test
- [ ] Complete a category → SuccessModal appears
- [ ] Close modal (don't exit to TugonSense)
- [ ] Navigate to next question manually (if possible)
- [ ] Complete that question
- [ ] Should show quick notification, NOT SuccessModal

**Expected Result**: SuccessModal only shows once per completion cycle.

### ✅ Multiple Replays Test
- [ ] Complete category (Attempt 1) → SuccessModal shows
- [ ] Go back to TugonSense
- [ ] Click "Review Stage" → Reset happens
- [ ] Complete all questions (Attempt 2) → SuccessModal shows
- [ ] Check localStorage:
  - [ ] `latestAttempt` should have Attempt 2 data
  - [ ] `fastestAttempt` should show the faster of Attempt 1 or Attempt 2
  - [ ] `everCompleted: true` should be set

**Expected Result**: Can replay indefinitely, history tracks latest and fastest.

---

## Console Output Verification

### Color Hints Tracking
Look for these console messages:
```
🎨 TRACKING: New color hint for step 0 - Total new displays: 1
🎨 TRACKING: Color hints incremented by 1 - New total: 1
🎨 TRACKING: New color hint for step 1 - Total new displays: 1
🎨 TRACKING: Color hints incremented by 1 - New total: 2
```

### Short Hints Tracking
Look for:
```
📊 TRACKING: Context hint shown (toast.custom) - Count: 1
📊 TRACKING: Context hint shown (toast.custom) - Count: 2
```

### Stage Reset
Look for:
```
🔄 Category 1 was completed before - resetting for replay
🔄 Resetting category 1 progress for replay...
  Reset Question 1 (keeping history)
  Reset Question 2 (keeping history)
  Reset Question 3 (keeping history)
✅ Category 1 reset complete - ready for replay from Question 1
```

### SuccessModal Logic
Look for:
```
📊 SuccessModal status: shown before = false
✅ SuccessModal shown marked for Category 1
```

On subsequent completion in same session:
```
📊 SuccessModal status: shown before = true
✨ Category complete but modal already shown - showing quick notification
```

### Replay Detection
Look for:
```
🔄 Starting fresh replay of Category 1 from Question 1
```

---

## Edge Cases to Test

### Edge Case 1: Quick Replay
- [ ] Complete category
- [ ] Immediately click "Review Stage" (within 5 seconds)
- [ ] Verify reset happens properly
- [ ] Verify starts from Question 1

### Edge Case 2: Partial Replay
- [ ] Start replay (after reset)
- [ ] Complete only Q1 and Q2
- [ ] Exit to TugonSense
- [ ] Click "Review Stage" again
- [ ] Should reset again and start from Q1 (not Q3)

### Edge Case 3: Multiple Categories
- [ ] Complete Category 1 → SuccessModal shows
- [ ] Complete Category 2 → SuccessModal shows
- [ ] Replay Category 1 → Should work independently
- [ ] Replay Category 2 → Should work independently

### Edge Case 4: Browser Refresh
- [ ] Complete category halfway through
- [ ] Refresh browser
- [ ] Resume → Should continue where left off
- [ ] Complete remaining questions
- [ ] SuccessModal should appear

---

## localStorage Inspection

After completing and replaying, check localStorage for:

```javascript
{
  "tugon_user_progress": {
    "topicProgress": [{
      "categoryProgress": [{
        "categoryId": 1,
        "isCompleted": true,        // true after completion
        "successModalShown": true,   // true after modal shown
        "everCompleted": true,       // true once completed at least once
        "questionProgress": [{
          "questionId": 1,
          "isCompleted": true,
          "latestAttempt": {          // Most recent completion
            "timestamp": "...",
            "timeSpent": 40,
            "attempts": 6
          },
          "fastestAttempt": {         // Best time ever
            "timestamp": "...",
            "timeSpent": 30,          // Could be from earlier attempt
            "attempts": 4
          }
        }]
      }]
    }]
  }
}
```

After clicking "Review Stage", check:
```javascript
{
  "categoryProgress": [{
    "isCompleted": false,          // ✅ Reset to false
    "successModalShown": false,    // ✅ Reset to false
    "everCompleted": true,         // ✅ Kept as true (history)
    "questionProgress": [{
      "isCompleted": false,        // ✅ Reset to false
      "latestAttempt": { ... },    // ✅ Kept (history)
      "fastestAttempt": { ... }    // ✅ Kept (history)
    }]
  }]
}
```

---

## Success Criteria

### Issue #1: Cumulative Tracking
✅ **Pass if**:
- colorHintsShown increments with each FeedbackOverlay display
- shortHintsShown increments with each toast.custom() call
- SuccessModal displays correct cumulative counts
- Counts reset to 0 when moving to new question

❌ **Fail if**:
- Counts only show maximum simultaneous displays
- Counts don't increment on subsequent displays
- SuccessModal shows 0 or 1 when multiple hints were shown

### Issue #2: Stage Replay
✅ **Pass if**:
- Clicking "Review Stage" resets category and starts from Q1
- Must complete ALL questions before seeing SuccessModal
- History (fastest/latest attempts) preserved after replay
- Can replay indefinitely with proper reset each time

❌ **Fail if**:
- SuccessModal appears after completing just one question
- Doesn't start from Question 1 on replay
- History data lost after replay
- Cannot replay or gets stuck in loop

---

## Automated Test Commands

```bash
# Run dev server
npm run dev

# In browser console, check tracking:
localStorage.getItem('tugon_user_progress')

# Clear progress for fresh test:
localStorage.removeItem('tugon_user_progress')
localStorage.removeItem('tugon_user_id')

# Reload page to reset
location.reload()
```

---

## Sign-Off

**Tester**: ___________________
**Date**: ___________________

**Issue #1 (Tracking)**: ☐ Pass ☐ Fail
**Issue #2 (Replay)**: ☐ Pass ☐ Fail

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
