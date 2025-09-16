// Central predefined answers database
// Each question corresponds to the structure in question.ts

export type Step = {
  label: "substitution" | "simplification" | "final" | "math" | "text";
  answer: string;
};

export type PredefinedAnswer = {
  questionId: number; // Add explicit question ID
  questionText?: string; // Add question text for reference/validation
  type: "multiLine";
  steps: Step[];
};

// Topic 1: Introduction to Functions
// Category 1: INPUT OUTPUT - Guess the output


// Category 1: RELATION A FUNCTION OR NOT?
export const Topic1_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "RELATION OR NOT 1",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" },
      { label: "text", answer: "The x-value 2 maps to both 3 and 5" }
    ]
  },
  {
    questionId: 2,
    questionText: "RELATION OR NOT 2",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Yes" },
      { label: "text", answer: "Each x-value maps to only one y-value" }
    ]
  },
  {
    questionId: 3,
    questionText: "RELATION OR NOT 3",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" },
      { label: "text", answer: "The x-value 1 maps to both 1 and 4" }
    ]
  },
];

// Category 2: GRAPH A FUNCTION OR NOT?
export const Topic1_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Graph 1",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" },
      { label: "text", answer: "Vertical line fails the vertical line test" }
    ]
  },
  {
    questionId: 2,
    questionText: "Graph 2", 
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Yes" },
      { label: "text", answer: "Passes the vertical line test" }
    ]
  },
  {
    questionId: 3,
    questionText: "Graph 3",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "No" },
      { label: "text", answer: "Vertical lines through the circle intersect at two points" }
    ]
  },
];

// Category 3: IDENTIFY FUNCTION NOTATION
export const Topic1_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "y=2x+5",
    type: "multiLine",
    steps: [
      { label: "text", answer: "f(x) = 2x + 5" },
      { label: "text", answer: "Linear function notation" }
    ]
  },
  {
    questionId: 2,
    questionText: "x/y?",
    type: "multiLine",
    steps: [
      { label: "text", answer: "f(x) = x/y" },
      { label: "text", answer: "Rational function notation" }
    ]
  },
  {
    questionId: 3,
    questionText: "square root of x+9",
    type: "multiLine",
    steps: [
      { label: "text", answer: "f(x) = √(x + 9)" },
      { label: "text", answer: "Square root function notation" }
    ]
  },
  {
    questionId: 4,
    questionText: "Real numbers",
    type: "multiLine",
    steps: [
      { label: "text", answer: "f: ℝ → ℝ" },
      { label: "text", answer: "Function mapping real numbers to real numbers" }
    ]
  },
];

// Category 4: COMPLETE THE TABLE
export const Topic1_Category4_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "y=2x+5",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Complete table for y = 2x + 5" },
      { label: "text", answer: "Substitute x values and calculate y" }
    ]
  },
  {
    questionId: 2,
    questionText: "x/y?",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Complete ratio table" },
      { label: "text", answer: "Calculate corresponding values" }
    ]
  },
  {
    questionId: 3,
    questionText: "square root of x+9",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Complete table for √(x + 9)" },
      { label: "text", answer: "Ensure x + 9 ≥ 0" }
    ]
  },
  {
    questionId: 4,
    questionText: "Real numbers",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Complete real number table" },
      { label: "text", answer: "Use appropriate domain values" }
    ]
  },
];

// Category 5: IDENTIFY THE TYPE OF EQUATION
export const Topic1_Category5_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "y=2x+5",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Linear equation" },
      { label: "text", answer: "Form: y = mx + b" }
    ]
  },
  {
    questionId: 2,
    questionText: "x/y?",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Rational equation" },
      { label: "text", answer: "Form: f(x) = P(x)/Q(x)" }
    ]
  },
  {
    questionId: 3,
    questionText: "square root of x+9",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Square root equation" },
      { label: "text", answer: "Form: f(x) = √(expression)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Real numbers",
    type: "multiLine",
    steps: [
      { label: "text", answer: "Identity function" },
      { label: "text", answer: "Form: f(x) = x" }
    ]
  },
];

