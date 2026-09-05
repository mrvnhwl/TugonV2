// Topic 5: Composition of Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic5_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x + 1 and g(x) = 2x, find (f ∘ g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f ∘ g)(x) = f(g(x)) = f(2x)" },
      { label: "simplification", answer: "f(2x) = 2x + 1" },
      { label: "final", answer: "(f ∘ g)(x) = 2x + 1" }
    ]
  },
  {
    questionId: 2,
    questionText: "Given f(x) = x² and g(x) = x - 3, find (g ∘ f)(2)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "f(2) = 2² = 4" },
      { label: "simplification", answer: "(g ∘ f)(2) = g(f(2)) = g(4)" },
      { label: "final", answer: "g(4) = 4 - 3 = 1" }
    ]
  },
  {
    questionId: 3,
    questionText: "If h(x) = √x and k(x) = x + 4, find (h ∘ k)(5)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "k(5) = 5 + 4 = 9" },
      { label: "simplification", answer: "(h ∘ k)(5) = h(k(5)) = h(9)" },
      { label: "final", answer: "h(9) = √9 = 3" }
    ]
  },
  {
    questionId: 4,
    questionText: "For f(x) = 3x and g(x) = x², what is (f ∘ g)(x)?",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f ∘ g)(x) = f(g(x)) = f(x²)" },
      { label: "simplification", answer: "f(x²) = 3(x²)" },
      { label: "final", answer: "(f ∘ g)(x) = 3x²" }
    ]
  },
];
