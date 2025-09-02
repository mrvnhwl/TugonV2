// Strongly-typed question data for use across the app.
// This file intentionally contains no React/UI logic.

export interface GivenQuestion {
  question_id: number;
  question_text: string;
}

export interface Question {
  category_id: number;
  category_question: string;
  given_question: GivenQuestion[];
}

export interface Topic {
  id: number; // topic_id
  name: string;
  level: Question[];
}

export const defaultTopics: Topic[] = [
  {
    id: 1,
    name: "Introduction to Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "Is the relation a function?",
        given_question: [
          { question_id: 1, question_text: "Given the coordinates of relation {(1,2),(2,3),(3,4),(2,5)}" },
          { question_id: 2, question_text: "Given the coordinates of relation {(0,1),(1,2),(2,3),(3,4)}" },
          { question_id: 3, question_text: "Given the coordinates of relation {(1,1),(2,2),(3,3),(1,4)}" },
          { question_id: 4, question_text: "Given the coordinates of relation {(5,6),(7,8),(9,10),(11,12)}" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Is the graph a function?",
        given_question: [
          { question_id: 1, question_text: "Graph showing a vertical line at x = 3" },
          { question_id: 2, question_text: "Graph showing a parabola opening upward" },
          { question_id: 3, question_text: "Graph showing a circle centered at origin" },
          { question_id: 4, question_text: "Graph showing a horizontal line at y = 5" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 3",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 2,
    name: "Evaluating Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "g(x)=x+5. Find g(7).",
        given_question: [
          { question_id: 1, question_text: "g(x) = x + 5. Find g(7)" },
          { question_id: 2, question_text: "g(x) = x + 5. Find g(3)" },
          { question_id: 3, question_text: "g(x) = x + 5. Find g(-2)" },
          { question_id: 4, question_text: "g(x) = x + 5. Find g(0)" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "p(x)=x^2+4. Find p(6)",
        given_question: [
          { question_id: 1, question_text: "p(x) = x² + 4. Find p(6)" },
          { question_id: 2, question_text: "p(x) = x² + 4. Find p(3)" },
          { question_id: 3, question_text: "p(x) = x² + 4. Find p(-1)" },
          { question_id: 4, question_text: "p(x) = x² + 4. Find p(0)" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "f(x)=2x^2-3x+1. Find f(-2)",
        given_question: [
          { question_id: 1, question_text: "f(x) = 2x² - 3x + 1. Find f(-2)" },
          { question_id: 2, question_text: "f(x) = 2x² - 3x + 1. Find f(1)" },
          { question_id: 3, question_text: "f(x) = 2x² - 3x + 1. Find f(3)" },
          { question_id: 4, question_text: "f(x) = 2x² - 3x + 1. Find f(0)" }
        ]
      },
    ],
  },
  {
    id: 3,
    name: "Piecewise-Defined Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 7",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 8",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 9",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 4,
    name: "Operations on Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 10",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 11",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 12",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 5,
    name: "Composition of Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 13",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 14",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 15",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 6,
    name: "Rational Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 16",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 17",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 18",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 7,
    name: "Graphing Rational Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 19",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 20",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 21",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 8,
    name: "Rational Equations and Inequalities",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 22",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 23",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 24",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 9,
    name: "Inverse Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 25",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 26",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 27",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 10,
    name: "Exponential Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here WAIT ITS REALLY WORKING",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 29",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 30",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
  {
    id: 11,
    name: "Logarithmic Functions",
    level: [
      { 
        category_id: 1, 
        category_question: "TODO: input question here 31",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "TODO: input question here 32",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "TODO: input question here 33",
        given_question: [
          { question_id: 1, question_text: "TODO: add specific question variations here" }
        ]
      },
    ],
  },
];
