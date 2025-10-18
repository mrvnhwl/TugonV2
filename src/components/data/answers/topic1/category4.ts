// Category 4: OPERATIONS ON FUNCTIONS
import type { PredefinedAnswer } from '../types'; 
export const Topic1_Category4_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x² + 4x and g(x) = 3x - 5, find (g ∘ f)(x)",
    type: "multiLine",
    steps: [
      { 
        label: "choose", 
        answer: [
          "f(x) = x^2 + 4x",
          "f(x)=x^2+4x"
        ], 
        placeholder: "\\text{Identify f(x) to be substituted into g(x).}" 
      }, 
      { 
        label: "substitution", 
        answer: [
          "g(f(x)) = 3(x^2 + 4x) - 5",
          "g(f(x))=3(x^2+4x)-5",
          "3(x^2+4x)-5"
        ], 
        placeholder: "\\text{Substitute f(x) into g(x).}" 
      }, 
      { 
        label: "final", 
        answer: [
          "g(f(x)) = 3x^2 + 12x - 5",
          "g(f(x))=3x^2+12x-5",
          "(g∘f)(x)=3x^2+12x-5",
          "3x^2+12x-5"
        ], 
        placeholder: "\\text{Simplify the expression to find (g∘f)(x).}" 
      }
    ]
  },

  {
    questionId: 2,
    questionText: "If f(x) = 1/(x - 1) and g(x) = x + 2, find (f ∘ g)(x)",
    type: "multiLine",
    steps: [
      { 
        label: "choose", 
        answer: [
          "g(x) = x + 2",
          "g(x)=x+2"
        ], 
        placeholder: "\\text{Identify g(x) for substitution.}" 
      }, 
      { 
        label: "substitution", 
        answer: [
          "f(g(x)) = 1/((x + 2) - 1)",
          "f(g(x))=1/((x+2)-1)",
          "1/((x+2)-1)"
        ], 
        placeholder: "\\text{Substitute g(x) into f(x).}" 
      }, 
      { 
        label: "final", 
        answer: [
          "f(g(x)) = 1/(x + 1)",
          "f(g(x))=1/(x+1)",
          "(f∘g)(x)=1/(x+1)",
          "1/(x+1)"
        ], 
        placeholder: "\\text{Simplify the denominator to get (f∘g)(x).}" 
      }
    ]
  },

  {
    questionId: 3,
    questionText: "If f(x) = 3x - 4 and g(x) = x² + 2x, find (f ∘ g)(-1)",
    type: "multiLine",
    steps: [
      { 
        label: "choose", 
        answer: [
          "g(x) = x^2 + 2x",
          "g(x)=x^2+2x"
        ], 
        placeholder: "\\text{Identify g(x) to evaluate first.}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "g(-1) = (-1)^2 + 2(-1)",
          "g(-1)=(-1)^2+2(-1)",
          "(−1)^2+2(−1)"
        ], 
        placeholder: "\\text{Substitute x = -1 into g(x).}" 
      },
      { 
        label: "evaluation", 
        answer: [
          "g(-1) = 1 - 2",
          "g(-1)=1-2"
        ], 
        placeholder: "\\text{Simplify g(-1) step by step.}" 
      },
      { 
        label: "substitution", 
        answer: [
          "f(g(-1)) = f(-1)",
          "f(g(-1))=f(-1)"
        ], 
        placeholder: "\\text{Use the result of g(-1) in f(x).}" 
      },
      { 
        label: "evaluation", 
        answer: [
          "f(-1) = 3(-1) - 4",
          "f(-1)=3(-1)-4"
        ], 
        placeholder: "\\text{Substitute x = -1 into f(x).}" 
      },
      { 
        label: "final", 
        answer: [
          "f(-1) = -3 - 4",
          "f(-1)=-3-4",
          "f(-1)=-7",
          "(f∘g)(-1)=-7",
          "-7"
        ], 
        placeholder: "\\text{Simplify to find the final result.}" 
      }
    ]
  }
];
