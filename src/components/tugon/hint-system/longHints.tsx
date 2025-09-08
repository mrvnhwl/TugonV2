import React from 'react';
import type { UserAttempt } from '../input-system/UserInput';
import type { UserBehaviorProfile, BehaviorType } from '../input-system/UserBehaviorClassifier';

// Import LaTeX rendering (assuming you have KaTeX or MathJax set up)
import 'katex/dist/katex.min.css';

export interface LongHintsProps {
  // Required for context
  userAttempts: UserAttempt[];
  behaviorProfile?: UserBehaviorProfile | null;
  currentStepIndex: number;
  topicId?: number;
  categoryId?: number;
  questionId?: number;
  
  // Modal control
  isVisible?: boolean;
  aiMessage?: string;
  isLoading?: boolean;
  onClose?: () => void;
  onRequestAI?: () => void;
  className?: string;
}

// Helper function to render LaTeX content
const renderMathContent = (text: string) => {
  // Split text by LaTeX delimiters and render accordingly
  const parts = text.split(/(\$[^$]+\$|\\\([^)]+\\\)|\\\[[^\]]+\\\])/g);
  
  return parts.map((part, index) => {
    // Check if it's LaTeX content
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      // Inline math
      const mathContent = part.slice(1, -1);
      return (
        <span 
          key={index} 
          className="inline-block mx-1 px-2 py-1 bg-blue-50 rounded font-mono text-blue-800 border"
        >
          {mathContent}
        </span>
      );
    } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
      // Inline math alternative
      const mathContent = part.slice(2, -2);
      return (
        <span 
          key={index} 
          className="inline-block mx-1 px-2 py-1 bg-blue-50 rounded font-mono text-blue-800 border"
        >
          {mathContent}
        </span>
      );
    } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
      // Block math
      const mathContent = part.slice(2, -2);
      return (
        <div 
          key={index} 
          className="my-3 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center"
        >
          <span className="text-lg font-mono text-blue-800">{mathContent}</span>
        </div>
      );
    } else {
      // Regular text
      return <span key={index}>{part}</span>;
    }
  });
};

// Helper function to format hint content with better structure
const formatHintContent = (content: string) => {
  // Split by double asterisks for emphasis
  const sections = content.split(/\*\*([^*]+)\*\*/g);
  
  return sections.map((section, index) => {
    // Every odd index is emphasized content
    if (index % 2 === 1) {
      return (
        <div key={index} className="mb-4">
          <h4 className="font-semibold text-lg mb-2 text-blue-900 border-b border-blue-200 pb-1">
            {section}
          </h4>
        </div>
      );
    } else {
      // Regular content - render with LaTeX support
      const paragraphs = section.split('\n\n').filter(p => p.trim());
      return paragraphs.map((paragraph, pIndex) => (
        <div key={`${index}-${pIndex}`} className="mb-3 leading-relaxed">
          {renderMathContent(paragraph.trim())}
        </div>
      ));
    }
  });
};

