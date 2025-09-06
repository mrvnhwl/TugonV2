// Central predefined answers database
// Each question corresponds to the structure in question.ts

export type Step = {
  label: "substitution" | "simplification" | "final" | "math" | "text"; // Added "text" for text-based answers
  answer: string;
};

export type PredefinedAnswer = {
  type: "multiLine"; // Only one type now - matches UserInput component
  steps: Step[]; // Changed from answer: string[] to steps: Step[]
};

// Topic 1: Introduction to Functions
// Category 1: Is the relation a function?
export const Topic1_Category1_Answers: PredefinedAnswer[] = [
  // Question 1: {(1,2),(2,3),(3,4),(2,5)}
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" }, // Changed from "math" to "text"
    
    ]
  },
  // Question 2: {(0,1),(1,2),(2,3),(3,4)}
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Yes" }, // Changed from "math" to "text"
      { label: "text", answer: "Each x-value maps to only one y-value" } // Changed from "math" to "text"
    ]
  },
  // Question 3: {(1,1),(2,2),(3,3),(1,4)}
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" }, // Changed from "math" to "text"
      { label: "text", answer: "The x-value 1 maps to both 1 and 4" } // Changed from "math" to "text"
    ]
  },
  // Question 4: {(5,6),(7,8),(9,10),(11,12)}
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Yes" }, // Changed from "math" to "text"
      { label: "text", answer: "All x-values are unique" } // Changed from "math" to "text"
    ]
  },
];

// Category 2: Is the graph a function?
export const Topic1_Category2_Answers: PredefinedAnswer[] = [
  // Question 1: Vertical line at x = 3
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" }, // Changed from "math" to "text"
      { label: "text", answer: "Vertical line fails the vertical line test" } // Changed from "math" to "text"
    ]
  },
  // Question 2: Parabola opening upward
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Yes" }, // Changed from "math" to "text"
      { label: "text", answer: "Passes the vertical line test" } // Changed from "math" to "text"
    ]
  },
  // Question 3: Circle centered at origin
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" }, // Changed from "math" to "text"
      { label: "text", answer: "Vertical lines through the circle intersect at two points" } // Changed from "math" to "text"
    ]
  },
  // Question 4: Horizontal line at y = 5
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Yes" }, // Changed from "math" to "text"
      { label: "text", answer: "Each x has only one y-value" } // Changed from "math" to "text"
    ]
  },
];

// Topic 2: Evaluating Functions
// Category 1: g(x)=x+5. Find g(7)
export const Topic2_Category1_Answers: PredefinedAnswer[] = [
  // Question 1: g(x) = x + 5. Find g(7)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "(7)+5" },
      { label: "final", answer: "12" }
    ]
  },
  // Question 2: g(x) = x + 5. Find g(3)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "(3)+5" },
      { label: "final", answer: "8" }
    ]
  },
  // Question 3: g(x) = x + 5. Find g(-2)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "g(-2) = -2 + 5" },
      { label: "final", answer: "g(-2) = 3" }
    ]
  },
  // Question 4: g(x) = x + 5. Find g(0)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "g(0) = 0 + 5" },
      { label: "final", answer: "g(0) = 5" }
    ]
  },
];

// Category 2: p(x)=x^2+4. Find p(6)
export const Topic2_Category2_Answers: PredefinedAnswer[] = [
  // Question 1: p(x) = x² + 4. Find p(6)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "6(6)+4" },
      { label: "simplification", answer: "36 + 4" },
      { label: "final", answer: "40" }
    ]
  },
  // Question 2: p(x) = x² + 4. Find p(3)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(3) = 3² + 4" },
      { label: "simplification", answer: "p(3) = 9 + 4" },
      { label: "final", answer: "p(3) = 13" }
    ]
  },
  // Question 3: p(x) = x² + 4. Find p(-1)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(-1) = (-1)² + 4" },
      { label: "simplification", answer: "p(-1) = 1 + 4" },
      { label: "final", answer: "p(-1) = 5" }
    ]
  },
  // Question 4: p(x) = x² + 4. Find p(0)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(0) = 0² + 4" },
      { label: "simplification", answer: "p(0) = 0 + 4" },
      { label: "final", answer: "p(0) = 4" }
    ]
  },
];

// Category 3: f(x)=2x^2-3x+1. Find f(-2)
export const Topic2_Category3_Answers: PredefinedAnswer[] = [
  // Question 1: f(x) = 2x² - 3x + 1. Find f(-2)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(-2) = 2(-2)² - 3(-2) + 1" },
      { label: "simplification", answer: "f(-2) = 2(4) + 6 + 1" },
      { label: "simplification", answer: "f(-2) = 8 + 6 + 1" },
      { label: "final", answer: "f(-2) = 15" }
    ]
  },
  // Question 2: f(x) = 2x² - 3x + 1. Find f(1)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(1) = 2(1)² - 3(1) + 1" },
      { label: "simplification", answer: "f(1) = 2 - 3 + 1" },
      { label: "final", answer: "f(1) = 0" }
    ]
  },
  // Question 3: f(x) = 2x² - 3x + 1. Find f(3)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(3) = 2(3)² - 3(3) + 1" },
      { label: "simplification", answer: "f(3) = 2(9) - 9 + 1" },
      { label: "simplification", answer: "f(3) = 18 - 9 + 1" },
      { label: "final", answer: "f(3) = 10" }
    ]
  },
  // Question 4: f(x) = 2x² - 3x + 1. Find f(0)
  {
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(0) = 2(0)² - 3(0) + 1" },
      { label: "simplification", answer: "f(0) = 0 - 0 + 1" },
      { label: "final", answer: "f(0) = 1" }
    ]
  },
];

