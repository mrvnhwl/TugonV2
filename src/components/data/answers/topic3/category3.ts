import type { PredefinedAnswer } from '../types'; 
export const Topic3_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Sketch f(x) = {x if x≤1, 2-x if x>1}",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x ≤ 1: line y = x" },
      { label: "text", answer: "For x > 1: line y = 2 - x" },
      { label: "final", answer: "Two line segments meeting at (1,1)" }
    ]
  },
  {
    questionId: 2,
    questionText: "Graph f(x) = {x² if x<0, x if x≥0}",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x < 0: parabola y = x²" },
      { label: "text", answer: "For x ≥ 0: line y = x" },
      { label: "final", answer: "Parabola and line meeting at origin" }
    ]
  },
  {
    questionId: 3,
    questionText: "What type of discontinuity exists at x=1 for f(x) = {x if x<1, x+1 if x≥1}?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Left limit: lim(x→1⁻) f(x) = 1" },
      { label: "text", answer: "Right limit: lim(x→1⁺) f(x) = 2" },
      { label: "final", answer: "Jump discontinuity" }
    ]
  },
  {
    questionId: 4,
    questionText: "Sketch the absolute value function |x| as a piecewise function",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "|x| = {-x if x < 0, x if x ≥ 0}" },
      { label: "text", answer: "V-shaped graph" },
      { label: "final", answer: "Vertex at origin, continuous everywhere" }
    ]
  },
];