/**
 * Test file for Token Feedback System
 * 
 * This file contains test cases to validate the tokenization and feedback system.
 * Run these tests to ensure the implementation works correctly.
 */

import { tokenizeMathString, generateTokenFeedback, getTokenFeedbackHint, isTokenFeedbackComplete } from './tokenUtils';

// Test cases for tokenization
const tokenizationTests = [
  {
    input: "35+7x",
    expected: ["35", "+", "7", "x"],
    description: "Simple expression with number, operator, and variable"
  },
  {
    input: "\\frac{2}{35}",
    expected: ["\\frac", "{", "2", "}", "{", "35", "}"],
    description: "LaTeX fraction"
  },
  {
    input: "2x^2 + 3x - 1",
    expected: ["2", "x", "^", "2", "+", "3", "x", "-", "1"],
    description: "Quadratic expression with spaces"
  },
  {
    input: "-5 + 3.14x",
    expected: ["-5", "+", "3.14", "x"],
    description: "Negative number at start and decimal"
  },
  {
    input: "3-5",
    expected: ["3", "-", "5"],
    description: "Subtraction operator between numbers"
  },
  {
    input: "(-7)",
    expected: ["(", "-7", ")"],
    description: "Negative number in parentheses"
  },
  {
    input: "x + -2y",
    expected: ["x", "+", "-2", "y"],
    description: "Negative coefficient after operator"
  },
  {
    input: "\\frac{-2}{3}",
    expected: ["\\frac", "{", "-2", "}", "{", "3", "}"],
    description: "Negative number in LaTeX fraction numerator"
  },
  {
    input: "5^-2",
    expected: ["5", "^", "-2"],
    description: "Negative exponent"
  },
  {
    input: "\\sqrt{25} = 5",
    expected: ["\\sqrt", "{", "25", "}", "=", "5"],
    description: "Square root with equals"
  }
];

// Test cases for feedback generation
const feedbackTests = [
  {
    userInput: "x+3",
    expectedAnswer: "x+2",
    description: "Example 1: user='x+3', expected='x+2' - one wrong token"
  },
  {
    userInput: "5+2x",
    expectedAnswer: "2x+5",
    description: "Example 2: user='5+2x', expected='2x+5' - all tokens misplaced"
  },
  {
    userInput: "\\frac{2}{1}",
    expectedAnswer: "\\frac{1}{2}",
    description: "Example 3: LaTeX fraction with swapped numerator/denominator"
  },
  {
    userInput: "x+2",
    expectedAnswer: "x+2",
    description: "Perfect match"
  },
  {
    userInput: "x+2+y",
    expectedAnswer: "x+2",
    description: "Extra tokens"
  },
  {
    userInput: "x",
    expectedAnswer: "x+2",
    description: "Incomplete input"
  }
];

// Fraction tokenization tests - as specified in the plan
const fractionTokenTests = [
  {
    input: "1/2",
    expected: ["1", "/", "2"],
    description: "Simple fraction"
  },
  {
    input: "3/4+5/6",
    expected: ["3", "/", "4", "+", "5", "/", "6"],
    description: "Two fractions with addition"
  },
  {
    input: "(x+1)/(y-2)",
    expected: ["(", "x", "+", "1", ")", "/", "(", "y", "-", "2", ")"],
    description: "Complex fraction with parentheses"
  },
  {
    input: "12/34",
    expected: ["12", "/", "34"],
    description: "Multi-digit fraction"
  },
  {
    input: "1/2+3x",
    expected: ["1", "/", "2", "+", "3", "x"],
    description: "Fraction with variable term"
  },
  {
    input: "x/y+2/3",
    expected: ["x", "/", "y", "+", "2", "/", "3"],
    description: "Variable fraction with number fraction"
  }
];

