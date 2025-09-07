import UserBehaviorClassifier, { 
  BehaviorType, 
  UserBehaviorProfile 
} from '../tugon/input-system/UserBehaviorClassifier';
import type { UserAttempt } from '../tugon/input-system/UserInput';
import { defaultTopics, type Topic, type Question, type GivenQuestion } from './question';
import { getAnswerStringsForQuestion } from './answers';
import { getSpecificStruggleHints } from './struggleShortHints';

// Types for the structured hint system
export interface StepContext {
  topicId: number;
  categoryId: number;
  questionId: number;
  userAttempts: UserAttempt[];
  currentStepIndex: number;
  behaviorProfile?: UserBehaviorProfile|null;
}

export interface HintResponse {
  guideText?: string;
  shortHints: string[];
  longHints?: string;
  detectedBehavior?: BehaviorType;
  contextUsed: {
    categoryQuestion?: string;
    questionText?: string;
    expectedAnswers?: string[];
  };
}

// API configuration for AI hints
const AI_HINT_ENDPOINT = '/api/hints/generate'; // Adjust based on your API setup
const API_PATH = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE
      ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/api/gemini-hint`
      : "/api/gemini-hint")
  : "/api/gemini-hint";
/**
 * AI Hint Generation Helper
 */
export async function getAIHint(
  stepContext: StepContext,
  detectedBehavior: BehaviorType
): Promise<string> {
  try {
    // Get question context
    const questionContext = getQuestionContext(
      stepContext.topicId,
      stepContext.categoryId,
      stepContext.questionId
    );
    
    // Prepare the API request payload
    const payload = {
      model: "gemini-1.5-flash", // or your preferred model
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

    // Send POST request to AI service
    const response = await fetch(AI_HINT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Parse response and return hint
    if (result.hint && typeof result.hint === 'string' && result.hint.trim()) {
      return result.hint.trim();
    }
    
    // Fallback if no hint in response
    return getFallbackAIMessage(detectedBehavior);
    
  } catch (error) {
    console.error('AI Hint Generation Error:', error);
    return getFallbackAIMessage(detectedBehavior);
  }
}

/**
 * Generate AI prompt based on context and behavior
 */
function generateAIPrompt(
  questionContext: any,
  behavior: BehaviorType,
  userAttempts: UserAttempt[]
): string {
  const recentAttempts = userAttempts.slice(-3); // Last 3 attempts
  
  let prompt = `You are an educational AI helping a student with ${questionContext.topicName}.

Question: ${questionContext.questionText}
Category: ${questionContext.categoryQuestion}
Expected approach: ${questionContext.guideText}

Student's recent attempts:`;

  recentAttempts.forEach((attempt, index) => {
    prompt += `\nAttempt ${index + 1}: "${attempt.userInput}" - ${attempt.isCorrect ? 'Correct' : 'Incorrect'}`;
  });

  prompt += `\n\nDetected behavior: ${behavior}`;

  switch (behavior) {
    case 'struggling':
      prompt += `\nThe student is having difficulty. Provide a gentle, encouraging hint that breaks down the concept without giving away the answer.`;
      break;
    case 'struggling-high':
      prompt += `\nThe student is experiencing significant difficulty. Provide a more detailed explanation while still encouraging independent thinking.`;
      break;
    case 'guessing':
      prompt += `\nThe student appears to be guessing rapidly. Help them slow down and think methodically about the problem.`;
      break;
    case 'inactive':
      prompt += `\nThe student has been inactive. Provide motivation and a clear starting point.`;
      break;
    case 'repeating':
      prompt += `\nThe student is repeating the same mistake. Help them identify what's wrong with their approach.`;
      break;
    default:
      prompt += `\nProvide helpful guidance appropriate for their current situation.`;
  }

  prompt += `\n\nProvide a concise, helpful hint (max 2 sentences) that guides without solving.`;
  
  return prompt;
}

/**
 * Get fallback AI message for different behaviors
 */
function getFallbackAIMessage(behavior: BehaviorType): string {
  const fallbacks: Record<BehaviorType, string> = {
    'struggling': "Take your time to understand each step. Break down the problem and work through it systematically.",
    'struggling-high': "It's okay to find this challenging. Consider reviewing the basic concepts and try a step-by-step approach.",
    'guessing': "Instead of guessing, take a moment to think about what the question is asking and what approach might work.",
    'inactive': "Ready to get started? Take a look at the question and think about what information you're given.",
    'repeating': "It looks like you're trying the same approach. Consider what might be different about this problem.",
    'persistent': "Your persistence is admirable! Try approaching this from a different angle.",
    'normal': "You're doing well. Keep applying the same systematic approach.",
    'learning': "Great progress! Continue building on what you've learned.",
    'self-correction': "Excellent self-awareness! Keep refining your understanding.",
    'excellent': "Outstanding work! You're mastering this concept well."
  };
  
  return fallbacks[behavior] || "Keep working through this step by step. You've got this!";
}

