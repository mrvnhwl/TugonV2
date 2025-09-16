export type Step = {
  label: "substitution" | "simplification" | "final" | "math" | "text" | "domain" | "range" | "set";
  answer: string;
  placeholder?: string;
};

export type PredefinedAnswer = {
  questionId: number;
  questionText?: string;
  type: "multiLine";
  steps: Step[];
  globalPlaceholder?: string;
};