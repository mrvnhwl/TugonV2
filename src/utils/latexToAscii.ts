/**
 * Converts LaTeX mathematical expressions to readable ASCII format
 * Examples:
 *   "\\frac{a}{b}" → "(a/b)"
 *   "x^2" → "x²"
 *   "\\sqrt{x}" → "√(x)"
 *   "g(5) = 2(5) - 8" → "g(5) = 2(5) - 8"
 */
export function convertLatexToAscii(latex: string): string {
  if (!latex) return '';

  let result = latex;

  // Handle fractions: \frac{numerator}{denominator}
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');

  // Handle square roots: \sqrt{expression}
  result = result.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Handle nth roots: \sqrt[n]{expression}
  result = result.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)');

  // Handle superscripts: x^{2} or x^2
  result = result.replace(/\^(\d)/g, (_match, p1) => {
    const superscripts: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return superscripts[p1] || `^${p1}`;
  });
  result = result.replace(/\^\{([^}]+)\}/g, '^($1)');

  // Handle subscripts: x_{i} or x_i
  result = result.replace(/_\{([^}]+)\}/g, '_($1)');
  result = result.replace(/_(\w)/g, '_$1');

  // Greek letters
  const greekLetters: Record<string, string> = {
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
    '\\epsilon': 'ε', '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ',
    '\\pi': 'π', '\\sigma': 'σ', '\\phi': 'φ', '\\omega': 'ω',
    '\\Delta': 'Δ', '\\Gamma': 'Γ', '\\Omega': 'Ω', '\\Theta': 'Θ'
  };

  Object.entries(greekLetters).forEach(([latex, unicode]) => {
    result = result.replace(new RegExp(latex, 'g'), unicode);
  });

  // Math operators and symbols
  const symbols: Record<string, string> = {
    '\\times': '×',
    '\\div': '÷',
    '\\cdot': '·',
    '\\pm': '±',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\infty': '∞',
    '\\sum': 'Σ',
    '\\prod': 'Π',
    '\\int': '∫',
    '\\partial': '∂'
  };

  Object.entries(symbols).forEach(([latex, unicode]) => {
    result = result.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), unicode);
  });

  // Remove remaining backslashes from unknown commands
  result = result.replace(/\\([a-zA-Z]+)/g, '$1');

  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Creates a scaffold (fill-in-the-blank) hint from the correct answer
 * Replaces key numbers or variables with "___" to guide the student
 */
export function createScaffold(correctAnswer: string): string {
  if (!correctAnswer) return '';

  // Convert LaTeX to ASCII first
  const ascii = convertLatexToAscii(correctAnswer);

  // Find the last number in the expression (usually the result)
  const lastNumberMatch = ascii.match(/(-?\d+(?:\.\d+)?)(?!.*\d)/);

  if (lastNumberMatch) {
    const lastNumber = lastNumberMatch[0];
    const lastNumberIndex = ascii.lastIndexOf(lastNumber);

    // Replace only the last occurrence
    return ascii.substring(0, lastNumberIndex) + '___' + ascii.substring(lastNumberIndex + lastNumber.length);
  }

  // If no number found, try to find last variable or operator before equal sign
  const beforeEqual = ascii.split('=')[0];
  const afterEqual = ascii.split('=')[1];

  if (afterEqual) {
    // Find last number in the calculation part
    const calcNumberMatch = afterEqual.match(/(-?\d+(?:\.\d+)?)/g);
    if (calcNumberMatch && calcNumberMatch.length > 0) {
      const lastCalcNumber = calcNumberMatch[calcNumberMatch.length - 1];
      const lastIndex = afterEqual.lastIndexOf(lastCalcNumber);
      const scaffoldedAfter = afterEqual.substring(0, lastIndex) + '___' + afterEqual.substring(lastIndex + lastCalcNumber.length);
      return beforeEqual + '=' + scaffoldedAfter;
    }
  }

  // Fallback: just append "= ___" to the expression
  return ascii.includes('=') ? ascii.replace(/=.*$/, '= ___') : ascii + ' = ___';
}
