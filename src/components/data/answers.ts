// Central predefined answers database
// Each question can reference one of these arrays in the future

export type PredefinedAnswer = {
  type: "single" | "multiLine" | "graph";
  answer: string; // For graph, a string representation (e.g., serialized points)
};

// Example set for testing
export const predefinedAnswers: PredefinedAnswer[] = [
  { type: "single",    answer: "x+1" },
  { type: "multiLine", answer: "step1->step2" },
  { type: "graph",     answer: "graphData" },
  { type: "single",    answer: "y-2" },
  { type: "multiLine", answer: "another-solution" },
];
