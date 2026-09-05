// Category 2: PIECEWISE FUNCTIONS
import type { PredefinedAnswer } from '../types'; 

export const Topic1_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Let f(x) = { x + 2, x < 0 | x², 0 ≤ x ≤ 3 | 5, x > 3 }. Find f(-3).",
    type: "multiLine",
    steps: [
      { 
        label: "choose", 
        answer: [
          "f(x)=x+2",
          "x+2"], 
        placeholder: "\\text{Which part of the function applies when x < 0?}" 
      }, 
      { 
        label: "substitution", 
        answer: ["f(-3)=(-3)+2",
                  "f(x)=-3+2",
                  "(-3)+2",
                  "-3+2"], 
        placeholder: "\\text{Substitute x-value into your chosen rule.}" 
      }, 
      { 
        label: "final", 
        answer: ["f(-3)=-1",
                "f(x)=-1",
                "-1"], 
        placeholder: "\\text{Provide the final answer.}" 
      }
    ]
  },

  {
    questionId: 2,
    questionText: "Let g(x) = { -x, x < 1 | x + 1, 1 ≤ x < 5 | 2x - 8, x ≥ 5 }. Find g(5).",
    type: "multiLine",
    steps: [
      { 
        label: "choose", 
        answer: ["g(x)=2x-8",
                  "2x-8"], 
        placeholder: "\\text{Which rule includes x = 5?}" 
      }, 
      { 
        label: "substitution", 
        answer: ["g(5)=2(5)-8",
                  "g(x)=2(5)-8",
                  "2(5)-8"
                  ], 
        placeholder: "\\text{Plug in x = 5 into the correct rule.}" 
      }, 
      { 
        label: "evaluation", 
        answer: ["g(5)=10-8","g(x)=10-8","10-8"], 
        placeholder: "\\text{Evaluate the expression.}" 
      },
      { 
        label: "final", 
        answer: ["g(5)=2","g(x)=2","2"], 
        placeholder: "\\text{State the final value of g(5).}" 
      }
    ] 
  },

  {
    questionId: 3,
    questionText: "Let h(x) = { x² - 1, x ≤ 0 | 2x + 1, 0 < x < 2 | 6, x ≥ 2 }. Find h(0).",
    type: "multiLine",
    steps: [
      { 
        label: "choose", 
        answer: ["h(x)=x^2-1","h(x)=x²-1","x^2-1","x²-1"], 
        placeholder: "\\text{Which part of the function covers x = 0?}" 
      }, 
      { 
        label: "substitution", 
        answer: ["h(0)=(0)^2-1","h(x)=(0)^2-1","0^2-1"], 
        placeholder: "\\text{Substitute x = 0 into the chosen rule.}" 
      }, 
      { 
        label: "evaluation", 
        answer: ["h(0)=0-1","h(x)=0-1","0-1"], 
        placeholder: "\\text{Evaluate the expression.}" 
      },
      { 
        label: "final", 
        answer: [
          "h(0)=-1",
          "h(x)=-1",
          "-1"], 
        placeholder: "\\text{Write your final answer.}" 
      }
    ]
  },
];
