import React, { useState, useEffect } from 'react';
import type { UserAttempt } from '../input-system/UserInput';
import type { UserBehaviorProfile, BehaviorType } from '../input-system/UserBehaviorClassifier';
import { getHints, getAIHint, type StepContext, type HintResponse } from '../../data/hints';

export interface LongHintsProps {
  // Required context for AI hints
  topicId: number;
  categoryId: number;
  questionId: number;
  userAttempts: UserAttempt[];
  currentStepIndex: number;
  behaviorProfile?: UserBehaviorProfile|null;
  
  // Modal control
  isOpen: boolean;
  onClose: () => void;
  
  // Styling
  className?: string;
}

export default function LongHints({
  topicId,
  categoryId,
  questionId,
  userAttempts,
  currentStepIndex,
  behaviorProfile,
  isOpen,
  onClose,
  className = ""
}: LongHintsProps) {
  const [hintResponse, setHintResponse] = useState<HintResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate AI hint when modal opens
  useEffect(() => {
    if (isOpen && !hintResponse) {
      generateLongHint();
    }
  }, [isOpen]);

  const generateLongHint = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stepContext: StepContext = {
        topicId,
        categoryId,
        questionId,
        userAttempts,
        currentStepIndex,
        behaviorProfile
      };

      const response = await getHints(stepContext);
      setHintResponse(response);
      
    } catch (err) {
      console.error('Error generating long hint:', err);
      setError('Failed to generate AI hint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setHintResponse(null);
    setError(null);
    onClose();
  };

  const getBehaviorColor = (behavior?: BehaviorType) => {
    switch (behavior) {
      case 'struggling-high': return 'text-red-600';
      case 'struggling': return 'text-yellow-600';
      case 'guessing': return 'text-orange-600';
      case 'persistent': return 'text-purple-600';
      case 'repeating': return 'text-amber-600';
      case 'inactive': return 'text-gray-600';
      case 'excellent': return 'text-green-600';
      case 'self-correction': return 'text-emerald-600';
      default: return 'text-blue-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            🤖 AI Learning Assistant
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Generating personalized hint...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
              <button
                onClick={generateLongHint}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {hintResponse && !isLoading && (
            <>
              {/* Context Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Problem Context</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Category:</strong> {hintResponse.contextUsed.categoryQuestion}</p>
                  <p><strong>Question:</strong> {hintResponse.contextUsed.questionText}</p>
                  {hintResponse.detectedBehavior && (
                    <p>
                      <strong>Detected Behavior:</strong> 
                      <span className={`ml-1 font-medium ${getBehaviorColor(hintResponse.detectedBehavior)}`}>
                        {hintResponse.detectedBehavior.replace('-', ' ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Guide Text (for inactive/guessing) */}
              {hintResponse.guideText && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">🎯 Getting Started</h3>
                  <p className="text-blue-700">{hintResponse.guideText}</p>
                </div>
              )}

              {/* Short Hints */}
              {hintResponse.shortHints.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">💡 Quick Tips</h3>
                  <ul className="text-yellow-700 space-y-1">
                    {hintResponse.shortHints.map((hint, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Generated Long Hint */}
              {hintResponse.longHints && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">🤖 AI Analysis & Guidance</h3>
                  <p className="text-green-700 leading-relaxed">{hintResponse.longHints}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Personalized based on your learning behavior
          </div>
          <div className="space-x-2">
            <button
              onClick={generateLongHint}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              🔄 Generate New Hint
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}