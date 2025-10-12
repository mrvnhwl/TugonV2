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
  detectedBehavior?: BehaviorType | null;
  contextUsed: {
    categoryQuestion?: string;
    questionText?: string;
    expectedAnswers?: string[];
  };
}

// API configuration for AI hints
const AI_HINT_ENDPOINT = import.meta.env.DEV
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
  console.log('🤖 getAIHint called with:');
  console.log('   - stepContext:', stepContext);
  console.log('   - detectedBehavior:', detectedBehavior);
  
  try {
    // Get question context
    const questionContext = getQuestionContext(
      stepContext.topicId,
      stepContext.categoryId,
      stepContext.questionId
    );
    
    console.log('📋 Question context retrieved:', questionContext);
    console.log('🌐 AI_HINT_ENDPOINT:', AI_HINT_ENDPOINT);
    
    // Prepare the API request payload
    const payload = {
      model: "gemini-2.5-flash",
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

    console.log('📤 Sending payload to AI endpoint:', payload);
    console.log('📤 Payload size:', JSON.stringify(payload).length, 'characters');

    // Send POST request to AI service
    const response = await fetch(AI_HINT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Raw API response:', result);
    console.log('✅ Response type:', typeof result);
    console.log('✅ Response keys:', Object.keys(result));
    let hintText = null;
    const possibleFields = ['hint', 'response', 'message', 'content', 'text', 'answer'];
    for (const field of possibleFields) {
      if (result[field] && typeof result[field] === 'string' && result[field].trim()) {
        hintText = result[field].trim();
        console.log(`✅ Found hint in field '${field}':`, hintText);
        break;
      }
    }
    if (!hintText && result.data && typeof result.data === 'object') {
  for (const field of possibleFields) {
    if (result.data[field] && typeof result.data[field] === 'string' && result.data[field].trim()) {
      hintText = result.data[field].trim();
      console.log(`✅ Found hint in nested field 'data.${field}':`, hintText);
      break;
    }
  }
}
if (hintText) {
  return hintText;
}
    // Parse response and return hint
    if (result.hint && typeof result.hint === 'string' && result.hint.trim()) {
      console.log('✅ Found hint in response:', result.hint);
      return result.hint.trim();
    }
    
    console.log('⚠️ No hint found in response, using fallback');
    console.log('   - result.hint exists:', !!result.hint);
    console.log('   - result.hint type:', typeof result.hint);
    console.log('   - result.hint content:', result.hint);
    
    // Fallback if no hint in response
    const fallback = getFallbackAIMessage(detectedBehavior);
    console.log('🔄 Using fallback message:', fallback);
    return fallback;
    
  } catch (error) {
    if (error instanceof Error) {
    console.error('❌ AI Hint Generation Error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
  } else {
    console.error('❌ AI Hint Generation Error:', error);
  }
  const fallback = getFallbackAIMessage(detectedBehavior);
  console.log('🔄 Using error fallback message:', fallback);
  return fallback;
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
    case 'guessing':
      prompt += `\nThe student appears to be guessing rapidly. Help them slow down and think methodically about the problem.`;
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
    'guessing': "Instead of guessing, take a moment to think about what the question is asking and what approach might work.",
   
    'repeating': "It looks like you're trying the same approach. Consider what might be different about this problem.",

   
    'self-correction': "Excellent self-awareness! Keep refining your understanding."
   
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

    'guessing': [
      `You're submitting answers very quickly. Take a moment to think through this ${categoryQuestion} problem.`,
      `Slow down and consider what ${categoryQuestion} is really asking.`,
      `Random attempts won't help with ${categoryQuestion}. Think systematically about your approach.`
    ],
    
    'repeating': [
      `You're repeating the same approach to ${categoryQuestion}. Try thinking about it differently.`,
      `The same method isn't working for ${categoryQuestion}. What could you try instead?`,
      `It seems you're stuck in a loop with ${categoryQuestion}. Consider a fresh perspective.`
    ],
   
    
    'self-correction': [
      `Excellent self-correction on ${categoryQuestion}! You're on the right track.`,
      `Great job identifying and fixing your approach to ${categoryQuestion}.`,
      `Perfect self-awareness with ${categoryQuestion}. Continue refining your method.`
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
  // FIXED: Remove 'normal' fallback since it's not in BehaviorType anymore
  const detectedBehavior = currentStepBehavior?.primaryBehavior || null;
  
  // Get question context
  const questionContext = getQuestionContext(
    stepContext.topicId,
    stepContext.categoryId,
    stepContext.questionId
  );
  
  // Generate guide text (for inactive or guessing)
  let guideText: string | undefined;
  
  // Generate short hints - only if we have a detected behavior
  const shortHints = detectedBehavior 
    ? generateShortHints(detectedBehavior, questionContext, stepContext.userAttempts)
    : ["Keep working through this step by step."]; // Default hint for no behavior
  
  // Generate long hints (AI) for complex behaviors
  let longHints: string | undefined;
  if (detectedBehavior && ['repeating'].includes(detectedBehavior)) { // Removed 'persistent' since it's not in BehaviorType
    try {
      longHints = await getAIHint(stepContext, detectedBehavior);
    } catch (error) {
      console.error('Failed to generate AI hints:', error);
      longHints = detectedBehavior ? getFallbackAIMessage(detectedBehavior) : "Keep trying your best!";
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
  const detectedBehavior = currentStepBehavior?.primaryBehavior || null;
  
  console.log('🎯 Detected behavior:', detectedBehavior);
  
  if (detectedBehavior) {
    const hints = generateShortHints(detectedBehavior, questionContext, stepContext.userAttempts);
    console.log('💡 Generated hints:', hints);
    return hints[0] || "Keep working through this step by step.";
  }
  
    console.log('💡 No behavior detected, using default hint');
  return "Keep working through this step by step.";
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
    const detectedBehavior = currentStepBehavior?.primaryBehavior || null;
  
  console.log('🎯 Guide text behavior:', detectedBehavior);
  if (detectedBehavior) {
    return generateGuideText(detectedBehavior, questionContext);
  }

  
  return undefined;
}

// Export types and functions
