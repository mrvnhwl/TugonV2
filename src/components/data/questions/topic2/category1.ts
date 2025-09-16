
import { Question } from "../types";
export const Topic2_Category1: Question  = 
      { 
        category_id: 1, 
         title: "EASY", 
        category_question: "Provide Complete Solution, Given:",
        given_question: [
          { question_id: 1, category_text:"g(x) = x + 5",question_text: "Find g(7)", question_type: "fill-in-blanks", guide_text: "Substitute 7 for x and solve." },
          { question_id: 2, category_text:"g(x) = 35 -(x-2)", question_text: "Find g(3)", question_type: "step-by-step", guide_text: "Replace x with 3." }, //fillintheblank
          { question_id: 3, category_text:"g(x) = 52x+51", question_text: "Find g(-2)", question_type: "step-by-step", guide_text: "Plug in -2 for x." }, //step by step
          { question_id: 4, category_text:"g(x) = 2x+5/25", question_text: "Find g(0)", question_type: "step-by-step", guide_text: "What is g(0)?" } // step by step
        ]
      };

