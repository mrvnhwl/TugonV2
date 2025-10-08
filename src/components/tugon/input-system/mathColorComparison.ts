/**
 * ================================================================================
 * 🎨 Real-Time Color Comparison for MathLive Fields
 * ================================================================================
 * 
 * Provides character-level and term-level comparison for real-time visual feedback
 * in MathLive math-field elements.
 * 
 * Pipeline: Real-time Color → Color-coded → Short Hints → Modal
 */

import { InputValidator } from './UserInputValidator';

/**
 * Tokenize mathematical expression into meaningful parts
 * Splits by numbers, variables, operators, and parentheses
 */
export function tokenizeExpression(expr: string): string[] {
  if (!expr) return [];
  
  // Match: numbers (including decimals), variables, operators, parentheses, whitespace
  const tokens = expr.match(/[0-9]+\.?[0-9]*|[a-zA-Z]+|[+\-*/^()=]|\s+/g) || [];
  return tokens.filter(token => token.trim() !== ''); // Remove empty whitespace tokens
}

/**
 * Character-level comparison
 * Useful for strict matching (e.g., "2(3)+5" case)
 * Returns LaTeX string with colored characters
 * - Green: correct character
 * - Red: incorrect character
 * - Gray: extra character beyond expected length
 */
export function compareByCharacter(expected: string, userInput: string): string {
  let result = '';
  const maxLength = Math.max(expected.length, userInput.length);

  for (let i = 0; i < maxLength; i++) {
    const char = userInput[i] || '';
    const expectedChar = expected[i] || '';
    const isCorrect = char === expectedChar && char !== '';

    // Escape special LaTeX characters
    const escapedChar = escapeLatexChar(char);

    // Skip if both are empty
    if (!char && !expectedChar) continue;

    // Color logic:
    // - Green: correct character at correct position
    // - Gray: extra character beyond expected length (user typed too much)
    // - Red: incorrect character
    let color = 'red';
    if (isCorrect) {
      color = 'green';
    } else if (i >= expected.length && char) {
      color = 'gray'; // Beyond expected length
    }
    
    result += `\\textcolor{${color}}{${escapedChar}}`;
  }

  return result;
}

/**
 * Term-level comparison
 * Better for algebraic expressions (e.g., "2x + 3" vs "x2 + 3")
 * Compares tokens rather than individual characters
 * Returns LaTeX string with colored terms
 * - Green: correct token
 * - Red: incorrect token
 * - Gray: extra token beyond expected (user typed too much)
 */
export function compareByTerm(expected: string, userInput: string): string {
  const expectedTokens = tokenizeExpression(expected);
  const userTokens = tokenizeExpression(userInput);
  let result = '';

  const maxLen = Math.max(expectedTokens.length, userTokens.length);

  for (let i = 0; i < maxLen; i++) {
    const token = userTokens[i] || '';
    const expectedToken = expectedTokens[i] || '';
    const isCorrect = token === expectedToken && token !== '';

    // Skip if both are empty
    if (!token && !expectedToken) continue;

    // Escape special LaTeX characters
    const escapedToken = escapeLatexToken(token);

    // Color logic:
    // - Green: correct token at correct position
    // - Gray: extra token beyond expected length (user typed too much)
    // - Red: incorrect token
    let color = 'red';
    if (isCorrect) {
      color = 'green';
    } else if (!expectedToken && token) {
      color = 'gray'; // Extra token beyond expected
    }

    result += `\\textcolor{${color}}{${escapedToken}}`;
  }

  return result;
}

/**
 * Escape special LaTeX characters for single character
 */
function escapeLatexChar(char: string): string {
  if (!char) return '';
  
  return char
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/#/g, '\\#')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\^{}')
    .replace(/~/g, '\\~{}');
}

/**
 * Escape special LaTeX characters for token
 */
function escapeLatexToken(token: string): string {
  if (!token) return '';
  
  // For tokens, we want to preserve mathematical operators
  return token
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
}

/**
 * Strip all color commands from LaTeX string
 * Returns plain content without \textcolor{}{} wrappers
 * 
 * Handles: \textcolor{red}{x} → x
 * Handles multiple: \textcolor{red}{x}\textcolor{green}{y} → xy
 * Handles multi-char: \textcolor{red}{color} → color
 */
/**
 * Strip all \textcolor{color}{content} commands from LaTeX
 * Iteratively removes color commands layer by layer
 * Handles nested color commands by repeating until clean
 */
export function stripColorCommands(latex: string): string {
  if (!latex) return '';
  
  let cleaned = latex;
  let previousCleaned = '';
  let iterations = 0;
  const maxIterations = 50; // Increased for complex expressions
  
  // Keep stripping until no more color commands found or max iterations reached
  while (cleaned !== previousCleaned && cleaned.includes('\\textcolor') && iterations < maxIterations) {
    previousCleaned = cleaned;
    
    // Match \textcolor{color}{content} where content doesn't contain braces
    // This handles single chars and multi-char sequences
    cleaned = cleaned.replace(/\\textcolor\{[^}]+\}\{([^{}]*)\}/g, '$1');
    
    iterations++;
  }
  
  // If we still have textcolor after max iterations, something is wrong
  if (cleaned.includes('\\textcolor')) {
    console.warn(`⚠️ Could not fully strip colors after ${iterations} iterations. Remaining: "${cleaned.substring(0, 100)}..."`);
  } else if (iterations > 0) {
    console.log(`🧹 Stripped ${iterations} layers of colors: "${latex.substring(0, 60)}..." → "${cleaned}"`);
  }
  
  return cleaned;
}

