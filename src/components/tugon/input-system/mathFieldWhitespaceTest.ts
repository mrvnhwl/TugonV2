// Test to verify MathField whitespace cleaning works properly
import { InputValidator } from './UserInputValidator';

export function testMathFieldWhitespaceCleanup(): void {
  console.log('=== Testing MathField Whitespace Cleanup ===');
  
  const testCases = [
    {
      name: 'Regular spaces',
      input: 'x + 2',
      description: 'Normal spaces should be cleaned'
    },
    {
      name: 'NBSP characters',
      input: 'x\u00A0+\u00A02',
      description: 'Non-breaking spaces should be cleaned'
    },
    {
      name: 'ZWSP characters',
      input: 'x\u200B+\u200B2',
      description: 'Zero-width spaces should be cleaned'
    },
    {
      name: 'BOM character',
      input: '\uFEFFx+2',
      description: 'Byte Order Mark should be cleaned'
    },
    {
      name: 'Quote characters',
      input: '"x+2"',
      description: 'Quote characters should be cleaned'
    },
    {
      name: 'LaTeX with spaces',
      input: '\\frac{ 2 }{ 3 }',
      description: 'LaTeX expressions with spaces should be cleaned'
    },
    {
      name: 'Mixed invisible chars',
      input: '\u00A0x\u200B+\u20602\uFEFF',
      description: 'Mixed invisible characters should be cleaned'
    }
  ];
  
  testCases.forEach(test => {
    const result = InputValidator.sanitizeTextMathLive(test.input);
    
    console.log(`\n${test.name}:`);
    console.log(`  Input: "${test.input}"`);
    console.log(`  Result: "${result}"`);
    console.log(`  Description: ${test.description}`);
    
    // Check that result doesn't contain whitespace or invisible characters
    const hasWhitespace = /\s/.test(result);
    const hasInvisibleChars = /[\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/.test(result);
    const hasQuotes = /"/g.test(result);
    
    console.log(`  ✅ No whitespace: ${!hasWhitespace}`);
    console.log(`  ✅ No invisible chars: ${!hasInvisibleChars}`);
    console.log(`  ✅ No quotes: ${!hasQuotes}`);
  });
  
  console.log('\n=== MathField Whitespace Cleanup Test Complete ===');
}