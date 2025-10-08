import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getAnswerForQuestion } from '../../data/answers/index';
import { convertToLatex } from '../question-system/mathConverter';
import type { TwoPhaseValidationResult, CompletionStatus } from "../input-system/UserInputValidator";
import  { InputValidator } from "../input-system/UserInputValidator";
import { cn } from '@/lib/utils';

interface FillInBlanksTemplateProps {
  topicId: number;
  categoryId: number;
  questionId: number;
  onValidationResult: (type: "correct" | "incorrect") => void;
  onAnswerChange?: () => void;
}
function reconstructFilledTemplate(mathField: any, template: string) {
  if (!mathField || !mathField.getPlaceholders) return template;
  const placeholders = mathField.getPlaceholders();
  let filled = template;
  let i = 0;
  // Replace each \placeholder[...]{} with the user's input
  filled = filled.replace(/\\placeholder(?:\[[^\]]*\])?\{\}/g, () => {
    const val = placeholders[i] ?? "";
    i++;
    return val;
  });
  return filled;
}
export function FillInBlanksTemplate({
  topicId,
  categoryId,
  questionId,
  onValidationResult,
  onAnswerChange
}: FillInBlanksTemplateProps) {
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const mathFieldRefs = useRef<any[]>([]);
  
  // Get the expected steps from answers.ts
  const expectedSteps = getAnswerForQuestion(topicId, categoryId, questionId);
  
  if (!expectedSteps) return <div>No answer data found</div>;
  
  // Initialize user inputs based on number of steps
  useEffect(() => {
    if (expectedSteps && userInputs.length === 0) {
      setUserInputs(new Array(expectedSteps.length).fill(''));
    }
  }, [expectedSteps, userInputs.length]);
  
  // Create fill-in-blank templates for each step
  const createStepTemplate = useCallback((stepIndex: number) => {
    if (!expectedSteps || stepIndex >= expectedSteps.length) return "";
    
    const step = expectedSteps[stepIndex];
    const stepLabel = step.label;
    
    // Generate templates based on step label and content
    switch (stepLabel) {
      case "substitution":
        if (step.answer.includes("g(7)") || step.answer.includes("7 + 5")) {
          return "g(\\placeholder[input]{}) = \\placeholder[substitution]{} + 5";
        }
        if (step.answer.includes("g(3)") || step.answer.includes("35-(3-2)")) {
          return "g(\\placeholder[input]{}) = 35 - (\\placeholder[substitution]{} - 2)";
        }
        if (step.answer.includes("g(-2)") || step.answer.includes("52(-2)")) {
          return "g(\\placeholder[input]{}) = 52(\\placeholder[substitution]{}) + 51";
        }
        return "\\placeholder[substitution]{}";
        
      case "simplification":
        if (step.answer.includes("35 - 1")) {
          return "\\placeholder[calculation]{} = \\placeholder[result]{}";
        }
        if (step.answer.includes("-104 + 51")) {
          return "\\placeholder[calculation]{} + \\placeholder[constant]{} = \\placeholder[result]{}";
        }
        return "\\placeholder[simplification]{}";
        
      case "final":
        return "\\text{Final Answer: } \\placeholder[final]{}";
        
      case "domain":
        return "\\text{Domain: } \\placeholder[domain]{}";
        
      case "range":
        return "\\text{Range: } \\placeholder[range]{}";
        
      case "text":
        return "\\placeholder[text]{}";
        
      default:
        return `\\placeholder[${stepLabel}]{}`;
    }
  }, [expectedSteps]);
  
  // Handle input changes
  const handleInputChange = useCallback((stepIndex: number, value: string) => {
    setUserInputs(prev => {
      const newInputs = [...prev];
      newInputs[stepIndex] = value;
      return newInputs;
    });
    onAnswerChange?.();
  }, [onAnswerChange]);
  
  // Handle Enter key to move to next step
  const handleKeyDown = useCallback((stepIndex: number, event: KeyboardEvent) => {
    if (event.key === 'Enter' && stepIndex < expectedSteps.length - 1) {
      event.preventDefault();
      const nextRef = mathFieldRefs.current[stepIndex + 1];
      if (nextRef) {
        nextRef.focus();
        setFocusedIndex(stepIndex + 1);
      }
    }
  }, [expectedSteps.length]);
  
  // Validate using UserInputValidator
  const validateStep = useCallback((stepIndex: number): boolean => {
  if (!expectedSteps || stepIndex >= expectedSteps.length) return false;
  
  const mathField = mathFieldRefs.current[stepIndex];
  if (!mathField) return false;
  
   // Get the filled value from MathLive (this will have placeholders filled)
  const filledValue = mathField.getValue();
  const expectedAnswer = expectedSteps[stepIndex].answer;
  
  console.log(`Validating Step ${stepIndex + 1}:`, filledValue, 'vs', expectedAnswer);
  
  // Use InputValidator to compare
  return InputValidator.validateAnswer([filledValue], [expectedSteps[stepIndex]], stepIndex);
}, [userInputs, expectedSteps]);
  
  // Handle submission
  const handleSubmit = useCallback(() => {
  if (!expectedSteps) return;

  // For each step, reconstruct the filled template
  const reconstructedAnswers = expectedSteps.map((step, i) => {
    const mathField = mathFieldRefs.current[i];
    const template = createStepTemplate(i);
    return reconstructFilledTemplate(mathField, template);
  });

  console.log("User reconstructed answers:", reconstructedAnswers);
  console.log("Expected answers:", expectedSteps.map(s => s.answer));

  // Now you can compare reconstructedAnswers[i] === expectedSteps[i].answer

  let correctSteps = 0;
  for (let i = 0; i < expectedSteps.length; i++) {
    if (reconstructedAnswers[i] === expectedSteps[i].answer) {
      correctSteps++;
    }
  }

  const isAllCorrect = correctSteps === expectedSteps.length;
  setIsSubmitted(true);
  onValidationResult(isAllCorrect ? "correct" : "incorrect");
}, [expectedSteps, onValidationResult, createStepTemplate]);
  
  // Set ref for math fields
  const setMathFieldRef = useCallback((index: number) => (ref: any) => {
    mathFieldRefs.current[index] = ref;
  }, []);
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Steps */}
          {expectedSteps.map((step, stepIndex) => (
            <div key={`step-${stepIndex}`} className="space-y-2">
              {/* Step Label */}
              <div className="text-sm font-medium text-gray-600 capitalize">
                Step {stepIndex + 1}: {step.label}
                {step.placeholder && (
                  <span className="text-xs text-gray-400 ml-2">({step.placeholder})</span>
                )}
              </div>
              
              {/* Math Field Input */}
              <div className="relative">
                <math-field
                  ref={setMathFieldRef(stepIndex)}
                  key={`fill-blank-${topicId}-${categoryId}-${questionId}-${stepIndex}`}
                  value={createStepTemplate(stepIndex)}
                  onInput={(e: any) => handleInputChange(stepIndex, e.target.value)}
                  onKeyDown={(e: any) => handleKeyDown(stepIndex, e)}
                  onFocus={() => setFocusedIndex(stepIndex)}
                  onBlur={() => setFocusedIndex(null)}
                  style={{
                    fontSize: "1.1rem",
                    padding: "12px",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    width: "100%",
                    minHeight: "50px",
                    backgroundColor: "white",
                    borderColor: focusedIndex === stepIndex ? "#3b82f6" : "#d1d5db"
                  }}
                  virtual-keyboard-mode="manual"
                  smart-fence={true}
                  smart-superscript={true}
                  className={cn(
                    "w-full transition-colors",
                    isSubmitted && validateStep(stepIndex) && "border-green-500 bg-green-50",
                    isSubmitted && !validateStep(stepIndex) && "border-red-500 bg-red-50"
                  )}
                />
                
                {/* Validation Indicator */}
                {isSubmitted && (
                  <div className="absolute top-2 right-2">
                    {validateStep(stepIndex) ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✗</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Expected Answer (for debugging - remove in production) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400">
                  Expected: {step.answer}
                </div>
              )}
            </div>
          ))}
          
          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitted ? "Submitted" : "Submit Answer"}
            </button>
          </div>
          
          {/* Results Summary */}
          {isSubmitted && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50">
              <div className="text-sm text-gray-600">
                Correct Steps: {expectedSteps.filter((_, i) => validateStep(i)).length} / {expectedSteps.length}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}