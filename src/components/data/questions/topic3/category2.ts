import { Question } from "../types";

export const Topic3_Category2: Question  =
      { 
        category_id: 2, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Determine domain and range of piecewise functions",
        given_question: [
          { question_id: 1, question_text: "What is the domain of f(x) = {x² if x<0, √x if x≥0}?", guide_text: "Consider the domain restrictions of each piece." },
          { question_id: 2, question_text: "What is the range of f(x) = {-x if x≤0, x if x>0}?", guide_text: "Think about the output values for each piece." },
          { question_id: 3, question_text: "Is f(x) = {x+1 if x<2, x-1 if x≥2} continuous at x=2?", guide_text: "Check if the left and right limits equal the function value at x=2." },
          { question_id: 4, question_text: "Find the discontinuities of f(x) = {1/x if x≠0, 0 if x=0}", guide_text: "Look for points where the function is not continuous." }
        ]
      };
  