/**
 * Apply real-time coloring to MathLive field
 * Preserves cursor position to prevent jumping
 * Now handles re-evaluation by stripping old colors first
 * 
 * @param mathfield - The MathLive field element
 * @param expected - The expected answer to compare against (plain format)
 * @param comparisonMode - 'character' or 'term' level comparison
 * @param plainValue - Optional pre-extracted plain value (already converted from LaTeX)
 */
export function applyRealtimeColoring(
  mathfield: any,
  expected: string,
  comparisonMode: 'character' | 'term' = 'term',
  plainValue?: string
): void {
  if (!mathfield) return;

  // Get the clean LaTeX from the field (for coloring)
  let cleanLatex = '';
  try {
    const rawInput = mathfield.getValue() || '';
    cleanLatex = stripColorCommands(rawInput);
  } catch (e) {
    console.error('Failed to get LaTeX value:', e);
    return;
  }

  if (!cleanLatex.trim()) return;

  // Get the plain/ASCII value for comparison
  let readableInput = plainValue;
  
  if (!readableInput) {
    // Fallback: Extract and convert if not provided
    try {
      const asciiValue = mathfield.getValue('ascii-math');
      if (asciiValue && asciiValue.trim()) {
        readableInput = asciiValue;
      } else {
        // Manual conversion fallback
        readableInput = cleanLatex;
      }
    } catch (e) {
      readableInput = cleanLatex;
    }
  }

  if (!readableInput || !readableInput.trim()) return;

  console.log(`🎨 Coloring - LaTeX: "${cleanLatex}", Plain: "${readableInput}"`);

  // ✅ KEY FIX: Color the LaTeX directly based on plain comparison
  // This preserves LaTeX structure (like ^{} and \frac{}{})
  const coloredLatex = colorLatexByComparison(cleanLatex, readableInput, expected, comparisonMode);

  // Store cursor position
  const position = mathfield.position;
  
  // Apply colored LaTeX
  mathfield.setValue(coloredLatex);

  // Restore cursor position (prevents cursor jump)
  try {
    mathfield.position = position;
  } catch (e) {
    console.debug('Could not restore cursor position');
  }
}

/**
 * Color LaTeX with character-level granularity while preserving structure
 * 
 * Strategy: Parse LaTeX into structural elements vs content elements
 * - Structural: \left, \right, {, }, ^, _, \frac, etc. → Never color these
 * - Content: numbers, letters, operators → Color these character-by-character
 * 
 * This gives us character-level granularity WITHOUT breaking LaTeX formatting
 */
function colorLatexByComparison(
  latex: string,
  plainValue: string,
  expected: string,
  mode: 'character' | 'term' = 'term'
): string {
  if (!latex.trim()) return latex;
  
  // ✅ Use the same sanitization for both sides to ensure consistent comparison
  const normalizedPlain = plainValue.toLowerCase().replace(/\s/g, '');
  const normalizedExpected = InputValidator.sanitizeTextMathLive(expected);
  
  console.log(`🔍 Comparison Debug:`, {
    plainValue,
    expected,
    normalizedPlain,
    normalizedExpected,
    match: normalizedPlain === normalizedExpected,
    partialMatch: normalizedExpected.startsWith(normalizedPlain),
    exceededMatch: normalizedPlain.startsWith(normalizedExpected)
  });
  
  // Use character-by-character coloring with smart LaTeX structure preservation
  if (mode === 'character') {
    return colorLatexCharacterSmart(latex, normalizedPlain, normalizedExpected);
  }
  
  // Fallback: whole-expression coloring
  let color = 'red'; // Default: wrong
  
  if (normalizedPlain === normalizedExpected) {
    color = 'green';
    console.log(`✅ Perfect match! Color: green`);
  } else if (normalizedExpected.startsWith(normalizedPlain)) {
    color = 'green';
    console.log(`✅ Partial match (in progress)! Color: green`);
  } else if (normalizedPlain.startsWith(normalizedExpected)) {
    color = 'green';
    console.log(`✅ Exceeded match (correct + extra)! Color: green`);
  } else {
    color = 'red';
    console.log(`❌ No match! Color: red`);
  }
  
  return `\\textcolor{${color}}{${latex}}`;
}

/**
 * Smart character-level coloring that preserves LaTeX structure
 * 
 * Approach:
 * 1. Parse LaTeX into "atoms" (structural commands vs colorable content)
 * 2. Extract plain text position mapping
 * 3. Color only the content atoms, preserve structure atoms
 * 4. Rebuild LaTeX with colors
 */
