import type { CategoryHints } from '../types';

export const Topic1_Category3_Hints: CategoryHints = {
  categoryId: 3,
  categoryName: "Operations on Functions",
  questions: [
    // Question 1: If f(x) = 3x - 4 and g(x) = x + 5, what is (f + g)(x)?
    {
      questionId: 1,
      questionText: "If f(x) = 3x - 4 and g(x) = x + 5, what is (f + g)(x)?",
      generalTips: [
        "Addition of functions: (f + g)(x) = f(x) + g(x)",
        "Substitute both functions and add them together",
        "Combine like terms: group x terms and constant terms"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: "💡 Write both functions in parentheses: (f + g)(x) = (3x - 4) + (x + 5)",
          signErrorHint: "⚠️ Keep the signs: (3x - 4) + (x + 5), don't change minus to plus",
          magnitudeErrorHint: "📏 Make sure you have both functions: f(x) = 3x - 4 and g(x) = x + 5",
          closeAttemptHint: "🎯 Almost! Write: (f + g)(x) = (3x - 4) + (x + 5)",
          repetitionHint: "🔁 Substitute both: (f + g)(x) = (3x - 4) + (x + 5)",
          guessingHint: "🎲 Add the functions: (f + g)(x) = f(x) + g(x) = (3x - 4) + (x + 5)",
          commonMistakes: [
            "Forgetting parentheses around each function",
            "Changing -4 to +4",
            "Mixing up f(x) and g(x)"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Group like terms: (f + g)(x) = (3x + x) + (-4 + 5)",
          signErrorHint: "⚠️ Careful with signs: -4 + 5 = +1, not -9",
          magnitudeErrorHint: "📏 Group x terms: 3x + x = 4x. Constants: -4 + 5 = 1",
          closeAttemptHint: "🎯 Almost! Combine: (3x + x) + (-4 + 5)",
          repetitionHint: "🔁 Group x terms together and constants together",
          guessingHint: "🎲 Add like terms: 3x + x = 4x, and -4 + 5 = 1",
          commonMistakes: [
            "Getting 2x instead of 4x",
            "Getting -9 instead of 1 (wrong sign)",
            "Not grouping like terms"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Simplify: (f + g)(x) = 4x + 1",
          signErrorHint: "⚠️ Final answer is 4x + 1 (positive 1, not negative)",
          magnitudeErrorHint: "📏 Verify: 3x + x = 4x, -4 + 5 = 1",
          closeAttemptHint: "🎯 Almost! Write: (f + g)(x) = 4x + 1",
          repetitionHint: "🔁 Final format: (f + g)(x) = 4x + 1",
          guessingHint: "🎲 Combine: 4x + 1",
          commonMistakes: [
            "Writing 4x - 1 instead of 4x + 1",
            "Forgetting to include (f + g)(x) =",
            "Getting wrong coefficient for x"
          ]
        }
      ]
    },

    // Question 2: If f(x) = 5x + 2 and g(x) = 2x - 9, what is (f - g)(x)?
    {
      questionId: 2,
      questionText: "If f(x) = 5x + 2 and g(x) = 2x - 9, what is (f - g)(x)?",
      generalTips: [
        "Subtraction of functions: (f - g)(x) = f(x) - g(x)",
        "Be careful with signs when subtracting",
        "Distribute the negative sign to all terms in g(x)"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: "💡 Write: (f - g)(x) = (5x + 2) - (2x - 9)",
          signErrorHint: "⚠️ Keep the signs correct: (5x + 2) - (2x - 9)",
          magnitudeErrorHint: "📏 Make sure you have both functions with correct signs",
          closeAttemptHint: "🎯 Almost! Write: (f - g)(x) = (5x + 2) - (2x - 9)",
          repetitionHint: "🔁 Subtract g(x) from f(x): (5x + 2) - (2x - 9)",
          guessingHint: "🎲 Set up subtraction: (f - g)(x) = f(x) - g(x)",
          commonMistakes: [
            "Forgetting parentheses around g(x)",
            "Not distributing the negative",
            "Writing + instead of -"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Distribute negative: (f - g)(x) = (5x + 2) + (-2x + 9)",
          signErrorHint: "⚠️ IMPORTANT: -(2x - 9) = -2x + 9 (both signs change!)",
          magnitudeErrorHint: "📏 When subtracting, change both signs in g(x): 2x becomes -2x, -9 becomes +9",
          closeAttemptHint: "🎯 Almost! Distribute the negative: (5x + 2) + (-2x + 9)",
          repetitionHint: "🔁 Change signs: -(2x - 9) = -2x + 9",
          guessingHint: "🎲 Distribute negative sign: (5x + 2) - 2x + 9",
          commonMistakes: [
            "Keeping 2x - 9 instead of -2x + 9",
            "Only changing one sign",
            "Getting confused with subtraction"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Group like terms: (f - g)(x) = (5x - 2x) + (2 + 9)",
          signErrorHint: "⚠️ Careful: 5x - 2x = 3x, and 2 + 9 = 11",
          magnitudeErrorHint: "📏 Subtract x terms: 5x - 2x = 3x. Add constants: 2 + 9 = 11",
          closeAttemptHint: "🎯 Good! Combine: (5x - 2x) + (2 + 9)",
          repetitionHint: "🔁 Group: x terms together, constants together",
          guessingHint: "🎲 Combine: 5x - 2x = 3x, 2 + 9 = 11",
          commonMistakes: [
            "Getting 7x instead of 3x",
            "Getting -7 instead of 11",
            "Not grouping properly"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Simplify: (f - g)(x) = 3x + 11",
          signErrorHint: "⚠️ Final answer is 3x + 11 (both positive)",
          magnitudeErrorHint: "📏 Verify: 5x - 2x = 3x, 2 + 9 = 11",
          closeAttemptHint: "🎯 Almost! Write: (f - g)(x) = 3x + 11",
          repetitionHint: "🔁 Final format: (f - g)(x) = 3x + 11",
          guessingHint: "🎲 Result: 3x + 11",
          commonMistakes: [
            "Getting wrong signs",
            "Writing 3x - 11",
            "Forgetting to include (f - g)(x) ="
          ]
        }
      ]
    },

    // Question 3: If f(x) = x² and g(x) = 4x - 3, find (f * g)(-2)
    {
      questionId: 3,
      questionText: "If f(x) = x² and g(x) = 4x - 3, find (f * g)(-2)",
      generalTips: [
        "Multiplication of functions: (f * g)(x) = f(x) · g(x)",
        "First multiply the functions together",
        "Then substitute the value of x",
        "Remember to distribute carefully"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: "💡 Multiply the functions: (f * g)(x) = (x^2)(4x - 3)",
          signErrorHint: "⚠️ Keep the signs: (x^2)(4x - 3), the minus stays",
          magnitudeErrorHint: "📏 Multiply both functions: x² times (4x - 3)",
          closeAttemptHint: "🎯 Almost! Write: (f * g)(x) = (x^2)(4x - 3)",
          repetitionHint: "🔁 Set up multiplication: (x^2)(4x - 3)",
          guessingHint: "🎲 Multiply: (f * g)(x) = f(x) · g(x) = (x^2)(4x - 3)",
          commonMistakes: [
            "Forgetting parentheses",
            "Adding instead of multiplying",
            "Changing the sign in g(x)"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Distribute x²: (f * g)(x) = 4x^3 - 3x^2",
          signErrorHint: "⚠️ Keep negative: x² · 4x = 4x³, x² · (-3) = -3x²",
          magnitudeErrorHint: "📏 Distribute: x² · 4x = 4x³, x² · (-3) = -3x²",
          closeAttemptHint: "🎯 Good! Distribute: (f * g)(x) = 4x^3 - 3x^2",
          repetitionHint: "🔁 Multiply each term: x² · 4x and x² · (-3)",
          guessingHint: "🎲 Expand: 4x³ - 3x²",
          commonMistakes: [
            "Getting 4x² instead of 4x³",
            "Forgetting the negative sign",
            "Not distributing to all terms"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Substitute x = -2: (f * g)(-2) = 4(-2)^3 - 3(-2)^2",
          signErrorHint: "⚠️ Careful with negatives: (-2)³ = -8, (-2)² = 4",
          magnitudeErrorHint: "📏 Replace x with -2: 4(-2)³ - 3(-2)²",
          closeAttemptHint: "🎯 Almost! Write: (f * g)(-2) = 4(-2)^3 - 3(-2)^2",
          repetitionHint: "🔁 Substitute -2 for x in 4x³ - 3x²",
          guessingHint: "🎲 Replace x with -2",
          commonMistakes: [
            "Forgetting parentheses around -2",
            "Getting signs wrong in exponents"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Calculate exponents: (f * g)(-2) = 4(-8) - 3(4)",
          signErrorHint: "⚠️ (-2)³ = -8 (negative), (-2)² = 4 (positive)",
          magnitudeErrorHint: "📏 Evaluate: (-2)³ = -8, (-2)² = 4",
          closeAttemptHint: "🎯 Good! (-2)³ = -8, (-2)² = 4, so: 4(-8) - 3(4)",
          repetitionHint: "🔁 Calculate: 4 · (-8) and 3 · 4",
          guessingHint: "🎲 Compute exponents first",
          commonMistakes: [
            "Getting (-2)³ = 8 instead of -8",
            "Getting (-2)² = -4 instead of 4"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Multiply: (f * g)(-2) = -32 - 12",
          signErrorHint: "⚠️ Keep signs: 4 · (-8) = -32, 3 · 4 = 12",
          magnitudeErrorHint: "📏 Calculate: 4 · (-8) = -32, 3 · 4 = 12",
          closeAttemptHint: "🎯 Almost! 4(-8) = -32, 3(4) = 12, so: -32 - 12",
          repetitionHint: "🔁 Multiply: -32 and -12",
          guessingHint: "🎲 Complete multiplication",
          commonMistakes: [
            "Getting signs wrong",
            "Adding instead of subtracting"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Add: -32 - 12 = -44. Write: (f * g)(-2) = -44",
          signErrorHint: "⚠️ -32 - 12 = -44 (both negative, so very negative)",
          magnitudeErrorHint: "📏 Verify: -32 - 12 = -44",
          closeAttemptHint: "🎯 Almost! -32 - 12 = -44",
          repetitionHint: "🔁 Final format: (f * g)(-2) = -44",
          guessingHint: "🎲 Combine: -32 - 12 = -44",
          commonMistakes: [
            "Getting -20 (wrong calculation)",
            "Getting positive 44",
            "Writing just -44 without (f * g)(-2) ="
          ]
        }
      ]
    },

    // Question 4: Let f(x) = 2x + 1 and g(x) = x - 3. Find (f / g)(2)
    {
      questionId: 4,
      questionText: "Let f(x) = 2x + 1 and g(x) = x - 3. Find (f / g)(2)",
      generalTips: [
        "Division of functions: (f / g)(x) = f(x) / g(x)",
        "Write as a fraction first",
        "Then substitute the value",
        "Make sure g(x) ≠ 0"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: "💡 Write as fraction: (f / g)(x) = (2x + 1)/(x - 3)",
          signErrorHint: "⚠️ Numerator: 2x + 1, Denominator: x - 3 (mind the signs)",
          magnitudeErrorHint: "📏 Set up fraction correctly: (2x + 1) over (x - 3)",
          closeAttemptHint: "🎯 Almost! Write: (f / g)(x) = (2x + 1)/(x - 3)",
          repetitionHint: "🔁 Write as quotient: (2x + 1) ÷ (x - 3)",
          guessingHint: "🎲 Divide: f(x) over g(x)",
          commonMistakes: [
            "Flipping numerator and denominator",
            "Changing signs incorrectly",
            "Not using parentheses"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Substitute x = 2: (f / g)(2) = (2(2) + 1)/(2 - 3)",
          signErrorHint: "⚠️ Keep signs: 2 - 3 = -1 (negative)",
          magnitudeErrorHint: "📏 Replace x with 2 in both parts",
          closeAttemptHint: "🎯 Almost! Write: (f / g)(2) = (2(2) + 1)/(2 - 3)",
          repetitionHint: "🔁 Substitute 2 for x everywhere",
          guessingHint: "🎲 Replace x with 2 in the fraction",
          commonMistakes: [
            "Forgetting parentheses around 2",
            "Not substituting in both numerator and denominator"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Evaluate: (f / g)(2) = (4 + 1)/(2 - 3)",
          signErrorHint: "⚠️ Numerator: 2(2) + 1 = 5, Denominator: 2 - 3 = -1",
          magnitudeErrorHint: "📏 Calculate: 2 · 2 = 4, then 4 + 1 = 5",
          closeAttemptHint: "🎯 Good! Numerator = 5, Denominator = -1",
          repetitionHint: "🔁 Simplify numerator and denominator separately",
          guessingHint: "🎲 Calculate both parts",
          commonMistakes: [
            "Getting wrong numerator",
            "Getting 1 instead of -1 for denominator"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Simplify: (f / g)(2) = 5/(-1)",
          signErrorHint: "⚠️ 5 divided by -1 is negative",
          magnitudeErrorHint: "📏 5/(-1) = -5",
          closeAttemptHint: "🎯 Almost! 5 ÷ (-1) = -5",
          repetitionHint: "🔁 Divide: 5 / (-1)",
          guessingHint: "🎲 Complete division",
          commonMistakes: [
            "Getting positive 5",
            "Not simplifying"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Final answer: (f / g)(2) = -5",
          signErrorHint: "⚠️ Answer is -5 (negative 5)",
          magnitudeErrorHint: "📏 Verify: 5 / (-1) = -5",
          closeAttemptHint: "🎯 Almost! Write: (f / g)(2) = -5",
          repetitionHint: "🔁 Final format: (f / g)(2) = -5",
          guessingHint: "🎲 Result: -5",
          commonMistakes: [
            "Writing just -5 without (f / g)(2) =",
            "Getting positive 5",
            "Not simplifying the fraction"
          ]
        }
      ]
    }
  ]
};
