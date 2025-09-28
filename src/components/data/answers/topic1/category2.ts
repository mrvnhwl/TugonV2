// Category 2: PIECEWISE FUNCTIONS
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category2_Answers: PredefinedAnswer[] = [
    {
    questionId: 1,
    questionText: " Let f(x) = {  x + 2,  x < 0   |   x²,  0 ≤ x ≤ 3   |   5,  x > 3  }.  Find f(-3).",
    type: "multiLine",
    steps: [
      { label: "choose", answer: "f(x) = x + 2", placeholder: "Pick the correct case for x = -3" }, 
      { label: "substitution", answer: "f(-3) = -3 + 2", placeholder: "Substitute -3 into the chosen expression" }, 
      { label: "final", answer: "f(-3) = -1", placeholder: "Write the final result clearly" }
    ]
  },

 
  {
    questionId: 2,
    questionText: "Let g(x) = {  -x,  x < 1   |   x + 1,  1 ≤ x < 5   |   2x - 8,  x ≥ 5  }.  Find g(5).",
    type: "multiLine",
    steps: [
       { label: "choose", answer: "g(x) = 2x - 8", placeholder: "Pick the correct case for x = 5" }, 
      { label: "substitution", answer: "g(5) = 2(5) - 8", placeholder: "Substitute 5 into the chosen expression" }, 
      { label: "evaluation", answer: "g(5) = 10 - 8", placeholder: "Simplify step by step" },
      { label: "final", answer: "g(5) = 2", placeholder: "Write the final result clearly" }
    ] 
  },
 
 
  {
    questionId: 3,
    questionText: "Let h(x) = {  x² - 1,  x ≤ 0   |   2x + 1,  0 < x < 2   |   6,  x ≥ 2  }.  Find h(0).",
    type: "multiLine",
    steps: [
      { label: "choose", answer: "h(x) = x^2- 1", placeholder: "Pick the correct case for x = 0" }, 
      { label: "substitution", answer: "h(0) = (0)^2 - 1", placeholder: "Substitute 0 into the chosen expression" }, 
      { label: "evaluation", answer: "h(0) = 0 - 1", placeholder: "Simplify step by step" },
      { label: "final", answer: "h(0) = -1", placeholder: "Write the final result clearly" }
    ]
  },
];
