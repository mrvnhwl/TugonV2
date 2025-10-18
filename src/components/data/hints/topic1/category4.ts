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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - understand function composition notation!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - (g ∘ f)(x) = g(f(x))!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - order matters in composition!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - g ∘ f means g(f(x))!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - g goes on the outside!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - compose functions!",
          commonMistakes: [
            "Confusing order (doing f(g(x)) instead)",
            "Multiplying instead of composing",
            "Not understanding the notation"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute f(x) into g(x)!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep all signs correct!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - use parentheses around f(x)!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write g(f(x)) = 3(x + 4)² - 2!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - substitute everywhere!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - replace x with (x + 4)!",
          commonMistakes: [
            "Forgetting parentheses around x + 4",
            "Only substituting in one place",
            "Changing the signs"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - expand (x + 4)²!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - use FOIL or the formula!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - don't forget the middle term!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - (x + 4)² = x² + 8x + 16!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - use the binomial formula!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - expand step by step!",
          commonMistakes: [
            "Getting x² + 16 (forgetting middle term)",
            "Getting x² + 4x + 16 (wrong middle term)",
            "Sign errors in expansion"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - distribute the 3!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - multiply all terms by 3!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - 3 × 8x = 24x!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - distribute to all terms!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - multiply each term!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - distribute step by step!",
          commonMistakes: [
            "Not distributing to all terms",
            "Getting 8x instead of 24x",
            "Forgetting the -2"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - combine the constants!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - 48 - 2 = 46!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - simplify the final result!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final answer is 3x² + 24x + 46!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your arithmetic!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - combine carefully!",
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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - understand composition order!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - (f ∘ g)(x) = f(g(x))!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - f goes on the outside!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - f ∘ g means f(g(x))!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - inner function is g(x)!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - compose functions!",
          commonMistakes: [
            "Confusing order (doing g(f(x)) instead)",
            "Multiplying functions instead",
            "Not understanding notation"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - substitute g(x) into f(x)!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - replace x with (x + 1)!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - use parentheses correctly!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - write f(g(x)) = 1/(x + 1)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - substitute g(x) into f(x)!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - replace x with (x + 1)!",
          commonMistakes: [
            "Forgetting parentheses",
            "Getting 1/x + 1 instead of 1/(x + 1)",
            "Changing signs"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - write the final answer!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - keep it as 1/(x + 1)!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - this is already simplified!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final form is 1/(x + 1)!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - don't over-complicate!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - keep it simple!",
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
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - choose your method!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - work from inside out!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - start with g(-1)!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - evaluate g(-1) first!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - inside out approach!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - calculate g(-1)!",
          commonMistakes: [
            "Not working from inside out",
            "Confusing the order",
            "Substituting -1 in wrong place"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - evaluate g(-1)!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - (-1)² is positive!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - square the negative!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - g(-1) = (-1)² = 1!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - use parentheses!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - square carefully!",
          commonMistakes: [
            "Getting -1 instead of 1",
            "Not using parentheses",
            "Confusing with -1²"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - simplify g(-1)!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - result is positive!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - (-1)² = 1!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - g(-1) = 1!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your calculation!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - verify the result!",
          commonMistakes: [
            "Wrong sign"
          ]
        },
        {
          stepLabel: "substitution",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - now evaluate f(1)!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - substitute 1 into f(x)!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - replace x with 1!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - f(1) = 2(1) + 3!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - use the outer function!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - substitute into f(x)!",
          commonMistakes: [
            "Using wrong value",
            "Forgetting to substitute"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - multiply 2 × 1!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - 2 × 1 = 2!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - calculate step by step!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - get 2 + 3!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - multiply first!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - compute 2(1)!",
          commonMistakes: [
            "Arithmetic errors"
          ]
        },
        {
          stepLabel: "evaluation",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - add 2 + 3!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - 2 + 3 = 5!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - simple addition!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - f(1) = 5!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check addition!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - add carefully!",
          commonMistakes: [
            "Wrong addition"
          ]
        },
        {
          stepLabel: "final",
          genericHint: " Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - write the final answer!",
          signErrorHint: " I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - answer is 5!",
          magnitudeErrorHint: " Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - verify your result!",
          closeAttemptHint: " So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel} - final answer is 5!",
          repetitionHint: " I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel} - double-check your work!",
          guessingHint: " Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically - finalize carefully!",
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