/**
 * Get question context from question data
 */
function getQuestionContext(topicId: number, categoryId: number, questionId: number) {
  const topic = defaultTopics.find((t: Topic) => t.id === topicId);
  const category = topic?.level.find((c: Question) => c.category_id === categoryId);
  const question = category?.given_question.find((q: GivenQuestion) => q.question_id === questionId);
  const expectedAnswers = getAnswerStringsForQuestion(topicId, categoryId, questionId);
  
  return {
    topicName: topic?.name || 'Unknown Topic',
    categoryQuestion: category?.category_question || 'Unknown Category',
    questionText: question?.question_text || 'Unknown Question',
    guideText: question?.guide_text || 'No guide available',
    expectedAnswers: expectedAnswers || []
  };
}

/**
 * Generate guide text for inactive behavior or first hint for guessing
 */
function generateGuideText(
  behavior: BehaviorType,
  questionContext: ReturnType<typeof getQuestionContext>
): string {
  if (behavior === 'inactive') {
    return `Getting started with this problem: ${questionContext.guideText}`;
  }
  
  if (behavior === 'guessing') {
    return `Before guessing, remember: ${questionContext.guideText}`;
  }
  
  return questionContext.guideText;
}

/**
 * Generate context-aware short hints based on behavior
 */
function generateShortHints(
behavior: BehaviorType,
  questionContext: ReturnType<typeof getQuestionContext>,
  userAttempts: UserAttempt[]
): string[] {
  const { topicName, categoryQuestion, questionText } = questionContext;
  const recentAttempt = userAttempts[userAttempts.length - 1];
  
  // Get topic and question IDs from the context
  const topicId = defaultTopics.find((t: Topic) => t.name === topicName)?.id || 0;
  const category = defaultTopics.find((t: Topic) => t.name === topicName)?.level.find((c: Question) => c.category_question === categoryQuestion);
  const categoryId = category?.category_id || 0;
  const question = category?.given_question.find((q: GivenQuestion) => q.question_text === questionText);
  const questionId = question?.question_id || 0;
  // Individual question-specific hints for struggling behavior
  if (behavior === 'struggling') {
    const specificHints = getSpecificStruggleHints(topicId, categoryId, questionId);
    if (specificHints.length > 0) {
      return specificHints;
    }
  }
  
  // Fallback to general behavior-based hints
  const generalHintTemplates: Record<BehaviorType, string[]> = {
    'struggling': [
      `It looks like you're having trouble with ${categoryQuestion}. Try breaking the problem into smaller parts.`,
      `Having difficulty with this step? Review what the question is asking about ${categoryQuestion}.`,
      `This part of ${categoryQuestion} can be tricky. Take it one step at a time.`
    ],
    'struggling-high': [
      `You're experiencing significant difficulty with ${categoryQuestion}. Consider asking for help or reviewing related concepts.`,
      `This ${categoryQuestion} problem seems challenging. Let's break it down further.`,
      `Don't worry about the complexity of ${categoryQuestion}. Focus on the basics first.`
    ],
    'guessing': [
      `You're submitting answers very quickly. Take a moment to think through this ${categoryQuestion} problem.`,
      `Slow down and consider what ${categoryQuestion} is really asking.`,
      `Random attempts won't help with ${categoryQuestion}. Think systematically about your approach.`
    ],
    'inactive': [
      `Ready to work on ${categoryQuestion}? Start by reading the question carefully.`,
      `Let's get started with this ${categoryQuestion} problem. What information are you given?`,
      `Time to tackle ${categoryQuestion}. Begin by identifying what you need to find.`
    ],
    'repeating': [
      `You're repeating the same approach to ${categoryQuestion}. Try thinking about it differently.`,
      `The same method isn't working for ${categoryQuestion}. What could you try instead?`,
      `It seems you're stuck in a loop with ${categoryQuestion}. Consider a fresh perspective.`
    ],
    'persistent': [
      `Great persistence with ${categoryQuestion}! Try to reflect on what might help you solve this step.`,
      `Your determination with ${categoryQuestion} is admirable. Consider what you've learned so far.`,
      `Keep up the effort on ${categoryQuestion}. Think about what approach might work better.`
    ],
    'normal': [
      `You're making steady progress with ${categoryQuestion}. Keep going!`,
      `Good work on ${categoryQuestion}. Continue with your current approach.`,
      `Nice progress with this ${categoryQuestion} problem. Stay focused.`
    ],
    'learning': [
      `You're improving at ${categoryQuestion}! Keep practicing and reviewing your steps.`,
      `Great learning progress with ${categoryQuestion}. Build on what you've discovered.`,
      `Your understanding of ${categoryQuestion} is developing well. Keep it up!`
    ],
    'self-correction': [
      `Excellent self-correction on ${categoryQuestion}! You're on the right track.`,
      `Great job identifying and fixing your approach to ${categoryQuestion}.`,
      `Perfect self-awareness with ${categoryQuestion}. Continue refining your method.`
    ],
    'excellent': [
      `Outstanding work on ${categoryQuestion}! Keep up the excellent performance.`,
      `Perfect execution of ${categoryQuestion}! You've mastered this concept.`,
      `Excellent understanding of ${categoryQuestion}. Your approach is spot-on.`
    ]
  };
  
  return generalHintTemplates[behavior] || [
    `Keep working on ${categoryQuestion}. You're making progress.`
  ];
}

