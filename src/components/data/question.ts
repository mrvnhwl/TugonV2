// Strongly-typed question data for use across the app.
// This file intentionally contains no React/UI logic.

export interface Question {
  id: number; // question_id
  text: string;
}

export interface Topic {
  id: number; // topic_id
  name: string;
  questions: Question[];
}

export const defaultTopics: Topic[] = [
  {
    id: 1,
    name: "Introduction to Functions",
    questions: [
      { id: 1, text: "TODO: input question here 1" },
      { id: 2, text: "TODO: input question here 2" },
      { id: 3, text: "TODO: input question here 3" },
    ],
  },
  {
    id: 2,
    name: "Evaluating Functions",
    questions: [
      { id: 1, text: "g(x)=x+5. Find g(7)." },
      { id: 2, text: "p(x)=x^2+4. Find p(6)" },
      { id: 3, text: "f(x)=2x^2−3x+1. Find f(−2)" },
    ],
  },
  {
    id: 3,
    name: "Piecewise-Defined Functions",
    questions: [
      { id: 1, text: "TODO: input question here 7" },
      { id: 2, text: "TODO: input question here 8" },
      { id: 3, text: "TODO: input question here 9" },
    ],
  },
  {
    id: 4,
    name: "Operations on Functions",
    questions: [
      { id: 1, text: "TODO: input question here 10" },
      { id: 2, text: "TODO: input question here 11" },
      { id: 3, text: "TODO: input question here 12" },
    ],
  },
  {
    id: 5,
    name: "Composition of Functions",
    questions: [
      { id: 1, text: "TODO: input question here 13" },
      { id: 2, text: "TODO: input question here 14" },
      { id: 3, text: "TODO: input question here 15" },
    ],
  },
  {
    id: 6,
    name: "Rational Functions",
    questions: [
      { id: 1, text: "TODO: input question here 16" },
      { id: 2, text: "TODO: input question here 17" },
      { id: 3, text: "TODO: input question here 18" },
    ],
  },
  {
    id: 7,
    name: "Graphing Rational Functions",
    questions: [
      { id: 1, text: "TODO: input question here 19" },
      { id: 2, text: "TODO: input question here 20" },
      { id: 3, text: "TODO: input question here 21" },
    ],
  },
  {
    id: 8,
    name: "Rational Equations and Inequalities",
    questions: [
      { id: 1, text: "TODO: input question here 22" },
      { id: 2, text: "TODO: input question here 23" },
      { id: 3, text: "TODO: input question here 24" },
    ],
  },
  {
    id: 9,
    name: "Inverse Functions",
    questions: [
      { id: 1, text: "TODO: input question here 25" },
      { id: 2, text: "TODO: input question here 26" },
      { id: 3, text: "TODO: input question here 27" },
    ],
  },
  {
    id: 10,
    name: "Exponential Functions",
    questions: [
      { id: 1, text: "TODO: input question here WAIT ITS REALLY WORKING" },
      { id: 2, text: "TODO: input question here 29" },
      { id: 3, text: "TODO: input question here 30" },
    ],
  },
  {
    id: 11,
    name: "Logarithmic Functions",
    questions: [
      { id: 1, text: "TODO: input question here 31" },
      { id: 2, text: "TODO: input question here 32" },
      { id: 3, text: "TODO: input question here 33" },
    ],
  },
];
