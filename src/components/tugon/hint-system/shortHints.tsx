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
  className = ""
}: ShortHintsProps) {
  
  // Don't show if not visible
  if (!isVisible || !behaviorProfile) {
    console.log('ShortHints: isVisible', isVisible, 'behaviorProfile', !!behaviorProfile);
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
    hintText
  });
  
  // Get detected behavior first
  let detectedBehavior: BehaviorType | undefined;
  if (behaviorProfile && behaviorProfile.stepBehaviors && behaviorProfile.stepBehaviors[currentStepIndex]) {
    detectedBehavior = behaviorProfile.stepBehaviors[currentStepIndex].primaryBehavior;
    console.log('🎯 Detected behavior from profile:', detectedBehavior);
  } else {
    console.log('❌ No behavior profile or step behavior found');
    // FIX: Don't show hint if no behavior is detected
    return null;
  }

  // TEMPORARY: Show hint even for normal behavior for testing
  // if (!detectedBehavior || detectedBehavior === 'normal') {
  //   console.log('🚫 Not showing hint - behavior is normal or undefined');
  //   return null;
  // }

  let hintTextToShow: string | undefined;

  // Try to get contextual hints if we have question context
  if (topicId !== undefined && categoryId !== undefined && questionId !== undefined) {
    try {
      const stepContext: StepContext = {
        topicId,
        categoryId,
        questionId,
        userAttempts,
        currentStepIndex,
        behaviorProfile
      };
      
      console.log('📋 Step context created:', stepContext);
      
      // Get guide text first (for inactive/guessing)
      hintTextToShow = getGuideText(stepContext);
      console.log('📖 Guide text:', hintTextToShow);
      
      // If no guide text, get behavior-based hint
      if (!hintTextToShow) {
        hintTextToShow = getShortHint(stepContext);
        console.log('💡 Short hint:', hintTextToShow);
      }
    } catch (error) {
      console.error('❌ Error getting hint from hints.ts:', error);
      // Fallback to manual hint
      hintTextToShow = hintText;
    }
  } else {
    console.log('⚠️ No question context, using manual hint');
    // No question context, use manual hint
    hintTextToShow = hintText;
  }

  // TEMPORARY: Always show something for testing
  if (!hintTextToShow) {
    hintTextToShow = "TEST: This is a test hint to verify component is working";
    console.log('🧪 Using test hint');
  }

  console.log('📄 Final hint to show:', hintTextToShow);

  // Get styling based on behavior (now guaranteed to be defined)
  const getBehaviorStyling = (behavior?: BehaviorType) => {
    switch (behavior) {
      case 'struggling-high':
        return { bgClass: 'bg-red-50 border-red-200', textClass: 'text-red-800', icon: '🚨' };
      case 'struggling':
        return { bgClass: 'bg-yellow-50 border-yellow-200', textClass: 'text-yellow-800', icon: '⚠️' };
      case 'guessing':
        return { bgClass: 'bg-orange-50 border-orange-200', textClass: 'text-orange-800', icon: '🎲' };
      case 'inactive':
        return { bgClass: 'bg-gray-50 border-gray-200', textClass: 'text-gray-800', icon: '😴' };
      case 'repeating':
        return { bgClass: 'bg-amber-50 border-amber-200', textClass: 'text-amber-800', icon: '🔁' };
      case 'excellent':
        return { bgClass: 'bg-green-50 border-green-200', textClass: 'text-green-800', icon: '⭐' };
      case 'self-correction':
        return { bgClass: 'bg-emerald-50 border-emerald-200', textClass: 'text-emerald-800', icon: '✨' };
      case 'persistent':
        return { bgClass: 'bg-purple-50 border-purple-200', textClass: 'text-purple-800', icon: '🔄' };
      case 'learning':
        return { bgClass: 'bg-blue-50 border-blue-200', textClass: 'text-blue-800', icon: '📚' };
      case 'normal':
      default:
        return { bgClass: 'bg-blue-50 border-blue-200', textClass: 'text-blue-800', icon: '💡' };
    }
  };

  const styling = getBehaviorStyling(detectedBehavior);

  console.log('🎨 Applied styling:', styling);
  console.log('✅ ShortHints component will render');

  return (
    <div className={`mt-2 p-3 ${styling.bgClass} border rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{styling.icon}</span>
        <div className="flex-1">
          <p className={`text-sm ${styling.textClass}`}>{hintTextToShow}</p>
        </div>
      </div>
    </div>
  );
}