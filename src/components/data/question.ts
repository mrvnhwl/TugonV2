// Strongly-typed question data for use across the app.
// This file intentionally contains no React/UI logic.

export interface GivenQuestion {
  question_id: number;
  question_text: string;
  guide_text: string;
    image_url?: string; // Optional image field
  image_alt?: string; // Alt text for accessibility
  
}

export interface Question {
  category_id: number;
  category_question: string;
  given_question: GivenQuestion[];
  
}

export interface Topic {
  id: number; // topic_id
  name: string;
  description: string;
  lessons: number;
  exercises: number;
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
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "RELATION A FUNCTION OR NOT?",
        given_question: [
          { question_id: 1, question_text: "RELATION OR NOT 1", guide_text: "Check if any x-value repeats with different y-values.", image_url: "/images/stage1/relation1.png", image_alt: "Is the relation a function?" },
          { question_id: 2, question_text: "RELATION OR NOT 2", guide_text: "Each x-value should map to only one y-value.", image_url: "/images/stage1/relation2.png", image_alt: "Is the relation a function?" },
          { question_id: 3, question_text: "RELATION OR NOT 3", guide_text: "Look for repeated x-values with different y-values.", image_url: "/images/stage1/relation3.png", image_alt: "Is the relation a function?" },
          { question_id: 4, question_text: "RELATION OR NOT 4", guide_text: "Are all x-values unique?", image_url: "/images/stage1/relation4.png", image_alt: "Is the relation a function?" },
           { question_id: 5, question_text: "RELATION OR NOT 5", guide_text: "Are all x-values unique?", image_url: "/images/stage1/relation5.png", image_alt: "Is the relation a function?" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "GRAPH A FUNCTION OR NOT?",
        given_question: [                                                                                                                           
          { question_id: 1, question_text: "Graph 1", guide_text: "Does any vertical line cross the graph more than once?", image_url: "/images/stage2/graph2.png", image_alt: "Graph showing a relation that is not a function" },
          { question_id: 2, question_text: "Graph 2", guide_text: "Try the vertical line test." , image_url: "/images/stage2/graph3.png", image_alt: "Graph showing a parabola opening upward" },
          { question_id: 3, question_text: "Graph 3", guide_text: "What happens if you draw a vertical line through the center?"  , image_url: "/images/stage2/graph4.png", image_alt: "Graph showing a circle centered at origin" },
          { question_id: 4, question_text: "Graph 4", guide_text: "Does every x have only one y?", image_url: "/images/stage2/graph5.png", image_alt: "Graph showing a horizontal line at y = 5" },
          { question_id: 5, question_text: "Graph 5", guide_text: "Does every x have only one y?", image_url: "/images/stage2/graph6.png", image_alt: "Graph showing a horizontal line at y = 5" }
        ]
      },
      { 
        category_id: 3, 
        category_question: "INTERPRET FUNCTION NOTATION",
        given_question: [
          { question_id: 1, question_text: "The sum of twice x and three times y", guide_text: "Substitute 3 for x in the function.", image_url: "/images/stage3/interpret1.png", image_alt: "The sum of twice x and three times y" },
          { question_id: 2, question_text: "The square of x plus the square of y", guide_text: "Replace x with 5 in the function.", image_url: "/images/stage3/interpret2.png", image_alt: "The square of x plus the square of y"  },
          { question_id: 3, question_text: "y is equal to five less than x", guide_text: "Multiply 4 by 2.", image_url: "/images/stage3/interpret3.png", image_alt: "y is equal to five less than x"},
          { question_id: 4, question_text: "If f(x) = x², what is f(2)?", guide_text: "Square the input value.", image_url: "/images/stage3/interpret4.png", image_alt: "The product of x and the cube of y" },
          { question_id: 5, question_text: "If f(x) = x², what is f(2)?", guide_text: "Square the input value.", image_url: "/images/stage3/interpret5.png", image_alt: "y is equal to the absolute value of x" }
        ]
      },
      { 
        category_id: 4, 
        category_question: "IDENTIFY FUNCTION NOTATION",
        given_question: [
          { question_id: 1, question_text: "If f(x) = x + 2, what is f(3)?", guide_text: "Substitute 3 for x in the function." },
          { question_id: 2, question_text: "If f(x) = x - 1, what is f(5)?", guide_text: "Replace x with 5 in the function." },
          { question_id: 3, question_text: "If f(x) = 2x, what is f(4)?", guide_text: "Multiply 4 by 2." },
          { question_id: 4, question_text: "If f(x) = x², what is f(2)?", guide_text: "Square the input value." }
        ]
      },
    ],
  },
  {
    id: 2,
    name: "Evaluating Functions",
    description: "Practice evaluating functions at numeric and algebraic inputs.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "g(x)=x+5. Find g(7).",
        given_question: [
          { question_id: 1, question_text: "g(x) = x + 5. Find g(7)", guide_text: "Substitute 7 for x and solve." },
          { question_id: 2, question_text: "g(x) = x + 5. Find g(3)", guide_text: "Replace x with 3." },
          { question_id: 3, question_text: "g(x) = x + 5. Find g(-2)", guide_text: "Plug in -2 for x." },
          { question_id: 4, question_text: "g(x) = x + 5. Find g(0)", guide_text: "What is g(0)?" }
        ]
      },
      { 
        category_id: 2, 
        category_question: "p(x)=x^2+4. Find p(6)",
        given_question: [
          { question_id: 1, question_text: "p(x) = x² + 4. Find p(6)", guide_text: "Substitute 6 for x and compute." },
          { question_id: 2, question_text: "p(x) = x² + 4. Find p(3)", guide_text: "Replace x with 3 and solve." },
          { question_id: 3, question_text: "p(x) = x² + 4. Find p(-1)", guide_text: "Plug in -1 for x." },
          { question_id: 4, question_text: "p(x) = x² + 4. Find p(0)", guide_text: "What is p(0)?" }
        ]
      },
      { 
        category_id: 3, 
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
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
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
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
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
    lessons: 12,
    exercises: 120,
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
  {
    id: 6,
    name: "Rational Functions",
    description: "Explore behavior, domains, and features of rational functions.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "Domain of rational functions",
        given_question: [
          { question_id: 1, question_text: "Find the domain of f(x) = 1/(x - 3)", guide_text: "Exclude values that make the denominator zero." },
          { question_id: 2, question_text: "What is the domain of g(x) = (x + 1)/(x² - 4)?", guide_text: "Factor the denominator and find where it equals zero." },
          { question_id: 3, question_text: "Determine the domain of h(x) = x/(x² + 1)", guide_text: "Consider when x² + 1 = 0." },
          { question_id: 4, question_text: "Find the domain of F(x) = (2x - 1)/(x² - 5x + 6)", guide_text: "Factor the quadratic in the denominator." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Vertical asymptotes",
        given_question: [
          { question_id: 1, question_text: "Find the vertical asymptotes of f(x) = 1/(x² - 9)", guide_text: "Set the denominator equal to zero and solve." },
          { question_id: 2, question_text: "What are the vertical asymptotes of g(x) = (x + 2)/(x(x - 4))?", guide_text: "Look for zeros of the denominator that aren't canceled by the numerator." },
          { question_id: 3, question_text: "Does h(x) = (x - 1)/(x² - 1) have a vertical asymptote at x = 1?", guide_text: "Factor both numerator and denominator to check for cancellation." },
          { question_id: 4, question_text: "Find vertical asymptotes of F(x) = x/(x² + 2x - 3)", guide_text: "Factor the denominator completely." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Horizontal asymptotes",
        given_question: [
          { question_id: 1, question_text: "Find the horizontal asymptote of f(x) = (2x + 1)/(x - 3)", guide_text: "Compare the degrees of numerator and denominator." },
          { question_id: 2, question_text: "What is the horizontal asymptote of g(x) = x²/(2x² + 1)?", guide_text: "When degrees are equal, divide the leading coefficients." },
          { question_id: 3, question_text: "Does h(x) = (x³ + 1)/(x² - 2) have a horizontal asymptote?", guide_text: "Consider what happens when the numerator has higher degree." },
          { question_id: 4, question_text: "Find the horizontal asymptote of F(x) = 3/(x² + 4)", guide_text: "What happens when the denominator has higher degree?" }
        ]
      },
    ],
  },
  {
    id: 7,
    name: "Graphing Rational Functions",
    description: "Graph rational functions using asymptotes and key points.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "Identify key features for graphing",
        given_question: [
          { question_id: 1, question_text: "List all asymptotes and intercepts of f(x) = (x - 1)/(x + 2)", guide_text: "Find vertical, horizontal asymptotes, x-intercept, and y-intercept." },
          { question_id: 2, question_text: "What are the key features of g(x) = x/(x² - 4)?", guide_text: "Identify asymptotes, intercepts, and any holes." },
          { question_id: 3, question_text: "Find discontinuities of h(x) = (x² - 1)/(x - 1)", guide_text: "Check for removable discontinuities (holes) vs. vertical asymptotes." },
          { question_id: 4, question_text: "Analyze F(x) = (2x + 3)/(x² + x - 6)", guide_text: "Factor the denominator and identify all key features." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Behavior near asymptotes",
        given_question: [
          { question_id: 1, question_text: "Describe the behavior of f(x) = 1/(x - 2) as x approaches 2", guide_text: "Consider left and right limits as x → 2." },
          { question_id: 2, question_text: "How does g(x) = (x + 1)/(x² - 1) behave near its vertical asymptotes?", guide_text: "Analyze the sign of the function on each side of the asymptotes." },
          { question_id: 3, question_text: "What happens to h(x) = (3x - 1)/(x + 4) as x → ±∞?", guide_text: "This relates to horizontal asymptotic behavior." },
          { question_id: 4, question_text: "Analyze the end behavior of F(x) = x²/(x - 3)", guide_text: "Consider what happens for very large positive and negative x values." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Sketching rational function graphs",
        given_question: [
          { question_id: 1, question_text: "Sketch f(x) = 1/(x² - 1)", guide_text: "Start with asymptotes, then plot key points and analyze behavior." },
          { question_id: 2, question_text: "Graph g(x) = (x - 2)/(x + 1)", guide_text: "Use asymptotes, intercepts, and test points in each region." },
          { question_id: 3, question_text: "Draw h(x) = x²/(x² - 4)", guide_text: "Note this has a horizontal asymptote at y = 1." },
          { question_id: 4, question_text: "Sketch F(x) = (x + 3)/(x² - 9)", guide_text: "Be careful about the hole vs. asymptote at x = -3." }
        ]
      },
    ],
  },
  {
    id: 8,
    name: "Rational Equations and Inequalities",
    description: "Solve rational equations and inequalities safely and accurately.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "Solving rational equations",
        given_question: [
          { question_id: 1, question_text: "Solve 1/x = 3/(x + 2)", guide_text: "Cross-multiply and check for extraneous solutions." },
          { question_id: 2, question_text: "Find all solutions: (x - 1)/(x + 1) = 2/3", guide_text: "Clear fractions by multiplying both sides by the LCD." },
          { question_id: 3, question_text: "Solve x/(x - 3) - 2/(x + 1) = 0", guide_text: "Get a common denominator, then solve the resulting equation." },
          { question_id: 4, question_text: "Find x: 1/(x - 2) + 1/(x + 2) = 4/(x² - 4)", guide_text: "Notice that x² - 4 = (x - 2)(x + 2)." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Checking for extraneous solutions",
        given_question: [
          { question_id: 1, question_text: "Solve and verify: x/(x - 1) = 1 + 1/(x - 1)", guide_text: "After solving, substitute back to check if solutions are valid." },
          { question_id: 2, question_text: "Find valid solutions: 2/(x + 3) = (x - 1)/(x² - 9)", guide_text: "Check that solutions don't make denominators zero." },
          { question_id: 3, question_text: "Solve 3/x - 1/(x + 2) = 2/(x² + 2x)", guide_text: "Be careful about the domain restrictions." },
          { question_id: 4, question_text: "Why might x = 2 be extraneous for 1/(x - 2) = 3?", guide_text: "Consider what happens when you substitute x = 2." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Rational inequalities",
        given_question: [
          { question_id: 1, question_text: "Solve (x - 1)/(x + 2) > 0", guide_text: "Use a sign chart with critical points at x = 1 and x = -2." },
          { question_id: 2, question_text: "Find when x/(x - 3) ≤ 2", guide_text: "Rearrange to get zero on one side, then use a sign chart." },
          { question_id: 3, question_text: "Solve (x² - 4)/(x + 1) < 0", guide_text: "Factor the numerator and identify all critical points." },
          { question_id: 4, question_text: "When is 1/x > 1/(x + 1)?", guide_text: "Subtract to get a single fraction, then analyze the sign." }
        ]
      },
    ],
  },
  {
    id: 9,
    name: "Inverse Functions",
    description: "Find and verify inverses; understand one-to-one functions.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "Finding inverse functions",
        given_question: [
          { question_id: 1, question_text: "Find the inverse of f(x) = 2x + 3", guide_text: "Switch x and y, then solve for y." },
          { question_id: 2, question_text: "What is the inverse of g(x) = (x - 1)/2?", guide_text: "Replace g(x) with y, swap variables, and solve." },
          { question_id: 3, question_text: "Find f⁻¹(x) where f(x) = x³ + 1", guide_text: "Cube root will be involved in the inverse." },
          { question_id: 4, question_text: "Determine the inverse of h(x) = 1/(x + 2)", guide_text: "Be careful with the algebraic manipulation." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Verifying inverse functions",
        given_question: [
          { question_id: 1, question_text: "Verify that f(x) = 2x - 1 and g(x) = (x + 1)/2 are inverses", guide_text: "Check that f(g(x)) = x and g(f(x)) = x." },
          { question_id: 2, question_text: "Are f(x) = x² and g(x) = √x inverse functions?", guide_text: "Consider domain restrictions and test the composition." },
          { question_id: 3, question_text: "Show that f(x) = 1/x is its own inverse", guide_text: "Compute f(f(x)) and see what you get." },
          { question_id: 4, question_text: "Verify: f(x) = (x - 2)/3 and g(x) = 3x + 2 are inverses", guide_text: "Check both compositions f(g(x)) and g(f(x))." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "One-to-one functions and horizontal line test",
        given_question: [
          { question_id: 1, question_text: "Is f(x) = x² a one-to-one function?", guide_text: "Use the horizontal line test or check if different inputs give the same output." },
          { question_id: 2, question_text: "Determine if g(x) = x³ - x is one-to-one", guide_text: "A function is one-to-one if it passes the horizontal line test." },
          { question_id: 3, question_text: "Why must a function be one-to-one to have an inverse?", guide_text: "Think about what happens if two inputs give the same output." },
          { question_id: 4, question_text: "Restrict the domain of f(x) = x² so it becomes one-to-one", guide_text: "Consider restricting to x ≥ 0 or x ≤ 0." }
        ]
      },
    ],
  },
  {
    id: 10,
    name: "Exponential Functions",
    description: "Model growth and decay with exponential functions.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "Basic exponential functions",
        given_question: [
          { question_id: 1, question_text: "Evaluate f(x) = 2ˣ at x = 3", guide_text: "Calculate 2³." },
          { question_id: 2, question_text: "Find g(-2) where g(x) = 3ˣ", guide_text: "Remember that 3⁻² = 1/3²." },
          { question_id: 3, question_text: "What is the y-intercept of h(x) = 5ˣ?", guide_text: "Evaluate the function at x = 0." },
          { question_id: 4, question_text: "Compare f(x) = 2ˣ and g(x) = (1/2)ˣ", guide_text: "Think about growth vs. decay behavior." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Exponential growth and decay",
        given_question: [
          { question_id: 1, question_text: "A population doubles every 3 years. Write the exponential model", guide_text: "Use the form P(t) = P₀ · 2^(t/3)." },
          { question_id: 2, question_text: "Radioactive decay: half-life is 5 years. Model the remaining amount", guide_text: "Use A(t) = A₀ · (1/2)^(t/5)." },
          { question_id: 3, question_text: "Investment grows by 8% annually. Write the exponential function", guide_text: "Use A(t) = A₀(1.08)ᵗ." },
          { question_id: 4, question_text: "Temperature cools exponentially with decay rate 0.1. Model it", guide_text: "Use T(t) = T₀ · e^(-0.1t)." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Properties and graphs of exponential functions",
        given_question: [
          { question_id: 1, question_text: "What is the horizontal asymptote of f(x) = 3ˣ + 2?", guide_text: "Consider the behavior as x → -∞." },
          { question_id: 2, question_text: "Find the domain and range of g(x) = 2ˣ⁻¹", guide_text: "Exponential functions have specific domain and range patterns." },
          { question_id: 3, question_text: "Describe the transformation in h(x) = -2ˣ + 3", guide_text: "Identify reflections and vertical shifts." },
          { question_id: 4, question_text: "Solve 2ˣ = 8", guide_text: "Express 8 as a power of 2." }
        ]
      },
    ],
  },
  {
    id: 11,
    name: "Logarithmic Functions",
    description: "Work with logs, properties, and exponential-log relationships.",
    lessons: 12,
    exercises: 120,
    level: [
      { 
        category_id: 1, 
        category_question: "Basic logarithmic functions",
        given_question: [
          { question_id: 1, question_text: "Evaluate log₂ 8", guide_text: "Ask: 2 to what power equals 8?" },
          { question_id: 2, question_text: "Find log₁₀ 100", guide_text: "What power of 10 gives 100?" },
          { question_id: 3, question_text: "Calculate log₅ (1/25)", guide_text: "Express 1/25 as a power of 5." },
          { question_id: 4, question_text: "What is ln e³?", guide_text: "Natural log and e are inverse operations." }
        ]
      },
      { 
        category_id: 2, 
        category_question: "Properties of logarithms",
        given_question: [
          { question_id: 1, question_text: "Expand log(xy) using logarithm properties", guide_text: "Use the product rule: log(xy) = log x + log y." },
          { question_id: 2, question_text: "Simplify log₃ 9 + log₃ 3", guide_text: "Use the product property in reverse." },
          { question_id: 3, question_text: "Express log(x/y) in terms of log x and log y", guide_text: "Use the quotient rule for logarithms." },
          { question_id: 4, question_text: "Expand log₂(x³y)", guide_text: "Apply both product and power rules." }
        ]
      },
      { 
        category_id: 3, 
        category_question: "Solving logarithmic equations",
        given_question: [
          { question_id: 1, question_text: "Solve log₂ x = 5", guide_text: "Convert to exponential form: x = 2⁵." },
          { question_id: 2, question_text: "Find x: log x + log(x - 3) = 1", guide_text: "Use properties to combine logs, then solve." },
          { question_id: 3, question_text: "Solve ln(x + 1) = 2", guide_text: "Use the definition of natural logarithm." },
          { question_id: 4, question_text: "Find x: log₃(x + 6) - log₃(x - 2) = 2", guide_text: "Use the quotient property, then solve." }
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
  lessons: number;
  exercises: number;
};

export const getTopicsAsCourses = (): Course[] => {
  return defaultTopics.map(topic => ({
    id: topic.id,
    title: topic.name,
    description: topic.description,
    lessons: topic.lessons,
    exercises: topic.exercises
  }));
};

// Legacy exports for backward compatibility
export const courses = getTopicsAsCourses();
export const getCourseById = (id: number): Course | undefined => {
  const topic = getTopicById(id);
  return topic ? {
    id: topic.id,
    title: topic.name,
    description: topic.description,
    lessons: topic.lessons,
    exercises: topic.exercises
  } : undefined;
};