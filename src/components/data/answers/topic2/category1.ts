import type { PredefinedAnswer } from '../types'; 
export const Topic2_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "g(x) = x + 5. Find g(7)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "7 + 5" }, // Fixed from "(7)/(5)"
      { label: "final", answer: "12" }
    ]
  },
  {
    questionId: 2,
    questionText: "g(x) = 35 -(x-2). Find g(3)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "35-(3-2)" },
      { label: "simplification", answer: "35 - 1" },
      { label: "final", answer: "34" }
    ]
  },
  {
    questionId: 3,
    questionText: "g(x) = 52x+51. Find g(-2)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "52(-2) + 51" },
      { label: "simplification", answer: "-104 + 51" },
      { label: "final", answer: "-53" }
    ]
  },
  {
    questionId: 4,
    questionText: "g(x) = 2x+5/25. Find g(0)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "2(0) + 5/25" },
      { label: "simplification", answer: "0 + 5/25" },
      { label: "final", answer: "3/5" }
    ]
  },
];


