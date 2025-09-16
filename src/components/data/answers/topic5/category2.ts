// Topic 5: Composition of Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic5_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Find the domain of (f ∘ g)(x) where f(x) = √x and g(x) = x - 2",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need g(x) ≥ 0 for f(g(x)) to be defined" }, { label: "substitution", answer: "x - 2 ≥ 0" }, { label: "final", answer: "Domain: x ≥ 2" }
    ]
  },
  {
    questionId: 2,
    questionText: "What is the domain of (g ∘ f)(x) where f(x) = 1/x and g(x) = x + 1?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) requires x ≠ 0" },
      { label: "text", answer: "g(f(x)) = g(1/x) = 1/x + 1 is defined for all 1/x" },
      { label: "final", answer: "Domain: x ≠ 0" }
    ]
  },
  {
    questionId: 3,
    questionText: "If f(x) = √(x+3) and g(x) = x², find the domain of (f ∘ g)(x)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need g(x) + 3 ≥ 0 for f(g(x)) to be defined" },
      { label: "substitution", answer: "x² + 3 ≥ 0" },
      { label: "final", answer: "Domain: all real numbers (x² + 3 ≥ 3 > 0)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Determine the domain of (h ∘ k)(x) where h(x) = 1/(x-1) and k(x) = x + 2",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need k(x) ≠ 1 for h(k(x)) to be defined" },
      { label: "substitution", answer: "x + 2 ≠ 1, so x ≠ -1" },
      { label: "final", answer: "Domain: all real numbers except x = -1" }
    ]
  },
];
