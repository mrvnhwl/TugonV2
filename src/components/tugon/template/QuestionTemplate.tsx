// src/components/tugon/templates/QuestionTemplate.tsx
import React from 'react';
import AnswerWizard, { WizardStep } from '../input-system/AnswerWizard';
import { FillInBlanksTemplate } from './FillInTheBlanks';
import { getQuestionByIds } from '../../data/questions/index';

interface QuestionTemplateProps {
  topicId: number;
  categoryId: number;
  questionId: number;
  onValidationResult: (type: "correct" | "incorrect" | "partial", currentStep: number) => void;
  onAnswerChange?: () => void;
  onSubmit: (finalSteps: WizardStep[], validationResult?: any) => void;
  onIndexChange: (index: number) => void;
  onAttemptUpdate?: (attempt: any) => void;
  expectedAnswers: any;
}

export default function QuestionTemplate({
  topicId,
  categoryId,
  questionId,
  onValidationResult,
  expectedAnswers,
  onSubmit,
  onIndexChange,
  ...otherProps
}: QuestionTemplateProps) {
  const question = getQuestionByIds(topicId, categoryId, questionId);
  
  if (!question) {
    return <div>Question not found</div>;
  }
  
  // Route based on question type
  switch (question.question_type) {
    case "fill-in-blanks":
      return (
      <FillInBlanksTemplate
          topicId={topicId}
          categoryId={categoryId}
          questionId={questionId}
          onValidationResult={(type) => onValidationResult(type, 0)}
          onAnswerChange={otherProps.onAnswerChange}
        />
      );
      
    case "multiple-choice":
      return <div>Multiple Choice - Coming Soon</div>;
      
    case "true-false":
      return <div>True/False - Coming Soon</div>;
      
    default:
      // Fall back to existing step-by-step AnswerWizard
      return (
         <AnswerWizard
          key={`step-by-step-${topicId}-${categoryId}-${questionId}`}
          topicId={topicId}
          categoryId={categoryId}
          questionId={questionId}
          steps={[]} // Pass empty array - AnswerWizard will generate its own
          expectedAnswers={expectedAnswers}
          onValidationResult={onValidationResult}
          onSubmit={onSubmit}
          onIndexChange={onIndexChange}
          onAnswerChange={otherProps.onAnswerChange}
          onAttemptUpdate={otherProps.onAttemptUpdate}
        />
      );
  }
}