import { Topic1_Category1_Hints } from './topic1/category1';
import { Topic1_Category2_Hints } from './topic1/category2';
import { Topic1_Category3_Hints } from './topic1/category3';
import { Topic1_Category4_Hints } from './topic1/category4';
import type { CategoryHints, QuestionHints, BehaviorType } from './types';

/**
 * Central registry of all hint collections organized by topic and category
 */
const HintCollections: Record<number, Record<number, CategoryHints>> = {
  1: { // Topic 1: Functions
    1: Topic1_Category1_Hints,
    2: Topic1_Category2_Hints,
    3: Topic1_Category3_Hints,
    4: Topic1_Category4_Hints
  }
  // Future topics can be added here:
  // 2: { ... } // Topic 2
  // 3: { ... } // Topic 3
};

/**
 * Retrieves hints for a specific question
 * @param topicId - The topic ID (e.g., 1 for Functions)
 * @param categoryId - The category ID within the topic (1-4)
 * @param questionId - The question ID within the category
 * @returns QuestionHints object or null if not found
 */
export function getQuestionHints(
  topicId: number,
  categoryId: number,
  questionId: number
): QuestionHints | null {
  const topic = HintCollections[topicId];
  if (!topic) return null;

  const category = topic[categoryId];
  if (!category) return null;

  const question = category.questions.find(q => q.questionId === questionId);
  return question || null;
}

/**
 * Retrieves a specific hint for a given step and behavior type
 * @param topicId - The topic ID
 * @param categoryId - The category ID
 * @param questionId - The question ID
 * @param stepLabel - The step label (e.g., "substitution", "evaluation", "final")
 * @param behaviorType - The behavior type detected by BehaviorAnalyzer
 * @returns Hint string or null if not found
 */
export function getStepHint(
  topicId: number,
  categoryId: number,
  questionId: number,
  stepLabel: string,
  behaviorType: BehaviorType
): string | null {
  const questionHints = getQuestionHints(topicId, categoryId, questionId);
  if (!questionHints) return null;

  const stepHint = questionHints.stepHints.find(
    step => step.stepLabel.toLowerCase() === stepLabel.toLowerCase()
  );
  if (!stepHint) return null;

  // Map behavior type to corresponding hint
  switch (behaviorType) {
    case 'sign-error':
      return stepHint.signErrorHint || stepHint.genericHint;
    case 'magnitude-error':
      return stepHint.magnitudeErrorHint || stepHint.genericHint;
    case 'close-attempt':
      return stepHint.closeAttemptHint || stepHint.genericHint;
    case 'repetition':
      return stepHint.repetitionHint || stepHint.genericHint;
    case 'guessing':
      return stepHint.guessingHint || stepHint.genericHint;
    case 'random':
    default:
      return stepHint.genericHint;
  }
}

/**
 * Retrieves common mistakes for a specific step
 * @param topicId - The topic ID
 * @param categoryId - The category ID
 * @param questionId - The question ID
 * @param stepLabel - The step label
 * @returns Array of common mistake strings or empty array if not found
 */
export function getCommonMistakes(
  topicId: number,
  categoryId: number,
  questionId: number,
  stepLabel: string
): string[] {
  const questionHints = getQuestionHints(topicId, categoryId, questionId);
  if (!questionHints) return [];

  const stepHint = questionHints.stepHints.find(
    step => step.stepLabel.toLowerCase() === stepLabel.toLowerCase()
  );
  
  return stepHint?.commonMistakes || [];
}

/**
 * Retrieves general tips for a question
 * @param topicId - The topic ID
 * @param categoryId - The category ID
 * @param questionId - The question ID
 * @returns Array of general tip strings or empty array if not found
 */
export function getGeneralTips(
  topicId: number,
  categoryId: number,
  questionId: number
): string[] {
  const questionHints = getQuestionHints(topicId, categoryId, questionId);
  return questionHints?.generalTips || [];
}

/**
 * Checks if hints are available for a given question
 * @param topicId - The topic ID
 * @param categoryId - The category ID
 * @param questionId - The question ID
 * @returns true if hints exist, false otherwise
 */
export function hasQuestionHints(
  topicId: number,
  categoryId: number,
  questionId: number
): boolean {
  return getQuestionHints(topicId, categoryId, questionId) !== null;
}

/**
 * Gets all available step labels for a question
 * @param topicId - The topic ID
 * @param categoryId - The category ID
 * @param questionId - The question ID
 * @returns Array of step labels
 */
export function getAvailableSteps(
  topicId: number,
  categoryId: number,
  questionId: number
): string[] {
  const questionHints = getQuestionHints(topicId, categoryId, questionId);
  if (!questionHints) return [];
  
  return questionHints.stepHints.map(step => step.stepLabel);
}

/**
 * Gets category information
 * @param topicId - The topic ID
 * @param categoryId - The category ID
 * @returns CategoryHints object or null if not found
 */
export function getCategoryInfo(
  topicId: number,
  categoryId: number
): CategoryHints | null {
  const topic = HintCollections[topicId];
  if (!topic) return null;
  
  return topic[categoryId] || null;
}

// Export hint collections for direct access if needed
export { HintCollections };

// Export types for convenience
export type { CategoryHints, QuestionHints, BehaviorType } from './types';
