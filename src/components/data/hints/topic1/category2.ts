import type { CategoryHints } from '../types';

export const Topic1_Category2_Hints: CategoryHints = {
  categoryId: 2,
  categoryName: "Piecewise Functions",
  questions: [
    // Question 1: Let f(x) = { x + 2 (x < 0) | x² (0 ≤ x ≤ 3) | 5 (x > 3) }. Find f(-3)
    {
      questionId: 1,
      questionText: "Let f(x) = {  x + 2,  x < 0   |   x²,  0 ≤ x ≤ 3   |   5,  x > 3  }.  Find f(-3).",
      generalTips: [
        "First, determine which piece applies: is -3 < 0, 0 ≤ -3 ≤ 3, or -3 > 3?",
        "Since -3 < 0, use the first piece: f(x) = x + 2",
        "Then substitute -3 into that piece"
      ],
      stepHints: [
        {
          stepLabel: "choose",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - determine which piece applies for -3!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - remember -3 is negative!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - compare -3 to each condition!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - which piece fits -3?",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - check conditions systematically!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} step by step - is -3 < 0?",
          commonMistakes: [
            "Choosing f(x) = x² (that's for 0 ≤ x ≤ 3)",
            "Choosing f(x) = 5 (that's for x > 3)",
            "Forgetting to check which condition -3 satisfies"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute -3 into the chosen piece!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep that negative sign!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - replace x with -3 exactly!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write f(-3) = -3 + 2!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - be careful with signs!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - substitute step by step!",
          commonMistakes: [
            "Writing f(-3) = 3 + 2 (forgetting the negative)",
            "Writing f(-3) = -3 - 2 (changing + to -)",
            "Using the wrong piece of the function"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - calculate -3 + 2 carefully!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - the result should be negative!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - verify your arithmetic!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - -3 + 2 = -1!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your calculation!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} step by step - add carefully!",
          commonMistakes: [
            "Getting 1 instead of -1",
            "Getting -5 (-3 - 2)",
            "Writing just -1 without f(-3) ="
          ]
        }
      ]
    },

    // Question 2: Let g(x) = { -x (x < 1) | x + 1 (1 ≤ x < 5) | 2x - 8 (x ≥ 5) }. Find g(5)
    {
      questionId: 2,
      questionText: "Let g(x) = {  -x,  x < 1   |   x + 1,  1 ≤ x < 5   |   2x - 8,  x ≥ 5  }.  Find g(5).",
      generalTips: [
        "Check which condition 5 satisfies",
        "Is 5 < 1? No. Is 1 ≤ 5 < 5? No. Is 5 ≥ 5? Yes!",
        "Use the third piece: g(x) = 2x - 8"
      ],
      stepHints: [
        {
          stepLabel: "choose",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - which condition does 5 satisfy?",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - check if 5 ≥ 5!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - compare 5 to each condition!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - use the third piece!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - test each condition!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - is 5 ≥ 5?",
          commonMistakes: [
            "Choosing g(x) = x + 1 (that's for 1 ≤ x < 5, not including 5)",
            "Choosing g(x) = -x (that's for x < 1)",
            "Confusing < with ≤"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute 5 into the chosen piece!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep that minus sign!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - use parentheses around 5!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write g(5) = 2(5) - 8!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - substitute carefully!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} step by step - replace x with 5!",
          commonMistakes: [
            "Forgetting parentheses around 5",
            "Writing g(5) = 2*5 - 8 (missing parentheses)",
            "Changing the minus to plus"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - multiply 2 × 5 first!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep the minus sign!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 2 × 5 = 10!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write g(5) = 10 - 8!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - multiply first!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - calculate step by step!",
          commonMistakes: [
            "Getting 7 or 12 instead of 10",
            "Writing 10 + 8 instead of 10 - 8"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - subtract 10 - 8!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - result should be positive!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 10 - 8 = 2!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final answer is 2!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your subtraction!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} step by step - subtract carefully!",
          commonMistakes: [
            "Getting 18 (adding instead)",
            "Getting -2 (wrong order)",
            "Writing just 2 without g(5) ="
          ]
        }
      ]
    },

    // Question 3: Let h(x) = { x² - 1 (x ≤ 0) | 2x + 1 (0 < x < 2) | 6 (x ≥ 2) }. Find h(0)
    {
      questionId: 3,
      questionText: "Let h(x) = {  x² - 1,  x ≤ 0   |   2x + 1,  0 < x < 2   |   6,  x ≥ 2  }.  Find h(0).",
      generalTips: [
        "Check which condition 0 satisfies",
        "Is 0 ≤ 0? Yes! Use the first piece: h(x) = x² - 1",
        "Be careful with boundary values (where conditions use ≤ or <)"
      ],
      stepHints: [
        {
          stepLabel: "choose",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - which condition does 0 satisfy?",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - is 0 ≤ 0 true?",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - check each condition for 0!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - use the first piece!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - boundary values matter!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - 0 ≤ 0 is true!",
          commonMistakes: [
            "Choosing h(x) = 2x + 1 (that's for 0 < x, not including 0)",
            "Choosing h(x) = 6 (that's for x ≥ 2)",
            "Confusing ≤ with <"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute 0 into the chosen piece!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep that minus sign!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - use parentheses around 0!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write h(0) = (0)² - 1!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - substitute carefully!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} step by step - replace x with 0!",
          commonMistakes: [
            "Forgetting parentheses around 0",
            "Writing h(0) = 0^2 - 1 without parentheses",
            "Changing minus to plus"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - calculate (0)² first!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep the minus sign!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 0² = 0!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write h(0) = 0 - 1!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - square first!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - evaluate step by step!",
          commonMistakes: [
            "Thinking 0^2 = 1",
            "Writing 0 + 1 instead of 0 - 1"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "{T1C2}: Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - subtract 0 - 1!",
          signErrorHint: "{T1C2}: I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - result should be negative!",
          magnitudeErrorHint: "{T1C2}: Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 0 - 1 = -1!",
          closeAttemptHint: "{T1C2}: So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final answer is -1!",
          repetitionHint: "{T1C2}: I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your subtraction!",
          guessingHint: "{T1C2}: Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} step by step - subtract carefully!",
          commonMistakes: [
            "Getting 1 instead of -1",
            "Writing just -1 without h(0) ="
          ]
        }
      ]
    }
  ]
};
