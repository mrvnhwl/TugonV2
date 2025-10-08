import { TokenFeedback, getTokenFeedbackHint, tokenizeMathString } from './tokenUtils';
import { cn } from '@/components/cn';

interface FeedbackOverlayProps {
  feedback: TokenFeedback[];
  show: boolean;
  className?: string;
  userInput?: string;
  expectedAnswer?: string;
  showHint?: boolean;
}

/**
 * FeedbackOverlay Component
 * 
 * Renders Wordle-style token feedback as colored boxes containing token text.
 * Each token is displayed in a colored box based on its feedback status:
 * - Green: correct token in correct position
 * - Yellow: correct token in wrong position
 * - Red: wrong token (not in expected answer)
 * - Grey: extra token beyond expected length
 */
export function FeedbackOverlay({ 
  feedback, 
  show, 
  className, 
  userInput, 
  expectedAnswer, 
  showHint = false 
}: FeedbackOverlayProps) {
  if (!show || !feedback || feedback.length === 0) {
    return null;
  }

  // Generate hint message if needed
  let hintMessage = '';
  if (showHint && userInput && expectedAnswer) {
    const userTokens = tokenizeMathString(userInput);
    const expectedTokens = tokenizeMathString(expectedAnswer);
    hintMessage = getTokenFeedbackHint(feedback, userTokens, expectedTokens);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Token feedback row */}
      <div 
        className={cn(
          "flex flex-wrap gap-1 p-2 bg-white/90 border border-gray-200 rounded-md shadow-sm animate-slide-down"
        )}
      >
        {feedback.map((token, index) => (
          <span
            key={`${token.token}-${index}`}
            className={cn(
              "inline-flex items-center justify-center px-2 py-1 rounded text-sm font-mono font-medium border transition-all duration-200",
              // Green: correct token in correct position
              token.status === "green" && "bg-green-100 text-green-800 border-green-300 token-green",
              // Yellow: correct token in wrong position  
              token.status === "yellow" && "bg-yellow-100 text-yellow-800 border-yellow-300 token-yellow",
              // Red: wrong token (not in expected)
              token.status === "red" && "bg-red-100 text-red-800 border-red-300 token-red",
              // Grey: extra token beyond expected length
              token.status === "grey" && "bg-gray-100 text-gray-600 border-gray-300 token-grey"
            )}
            title={`Token: "${token.token}" - Status: ${token.status}`}
          >
            {token.token}
          </span>
        ))}
      </div>

      {/* Hint message */}
      {showHint && hintMessage && (
        <div className="text-xs text-gray-600 italic px-2">
          💡 {hintMessage}
        </div>
      )}
    </div>
  );
}

interface FeedbackSummaryProps {
  feedback: TokenFeedback[];
  show: boolean;
  className?: string;
}

/**
 * FeedbackSummary Component
 * 
 * Shows a brief summary of the token feedback status
 * Useful for showing progress or hints to the user
 */
export function FeedbackSummary({ feedback, show, className }: FeedbackSummaryProps) {
  if (!show || !feedback || feedback.length === 0) {
    return null;
  }

  const greenCount = feedback.filter(f => f.status === "green").length;
  const yellowCount = feedback.filter(f => f.status === "yellow").length;
  const redCount = feedback.filter(f => f.status === "red").length;
  const greyCount = feedback.filter(f => f.status === "grey").length;

  const totalExpected = feedback.length - greyCount; // Exclude extra tokens
  const isComplete = greenCount === totalExpected && greyCount === 0;

  return (
    <div className={cn("text-xs text-gray-600 mt-1", className)}>
      {isComplete ? (
        <span className="text-green-600 font-medium">✓ Perfect match!</span>
      ) : (
        <span>
          {greenCount > 0 && <span className="text-green-600">{greenCount} correct</span>}
          {yellowCount > 0 && (
            <span>
              {greenCount > 0 && ", "}
              <span className="text-yellow-600">{yellowCount} misplaced</span>
            </span>
          )}
          {redCount > 0 && (
            <span>
              {(greenCount > 0 || yellowCount > 0) && ", "}
              <span className="text-red-600">{redCount} wrong</span>
            </span>
          )}
          {greyCount > 0 && (
            <span>
              {(greenCount > 0 || yellowCount > 0 || redCount > 0) && ", "}
              <span className="text-gray-500">{greyCount} extra</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export default FeedbackOverlay;