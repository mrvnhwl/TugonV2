
// Category 3: OPERATIONS ON FUNCTIONS UNFINISHED
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category3_Answers: PredefinedAnswer[] = [
    {
    questionId: 1,
    questionText: " If f(x) = 3x - 4 and g(x) = x + 5, what is (f + g)(x)?",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "(f + g)(x) = (3x - 4) + (x + 5)", placeholder: "Pick the correct case for x = -3" }, 
      { label: "evaluation", answer: " (f + g)(x) = (3x + x) + (-4 + 5)", placeholder: "Substitute -3 into the chosen expression" }, 
      { label: "final", answer: "(f + g)(x) = 4x + 1", placeholder: "Write the final result clearly" }
    ]
  },
/*
1) If f(x) = 3x − 4 and g(x) = x + 5, what is (f + g)(x)?
Given: f(x) = 3x − 4,   g(x) = x + 5
Substitute the functions: (f + g)(x) = (3x − 4) + (x + 5).
Combine like terms: (3x + x) + (−4 + 5) = 4x + 1.
Answer: (f + g)(x) = 4x + 1
*/ 
 
  {
    questionId: 2,
    questionText: "If f(x) = 5x + 2 and g(x) = 2x - 9, what is (f - g)(x)?",
    type: "multiLine",
    steps: [
       { label: "substitution", answer: "(f - g)(x) =(5x + 2)-(2x - 9)", placeholder: "Substitute 5 into the chosen expression" }, 
      { label: "evaluation", answer: "(f -g)(x)=(5x+2)+(-2x+9)", placeholder: "Substitute 5 into the chosen expression" }, 
      { label: "evaluation", answer: "(f -g)(x)=(5x - 2x) + (2 + 9)", placeholder: "Simplify step by step" },
      { label: "final", answer: "(f -g)(x) = 3x + 11", placeholder: "Write the final result clearly" }
    ] 
  },
 /*

2) If f(x) = 5x + 2 and g(x) = 2x − 9, what is (f − g)(x)?
Given: f(x) = 5x + 2,   g(x) = 2x − 9
Substitute the functions: (f − g)(x) = (5x + 2) − (2x − 9).
Distribute the minus: 5x + 2 − 2x + 9.
Combine like terms: (5x − 2x) + (2 + 9) = 3x + 11.
Answer: (f − g)(x) = 3x + 11

*/ 
 
  {
    questionId: 3,
    questionText: " If f(x) = x² and g(x) = 4x - 3, find (f * g)(-2)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "(f * g)(x) = (x^2)(4x - 3)", placeholder: "Pick the correct case for x = 0" }, 
      { label: "evaluation", answer: "(f * g)(x)=4x^3 - 3x^2", placeholder: "Substitute 0 into the chosen expression" }, 
      { label: "evaluation", answer: "(f * g)(-2)=4(-2)^3 - 3(-2)^2", placeholder: "Simplify step by step" },
      { label: "evaluation", answer: "(f * g)(-2)=4(-8) - 3(4)", placeholder: "Simplify step by step" },
      { label: "evaluation", answer: "(f * g)(-2)=-32 - 12", placeholder: "Simplify step by step" },
      { label: "final", answer: "(f * g)(-2) = -44", placeholder: "Write the final result clearly" }
    ]
  },

  /*

3) If f(x) = x² and g(x) = 4x − 3, find (f * g)(−2).
Given: f(x) = x²,   g(x) = 4x − 3
Form the product: (f * g)(x) = (x²)(4x − 3) = 4x³ − 3x².
Substitute x = −2: 4(−2)³ − 3(−2)².
Simplify: 4(−8) − 3(4) = −32 − 12 = −44.
Answer: (f * g)(−2) = −44

*/ 
    {
    questionId: 4,
    questionText: "Let f(x) = 2x + 1 and g(x) = x - 3. Find (f / g)(2)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "(f / g)(x) = (2x + 1)/(x - 3)", placeholder: "Pick the correct case for x = 0" }, 
      { label: "substitution", answer: "(f / g)(2) = (2(2) + 1)/(2 - 3)", placeholder: "Substitute 2 into the chosen expression" }, 
      { label: "evaluation", answer: "(f / g)(2) = (4 + 1)/(2 - 3)", placeholder: "Evaluate the numerator and denominator" }, 
      { label: "evaluation", answer: "(f / g)(2) = (5)/(-1)", placeholder: "Simplify step by step" },
      { label: "final", answer: "(f / g)(2) = -5", placeholder: "Write the final result clearly" },
    ]
  },

  /*
4) Let f(x) = 2x + 1 and g(x) = x − 3. Find (f / g)(2), given g(x) ≠ 0.
Given: f(x) = 2x + 1,   g(x) = x − 3
Form the quotient: (f / g)(x) = (2x + 1)/(x − 3).
Substitute x = 2: (2(2) + 1)/(2 − 3).
Simplify: (4 + 1)/(−1) = 5/(−1) = −5.
Answer: (f / g)(2) = −5
*/ 
];
