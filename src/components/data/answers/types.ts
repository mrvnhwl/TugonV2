export type Step = {
  label: "choose" | "substitution" | "simplification" | "evaluation" | "final" | "math" | "text" | "domain" | "range" | "set";
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