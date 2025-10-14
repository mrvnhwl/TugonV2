/**
 * Convert LaTeX symbols and commands to readable text descriptions
 * Useful for accessibility and text-based feedback
 */

/**
 * Convert LaTeX notation to human-readable text
 * Examples:
 *   "x^2" → "x to the power of 2"
 *   "\\frac{a}{b}" → "a over b"
 *   "\\sqrt{x}" → "square root of x"
 */
export function convertLatexToReadableText(latex: string): string {
  if (!latex) return '';

  let text = latex;

  // 1. Convert fractions: \frac{numerator}{denominator} → "numerator over denominator"
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');

  // 2. Convert square roots: \sqrt{expression} → "square root of expression"
  text = text.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');

  // 3. Convert nth roots: \sqrt[n]{expression} → "nth root of expression"
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1th root of $2');

  // 4. Convert superscripts: x^{2} or x^2 → "x to the power of 2"
  text = text.replace(/([a-zA-Z0-9]+)\^\{([^}]+)\}/g, '$1 to the power of $2');
  text = text.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9])/g, '$1 to the power of $2');

  // 5. Convert subscripts: x_{i} or x_i → "x sub i"
  text = text.replace(/([a-zA-Z0-9]+)_\{([^}]+)\}/g, '$1 sub $2');
  text = text.replace(/([a-zA-Z0-9]+)_([a-zA-Z0-9])/g, '$1 sub $2');

  // 6. Greek letters
  const greekLetters: Record<string, string> = {
    '\\alpha': 'alpha',
    '\\beta': 'beta',
    '\\gamma': 'gamma',
    '\\delta': 'delta',
    '\\epsilon': 'epsilon',
    '\\theta': 'theta',
    '\\lambda': 'lambda',
    '\\mu': 'mu',
    '\\pi': 'pi',
    '\\sigma': 'sigma',
    '\\phi': 'phi',
    '\\omega': 'omega',
    '\\Delta': 'Delta',
    '\\Gamma': 'Gamma',
    '\\Omega': 'Omega',
    '\\Theta': 'Theta'
  };

  Object.entries(greekLetters).forEach(([latex, text_name]) => {
    text = text.replace(new RegExp(latex, 'g'), text_name);
  });

  // 7. Math operators and symbols
  const operators: Record<string, string> = {
    '\\times': 'times',
    '\\div': 'divided by',
    '\\cdot': 'dot',
    '\\pm': 'plus or minus',
    '\\leq': 'less than or equal to',
    '\\geq': 'greater than or equal to',
    '\\neq': 'not equal to',
    '\\approx': 'approximately equal to',
    '\\infty': 'infinity',
    '\\sum': 'sum',
    '\\prod': 'product',
    '\\int': 'integral',
    '\\partial': 'partial derivative',
    '\\leftarrow': 'left arrow',
    '\\rightarrow': 'right arrow',
    '\\Leftarrow': 'left double arrow',
    '\\Rightarrow': 'right double arrow',
    '\\leftrightarrow': 'left right arrow'
  };

  Object.entries(operators).forEach(([latex, text_name]) => {
    text = text.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), text_name);
  });

  // 8. Special functions
  text = text.replace(/\\sin/g, 'sine of');
  text = text.replace(/\\cos/g, 'cosine of');
  text = text.replace(/\\tan/g, 'tangent of');
  text = text.replace(/\\log/g, 'log of');
  text = text.replace(/\\ln/g, 'natural log of');
  text = text.replace(/\\lim/g, 'limit');

  // 9. Remove remaining backslashes from unknown commands
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');

  // 10. Clean up extra spaces and braces
  text = text.replace(/\{/g, '');
  text = text.replace(/\}/g, '');
  text = text.replace(/\s+/g, ' ');
  text = text.trim();

  return text;
}

/**
 * Convert token (which may contain LaTeX) to readable text
 * Used for displaying tokens in feedback overlays
 */
export function convertTokenToReadableText(token: string): string {
  if (!token) return '';

  // Check if token looks like LaTeX (contains backslash or caret)
  const hasLatex = token.includes('\\') || token.includes('^') || token.includes('_');
  
  if (!hasLatex) {
    return token; // Return as-is if no LaTeX detected
  }

  return convertLatexToReadableText(token);
}

/**
 * Get a short, friendly description of a LaTeX expression
 * Useful for tooltips and hints
 */
export function getLatexDescription(latex: string): string {
  if (!latex) return '';

  const text = convertLatexToReadableText(latex);
  
  // Add contextual hints
  if (latex.includes('^')) {
    return `${text} (using exponent)`;
  }
  if (latex.includes('\\frac')) {
    return `${text} (as a fraction)`;
  }
  if (latex.includes('\\sqrt')) {
    return `${text} (using root)`;
  }
  
  return text;
}

export default {
  convertLatexToReadableText,
  convertTokenToReadableText,
  getLatexDescription
};
