import { Question } from "../types";
export const Topic5_Category1: Question  = 
  { 
    category_id: 1, 
    category_question: "Basic function composition",
    given_question: [
      {
        question_id: 1,
        category_text: "\\text{If } f(x) = 2x + 1 \\text{ and } g(x) = x - 4",
        question_text: "Evaluate (f*g)(5)",
        guide_text: "First find g(5), then substitute into f."
      },
      {
        question_id: 2,
        category_text: "\\text{If } f(x) = x^2 \\text{ and } g(x) = 3x",
        question_text: "Find the value of (g*f)(2)",
        guide_text: "First find f(2), then apply g to that result."
      },
      {
        question_id: 3,
        category_text: "\\text{If } f(x) = \\sqrt{x} \\text{ and } g(x) = x + 5",
        question_text: "Compute (f*g)(4)",
        guide_text: "First find g(4), then apply f."
      },
      {
        question_id: 4,
        category_text: "\\text{Let } f(x) = x + 2 \\text{ and } g(x) = \\frac{1}{x}",
        question_text: "Determine (g*f)(2)",
        guide_text: "First find f(2), then substitute into g."
      }
    ]
  };