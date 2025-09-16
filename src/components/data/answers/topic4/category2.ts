// Topic 4: Operations on Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic4_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x and g(x) = x + 1, find (f · g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f · g)(x) = x(x + 1)" },
      { label: "simplification", answer: "(f · g)(x) = x² + x" },
      { label: "final", answer: "(f · g)(x) = x² + x" }
    ]
  },
  {
    questionId: 2,
    questionText: "If f(x) = x² and g(x) = x - 2, find (f/g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f/g)(x) = x²/(x - 2)" },
      { label: "text", answer: "Domain restriction: x ≠ 2" },
      { label: "final", answer: "(f/g)(x) = x²/(x - 2), x ≠ 2" }
    ]
  },
  {
    questionId: 3,
    questionText: "Given h(x) = 2x and k(x) = x + 3, what is (h · k)(1)?",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "h(1) = 2(1) = 2, k(1) = 1 + 3 = 4" },
      { label: "simplification", answer: "(h · k)(1) = h(1) · k(1) = 2 · 4" },
      { label: "final", answer: "(h · k)(1) = 8" }
    ]
  },
  {
    questionId: 4,
    questionText: "If p(x) = x² + 4 and q(x) = x + 2, find the domain of (p/q)(x)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need q(x) ≠ 0" },
      { label: "substitution", answer: "x + 2 ≠ 0" },
      { label: "final", answer: "Domain: all real numbers except x = -2" }
    ]
  },
];
