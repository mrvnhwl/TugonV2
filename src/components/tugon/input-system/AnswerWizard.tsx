import { useEffect, useMemo, useState } from "react";
import { predefinedAnswers as predefinedAnswersData } from "@/components/data/answers";
import type { PredefinedAnswer } from "@/components/data/answers";
import { cn } from "../../cn";
import UserInput from './UserInput';
import { CheckCircle } from "lucide-react";
import { Text, Small } from "../../Typography";

// Simplified answer types - only text-based now
export type AnswerType = "single" | "multi";

// Public input step shape (for initializing the wizard)
export type Step = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type?: AnswerType;
  // Text-based answer value (string for single, string[] for multi)
  answerValue?: string | string[];
};

// Internal state shape that the wizard manages
export type WizardStep = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type: AnswerType;
  // Unified answer content - always stored as string[] for consistency
  answerValue: string[];
};

type AnswerWizardProps = {
  steps?: Step[]; // treated as initial/hydration
  onSubmit: (steps: WizardStep[], result?: { correct: boolean[]; allCorrect: boolean }) => void;
  className?: string;
  onIndexChange?: (index: number) => void;
  // If provided, these expected answers will be used for step shapes and validation
  expectedAnswers?: PredefinedAnswer[];
  // Notify parent when the current step's unified answerValue changes
  onAnswerChange?: (index: number, value: string) => void;
  inputDisabled?: boolean;
  onSpamDetected?: () => void;
  onValidationResult?: (type: "correct" | "wrong" | "aiHint" | "spam") => void;
};

export default function AnswerWizard({ 
  steps: _initialSteps = [], 
  onSubmit, 
  className, 
  onIndexChange, 
  expectedAnswers, 
  onAnswerChange, 
  inputDisabled, 
  onSpamDetected, 
  onValidationResult 
}: AnswerWizardProps) {
  // Source answers: prefer per-question answers if provided; otherwise fall back to global sample
  const answersSource: PredefinedAnswer[] = expectedAnswers && expectedAnswers.length > 0
    ? expectedAnswers
    : (predefinedAnswersData || []);

  // Fixed steps derived strictly from the selected answers source
  const fixedSteps: WizardStep[] = (answersSource || []).map((_, i) => {
    // Default to multi-line format for all steps to allow expansion
    const t: AnswerType = "multi";
    return {
      id: `s${i + 1}`,
      type: t,
      answerValue: [''], // Always start with empty array
    } as WizardStep;
  });

  if (import.meta.env?.DEV) console.log("Total steps:", fixedSteps.length);

  const [steps, setSteps] = useState<WizardStep[]>(fixedSteps);
  const [index, setIndex] = useState(0);
  const [correctness, setCorrectness] = useState<Array<boolean | null>>(
    Array.from({ length: fixedSteps.length }, () => null)
  );

  const total = steps.length;
  const current = steps[index];

  // Notify parent when the active index changes
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  // Sanitizer shared by validation and submission
  const sanitizeText = (v: string) => (v ?? "").replace(/[\s\n\r]+/g, "").toLowerCase();

  // Unified validation function - now handles string arrays
  const validateAnswer = (step: WizardStep | undefined, answerLines: string[] | undefined, stepIndex: number): boolean => {
    if (!step || !answerLines) return false;
    
    // Join all lines for comparison
    const joinedAnswer = answerLines.join('\n').trim();
    if (!joinedAnswer) return false;

    const expected = answersSource?.[stepIndex]?.answer;
    if (!expected) {
      // Fallback: if no expected is defined, consider non-empty as valid
      return joinedAnswer.length > 0;
    }

    return sanitizeText(joinedAnswer) === sanitizeText(expected);
  };

  // Convert string[] to string for parent notifications
  const arrayToString = (lines: string[]): string => {
    return lines.join('\n');
  };

  // Handle input changes from UserInput
  const handleInputChange = (lines: string[]) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines } as WizardStep;
      return next;
    });
    
    // Notify parent with string representation
    onAnswerChange?.(index, arrayToString(lines));
  };

  // Handle submission manually if needed
  const handleSubmit = () => {
    const len = Math.min(answersSource.length, steps.length);
    const correctnessArr: boolean[] = [];
    for (let i = 0; i < len; i++) {
      const u = steps[i];
      correctnessArr.push(validateAnswer(u, u.answerValue, i));
    }
    const allCorrect = correctnessArr.length > 0 && correctnessArr.every(Boolean);
    onSubmit(steps, { correct: correctnessArr, allCorrect });
  };

  const handleValidationResult = (result: "correct" | "wrong" | "aiHint" | "spam") => {
    onValidationResult?.(result);
  };

  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm p-4 space-y-4", className)}>
      {/* Main input area */}
      {current && (
        <div className="space-y-3">
          {(() => {
            // Compute dynamic classes for input based on validation/correctness
            const answerLines = current.answerValue || [''];
            const joinedAnswer = arrayToString(answerLines);
            const isValid = validateAnswer(current, answerLines, index);
            const nonEmpty = joinedAnswer.trim().length > 0;
            const isCorrect = correctness[index] === true;
            const isWrong = nonEmpty && !isValid && !isCorrect;
            
            // Apply styling based on validation state
            const inputClasses = cn(
              "transition-all duration-200",
              isCorrect && "border-green-500 bg-green-50",
              isWrong && "border-red-500 bg-red-50"
            );

            return (
              <div className="space-y-2">
                <UserInput
                  key={`user-input-${index}`}
                  value={answerLines}
                  onChange={handleInputChange}
                  placeholder="Enter your answer..."
                  maxLines={8}
                  disabled={Boolean(inputDisabled || (correctness[index] === true))}
                  className={inputClasses}
                  onSpamDetected={() => {
                    onSpamDetected?.();
                    handleValidationResult("spam");
                  }}
                  onResetSpamFlag={() => {
                    // Reset any spam flags if needed
                  }}
                />

                {correctness[index] === true && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Correct! Well done.</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}