// Topic 2: Evaluating Functions
// Category 1: g(x)=x+5. Find g(7)
export const Topic2_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "g(x) = x + 5. Find g(7)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "7 + 5" }, // Fixed from "(7)/(5)"
      { label: "final", answer: "12" }
    ]
  },
  {
    questionId: 2,
    questionText: "g(x) = 35 -(x-2). Find g(3)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "35-(3-2)" },
      { label: "simplification", answer: "35 - 1" },
      { label: "final", answer: "34" }
    ]
  },
  {
    questionId: 3,
    questionText: "g(x) = 52x+51. Find g(-2)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "52(-2) + 51" },
      { label: "simplification", answer: "-104 + 51" },
      { label: "final", answer: "-53" }
    ]
  },
  {
    questionId: 4,
    questionText: "g(x) = 2x+5/25. Find g(0)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "2(0) + 5/25" },
      { label: "simplification", answer: "0 + 5/25" },
      { label: "final", answer: "1/5" }
    ]
  },
];

// Category 2: p(x)=x^2+4. Find p(6)
export const Topic2_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "p(x) = x² + 4. Find p(6)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(6) = 6² + 4" }, // Fixed from "6(6)+4"
      { label: "simplification", answer: "p(6) = 36 + 4" },
      { label: "final", answer: "40" }
    ]
  },
  {
    questionId: 2,
    questionText: "p(x) = x² + 4. Find p(3)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(3) = 3² + 4" },
      { label: "simplification", answer: "p(3) = 9 + 4" },
      { label: "final", answer: "13" }
    ]
  },
  {
    questionId: 3,
    questionText: "p(x) = x² + 4. Find p(-1)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(-1) = (-1)² + 4" },
      { label: "simplification", answer: "p(-1) = 1 + 4" },
      { label: "final", answer: "5" }
    ]
  },
  {
    questionId: 4,
    questionText: "p(x) = x² + 4. Find p(0)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "p(0) = 0² + 4" },
      { label: "simplification", answer: "p(0) = 0 + 4" },
      { label: "final", answer: "4" }
    ]
  },
];

// Category 3: f(x)=2x^2-3x+1. Find f(-2)
export const Topic2_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "f(x) = 2x² - 3x + 1. Find f(-2)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(-2) = 2(-2)² - 3(-2) + 1" },
      { label: "simplification", answer: "f(-2) = 2(4) + 6 + 1" },
      { label: "simplification", answer: "f(-2) = 8 + 6 + 1" },
      { label: "final", answer: "15" }
    ]
  },
  {
    questionId: 2,
    questionText: "f(x) = 2x² - 3x + 1. Find f(1)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(1) = 2(1)² - 3(1) + 1" },
      { label: "simplification", answer: "f(1) = 2 - 3 + 1" },
      { label: "final", answer: "0" }
    ]
  },
  {
    questionId: 3,
    questionText: "f(x) = 2x² - 3x + 1. Find f(3)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(3) = 2(3)² - 3(3) + 1" },
      { label: "simplification", answer: "f(3) = 2(9) - 9 + 1" },
      { label: "simplification", answer: "f(3) = 18 - 9 + 1" },
      { label: "final", answer: "10" }
    ]
  },
  {
    questionId: 4,
    questionText: "f(x) = 2x² - 3x + 1. Find f(0)",
    type: "multiLine",
    steps: [
      { label: "substitution", answer: "f(0) = 2(0)² - 3(0) + 1" },
      { label: "simplification", answer: "f(0) = 0 - 0 + 1" },
      { label: "final", answer: "1" }
    ]
  },
];

// Topic 3: Piecewise-Defined Functions
export const Topic3_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(-2)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since -2 < 0, use f(x) = x + 1" },
      { label: "substitution", answer: "f(-2) = -2 + 1" },
      { label: "final", answer: "-1" }
    ]
  },
  {
    questionId: 2,
    questionText: "f(x) = {x+1 if x<0, x² if x≥0}. Find f(3)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since 3 ≥ 0, use f(x) = x²" },
      { label: "substitution", answer: "f(3) = 3²" },
      { label: "final", answer: "9" }
    ]
  },
  {
    questionId: 3,
    questionText: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(1)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since 1 ≤ 1, use f(x) = 2x" },
      { label: "substitution", answer: "f(1) = 2(1)" },
      { label: "final", answer: "2" }
    ]
  },
  {
    questionId: 4,
    questionText: "f(x) = {2x if x≤1, x+3 if x>1}. Find f(4)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Since 4 > 1, use f(x) = x + 3" },
      { label: "substitution", answer: "f(4) = 4 + 3" },
      { label: "final", answer: "7" }
    ]
  },
];

