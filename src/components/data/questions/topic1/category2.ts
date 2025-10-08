import { Question } from "../types";
//Introduction to Functions - Category 2
export const Topic1_Category2: Question  =

      {
        category_id: 2,
         title: "PIECEWISE FUNCTIONS",
        category_question: "Choose an Equation and Evaluate, Given:", //not done
        given_question: [
          { question_id: 1, category_text:"f(x) = \\begin{cases} \\text{  } x + 2 & \\text{if } x < 0 & \\\\ 5 & \\text{if } x > 3\\end{cases}", question_text: "x = −3", guide_text: "Substitute 3 for x in the function." },
          { question_id: 2, category_text:"g(x) = \\begin{cases} \\text{  } x+1 & \\text{if } 1 \\leq x < 5 &\\\\ 2x-8 & \\text{if } x \\geq 5\\end{cases}", question_text: "x = 5", guide_text: "Replace x with 5 in the function." },
          { question_id: 3, category_text:"h(x) = \\begin{cases} \\text{  }x^2 - 1 & \\text{if } x \\leq 0 & \\\\  2x+1 & \\text{if } 0 < x < 2 &\\\\ 6 & \\text{if } x \\geq 2\\end{cases}", question_text: "x= 0  ?", guide_text: "Multiply 4 by 2." },
        ]
      };
       

