
// Strongly-typed question data for use across the app.
// This file intentionally contains no React/UI logic.

export interface GivenQuestion {
  question_id: number;
  question_text: string;
  guide_text: string;
  category_text?: string; // Optional field for category question
    image_url?: string; // Optional image field
  image_alt?: string; // Alt text for accessibility

  
}

export interface Question {
  category_id: number;
  title?: string; // Optional title for the category
  category_question: string;
  given_question: GivenQuestion[];
  category_text?: string; // Optional field for category question
}

export interface Topic {
  id: number; // topic_id
  name: string;
  description: string;

  level: Question[];
  // Optional progress-related fields for future expansion
  isLocked?: boolean;
  prerequisiteIds?: number[];
  estimatedDuration?: number; // in minutes
}

export const defaultTopics: Topic[] = [
  {
    id: 1,
    name: "INTRODUCTION TO FUNCTIONS",
    description: "Learn about functions, notation, domain, and range.",

    level: [
     
      { 
        category_id: 1, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "GRAPH A FUNCTION OR NOT?",
        given_question: [                                                                                                                           
          { question_id: 1, question_text: "Graph 1", guide_text: "Does any vertical line cross the graph more than once?", image_url: "/images/stage2/graph2.png", image_alt: "Graph showing a relation that is not a function" },
          { question_id: 2, question_text: "Graph 2", guide_text: "Try the vertical line test." , image_url: "/images/stage2/graph3.png", image_alt: "Graph showing a parabola opening upward" },
          { question_id: 3, question_text: "Graph 3", guide_text: "What happens if you draw a vertical line through the center?"  , image_url: "/images/stage2/graph4.png", image_alt: "Graph showing a circle centered at origin" }
        ]
      },
    
      { 
        category_id: 2, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "IDENTIFY FUNCTION NOTATION", //not done
        given_question: [
          { question_id: 1, question_text: "y=2x+5", guide_text: "Substitute 3 for x in the function." },
          { question_id: 2, question_text: "x/y?", guide_text: "Replace x with 5 in the function." },
          { question_id: 3, question_text: "square root of x+9", guide_text: "Multiply 4 by 2." },
          { question_id: 4, question_text: "Real numbers", guide_text: "Square the input value." }
        ]
      },
       { 
        category_id: 3, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "COMPLETE THE TABLE", //not done
        given_question: [
          { question_id: 1, question_text: "y=2x+5", guide_text: "Substitute 3 for x in the function." },
          { question_id: 2, question_text: "x/y?", guide_text: "Replace x with 5 in the function." },
          { question_id: 3, question_text: "square root of x+9", guide_text: "Multiply 4 by 2." },
          { question_id: 4, question_text: "Real numbers", guide_text: "Square the input value." }
        ]
      },
       { 
        category_id: 4, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "IDENTIFY THE TYPE OF EQUATION ", //not done
        given_question: [
          { question_id: 1, question_text: "y=2x+5", guide_text: "Substitute 3 for x in the function." },
          { question_id: 2, question_text: "x/y?", guide_text: "Replace x with 5 in the function." },
          { question_id: 3, question_text: "square root of x+9", guide_text: "Multiply 4 by 2." },
          { question_id: 4, question_text: "Real numbers", guide_text: "Square the input value." }
        ]
      },
    ],
  },
  {
    id: 2,
    name: "Evaluating Functions",
    description: "Practice evaluating functions at numeric and algebraic inputs.",


    level: [
      { 
        category_id: 1, 
         title: "EASY",
        category_question: "Provide Complete Solution, Given:",
        given_question: [
          { question_id: 1, category_text:"g(x) = x + 5",question_text: "Find g(7)", guide_text: "Substitute 7 for x and solve." },
          { question_id: 2, category_text:"g(x) = 35 -(x-2)", question_text: "Find g(3)", guide_text: "Replace x with 3." },
          { question_id: 3, category_text:"g(x) = 52x+51", question_text: "Find g(-2)", guide_text: "Plug in -2 for x." },
          { question_id: 4, category_text:"g(x) = 2x+5/25", question_text: "Find g(0)", guide_text: "What is g(0)?" }
        ]
      },
      { 
        category_id: 2, 
         title: "AVERAGE",
        category_question: "Find the domain of the function, Given:",
        given_question: [
          { question_id: 1, category_text:"f(x)=2x+5",question_text: "", guide_text: "Substitute 6 for x and compute." },
          { question_id: 2, category_text:"g(x)=1/x", question_text: "g(x)=1/x", guide_text: "Replace x with 3 and solve." },
          { question_id: 3, category_text:"h(x)=sqrt(x)",question_text: "p(x) = x² + 4. Find p(-1)", guide_text: "Plug in -1 for x." },
          { question_id: 4, category_text:"f(x)=1/(x-4)", question_text: "p(x) = x² + 4. Find p(0)", guide_text: "What is p(0)?" }
        ]
      },
      { 
        category_id: 3, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "f(x)=2x^2-3x+1. Find f(-2)",
        given_question: [
          { question_id: 1, question_text: "f(x) = 2x² - 3x + 1. Find f(-2)", guide_text: "Substitute -2 for x and solve." },
          { question_id: 2, question_text: "f(x) = 2x² - 3x + 1. Find f(1)", guide_text: "Replace x with 1 and compute." },
          { question_id: 3, question_text: "f(x) = 2x² - 3x + 1. Find f(3)", guide_text: "Plug in 3 for x." },
          { question_id: 4, question_text: "f(x) = 2x² - 3x + 1. Find f(0)", guide_text: "What is f(0)?" }
        ]
      },
    ],
  },
  {
    id: 3,
    name: "Piecewise-Defined Functions",
    description: "Understand and analyze piecewise definitions and continuity.",
   
    level: [
      { 
        category_id: 1, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Evaluate piecewise functions at given points",
        given_question: [
          { question_id: 1, question_text: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(-2)", guide_text: "Check which condition -2 satisfies, then use the corresponding rule." },
          { question_id: 2, question_text: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(3)", guide_text: "Determine which piece of the function to use for x=3." },
          { question_id: 3, question_text: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(1)", guide_text: "Check if x=1 satisfies the first or second condition." },
          { question_id: 4, question_text: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(4)", guide_text: "Which piece applies when x=4?" }
        ]
      },
      { 
        category_id: 2, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Determine domain and range of piecewise functions",
        given_question: [
          { question_id: 1, question_text: "What is the domain of f(x) = {x² if x<0, √x if x≥0}?", guide_text: "Consider the domain restrictions of each piece." },
          { question_id: 2, question_text: "What is the range of f(x) = {-x if x≤0, x if x>0}?", guide_text: "Think about the output values for each piece." },
          { question_id: 3, question_text: "Is f(x) = {x+1 if x<2, x-1 if x≥2} continuous at x=2?", guide_text: "Check if the left and right limits equal the function value at x=2." },
          { question_id: 4, question_text: "Find the discontinuities of f(x) = {1/x if x≠0, 0 if x=0}", guide_text: "Look for points where the function is not continuous." }
        ]
      },
      { 
        category_id: 3, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Graph piecewise functions",
        given_question: [
          { question_id: 1, question_text: "Sketch f(x) = {x if x≤1, 2-x if x>1}", guide_text: "Graph each piece separately, paying attention to the boundary conditions." },
          { question_id: 2, question_text: "Graph f(x) = {x² if x<0, x if x≥0}", guide_text: "Consider where each piece starts and stops." },
          { question_id: 3, question_text: "What type of discontinuity exists at x=1 for f(x) = {x if x<1, x+1 if x≥1}?", guide_text: "Compare the left and right limits at the boundary." },
          { question_id: 4, question_text: "Sketch the absolute value function |x| as a piecewise function", guide_text: "Remember |x| = x if x≥0 and |x| = -x if x<0." }
        ]
      },
    ],
  },
  {
    id: 4,
    name: "Operations on Functions",
    description: "Add, subtract, multiply, divide functions and explore their effects.",

    level: [
      { 
        category_id: 1, 
         title: "RELATION A FUNCTION OR NOT?",
        category_question: "Addition and subtraction of functions",
        given_question: [
          { question_id: 1, question_text: "If f(x) = x + 2 and g(x) = x - 1, find (f + g)(x)", guide_text: "Add the function expressions: f(x) + g(x)." },
          { question_id: 2, question_text: "If f(x) = 2x and g(x) = x², find (f - g)(3)", guide_text: "First find f(3) and g(3), then subtract." },
          { question_id: 3, question_text: "If h(x) = x² + 1 and k(x) = 2x - 3, find (h + k)(x)", guide_text: "Combine like terms when adding the functions." },
          { question_id: 4, question_text: "Given f(x) = 3x and g(x) = x + 4, what is (g - f)(2)?", guide_text: "Calculate g(2) - f(2)." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Multiplication and division of functions",
        given_question: [
          { question_id: 1, question_text: "If f(x) = x and g(x) = x + 1, find (f · g)(x)", guide_text: "Multiply the function expressions: f(x) × g(x)." },
          { question_id: 2, question_text: "If f(x) = x² and g(x) = x - 2, find (f/g)(x)", guide_text: "Divide f(x) by g(x), noting any domain restrictions." },
          { question_id: 3, question_text: "Given h(x) = 2x and k(x) = x + 3, what is (h · k)(1)?", guide_text: "Find h(1) and k(1), then multiply the results." },
          { question_id: 4, question_text: "If p(x) = x² + 4 and q(x) = x + 2, find the domain of (p/q)(x)", guide_text: "Consider where the denominator equals zero." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Domain of combined functions",
        given_question: [
          { question_id: 1, question_text: "Find the domain of f(x) + g(x) where f(x) = √x and g(x) = 1/x", guide_text: "The domain is the intersection of both individual domains." },
          { question_id: 2, question_text: "What is the domain of (f/g)(x) where f(x) = x² and g(x) = x - 3?", guide_text: "Exclude values where g(x) = 0." },
          { question_id: 3, question_text: "If f(x) = √(x-1) and g(x) = √(x+2), find the domain of (f · g)(x)", guide_text: "Both square roots must have non-negative arguments." },
          { question_id: 4, question_text: "Determine the domain of h(x) - k(x) where h(x) = 1/(x-2) and k(x) = x", guide_text: "Consider the restrictions of each function." }
        ]
      },
    ],
  },
  {
    id: 5,
    name: "Composition of Functions",
    description: "Compose functions and interpret composite models.",
 
    level: [
      { 
        category_id: 1, 
        category_question: "Basic function composition",
        given_question: [
          { question_id: 1, question_text: "If f(x) = x + 1 and g(x) = 2x, find (f ∘ g)(x)", guide_text: "Substitute g(x) into f: f(g(x))." },
          { question_id: 2, question_text: "Given f(x) = x² and g(x) = x - 3, find (g ∘ f)(2)", guide_text: "First find f(2), then apply g to that result." },
          { question_id: 3, question_text: "If h(x) = √x and k(x) = x + 4, find (h ∘ k)(5)", guide_text: "Calculate k(5) first, then apply h." },
          { question_id: 4, question_text: "For f(x) = 3x and g(x) = x², what is (f ∘ g)(x)?", guide_text: "Replace x in f(x) with g(x)." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Domain of composite functions",
        given_question: [
          { question_id: 1, question_text: "Find the domain of (f ∘ g)(x) where f(x) = √x and g(x) = x - 2", guide_text: "Ensure g(x) ≥ 0 for the square root to be defined." },
          { question_id: 2, question_text: "What is the domain of (g ∘ f)(x) where f(x) = 1/x and g(x) = x + 1?", guide_text: "Consider where f(x) is defined, since it's the input to g." },
          { question_id: 3, question_text: "If f(x) = √(x+3) and g(x) = x², find the domain of (f ∘ g)(x)", guide_text: "Make sure g(x) + 3 ≥ 0." },
          { question_id: 4, question_text: "Determine the domain of (h ∘ k)(x) where h(x) = 1/(x-1) and k(x) = x + 2", guide_text: "Avoid making the denominator zero: k(x) ≠ 1." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Decomposing functions",
        given_question: [
          { question_id: 1, question_text: "Express h(x) = (x + 3)² as a composition f(g(x))", guide_text: "Let g(x) = x + 3 and f(x) = x²." },
          { question_id: 2, question_text: "Decompose F(x) = √(2x - 1) into two simpler functions", guide_text: "Think about the inner and outer operations." },
          { question_id: 3, question_text: "Write H(x) = 1/(x² + 4) as a composition", guide_text: "Identify the inner function x² + 4 and outer function 1/x." },
          { question_id: 4, question_text: "Express G(x) = |x - 5| as f(g(x)) where g(x) = x - 5", guide_text: "What function f would give you the absolute value?" }
        ]
      },
    ],
  },
 
];

// Utility functions for backward compatibility and convenience
export const getTopicById = (id: number): Topic | undefined => {
  return defaultTopics.find(topic => topic.id === id);
};

export const getCategoryByIds = (topicId: number, categoryId: number): Question | undefined => {
  const topic = getTopicById(topicId);
  return topic?.level.find(category => category.category_id === categoryId);
};

export const getQuestionByIds = (topicId: number, categoryId: number, questionId: number): GivenQuestion | undefined => {
  const category = getCategoryByIds(topicId, categoryId);
  return category?.given_question.find(question => question.question_id === questionId);
};

// For TugonSense compatibility (maps to Course type from courses.ts)
export type Course = {
  id: number;
  title: string;
  description: string;

};

export const getTopicsAsCourses = (): Course[] => {
  return defaultTopics.map(topic => ({
    id: topic.id,
    title: topic.name,
    description: topic.description,
 
  }));
};

// Legacy exports for backward compatibility
export const courses = getTopicsAsCourses();
export const getCourseById = (id: number): Course | undefined => {
  const topic = getTopicById(id);
  return topic ? {
    id: topic.id,
    title: topic.name,
    description: topic.description
  } : undefined;
};