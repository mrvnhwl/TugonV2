import { useEffect, useState } from 'react';

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
  stats?: {  // Change from undefined to allow null as well
    attempts: number;
    timeSpent: number;
    isFirstTime: boolean;
  } | null;  // Add | null here
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  onNextQuestion, 
  onBackToSense,
  questionInfo,
  stats 
}: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  console.log('🎊 SuccessModal render:', { isOpen, stats, questionInfo });
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
    if (!stats) return "Great work!";
    
    if (stats.isFirstTime) {
      if (stats.attempts === 1) return "Perfect! First try! 🎯";
      if (stats.attempts <= 3) return "Excellent work! 🌟";
      return "Well done! Keep it up! 💪";
    } else {
      return "Mastered it again! 🏆";
    }
  };

  const getPerformanceEmoji = () => {
    if (!stats) return "🎉";
    if (stats.attempts === 1) return "🎯";
    if (stats.attempts <= 3) return "⭐";
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
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.attempts}
                </div>
                <div className="text-xs text-blue-700">
                  Attempt{stats.attempts !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(stats.timeSpent)}
                </div>
                <div className="text-xs text-purple-700">
                  Time Spent
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
            {onNextQuestion && (
              <button
                onClick={onNextQuestion}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Continue to Next Question →
              </button>
            )}
            
            <button
              onClick={onBackToSense}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 transition-all duration-200"
            >
              Back to TugonSense
            </button>
            
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