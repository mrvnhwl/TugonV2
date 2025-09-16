
import { Question } from "../types";
export const Topic5_Category1: Question  = 
  
      { 
        category_id: 1, 
        category_question: "Basic function composition",
        given_question: [
          { question_id: 1, question_text: "If f(x) = x + 1 and g(x) = 2x, find (f ∘ g)(x)", guide_text: "Substitute g(x) into f: f(g(x))." },
          { question_id: 2, question_text: "Given f(x) = x² and g(x) = x - 3, find (g ∘ f)(2)", guide_text: "First find f(2), then apply g to that result." },
          { question_id: 3, question_text: "If h(x) = √x and k(x) = x + 4, find (h ∘ k)(5)", guide_text: "Calculate k(5) first, then apply h." },
          { question_id: 4, question_text: "For f(x) = 3x and g(x) = x², what is (f ∘ g)(x)?", guide_text: "Replace x in f(x) with g(x)." }
        ]
      };
 