// Enhanced tokenization tests for negative numbers vs minus operators
const enhancedTokenTests = [
  {
    input: "-5",
    expected: ["-5"],
    description: "Negative number at start"
  },
  {
    input: "3-5", 
    expected: ["3", "-", "5"],
    description: "Subtraction between positive numbers"
  },
  {
    input: "x+-5",
    expected: ["x", "+", "-5"], 
    description: "Negative number after addition operator"
  },
  {
    input: "(-7)",
    expected: ["(", "-7", ")"],
    description: "Negative number in parentheses"
  },
  {
    input: "\\frac{-2}{3}",
    expected: ["\\frac", "{", "-2", "}", "{", "3", "}"],
    description: "Negative in LaTeX fraction"
  },
  {
    input: "2*-3",
    expected: ["2", "*", "-3"],
    description: "Negative number after multiplication"
  },
  {
    input: "x^-2",
    expected: ["x", "^", "-2"],
    description: "Negative exponent"
  }
];

console.log("=== FRACTION TOKENIZATION TESTS ===");
for (const test of fractionTokenTests) {
  const result = tokenizeMathString(test.input);
  const passed = JSON.stringify(result) === JSON.stringify(test.expected);
  
  console.log(`\n${test.description}`);
  console.log(`Input: "${test.input}"`);
  console.log(`Expected: [${test.expected.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Got: [${result.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
}

console.log("\n\n=== ENHANCED NEGATIVE NUMBER TOKENIZATION TESTS ===");
for (const test of enhancedTokenTests) {
  const result = tokenizeMathString(test.input);
  const passed = JSON.stringify(result) === JSON.stringify(test.expected);
  
  console.log(`\n${test.description}`);
  console.log(`Input: "${test.input}"`);
  console.log(`Expected: [${test.expected.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Got: [${result.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
}

// Run tokenization tests
console.log("\n\n=== ORIGINAL TOKENIZATION TESTS ===");
for (const test of tokenizationTests) {
  const result = tokenizeMathString(test.input);
  const passed = JSON.stringify(result) === JSON.stringify(test.expected);
  
  console.log(`\n${test.description}`);
  console.log(`Input: "${test.input}"`);
  console.log(`Expected: [${test.expected.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Got: [${result.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
}

// Run feedback tests
console.log("\n\n=== FEEDBACK TESTS ===");
for (const test of feedbackTests) {
  const userTokens = tokenizeMathString(test.userInput);
  const expectedTokens = tokenizeMathString(test.expectedAnswer);
  const feedback = generateTokenFeedback(userTokens, expectedTokens);
  const hint = getTokenFeedbackHint(feedback, userTokens, expectedTokens);
  const isComplete = isTokenFeedbackComplete(feedback, expectedTokens.length);
  
  console.log(`\n${test.description}`);
  console.log(`User: "${test.userInput}" → [${userTokens.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Expected: "${test.expectedAnswer}" → [${expectedTokens.map(t => `"${t}"`).join(', ')}]`);
  console.log(`Feedback:`);
  
  feedback.forEach((f, i) => {
    const statusEmoji = {
      green: '🟩',
      yellow: '🟨', 
      red: '🟥',
      grey: '⬜'
    }[f.status];
    console.log(`  ${i + 1}. "${f.token}" ${statusEmoji} ${f.status}`);
  });
  
  console.log(`Hint: "${hint}"`);
  console.log(`Complete: ${isComplete ? '✅' : '❌'}`);
}

// Visual feedback representation
console.log("\n\n=== VISUAL FEEDBACK EXAMPLES ===");
const visualTests = [
  { user: "x+3", expected: "x+2" },
  { user: "5+2x", expected: "2x+5" },
  { user: "x+2", expected: "x+2" },
  { user: "-5+3", expected: "-5+2" },
  { user: "3-5", expected: "3+-2" },
  { user: "(-7)", expected: "(-8)" }
];

for (const test of visualTests) {
  const userTokens = tokenizeMathString(test.user);
  const expectedTokens = tokenizeMathString(test.expected);
  const feedback = generateTokenFeedback(userTokens, expectedTokens);
  
  console.log(`\nUser: "${test.user}" vs Expected: "${test.expected}"`);
  
  const visualFeedback = feedback.map(f => {
    const emoji = {
      green: '🟩',
      yellow: '🟨',
      red: '🟥', 
      grey: '⬜'
    }[f.status];
    return `${emoji}${f.token}`;
  }).join('   ');
  
  console.log(`Visual: ${visualFeedback}`);
}

export {};