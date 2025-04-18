export type Question = {
    id: string
    question: string
    explanation: string
    hint: string
    options?: string[]
    correct_answer: string
    ai_feedback: {
      [key: string]: string[] // Feedback per answer or default
      default?: string[] // Default feedback for text input questions
    }
  }
  
  type Questions = {
    phase1: Question[]
    phase2: Question[]
    phase3: Question[]
    phase4: Question[]
  }
  
  export const questions: Questions = {
    phase1: [
      {
        id: "p1q1",
        question: "Evaluate f(x) = 2x^2 + 3 when x = 4",
        explanation:
          "To evaluate f(x) = 2x^2 + 3 when x = 4, substitute 4 for x: f(4) = 2(4)^2 + 3 = 2(16) + 3 = 32 + 3 = 35",
        hint: "Substitute the value of x into the function and simplify.",
        options: ["27", "32", "35", "39"],
        correct_answer: "35",
        ai_feedback: {
          "27": ["Not quite. Did you square x correctly?"],
          "32": ["Close, but don't forget to add the constant 3."],
          "35": ["Great job! You evaluated the function correctly."],
          "39": ["Hmm, check your multiplication step again."],
        },
      },
      {
        id: "p1q2",
        question: "If g(x) = x^2 - 5x + 6, what is g(2)?",
        explanation:
          "To evaluate g(x) = x^2 - 5x + 6 when x = 2, substitute 2 for x: g(2) = (2)^2 - 5(2) + 6 = 4 - 10 + 6 = 0",
        hint: "Substitute x = 2 into the function and simplify step by step.",
        options: ["0", "2", "-2", "6"],
        correct_answer: "0",
        ai_feedback: {
          "0": ["Excellent! You evaluated the function correctly."],
          "2": ["Not quite. Did you simplify all terms correctly?"],
          "-2": ["Hmm, check your subtraction step again."],
          "6": ["Close, but double-check your calculations."],
        },
      },
      {
        id: "p1q3",
        question: "Find h(3) if h(x) = 3x^2 - 4x + 1.",
        explanation:
          "To evaluate h(x) = 3x^2 - 4x + 1 when x = 3, substitute 3 for x: h(3) = 3(3)^2 - 4(3) + 1 = 3(9) - 12 + 1 = 27 - 12 + 1 = 16",
        hint: "Substitute x = 3 into the function and simplify step by step.",
        options: ["10", "16", "18", "20"],
        correct_answer: "16",
        ai_feedback: {
          "10": ["Not quite. Did you calculate 3x^2 correctly?"],
          "16": ["Great work! You evaluated the function correctly."],
          "18": ["Close, but check your subtraction step."],
          "20": ["Hmm, double-check your calculations."],
        },
      },
    ],
    phase2: [
      {
        id: "p2q1",
        question: "Evaluate k(x) = (x + 2)/(x - 1) when x = 3.",
        explanation:
          "To evaluate k(x) = (x + 2)/(x - 1) when x = 3, substitute 3 for x: k(3) = (3 + 2)/(3 - 1) = 5/2 = 2.5",
        hint: "Substitute x = 3 into the function and simplify the fraction.",
        correct_answer: "2.5",
        ai_feedback: {
          "2": ["Not quite. Did you simplify the fraction correctly?"],
          "5": ["You've calculated the numerator correctly, but don't forget to divide by (x-1)."],
          default: [
            "Check your calculation again. Remember to substitute x = 3 into both the numerator and denominator.",
          ],
        },
      },
      {
        id: "p2q2",
        question: "If f(x) = x^3 - 2x + 4, find f(-1).",
        explanation:
          "To evaluate f(x) = x^3 - 2x + 4 when x = -1, substitute -1 for x: f(-1) = (-1)^3 - 2(-1) + 4 = -1 + 2 + 4 = 5",
        hint: "Be careful with the signs when substituting a negative value.",
        correct_answer: "5",
        ai_feedback: {
          "3": ["Check the value of (-1)^3. Remember that a negative number cubed is still negative."],
          "-3": ["You might have made an error with the signs. Double-check your calculation."],
          default: ["Remember that (-1)^3 = -1 and -2(-1) = 2. Try again with careful attention to signs."],
        },
      },
      {
        id: "p2q3",
        question: "Evaluate g(2) if g(x) = √(x + 1) + x^2.",
        explanation:
          "To evaluate g(x) = √(x + 1) + x^2 when x = 2, substitute 2 for x: g(2) = √(2 + 1) + 2^2 = √3 + 4 ≈ 1.732 + 4 ≈ 5.732",
        hint: "Break this into two parts: calculate √(x+1) and x^2 separately, then add them.",
        correct_answer: "5.732",
        ai_feedback: {
          "4": ["You might have forgotten to calculate the square root part."],
          "7": ["Check your calculation of √3. It's approximately 1.732."],
          default: ["Remember to calculate both parts: √(2+1) and 2^2. The answer should be approximately 5.732."],
        },
      },
    ],
    phase3: [
      {
        id: "p3q1",
        question: "If f(x) = 2^x and g(x) = x+1, find (f∘g)(2).",
        explanation: "To find (f∘g)(2), first calculate g(2) = 2+1 = 3. Then calculate f(g(2)) = f(3) = 2^3 = 8.",
        hint: "Remember that (f∘g)(x) means f(g(x)). First find g(2), then apply f to that result.",
        correct_answer: "8",
        ai_feedback: {
          "6": ["You might have calculated f(2) ∘ g(2) instead of f(g(2))."],
          "4": ["Check the order of operations in function composition."],
          default: ["For function composition (f∘g)(2), first calculate g(2) = 3, then find f(3) = 2^3 = 8."],
        },
      },
      {
        id: "p3q2",
        question: "Find the domain of f(x) = √(x-3).",
        explanation:
          "For the square root function to be defined in the real number system, the expression inside must be non-negative. So we need x-3 ≥ 0, which gives us x ≥ 3. Therefore, the domain is [3,∞).",
        hint: "For a square root function to have real values, what must be true about the expression inside the square root?",
        correct_answer: "[3,∞)",
        ai_feedback: {
          "(3,∞)": ["Close! But remember that x can equal 3 as well, since √(0) = 0 is defined."],
          "(-∞,3]": ["That's not correct. Think about when a square root is defined."],
          default: [
            "The domain of a square root function includes all values where the expression inside is non-negative. For √(x-3), we need x-3 ≥ 0, so x ≥ 3.",
          ],
        },
      },
      {
        id: "p3q3",
        question: "If f(x) = |x-2|, what is f(-1)?",
        explanation: "To evaluate f(x) = |x-2| when x = -1, substitute -1 for x: f(-1) = |-1-2| = |-3| = 3",
        hint: "Remember that the absolute value of a number is its distance from zero on the number line.",
        correct_answer: "3",
        ai_feedback: {
          "-3": ["Remember that the absolute value is always non-negative."],
          "1": ["Check your calculation. |-1-2| is not 1."],
          default: ["When calculating |x-2| for x = -1, we get |-1-2| = |-3| = 3."],
        },
      },
    ],
    phase4: [
      {
        id: "p4q1",
        question: "Find the range of the function f(x) = 2x² + 3.",
        explanation:
          "Since x² ≥ 0 for all real numbers, 2x² ≥ 0 as well. This means f(x) = 2x² + 3 ≥ 3 for all x. The minimum value of f(x) is 3 (when x = 0). Therefore, the range is [3,∞).",
        hint: "What is the smallest possible value of this function? Consider the behavior of the quadratic term.",
        correct_answer: "[3,∞)",
        ai_feedback: {
          "(3,∞)": ["Close! But remember that the function actually attains the value 3 when x = 0."],
          "(-∞,∞)": ["That's not correct. A quadratic function with a positive coefficient has a minimum value."],
          default: [
            "For a quadratic function f(x) = 2x² + 3, the smallest value occurs at x = 0, giving f(0) = 3. So the range is [3,∞).",
          ],
        },
      },
      {
        id: "p4q2",
        question: "Solve for x: 2^(x+1) = 32.",
        explanation:
          "We have 2^(x+1) = 32. Since 32 = 2^5, we can write 2^(x+1) = 2^5. Equating the exponents: x+1 = 5, so x = 4.",
        hint: "Try expressing 32 as a power of 2, then use the property that if 2^a = 2^b, then a = b.",
        correct_answer: "4",
        ai_feedback: {
          "5": ["You might have forgotten to subtract 1 at the end."],
          "16": ["You seem to have confused the equation. We're solving for the exponent, not calculating 2^(x+1)."],
          default: ["To solve 2^(x+1) = 32, first note that 32 = 2^5. Then 2^(x+1) = 2^5 implies x+1 = 5, so x = 4."],
        },
      },
      {
        id: "p4q3",
        question: "If f(x) = 3x - 5, find the value of x for which f(x) = 10.",
        explanation:
          "We need to solve the equation 3x - 5 = 10. Adding 5 to both sides: 3x = 15. Dividing both sides by 3: x = 5.",
        hint: "Substitute f(x) = 10 into the function equation and solve for x.",
        correct_answer: "5",
        ai_feedback: {
          "15": ["You might have forgotten to divide by 3 at the end."],
          "3": ["Check your arithmetic when solving the equation."],
          default: ["To find x when f(x) = 10, substitute into the function: 3x - 5 = 10. Solving for x gives x = 5."],
        },
      },
    ],
  }
  