

import { Question } from "../types";
//COMPOSITION OF FUNCTIONS - Category 4
export const Topic1_Category4: Question  = 
       { 
        category_id: 4, 
         title: "COMPOSITION OF FUNCTIONS STAGE",
        category_question: "Compose the functions:", //not done
        given_question: [
          { question_id: 1, category_text: "f(x) = x^2 + 4x \\text{ and } g(x) = 3x - 5", question_text: "Find (g ∘ f)(x)", guide_text: "First identify f(x), then substitute f(x) into g(x)." },
          { question_id: 2, category_text: "f(x) = \\frac{1}{x - 1} \\text{ and } g(x) = x + 2", question_text: "Find (f ∘ g)(x)", guide_text: "First find g(x), then substitute g(x) into f(x)." },
          { question_id: 3, category_text: "f(x) = 3x - 4 \\text{ and } g(x) = x^2 + 2x", question_text: "Find (f ∘ g)(-1)", guide_text: "First evaluate g(-1), then substitute that result into f(x)." },
        ]
      };
 
/*
2) If f(x) = x² + 4x and g(x) = 3x − 5, find (g ∘ f)(x).
Given: f(x) = x² + 4x,   g(x) = 3x − 5
Compute f(x): f(x) = x² + 4x.
Substitute into g: g(f(x)) = 3(x² + 4x) − 5.
Simplify: 3x² + 12x − 5.
Answer: (g ∘ f)(x) = 3x² + 12x − 5

3) If f(x) = 1/(x − 1) and g(x) = x + 2, find (f ∘ g)(x).
Given: f(x) = 1/(x − 1),   g(x) = x + 2
Compute g(x): g(x) = x + 2.
Substitute into f: f(g(x)) = 1/((x + 2) − 1).
Simplify: 1/(x + 1).  (Restriction: x ≠ −1)
Answer: (f ∘ g)(x) = 1/(x + 1)


5) If f(x) = 3x − 4 and g(x) = x² + 2x, find (f ∘ g)(−1).
Given: f(x) = 3x − 4,   g(x) = x² + 2x
Evaluate g(−1): g(−1) = (−1)² + 2(−1) = 1 − 2 = −1.
Then f(g(−1)): f(−1) = 3(−1) − 4 = −3 − 4 = −7.
Answer: (f ∘ g)(−1) = −7
*/
/*
2) If f(x) = x² + 4x and g(x) = 3x − 5, find (g ∘ f)(x).
Given: f(x) = x² + 4x,   g(x) = 3x − 5
Compute f(x): f(x) = x² + 4x.
Substitute into g: g(f(x)) = 3(x² + 4x) − 5.
Simplify: 3x² + 12x − 5.
Answer: (g ∘ f)(x) = 3x² + 12x − 5

3) If f(x) = 1/(x − 1) and g(x) = x + 2, find (f ∘ g)(x).
Given: f(x) = 1/(x − 1),   g(x) = x + 2
Compute g(x): g(x) = x + 2.
Substitute into f: f(g(x)) = 1/((x + 2) − 1).
Simplify: 1/(x + 1).  (Restriction: x ≠ −1)
Answer: (f ∘ g)(x) = 1/(x + 1)


5) If f(x) = 3x − 4 and g(x) = x² + 2x, find (f ∘ g)(−1).
Given: f(x) = 3x − 4,   g(x) = x² + 2x
Evaluate g(−1): g(−1) = (−1)² + 2(−1) = 1 − 2 = −1.
Then f(g(−1)): f(−1) = 3(−1) − 4 = −3 − 4 = −7.
Answer: (f ∘ g)(−1) = −7
*/