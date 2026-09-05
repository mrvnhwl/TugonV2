/**
 * FeedbackModal - LaTeX Color Stripping Test Cases
 * 
 * Manual test cases to verify that:
 * 1. All \textcolor{color}{content} commands are stripped
 * 2. Color keywords (red, green, teal, etc.) are removed
 * 3. Words like "textcolor" are removed
 * 4. Curly brackets "{}" are properly handled
 * 5. Final output is clean LaTeX/ASCII
 */

import { stripColorCommands } from '../input-system/mathColorComparison';
import { convertLatexToAscii } from '@/utils/latexToAscii';

/**
 * Clean LaTeX string by:
 * 1. Stripping all \textcolor{color}{content} commands
 * 2. Removing color words (red, green, teal, etc.)
 * 3. Removing extra braces and whitespace
 */
function cleanLatexForDisplay(latex: string): string {
  if (!latex) return '';
  
  // Step 1: Strip all color commands
  let cleaned = stripColorCommands(latex);
  
  // Step 2: Remove any remaining color-related keywords
  const colorKeywords = ['red', 'green', 'blue', 'yellow', 'teal', 'orange', 'purple', 'pink', 'gray', 'black'];
  colorKeywords.forEach(color => {
    // Remove standalone color words
    cleaned = cleaned.replace(new RegExp(`\\b${color}\\b`, 'gi'), '');
  });
  
  // Step 3: Remove "textcolor" word if it somehow remains
  cleaned = cleaned.replace(/textcolor/gi, '');
  
  // Step 4: Remove empty braces and extra whitespace
  cleaned = cleaned.replace(/\{\s*\}/g, ''); // Remove empty {}
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// ============================================================================
// TEST CASE RUNNER (Console-based)
// ============================================================================

export function runFeedbackModalTests() {
  console.log('🧪 Running FeedbackModal Color Stripping Tests...\n');

  const tests = [
    // Test 1: Single color command
    {
      name: 'Single color command',
      input: '\\textcolor{red}{5}',
      expected: '5',
      shouldNotContain: ['textcolor', 'red', '{', '}']
    },
    
    // Test 2: Multiple color commands
    {
      name: 'Multiple color commands',
      input: '\\textcolor{red}{x} + \\textcolor{green}{5}',
      expected: 'x + 5',
      shouldNotContain: ['textcolor', 'red', 'green']
    },
    
    // Test 3: Nested color commands
    {
      name: 'Nested color commands',
      input: '\\textcolor{red}{\\textcolor{green}{x}}',
      expected: 'x',
      shouldNotContain: ['textcolor', 'red', 'green']
    },
    
    // Test 4: Complex math expression with colors
    {
      name: 'Complex expression with colors',
      input: '\\textcolor{red}{2} \\times \\textcolor{green}{(-3)} - \\textcolor{teal}{8}',
      expected: '2 \\times (-3) - 8',
      shouldNotContain: ['textcolor', 'red', 'green', 'teal']
    },
    
    // Test 5: Fraction with colors
    {
      name: 'Fraction with colors',
      input: '\\frac{\\textcolor{red}{x}}{\\textcolor{green}{5}}',
      expected: '\\frac{x}{5}',
      shouldNotContain: ['textcolor', 'red', 'green']
    },
    
    // Test 6: Function evaluation with colors
    {
      name: 'Function evaluation',
      input: 'g(\\textcolor{red}{5}) = \\textcolor{green}{2}(\\textcolor{red}{5}) - \\textcolor{teal}{8}',
      expected: 'g(5) = 2(5) - 8',
      shouldNotContain: ['textcolor', 'red', 'green', 'teal']
    },
    
    // Test 7: Empty input
    {
      name: 'Empty input',
      input: '',
      expected: '',
      shouldNotContain: []
    },
    
    // Test 8: Input without colors
    {
      name: 'Input without colors',
      input: 'x + 5',
      expected: 'x + 5',
      shouldNotContain: ['textcolor']
    },
    
    // Test 9: Empty braces
    {
      name: 'Empty braces',
      input: 'x + {} 5 {}',
      expected: 'x + 5',
      shouldNotContain: ['{', '}']
    },
    
    // Test 10: Deeply nested colors (5 levels)
    {
      name: 'Deeply nested colors',
      input: '\\textcolor{red}{\\textcolor{green}{\\textcolor{blue}{\\textcolor{yellow}{\\textcolor{teal}{x}}}}}',
      expected: 'x',
      shouldNotContain: ['textcolor', 'red', 'green', 'blue', 'yellow', 'teal']
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.name}`);
    console.log(`Input: "${test.input}"`);
    
    const result = cleanLatexForDisplay(test.input);
    console.log(`Output: "${result}"`);
    console.log(`Expected: "${test.expected}"`);
    
    // Check if output matches expected
    const outputMatches = result === test.expected;
    
    // Check if forbidden strings are absent
    const forbiddenFound = test.shouldNotContain.filter(str => result.includes(str));
    const noForbidden = forbiddenFound.length === 0;
    
    if (outputMatches && noForbidden) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      if (!outputMatches) {
        console.log(`   Expected: "${test.expected}"`);
        console.log(`   Got: "${result}"`);
      }
      if (!noForbidden) {
        console.log(`   Found forbidden strings: ${forbiddenFound.join(', ')}`);
      }
      failed++;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Tests Complete: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);

  return { passed, failed, total: tests.length };
}

// ============================================================================
// INTEGRATION TESTS (cleanLatexForDisplay + convertLatexToAscii)
// ============================================================================

export function runIntegrationTests() {
  console.log('🧪 Running Integration Tests (LaTeX → Clean → ASCII)...\n');

  const tests = [
    {
      name: 'Colored addition to ASCII',
      input: '\\textcolor{red}{5} + \\textcolor{green}{3}',
      expectedAscii: '5 + 3',
      shouldNotContain: ['textcolor', 'red', 'green', '{', '}']
    },
    {
      name: 'Colored fraction to ASCII',
      input: '\\frac{\\textcolor{red}{x}}{\\textcolor{green}{5}}',
      expectedAscii: '(x/5)',
      shouldNotContain: ['textcolor', 'red', 'green']
    },
    {
      name: 'Function evaluation to ASCII',
      input: 'g(\\textcolor{red}{5}) = \\textcolor{green}{2}(\\textcolor{red}{5}) - \\textcolor{teal}{8}',
      expectedAscii: 'g(5) = 2(5) - 8',
      shouldNotContain: ['textcolor', 'red', 'green', 'teal']
    },
    {
      name: 'Piecewise function component',
      input: 'f(\\textcolor{red}{-3}) = \\textcolor{green}{-3 + 2}',
      expectedAscii: 'f(-3) = -3 + 2',
      shouldNotContain: ['textcolor', 'red', 'green']
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    console.log(`\nIntegration Test ${index + 1}: ${test.name}`);
    console.log(`Input: "${test.input}"`);
    
    const cleaned = cleanLatexForDisplay(test.input);
    const ascii = convertLatexToAscii(cleaned);
    
    console.log(`Cleaned LaTeX: "${cleaned}"`);
    console.log(`ASCII Output: "${ascii}"`);
    console.log(`Expected: "${test.expectedAscii}"`);
    
    const outputMatches = ascii === test.expectedAscii;
    const forbiddenFound = test.shouldNotContain.filter(str => ascii.includes(str));
    const noForbidden = forbiddenFound.length === 0;
    
    if (outputMatches && noForbidden) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      if (!outputMatches) {
        console.log(`   Expected: "${test.expectedAscii}"`);
        console.log(`   Got: "${ascii}"`);
      }
      if (!noForbidden) {
        console.log(`   Found forbidden strings: ${forbiddenFound.join(', ')}`);
      }
      failed++;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Integration Tests Complete: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);

  return { passed, failed, total: tests.length };
}

// Export test runner
export default {
  runFeedbackModalTests,
  runIntegrationTests,
  cleanLatexForDisplay
};

