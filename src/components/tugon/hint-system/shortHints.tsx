import React from 'react';
import type { UserAttempt } from '../input-system/UserInput';
import type { UserBehaviorProfile, BehaviorType } from '../input-system/UserBehaviorClassifier';
import { getShortHint, getGuideText, type StepContext } from '../../data/hints';

export interface ShortHintsProps {
  // Required for hints.ts
  userAttempts: UserAttempt[];
  behaviorProfile?: UserBehaviorProfile | null;
  currentStepIndex: number;
  topicId?: number;
  categoryId?: number;
  questionId?: number;
  
  // Display control
  isVisible?: boolean;
  hintText?: string;
  onRequestHint?: () => void;
  onRequestAIHelp?: () => void;
  className?: string;
  
  // FIXED: Add hint interval props
  attemptsSinceLastHint?: number;
  hintIntervalActive?: boolean;
  hintIntervalThreshold?: number;
}

export default function ShortHints({
  userAttempts,
  behaviorProfile,
  currentStepIndex,
  topicId,
  categoryId,
  questionId,
  isVisible = false,
  hintText,
  onRequestHint,
  onRequestAIHelp,
  className = "",
  // FIXED: Add hint interval props with defaults
  attemptsSinceLastHint = 0,
  hintIntervalActive = false,
  hintIntervalThreshold = 3
}: ShortHintsProps) {
  
  // Don't show if not visible
  if (!isVisible) {
    console.log('ShortHints: isVisible', isVisible);
    return null;
  }

  console.log('🔧 ShortHints props:', {
    userAttempts: userAttempts.length,
    behaviorProfile,
    currentStepIndex,
    topicId,
    categoryId,
    questionId,
    isVisible,
    hintText,
    attemptsSinceLastHint,
    hintIntervalActive,
    hintIntervalThreshold
  });
  
  // Get detected behavior - handle null properly
  let detectedBehavior: BehaviorType | null | undefined;
  if (behaviorProfile && behaviorProfile.stepBehaviors && behaviorProfile.stepBehaviors[currentStepIndex]) {
    detectedBehavior = behaviorProfile.stepBehaviors[currentStepIndex].primaryBehavior;
    console.log('🎯 Detected behavior from profile:', detectedBehavior);
  } else {
    console.log('❌ No behavior profile or step behavior found');
    detectedBehavior = null;
  }

  // FIXED: Show hints for EITHER behavior detection OR hint interval
  const shouldShowForBehavior = detectedBehavior && ['struggling', 'guessing', 'repeating'].includes(detectedBehavior);
  const shouldShowForInterval = hintIntervalActive || attemptsSinceLastHint >= hintIntervalThreshold;
  const shouldShowHint = shouldShowForBehavior || shouldShowForInterval;
  
  if (!shouldShowHint) {
    console.log('🚫 Not showing hint - no behavior detected and interval not reached');
    console.log('   - detectedBehavior:', detectedBehavior);
    console.log('   - shouldShowForBehavior:', shouldShowForBehavior);
    console.log('   - shouldShowForInterval:', shouldShowForInterval);
    console.log('   - attemptsSinceLastHint:', attemptsSinceLastHint);
    console.log('   - hintIntervalThreshold:', hintIntervalThreshold);
    return null;
  }

  let hintTextToShow: string | undefined;
  let hintSource: 'behavior' | 'interval' | 'manual' = 'manual';

  // Determine hint source and get appropriate text
  if (shouldShowForBehavior && topicId !== undefined && categoryId !== undefined && questionId !== undefined) {
    hintSource = 'behavior';
    try {
      const stepContext: StepContext = {
        topicId,
        categoryId,
        questionId,
        userAttempts,
        currentStepIndex,
        behaviorProfile
      };
      
      console.log('📋 Step context created for behavior:', stepContext);
      
      // Get guide text first (for specific behaviors)
      hintTextToShow = getGuideText(stepContext);
      console.log('📖 Guide text:', hintTextToShow);
      
      // If no guide text, get behavior-based hint
      if (!hintTextToShow) {
        hintTextToShow = getShortHint(stepContext);
        console.log('💡 Short hint:', hintTextToShow);
      }
    } catch (error) {
      console.error('❌ Error getting behavior hint from hints.ts:', error);
      // Fallback to manual hint
      hintTextToShow = hintText;
    }
  } else if (shouldShowForInterval) {
    hintSource = 'interval';
    // For interval hints, show encouragement and suggest AI help
    hintTextToShow = `You've made ${attemptsSinceLastHint} attempts. Would you like some AI guidance?`;
    console.log('⏱️ Using interval hint:', hintTextToShow);
  } else {
    hintSource = 'manual';
    hintTextToShow = hintText;
    console.log('👤 Using manual hint:', hintTextToShow);
  }

  // Final fallback for when no hint is available
  if (!hintTextToShow) {
    if (hintSource === 'interval') {
      hintTextToShow = "Need some help? Click below for AI guidance.";
    } else {
      hintTextToShow = "Keep working through this step by step.";
    }
    console.log('🔄 Using default fallback hint:', hintTextToShow);
  }

  console.log('📄 Final hint to show:', hintTextToShow);

  // Updated styling function to handle interval hints
  const getHintStyling = (source: 'behavior' | 'interval' | 'manual', behavior?: BehaviorType | null) => {
    // If it's an interval hint, use blue styling
    if (source === 'interval') {
      return { 
        bgClass: 'bg-blue-50 border-blue-200', 
        textClass: 'text-blue-800', 
        icon: '⏰',
        title: 'Hint Interval Reached'
      };
    }
    
    // Otherwise use behavior-based styling
    switch (behavior) {
      case 'struggling':
        return { 
          bgClass: 'bg-yellow-50 border-yellow-200', 
          textClass: 'text-yellow-800', 
          icon: '⚠️',
          title: 'Struggling Detected'
        };
      case 'guessing':
        return { 
          bgClass: 'bg-orange-50 border-orange-200', 
          textClass: 'text-orange-800', 
          icon: '🎲',
          title: 'Guessing Pattern'
        };
      case 'repeating':
        return { 
          bgClass: 'bg-amber-50 border-amber-200', 
          textClass: 'text-amber-800', 
          icon: '🔁',
          title: 'Repeating Pattern'
        };
      case 'self-correction':
        return { 
          bgClass: 'bg-emerald-50 border-emerald-200', 
          textClass: 'text-emerald-800', 
          icon: '✨',
          title: 'Learning Progress'
        };
      case null:
      case undefined:
      default:
        return { 
          bgClass: 'bg-gray-50 border-gray-200', 
          textClass: 'text-gray-800', 
          icon: '💡',
          title: 'Hint Available'
        };
    }
  };

  const styling = getHintStyling(hintSource, detectedBehavior);

  console.log('🎨 Applied styling:', styling);
  console.log('✅ ShortHints component will render');

  return (
    <div className={`mt-2 p-3 ${styling.bgClass} border rounded-lg ${className}`}>
      <div className="flex items-start justify-between space-x-3">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-lg">{styling.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-xs font-medium ${styling.textClass}`}>
                {styling.title}
              </p>
              {hintSource === 'interval' && (
                <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                  {attemptsSinceLastHint}/{hintIntervalThreshold} attempts
                </span>
              )}
            </div>
            <p className={`text-sm ${styling.textClass}`}>{hintTextToShow}</p>
          </div>
        </div>
        
        {/* Show AI help button for interval hints or complex behaviors */}
        {(hintSource === 'interval' || (detectedBehavior && ['struggling', 'guessing', 'repeating'].includes(detectedBehavior))) && (
          <button
            onClick={onRequestAIHelp}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              hintSource === 'interval' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : styling.textClass === 'text-yellow-800' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : styling.textClass === 'text-orange-800'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            Get AI Help
          </button>
        )}
      </div>
    </div>
  );
}