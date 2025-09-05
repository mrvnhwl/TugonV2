export interface ShortHintsProps {
  hintText?: string;
  isVisible?: boolean;
  onRequestHint?: () => void;
  className?: string;
}

export default function ShortHints({
  hintText,
  isVisible = false,
  onRequestHint,
  className = ""
}: ShortHintsProps) {
  if (!isVisible || !hintText) {
    return null;
  }

  return (
    <div className={`mt-2 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Hint Icon */}
        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
          <svg 
            className="w-5 h-5 text-yellow-600 dark:text-yellow-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* Hint Header */}
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              💡 Hint
            </h4>
          </div>

          {/* Hint Content */}
          <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
            {hintText}
          </p>

          {/* Request Hint Button */}
          {onRequestHint && (
            <div className="mt-2">
              <button
                onClick={onRequestHint}
                className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 hover:underline transition-colors duration-200"
              >
                Need another hint? →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
