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
          genericHint: "💡 Check which condition -3 satisfies. Since -3 < 0, choose: f(x) = x + 2",
          signErrorHint: "⚠️ Remember: -3 is negative, so it's less than 0. Use f(x) = x + 2",
          magnitudeErrorHint: "📏 Compare -3 to the conditions: -3 < 0 ✓, so use the first piece",
          closeAttemptHint: "🎯 Almost! Since -3 < 0, the correct piece is: f(x) = x + 2",
          repetitionHint: "🔁 Look at the conditions: -3 < 0, so write: f(x) = x + 2",
          guessingHint: "🎲 Check each piece: Is -3 < 0? Yes! So use f(x) = x + 2",
          commonMistakes: [
            "Choosing f(x) = x² (that's for 0 ≤ x ≤ 3)",
            "Choosing f(x) = 5 (that's for x > 3)",
            "Forgetting to check which condition -3 satisfies"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Substitute -3 into f(x) = x + 2. Write: f(-3) = -3 + 2",
          signErrorHint: "⚠️ Make sure you have -3 + 2, not 3 + 2 or -3 - 2",
          magnitudeErrorHint: "📏 Replace x with -3 exactly: f(-3) = -3 + 2",
          closeAttemptHint: "🎯 Almost there! Write: f(-3) = -3 + 2",
          repetitionHint: "🔁 Substitute -3 for x: f(-3) = -3 + 2 (keep the negative sign)",
          guessingHint: "🎲 Replace x with -3 in the expression x + 2",
          commonMistakes: [
            "Writing f(-3) = 3 + 2 (forgetting the negative)",
            "Writing f(-3) = -3 - 2 (changing + to -)",
            "Using the wrong piece of the function"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Calculate: -3 + 2 = -1. Write: f(-3) = -1",
          signErrorHint: "⚠️ -3 + 2 = -1 (negative 1, not positive 1)",
          magnitudeErrorHint: "📏 Verify: -3 + 2 = -1 (not -5 or 1)",
          closeAttemptHint: "🎯 Almost! -3 + 2 = -1, so write: f(-3) = -1",
          repetitionHint: "🔁 Final answer format: f(-3) = -1",
          guessingHint: "🎲 Add: -3 + 2 = -1",
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
          genericHint: "💡 Since 5 ≥ 5 is true, choose: g(x) = 2x - 8",
          signErrorHint: "⚠️ Check the conditions carefully. 5 ≥ 5, so use g(x) = 2x - 8",
          magnitudeErrorHint: "📏 Compare 5 to the conditions: 5 ≥ 5 ✓, so use the third piece",
          closeAttemptHint: "🎯 Almost! Since 5 ≥ 5, write: g(x) = 2x - 8",
          repetitionHint: "🔁 Check: Is 5 ≥ 5? Yes! So g(x) = 2x - 8",
          guessingHint: "🎲 Test each condition: 5 ≥ 5 is true, so use g(x) = 2x - 8",
          commonMistakes: [
            "Choosing g(x) = x + 1 (that's for 1 ≤ x < 5, not including 5)",
            "Choosing g(x) = -x (that's for x < 1)",
            "Confusing < with ≤"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Substitute 5 into g(x) = 2x - 8. Write: g(5) = 2(5) - 8",
          signErrorHint: "⚠️ Make sure you have 2(5) - 8, with the minus sign",
          magnitudeErrorHint: "📏 Replace x with 5: g(5) = 2(5) - 8",
          closeAttemptHint: "🎯 Almost! Write: g(5) = 2(5) - 8 (with parentheses)",
          repetitionHint: "🔁 Substitute 5 for x: g(5) = 2(5) - 8",
          guessingHint: "🎲 Replace x with 5 in 2x - 8",
          commonMistakes: [
            "Forgetting parentheses around 5",
            "Writing g(5) = 2*5 - 8 (missing parentheses)",
            "Changing the minus to plus"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Multiply: 2 × 5 = 10. Write: g(5) = 10 - 8",
          signErrorHint: "⚠️ Keep the minus: g(5) = 10 - 8, not 10 + 8",
          magnitudeErrorHint: "📏 Check: 2 × 5 = 10 (not 7 or 12)",
          closeAttemptHint: "🎯 Good! 2 × 5 = 10, so write: g(5) = 10 - 8",
          repetitionHint: "🔁 Multiply first: 2(5) = 10, then write: g(5) = 10 - 8",
          guessingHint: "🎲 Calculate 2 × 5 = 10, then subtract 8",
          commonMistakes: [
            "Getting 7 or 12 instead of 10",
            "Writing 10 + 8 instead of 10 - 8"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Subtract: 10 - 8 = 2. Write: g(5) = 2",
          signErrorHint: "⚠️ 10 - 8 = 2 (positive 2)",
          magnitudeErrorHint: "📏 Verify: 10 - 8 = 2 (not 18 or -2)",
          closeAttemptHint: "🎯 Almost! 10 - 8 = 2, so write: g(5) = 2",
          repetitionHint: "🔁 Final format: g(5) = 2 (not just 2)",
          guessingHint: "🎲 Subtract: 10 - 8 = 2",
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
          genericHint: "💡 Since 0 ≤ 0 is true, choose: h(x) = x^2 - 1",
          signErrorHint: "⚠️ Check carefully: 0 ≤ 0, so use h(x) = x^2 - 1",
          magnitudeErrorHint: "📏 0 satisfies x ≤ 0, so use the first piece",
          closeAttemptHint: "🎯 Almost! Since 0 ≤ 0, write: h(x) = x^2 - 1",
          repetitionHint: "🔁 Is 0 ≤ 0? Yes! So h(x) = x^2 - 1",
          guessingHint: "🎲 Check: 0 ≤ 0 is true (equal counts), so use h(x) = x^2 - 1",
          commonMistakes: [
            "Choosing h(x) = 2x + 1 (that's for 0 < x, not including 0)",
            "Choosing h(x) = 6 (that's for x ≥ 2)",
            "Confusing ≤ with <"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Substitute 0 into h(x) = x^2 - 1. Write: h(0) = (0)^2 - 1",
          signErrorHint: "⚠️ Make sure you have (0)^2 - 1, with the minus sign",
          magnitudeErrorHint: "📏 Replace x with 0: h(0) = (0)^2 - 1",
          closeAttemptHint: "🎯 Almost! Write: h(0) = (0)^2 - 1 (with parentheses around 0)",
          repetitionHint: "🔁 Substitute 0 for x: h(0) = (0)^2 - 1",
          guessingHint: "🎲 Replace x with 0 in x^2 - 1",
          commonMistakes: [
            "Forgetting parentheses around 0",
            "Writing h(0) = 0^2 - 1 without parentheses",
            "Changing minus to plus"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Calculate: (0)^2 = 0. Write: h(0) = 0 - 1",
          signErrorHint: "⚠️ Keep the minus: h(0) = 0 - 1, not 0 + 1",
          magnitudeErrorHint: "📏 Any number squared is positive, but 0^2 = 0",
          closeAttemptHint: "🎯 Good! (0)^2 = 0, so write: h(0) = 0 - 1",
          repetitionHint: "🔁 Calculate: 0^2 = 0, then write: h(0) = 0 - 1",
          guessingHint: "🎲 Evaluate: (0)^2 = 0, giving h(0) = 0 - 1",
          commonMistakes: [
            "Thinking 0^2 = 1",
            "Writing 0 + 1 instead of 0 - 1"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Subtract: 0 - 1 = -1. Write: h(0) = -1",
          signErrorHint: "⚠️ 0 - 1 = -1 (negative 1, not positive)",
          magnitudeErrorHint: "📏 Verify: 0 - 1 = -1 (not 1)",
          closeAttemptHint: "🎯 Almost! 0 - 1 = -1, so write: h(0) = -1",
          repetitionHint: "🔁 Final format: h(0) = -1 (not just -1)",
          guessingHint: "🎲 Subtract: 0 - 1 = -1",
          commonMistakes: [
            "Getting 1 instead of -1",
            "Writing just -1 without h(0) ="
          ]
        }
      ]
    }
  ]
};
