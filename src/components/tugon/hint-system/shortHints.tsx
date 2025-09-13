import { useState, useEffect } from "react";
import { BehaviorType, UserBehaviorProfile } from "../input-system/UserBehaviorClassifier";
import UserBehaviorClassifier from "../input-system/UserBehaviorClassifier";
import type { UserAttempt } from "../input-system/UserInput";
import { defaultTopics, type Topic, type Question, type GivenQuestion } from "../../data/question";
import { getAnswerStringsForQuestion } from "../../data/answers";

export interface ShortHintsProps {
  topicId?: number; // ← Make optional to match UserInput props
  categoryId?: number; // ← Make optional to match UserInput props
  questionId?: number; // ← Make optional to match UserInput props
  userAttempts: UserAttempt[];
  currentStepIndex: number;
  behaviorProfile?: UserBehaviorProfile | null;
  isVisible: boolean;
  onHintRequest?: () => void;
  onRequestHint?: () => void;
  hintText?: string;
  onRequestAIHelp?: () => void;
  attemptsSinceLastHint?: number;
  hintIntervalActive?: boolean;
  hintIntervalThreshold?: number;
}

export interface StepContext {
  topicId: number;
  categoryId: number;
  questionId: number;
  userAttempts: UserAttempt[];
  currentStepIndex: number;
  behaviorProfile?: UserBehaviorProfile | null;
}

// API configuration for AI hints
const AI_HINT_ENDPOINT = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE
      ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/api/gemini-hint`
      : "/api/gemini-hint")
  : "/api/gemini-hint";

export default function ShortHints({
  topicId,
  categoryId,
  questionId,
  userAttempts,
  currentStepIndex,
  behaviorProfile,
  isVisible,
  onHintRequest,
  hintText,
  onRequestAIHelp,
  attemptsSinceLastHint = 0,
  hintIntervalActive = false,
  hintIntervalThreshold = 3
}: ShortHintsProps) {
  const [hintTextState, setHintTextState] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Early return if required props are missing
  if (!topicId || !categoryId || !questionId) {
    console.log('⚠️ ShortHints: Missing required props', { topicId, categoryId, questionId });
    return null;
  }

  useEffect(() => {
    if (isVisible) {
      generateHint();
    }
  }, [isVisible, topicId, categoryId, questionId, behaviorProfile, userAttempts]);

  /**
   * Get question context from question data - using guide_text as context
   */
  const getQuestionContext = (topicId: number, categoryId: number, questionId: number) => {
    const topic = defaultTopics.find((t: Topic) => t.id === topicId);
    const category = topic?.level.find((c: Question) => c.category_id === categoryId);
    const question = category?.given_question.find((q: GivenQuestion) => q.question_id === questionId);
    const expectedAnswers = getAnswerStringsForQuestion(topicId, categoryId, questionId);
    
    return {
      topicName: topic?.name || 'Unknown Topic',
      categoryQuestion: category?.category_question || 'Unknown Category',
      questionText: question?.question_text || 'Unknown Question',
      guideText: question?.guide_text || 'No guide available',
      context: question?.guide_text || 'No additional context available', // ← Use guide_text as context
      expectedAnswers: expectedAnswers || []
    };
  };

  /**
   * Generate AI prompt based on context and behavior - using guide_text as context
   */
  const generateAIPrompt = (
    questionContext: ReturnType<typeof getQuestionContext>,
    behavior: BehaviorType,
    userAttempts: UserAttempt[]
  ): string => {
    const recentAttempts = userAttempts.slice(-3); // Last 3 attempts
    
    let prompt = `You are an educational AI helping a student with ${questionContext.topicName}.

Question: ${questionContext.questionText}
Category: ${questionContext.categoryQuestion}
Learning Context: ${questionContext.context}
Expected approach: ${questionContext.guideText}

