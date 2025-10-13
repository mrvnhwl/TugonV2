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
 * @param expected - The expected answer(s) to compare against (plain format) - supports string | string[]
 * @param comparisonMode - 'character' or 'term' level comparison
 * @param plainValue - Optional pre-extracted plain value (already converted from LaTeX)
 */
export function applyRealtimeColoring(
  mathfield: any,
  expected: string | string[],  // ✨ NEW: Accept array of answers
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
 * 🎯 NEW: Select best answer variant using token-based matching
 * 
 * Strategy:
 * 1. Extract meaningful tokens from user input (first 3 tokens)
 * 2. Score each variant based on token prefix matching
 * 3. Select variant with highest score
 * 
 * This is smarter than first character because:
 * - "f(8)" → tokens: ["f", "(", "8"] - matches "f(8) = 2(8) - 7"
 * - "2(8)" → tokens: ["2", "(", "8"] - matches "2(8)-7"
 * - "f(8)-7" → would match "f(8)..." but with proper token scoring
 * 
 * @param userInput - Current user input (plain text)
 * @param answerVariants - Array of possible answer variants
 * @returns Best matching answer variant
 */
function selectAnswerVariantByTokens(
  userInput: string,
  answerVariants: string[]
): string {
  // If empty input, return first variant as default
  if (!userInput || userInput.trim().length === 0) {
    console.log(`📝 Empty input, using default (first variant)`);
    return answerVariants[0];
  }

  // Extract tokens from user input
  const userTokens = extractMeaningfulTokens(userInput);
  const tokensToCompare = Math.min(3, userTokens.length); // Compare first 3 tokens
  
  console.log(`🔍 Token-Based Variant Selection:`, {
    userInput: userInput.slice(0, 30),
    userTokens: userTokens.slice(0, 5),
    tokensToCompare,
    variantCount: answerVariants.length
  });

  let bestMatch = answerVariants[0];
  let bestScore = 0;

  for (let i = 0; i < answerVariants.length; i++) {
    const variant = answerVariants[i];
    const variantTokens = extractMeaningfulTokens(variant);
    
    let score = 0;
    
    // Score based on matching tokens (weighted by position)
    // Earlier tokens are more important (weighted higher)
    for (let j = 0; j < tokensToCompare; j++) {
      if (j < userTokens.length && j < variantTokens.length) {
        if (userTokens[j].toLowerCase() === variantTokens[j].toLowerCase()) {
          // Earlier tokens get more weight: token 0 = 30, token 1 = 20, token 2 = 10
          const weight = (tokensToCompare - j) * 10;
          score += weight;
        } else {
          // Stop at first mismatch (prefix must match)
          break;
        }
      }
    }
    
    console.log(`  📊 Variant ${i + 1}: "${variant.slice(0, 30)}..."`, {
      tokens: variantTokens.slice(0, 5),
      score
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = variant;
    }
  }

  console.log(`  ✅ Best match (score ${bestScore}): "${bestMatch.slice(0, 40)}..."`);
  return bestMatch;
}

/**
 * Extract meaningful tokens from math expression
 * - Numbers, variables, operators, parentheses
 * - Ignores whitespace
 * 
 * Examples:
 * - "f(8)" → ["f", "(", "8", ")"]
 * - "2(8)-7" → ["2", "(", "8", ")", "-", "7"]
 * - "f(8) = 2(8) - 7" → ["f", "(", "8", ")", "=", "2", "(", "8", ")", "-", "7"]
 * 
 * @param input - Math expression string
 * @returns Array of tokens
 */
function extractMeaningfulTokens(input: string): string[] {
  if (!input) return [];
  
  // Normalize: remove spaces
  const normalized = input.replace(/\s+/g, '');
  
  // Match: numbers (with decimals), letters, operators (+, -, *, /, ^, =), parentheses
  // This regex captures: digits, letters, operators, parentheses
  const tokens = normalized.match(/\d+\.?\d*|[a-z]+|[+\-*/^=()]|[A-Z]/gi) || [];
  
  return tokens;
}

/**
 * 🎨 NEW: Whole-Expression Coloring (Not Character-by-Character)
 * 
 * Strategy: Color entire expression based on whether it's a correct prefix
 * - User types "f(8)" → Check if it matches a variant prefix → ALL GREEN or ALL RED
 * - User types "f(8)-7" → Check if it matches → ALL GREEN or ALL RED
 * 
 * Key Change:
 * - OLD: Character-by-character coloring (f=green, (=green, 8=green, )=green, -=red, 7=red)
 * - NEW: Whole-expression coloring (ALL GREEN if correct prefix, ALL RED otherwise)
 * 
 * @param latex - LaTeX expression to color
 * @param plainValue - Plain text value from user
 * @param expected - Expected answer(s)
 * @param mode - 'character' mode now applies whole-expression coloring
 * @returns Colored LaTeX
 */
function colorLatexByComparison(
  latex: string,
  plainValue: string,
  expected: string | string[],  // ✨ NEW: Accept array of answers
  _mode: 'character' | 'term' = 'term' // Kept for API compatibility but not used
): string {
  if (!latex.trim()) return latex;
  
  // Convert to array for consistent handling
  const answerVariants = Array.isArray(expected) ? expected : [expected];
  
  // ✨ NEW: Token-based variant selection (smarter than first character)
  const selectedVariant = selectAnswerVariantByTokens(plainValue, answerVariants);
  
  // Normalize both sides for comparison
  const normalizedPlain = InputValidator.sanitizeTextMathLive(plainValue);
  const normalizedVariant = InputValidator.sanitizeTextMathLive(selectedVariant);
  
  console.log(`🔍 Whole-Expression Comparison:`, {
    plainValue,
    normalizedPlain,
    selectedVariant: selectedVariant.slice(0, 40),
    normalizedVariant,
    totalVariants: answerVariants.length
  });
  
  // 🎯 NEW: Whole-expression coloring logic
  // Check if user input is a valid PREFIX of the selected variant
  let color = 'red'; // Default: wrong
  
  if (normalizedVariant.startsWith(normalizedPlain)) {
    // User input is a correct prefix of selected variant
    color = 'green';
    console.log(`  ✅ CORRECT PREFIX → ALL GREEN`);
  } else if (normalizedPlain === normalizedVariant) {
    // Exact match
    color = 'green';
    console.log(`  ✅ EXACT MATCH → ALL GREEN`);
  } else {
    // Not a valid prefix
    color = 'red';
    console.log(`  ❌ NOT A VALID PREFIX → ALL RED`);
  }
  
  // Apply single color to entire expression
  return `\\textcolor{${color}}{${latex}}`;
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
): (mathfield: any, expected: string | string[], mode?: 'character' | 'term', plainValue?: string) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (
    mathfield: any, 
    expected: string | string[],  // ✨ NEW: Accept array of answers
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
export function calculateSimilarity(expected: string | string[], userInput: string): number {
  // ✨ Use first answer for similarity calculation
  const referenceAnswer = Array.isArray(expected) ? expected[0] : expected;
  const expectedTokens = tokenizeExpression(referenceAnswer);
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
