// Category 1: RELATION A FUNCTION OR NOT?
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = 2x - 7, evaluate f(8).",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(8) = 2(8) - 7", placeholder: "\\text{Substitute the value of x}" }, 
      { label: "evaluation", answer: "f(8) = 16 - 7", placeholder: "\\text{Simplify the expression}" }, 
      { label: "final", answer: "f(8) = 9", placeholder: "\\text{Write the final answer}" }
    ]
  },

  {
    questionId: 2,
    questionText: "If g(x) = x² + 2x + 1, find g(4)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "g(4) = (4)^2 + 2(4) + 1", placeholder: "\\text{Substitute the value of x}" },
      { label: "evaluation", answer: "g(4) = 16 + 8 + 1", placeholder: "\\text{Simplify the expression}" },
      { label: "final", answer: "g(4) = 25", placeholder: "\\text{Write the final answer}" }
    ]
  },
  
  {
    questionId: 3,
    questionText: "If m(x) = 2x^3 - x + 6, find m(2)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "m(2) = 2(2)^3 - (2) + 6", placeholder: "\\text{Substitute the value of x}" },
      { label: "evaluation", answer: "m(2) = 2(8) - 2 + 6", placeholder: "\\text{Simplify the exponent or multiplication}" },
      { label: "evaluation", answer: "m(2) = 16 - 2 + 6", placeholder: "\\text{Continue simplifying}" },
      { label: "final", answer: "m(2) = 20", placeholder: "\\text{Write the final answer}" }
    ]
  },
];

