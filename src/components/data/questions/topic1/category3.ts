import { Question } from "../types";
//Introduction to Functions - Category 3
export const Topic1_Category3: Question  =

      {
        category_id: 3,
         title: "OPERATIONS ON FUNCTIONS STAGE",
        category_question: "Combine and Evaluate the Given Equations:", //not done
        given_question: [
          { question_id: 1, category_text:"\\text{f(x)} = 3x - 4 \\text{ and } \\text{g(x)} = x + 5", question_text: "Determine (f + g)(x)", guide_text: "Substitute 3 for x in the function." },
          { question_id: 2, category_text:"\\text{f(x)} = 5x + 2 \\text{ and } \\text{g(x)} = 2x - 9", question_text: "Determine (f - g)(x)", guide_text: "Replace x with 5 in the function." },
          { question_id: 3, category_text:"\\text{f(x)} = x² \\text{ and } \\text{g(x)}= 4x - 3", question_text: "Determine (f * g)(-2)", guide_text: "Multiply 4 by 2." },
          { question_id: 4, category_text:"\\text{f(x)} = 2x + 1 \\text{ and } \\text{g(x)} = x - 3", question_text: "Determine (f / g)(2)", guide_text: "Substitute 2 into the function." }
        ]
      };
       


/*
1) If f(x) = 3x − 4 and g(x) = x + 5, what is (f + g)(x)?
Given: f(x) = 3x − 4,   g(x) = x + 5
Substitute the functions: (f + g)(x) = (3x − 4) + (x + 5).
Combine like terms: (3x + x) + (−4 + 5) = 4x + 1.
Answer: (f + g)(x) = 4x + 1

2) If f(x) = 5x + 2 and g(x) = 2x − 9, what is (f − g)(x)?
Given: f(x) = 5x + 2,   g(x) = 2x − 9
Substitute the functions: (f − g)(x) = (5x + 2) − (2x − 9).
Distribute the minus: 5x + 2 − 2x + 9.
Combine like terms: (5x − 2x) + (2 + 9) = 3x + 11.
Answer: (f − g)(x) = 3x + 11

3) If f(x) = x² and g(x) = 4x − 3, find (f * g)(−2).
Given: f(x) = x²,   g(x) = 4x − 3
Form the product: (f * g)(x) = (x²)(4x − 3) = 4x³ − 3x².
Substitute x = −2: 4(−2)³ − 3(−2)².
Simplify: 4(−8) − 3(4) = −32 − 12 = −44.
Answer: (f * g)(−2) = −44

4) Let f(x) = 2x + 1 and g(x) = x − 3. Find (f / g)(2), given g(x) ≠ 0.
Given: f(x) = 2x + 1,   g(x) = x − 3
Form the quotient: (f / g)(x) = (2x + 1)/(x − 3).
Substitute x = 2: (2(2) + 1)/(2 − 3).
Simplify: (4 + 1)/(−1) = 5/(−1) = −5.
Answer: (f / g)(2) = −5

*/ 