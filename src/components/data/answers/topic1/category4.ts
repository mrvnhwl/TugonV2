
// Category 3: OPERATIONS ON FUNCTIONS UNFINISHED
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category4_Answers: PredefinedAnswer[] = [
    {
    questionId: 1,
    questionText: "If f(x) = x² + 4x and g(x) = 3x - 5, find (g ∘ f)(x)",
    type: "multiLine",
    steps: [
  { label: "choose", answer: "f(x) = x^2 + 4x", placeholder: "\\text{Determine f(x) equation}" }, 
  { label: "substitution", answer: " g(f(x)) = 3(x^2 + 4x) - 5", placeholder: "\\text{Substitute g(f(x)) value}" }, 
  { label: "final", answer: " g(f(x)) = 3x^2 + 12x - 5", placeholder: "\\text{Substitute g(f(x)) value}" }, 
    ]
  },
/*
2) If f(x) = x² + 4x and g(x) = 3x − 5, find (g ∘ f)(x).
Given: f(x) = x² + 4x,   g(x) = 3x − 5
Compute f(x): f(x) = x² + 4x.
Substitute into g: g(f(x)) = 3(x² + 4x) − 5.
Simplify: 3x² + 12x − 5.
Answer: (g ∘ f)(x) = 3x² + 12x − 5

*/ 
 
  {
    questionId: 2,
    questionText: "If f(x) = 1/(x - 1) and g(x) = x + 2, find (f ∘ g)(x)",
    type: "multiLine",
    steps: [
  { label: "choose", answer: "g(x) = x + 2", placeholder: "\\text{Choose the expression to substitute}" }, 
      { label: "evaluation", answer: "f(g(x)) = 1/((x + 2) - 1)", placeholder: "\\text{Substitute g(x) value to f(g(x))}" }, 
      { label: "final", answer: "(f(g(x)) = (1)/(x + 1)", placeholder: "\\text{Simplify step by step}" },
    ] 
  },
 /*

3) If f(x) = 1/(x − 1) and g(x) = x + 2, find (f ∘ g)(x).
Given: f(x) = 1/(x − 1),   g(x) = x + 2
Compute g(x): g(x) = x + 2.
Substitute into f: f(g(x)) = 1/((x + 2) − 1).
Simplify: 1/(x + 1).  (Restriction: x ≠ −1)
Answer: (f ∘ g)(x) = 1/(x + 1)


*/ 
 
  {
    questionId: 3,
    questionText: "If f(x) = 3x - 4 and g(x) = x² + 2x, find (f ∘ g)(-1)",
    type: "multiLine",
    steps: [
  { label: "choose", answer: "g(x) = x^2 + 2x", placeholder: "\\text{Choose the expression to substitute}" }, 
  { label: "choose", answer: "f(g(x))=3x-4", placeholder: "\\text{Choose the expression to evaluate}" }, 
  { label: "substitution", answer: "f(g(x))=3(x^2+2x)-4", placeholder: "\\text{Substitute the value of g(x)}" },
  { label: "evaluation", answer: "f(g(x))=3(x^2+2x)-4", placeholder: "\\text{Distribute 3}" },
  { label: "evaluation", answer: "f(g(x))=3x^2+6x-4", placeholder: "\\text{Substitute the value of x}" },
  { label: "evaluation", answer: "f(g(-1))=3(-1)^2+6(-1)-4", placeholder: "\\text{Evaluate the expression}" },
  { label: "evaluation", answer: "f(g(-1))=3(1)-6-4", placeholder: "\\text{Evaluate the remaining expression}" },
  { label: "evaluation", answer: "f(g(-1))=3-6-4", placeholder: "\\text{Combine the values}" },
  { label: "final", answer: "(f * g)(-2) = -7", placeholder: "\\text{Write the final result clearly}" }
    ]
  },

  /*

5) If f(x) = 3x − 4 and g(x) = x² + 2x, find (f ∘ g)(−1).
Given: f(x) = 3x − 4,   g(x) = x² + 2x
Evaluate g(−1): g(−1) = (−1)² + 2(−1) = 1 − 2 = −1.
Then f(g(−1)): f(−1) = 3(−1) − 4 = −3 − 4 = −7.
Answer: (f ∘ g)(−1) = −7


*/ 
];
