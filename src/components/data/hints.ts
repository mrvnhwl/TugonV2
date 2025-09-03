// Hint categories for different interaction types
export interface HintCategories {
  correct: string[];          // Success messages
  wrong: string[];           // Incorrect attempt messages  
  ai: string[];              // AI-generated contextual hints
  warning: string[];         // Caution/guidance messages
  detection: string[];       // Spam/behavior detection messages
  idle: string[];           // Timeout/nudge messages
  progressive: string[];     // Escalating hints based on attempt count
}

// Hints organized by topic -> category -> question structure
export interface QuestionHints {
  question_id: number;
  hints: HintCategories;
}

export interface CategoryHints {
  category_id: number;
  category_name: string;
  questions: QuestionHints[];
  // Fallback hints if specific question hints aren't found
  fallback_hints: HintCategories;
}

export interface TopicHints {
  topic_id: number;
  topic_name: string;
  categories: CategoryHints[];
  // General topic-level hints
  general_hints: HintCategories;
}

// Default hint templates that can be used across all questions
export const defaultHintTemplates: HintCategories = {
  correct: [
    "Excellent work! 🎉 You solved it correctly.",
    "Perfect! You got the right answer.",
    "Great job! That's exactly right.",
    "Wonderful! Your solution is correct.",
    "Outstanding! You nailed it!"
  ],
  wrong: [
    "Not quite right. Let's try a different approach.",
    "That's not correct. Review your steps and try again.",
    "Close, but not quite. Check your calculation.",
    "Incorrect. Take another look at the problem.",
    "Try again. Consider reviewing the concept first."
  ],
  ai: [
    "Let me help you think through this step by step...",
    "Here's a hint to guide you in the right direction...",
    "Consider this approach to solve the problem...",
    "Try breaking down the problem this way...",
    "Here's a strategy that might help..."
  ],
  warning: [
    "Take your time and think carefully about each step.",
    "Remember to check your work before submitting.",
    "Make sure you understand the question before proceeding.",
    "Double-check your calculations.",
    "Consider if your answer makes sense in context."
  ],
  detection: [
    "Please slow down and take time to think through your answer.",
    "Rapid typing detected. Take a moment to consider your response.",
    "Input temporarily disabled. Please wait a moment before continuing.",
    "Too many quick attempts. Let's take a brief pause.",
    "Please avoid copy-pasting. Try solving step by step."
  ],
  idle: [
    "Need help getting started? Try breaking down the problem into smaller steps.",
    "Still working on it? Consider reviewing the question again.",
    "Take your time. Think about what the question is asking.",
    "Stuck? Try a different approach or ask for a hint.",
    "Need a nudge? Remember the key concepts we've covered."
  ],
  progressive: [
    "Think about the basic concept involved here.",
    "Look more carefully at the specific numbers or conditions.",
    "Try working through this step by step.",
    "Consider using the method we practiced earlier.",
    "Remember the fundamental rule that applies here."
  ]
};

