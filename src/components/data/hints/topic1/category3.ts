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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - set up the function addition!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep all signs correct!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - use parentheses around both functions!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write (f + g)(x) = (3x - 4) + (x + 5)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - substitute both functions!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - add f(x) + g(x)!",
          commonMistakes: [
            "Forgetting parentheses around each function",
            "Changing -4 to +4",
            "Mixing up f(x) and g(x)"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - group like terms together!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - watch those signs!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 3x + x = 4x!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - combine like terms!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - group x terms and constants!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - add like terms!",
          commonMistakes: [
            "Getting 2x instead of 4x",
            "Getting -9 instead of 1 (wrong sign)",
            "Not grouping like terms"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - simplify to final form!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - should be 4x + 1!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - verify your arithmetic!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write (f + g)(x) = 4x + 1!",
          repetitionHint: " 🔁 Final format: (f + g)(x) = 4x + 1",
          guessingHint: " 🎲 Combine: 4x + 1",
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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - set up the function subtraction!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep the subtraction sign!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - use parentheses correctly!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write (f - g)(x) = (5x + 2) - (2x - 9)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - subtract g(x) from f(x)!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - set up f(x) - g(x)!",
          commonMistakes: [
            "Forgetting parentheses around g(x)",
            "Not distributing the negative",
            "Writing + instead of -"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - distribute the negative sign!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - both signs in g(x) must change!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - distribute carefully!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - change 2x - 9 to -2x + 9!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - distribute the negative!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - change all signs!",
          commonMistakes: [
            "Keeping 2x - 9 instead of -2x + 9",
            "Only changing one sign",
            "Getting confused with subtraction"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - group like terms!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - combine carefully!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 5x - 2x = 3x!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - combine like terms!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - group x terms and constants!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - add like terms!",
          commonMistakes: [
            "Getting 7x instead of 3x",
            "Getting -7 instead of 11",
            "Not grouping properly"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - write the final answer!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - should be 3x + 11!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - verify your result!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write (f - g)(x) = 3x + 11!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your work!",
          guessingHint: " 🎲 Result: 3x + 11",
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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - set up function multiplication!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep the minus sign!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - multiply both functions!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write (f * g)(x) = (x²)(4x - 3)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - multiply f(x) · g(x)!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - set up multiplication!",
          commonMistakes: [
            "Forgetting parentheses",
            "Adding instead of multiplying",
            "Changing the sign in g(x)"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - distribute x² to each term!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep the negative sign!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - distribute carefully!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - get 4x³ - 3x²!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - multiply each term!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - distribute x²!",
          commonMistakes: [
            "Getting 4x² instead of 4x³",
            "Forgetting the negative sign",
            "Not distributing to all terms"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute x = -2!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - watch those negative exponents!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - replace x with -2!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - substitute carefully!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - use parentheses around -2!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - substitute step by step!",
          commonMistakes: [
            "Forgetting parentheses around -2",
            "Getting signs wrong in exponents"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - calculate the exponents!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - (-2)³ = -8, (-2)² = 4!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - evaluate exponents carefully!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - get 4(-8) - 3(4)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - compute exponents first!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - calculate powers!",
          commonMistakes: [
            "Getting (-2)³ = 8 instead of -8",
            "Getting (-2)² = -4 instead of 4"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - multiply the coefficients!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep track of signs!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 4(-8) = -32!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - get -32 - 12!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - multiply carefully!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - complete multiplication!",
          commonMistakes: [
            "Getting signs wrong",
            "Adding instead of subtracting"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - combine the final result!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - result should be -44!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - -32 - 12 = -44!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final answer is -44!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your arithmetic!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - add carefully!",
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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - set up the division as a fraction!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep the signs correct!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - f(x) over g(x)!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write (f / g)(x) = (2x + 1)/(x - 3)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - set up the fraction!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - divide functions!",
          commonMistakes: [
            "Flipping numerator and denominator",
            "Changing signs incorrectly",
            "Not using parentheses"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute x = 2!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - watch that denominator sign!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - substitute in both parts!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - replace x with 2!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - substitute everywhere!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - substitute step by step!",
          commonMistakes: [
            "Forgetting parentheses around 2",
            "Not substituting in both numerator and denominator"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - evaluate both parts!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - denominator should be -1!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 2(2) + 1 = 5!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - get 5/(-1)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - calculate each part!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - evaluate step by step!",
          commonMistakes: [
            "Getting wrong numerator",
            "Getting 1 instead of -1 for denominator"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - simplify the fraction!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - 5/(-1) is negative!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - divide 5 by -1!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - get -5!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - complete the division!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - divide carefully!",
          commonMistakes: [
            "Getting positive 5",
            "Not simplifying"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - write the final answer!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - answer is -5!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - verify the result!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final answer is -5!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your work!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - finalize carefully!",
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
