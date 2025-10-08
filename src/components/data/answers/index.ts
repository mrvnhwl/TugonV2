import type { Step } from './types';
// Import all answer arrays
// Topic 1 Introduction to Functions
import { Topic1_Category1_Answers } from './topic1/category1';
import { Topic1_Category2_Answers } from './topic1/category2';
import { Topic1_Category3_Answers } from './topic1/category3';
import { Topic1_Category4_Answers } from './topic1/category4';
import { Topic1_Category5_Answers } from './topic1/category5';
// Topic 2 Evaluating Functions
import { Topic2_Category1_Answers } from './topic2/category1';
import { Topic2_Category2_Answers } from './topic2/category2';
import { Topic2_Category3_Answers } from './topic2/category3';
// Topic 3 PieceWise Functions
import { Topic3_Category1_Answers } from './topic3/category1';
import { Topic3_Category2_Answers } from './topic3/category2';
import { Topic3_Category3_Answers } from './topic3/category3';
// Topic 4 Operations on Functions
import { Topic4_Category1_Answers } from './topic4/category1';
import { Topic4_Category2_Answers } from './topic4/category2';
import { Topic4_Category3_Answers } from './topic4/category3';
// Topic 5 Composite Functions
import { Topic5_Category1_Answers } from './topic5/category1';
import { Topic5_Category2_Answers } from './topic5/category2';
import { Topic5_Category3_Answers } from './topic5/category3';



export const answersByTopicAndCategory = {
  1: { // Introduction to Functions
    1: Topic1_Category1_Answers,
    2: Topic1_Category2_Answers,
    3: Topic1_Category3_Answers,
    4: Topic1_Category4_Answers,
    6: Topic1_Category5_Answers,
  
  },
  2: { // Evaluating Functions
    1: Topic2_Category1_Answers,
    2: Topic2_Category2_Answers,
    3: Topic2_Category3_Answers,
  },
  3: { // Piecewise-Defined Functions
    1: Topic3_Category1_Answers,
    2: Topic3_Category2_Answers,
    3: Topic3_Category3_Answers,
  },
  4: { // Operations on Functions
    1: Topic4_Category1_Answers,
    2: Topic4_Category2_Answers,
    3: Topic4_Category3_Answers,
  },
  5: { // Composition of Functions
    1: Topic5_Category1_Answers,
    2: Topic5_Category2_Answers,
    3: Topic5_Category3_Answers,
  },
} as const


// Updated helper function to use questionId
export function getAnswerForQuestion(
  topicId: number,
  categoryId: number,
  questionId: number
): Step[] | undefined {
  const topic = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
  if (!topic) return undefined;
  
  const category = topic[categoryId as keyof typeof topic];
  if (!category || !Array.isArray(category)) return undefined;
  
  // Find answer by questionId instead of array index
  const answer = category.find(answer => answer.questionId === questionId);
  return answer?.steps; // ← This should return Step[], not PredefinedAnswer[]
}

// Helper function to get answer strings for backward compatibility
export function getAnswerStringsForQuestion(
  topicId: number,
  categoryId: number,
  questionId: number
): string[] | undefined {
  const steps = getAnswerForQuestion(topicId, categoryId, questionId);
  return steps?.map(step => step.answer);
}

// Validation function to check mapping integrity
export function validateAnswerMapping() {
  const validationErrors: string[] = [];
  
  Object.entries(answersByTopicAndCategory).forEach(([topicId, categories]) => {
    Object.entries(categories).forEach(([categoryId, answers]) => {
      if (Array.isArray(answers)) {
        answers.forEach((answer, index) => {
          if (!answer.questionId) {
            validationErrors.push(
              `Missing questionId for Topic ${topicId}, Category ${categoryId}, Answer ${index + 1}`
            );
          }
          if (!answer.questionText) {
            validationErrors.push(
              `Missing questionText for Topic ${topicId}, Category ${categoryId}, Question ${answer.questionId}`
            );
          }
        });
      }
    });
  });
  
  if (validationErrors.length > 0) {
    console.error('Answer mapping validation errors:', validationErrors);
  }
  
  return validationErrors.length === 0;
}

// Backward compatibility - export for existing components
export const predefinedAnswers = Topic2_Category1_Answers