/**
 * Main function to get structured hints based on step context
 */
export async function getHints(stepContext: StepContext): Promise<HintResponse> {
  // Analyze current behavior
  const behaviorProfile = stepContext.behaviorProfile || 
    UserBehaviorClassifier.analyzeUserBehavior(stepContext.userAttempts);
  
  const currentStepBehavior = behaviorProfile.stepBehaviors[stepContext.currentStepIndex];
  const detectedBehavior = currentStepBehavior?.primaryBehavior || 'normal';
  
  // Get question context
  const questionContext = getQuestionContext(
    stepContext.topicId,
    stepContext.categoryId,
    stepContext.questionId
  );
  
  // Generate guide text (for inactive or guessing)
  let guideText: string | undefined;
  if (detectedBehavior === 'inactive' || detectedBehavior === 'guessing') {
    guideText = generateGuideText(detectedBehavior, questionContext);
  }
  
  // Generate short hints
  const shortHints = generateShortHints(
    detectedBehavior,
    questionContext,
    stepContext.userAttempts
  );
  
  // Generate long hints (AI) for complex behaviors
  let longHints: string | undefined;
  if (['struggling-high', 'persistent', 'repeating'].includes(detectedBehavior)) {
    try {
      longHints = await getAIHint(stepContext, detectedBehavior);
    } catch (error) {
      console.error('Failed to generate AI hints:', error);
      longHints = getFallbackAIMessage(detectedBehavior);
    }
  }
  
  return {
    guideText,
    shortHints,
    longHints,
    detectedBehavior,
    contextUsed: {
      categoryQuestion: questionContext.categoryQuestion,
      questionText: questionContext.questionText,
      expectedAnswers: questionContext.expectedAnswers
    }
  };
}

/**
 * Quick helper for getting just short hints (for existing shortHints.tsx)
 */
export function getShortHint(stepContext: StepContext): string {
  console.log('🔍 getShortHint called with:', stepContext);
  
  const questionContext = getQuestionContext(
    stepContext.topicId,
    stepContext.categoryId,
    stepContext.questionId
  );
  
  console.log('📄 Question context:', questionContext);
  
  const behaviorProfile = stepContext.behaviorProfile || 
    UserBehaviorClassifier.analyzeUserBehavior(stepContext.userAttempts);
  
  console.log('🧠 Behavior profile:', behaviorProfile);
  
  // Add safety check here
  if (!behaviorProfile || !behaviorProfile.stepBehaviors || !behaviorProfile.stepBehaviors[stepContext.currentStepIndex]) {
    console.log('❌ No behavior profile or step behavior found, returning fallback');
    return "Keep working through this step by step.";
  }
  
  const currentStepBehavior = behaviorProfile.stepBehaviors[stepContext.currentStepIndex];
  const detectedBehavior = currentStepBehavior?.primaryBehavior || 'normal';
  
  console.log('🎯 Detected behavior:', detectedBehavior);
  
  const hints = generateShortHints(detectedBehavior, questionContext, stepContext.userAttempts);
  console.log('💡 Generated hints:', hints);
  
  return hints[0] || "Keep working through this step by step.";
}

export function getGuideText(stepContext: StepContext): string | undefined {
  console.log('🎯 getGuideText called');
  
  const questionContext = getQuestionContext(
    stepContext.topicId,
    stepContext.categoryId,
    stepContext.questionId
  );
  
  const behaviorProfile = stepContext.behaviorProfile || 
    UserBehaviorClassifier.analyzeUserBehavior(stepContext.userAttempts);
  
  // Add safety check here
  if (!behaviorProfile || !behaviorProfile.stepBehaviors || !behaviorProfile.stepBehaviors[stepContext.currentStepIndex]) {
    console.log('❌ No behavior profile for guide text');
    return undefined;
  }
  
  const currentStepBehavior = behaviorProfile.stepBehaviors[stepContext.currentStepIndex];
  const detectedBehavior = currentStepBehavior?.primaryBehavior || 'normal';
  
  console.log('🎯 Guide text behavior:', detectedBehavior);
  
  if (detectedBehavior === 'inactive' || detectedBehavior === 'guessing') {
    return generateGuideText(detectedBehavior, questionContext);
  }
  
  return undefined;
}

// Export types and functions
