import { Question } from "../types";


//Piecewise Functions - Category 1
export const Topic3_Category1: Question  = {
        
        category_id: 1, 
         title: "PIECEWISE TOPIC 1",
        category_question: "Evaluate piecewise functions at given points",
        given_question: [
          { question_id: 1,category_text:"\\begin{cases} 4x + 1 & \\text{if } x \\geq 0 \\\\ -2x + 3 & \\text{if } x < 0 \\end{cases}", question_text: "Find f(0) ", guide_text: "Check which condition -2 satisfies, then use the corresponding rule." },
          { question_id: 2, category_text:"\\begin{cases} x^2 - 1 & \\text{if } x > 2 \\\\ 3x + 5 & \\text{if } x \\leq 2 \\end{cases}", question_text: "Find f(2) ", guide_text: "Determine which piece of the function to use for x=3." },
          { question_id: 3, category_text:"\\begin{cases} 5x & \\text{if } x \\geq -1 \\\\ x^2 + 2 & \\text{if } x < -1 \\end{cases}", question_text: "Find f(-3) ", guide_text: "Check if x=1 satisfies the first or second condition." },
          { question_id: 4, category_text:"\\begin{cases} 2x^2 & \\text{if } x \\geq 1 \\\\ -3x + 4 & \\text{if } x < 1 \\end{cases}", question_text: "Find f(1) ", guide_text: "Which piece applies when x=4?" }
        ]
      };
