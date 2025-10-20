// src/components/tugon/templates/QuestionTemplate.tsx
import React from "react";
import AnswerWizard, { WizardStep } from "../input-system/AnswerWizard";
import { FillInBlanksTemplate } from "./FillInTheBlanks";
import { getQuestionByIds } from "../../data/questions/index";

interface QuestionTemplateProps {
  topicId: number;
  categoryId: number;
  questionId: number;
  onValidationResult: (
    type: "correct" | "incorrect" | "partial",
    currentStep: number
  ) => void;
  onAnswerChange?: () => void;
  onSubmit: (finalSteps: WizardStep[], validationResult?: any) => void;
  onIndexChange: (index: number) => void;
  onAttemptUpdate?: (attempt: any) => void;
  expectedAnswers?: any; // ✨ OPTIONAL: Falls back to Supabase if not provided
}

/**
 * QuestionTemplate dynamically chooses which question format
 * (Fill-in-the-Blanks, Multiple-Choice, etc.) to render
 * based on the question_type defined in the question data.
 */
export default function QuestionTemplate({
  topicId,
  categoryId,
  questionId,
  onValidationResult,
  expectedAnswers,
  onSubmit,
  onIndexChange,
  onAnswerChange,
  onAttemptUpdate,
}: QuestionTemplateProps) {
  // 🔹 Get question data from JSON structure
  const question = getQuestionByIds(topicId, categoryId, questionId);

  // 🔸 Fallback if the question is missing or invalid
  if (!question) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">
        ⚠️ Question not found. Please check your topic, category, and question IDs.
      </div>
    );
  }

  // 🔹 Decide which component to render based on question type
  switch (question.question_type) {
    case "fill-in-blanks":
      return (
        <div className="p-4">
          <FillInBlanksTemplate
            topicId={topicId}
            categoryId={categoryId}
            questionId={questionId}
            onValidationResult={(type) => onValidationResult(type, 0)}
            onAnswerChange={onAnswerChange}
          />
        </div>
      );

    case "multiple-choice":
      return (
        <div className="p-6 text-center bg-white rounded-2xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-700 text-lg mb-2">
            Multiple Choice
          </h2>
          <p className="text-gray-500 text-sm">Coming soon...</p>
        </div>
      );

    case "true-false":
      return (
        <div className="p-6 text-center bg-white rounded-2xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-700 text-lg mb-2">
            True or False
          </h2>
          <p className="text-gray-500 text-sm">Coming soon...</p>
        </div>
      );

    default:
      // 🔹 Fallback: Render the main step-by-step AnswerWizard
      return (
        <div className="p-4">
          <AnswerWizard
            key={`step-by-step-${topicId}-${categoryId}-${questionId}`}
            topicId={topicId}
            categoryId={categoryId}
            questionId={questionId}
            steps={[]} // Let AnswerWizard auto-generate steps
            // ✨ Only pass expectedAnswers if provided (for testing/override)
            // Otherwise AnswerWizard fetches from Supabase using IDs
            {...(expectedAnswers && { expectedAnswers })}
            onValidationResult={onValidationResult}
            onSubmit={onSubmit}
            onIndexChange={onIndexChange}
            onAnswerChange={onAnswerChange}
            onAttemptUpdate={onAttemptUpdate}
          />
        </div>
      );
  }
}
