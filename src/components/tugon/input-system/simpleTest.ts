// Simple test to verify tokenizeMathString works with invisible characters
// This can be run by importing into any component and calling runSimpleTest()

import { tokenizeMathString } from './tokenUtils';

export function runSimpleTest(): boolean {
  console.log('=== Testing tokenizeMathString with invisible characters ===');
  
  const tests = [
    {
      name: 'Regular spaces',
      input: 'x + 2',
      expected: ['x', '+', '2']
    },
    {
      name: 'NBSP (\\u00A0)',
      input: 'x\u00A0+\u00A02',
      expected: ['x', '+', '2']
    },
    {
      name: 'ZWSP (\\u200B)',
      input: 'x\u200B+\u200B2',
      expected: ['x', '+', '2']
    },
    {
      name: 'BOM (\\uFEFF)',
      input: '\uFEFFx+2',
      expected: ['x', '+', '2']
    },
    {
      name: 'Mixed invisible chars',
      input: '2x^2\u00A0+\u200B3x\uFEFF-\u00A01',
      expected: ['2', 'x', '^', '2', '+', '3', 'x', '-', '1']
    },
    {
      name: 'LaTeX with spaces',
      input: '\\frac{ 1 }{ 2 }',
      expected: ['\\frac', '{', '1', '}', '{', '2', '}']
    },
    {
      name: 'Negative numbers',
      input: '-5 + x',
      expected: ['-5', '+', 'x']
    },
    {
      name: 'Decimals',
      input: '3.14 * x',
      expected: ['3.14', '*', 'x']
    },
    {
      name: 'Quote characters',
      input: 'x"+"2',
      expected: ['x', '+', '2']
    },
    {
      name: 'Quotes with spaces',
      input: '"x + 2"',
      expected: ['x', '+', '2']
    }
  ];
  
  let allPassed = true;
  
  tests.forEach(test => {
    const result = tokenizeMathString(test.input);
    const passed = JSON.stringify(result) === JSON.stringify(test.expected);
    
    console.log(`\n${test.name}:`);
    console.log(`  Input: "${test.input}"`);
    console.log(`  Expected: ${JSON.stringify(test.expected)}`);
    console.log(`  Actual:   ${JSON.stringify(result)}`);
    console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!passed) allPassed = false;
  });
  
  console.log(`\n=== Summary ===`);
  console.log(`All tests passed: ${allPassed ? '✅ YES' : '❌ NO'}`);
  
  return allPassed;
}