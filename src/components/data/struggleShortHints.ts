/**
 * Get specific struggle hints for individual questions
 */
export function getSpecificStruggleHints(
  topicId: number, 
  categoryId: number, 
  questionId: number
): string[] {
  
  // Topic 1: Introduction to Functions
  if (topicId === 1) {
    // Category 1: Is the relation a function?
    if (categoryId === 1) {
      switch (questionId) {
        case 1: // {(1,2),(2,3),(3,4),(2,5)}
          return [
            "Look for any x-values that repeat. Do you see x = 2 appearing twice?",
            "Check each coordinate pair. Does x = 2 have two different y-values?",
            "A function requires each x to have only one y. Is that true here?"
          ];
        case 2: // {(0,1),(1,2),(2,3),(3,4)}
          return [
            "Check each x-value: 0, 1, 2, 3. Does each appear only once?",
            "All x-values are different, so each maps to exactly one y-value.",
            "This passes the function test - every input has exactly one output."
          ];
        case 3: // {(1,1),(2,2),(3,3),(1,4)}
          return [
            "Notice that x = 1 appears in two different pairs: (1,1) and (1,4).",
            "Can x = 1 equal both 1 and 4 at the same time in a function?",
            "The input 1 has two different outputs, which violates the function rule."
          ];
        case 4: // {(5,6),(7,8),(9,10),(11,12)}
          return [
            "Check if any x-values repeat: 5, 7, 9, 11. Are they all unique?",
            "Each x-value appears exactly once with exactly one y-value.",
            "All inputs are different, so this relation passes the function test."
          ];
      }
    }
    
    // Category 2: Is the graph a function?
    if (categoryId === 2) {
      switch (questionId) {
        case 1: // Vertical line at x = 3
          return [
            "Use the vertical line test. Draw a vertical line - does it cross the graph more than once?",
            "A vertical line crosses this graph infinitely many times at x = 3.",
            "If any vertical line crosses more than once, it's not a function."
          ];
        case 2: // Parabola opening upward
          return [
            "Try drawing vertical lines through the parabola. How many times do they cross?",
            "Each vertical line should cross the graph at most once for it to be a function.",
            "A parabola opening up or down passes the vertical line test."
          ];
        case 3: // Circle centered at origin
          return [
            "Draw a vertical line through the middle of the circle. How many intersection points?",
            "Most vertical lines through a circle will cross it twice - top and bottom.",
            "Since vertical lines can cross twice, this fails the function test."
          ];
        case 4: // Horizontal line at y = 5
          return [
            "Try the vertical line test on this horizontal line.",
            "Any vertical line will cross this horizontal line exactly once.",
            "Every x-value has exactly one y-value (which is 5)."
          ];
      }
    }
  }

  // Topic 2: Evaluating Functions
  if (topicId === 2) {
    // Category 1: g(x)=x+5. Find g(7).
    if (categoryId === 1) {
      switch (questionId) {
        case 1: // g(x) = x + 5. Find g(7)
          return [
            "Remember, g(7) means substitute 7 for every x in the function.",
            "Replace x with 7: g(7) = 7 + 5. What does that equal?",
            "The function g(x) = x + 5 becomes g(7) = ? + 5 when x = 7."
          ];
        case 2: // g(x) = x + 5. Find g(3)
          return [
            "To find g(3), substitute 3 for x in g(x) = x + 5.",
            "Think: if x = 3, then g(3) = 3 + 5. Calculate this step by step.",
            "Replace every x with 3 in the original function."
          ];
        case 3: // g(x) = x + 5. Find g(-2)
          return [
            "For g(-2), substitute -2 for x. Be careful with the negative sign!",
            "g(-2) = (-2) + 5. What's -2 + 5?",
            "Remember: when x = -2, you get g(-2) = -2 + 5."
          ];
        case 4: // g(x) = x + 5. Find g(0)
          return [
            "To find g(0), substitute 0 for x in g(x) = x + 5.",
            "What happens when you replace x with 0? g(0) = 0 + 5.",
            "This one's straightforward: g(0) = ? + 5."
          ];
      }
    }
    
    // Category 2: p(x)=x^2+4. Find p(6)
    if (categoryId === 2) {
      switch (questionId) {
        case 1: // p(x) = x² + 4. Find p(6)
          return [
            "For p(6), substitute 6 for x: p(6) = (6)² + 4.",
            "Remember to square 6 first: 6² = 36, then add 4.",
            "Break it down: p(6) = 6 × 6 + 4. Calculate step by step."
          ];
        case 2: // p(x) = x² + 4. Find p(3)
          return [
            "To find p(3), replace x with 3: p(3) = (3)² + 4.",
            "First calculate 3²: 3 × 3 = 9, then add 4.",
            "Don't forget the order of operations: square first, then add."
          ];
        case 3: // p(x) = x² + 4. Find p(-1)
          return [
            "For p(-1), be careful: p(-1) = (-1)² + 4.",
            "Remember: (-1)² = (-1) × (-1) = 1, then add 4.",
            "The square of a negative number is positive!"
          ];
        case 4: // p(x) = x² + 4. Find p(0)
          return [
            "To find p(0), substitute 0: p(0) = (0)² + 4.",
            "What's 0²? Any number times 0 is 0, so 0² = 0.",
            "This simplifies to p(0) = 0 + 4."
          ];
      }
    }
    
    // Category 3: f(x)=2x^2-3x+1. Find f(-2)
    if (categoryId === 3) {
      switch (questionId) {
        case 1: // f(x) = 2x² - 3x + 1. Find f(-2)
          return [
            "For f(-2), substitute -2 for every x: f(-2) = 2(-2)² - 3(-2) + 1.",
            "Work step by step: 2(-2)² = 2(4) = 8, and -3(-2) = 6.",
            "Break it down: f(-2) = 2 × (negative 2 squared) - 3 × (negative 2) + 1."
          ];
        case 2: // f(x) = 2x² - 3x + 1. Find f(1)
          return [
            "To find f(1), replace x with 1: f(1) = 2(1)² - 3(1) + 1.",
            "Simplify each term: 2(1)² = 2(1) = 2, and -3(1) = -3.",
            "So f(1) = 2 - 3 + 1. Add and subtract from left to right."
          ];
        case 3: // f(x) = 2x² - 3x + 1. Find f(3)
          return [
            "For f(3), substitute 3: f(3) = 2(3)² - 3(3) + 1.",
            "Calculate each part: 2(3)² = 2(9) = 18, and -3(3) = -9.",
            "Then f(3) = 18 - 9 + 1. What's the final result?"
          ];
        case 4: // f(x) = 2x² - 3x + 1. Find f(0)
          return [
            "To find f(0), substitute 0: f(0) = 2(0)² - 3(0) + 1.",
            "Remember: 2(0)² = 0 and -3(0) = 0.",
            "This simplifies to f(0) = 0 - 0 + 1 = 1."
          ];
      }
    }
  }
  
  // Return empty array if no specific hints found
  return [];
}