// Organized hints data following question.ts structure
export const hintsData: TopicHints[] = [
  {
    topic_id: 1,
    topic_name: "Introduction to Functions",
    general_hints: {
      correct: [
        "Excellent! You understand the function concept well.",
        "Perfect! You can identify functions correctly.",
        "Great work on function identification!"
      ],
      wrong: [
        "Remember: a function assigns exactly one output to each input.",
        "Check if any x-value is paired with multiple y-values.",
        "Review the definition of a function."
      ],
      ai: [
        "Think about the definition of a function: each input has exactly one output.",
        "For relations to be functions, no x-value can repeat with different y-values.",
        "Use the vertical line test for graphs, or check for repeated x-values in coordinates."
      ],
      warning: [
        "Pay attention to repeated x-values.",
        "Make sure you understand what makes a relation a function."
      ],
      detection: defaultHintTemplates.detection,
      idle: [
        "Remember: functions have a special input-output relationship.",
        "Think about what happens when one input gives multiple outputs."
      ],
      progressive: [
        "Start by looking at the x-values (inputs).",
        "Check if any x-value appears more than once.",
        "If an x-value repeats, do the y-values match?",
        "Apply the function definition: one input, one output.",
        "Use the vertical line test concept."
      ]
    },
    categories: [
      {
        category_id: 1,
        category_name: "Is the relation a function?",
        fallback_hints: {
          correct: ["Right! You correctly identified whether this relation is a function."],
          wrong: ["Not quite. Look for repeated x-values with different y-values."],
          ai: ["Check if any x-value repeats with different y-values."],
          warning: ["Be careful to check all coordinate pairs."],
          detection: defaultHintTemplates.detection,
          idle: ["Think about the function definition..."],
          progressive: ["Look at the x-values...", "Check for repetitions...", "Apply the function rule..."]
        },
        questions: [
          {
            question_id: 1,
            hints: {
              correct: [
                "Correct! In {(1,2),(2,3),(3,4),(2,5)}, x=2 appears twice with different y-values, so it's NOT a function.",
                "Exactly right! You spotted that x=2 maps to both 3 and 5."
              ],
              wrong: [
                "Look more carefully - does any x-value repeat with different y-values?",
                "Check x=2 in the relation {(1,2),(2,3),(3,4),(2,5)} - what do you notice?"
              ],
              ai: [
                "Focus on the coordinate pair (2,3) and (2,5). What does this tell you about whether this is a function?",
                "The key insight: x=2 is paired with both y=3 and y=5. Functions can't have this."
              ],
              warning: [
                "Double-check each x-value to see if it appears more than once.",
                "Remember: if one input gives two different outputs, it's not a function."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Think about what happens when x=2...",
                "Check each coordinate pair carefully."
              ],
              progressive: [
                "Start by listing all the x-values: 1, 2, 3, 2",
                "Notice that x=2 appears twice",
                "Check what y-values are paired with x=2",
                "You'll find (2,3) and (2,5) - two different outputs for the same input",
                "This violates the function definition"
              ]
            }
          },
          {
            question_id: 2,
            hints: {
              correct: [
                "Perfect! {(0,1),(1,2),(2,3),(3,4)} IS a function because each x-value is unique.",
                "Excellent! All x-values are different, so this is indeed a function."
              ],
              wrong: [
                "Look again - are there any repeated x-values in {(0,1),(1,2),(2,3),(3,4)}?",
                "Check each x-value: 0, 1, 2, 3 - do any repeat?"
              ],
              ai: [
                "Examine the x-values: 0, 1, 2, 3. Since each appears only once, this IS a function.",
                "Each input (x-value) has exactly one output (y-value), which is the definition of a function."
              ],
              warning: [
                "Make sure you're checking for repeated x-values, not y-values.",
                "Functions can have repeated y-values, but not repeated x-values with different y-values."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Count how many times each x-value appears...",
                "Think about the function definition."
              ],
              progressive: [
                "List the x-values: 0, 1, 2, 3",
                "Check if any x-value repeats",
                "Since no x-value repeats, each input has exactly one output",
                "This satisfies the function definition",
                "Therefore, this relation IS a function"
              ]
            }
          },
          {
            question_id: 3,
            hints: {
              correct: [
                "Right! {(1,1),(2,2),(3,3),(1,4)} is NOT a function because x=1 appears with both y=1 and y=4.",
                "Correct! You identified that x=1 maps to two different y-values."
              ],
              wrong: [
                "Look at x=1 - how many different y-values is it paired with?",
                "Check the coordinates (1,1) and (1,4) - what's the problem here?"
              ],
              ai: [
                "The issue is with x=1: it's paired with both y=1 and y=4. Functions can't have this.",
                "When one input gives multiple outputs, it violates the function definition."
              ],
              warning: [
                "Pay special attention to coordinate pairs that start with the same x-value.",
                "Remember: repeated x-values with different y-values mean it's not a function."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Focus on the x-values that appear more than once...",
                "What happens when x=1?"
              ],
              progressive: [
                "Identify the x-values: 1, 2, 3, 1",
                "Notice x=1 appears twice",
                "Check the y-values for x=1: we have (1,1) and (1,4)",
                "So x=1 gives both y=1 and y=4",
                "This means it's NOT a function"
              ]
            }
          },
          {
            question_id: 4,
            hints: {
              correct: [
                "Excellent! {(5,6),(7,8),(9,10),(11,12)} IS a function - all x-values are unique.",
                "Perfect! Every x-value appears exactly once, making this a valid function."
              ],
              wrong: [
                "Check again - do any x-values repeat in {(5,6),(7,8),(9,10),(11,12)}?",
                "Look at the x-values: 5, 7, 9, 11 - are they all different?"
              ],
              ai: [
                "The x-values are 5, 7, 9, and 11 - all unique. This makes it a function.",
                "Since no x-value repeats, each input has exactly one output."
              ],
              warning: [
                "Double-check that you're looking at x-values (first numbers) not y-values.",
                "Functions require unique inputs, not necessarily unique outputs."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Examine each x-value in the relation...",
                "Think about uniqueness of inputs."
              ],
              progressive: [
                "List all x-values: 5, 7, 9, 11",
                "Check if any x-value appears more than once",
                "All x-values are different",
                "Each input has exactly one output",
                "This IS a function"
              ]
            }
          }
        ]
      },
      {
        category_id: 2,
        category_name: "Is the graph a function?",
        fallback_hints: {
          correct: ["Great! You correctly applied the vertical line test."],
          wrong: ["Remember the vertical line test: if any vertical line crosses the graph more than once, it's not a function."],
          ai: ["Use the vertical line test to determine if the graph represents a function."],
          warning: ["Make sure you understand how to apply the vertical line test."],
          detection: defaultHintTemplates.detection,
          idle: ["Think about the vertical line test..."],
          progressive: ["Imagine drawing vertical lines...", "Check if any line crosses twice...", "Apply the vertical line test rule..."]
        },
        questions: [
          {
            question_id: 1,
            hints: {
              correct: [
                "Correct! A vertical line at x=3 would intersect the graph at multiple points, so it's NOT a function.",
                "Right! Vertical lines fail the vertical line test."
              ],
              wrong: [
                "Think about what happens when you draw a vertical line through this graph.",
                "A vertical line crosses the same x-value at multiple y-values."
              ],
              ai: [
                "For a vertical line at x=3, every y-value would be on the line. This means one input (x=3) has infinite outputs.",
                "The vertical line test fails because any vertical line intersects this graph at infinitely many points."
              ],
              warning: [
                "Remember: vertical lines always fail the function test.",
                "One x-value cannot correspond to multiple y-values in a function."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Imagine drawing vertical lines across this graph...",
                "What happens at x=3?"
              ],
              progressive: [
                "This is a vertical line at x=3",
                "Imagine drawing another vertical line anywhere on this graph",
                "It would intersect at every point on the original line",
                "This means one x-value has many y-values",
                "Therefore, it's NOT a function"
              ]
            }
          },
          {
            question_id: 2,
            hints: {
              correct: [
                "Perfect! A parabola opening upward passes the vertical line test - it IS a function.",
                "Excellent! Each x-value corresponds to exactly one y-value."
              ],
              wrong: [
                "Try the vertical line test - does any vertical line cross the parabola more than once?",
                "For a parabola opening upward, each x-value has only one y-value."
              ],
              ai: [
                "A parabola opening upward passes the vertical line test because vertical lines intersect it at most once.",
                "Even though it's curved, each x-value still gives exactly one y-value."
              ],
              warning: [
                "Don't confuse this with a parabola opening sideways.",
                "Focus on whether vertical lines cross the graph multiple times."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Apply the vertical line test to the parabola...",
                "Think about how many times a vertical line can cross."
              ],
              progressive: [
                "This is a parabola that opens upward",
                "Draw imaginary vertical lines from left to right",
                "Each vertical line crosses the parabola at most once",
                "Some lines might not intersect at all, but none intersect twice",
                "This passes the vertical line test, so it IS a function"
              ]
            }
          },
          {
            question_id: 3,
            hints: {
              correct: [
                "Correct! A circle fails the vertical line test - it's NOT a function.",
                "Right! Vertical lines through the center cross the circle at two points."
              ],
              wrong: [
                "Draw a vertical line through the center of the circle - how many times does it intersect?",
                "Most vertical lines will cross a circle at two different points."
              ],
              ai: [
                "A circle fails the vertical line test because vertical lines (except at the edges) intersect it at two points.",
                "For example, a vertical line through the center crosses the circle at the top and bottom."
              ],
              warning: [
                "Remember that circles are not functions in their standard form.",
                "Think about what happens when you draw vertical lines through different parts of the circle."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Visualize drawing vertical lines through the circle...",
                "Where do they intersect?"
              ],
              progressive: [
                "This is a circle centered at the origin",
                "Draw a vertical line through the center",
                "It intersects the circle at two points (top and bottom)",
                "This means one x-value gives two y-values",
                "Therefore, it's NOT a function"
              ]
            }
          },
          {
            question_id: 4,
            hints: {
              correct: [
                "Excellent! A horizontal line passes the vertical line test - it IS a function.",
                "Perfect! Each x-value corresponds to the same y-value (y=5)."
              ],
              wrong: [
                "Apply the vertical line test - does any vertical line cross this horizontal line more than once?",
                "A horizontal line at y=5 means every x-value gives the same y-value."
              ],
              ai: [
                "A horizontal line passes the vertical line test because each vertical line intersects it exactly once.",
                "Even though all y-values are the same (y=5), each x-value still has exactly one corresponding y-value."
              ],
              warning: [
                "Don't confuse horizontal lines (which are functions) with vertical lines (which are not).",
                "Functions can have the same y-value for different x-values."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "Think about how vertical lines intersect with horizontal lines...",
                "Apply the vertical line test."
              ],
              progressive: [
                "This is a horizontal line at y=5",
                "Draw imaginary vertical lines across the graph",
                "Each vertical line intersects the horizontal line exactly once",
                "Every x-value gives the same output (y=5), but that's still exactly one output",
                "This passes the vertical line test, so it IS a function"
              ]
            }
          }
        ]
      }
    ]
  },
  {
    topic_id: 2,
    topic_name: "Evaluating Functions",
    general_hints: {
      correct: [
        "Great work on function evaluation!",
        "Perfect! You substituted correctly and calculated accurately.",
        "Excellent function evaluation skills!"
      ],
      wrong: [
        "Remember to substitute the given value for x in the function.",
        "Check your arithmetic - make sure you calculated correctly.",
        "Follow the order of operations when evaluating."
      ],
      ai: [
        "To evaluate a function, substitute the given value for every x in the function expression.",
        "Remember to follow the order of operations: parentheses, exponents, multiplication/division, addition/subtraction.",
        "Double-check your substitution and arithmetic."
      ],
      warning: [
        "Be careful with negative numbers when substituting.",
        "Don't forget to apply exponents before other operations.",
        "Make sure you substitute the value for ALL instances of x."
      ],
      detection: defaultHintTemplates.detection,
      idle: [
        "Remember: substitute the value for x and calculate.",
        "Think about the order of operations."
      ],
      progressive: [
        "Start by identifying what value to substitute for x.",
        "Replace every x in the function with that value.",
        "Follow the order of operations to calculate.",
        "Double-check your arithmetic.",
        "Simplify to get your final answer."
      ]
    },
    categories: [
      {
        category_id: 1,
        category_name: "g(x)=x+5. Find g(7).",
        fallback_hints: {
          correct: ["Correct! You substituted and calculated properly."],
          wrong: ["Remember: substitute 7 for x in g(x) = x + 5."],
          ai: ["Replace x with the given value and calculate."],
          warning: ["Make sure you substitute correctly."],
          detection: defaultHintTemplates.detection,
          idle: ["Think about substitution..."],
          progressive: ["Substitute the value...", "Add carefully...", "Check your arithmetic..."]
        },
        questions: [
          {
            question_id: 1,
            hints: {
              correct: [
                "Perfect! g(7) = 7 + 5 = 12",
                "Excellent! You correctly substituted 7 for x and got 12."
              ],
              wrong: [
                "Try substituting 7 for x in g(x) = x + 5. What do you get?",
                "Remember: g(7) means replace x with 7 in the function g(x) = x + 5."
              ],
              ai: [
                "Start with g(x) = x + 5, then substitute x = 7: g(7) = 7 + 5 = 12",
                "The process is: g(7) = 7 + 5. Now just add: 7 + 5 = 12."
              ],
              warning: [
                "Make sure you're adding, not multiplying.",
                "Double-check your basic arithmetic."
              ],
              detection: defaultHintTemplates.detection,
              idle: [
                "What is 7 + 5?",
                "Substitute 7 for x..."
              ],
              progressive: [
                "You have g(x) = x + 5 and need to find g(7)",
                "Substitute 7 for x: g(7) = 7 + 5",
                "Now calculate: 7 + 5 = 12",
                "Therefore, g(7) = 12"
              ]
            }
          }
        ]
      }
    ]
  }
  // Add more topics as needed...
];

