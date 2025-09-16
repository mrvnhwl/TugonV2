// Topic 3: Piecewise-Defined Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic3_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "What is the domain of f(x) = {x² if x<0, √x if x≥0}?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x < 0: no restrictions" },
      { label: "text", answer: "For x ≥ 0: need x ≥ 0 for √x" },
      { label: "final", answer: "Domain: all real numbers" }
    ]
  },
  {
    questionId: 2,
    questionText: "What is the range of f(x) = {-x if x≤0, x if x>0}?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x ≤ 0: f(x) = -x ≥ 0" },
      { label: "text", answer: "For x > 0: f(x) = x > 0" },
      { label: "final", answer: "Range: [0, ∞)" }
    ]
  },
  {
    questionId: 3,
    questionText: "Is f(x) = {x+1 if x<2, x-1 if x≥2} continuous at x=2?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Left limit: lim(x→2⁻) f(x) = 2 + 1 = 3" },
      { label: "text", answer: "Right limit: lim(x→2⁺) f(x) = 2 - 1 = 1" },
      { label: "final", answer: "Not continuous (limits don't match)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Find the discontinuities of f(x) = {1/x if x≠0, 0 if x=0}",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "At x = 0: lim(x→0) 1/x does not exist" },
      { label: "text", answer: "Function value at x = 0 is defined as 0" },
      { label: "final", answer: "Discontinuous at x = 0" }
    ]
  },
];