function colorLatexCharacterSmart(
  latex: string,
  plainValue: string,
  expectedPlain: string
): string {
  console.log(`🎨 Smart character coloring:`, { latex, plainValue, expectedPlain });
  
  // Parse LaTeX into atoms
  const atoms = parseLatexToAtoms(latex);
  let plainIndex = 0;
  let result = '';
  
  for (const atom of atoms) {
    if (atom.type === 'structure') {
      // Preserve structural elements as-is (no coloring)
      result += atom.value;
    } else if (atom.type === 'content') {
      // Color content character-by-character
      const content = atom.value;
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        // Skip whitespace
        if (char.trim() === '') {
          result += char;
          continue;
        }
        
        // Determine color based on position in plain text
        let color = 'red';
        
        if (plainIndex < expectedPlain.length) {
          // Check if this character matches expected
          if (plainValue[plainIndex] === expectedPlain[plainIndex]) {
            color = 'green';
          } else {
            color = 'red';
          }
        } else {
          // Beyond expected length
          color = 'gray';
        }
        
        // Wrap character in color
        result += `\\textcolor{${color}}{${char}}`;
        plainIndex++;
      }
    }
  }
  
  console.log(`✅ Smart colored result:`, result.substring(0, 100));
  return result;
}

/**
 * Parse LaTeX into atoms (structural vs content)
 * 
 * Atom types:
 * - structure: LaTeX commands, braces, special chars that control formatting
 * - content: Numbers, letters, operators that should be colored
 * 
 * Special handling:
 * - Parentheses after \left or before \right are treated as structure
 */
function parseLatexToAtoms(latex: string): Array<{ type: 'structure' | 'content', value: string }> {
  const atoms: Array<{ type: 'structure' | 'content', value: string }> = [];
  let i = 0;
  
  while (i < latex.length) {
    const char = latex[i];
    
    // LaTeX command: \command or \char
    if (char === '\\') {
      let command = '\\';
      i++;
      
      // Read command name (letters only)
      while (i < latex.length && /[a-zA-Z]/.test(latex[i])) {
        command += latex[i];
        i++;
      }
      
      // Structure element
      atoms.push({ type: 'structure', value: command });
      
      // ✅ SPECIAL CASE: If this is \left or \right, include the following parenthesis as structure
      if (command === '\\left' || command === '\\right') {
        // Skip whitespace
        while (i < latex.length && /\s/.test(latex[i])) {
          i++;
        }
        
        // Check if next character is a parenthesis, bracket, or brace
        if (i < latex.length && /[\(\)\[\]\{\}]/.test(latex[i])) {
          atoms.push({ type: 'structure', value: latex[i] });
          i++;
        }
      }
      
      continue;
    }
    
    // Braces and special LaTeX chars (always structure)
    if (char === '{' || char === '}' || char === '^' || char === '_') {
      atoms.push({ type: 'structure', value: char });
      i++;
      continue;
    }
    
    // Content: accumulate consecutive content characters
    let content = '';
    while (i < latex.length) {
      const c = latex[i];
      
      // Stop at LaTeX structural elements
      if (c === '\\' || c === '{' || c === '}' || c === '^' || c === '_') {
        break;
      }
      
      content += c;
      i++;
    }
    
    if (content) {
      atoms.push({ type: 'content', value: content });
    }
  }
  
  console.log(`📦 Parsed ${atoms.length} atoms:`, atoms.map(a => `${a.type}:${a.value.substring(0, 10)}`));
  return atoms;
}


/**
 * Debounced version of applyRealtimeColoring
 * Prevents excessive re-rendering during fast typing
 * 
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Debounced coloring function
 */
export function createDebouncedColoringFunction(
  delay: number = 300
): (mathfield: any, expected: string, mode?: 'character' | 'term', plainValue?: string) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (
    mathfield: any, 
    expected: string, 
    mode: 'character' | 'term' = 'term',
    plainValue?: string
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      applyRealtimeColoring(mathfield, expected, mode, plainValue);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Calculate similarity percentage between expected and user input
 * Useful for progress tracking
 */
export function calculateSimilarity(expected: string, userInput: string): number {
  const expectedTokens = tokenizeExpression(expected);
  const userTokens = tokenizeExpression(userInput);

  if (expectedTokens.length === 0) return 0;

  let matchCount = 0;
  const minLength = Math.min(expectedTokens.length, userTokens.length);

  for (let i = 0; i < minLength; i++) {
    if (expectedTokens[i] === userTokens[i]) {
      matchCount++;
    }
  }

  return (matchCount / expectedTokens.length) * 100;
}

/**
 * Get feedback message based on similarity
 */
export function getSimilarityFeedback(similarity: number): string {
  if (similarity >= 90) return "Almost there! 🎯";
  if (similarity >= 70) return "Good progress! Keep going 💪";
  if (similarity >= 50) return "You're on the right track 👍";
  if (similarity >= 30) return "Keep trying! 🔍";
  return "Let's review the steps 📚";
}
