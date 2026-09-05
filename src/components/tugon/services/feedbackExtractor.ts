import { TokenFeedback } from '../input-system/tokenUtils';

/**
 * Extract wrong and misplaced tokens from FeedbackOverlay feedback data
 * 
 * @param feedback - Array of TokenFeedback from FeedbackOverlay
 * @returns Object containing wrong tokens (red), misplaced tokens (yellow), and extra tokens (grey)
 */
export function extractWrongTokensFromFeedback(
  feedback: TokenFeedback[]
): {
  wrongTokens: string[];      // Red: wrong tokens
  misplacedTokens: string[];  // Yellow: correct but wrong position
  extraTokens: string[];      // Grey: extra tokens beyond expected length
} {
  const wrongTokens: string[] = [];
  const misplacedTokens: string[] = [];
  const extraTokens: string[] = [];

  feedback.forEach(token => {
    switch (token.status) {
      case 'red':
        wrongTokens.push(token.token);
        break;
      case 'yellow':
        misplacedTokens.push(token.token);
        break;
      case 'grey':
        extraTokens.push(token.token);
        break;
      // 'green' tokens are correct, we don't include them
    }
  });

  return {
    wrongTokens,
    misplacedTokens,
    extraTokens
  };
}

/**
 * Format wrong tokens for display in hint
 * Combines wrong, misplaced, and extra tokens into a readable string
 */
export function formatWrongTokensForHint(
  wrongTokens: string[],
  misplacedTokens: string[] = [],
  extraTokens: string[] = []
): string {
  const allProblematicTokens = [
    ...wrongTokens,
    ...misplacedTokens,
    ...extraTokens
  ];

  if (allProblematicTokens.length === 0) {
    return 'that part';
  }

  if (allProblematicTokens.length === 1) {
    return `"${allProblematicTokens[0]}"`;
  }

  if (allProblematicTokens.length === 2) {
    return `"${allProblematicTokens[0]}" and "${allProblematicTokens[1]}"`;
  }

  return `"${allProblematicTokens[0]}", "${allProblematicTokens[1]}" and ${allProblematicTokens.length - 2} more`;
}

/**
 * Get a descriptive hint based on the types of errors
 */
export function getErrorTypeDescription(
  wrongTokens: string[],
  misplacedTokens: string[],
  extraTokens: string[]
): string {
  const parts: string[] = [];

  if (wrongTokens.length > 0) {
    parts.push(`${wrongTokens.length} incorrect`);
  }
  if (misplacedTokens.length > 0) {
    parts.push(`${misplacedTokens.length} misplaced`);
  }
  if (extraTokens.length > 0) {
    parts.push(`${extraTokens.length} extra`);
  }

  if (parts.length === 0) {
    return 'minor issues';
  }

  return parts.join(', ');
}
