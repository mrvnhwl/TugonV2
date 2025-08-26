// Central predefined answers database
// Each question can reference one of these arrays in the future

export type PredefinedAnswer = {
  type: "single" | "multiLine" | "graph";
  answer: string; // For graph, a string representation (e.g., serialized points)
};

// Example set for testing
export const predefinedAnswers: PredefinedAnswer[] = [
  { type: "graph",    answer: "(1.2,2.4)" },
  { type: "multiLine", answer: "123" },
  { type: "graph",     answer: "graphData" },
];

// Per-question answer scaffolds (33 total: 11 topics × 3 questions)
// Stage numbers are sequential across topics: 1..33

export const Question1Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1.2,2.4)" },
  { type: "multiLine", answer: "123" },
  { type: "graph", answer: "graphData" },
];
export const Question2Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2.3,4.6)" },
  { type: "multiLine", answer: "abc" },
  { type: "graph", answer: "graphData" },
];
export const Question3Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3.0,6.0)" },
  { type: "multiLine", answer: "steps..." },
  { type: "graph", answer: "graphData" },
];

// Evaluating Functions (Topic 2)
export const Question4Answers: PredefinedAnswer[] = [
  { type: "single", answer: "g(7)=7+5" },
  { type: "single", answer: "12" },
];
export const Question5Answers: PredefinedAnswer[] = [
  { type: "single", answer: "p(6)=6^2+4 " },
  { type: "single", answer: "36+4" },
  { type: "single", answer: "40" },
];
export const Question6Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1.2,2.4)" },
  { type: "multiLine", answer: "f(-2)=2(4)-3(-2)+1=8+6+1=15" },
  { type: "graph", answer: "graphData" },
];

// Piecewise-Defined Functions (Topic 3)
export const Question7Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,1)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question8Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,2)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question9Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,3)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Operations on Functions (Topic 4)
export const Question10Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,2)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question11Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,3)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question12Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,4)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Composition of Functions (Topic 5)
export const Question13Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,3)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question14Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,5)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question15Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,7)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Rational Functions (Topic 6)
export const Question16Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,-1)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question17Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,-2)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question18Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,-3)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Graphing Rational Functions (Topic 7)
export const Question19Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,0)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question20Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,0)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question21Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,0)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Rational Equations and Inequalities (Topic 8)
export const Question22Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,4)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question23Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,5)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question24Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,6)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Inverse Functions (Topic 9)
export const Question25Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,1)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question26Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,2)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question27Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,3)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Exponential Functions (Topic 10)
export const Question28Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,2)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question29Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,4)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question30Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,8)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Logarithmic Functions (Topic 11)
export const Question31Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(1,0)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question32Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(2,0.3010)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];
export const Question33Answers: PredefinedAnswer[] = [
  { type: "graph", answer: "(3,0.4771)" },
  { type: "multiLine", answer: "explain" },
  { type: "graph", answer: "graphData" },
];

// Optional: quick lookup by global stage number (1..33)
export const questionAnswersByStage = {
  1: Question1Answers,
  2: Question2Answers,
  3: Question3Answers,
  4: Question4Answers,
  5: Question5Answers,
  6: Question6Answers,
  7: Question7Answers,
  8: Question8Answers,
  9: Question9Answers,
  10: Question10Answers,
  11: Question11Answers,
  12: Question12Answers,
  13: Question13Answers,
  14: Question14Answers,
  15: Question15Answers,
  16: Question16Answers,
  17: Question17Answers,
  18: Question18Answers,
  19: Question19Answers,
  20: Question20Answers,
  21: Question21Answers,
  22: Question22Answers,
  23: Question23Answers,
  24: Question24Answers,
  25: Question25Answers,
  26: Question26Answers,
  27: Question27Answers,
  28: Question28Answers,
  29: Question29Answers,
  30: Question30Answers,
  31: Question31Answers,
  32: Question32Answers,
  33: Question33Answers,
} as const;
  