// Placeholder answers for remaining topics (Topics 3-11)
// These follow the same pattern but need actual mathematical content

// Topic 3: Piecewise-Defined Functions
export const Topic3_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add piecewise function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic3_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add piecewise function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic3_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add piecewise function solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 4: Operations on Functions
export const Topic4_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add function operations solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic4_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add function operations solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic4_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add function operations solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 5: Composition of Functions
export const Topic5_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add function composition solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic5_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add function composition solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic5_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add function composition solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 6: Rational Functions
export const Topic6_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add rational function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic6_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add rational function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic6_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add rational function solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 7: Graphing Rational Functions
export const Topic7_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add graphing rational function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic7_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add graphing rational function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic7_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add graphing rational function solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 8: Rational Equations and Inequalities
export const Topic8_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add rational equations solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic8_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add rational equations solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic8_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add rational equations solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 9: Inverse Functions
export const Topic9_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add inverse function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic9_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add inverse function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic9_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add inverse function solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 10: Exponential Functions
export const Topic10_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add exponential function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic10_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add exponential function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic10_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add exponential function solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Topic 11: Logarithmic Functions
export const Topic11_Category1_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add logarithmic function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic11_Category2_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add logarithmic function solution steps" } // Changed from "math" to "text"
    ]
  },
];
export const Topic11_Category3_Answers: PredefinedAnswer[] = [
  { 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "TODO: Add logarithmic function solution steps" } // Changed from "math" to "text"
    ]
  },
];

// Lookup structure by topic and category
export const answersByTopicAndCategory = {
  1: { // Introduction to Functions
    1: Topic1_Category1_Answers,
    2: Topic1_Category2_Answers,
    3: [], // No category 3 questions defined yet
  },
  2: { // Evaluating Functions
    1: Topic2_Category1_Answers,
    2: Topic2_Category2_Answers,
    3: Topic2_Category3_Answers,
  },
  3: { // Piecewise-Defined Functions
    1: Topic3_Category1_Answers,
    2: Topic3_Category2_Answers,
    3: Topic3_Category3_Answers,
  },
  4: { // Operations on Functions
    1: Topic4_Category1_Answers,
    2: Topic4_Category2_Answers,
    3: Topic4_Category3_Answers,
  },
  5: { // Composition of Functions
    1: Topic5_Category1_Answers,
    2: Topic5_Category2_Answers,
    3: Topic5_Category3_Answers,
  },
  6: { // Rational Functions
    1: Topic6_Category1_Answers,
    2: Topic6_Category2_Answers,
    3: Topic6_Category3_Answers,
  },
  7: { // Graphing Rational Functions
    1: Topic7_Category1_Answers,
    2: Topic7_Category2_Answers,
    3: Topic7_Category3_Answers,
  },
  8: { // Rational Equations and Inequalities
    1: Topic8_Category1_Answers,
    2: Topic8_Category2_Answers,
    3: Topic8_Category3_Answers,
  },
  9: { // Inverse Functions
    1: Topic9_Category1_Answers,
    2: Topic9_Category2_Answers,
    3: Topic9_Category3_Answers,
  },
  10: { // Exponential Functions
    1: Topic10_Category1_Answers,
    2: Topic10_Category2_Answers,
    3: Topic10_Category3_Answers,
  },
  11: { // Logarithmic Functions
    1: Topic11_Category1_Answers,
    2: Topic11_Category2_Answers,
    3: Topic11_Category3_Answers,
  },
} as const;

// Helper function to get steps for a specific topic, category, and question
export function getAnswerForQuestion(
  topicId: number,
  categoryId: number,
  questionId: number
): Step[] | undefined {
  const topic = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
  if (!topic) return undefined;
  
  const category = topic[categoryId as keyof typeof topic];
  if (!category || !Array.isArray(category)) return undefined;
  
  const question = category[questionId - 1]; // questionId is 1-indexed
  return question?.steps;
}

// Helper function to get answer strings for backward compatibility
export function getAnswerStringsForQuestion(
  topicId: number,
  categoryId: number,
  questionId: number
): string[] | undefined {
  const steps = getAnswerForQuestion(topicId, categoryId, questionId);
  return steps?.map(step => step.answer);
}

// Backward compatibility - export for existing components
export const predefinedAnswers = Topic2_Category1_Answers;