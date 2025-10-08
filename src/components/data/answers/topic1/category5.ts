// Category 5: IDENTIFY THE TYPE OF EQUATION
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category5_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "y=2x+5",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Linear equation" },
      { label: "text", answer: "Form: y = mx + b" }
    ]
  },
  {
    questionId: 2,
    questionText: "x/y?",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Rational equation" },
      { label: "text", answer: "Form: f(x) = P(x)/Q(x)" }
    ]
  },
  {
    questionId: 3,
    questionText: "square root of x+9",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Square root equation" },
      { label: "text", answer: "Form: f(x) = √(expression)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Real numbers",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Identity function" },
      { label: "text", answer: "Form: f(x) = x" }
    ]
  },
];
