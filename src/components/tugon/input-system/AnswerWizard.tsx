import { useEffect, useState } from "react";
import type { PredefinedAnswer } from "@/components/data/answers/types";
import { getAnswerForQuestion } from "@/components/data/answers/index";
import { cn } from "../../cn";
import UserInput from "./UserInput";
import InputValidator from "./UserInputValidator";
import type { UserAttempt } from "./UserInput";

/** Public step type if a parent wants to pre-seed steps (kept for API parity) */
export type Step = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type?: "single" | "multi";
  answerValue?: string | string[];
};

/** Internal step state we manage locally */
export type WizardStep = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type: "single" | "multi";
  answerValue: string[];
};

export interface AnswerWizardProps {
  steps?: Step[]; // optional (we derive from answers normally)
  mathMode?: boolean;

  expectedAnswers?: PredefinedAnswer[]; // usually omitted; we derive from getAnswerForQuestion
  className?: string;
  disabled?: boolean;

  topicId?: number;
  categoryId?: number;
  questionId?: number;

  onValidationResult?: (
    type: "correct" | "incorrect" | "partial",
    currentStep: number
  ) => void;
  onAnswerChange?: (index: number, value: string) => void;
  onAttemptUpdate?: (attempts: UserAttempt[]) => void;

  /** Called when the user hits Enter on a step (we pass the current wizardSteps) */
  onSubmit: (finalSteps: WizardStep[], validationResult?: any) => void;

  /** Notify parent which step is active */
  onIndexChange: (index: number) => void;

  // (Optional) Display fields if you want a question header somewhere else
  questionText?: string;
  questionType?: string;
  title?: string;
  fallbackText?: string;
}

export default function AnswerWizard({
  steps: inputSteps,
  onSubmit,
  onIndexChange,
  expectedAnswers,
  onValidationResult,
  onAnswerChange,
  onAttemptUpdate,
  className,
  disabled = false,
  topicId,
  categoryId,
  questionId,
}: AnswerWizardProps) {
  /** Build the answers source: prefer prop; otherwise derive from DB by ids */
  const getExpectedStepsForQuestion = (): PredefinedAnswer[] => {
    if (expectedAnswers && expectedAnswers.length > 0) {
      return expectedAnswers;
    }
    if (topicId && categoryId && questionId) {
      const steps = getAnswerForQuestion(topicId, categoryId, questionId);
      if (steps) {
        return [
          {
            questionId,
            questionText: `Question ${questionId}`,
            type: "multiLine",
            steps,
          } as unknown as PredefinedAnswer,
        ];
      }
    }
    return [];
  };

  const answersSource: PredefinedAnswer[] = getExpectedStepsForQuestion();

  /** Initialize one WizardStep per expected step group (usually one) */
  const initialWizardSteps: WizardStep[] = (answersSource || []).map((_, i) => ({
    id: `s${i + 1}`,
    type: "multi",
    answerValue: [""],
  }));

  // Local state
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>(initialWizardSteps);
  const [index, setIndex] = useState(0);
  const [correctness, setCorrectness] = useState<Array<boolean | null>>(
    Array.from({ length: initialWizardSteps.length }, () => null)
  );
  const [showHints, setShowHints] = useState(false);

  // Store user input lines per step
  const [userInputs, setUserInputs] = useState<string[][]>(
    initialWizardSteps.map(() => [""])
  );

  // Reset when the question changes
  useEffect(() => {
    const nextWizardSteps: WizardStep[] = (answersSource || []).map((_, i) => ({
      id: `s${i + 1}`,
      type: "multi",
      answerValue: [""],
    }));

    setWizardSteps(nextWizardSteps);
    setIndex(0);
    setCorrectness(Array.from({ length: nextWizardSteps.length }, () => null));
    setUserInputs(nextWizardSteps.map(() => [""]));
    setShowHints(false);

    // Debug only
    console.log("🔄 AnswerWizard reset:", {
      topicId,
      categoryId,
      questionId,
      steps: nextWizardSteps.length,
      expectedSteps: answersSource?.[0]?.steps,
    });
  }, [topicId, categoryId, questionId, answersSource]);

  // Tell parent whenever active index changes
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const arrayToString = (lines: string[]) => lines.join("\n");

  // User hit Enter inside the UserInput (we do not re-validate; UserInput already did)
  const handleEnterSubmission = (lines: string[]) => {
    setShowHints(false);

    // Persist the current step’s lines
    setWizardSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines };
      return next;
    });

    // Keep the complete set for parent
    onSubmit(wizardSteps);

    // Optionally show hints after a tiny delay (UX nicety)
    setTimeout(() => setShowHints(true), 200);
  };

  const handleSuggestSubmission = () => {
    // Keep this lightweight to avoid double validations
    console.log("Suggestion: finish the step and press Enter to submit.");
  };

  // Input changed in UserInput
  const handleInputChange = (lines: string[]) => {
    // Persist in wizardSteps
    setWizardSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines };
      return next;
    });

    // Mirror into userInputs (for any aggregate checks you might add later)
    setUserInputs((prev) => {
      const next = [...prev];
      next[index] = [...lines];
      return next;
    });

    // Bubble a string version for external consumers
    onAnswerChange?.(index, arrayToString(lines));
  };

  // Manual submit hook (rarely used since Enter handles it)
  const handleSubmit = () => {
    // If you need an aggregate status, you can use validateAllSteps here.
    // We’ll pass the wizardSteps back up either way.
    const validationResult = undefined;
    onSubmit(wizardSteps, validationResult);
  };

  // Current step panel
  const total = wizardSteps.length;
  const current = wizardSteps[index];

  return (
    <div className={cn("rounded-2xl p-4 space-y-4", className)}>
      {current && (
        <div className="space-y-3">
          {(() => {
            const answerLines = current.answerValue || [""];
            const expectedSteps = answersSource?.[index]?.steps;

            // We only use this for styling (no side effects!)
            const validationSnapshot = InputValidator.getValidationResult(
              answerLines,
              expectedSteps,
              index,
              correctness[index]
            );

            const inputClasses = cn(
              "transition-all duration-200",
              validationSnapshot.isCorrect && "border-green-500 bg-green-50",
              validationSnapshot.isWrong && "border-red-500 bg-red-50"
            );

            return (
              <div className="space-y-2">
                <UserInput
                  key={`user-input-${index}-${topicId}-${categoryId}-${questionId}`}
                  value={answerLines}
                  onChange={handleInputChange}
                  placeholder="Enter your answer..."
                  maxLines={8}
                  disabled={Boolean(disabled || correctness[index] === true)}
                  className={inputClasses}
                  expectedSteps={expectedSteps}
                  onSubmit={handleEnterSubmission}
                  onSuggestSubmission={handleSuggestSubmission}
                  onSpamDetected={() => {
                    // keep extremely light; UserInput throttles itself
                    console.log("Spam detected – ignoring burst input.");
                  }}
                  onResetSpamFlag={() => {}}
                  showHints={showHints}
                  hintText={""}
                  onRequestHint={() => setShowHints(true)}
                  onAttemptUpdate={onAttemptUpdate}
                  onValidationResult={onValidationResult}
                  topicId={topicId}
                  categoryId={categoryId}
                  questionId={questionId}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Optional external submit button (usually not needed) */}
      {total > 0 && (
        <div className="hidden">
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}