/**
 * Unit Tests for MathLive Invisible Whitespace Fix
 * Tests tokenizeMathString function to ensure it properly handles invisible Unicode characters
 */

import { tokenizeMathString } from './tokenUtils';

// Helper function to run individual tests
function runTest(testName: string, input: string, expected: string[], description?: string): boolean {
  const result = tokenizeMathString(input);
  const passed = JSON.stringify(result) === JSON.stringify(expected);
  
  console.log(`\n${testName}:`);
  if (description) console.log(`  ${description}`);
  console.log(`  Input: "${input}"`);
  console.log(`  Expected: ${JSON.stringify(expected)}`);
  console.log(`  Actual:   ${JSON.stringify(result)}`);
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return passed;
}

console.log('=== MathLive Invisible Whitespace Fix Tests ===');

let allTestsPassed = true;

// Test 1: Input with regular spaces
allTestsPassed = allTestsPassed && runTest(
  'Test 1: Regular spaces',
  'x + 2',
  ['x', '+', '2'],
  'Normal spaces should be stripped'
);

// Test 2: Input with NBSP (Non-breaking space)
allTestsPassed = allTestsPassed && runTest(
  'Test 2: NBSP \\u00A0',
  'x\u00A0+\u00A02',
  ['x', '+', '2'],
  'Non-breaking spaces should be removed'
);

// Test 3: Input with ZWSP (Zero-width space)
allTestsPassed = allTestsPassed && runTest(
  'Test 3: ZWSP \\u200B',
  'x\u200B+\u200B2',
  ['x', '+', '2'],
  'Zero-width spaces should be removed'
);

// Test 4: Input with BOM at start
allTestsPassed = allTestsPassed && runTest(
  'Test 4: BOM \\uFEFF',
  '\uFEFFx+2',
  ['x', '+', '2'],
  'Byte Order Mark should be removed'
);

// Test 5: Mixed LaTeX with spaces
allTestsPassed = allTestsPassed && runTest(
  'Test 5: Mixed LaTeX with spaces',
  '\\frac{ 1 }{ 2 }',
  ['\\frac', '{', '1', '}', '{', '2', '}'],
  'LaTeX commands with spaces should tokenize correctly'
);

// Test 6: Mixed LaTeX with invisible characters
allTestsPassed = allTestsPassed && runTest(
  'Test 6: Mixed LaTeX with invisible chars',
  '\\frac{\u00A01\u200B}{\u00A02\uFEFF}',
  ['\\frac', '{', '1', '}', '{', '2', '}'],
  'LaTeX commands with invisible chars should tokenize correctly'
);

// Test 7: Negative numbers (regression test)
allTestsPassed = allTestsPassed && runTest(
  'Test 7: Negative numbers',
  '-5 + x',
  ['-5', '+', 'x'],
  'Negative numbers should still work correctly'
);

// Test 8: Decimals (regression test)
allTestsPassed = allTestsPassed && runTest(  
  'Test 8: Decimal numbers',
  '3.14 * x',
  ['3.14', '*', 'x'],
  'Decimal numbers should still work correctly'
);

// Test 9: Variables with coefficients (regression test)
allTestsPassed = allTestsPassed && runTest(
  'Test 9: Variables with coefficients',
  '2x + 3y',
  ['2', 'x', '+', '3', 'y'],
  'Variables with coefficients should still work correctly'
);

// Test 10: Complex expression with mixed whitespace
allTestsPassed = allTestsPassed && runTest(
  'Test 10: Complex expression with mixed whitespace',
  '2x^2\u00A0+\u200B3x\uFEFF-\u00A01',
  ['2', 'x', '^', '2', '+', '3', 'x', '-', '1'],
  'Complex expressions with mixed invisible chars should work'
);

// Test 11: Only invisible characters
allTestsPassed = allTestsPassed && runTest(
  'Test 11: Only invisible characters',
  '\u00A0\u200B\uFEFF',
  [],
  'String with only invisible characters should return empty array'
);

// Test 12: Empty string (regression test)
allTestsPassed = allTestsPassed && runTest(
  'Test 12: Empty string',
  '',
  [],
  'Empty string should return empty array'
);

// Test 13: LaTeX commands with invisible chars in command name (edge case)
allTestsPassed = allTestsPassed && runTest(
  'Test 13: LaTeX commands resilience',
  '\\frac{2}{3} + \\sqrt{4}',
  ['\\frac', '{', '2', '}', '{', '3', '}', '+', '\\sqrt', '{', '4', '}'],
  'Multiple LaTeX commands should work correctly'
);

// Test 14: Negative decimals with invisible chars
allTestsPassed = allTestsPassed && runTest(
  'Test 14: Negative decimals with invisible chars',
  '-3.14\u00A0+\u200B2.7',
  ['-3.14', '+', '2.7'],
  'Negative decimals with invisible chars should work'
);

console.log('\n=== Test Summary ===');
console.log(`All tests passed: ${allTestsPassed ? '✅ YES' : '❌ NO'}`);

if (!allTestsPassed) {
  console.log('\n❌ Some tests failed. Please check the implementation.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! The invisible whitespace fix is working correctly.');
}