// Topic 5: Composition of Functions
import type { PredefinedAnswer } from '../types'; 
export const Topic5_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Express h(x) = (x + 3)² as a composition f(g(x))",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Let g(x) = x + 3 (inner function)" },
      { label: "text", answer: "Let f(x) = x² (outer function)" },
      { label: "final", answer: "h(x) = f(g(x)) where f(x) = x², g(x) = x + 3" }
    ]
  },
  {
    questionId: 2,
    questionText: "Decompose F(x) = √(2x - 1) into two simpler functions",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Let g(x) = 2x - 1 (inner function)" },
      { label: "text", answer: "Let f(x) = √x (outer function)" },
      { label: "final", answer: "F(x) = f(g(x)) where f(x) = √x, g(x) = 2x - 1" }
    ]
  },
  {
    questionId: 3,
    questionText: "Write H(x) = 1/(x² + 4) as a composition",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Let g(x) = x² + 4 (inner function)" },
      { label: "text", answer: "Let f(x) = 1/x (outer function)" },
      { label: "final", answer: "H(x) = f(g(x)) where f(x) = 1/x, g(x) = x² + 4" }
    ]
  },
  {
    questionId: 4,
    questionText: "Express G(x) = |x - 5| as f(g(x)) where g(x) = x - 5",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Given g(x) = x - 5" },
      { label: "text", answer: "Need f(x) = |x| (absolute value function)" },
      { label: "final", answer: "G(x) = f(g(x)) where f(x) = |x|, g(x) = x - 5" }
    ]
  },
];