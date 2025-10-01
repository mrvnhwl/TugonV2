import { Question } from "../types";
export const Topic4_Category2: Question  = {
  category_id: 2, 
  category_question: "Multiplication and division of functions",
  given_question: [
    {
      question_id: 1,
      category_text: "\\text{If } f(x) = x \\text{ and } g(x) = x + 1",
      question_text: "find (f*g)(x)",
      guide_text: "Multiply the function expressions: f(x) \\times g(x)."
    },
    {
      question_id: 2,
      category_text: "\\text{If } f(x) = x^2 \\text{ and } g(x) = x - 2",
      question_text: "find (f/g)(x)",
      guide_text: "Divide f(x) by g(x), noting any domain restrictions."
    },
    {
      question_id: 3,
      category_text: "\\text{Given } h(x) = 2x \\text{ and } k(x) = x + 3",
      question_text: "what is (h*k)(1)?",
      guide_text: "Find h(1) and k(1), then multiply the results."
    },
    {
      question_id: 4,
      category_text: "\\text{If } p(x) = x^2 + 4 \\text{ and } q(x) = x + 2",
      question_text: "find the domain of (p/q)(x)",
      guide_text: "Consider where the denominator equals zero."
    }
  ]
};
/*
Take f(x)=5 and g(x)=x−4. Evaluate (f*g)(−3).
Suppose f(x)=x+7 and g(x)=x². Find (f/g)(2).
For f(x)=x/(x+1) and g(x)=x−1, compute (fg)(2).
Let f(x)=1/(x−2) and g(x)=x+6. Evaluate (f/g)(4).
*/