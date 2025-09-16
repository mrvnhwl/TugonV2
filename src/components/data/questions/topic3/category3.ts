import { Question } from "../types";

export const Topic3_Category3: Question  =
      { 
        category_id: 3, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Graph piecewise functions",
        given_question: [
          { question_id: 1, question_text: "Sketch f(x) = {x if x≤1, 2-x if x>1}", guide_text: "Graph each piece separately, paying attention to the boundary conditions." },
          { question_id: 2, question_text: "Graph f(x) = {x² if x<0, x if x≥0}", guide_text: "Consider where each piece starts and stops." },
          { question_id: 3, question_text: "What type of discontinuity exists at x=1 for f(x) = {x if x<1, x+1 if x≥1}?", guide_text: "Compare the left and right limits at the boundary." },
          { question_id: 4, question_text: "Sketch the absolute value function |x| as a piecewise function", guide_text: "Remember |x| = x if x≥0 and |x| = -x if x<0." }
        ]
      };
  