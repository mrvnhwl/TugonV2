import type { CategoryHints } from '../types';

export const Topic1_Category4_Hints: CategoryHints = {
  categoryId: 4,
  categoryName: "Function Composition",
  questions: [
    // Question 1: If f(x) = x + 4 and g(x) = 3x^2 - 2, find (g ∘ f)(x)
    {
      questionId: 1,
      questionText: "If f(x) = x + 4 and g(x) = 3x^2 - 2, find (g ∘ f)(x)",
      generalTips: [
        "Composition (g ∘ f)(x) means g(f(x))",
        "Start with the inner function f(x) first",
        "Substitute f(x) into g(x) wherever you see x",
        "Then expand and simplify"
      ],
      stepHints: [
        {
          stepLabel: "choose",
          genericHint: "💡 (g ∘ f)(x) = g(f(x)) - substitute f(x) into g(x)",
          signErrorHint: "⚠️ Inner function is f(x) = x + 4, outer is g(x) = 3x² - 2",
          magnitudeErrorHint: "📏 Read as 'g of f of x', start with f(x)",
          closeAttemptHint: "🎯 Almost! (g ∘ f)(x) means g(f(x))",
          repetitionHint: "🔁 Order matters: g ∘ f means g(f(x)), not f(g(x))",
          guessingHint: "🎲 Composition: (g ∘ f)(x) = g(f(x))",
          commonMistakes: [
            "Confusing order (doing f(g(x)) instead)",
            "Multiplying instead of composing",
            "Not understanding the notation"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Replace x in g(x) with (x + 4): g(f(x)) = 3(x + 4)^2 - 2",
          signErrorHint: "⚠️ Substitute the entire f(x): g(x + 4) = 3(x + 4)² - 2",
          magnitudeErrorHint: "📏 In g(x) = 3x² - 2, replace x with (x + 4)",
          closeAttemptHint: "🎯 Good! Write: g(f(x)) = 3(x + 4)² - 2",
          repetitionHint: "🔁 Wherever you see x in g(x), put (x + 4)",
          guessingHint: "🎲 Put f(x) into g: 3(x + 4)² - 2",
          commonMistakes: [
            "Forgetting parentheses around x + 4",
            "Only substituting in one place",
            "Changing the signs"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Expand (x + 4)²: (g ∘ f)(x) = 3(x^2 + 8x + 16) - 2",
          signErrorHint: "⚠️ (x + 4)² = x² + 8x + 16 (use FOIL or formula)",
          magnitudeErrorHint: "📏 Square the binomial: (x + 4)(x + 4) = x² + 8x + 16",
          closeAttemptHint: "🎯 Almost! (x + 4)² = x² + 8x + 16",
          repetitionHint: "🔁 Expand: (x + 4)² = x² + 2(4)(x) + 16",
          guessingHint: "🎲 Use (a + b)² = a² + 2ab + b²",
          commonMistakes: [
            "Getting x² + 16 (forgetting middle term)",
            "Getting x² + 4x + 16 (wrong middle term)",
            "Sign errors in expansion"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Distribute 3: (g ∘ f)(x) = 3x^2 + 24x + 48 - 2",
          signErrorHint: "⚠️ Multiply all terms: 3 · x² = 3x², 3 · 8x = 24x, 3 · 16 = 48",
          magnitudeErrorHint: "📏 Distribute carefully: 3(x² + 8x + 16) = 3x² + 24x + 48",
          closeAttemptHint: "🎯 Good! Now: 3x² + 24x + 48 - 2",
          repetitionHint: "🔁 Multiply each term by 3",
          guessingHint: "🎲 Distribute: 3 · x², 3 · 8x, 3 · 16",
          commonMistakes: [
            "Not distributing to all terms",
            "Getting 8x instead of 24x",
            "Forgetting the -2"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Combine constants: (g ∘ f)(x) = 3x^2 + 12x + 46",
          signErrorHint: "⚠️ Verify: 48 - 2 = 46",
          magnitudeErrorHint: "📏 Add: 48 - 2 = 46",
          closeAttemptHint: "🎯 Almost! 48 - 2 = 46, so: 3x² + 12x + 46",
          repetitionHint: "🔁 Final format: (g ∘ f)(x) = 3x² + 12x + 46",
          guessingHint: "🎲 Simplify constants: 48 - 2 = 46",
          commonMistakes: [
            "Getting wrong constant term",
            "Not simplifying fully",
            "Forgetting to write (g ∘ f)(x) ="
          ]
        }
      ]
    },

    // Question 2: If f(x) = 1/x and g(x) = x + 1, find (f ∘ g)(x)
    {
      questionId: 2,
      questionText: "If f(x) = 1/x and g(x) = x + 1, find (f ∘ g)(x)",
      generalTips: [
        "Composition (f ∘ g)(x) means f(g(x))",
        "Inner function is g(x), outer is f(x)",
        "Substitute g(x) into f(x)",
        "Result will be a rational function"
      ],
      stepHints: [
        {
          stepLabel: "choose",
          genericHint: "💡 (f ∘ g)(x) = f(g(x)) - substitute g(x) into f(x)",
          signErrorHint: "⚠️ Inner function is g(x) = x + 1, outer is f(x) = 1/x",
          magnitudeErrorHint: "📏 Read as 'f of g of x', start with g(x)",
          closeAttemptHint: "🎯 Almost! (f ∘ g)(x) means f(g(x))",
          repetitionHint: "🔁 Order: f ∘ g means f(g(x))",
          guessingHint: "🎲 Composition: (f ∘ g)(x) = f(g(x))",
          commonMistakes: [
            "Confusing order (doing g(f(x)) instead)",
            "Multiplying functions instead",
            "Not understanding notation"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Replace x in f(x) with (x + 1): f(g(x)) = 1/(x + 1)",
          signErrorHint: "⚠️ Substitute entire g(x): f(x + 1) = 1/(x + 1)",
          magnitudeErrorHint: "📏 In f(x) = 1/x, replace x with (x + 1)",
          closeAttemptHint: "🎯 Good! Write: f(g(x)) = 1/(x + 1)",
          repetitionHint: "🔁 Put g(x) into f: 1/(x + 1)",
          guessingHint: "🎲 Replace x with (x + 1) in 1/x",
          commonMistakes: [
            "Forgetting parentheses",
            "Getting 1/x + 1 instead of 1/(x + 1)",
            "Changing signs"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Final answer: (f ∘ g)(x) = 1/(x + 1)",
          signErrorHint: "⚠️ Keep it simple: 1/(x + 1) is already simplified",
          magnitudeErrorHint: "📏 This is in simplest form",
          closeAttemptHint: "🎯 Almost! Write: (f ∘ g)(x) = 1/(x + 1)",
          repetitionHint: "🔁 Final format: (f ∘ g)(x) = 1/(x + 1)",
          guessingHint: "🎲 Already simplified: 1/(x + 1)",
          commonMistakes: [
            "Trying to expand further",
            "Splitting the fraction incorrectly",
            "Not using parentheses in denominator"
          ]
        }
      ]
    },

    // Question 3: Given f(x) = 2x + 3 and g(x) = x^2, evaluate (f ∘ g)(-1)
    {
      questionId: 3,
      questionText: "Given f(x) = 2x + 3 and g(x) = x^2, evaluate (f ∘ g)(-1)",
      generalTips: [
        "Composition (f ∘ g)(-1) means f(g(-1))",
        "Work from inside out: find g(-1) first",
        "Then substitute that result into f(x)",
        "Or compose first, then substitute"
      ],
      stepHints: [
        {
          stepLabel: "choose",
          genericHint: "💡 Method 1: Find g(-1) first, then f(g(-1)). OR Method 2: Find (f ∘ g)(x) first, then substitute",
          signErrorHint: "⚠️ (f ∘ g)(-1) = f(g(-1)) - work from inside out",
          magnitudeErrorHint: "📏 Start with inner function g(-1)",
          closeAttemptHint: "🎯 Almost! Evaluate g(-1) = (-1)² first",
          repetitionHint: "🔁 Inside out: g(-1), then f(result)",
          guessingHint: "🎲 Calculate g(-1) first",
          commonMistakes: [
            "Not working from inside out",
            "Confusing the order",
            "Substituting -1 in wrong place"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Evaluate inner function: g(-1) = (-1)^2",
          signErrorHint: "⚠️ (-1)² = 1 (squaring makes it positive)",
          magnitudeErrorHint: "📏 Calculate: (-1)² = (-1) × (-1) = 1",
          closeAttemptHint: "🎯 Good! g(-1) = (-1)² = 1",
          repetitionHint: "🔁 Square -1: (-1)² = 1",
          guessingHint: "🎲 (-1)² = 1",
          commonMistakes: [
            "Getting -1 instead of 1",
            "Not using parentheses",
            "Confusing with -1²"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Simplify: g(-1) = 1",
          signErrorHint: "⚠️ Result is positive 1",
          magnitudeErrorHint: "📏 (-1)² = 1",
          closeAttemptHint: "🎯 Almost! g(-1) = 1",
          repetitionHint: "🔁 Inner result: 1",
          guessingHint: "🎲 g(-1) = 1",
          commonMistakes: [
            "Wrong sign"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: "💡 Now evaluate f(1): f(g(-1)) = f(1) = 2(1) + 3",
          signErrorHint: "⚠️ Substitute 1 into f(x) = 2x + 3",
          magnitudeErrorHint: "📏 Replace x with 1 in 2x + 3",
          closeAttemptHint: "🎯 Good! f(1) = 2(1) + 3",
          repetitionHint: "🔁 Outer function: f(1) = 2(1) + 3",
          guessingHint: "🎲 Put 1 into f(x)",
          commonMistakes: [
            "Using wrong value",
            "Forgetting to substitute"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Calculate: f(1) = 2 + 3",
          signErrorHint: "⚠️ 2 × 1 = 2",
          magnitudeErrorHint: "📏 Multiply: 2 × 1 = 2",
          closeAttemptHint: "🎯 Almost! 2(1) = 2, so: 2 + 3",
          repetitionHint: "🔁 Simplify: 2 + 3",
          guessingHint: "🎲 2(1) + 3 = 2 + 3",
          commonMistakes: [
            "Arithmetic errors"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: "💡 Add: f(1) = 5",
          signErrorHint: "⚠️ 2 + 3 = 5",
          magnitudeErrorHint: "📏 Calculate: 2 + 3 = 5",
          closeAttemptHint: "🎯 Almost! 2 + 3 = 5",
          repetitionHint: "🔁 Result: 5",
          guessingHint: "🎲 2 + 3 = 5",
          commonMistakes: [
            "Wrong addition"
          ]
        },
        {
          stepLabel: "final",
          genericHint: "💡 Final answer: (f ∘ g)(-1) = 5",
          signErrorHint: "⚠️ Answer is 5",
          magnitudeErrorHint: "📏 Verify: g(-1) = 1, f(1) = 5",
          closeAttemptHint: "🎯 Almost! Write: (f ∘ g)(-1) = 5",
          repetitionHint: "🔁 Final format: (f ∘ g)(-1) = 5",
          guessingHint: "🎲 Result: 5",
          commonMistakes: [
            "Wrong final value",
            "Not including (f ∘ g)(-1) =",
            "Calculation errors along the way"
          ]
        }
      ]
    }
  ]
};
