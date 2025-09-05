import { useEffect, useMemo, useState } from "react";
import { predefinedAnswers as predefinedAnswersData } from "@/components/data/answers";
import type { PredefinedAnswer, Step as AnswerStep } from "@/components/data/answers";
import { cn } from "../../cn";
import UserInput from './UserInput';
import InputValidator from './UserInputValidator';
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
  // New callback to expose individual lines array
  onLinesChange?: (index: number, lines: string[]) => void;
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
  onLinesChange, // New prop
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

  

  const [steps, setSteps] = useState<WizardStep[]>(fixedSteps);
  const [index, setIndex] = useState(0);
  const [correctness, setCorrectness] = useState<Array<boolean | null>>(
    Array.from({ length: fixedSteps.length }, () => null)
  );

  // Store all user inputs as arrays of lines for external access
  const [userInputs, setUserInputs] = useState<string[][]>(
    fixedSteps.map(() => [''])
  );

  const total = steps.length;
  const current = steps[index];

  // Notify parent when the active index changes
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  // Convert string[] to string for parent notifications
  const arrayToString = (lines: string[]): string => {
    return lines.join('\n');
  };

  // Handle input changes from UserInput
  const handleInputChange = (lines: string[]) => {
    // Use InputValidator for logging with updated structure
    const expectedSteps = answersSource?.[index]?.steps; // Use steps instead of answer
    
    InputValidator.logValidation(
      lines, 
      expectedSteps, // Pass Step[] instead of old answer property
      index
    );
    
    // Update internal steps state
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines } as WizardStep;
      return next;
    });
    
    // Update userInputs array for external access
    setUserInputs((prev) => {
      const next = [...prev];
      next[index] = [...lines]; // Store copy of lines array
      return next;
    });
    
    // Notify parent with string representation
    onAnswerChange?.(index, arrayToString(lines));
    
    // Notify parent with individual lines array
    onLinesChange?.(index, lines);
  };

  // Handle submission manually if needed
  const handleSubmit = () => {
    // Use InputValidator for final validation
    const validationResult = InputValidator.validateAllSteps(userInputs, answersSource);
    
    // Submit with both steps and userInputs for external access
    onSubmit(steps, validationResult);
    
    // Log userInputs for debugging/access
    console.log("Final userInputs array:", userInputs);
  };

  const handleValidationResult = (result: "correct" | "wrong" | "aiHint" | "spam") => {
    onValidationResult?.(result);
  };

  // Get current userInput array for the active step
  const getCurrentUserInput = (): string[] => {
    return userInputs[index] || [''];
  };

  // Function to get userInput for any step (for external access)
  const getUserInputForStep = (stepIndex: number): string[] => {
    return userInputs[stepIndex] || [''];
  };

  // Function to get all userInputs (for external access)
  const getAllUserInputs = (): string[][] => {
    return userInputs;
  };

  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm p-4 space-y-4", className)}>
      {/* Main input area */}
      {current && (
        <div className="space-y-3">
          {(() => {
            // Use InputValidator for validation logic with updated structure
            const answerLines = current.answerValue || [''];
            const expectedSteps = answersSource?.[index]?.steps; // Use steps instead of answer
            const validationResult = InputValidator.getValidationResult(
              answerLines,
              expectedSteps, // Pass Step[] instead of old answer property
              index,
              correctness[index]
            );
            
            // Apply styling based on validation state
            const inputClasses = cn(
              "transition-all duration-200",
              validationResult.isCorrect && "border-green-500 bg-green-50",
              validationResult.isWrong && "border-red-500 bg-red-50"
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