// Helper functions to retrieve hints
export function getHintsForQuestion(topicId: number, categoryId: number, questionId: number): HintCategories | null {
  const topic = hintsData.find(t => t.topic_id === topicId);
  if (!topic) return null;

  const category = topic.categories.find(c => c.category_id === categoryId);
  if (!category) return null;

  const question = category.questions.find(q => q.question_id === questionId);
  return question ? question.hints : category.fallback_hints;
}

export function getRandomHint(hints: string[]): string {
  if (hints.length === 0) return "Keep trying!";
  return hints[Math.floor(Math.random() * hints.length)];
}

export function getProgressiveHint(hints: string[], attemptNumber: number): string {
  if (hints.length === 0) return "Keep trying!";
  const index = Math.min(attemptNumber - 1, hints.length - 1);
  return hints[index];
}

// Context-aware hint getter
export function getContextualHint(
  topicId: number, 
  categoryId: number, 
  questionId: number, 
  type: keyof HintCategories,
  attemptNumber: number = 0
): string {
  const questionHints = getHintsForQuestion(topicId, categoryId, questionId);
  
  if (!questionHints) {
    return getRandomHint(defaultHintTemplates[type]);
  }

  const hints = questionHints[type];
  
  if (type === 'progressive') {
    return getProgressiveHint(hints, attemptNumber);
  }
  
  return getRandomHint(hints);
}