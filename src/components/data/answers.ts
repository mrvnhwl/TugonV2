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