export const Topic3_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "What is the domain of f(x) = {x² if x<0, √x if x≥0}?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x < 0: no restrictions" },
      { label: "text", answer: "For x ≥ 0: need x ≥ 0 for √x" },
      { label: "final", answer: "Domain: all real numbers" }
    ]
  },
  {
    questionId: 2,
    questionText: "What is the range of f(x) = {-x if x≤0, x if x>0}?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x ≤ 0: f(x) = -x ≥ 0" },
      { label: "text", answer: "For x > 0: f(x) = x > 0" },
      { label: "final", answer: "Range: [0, ∞)" }
    ]
  },
  {
    questionId: 3,
    questionText: "Is f(x) = {x+1 if x<2, x-1 if x≥2} continuous at x=2?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Left limit: lim(x→2⁻) f(x) = 2 + 1 = 3" },
      { label: "text", answer: "Right limit: lim(x→2⁺) f(x) = 2 - 1 = 1" },
      { label: "final", answer: "Not continuous (limits don't match)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Find the discontinuities of f(x) = {1/x if x≠0, 0 if x=0}",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "At x = 0: lim(x→0) 1/x does not exist" },
      { label: "text", answer: "Function value at x = 0 is defined as 0" },
      { label: "final", answer: "Discontinuous at x = 0" }
    ]
  },
];

export const Topic3_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Sketch f(x) = {x if x≤1, 2-x if x>1}",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x ≤ 1: line y = x" },
      { label: "text", answer: "For x > 1: line y = 2 - x" },
      { label: "final", answer: "Two line segments meeting at (1,1)" }
    ]
  },
  {
    questionId: 2,
    questionText: "Graph f(x) = {x² if x<0, x if x≥0}",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "For x < 0: parabola y = x²" },
      { label: "text", answer: "For x ≥ 0: line y = x" },
      { label: "final", answer: "Parabola and line meeting at origin" }
    ]
  },
  {
    questionId: 3,
    questionText: "What type of discontinuity exists at x=1 for f(x) = {x if x<1, x+1 if x≥1}?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Left limit: lim(x→1⁻) f(x) = 1" },
      { label: "text", answer: "Right limit: lim(x→1⁺) f(x) = 2" },
      { label: "final", answer: "Jump discontinuity" }
    ]
  },
  {
    questionId: 4,
    questionText: "Sketch the absolute value function |x| as a piecewise function",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "|x| = {-x if x < 0, x if x ≥ 0}" },
      { label: "text", answer: "V-shaped graph" },
      { label: "final", answer: "Vertex at origin, continuous everywhere" }
    ]
  },
];

// Topic 4: Operations on Functions
export const Topic4_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x + 2 and g(x) = x - 1, find (f + g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f + g)(x) = (x + 2) + (x - 1)" },
      { label: "simplification", answer: "(f + g)(x) = x + 2 + x - 1" },
      { label: "final", answer: "(f + g)(x) = 2x + 1" }
    ]
  },
  {
    questionId: 2,
    questionText: "If f(x) = 2x and g(x) = x², find (f - g)(3)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "f(3) = 2(3) = 6, g(3) = 3² = 9" },
      { label: "simplification", answer: "(f - g)(3) = f(3) - g(3) = 6 - 9" },
      { label: "final", answer: "(f - g)(3) = -3" }
    ]
  },
  {
    questionId: 3,
    questionText: "If h(x) = x² + 1 and k(x) = 2x - 3, find (h + k)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(h + k)(x) = (x² + 1) + (2x - 3)" },
      { label: "simplification", answer: "(h + k)(x) = x² + 1 + 2x - 3" },
      { label: "final", answer: "(h + k)(x) = x² + 2x - 2" }
    ]
  },
  {
    questionId: 4,
    questionText: "Given f(x) = 3x and g(x) = x + 4, what is (g - f)(2)?",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "g(2) = 2 + 4 = 6, f(2) = 3(2) = 6" },
      { label: "simplification", answer: "(g - f)(2) = g(2) - f(2) = 6 - 6" },
      { label: "final", answer: "(g - f)(2) = 0" }
    ]
  },
];