Student's recent attempts:`;

    recentAttempts.forEach((attempt, index) => {
      prompt += `\nAttempt ${index + 1}: "${attempt.userInput}" - ${attempt.isCorrect ? 'Correct' : 'Incorrect'}`;
    });

    prompt += `\n\nDetected behavior: ${behavior}`;

    switch (behavior) {
      case 'struggling':
        prompt += `\nThe student is having difficulty. Based on the learning context "${questionContext.context}", provide a gentle, encouraging hint that breaks down the concept without giving away the answer.`;
        break;
      case 'guessing':
        prompt += `\nThe student appears to be guessing rapidly. Help them slow down and think methodically about the problem using the context: "${questionContext.context}".`;
        break;
      case 'repeating':
        prompt += `\nThe student is repeating the same mistake. Help them identify what's wrong with their approach based on: "${questionContext.context}".`;
        break;
      case 'self-correction':
        prompt += `\nThe student is self-correcting well. Provide encouraging guidance to continue their good approach with: "${questionContext.context}".`;
        break;
      default:
        prompt += `\nProvide helpful guidance appropriate for their current situation using: "${questionContext.context}".`;
    }

    prompt += `\n\nProvide a concise, helpful hint (max 2 sentences) that guides without solving.`;
    
    return prompt;
  };

  /**
   * Get fallback AI message for different behaviors - using guide_text context
   */
  const getFallbackAIMessage = (behavior: BehaviorType, context?: string): string => {
    const contextText = context ? ` Remember: ${context}` : "";
    
    const fallbacks: Record<BehaviorType, string> = {
      'struggling': `Take your time to understand each step. Break down the problem and work through it systematically.${contextText}`,
      'guessing': `Instead of guessing, take a moment to think about what the question is asking and what approach might work.${contextText}`,
      'repeating': `It looks like you're trying the same approach. Consider what might be different about this problem.${contextText}`,
      'self-correction': `Excellent self-awareness! Keep refining your understanding.${contextText}`
    };
    
    return fallbacks[behavior] || `Keep working through this step by step. You've got this!${contextText}`;
  };

  /**
   * AI Hint Generation Helper - using guide_text as context
   */
  const getAIHint = async (
    stepContext: StepContext,
    detectedBehavior: BehaviorType
  ): Promise<string> => {
    console.log('🤖 shortHints: getAIHint called with:');
    console.log('   - stepContext:', stepContext);
    console.log('   - detectedBehavior:', detectedBehavior);
    
    try {
      // Get question context
      const questionContext = getQuestionContext(
        stepContext.topicId,
        stepContext.categoryId,
        stepContext.questionId
      );
      
      console.log('📋 shortHints: Question context retrieved:', questionContext);
      console.log('🌐 shortHints: AI_HINT_ENDPOINT:', AI_HINT_ENDPOINT);
      
      // Prepare the API request payload - using guide_text as context
      const payload = {
        model: "gemini-1.5-flash",
        constraints: {
          maxTokens: 200,
          temperature: 0.7,
          format: "educational_hint"
        },
        context: {
          topicName: questionContext.topicName,
          categoryQuestion: questionContext.categoryQuestion,
          questionText: questionContext.questionText,
          guideText: questionContext.guideText,
          questionContext: questionContext.guideText, // ← Use guide_text as questionContext
          expectedAnswers: questionContext.expectedAnswers,
          detectedBehavior,
          currentStepIndex: stepContext.currentStepIndex
        },
        userAttempts: stepContext.userAttempts.map(attempt => ({
          stepIndex: attempt.stepIndex,
          userInput: attempt.userInput,
          isCorrect: attempt.isCorrect,
          expectedAnswer: attempt.expectedAnswer,
          timeSpent: attempt.timeSpentOnStep,
          isIdleSubmission: (attempt as any).isIdleSubmission || false
        })),
        prompt: generateAIPrompt(questionContext, detectedBehavior, stepContext.userAttempts)
      };

      console.log('📤 shortHints: Sending payload to AI endpoint:', payload);
      console.log('📤 shortHints: Payload size:', JSON.stringify(payload).length, 'characters');

      // Send POST request to AI service
      const response = await fetch(AI_HINT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 shortHints: Response status:', response.status);
      console.log('📥 shortHints: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ shortHints: API Error Response:', errorText);
        throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ shortHints: Raw API response:', result);
      
      // Try multiple possible response fields
      let hintText = null;
      const possibleFields = ['hint', 'response', 'message', 'content', 'text', 'answer'];
      
      for (const field of possibleFields) {
        if (result[field] && typeof result[field] === 'string' && result[field].trim()) {
          hintText = result[field].trim();
          console.log(`✅ shortHints: Found hint in field '${field}':`, hintText);
          break;
        }
      }
      
      if (!hintText && result.data && typeof result.data === 'object') {
        for (const field of possibleFields) {
          if (result.data[field] && typeof result.data[field] === 'string' && result.data[field].trim()) {
            hintText = result.data[field].trim();
            console.log(`✅ shortHints: Found hint in nested field 'data.${field}':`, hintText);
            break;
          }
        }
      }
      
      if (hintText) {
        return hintText;
      }
      
      // Parse response and return hint (fallback)
      if (result.hint && typeof result.hint === 'string' && result.hint.trim()) {
        console.log('✅ shortHints: Found hint in response:', result.hint);
        return result.hint.trim();
      }
      
      console.log('⚠️ shortHints: No hint found in response, using fallback');
      
      // Fallback if no hint in response - include guide_text context
      const fallback = getFallbackAIMessage(detectedBehavior, questionContext.guideText);
      console.log('🔄 shortHints: Using fallback message:', fallback);
      return fallback;
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ shortHints: AI Hint Generation Error:', error);
        console.error('❌ shortHints: Error name:', error.name);
        console.error('❌ shortHints: Error message:', error.message);
        console.error('❌ shortHints: Error stack:', error.stack);
      } else {
        console.error('❌ shortHints: AI Hint Generation Error:', error);
      }
      
      // Get question context for fallback
      const questionContext = getQuestionContext(
        stepContext.topicId,
        stepContext.categoryId,
        stepContext.questionId
      );
      
      const fallback = getFallbackAIMessage(detectedBehavior, questionContext.guideText);
      console.log('🔄 shortHints: Using error fallback message:', fallback);
      return fallback;
    }
  };

  /**
   * Generate local short hints as fallback - enhanced with guide_text context
   */
  const generateLocalShortHints = (
    behavior: BehaviorType,
    questionContext: ReturnType<typeof getQuestionContext>
  ): string[] => {
    const { categoryQuestion, guideText } = questionContext;
    const contextHint = guideText ? ` Hint: ${guideText}` : "";
    
    const generalHintTemplates: Record<BehaviorType, string[]> = {
      'struggling': [
        `It looks like you're having trouble with ${categoryQuestion}. Try breaking the problem into smaller parts.${contextHint}`,
        `Having difficulty with this step? Review what the question is asking about ${categoryQuestion}.${contextHint}`,
        `This part of ${categoryQuestion} can be tricky. Take it one step at a time.${contextHint}`
      ],
      'guessing': [
        `You're submitting answers very quickly. Take a moment to think through this ${categoryQuestion} problem.${contextHint}`,
        `Slow down and consider what ${categoryQuestion} is really asking.${contextHint}`,
        `Random attempts won't help with ${categoryQuestion}. Think systematically about your approach.${contextHint}`
      ],
      'repeating': [
        `You're repeating the same approach to ${categoryQuestion}. Try thinking about it differently.${contextHint}`,
        `The same method isn't working for ${categoryQuestion}. What could you try instead?${contextHint}`,
        `It seems you're stuck in a loop with ${categoryQuestion}. Consider a fresh perspective.${contextHint}`
      ],
      'self-correction': [
        `Excellent self-correction on ${categoryQuestion}! You're on the right track.${contextHint}`,
        `Great job identifying and fixing your approach to ${categoryQuestion}.${contextHint}`,
        `Perfect self-awareness with ${categoryQuestion}. Continue refining your method.${contextHint}`
      ]
    };
    
    return generalHintTemplates[behavior] || [
      `Keep working on ${categoryQuestion}. You're making progress.${contextHint}`
    ];
  };

  /**
   * Generate hint - main function
   */
  const generateHint = async () => {
    // Early validation
    if (!topicId || !categoryId || !questionId) {
      console.log('❌ ShortHints: Cannot generate hint - missing required IDs');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get question context
      const questionContext = getQuestionContext(topicId, categoryId, questionId);
      
      // Analyze behavior if not provided
      const actualBehaviorProfile = behaviorProfile || 
        UserBehaviorClassifier.analyzeUserBehavior(userAttempts);
      
      // Get detected behavior
      const currentStepBehavior = actualBehaviorProfile?.stepBehaviors?.[currentStepIndex];
      const detectedBehavior = currentStepBehavior?.primaryBehavior || null;
      
      console.log('🎯 shortHints: Detected behavior:', detectedBehavior);
      console.log('🎯 shortHints: Guide text context:', questionContext.guideText);
      
      let hintTextToShow = "";
      
      if (detectedBehavior) {
        // Try AI hint for specific behaviors
        if (['struggling', 'repeating'].includes(detectedBehavior)) {
          try {
            const stepContext: StepContext = {
              topicId,
              categoryId,
              questionId,
              userAttempts,
              currentStepIndex,
              behaviorProfile: actualBehaviorProfile
            };
            
            hintTextToShow = await getAIHint(stepContext, detectedBehavior);
            console.log('✅ shortHints: Got AI hint:', hintTextToShow);
          } catch (aiError) {
            console.error('❌ shortHints: AI hint failed, using local hint:', aiError);
            // Fallback to local hints
            const localHints = generateLocalShortHints(detectedBehavior, questionContext);
            hintTextToShow = localHints[0];
          }
        } else {
          // Use local hints for other behaviors
          const localHints = generateLocalShortHints(detectedBehavior, questionContext);
          hintTextToShow = localHints[0];
        }
      }
      
      // Final fallback to guide_text or prop hintText
      if (!hintTextToShow) {
        hintTextToShow = hintText || questionContext.guideText || "Keep working through this step by step.";
      }
      
      setHintTextState(hintTextToShow);
      
    } catch (error) {
      console.error("❌ shortHints: Failed to generate hint:", error);
      const fallbackContext = getQuestionContext(topicId, categoryId, questionId);
      setHintTextState(hintText || fallbackContext.guideText || "Keep working through this step by step.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
            💡 Hint
            {isLoading && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h3>
          {isLoading ? (
            <div className="mt-2 text-sm text-blue-700">
              <div className="animate-pulse">Generating personalized hint...</div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-blue-700 leading-relaxed">
              {hintTextState}
            </div>
          )}
          
          {onHintRequest && !isLoading && (
            <button
              onClick={() => {
                onHintRequest();
                generateHint(); // Regenerate hint when requested
              }}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
            >
              Need another hint?
            </button>
          )}

          {/* Show hint interval indicator */}
          {hintIntervalActive && (
            <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              🤖 AI hint available - {attemptsSinceLastHint}/{hintIntervalThreshold} attempts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}