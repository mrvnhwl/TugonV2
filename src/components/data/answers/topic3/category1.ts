// Topic 3: Piecewise-Defined Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic3_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(-2)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since -2 < 0, use f(x) = x + 1" },
      { label: "substitution", answer: "f(-2) = -2 + 1" },
      { label: "final", answer: "-1" }
    ]
  },
  {
    questionId: 2,
    questionText: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(3)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since 3 ≥ 0, use f(x) = x²" },
      { label: "substitution", answer: "f(3) = 3²" },
      { label: "final", answer: "9" }
    ]
  },
  {
    questionId: 3,
    questionText: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(1)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since 1 ≤ 1, use f(x) = 2x" },
      { label: "substitution", answer: "f(1) = 2(1)" },
      { label: "final", answer: "2" }
    ]
  },
  {
    questionId: 4,
    questionText: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(4)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since 4 > 1, use f(x) = x + 3" },
      { label: "substitution", answer: "f(4) = 4 + 3" },
      { label: "final", answer: "7" }
    ]
  },
];