export const Topic4_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x and g(x) = x + 1, find (f · g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f · g)(x) = x(x + 1)" },
      { label: "simplification", answer: "(f · g)(x) = x² + x" },
      { label: "final", answer: "(f · g)(x) = x² + x" }
    ]
  },
  {
    questionId: 2,
    questionText: "If f(x) = x² and g(x) = x - 2, find (f/g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f/g)(x) = x²/(x - 2)" },
      { label: "text", answer: "Domain restriction: x ≠ 2" },
      { label: "final", answer: "(f/g)(x) = x²/(x - 2), x ≠ 2" }
    ]
  },
  {
    questionId: 3,
    questionText: "Given h(x) = 2x and k(x) = x + 3, what is (h · k)(1)?",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "h(1) = 2(1) = 2, k(1) = 1 + 3 = 4" },
      { label: "simplification", answer: "(h · k)(1) = h(1) · k(1) = 2 · 4" },
      { label: "final", answer: "(h · k)(1) = 8" }
    ]
  },
  {
    questionId: 4,
    questionText: "If p(x) = x² + 4 and q(x) = x + 2, find the domain of (p/q)(x)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need q(x) ≠ 0" },
      { label: "substitution", answer: "x + 2 ≠ 0" },
      { label: "final", answer: "Domain: all real numbers except x = -2" }
    ]
  },
];

export const Topic4_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Find the domain of f(x) + g(x) where f(x) = √x and g(x) = 1/x",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) requires x ≥ 0" },
      { label: "text", answer: "g(x) requires x ≠ 0" },
      { label: "final", answer: "Domain: x > 0 (intersection of domains)" }
    ]
  },
  {
    questionId: 2,
    questionText: "What is the domain of (f/g)(x) where f(x) = x² and g(x) = x - 3?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) = x² has domain: all real numbers" },
      { label: "text", answer: "Need g(x) ≠ 0, so x - 3 ≠ 0" },
      { label: "final", answer: "Domain: all real numbers except x = 3" }
    ]
  },
  {
    questionId: 3,
    questionText: "If f(x) = √(x-1) and g(x) = √(x+2), find the domain of (f · g)(x)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) requires x - 1 ≥ 0, so x ≥ 1" },
      { label: "text", answer: "g(x) requires x + 2 ≥ 0, so x ≥ -2" },
      { label: "final", answer: "Domain: x ≥ 1 (intersection of domains)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Determine the domain of h(x) - k(x) where h(x) = 1/(x-2) and k(x) = x",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "h(x) requires x - 2 ≠ 0, so x ≠ 2" },
      { label: "text", answer: "k(x) = x has domain: all real numbers" },
      { label: "final", answer: "Domain: all real numbers except x = 2" }
    ]
  },
];

// Topic 5: Composition of Functions
export const Topic5_Category1_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "If f(x) = x + 1 and g(x) = 2x, find (f ∘ g)(x)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f ∘ g)(x) = f(g(x)) = f(2x)" },
      { label: "simplification", answer: "f(2x) = 2x + 1" },
      { label: "final", answer: "(f ∘ g)(x) = 2x + 1" }
    ]
  },
  {
    questionId: 2,
    questionText: "Given f(x) = x² and g(x) = x - 3, find (g ∘ f)(2)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "f(2) = 2² = 4" },
      { label: "simplification", answer: "(g ∘ f)(2) = g(f(2)) = g(4)" },
      { label: "final", answer: "g(4) = 4 - 3 = 1" }
    ]
  },
  {
    questionId: 3,
    questionText: "If h(x) = √x and k(x) = x + 4, find (h ∘ k)(5)",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "k(5) = 5 + 4 = 9" },
      { label: "simplification", answer: "(h ∘ k)(5) = h(k(5)) = h(9)" },
      { label: "final", answer: "h(9) = √9 = 3" }
    ]
  },
  {
    questionId: 4,
    questionText: "For f(x) = 3x and g(x) = x², what is (f ∘ g)(x)?",
    type: "multiLine", 
    steps: [
      { label: "substitution", answer: "(f ∘ g)(x) = f(g(x)) = f(x²)" },
      { label: "simplification", answer: "f(x²) = 3(x²)" },
      { label: "final", answer: "(f ∘ g)(x) = 3x²" }
    ]
  },
];

