// src/utils/mathConverter.ts
export function convertToLatex(text: string): string {
  if (!text) return text;
  
  let converted = text;
  
  // Common math function conversions
  const conversions = [
    // Square root - handle both formats
    { pattern: /sqrt\(([^)]+)\)/g, replacement: '\\sqrt{$1}' },
    { pattern: /sqrt\{([^}]+)\}/g, replacement: '\\sqrt{$1}' },
    { pattern: /square root of ([^,\s]+)/gi, replacement: '\\sqrt{$1}' },
    
    // Fractions - IMPROVED PATTERNS
    // Handle simple fractions like "1/x", "3/x", "2x/x+1"
    { pattern: /(\d+)\/([a-zA-Z]+)/g, replacement: '\\frac{$1}{$2}' }, // 1/x, 3/x
    { pattern: /(\d+)\/(\d+)/g, replacement: '\\frac{$1}{$2}' }, // 1/2, 3/4
    { pattern: /([a-zA-Z]+)\/([a-zA-Z]+)/g, replacement: '\\frac{$1}{$2}' }, // x/y
    
    // Complex fractions with parentheses or operations
    { pattern: /(\d+[a-zA-Z]*)\/\(([^)]+)\)/g, replacement: '\\frac{$1}{$2}' }, // 2x/(x+1)
    { pattern: /([a-zA-Z]+)\/([a-zA-Z]+\+\d+)/g, replacement: '\\frac{$1}{$2}' }, // x/x+1
    { pattern: /([a-zA-Z]+)\/([a-zA-Z]+\-\d+)/g, replacement: '\\frac{$1}{$2}' }, // x/x-4
    
    // Specific patterns from your data
    { pattern: /(\d+)\/([a-zA-Z]+)-(\d+)/g, replacement: '\\frac{$1}{$2}-$3' }, // 3/x-4
    { pattern: /(\d+)\/([a-zA-Z]+\([a-zA-Z]+\-\d+\))/g, replacement: '\\frac{$1}{$2}' }, // 5/x(x-3)
    { pattern: /(\d+[a-zA-Z]*)\/([a-zA-Z]+\+\d+)/g, replacement: '\\frac{$1}{$2}' }, // 2x/x+1
    
    // Exponents
    { pattern: /\^(\d+)/g, replacement: '^{$1}' },
    { pattern: /\^([a-zA-Z])/g, replacement: '^{$1}' },
    { pattern: /([a-zA-Z]+)²/g, replacement: '$1^{2}' }, // Handle ² symbol
    
    // Subscripts
    { pattern: /_(\d+)/g, replacement: '_{$1}' },
    { pattern: /_([a-zA-Z])/g, replacement: '_{$1}' },
    
    // Special symbols
    { pattern: /\+\-/g, replacement: '\\pm' },
    { pattern: /\-\+/g, replacement: '\\mp' },
    { pattern: /infinity/gi, replacement: '\\infty' },
    { pattern: /pi/gi, replacement: '\\pi' },
    
    // Inequalities
    { pattern: /<=/g, replacement: '\\leq' },
    { pattern: />=/g, replacement: '\\geq' },
    { pattern: /!=/g, replacement: '\\neq' },
    
    // Clean up any remaining issues
    { pattern: /\\\\/g, replacement: '\\' }, // Remove double backslashes
  ];
  
  // Apply all conversions
  conversions.forEach(({ pattern, replacement }) => {
    converted = converted.replace(pattern, replacement);
  });
  
  return converted;
}

export function createFillInBlankTemplate(categoryText: string, questionText: string): string {
  // Handle specific function evaluation patterns
  if (categoryText.includes("g(x) = x + 5") && questionText.includes("Find g(7)")) {
    return "g(\\placeholder[input]{}) = \\placeholder[substitution]{} + 5 = \\placeholder[result]{}";
  }
  
  if (categoryText.includes("g(x) = 35 -(x-2)") && questionText.includes("Find g(3)")) {
    return "g(\\placeholder[input]{}) = 35 - (\\placeholder[substitution]{} - 2) = \\placeholder[result]{}";
  }
  
  if (categoryText.includes("g(x) = 52x+51") && questionText.includes("Find g(-2)")) {
    return "g(\\placeholder[input]{}) = 52(\\placeholder[substitution]{}) + 51 = \\placeholder[result]{}";
  }
  
  // Domain questions
  if (questionText.includes("domain")) {
    return "\\text{Domain: } \\placeholder[domain]{}";
  }
  
  // Range questions
  if (questionText.includes("range")) {
    return "\\text{Range: } \\placeholder[range]{}";
  }
  
  // Default template
  return "\\placeholder[answer]{}";
}