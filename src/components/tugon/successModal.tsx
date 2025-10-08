import { useEffect, useState } from 'react';

interface QuestionDetail {
  questionId: number;
  attempts: number;
  timeSpent: number;
  colorCodedHintsUsed: number;
  shortHintMessagesUsed: number;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextQuestion?: () => void;
  onBackToSense?: () => void;
  questionInfo?: {
    topicId: number;
    categoryId: number;
    questionId: number;
  };
  // NEW: Category completion stats instead of single question stats
  categoryStats?: {
    categoryCompleted: boolean;
    totalQuestions: number;
    questionsDetails: QuestionDetail[];
    totalTimeSpent: number;
    totalAttempts: number;
  } | null;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  onNextQuestion, 
  onBackToSense,
  questionInfo,
  categoryStats 
}: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  console.log('🎊 SuccessModal render:', { isOpen, categoryStats, questionInfo });
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-hide confetti after animation
      
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen){ 
    console.log('🚫 Modal not open, returning null');
    return null;
  }

  console.log('🎊 Rendering modal content');
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getEncouragementMessage = () => {
    if (!categoryStats) return "Great work!";
    
    if (categoryStats.categoryCompleted) {
      return "Category Complete! Amazing work! �";
    }
    
    return "Keep going! You're doing great! 💪";
  };

  const getPerformanceEmoji = () => {
    if (!categoryStats) return "🎉";
    if (categoryStats.categoryCompleted) return "�";
    if (categoryStats.totalAttempts <= categoryStats.totalQuestions * 2) return "⭐";
    return "💪";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with celebration gradient */}
        <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-6 text-center">
          <div className="text-6xl mb-2 animate-bounce">
            {getPerformanceEmoji()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            GOOD JOB!
          </h2>
          <p className="text-white/90 text-sm">
            {getEncouragementMessage()}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category Completion Stats */}
          {categoryStats && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {categoryStats.totalQuestions}
                  </div>
                  <div className="text-xs text-green-700">
                    Questions Completed
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(categoryStats.totalTimeSpent)}
                  </div>
                  <div className="text-xs text-purple-700">
                    Total Time
                  </div>
                </div>
              </div>

              {/* Per-Question Details */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="text-sm font-semibold text-gray-700 mb-3">Question Details:</div>
                <div className="space-y-2">
                  {categoryStats.questionsDetails.map((detail) => (
                    <div key={detail.questionId} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">Question {detail.questionId}</span>
                        <span className="text-xs text-gray-500">{formatTime(detail.timeSpent)}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">{detail.attempts}</div>
                          <div className="text-blue-700">Attempts</div>
                        </div>
                        
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="font-bold text-orange-600">{detail.colorCodedHintsUsed}</div>
                          <div className="text-orange-700">Color Hints</div>
                        </div>
                        
                        <div className="text-center p-2 bg-pink-50 rounded">
                          <div className="font-bold text-pink-600">{detail.shortHintMessagesUsed}</div>
                          <div className="text-pink-700">Short Hints</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Question Info */}
          {questionInfo && (
            <div className="text-center mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Topic {questionInfo.topicId} • Stage {questionInfo.categoryId} • Question {questionInfo.questionId}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ✅ Completed Successfully
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {categoryStats?.categoryCompleted ? (
              /* Category completed - show "Next Stage" instead of "Next Question" */
              <button
                onClick={onBackToSense}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                🎉 Back to TugonSense
              </button>
            ) : onNextQuestion ? (
              /* Partial completion - show next question option */
              <button
                onClick={onNextQuestion}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Continue to Next Question →
              </button>
            ) : null}
            
            {!categoryStats?.categoryCompleted && (
              <button
                onClick={onBackToSense}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 transition-all duration-200"
              >
                Back to TugonSense
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-transparent hover:bg-gray-50 text-gray-500 font-medium py-2 px-4 rounded-lg transition-all duration-200"
            >
              Stay Here
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}