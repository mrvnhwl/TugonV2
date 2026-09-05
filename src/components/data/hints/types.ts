/**
 * Hint System Type Definitions
 * Provides structured, context-aware hints for mathematical problem-solving
 */

export interface StepHint {
  stepLabel: string;  // e.g., "substitution", "evaluation", "final"
  genericHint: string;  // General hint for this step
  signErrorHint?: string;  // Specific hint for sign errors
  magnitudeErrorHint?: string;  // Specific hint for magnitude errors
  closeAttemptHint?: string;  // Specific hint when close
  repetitionHint?: string;  // Specific hint for repetition
  guessingHint?: string;  // Specific hint for random guessing
  commonMistakes?: string[];  // Array of common mistakes for this step
}

export interface QuestionHints {
  questionId: number;
  questionText: string;
  stepHints: StepHint[];  // One hint object per step
  generalTips?: string[];  // Overall tips for the question
}

export interface CategoryHints {
  categoryId: number;
  categoryName: string;
  questions: QuestionHints[];
}

export type BehaviorType = 
  | 'sign-error' 
  | 'magnitude-error' 
  | 'close-attempt' 
  | 'repetition' 
  | 'guessing' 
  | 'random'
  | 'default';