export default function LongHints({
  userAttempts,
  behaviorProfile,
  currentStepIndex,
  topicId,
  categoryId,
  questionId,
  isVisible = false,
  aiMessage = '',
  isLoading = false,
  onClose,
  onRequestAI,
  className = ""
}: LongHintsProps) {

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Get detected behavior for styling
  const detectedBehavior: BehaviorType | null | undefined = 
    behaviorProfile?.stepBehaviors?.[currentStepIndex]?.primaryBehavior;

  const getBehaviorStyling = (behavior?: BehaviorType | null) => {
    switch (behavior) {
      case 'struggling':
        return { 
          bgClass: 'bg-gradient-to-br from-red-50 to-red-100', 
          borderClass: 'border-red-300',
          textClass: 'text-red-800', 
          headerClass: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
          icon: '🚨',
          title: 'Struggling - AI Guidance',
          accentColor: 'red'
        };
      
      case 'guessing':
        return { 
          bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100', 
          borderClass: 'border-orange-300',
          textClass: 'text-orange-800', 
          headerClass: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
          icon: '🎲',
          title: 'Guessing Pattern - AI Guidance',
          accentColor: 'orange'
        };
    
      case 'repeating':
        return { 
          bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100', 
          borderClass: 'border-amber-300',
          textClass: 'text-amber-800',
          headerClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white', 
          icon: '🔁',
          title: 'Repeating Pattern - AI Guidance',
          accentColor: 'amber'
        };
        
      case 'self-correction':
        return { 
          bgClass: 'bg-gradient-to-br from-green-50 to-green-100', 
          borderClass: 'border-green-300',
          textClass: 'text-green-800',
          headerClass: 'bg-gradient-to-r from-green-500 to-green-600 text-white', 
          icon: '✅',
          title: 'Learning Progress - AI Support',
          accentColor: 'green'
        };
        
      case null:
      case undefined:
      default:
        return { 
          bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100', 
          borderClass: 'border-blue-300',
          textClass: 'text-blue-800',
          headerClass: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white', 
          icon: '🤖',
          title: 'AI Mathematical Guidance',
          accentColor: 'blue'
        };
    }
  };

  const styling = getBehaviorStyling(detectedBehavior);

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${styling.bgClass} border-2 ${styling.borderClass} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Modal Header */}
          <div className={`px-8 py-6 ${styling.headerClass} border-b-2 border-white/20`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl bg-white/20 rounded-full p-2">
                  {styling.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{styling.title}</h2>
                  <p className="text-white/80 text-sm">
                    Step {currentStepIndex + 1} • {userAttempts.length} attempts • Personalized AI Help
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 text-xl"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Enhanced Modal Body */}
          <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4 mx-auto"></div>
                  <p className="text-blue-600 text-lg font-medium">Analyzing your approach...</p>
                  <p className="text-blue-500 text-sm">Generating personalized mathematical guidance</p>
                </div>
              </div>
            )}

            {/* AI Message Content - Enhanced */}
            {!isLoading && aiMessage && (
              <div className={`${styling.textClass} space-y-4`}>
                <div className="prose prose-lg max-w-none">
                  {formatHintContent(aiMessage)}
                </div>
              </div>
            )}

            {/* Error/Empty State - Enhanced */}
            {!isLoading && !aiMessage && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className={`text-xl font-semibold mb-4 ${styling.textClass}`}>
                  No AI guidance available at the moment
                </h3>
                <p className={`${styling.textClass} mb-6 opacity-80`}>
                  Let me analyze your current progress and generate personalized help.
                </p>
                <button
                  onClick={onRequestAI}
                  className={`px-6 py-3 bg-${styling.accentColor}-500 text-white rounded-lg hover:bg-${styling.accentColor}-600 transition-colors font-medium`}
                >
                  Generate AI Guidance
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Modal Footer */}
          <div className="px-8 py-6 bg-white/50 border-t border-white/30">
            <div className="flex items-center justify-between">
              {/* Progress Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-medium text-gray-700">
                      Progress: {Math.round((userAttempts.filter(a => a.isCorrect).length / userAttempts.length) * 100) || 0}%
                    </p>
                    <p className="text-gray-500 text-xs">
                      {userAttempts.filter(a => a.isCorrect).length} of {userAttempts.length} correct
                    </p>
                  </div>
                </div>
                
                {behaviorProfile && detectedBehavior && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <p className="font-medium text-gray-700">
                        Behavior: {detectedBehavior.replace('-', ' ')}
                      </p>
                      <p className="text-gray-500 text-xs">AI-detected learning pattern</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-medium text-gray-700">Step {currentStepIndex + 1}</p>
                    <p className="text-gray-500 text-xs">Current focus</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                {!isLoading && (
                  <button
                    onClick={onRequestAI}
                    className={`px-6 py-2 text-${styling.accentColor}-600 bg-white hover:bg-${styling.accentColor}-50 border border-${styling.accentColor}-200 rounded-lg transition-colors font-medium`}
                  >
                    🔄 Get New Hint
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}