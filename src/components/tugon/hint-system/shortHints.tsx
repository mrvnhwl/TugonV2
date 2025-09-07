import React from 'react';
import type { UserAttempt } from '../input-system/UserInput';
import UserBehaviorClassifier, { 
  UserBehaviorProfile, 
  BehaviorTrigger, 
  StepBehaviorAnalysis,
  BehaviorType 
} from '../input-system/UserBehaviorClassifier';

export interface ShortHintsProps {
  // Behavior-based props
  userAttempts?: UserAttempt[];
  behaviorProfile?: UserBehaviorProfile|null;
  currentStepIndex?: number;
  
  // Manual hint props (fallback)
  hintText?: string;
  isVisible?: boolean;
  onRequestHint?: () => void;
  className?: string;
}

// Behavior-specific hint messages
const behaviorHintMessages: Record<BehaviorType, string> = {
  struggling: "It looks like you're having trouble. Try breaking the problem into smaller parts or reviewing the previous step.",
  "struggling-high": "You're experiencing significant difficulty. Consider asking for help or reviewing related concepts.",
  guessing: "You're submitting answers very quickly or randomly. Take a moment to think through your approach.",
  persistent: "Great persistence! Try to reflect on what might help you solve this step.",
  normal: "Keep going! You're making steady progress.",
  learning: "You're improving! Keep practicing and reviewing your steps.",
  'self-correction': "You're on the right track! Try to identify and correct your mistakes.",
  'excellent': "Outstanding work! Keep it up!",
  'repeating': "It seems you're stuck in a loop. Try a different approach.",
  'inactive': "You've been inactive for a while. Consider revisiting the material."
};

export default function ShortHints({
  userAttempts,
  behaviorProfile,
  currentStepIndex,
  hintText,
  isVisible = false,
  onRequestHint,
  className = ""
}: ShortHintsProps) {
  // Determine behavior-based hint
  let behaviorHint: string | undefined;
  let detectedBehavior: BehaviorType | undefined;
  
  if (
    behaviorProfile &&
    typeof currentStepIndex === "number" &&
    behaviorProfile.stepBehaviors[currentStepIndex]
  ) {
    const stepAnalysis = behaviorProfile.stepBehaviors[currentStepIndex];
    detectedBehavior = stepAnalysis.primaryBehavior;
    
    // Only show hint for non-normal behaviors
    if (detectedBehavior !== 'normal') {
      behaviorHint = behaviorHintMessages[detectedBehavior];
    }
  }

  // Priority: behavior-based hint > manual hint
  const finalHintText = behaviorHint || hintText;
  const shouldShow = isVisible || !!behaviorHint;

  if (!shouldShow || !finalHintText) {
    return null;
  }

  // Get behavior styling
  const getBehaviorStyling = (behavior?: BehaviorType) => {
    switch (behavior) {
      case 'struggling-high':
        return {
          bgClass: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
          iconClass: 'text-red-600',
          textClass: 'text-red-800',
          icon: '🚨'
        };
      case 'struggling':
        return {
          bgClass: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200',
          iconClass: 'text-yellow-600',
          textClass: 'text-yellow-800',
          icon: '⚠️'
        };
      case 'guessing':
        return {
          bgClass: 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200',
          iconClass: 'text-orange-600',
          textClass: 'text-orange-800',
          icon: '🎲'
        };
      case 'persistent':
        return {
          bgClass: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200',
          iconClass: 'text-purple-600',
          textClass: 'text-purple-800',
          icon: '🔄'
        };
      default:
        return {
          bgClass: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
          iconClass: 'text-yellow-600',
          textClass: 'text-yellow-800',
          icon: '💡'
        };
    }
  };

  const styling = getBehaviorStyling(detectedBehavior);

  return (
    <div className={`mt-2 p-3 ${styling.bgClass} border rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Behavior Icon */}
        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
          <span className={`text-lg ${styling.iconClass}`}>{styling.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Hint Header */}
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-medium ${styling.textClass}`}>
              {detectedBehavior ? `${detectedBehavior.replace('-', ' ').toUpperCase()} Detected` : 'Hint'}
            </h4>
          </div>

          {/* Hint Content */}
          <p className={`text-sm ${styling.textClass.replace('800', '700')} leading-relaxed`}>
            {finalHintText}
          </p>

          {/* Request Hint Button */}
          {onRequestHint && (
            <div className="mt-2">
              <button
                onClick={onRequestHint}
                className={`text-sm ${styling.iconClass} hover:${styling.textClass} hover:underline transition-colors duration-200`}
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