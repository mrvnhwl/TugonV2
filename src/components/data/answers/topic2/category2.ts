// Category 2: p(x)=x^2+4. Find p(6)
import type { PredefinedAnswer } from '../types'; 
export const Topic2_Category2_Answers: PredefinedAnswer[] = [
  { //FIND THE DOMAIN
    questionId: 1,
    questionText: "p(x)=x^2+4",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(6) = 6^2 + 5" }, // Fixed from "6(6)+4"
      { label: "simplification", answer: "p(6) = 36 + 4" },
      { label: "final", answer: "40" }
    ]
  },
  {
    questionId: 2,
    questionText: "g(x)=1/x",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(3) = 3² + 4" },
      { label: "simplification", answer: "p(3) = 9 + 4" },
      { label: "final", answer: "13" }
    ]
  },
  {
    questionId: 3,
    questionText: "h(x)=sqrt(x)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(-1) = (-1)² + 4" },
      { label: "simplification", answer: "p(-1) = 1 + 4" },
      { label: "final", answer: "5" }
    ]
  },
  {
    questionId: 4,
    questionText: "f(x)=1/(x-4)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(0) = 0² + 4" },
      { label: "simplification", answer: "p(0) = 0 + 4" },
      { label: "final", answer: "4" }
    ]
  },
];


