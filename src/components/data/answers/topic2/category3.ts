// Category 3: f(x)=2x^2-3x+1. Find f(-2)
import type { PredefinedAnswer } from '../types'; 
export const Topic2_Category3_Answers: PredefinedAnswer[] = [
  { //FIND THE RESTRICTION
    questionId: 1,
    questionText: "f(x) = 2x² - 3x + 1. Find f(-2)",
    type: "multiLine",
    steps: [
      { label: "domain", answer: "f(-2) = 2(-2)² - 3(-2) + 1", placeholder:"{ x | x "},
      
    ]
  },
  {
    questionId: 2,
    questionText: "f(x) = 2x² - 3x + 1. Find f(1)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(1) = 2(1)² - 3(1) + 1" },
      { label: "simplification", answer: "f(1) = 2 - 3 + 1" },
      { label: "final", answer: "0" }
    ]
  },
  {
    questionId: 3,
    questionText: "f(x) = 2x² - 3x + 1. Find f(3)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(3) = 2(3)² - 3(3) + 1" },
      { label: "simplification", answer: "f(3) = 2(9) - 9 + 1" },
      { label: "simplification", answer: "f(3) = 18 - 9 + 1" },
      { label: "final", answer: "10" }
    ]
  },
  {
    questionId: 4,
    questionText: "f(x) = 2x² - 3x + 1. Find f(0)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(0) = 2(0)² - 3(0) + 1" },
      { label: "simplification", answer: "f(0) = 0 - 0 + 1" },
      { label: "final", answer: "1" }
    ]
  },
];

