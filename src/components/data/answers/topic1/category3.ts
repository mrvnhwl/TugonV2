
// Category 3: OPERATIONS ON FUNCTIONS UNFINISHED
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category3_Answers: PredefinedAnswer[] = [
    {
    questionId: 1,
    questionText: " If f(x) = 3x - 4 and g(x) = x + 5, what is (f + g)(x)?",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "(f + g)(x) = (3x - 4) + (x + 5)", placeholder: "\\text{Substitute the functions}" }, 
      { label: "evaluation", answer: " (f + g)(x) = (3x + x) + (-4 + 5)", placeholder: "\\text{Combine like terms}" }, 
      { label: "final", answer: "(f + g)(x) = 4x + 1", placeholder: "\\text{Write the final answer}" }
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
      { label: "substitution", answer: "(f - g)(x) =(5x + 2)-(2x - 9)", placeholder: "\\text{Substitute the functions}" }, 
      { label: "evaluation", answer: "(f -g)(x)=(5x+2)+(-2x+9)", placeholder: "\\text{Distribute and simplify}" }, 
      { label: "evaluation", answer: "(f -g)(x)=(5x - 2x) + (2 + 9)", placeholder: "\\text{Combine like terms}" },
      { label: "final", answer: "(f -g)(x) = 3x + 11", placeholder: "\\text{Write the final answer}" }
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
      { label: "substitution", answer: "(f * g)(x) = (x^2)(4x - 3)", placeholder: "\\text{Multiply the functions}" }, 
      { label: "evaluation", answer: "(f * g)(x)=4x^3 - 3x^2", placeholder: "\\text{Expand the product}" }, 
      { label: "evaluation", answer: "(f * g)(-2)=4(-2)^3 - 3(-2)^2", placeholder: "\\text{Substitute the value of x}" },
      { label: "evaluation", answer: "(f * g)(-2)=4(-8) - 3(4)", placeholder: "\\text{Evaluate exponents and multiply}" },
      { label: "evaluation", answer: "(f * g)(-2)=-32 - 12", placeholder: "\\text{Simplify the expression}" },
      { label: "final", answer: "(f * g)(-2) = -44", placeholder: "\\text{Write the final answer}" }
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
      { label: "substitution", answer: "((f / g))(x) = (2x + 1)/(x - 3)", placeholder: "\\text{Write the quotient of the functions}" }, 
      { label: "substitution", answer: "((f / g))(2) = (2(2) + 1)/(2 - 3)", placeholder: "\\text{Substitute the value of x}" }, 
      { label: "evaluation", answer: "((f / g))(2) = (4 + 1)/(2 - 3)", placeholder: "\\text{Evaluate numerator and denominator}" }, 
      { label: "evaluation", answer: "((f / g))(2) = (5)/(-1)", placeholder: "\\text{Simplify the expression}" },
      { label: "final", answer: "((f / g))(2) = -5", placeholder: "\\text{Write the final answer}" },
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
