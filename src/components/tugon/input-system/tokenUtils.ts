/**
 * Math Expression Tokenization Utility
 * 
 * Provides functions to tokenize mathematical expressions into meaningful components
 * for Wordle-style feedback in the math input validator.
 */

// Regex to match invisible Unicode characters that can interfere with tokenization
// Includes: NBSP, various Unicode spaces, ZWSP, word joiner, BOM, etc.
const INVISIBLE_REGEX = /[\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g;

export type TokenFeedback = {
  token: string;
  status: "green" | "yellow" | "red" | "grey";
  index: number;
};

/**
 * Tokenizes a math string into meaningful tokens for comparison
 * 
 * ✨ NEW: Filters out LaTeX formatting commands that should not appear in feedback
 * - Excludes: \textcolor, \left, \right, and color names (green, red, gray)
 * - Keeps: actual mathematical content (numbers, variables, operators)
 * 
 * @param str The math expression string to tokenize
 * @returns Array of tokens (excluding LaTeX structural commands)
 * 
 * Examples:
 * - "35+7x" → ["35", "+", "7", "x"]
 * - "\frac{2}{35}" → ["\\frac", "2", "35"] (braces filtered out)
 * - "\textcolor{green}{2}" → ["2"] (color command filtered out)
 * - "2x^2 + 3x - 1" → ["2", "x", "^", "2", "+", "3", "x", "-", "1"]
 */
export function tokenizeMathString(str: string): string[] {
  if (!str || str.trim() === '') return [];
  
  // First, remove invisible Unicode characters that MathLive might introduce
  const sanitized = str.replace(INVISIBLE_REGEX, '');
  
  // Remove quote characters that might interfere with tokenization
  const noQuotes = sanitized.replace(/"/g, '');
  
  // Then remove all regular whitespace for consistent tokenization
  const cleanStr = noQuotes.replace(/\s+/g, '');
  
  const tokens: string[] = [];
  let i = 0;
  
  // ✨ NEW: List of LaTeX commands to exclude from tokens
  const LATEX_FORMATTING_COMMANDS = new Set([
    '\\textcolor',
    '\\left',
    '\\right',
    '\\color',
    '\\colorbox',
    '\\mathcolor'
  ]);
  
  // ✨ NEW: List of color names to exclude from tokens
  const COLOR_NAMES = new Set([
    'green',
    'red',
    'gray',
    'grey',
    'yellow',
    'blue',
    'black',
    'white'
  ]);
  
  while (i < cleanStr.length) {
    // LaTeX commands (start with backslash)
    if (cleanStr[i] === '\\') {
      let command = '\\';
      i++;
      // Collect alphabetic characters for the command
      while (i < cleanStr.length && /[a-zA-Z]/.test(cleanStr[i])) {
        command += cleanStr[i];
        i++;
      }
      
      // ✨ NEW: Only add command if it's NOT a formatting command
      if (!LATEX_FORMATTING_COMMANDS.has(command)) {
        tokens.push(command);
      }
      continue;
    }
    
    // ✨ NEW: Skip braces (they're structural, not content)
    // Braces are used for grouping in LaTeX but aren't meaningful math content
    if (cleanStr[i] === '{' || cleanStr[i] === '}') {
      i++;
      continue;
    }
    
    // Enhanced handling for minus sign: negative number vs subtraction operator
    if (cleanStr[i] === '-') {
      // Check if this minus should be part of a negative number
      const isNegativeNumber = 
        // At the start of expression
        i === 0 ||
        // After an operator (but not after a closing bracket or digit)
        /[+\-*/^=({]/.test(cleanStr[i - 1]) ||
        // After LaTeX command opening brace
        (i > 0 && cleanStr[i - 1] === '{');
      
      if (isNegativeNumber && i + 1 < cleanStr.length && /\d/.test(cleanStr[i + 1])) {
        // This is a negative number
        let number = '-';
        i++;
        while (i < cleanStr.length && (/\d/.test(cleanStr[i]) || cleanStr[i] === '.')) {
          number += cleanStr[i];
          i++;
        }
        tokens.push(number);
        continue;
      } else {
        // This is a subtraction operator
        tokens.push('-');
        i++;
        continue;
      }
    }
    
    // Multi-digit numbers (including decimals)
    if (/\d/.test(cleanStr[i])) {
      let number = '';
      while (i < cleanStr.length && (/\d/.test(cleanStr[i]) || cleanStr[i] === '.')) {
        number += cleanStr[i];
        i++;
      }
      tokens.push(number);
      continue;
    }
    
    // Multi-letter words (check if they're color names to exclude)
    if (/[a-zA-Z]/.test(cleanStr[i])) {
      // Peek ahead to see if this is a multi-letter word
      let word = '';
      let j = i;
      while (j < cleanStr.length && /[a-zA-Z]/.test(cleanStr[j])) {
        word += cleanStr[j];
        j++;
      }
      
      // ✨ NEW: Skip color names
      if (COLOR_NAMES.has(word.toLowerCase())) {
        i = j;
        continue;
      }
      
      // Check if we just processed a number and this is a variable
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && /^\d/.test(lastToken) && word.length === 1) {
        // This is a single-letter variable following a number (coefficient)
        tokens.push(word);
        i = j;
        continue;
      }
      
      // Single letter variable
      if (word.length === 1) {
        tokens.push(word);
        i = j;
        continue;
      }
      
      // Multi-letter word (function name, etc.) - keep it
      tokens.push(word);
      i = j;
      continue;
    }
    
    // Operators and special characters (minus handled separately above)
    if (/[+*/=^()[\]]/.test(cleanStr[i])) {
      tokens.push(cleanStr[i]);
      i++;
      continue;
    }
    
    // Special math symbols
    if (/[√∑∏∫≤≥≠±∞]/.test(cleanStr[i])) {
      tokens.push(cleanStr[i]);
      i++;
      continue;
    }
    
    // Any other character (handle gracefully)
    tokens.push(cleanStr[i]);
    i++;
  }
  
  // Filter out tokens that are empty or contain only invisible characters/quotes
  return tokens.filter(token => {
    const cleanedToken = token.replace(INVISIBLE_REGEX, '').replace(/"/g, '').trim();
    return cleanedToken !== '';
  });
}

/**
 * Generates Wordle-style feedback by comparing user tokens with expected tokens
 * 
 * @param userTokens Array of tokens from user input
 * @param expectedTokens Array of tokens from expected answer
 * @returns Array of TokenFeedback objects
 * 
 * Logic:
 * - Green: exact match at same index
 * - Yellow: token exists in expected but wrong position
 * - Red: token not in expected at all
 * - Grey: extra tokens beyond expected length
 */
export function generateTokenFeedback(userTokens: string[], expectedTokens: string[]): TokenFeedback[] {
  const feedback: TokenFeedback[] = [];
  
  // Create a copy of expected tokens to track usage for yellow matches
  const expectedTokensRemaining = [...expectedTokens];
  
  // First pass: Mark exact matches (green)
  for (let i = 0; i < userTokens.length; i++) {
    const userToken = userTokens[i];
    
    if (i < expectedTokens.length && userToken === expectedTokens[i]) {
      feedback.push({
        token: userToken,
        status: "green",
        index: i
      });
      // Remove this token from remaining expected tokens
      expectedTokensRemaining[i] = ''; // Mark as used
    } else {
      // Placeholder for second pass
      feedback.push({
        token: userToken,
        status: "red", // Default to red, will be updated in second pass
        index: i
      });
    }
  }
  
  // Second pass: Check for misplaced tokens (yellow) and wrong tokens (red)
  for (let i = 0; i < userTokens.length; i++) {
    if (feedback[i].status === "green") {
      continue; // Already correctly placed
    }
    
    const userToken = userTokens[i];
    
    // Check if token exists elsewhere in expected tokens
    const foundIndex = expectedTokensRemaining.findIndex(token => token === userToken);
    
    if (foundIndex !== -1) {
      // Token exists but in wrong position
      feedback[i].status = "yellow";
      expectedTokensRemaining[foundIndex] = ''; // Mark as used
    } else if (i >= expectedTokens.length) {
      // Extra tokens beyond expected length
      feedback[i].status = "grey";
    } else {
      // Token doesn't exist in expected answer
      feedback[i].status = "red";
    }
  }
  
  return feedback;
}

/**
 * Helper function to check if all tokens are correctly placed (all green)
 * 
 * @param feedback Array of TokenFeedback objects
 * @param expectedLength Expected number of tokens
 * @returns true if all tokens are green and lengths match
 */
export function isTokenFeedbackComplete(feedback: TokenFeedback[], expectedLength: number): boolean {
  return feedback.length === expectedLength && 
         feedback.every(f => f.status === "green");
}

/**
 * Determines if the user input is incomplete (fewer tokens than expected)
 * 
 * @param userTokens Array of user input tokens
 * @param expectedTokens Array of expected tokens
 * @returns true if user has fewer tokens than expected
 */
export function isIncompleteInput(userTokens: string[], expectedTokens: string[]): boolean {
  return userTokens.length < expectedTokens.length;
}

/**
 * Gets a hint message based on the token feedback
 * 
 * @param feedback Array of TokenFeedback objects
 * @param userTokens User input tokens
 * @param expectedTokens Expected tokens
 * @returns Hint message string
 */
export function getTokenFeedbackHint(
  feedback: TokenFeedback[], 
  userTokens: string[], 
  expectedTokens: string[]
): string {
  if (isIncompleteInput(userTokens, expectedTokens)) {
    const missing = expectedTokens.length - userTokens.length;
    return `Incomplete answer: ${missing} more token${missing > 1 ? 's' : ''} needed`;
  }
  
  const greenCount = feedback.filter(f => f.status === "green").length;
  const yellowCount = feedback.filter(f => f.status === "yellow").length;
  const redCount = feedback.filter(f => f.status === "red").length;
  const greyCount = feedback.filter(f => f.status === "grey").length;
  
  if (greyCount > 0) {
    return `Too many tokens: remove ${greyCount} extra token${greyCount > 1 ? 's' : ''}`;
  }
  
  if (redCount > 0) {
    return `${redCount} wrong token${redCount > 1 ? 's' : ''} - check your expression`;
  }
  
  if (yellowCount > 0) {
    return `${yellowCount} token${yellowCount > 1 ? 's are' : ' is'} in the wrong position`;
  }
  
  if (greenCount === expectedTokens.length) {
    return "Perfect match!";
  }
  
  return "Check your answer";
}

/**
 * Examples for testing and documentation:
 * 
 * Example 1: user="x+3", expected="x+2"
 * userTokens: ["x", "+", "3"]
 * expectedTokens: ["x", "+", "2"]
 * Feedback: [ {token:"x", status:"green"}, {token:"+", status:"green"}, {token:"3", status:"red"} ]
 * 
 * Example 2: user="5+2x", expected="2x+5"
 * userTokens: ["5", "+", "2", "x"]
 * expectedTokens: ["2", "x", "+", "5"]
 * Feedback: [ {token:"5", status:"yellow"}, {token:"+", status:"yellow"}, {token:"2", status:"yellow"}, {token:"x", status:"yellow"} ]
 * 
 * Example 3: user="\frac{2}{1}", expected="\frac{1}{2}"
 * userTokens: ["\\frac", "{", "2", "}", "{", "1", "}"]
 * expectedTokens: ["\\frac", "{", "1", "}", "{", "2", "}"]
 * Feedback: [ {token:"\\frac", status:"green"}, {token:"{", status:"green"}, {token:"2", status:"yellow"}, {token:"}", status:"green"}, {token:"{", status:"green"}, {token:"1", status:"yellow"}, {token:"}", status:"green"} ]
 */