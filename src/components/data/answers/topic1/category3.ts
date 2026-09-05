// Category 3: OPERATIONS ON FUNCTIONS
import type { PredefinedAnswer } from '../types'; 

export const Topic1_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = 3x - 4 and g(x) = x + 5, what is (f + g)(x)?",
    type: "multiLine",
    steps: [
      { 
        label: "substitution", 
        answer: [
          "(f+g)(x)=(3x-4)+(x+5)",
          "(f+g)(x)=3x-4+x+5",
          "(3x - 4)+(x + 5)",
          "3x-4+x+5"
        ], 
        placeholder: "\\text{Add f(x) and g(x) together.}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f+g)(x)=(3x+x)+(-4+5)",
          "(f + g)(x) = (3x + x) + (-4 + 5)",
          "3x+x-4+5"
        ], 
        placeholder: "\\text{Combine like terms carefully.}" 
      }, 
      { 
        label: "final", 
        answer: [
          "(f+g)(x)=4x+1",
          "(f + g)(x) = 4x + 1",
          "4x+1"
        ], 
        placeholder: "\\text{Simplify your result.}" 
      }
    ]
  },

  {
    questionId: 2,
    questionText: "If f(x) = 5x + 2 and g(x) = 2x - 9, what is (f - g)(x)?",
    type: "multiLine",
    steps: [
      { 
        label: "substitution", 
        answer: [
          "(f-g)(x)=(5x+2)-(2x-9)",
          "(5x+2)-(2x-9)",
          "5x+2-(2x-9)"
        ], 
        placeholder: "\\text{Subtract g(x) from f(x).}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f-g)(x)=(5x+2)+(-2x+9)",
          "(f-g)(x) = (5x + 2) + (-2x + 9)",
          "5x+2-2x+9"
        ], 
        placeholder: "\\text{Distribute the negative sign.}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f-g)(x)=(5x-2x)+(2+9)",
          "(f - g)(x) = (5x - 2x) + (2 + 9)",
          "5x-2x+2+9"
        ], 
        placeholder: "\\text{Combine similar terms.}" 
      },
      { 
        label: "final", 
        answer: [
          "(f-g)(x)=3x+11",
          "(f - g)(x) = 3x + 11",
          "3x+11"
        ], 
        placeholder: "\\text{Simplify your final expression.}" 
      }
    ] 
  },

  {
    questionId: 3,
    questionText: "If f(x) = x² and g(x) = 4x - 3, find (f * g)(-2).",
    type: "multiLine",
    steps: [
      { 
        label: "substitution", 
        answer: [
          "(f*g)(x)=(x^2)(4x-3)",
          "(f*g)(x)=x^2(4x-3)",
          "(x²)(4x - 3)",
          "x²(4x - 3)"
        ], 
        placeholder: "\\text{Multiply f(x) and g(x).}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f*g)(x)=4x^3-3x^2",
          "(f * g)(x) = 4x³ - 3x²"
        ], 
        placeholder: "\\text{Expand the expression.}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f*g)(-2)=4(-2)^3-3(-2)^2",
          "(f * g)(-2) = 4(-2)³ - 3(-2)²"
        ], 
        placeholder: "\\text{Substitute x = -2.}" 
      },
      { 
        label: "evaluation", 
        answer: [
          "(f*g)(-2)=4(-8)-3(4)",
          "(f * g)(-2) = 4(-8) - 3(4)"
        ], 
        placeholder: "\\text{Simplify powers and multiply.}" 
      },
      { 
        label: "evaluation", 
        answer: [
          "(f*g)(-2)=-32-12",
          "(f * g)(-2) = -32 - 12",
          "-32-12"
        ], 
        placeholder: "\\text{Combine all terms.}" 
      },
      { 
        label: "final", 
        answer: [
          "(f*g)(-2)=-44",
          "(f * g)(-2) = -44",
          "-44"
        ], 
        placeholder: "\\text{State the final value.}" 
      }
    ]
  },

  {
    questionId: 4,
    questionText: "Let f(x) = 2x + 1 and g(x) = x - 3. Find (f / g)(2).",
    type: "multiLine",
    steps: [
      { 
        label: "substitution", 
        answer: [
          "(f/g)(x)=(2x+1)/(x-3)",
          "(f/g)(x)=2x+1/x-3",
          "((f / g))(x) = (2x + 1)/(x - 3)",
          "(2x+1)/(x-3)"
        ], 
        placeholder: "\\text{Write f(x) over g(x) as a quotient.}" 
      }, 
      { 
        label: "substitution", 
        answer: [
          "(f/g)(2)=(2(2)+1)/(2-3)",
          "((f / g))(2) = (2(2) + 1)/(2 - 3)",
          "(2(2)+1)/(2-3)"
        ], 
        placeholder: "\\text{Substitute x = 2.}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f/g)(2)=(4+1)/(2-3)",
          "((f / g))(2) = (4 + 1)/(2 - 3)"
        ], 
        placeholder: "\\text{Simplify numerator and denominator.}" 
      }, 
      { 
        label: "evaluation", 
        answer: [
          "(f/g)(2)=5/(-1)",
          "((f / g))(2) = (5)/(-1)",
          "5/(-1)"
        ], 
        placeholder: "\\text{Simplify the fraction.}" 
      },
      { 
        label: "final", 
        answer: [
          "(f/g)(2)=-5",
          "((f / g))(2) = -5",
          "-5"
        ], 
        placeholder: "\\text{State your final answer.}" 
      }
    ]
  }
];