export const Topic5_Category2_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Find the domain of (f ∘ g)(x) where f(x) = √x and g(x) = x - 2",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need g(x) ≥ 0 for f(g(x)) to be defined" },
      { label: "substitution", answer: "x - 2 ≥ 0" },
      { label: "final", answer: "Domain: x ≥ 2" }
    ]
  },
  {
    questionId: 2,
    questionText: "What is the domain of (g ∘ f)(x) where f(x) = 1/x and g(x) = x + 1?",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "f(x) requires x ≠ 0" },
      { label: "text", answer: "g(f(x)) = g(1/x) = 1/x + 1 is defined for all 1/x" },
      { label: "final", answer: "Domain: x ≠ 0" }
    ]
  },
  {
    questionId: 3,
    questionText: "If f(x) = √(x+3) and g(x) = x², find the domain of (f ∘ g)(x)",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need g(x) + 3 ≥ 0 for f(g(x)) to be defined" },
      { label: "substitution", answer: "x² + 3 ≥ 0" },
      { label: "final", answer: "Domain: all real numbers (x² + 3 ≥ 3 > 0)" }
    ]
  },
  {
    questionId: 4,
    questionText: "Determine the domain of (h ∘ k)(x) where h(x) = 1/(x-1) and k(x) = x + 2",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Need k(x) ≠ 1 for h(k(x)) to be defined" },
      { label: "substitution", answer: "x + 2 ≠ 1, so x ≠ -1" },
      { label: "final", answer: "Domain: all real numbers except x = -1" }
    ]
  },
];

export const Topic5_Category3_Answers: PredefinedAnswer[] = [
  {
    questionId: 1,
    questionText: "Express h(x) = (x + 3)² as a composition f(g(x))",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Let g(x) = x + 3 (inner function)" },
      { label: "text", answer: "Let f(x) = x² (outer function)" },
      { label: "final", answer: "h(x) = f(g(x)) where f(x) = x², g(x) = x + 3" }
    ]
  },
  {
    questionId: 2,
    questionText: "Decompose F(x) = √(2x - 1) into two simpler functions",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Let g(x) = 2x - 1 (inner function)" },
      { label: "text", answer: "Let f(x) = √x (outer function)" },
      { label: "final", answer: "F(x) = f(g(x)) where f(x) = √x, g(x) = 2x - 1" }
    ]
  },
  {
    questionId: 3,
    questionText: "Write H(x) = 1/(x² + 4) as a composition",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Let g(x) = x² + 4 (inner function)" },
      { label: "text", answer: "Let f(x) = 1/x (outer function)" },
      { label: "final", answer: "H(x) = f(g(x)) where f(x) = 1/x, g(x) = x² + 4" }
    ]
  },
  {
    questionId: 4,
    questionText: "Express G(x) = |x - 5| as f(g(x)) where g(x) = x - 5",
    type: "multiLine", 
    steps: [
      { label: "text", answer: "Given g(x) = x - 5" },
      { label: "text", answer: "Need f(x) = |x| (absolute value function)" },
      { label: "final", answer: "G(x) = f(g(x)) where f(x) = |x|, g(x) = x - 5" }
    ]
  },
];

// Update the lookup structure to include all categories
export const answersByTopicAndCategory = {
  1: { // Introduction to Functions
    1: Topic1_Category1_Answers,
    2: Topic1_Category2_Answers,
    3: Topic1_Category3_Answers,
    4: Topic1_Category4_Answers,
    6: Topic1_Category5_Answers,
  
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
  // ... continue for other topics
} as const;

// Updated helper function to use questionId
export function getAnswerForQuestion(
  topicId: number,
  categoryId: number,
  questionId: number
): Step[] | undefined {
  const topic = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
  if (!topic) return undefined;
  
  const category = topic[categoryId as keyof typeof topic];
  if (!category || !Array.isArray(category)) return undefined;
  
  // Find answer by questionId instead of array index
  const answer = category.find(answer => answer.questionId === questionId);
  return answer?.steps; // ← This should return Step[], not PredefinedAnswer[]
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

// Validation function to check mapping integrity
export function validateAnswerMapping() {
  const validationErrors: string[] = [];
  
  Object.entries(answersByTopicAndCategory).forEach(([topicId, categories]) => {
    Object.entries(categories).forEach(([categoryId, answers]) => {
      if (Array.isArray(answers)) {
        answers.forEach((answer, index) => {
          if (!answer.questionId) {
            validationErrors.push(
              `Missing questionId for Topic ${topicId}, Category ${categoryId}, Answer ${index + 1}`
            );
          }
          if (!answer.questionText) {
            validationErrors.push(
              `Missing questionText for Topic ${topicId}, Category ${categoryId}, Question ${answer.questionId}`
            );
          }
        });
      }
    });
  });
  
  if (validationErrors.length > 0) {
    console.error('Answer mapping validation errors:', validationErrors);
  }
  
  return validationErrors.length === 0;
}

// Backward compatibility - export for existing components
export const predefinedAnswers = Topic2_Category1_Answers;