
// Predefined answers for Topic 4, Category 3
import type { PredefinedAnswer } from '../types'; 
export const Topic4_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Find the domain of f(x) + g(x) where f(x) = √x and g(x) = 1/x",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) requires x ≥ 0" },
      { label: "text", answer: "g(x) requires x ≠ 0" },
      { label: "final", answer: "Domain: x > 0 (intersection of domains)" }
    ]
  },
  {
    questionId: 2,
    questionText: "What is the domain of (f/g)(x) where f(x) = x² and g(x) = x - 3?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) = x² has domain: all real numbers" },
      { label: "text", answer: "Need g(x) ≠ 0, so x - 3 ≠ 0" },
      { label: "final", answer: "Domain: all real numbers except x = 3" }
    ]
  },
  {
    questionId: 3,
    questionText: "If f(x) = √(x-1) and g(x) = √(x+2), find the domain of (f · g)(x)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) requires x - 1 ≥ 0, so x ≥ 1" },
      { label: "text", answer: "g(x) requires x + 2 ≥ 0, so x ≥ -2" },
      { label: "final", answer: "Domain: x ≥ 1 (intersection of domains)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Determine the domain of h(x) - k(x) where h(x) = 1/(x-2) and k(x) = x",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "h(x) requires x - 2 ≠ 0, so x ≠ 2" },
      { label: "text", answer: "k(x) = x has domain: all real numbers" },
      { label: "final", answer: "Domain: all real numbers except x = 2" }
    ]
  },
];