// Topic 4: Operations on Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic4_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x + 2 and g(x) = x - 1, find (f + g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f + g)(x) = (x + 2) + (x - 1)" },
      { label: "simplification", answer: "(f + g)(x) = x + 2 + x - 1" },
      { label: "final", answer: "(f + g)(x) = 2x + 1" }
    ]
  },
  {
    questionId: 2,
    questionText: "If f(x) = 2x and g(x) = x², find (f - g)(3)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "f(3) = 2(3) = 6, g(3) = 3² = 9" },
      { label: "simplification", answer: "(f - g)(3) = f(3) - g(3) = 6 - 9" },
      { label: "final", answer: "(f - g)(3) = -3" }
    ]
  },
  {
    questionId: 3,
    questionText: "If h(x) = x² + 1 and k(x) = 2x - 3, find (h + k)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(h + k)(x) = (x² + 1) + (2x - 3)" },
      { label: "simplification", answer: "(h + k)(x) = x² + 1 + 2x - 3" },
      { label: "final", answer: "(h + k)(x) = x² + 2x - 2" }
    ]
  },
  {
    questionId: 4,
    questionText: "Given f(x) = 3x and g(x) = x + 4, what is (g - f)(2)?",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "g(2) = 2 + 4 = 6, f(2) = 3(2) = 6" },
      { label: "simplification", answer: "(g - f)(2) = g(2) - f(2) = 6 - 6" },
      { label: "final", answer: "(g - f)(2) = 0" }
    ]
  },
];

