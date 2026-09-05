import type { CategoryHints } from '../types';

export const Topic1_Category1_Hints: CategoryHints = {
  categoryId: 1,
  categoryName: "Function Evaluation",
  questions: [
    // Question 1: If f(x) = 2x - 7, evaluate f(8)
    {
      questionId: 1,
      questionText: "If f(x) = 2x - 7, evaluate f(8).",
      generalTips: [
        "Replace every 'x' with the given value (8)",
        "Follow order of operations: multiply first, then subtract",
        "Don't forget to include parentheses around the substituted value"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: "Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - make sure to replace x with 8!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - check those signs carefully!",
          magnitudeErrorHint: "Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - verify the substitution format!",
          closeAttemptHint: "So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - almost perfect!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - use parentheses!",
          guessingHint: "Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - substitute step by step!",
          commonMistakes: [
            "Writing f(8) = 2*8 - 7 (missing parentheses)",
            "Writing f(8) = 28 - 7 (don't evaluate yet!)",
            "Forgetting to include f(8) = on the left side"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: ": Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - multiply first, then subtract!",
          signErrorHint: ": I see you're {behavior}. Review {wrongPart} during {stepLabel} - watch those signs carefully!",
          magnitudeErrorHint: ": Looks like you're {behavior}. Focus on {wrongPart} in the {stepLabel} step - verify that multiplication!",
          closeAttemptHint: ": Great work! You're {behavior}. One more look at {wrongPart} in {stepLabel} - you're almost there!",
          repetitionHint: ": I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - order of operations!",
          guessingHint: ": Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - multiply first!",
          commonMistakes: [
            "Writing 16 + 7 instead of 16 - 7",
            "Calculating 2 × 8 incorrectly",
            "Subtracting before multiplying"
          ]
        },
        {
          stepLabel: "final",
          genericHint: ": Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - time to finish strong!",
          signErrorHint: ": I see you're {behavior}. Review {wrongPart} during {stepLabel} - positive result expected!",
          magnitudeErrorHint: ": Looks like you're {behavior}. Focus on {wrongPart} in the {stepLabel} step - verify that subtraction!",
          closeAttemptHint: ": So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - you've got this!",
          repetitionHint: ": I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - include the function notation!",
          guessingHint: ": Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - final calculation time!",
          commonMistakes: [
            "Writing just '9' without f(8) =",
            "Getting -9 instead of 9",
            "Writing f(8) = 23 (adding instead of subtracting)"
          ]
        }
      ]
    },

    // Question 2: If g(x) = x² + 2x + 1, find g(4)
    {
      questionId: 2,
      questionText: "If g(x) = x² + 2x + 1, find g(4)",
      generalTips: [
        "Replace every 'x' with 4 and use parentheses",
        "Calculate the exponent (4²) first",
        "Then multiply 2 × 4",
        "Finally add all terms together"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: ": Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - replace every x with 4!",
          signErrorHint: ": I see you're {behavior}. Review {wrongPart} during {stepLabel} - all additions here!",
          magnitudeErrorHint: ": Looks like you're {behavior}. Focus on {wrongPart} in the {stepLabel} step - every x becomes 4!",
          closeAttemptHint: ": Great work! You're {behavior}. One more look at {wrongPart} in {stepLabel} - use those parentheses!",
          repetitionHint: ": IIII notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - parentheses are key!",
          guessingHint: ": Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - substitute carefully!",
          commonMistakes: [
            "Forgetting parentheses around 4 in (4)^2",
            "Writing 4^2 instead of (4)^2",
            "Missing the 2(4) term"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: ": 💡 Calculate: (4)^2 = 16, then 2(4) = 8. Write: g(4) = 16 + 8 + 1",
          signErrorHint: ": ⚠️ All terms should be added: 16 + 8 + 1",
          magnitudeErrorHint: ": 📏 Check: 4² = 16 (not 8 or 12), and 2×4 = 8 (not 4 or 6)",
          closeAttemptHint: ": 🎯 You're close! (4)² = 16, 2(4) = 8, so write: g(4) = 16 + 8 + 1",
          repetitionHint: ": 🔁 Calculate each part: (4)² = 16, 2(4) = 8, then write: g(4) = 16 + 8 + 1",
          guessingHint: ": 🎲 Evaluate exponents and multiplication first: 16 + 8 + 1",
          commonMistakes: [
            "Calculating 4² as 8 instead of 16",
            "Forgetting to multiply 2 × 4",
            "Changing + to - or ×"
          ]
        },
        {
          stepLabel: "final",
          genericHint: ": 💡 Add: 16 + 8 + 1 = 25. Write: g(4) = 25",
          signErrorHint: ": ⚠️ Make sure you're adding all three numbers: 16 + 8 + 1 = 25",
          magnitudeErrorHint: ": 📏 Check your addition: 16 + 8 = 24, then 24 + 1 = 25",
          closeAttemptHint: ": 🎯 Almost! Add step by step: 16 + 8 = 24, then 24 + 1 = 25",
          repetitionHint: ": 🔁 Final format: g(4) = 25 (not just 25)",
          guessingHint: ": 🎲 Add all three: 16 + 8 + 1 = 25",
          commonMistakes: [
            "Getting 24 (forgot the +1)",
            "Getting 15 (subtracted instead of added)",
            "Writing just 25 without g(4) ="
          ]
        }
      ]
    },

    // Question 3: If m(x) = 2x³ - x + 6, find m(2)
    {
      questionId: 3,
      questionText: "If m(x) = 2x^3 - x + 6, find m(2)",
      generalTips: [
        "Replace every 'x' with 2",
        "Calculate the exponent (2³) first",
        "Multiply 2 × (2³)",
        "Don't forget the middle term: -(2)",
        "Add all terms: 2(2³) - 2 + 6"
      ],
      stepHints: [
        {
          stepLabel: "substitution",
          genericHint: ": 💡 Replace x with 2. Write: m(2) = 2(2)^3 - (2) + 6",
          signErrorHint: ": ⚠️ Check signs: should be 2(2)^3 - (2) + 6 (minus in the middle!)",
          magnitudeErrorHint: ": 📏 Make sure you substituted 2 everywhere: m(2) = 2(2)^3 - (2) + 6",
          closeAttemptHint: ": 🎯 Almost! Use parentheses: m(2) = 2(2)^3 - (2) + 6",
          repetitionHint: ": 🔁 Write exactly: m(2) = 2(2)^3 - (2) + 6 (note the minus before (2))",
          guessingHint: ": 🎲 Substitute step by step: m(2) = 2(2)^3 - (2) + 6",
          commonMistakes: [
            "Forgetting the minus sign: writing + instead of -",
            "Writing 2^3 without the coefficient 2",
            "Not including parentheses around the second 2"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: ": 💡 Calculate 2³ = 8, then multiply: 2(8) = 16. Write: m(2) = 2(8) - 2 + 6",
          signErrorHint: ": ⚠️ Keep the minus sign: m(2) = 2(8) - 2 + 6",
          magnitudeErrorHint: ": 📏 Check: 2³ = 8 (not 6 or 4), so 2 × 8 = 16",
          closeAttemptHint: ": 🎯 Good! 2³ = 8. Show it as: m(2) = 2(8) - 2 + 6 before multiplying",
          repetitionHint: ": 🔁 First: 2³ = 8. Write: m(2) = 2(8) - 2 + 6 (then you'll multiply 2×8)",
          guessingHint: ": 🎲 Evaluate the exponent: 2³ = 8, giving m(2) = 2(8) - 2 + 6",
          commonMistakes: [
            "Calculating 2³ as 6 instead of 8",
            "Changing the signs",
            "Multiplying 2 × 2 instead of calculating 2³"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: ": 💡 Multiply: 2 × 8 = 16. Write: m(2) = 16 - 2 + 6",
          signErrorHint: ": ⚠️ Maintain correct signs: 16 - 2 + 6 (minus 2, plus 6)",
          magnitudeErrorHint: ": 📏 Verify: 2 × 8 = 16 (not 10 or 18)",
          closeAttemptHint: ": 🎯 Almost there! 2 × 8 = 16, so: m(2) = 16 - 2 + 6",
          repetitionHint: ": 🔁 Multiply first: 2(8) = 16. Then write: m(2) = 16 - 2 + 6",
          guessingHint: ": 🎲 Multiply 2 × 8 to get 16, keeping the other terms",
          commonMistakes: [
            "Getting 10 or 18 instead of 16",
            "Changing - 2 to + 2",
            "Forgetting the + 6"
          ]
        },
        {
          stepLabel: "final",
          genericHint: ": 💡 Calculate: 16 - 2 = 14, then 14 + 6 = 20. Write: m(2) = 20",
          signErrorHint: ": ⚠️ Follow left to right: 16 - 2 = 14, then 14 + 6 = 20",
          magnitudeErrorHint: ": 📏 Check your arithmetic: 16 - 2 = 14, then 14 + 6 = 20",
          closeAttemptHint: ": 🎯 Almost! Work left to right: 16 - 2 = 14, then 14 + 6 = 20",
          repetitionHint: ": 🔁 Final answer format: m(2) = 20 (not just 20)",
          guessingHint: ": 🎲 Add and subtract: 16 - 2 + 6 = 20",
          commonMistakes: [
            "Getting 10 (16 - 2 - 6 instead of 16 - 2 + 6)",
            "Getting 24 (16 + 2 + 6)",
            "Writing just 20 without m(2) ="
          ]
        }
      ]
    }
  ]
};
