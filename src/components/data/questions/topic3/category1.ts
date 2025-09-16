import { Question } from "../types";

export const Topic3_Category1: Question  = {
        
        category_id: 1, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Evaluate piecewise functions at given points",
        given_question: [
          { question_id: 1, question_text: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(-2)", guide_text: "Check which condition -2 satisfies, then use the corresponding rule." },
          { question_id: 2, question_text: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(3)", guide_text: "Determine which piece of the function to use for x=3." },
          { question_id: 3, question_text: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(1)", guide_text: "Check if x=1 satisfies the first or second condition." },
          { question_id: 4, question_text: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(4)", guide_text: "Which piece applies when x=4?" }
        ]
      };
