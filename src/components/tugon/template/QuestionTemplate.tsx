// src/components/tugon/templates/QuestionTemplate.tsx
import { useState, useEffect } from "react";
import AnswerWizard, { WizardStep } from "../input-system/AnswerWizard";
import { FillInBlanksTemplate } from "./FillInTheBlanks";
import { supabase } from "../../../lib/supabase";
import type { GivenQuestion } from "../../data/questions/types";

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
  // 🔹 State for question data from Supabase
  const [question, setQuestion] = useState<GivenQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch question data from Supabase
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("tugonsense_questions")
          .select("*")
          .eq("topic_id", topicId)
          .eq("category_id", categoryId)
          .eq("question_id", questionId)
          .single();

        if (fetchError) {
          console.error("Error fetching question:", fetchError);
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError("Question not found");
          return;
        }

        // 🔹 Map database fields to GivenQuestion format
        const mappedQuestion: GivenQuestion = {
          question_id: data.question_id,
          question_text: data.question_text,
          guide_text: data.guide_text || "",
          category_text: data.category_text || undefined,
          question_type: data.question_type as GivenQuestion["question_type"],
        };

        setQuestion(mappedQuestion);
      } catch (err: any) {
        console.error("Error loading question:", err);
        setError(err.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [topicId, categoryId, questionId]);

  // 🔸 Loading state
  if (loading) {
    return (
      <div className="p-6 text-center bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-gray-500 text-sm mt-3">Loading question...</p>
      </div>
    );
  }

  // 🔸 Error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">
        ⚠️ Error loading question: {error}
      </div>
    );
  }

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
