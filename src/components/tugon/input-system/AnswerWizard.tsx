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
type MessagePrompt = {
  id: string;
  type: 'hint' | 'feedback' | 'guidance';
  content: string;
  timestamp: Date;
  source: 'shortHints' | 'expandedHints' | 'system';
};

type UserBehavior = {
  action: 'input' | 'hint_request' | 'submit' | 'validation' | 'spam_detected';
  timestamp: Date;
  stepIndex: number;
  details?: any;
};

type ConversationHistoryEntry = {
  messagePrompt: MessagePrompt[];
  userInput: string;
  userBehavior: UserBehavior;
  stepIndex: number;
  timestamp: Date;
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

  // Add hint state for testing
  const [hintState, setHintState] = useState({
    show: false,
    text: "",
    requestCount: 0
  });
  const [userConversationHistory, setUserConversationHistory] = useState<ConversationHistoryEntry[]>([]);
  const addToConversationHistory = (
    messagePrompts: MessagePrompt[],
    userInput: string,
    userBehavior: UserBehavior,
    stepIndex: number
  ) => {
    const entry: ConversationHistoryEntry = {
      messagePrompt: messagePrompts,
      userInput,
      userBehavior,
      stepIndex,
      timestamp: new Date()
    };

    setUserConversationHistory(prev => {
      const newHistory = [...prev, entry];
      
      // Console log the updated conversation history
      console.log('=== USER CONVERSATION HISTORY UPDATE ===');
      console.log(`New entry added for Step ${stepIndex + 1}:`, entry);
      console.log('Complete userConversationHistory:', newHistory);
      console.log('History breakdown:');
      newHistory.forEach((historyEntry, index) => {
        console.log(`  Entry[${index}]:`, {
          step: historyEntry.stepIndex + 1,
          userInput: historyEntry.userInput,
          behavior: historyEntry.userBehavior.action,
          messagePrompts: historyEntry.messagePrompt.length,
          timestamp: historyEntry.timestamp.toISOString()
        });
      });
      console.log('===========================================');
      
      return newHistory;
    });
  };

  const createMessagePrompt = (
    type: MessagePrompt['type'],
    content: string,
    source: MessagePrompt['source']
  ): MessagePrompt => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    timestamp: new Date(),
    source
  });
  // Sample hints for testing (30-50 words each)
  const sampleHints = [
    "Start by identifying what you need to substitute. Look for the variable in your function and replace it with the given value.",
    "After substitution, follow order of operations: parentheses, exponents, multiplication, division, addition, and subtraction in that order.",
    "Double-check each calculation step. Small arithmetic errors can lead to wrong final answers. Work slowly and verify each operation.",
    "Make sure your final answer is a single number, not an expression that needs further simplification. Complete all calculations."
  ];

  // Function to trigger hints for testing
   const triggerTestHint = () => {
    const hintIndex = hintState.requestCount % sampleHints.length;
    const hintContent = sampleHints[hintIndex];
    
    setHintState({
      show: true,
      text: hintContent,
      requestCount: hintState.requestCount + 1
    });

    // Track hint request in conversation history
    const messagePrompts = [createMessagePrompt('hint', hintContent, 'system')];
    const userBehavior: UserBehavior = {
      action: 'hint_request',
      timestamp: new Date(),
      stepIndex: index,
      details: { hintIndex, requestCount: hintState.requestCount + 1 }
    };

    addToConversationHistory(
      messagePrompts,
      getCurrentUserInput().join('\n'),
      userBehavior,
      index
    );
  };

  // Function to hide hints
  const hideHints = () => {
    setHintState(prev => ({
      ...prev,
      show: false
    }));
  };

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

  // Handle Enter key submission
  const handleEnterSubmission = (lines: string[]) => {
    console.log("🎯 Submitting via Enter key:", lines);
    
    // Use your existing submit logic
    const validationResult = InputValidator.validateAllSteps([lines], answersSource ? [answersSource[index]] : []);
    
    // Track submission in conversation history
    const userBehavior: UserBehavior = {
      action: 'submit',
      timestamp: new Date(),
      stepIndex: index,
      details: { validationResult, submissionMethod: 'enter_key' }
    };

    addToConversationHistory(
      [], // No message prompts for submissions
      lines.join('\n'),
      userBehavior,
      index
    );

    onSubmit(steps, validationResult);
  };

  const handleSuggestSubmission = (lines: string[]) => {
    // Removed toast notification - just log for now
    console.log("Suggestion: Fix incorrect steps, then press Enter to submit");
  };

  // Handle input changes from UserInput
   const handleInputChange = (lines: string[]) => {
    const expectedSteps = answersSource?.[index]?.steps;
    
    InputValidator.logValidation(lines, expectedSteps, index);
    
    // Update internal steps state
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines } as WizardStep;
      return next;
    });
    
    // Update userInputs array for external access
    setUserInputs((prev) => {
      const next = [...prev];
      next[index] = [...lines];
      return next;
    });
    
    // Notify parent with string representation
    onAnswerChange?.(index, arrayToString(lines));
    
    // Notify parent with individual lines array
    onLinesChange?.(index, lines);

    // Track input change in conversation history
    const userBehavior: UserBehavior = {
      action: 'input',
      timestamp: new Date(),
      stepIndex: index,
      details: { linesCount: lines.length, hasContent: lines.some(line => line.trim()) }
    };

    addToConversationHistory(
      [], // No message prompts for regular input changes
      lines.join('\n'),
      userBehavior,
      index
    );
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
    // Create appropriate message prompts based on validation result
    let messagePrompts: MessagePrompt[] = [];
    
    switch (result) {
      case 'correct':
        messagePrompts = [createMessagePrompt('feedback', 'Correct! Well done.', 'system')];
        break;
      case 'wrong':
        messagePrompts = [createMessagePrompt('feedback', 'That\'s not quite right. Try again.', 'system')];
        break;
      case 'aiHint':
        messagePrompts = [createMessagePrompt('hint', 'AI hint would be provided here', 'system')];
        break;
      case 'spam':
        messagePrompts = [createMessagePrompt('feedback', 'Please slow down and think through your answer.', 'system')];
        break;
    }

    // Track validation result in conversation history
    const userBehavior: UserBehavior = {
      action: 'validation',
      timestamp: new Date(),
      stepIndex: index,
      details: { result }
    };

    addToConversationHistory(
      messagePrompts,
      getCurrentUserInput().join('\n'),
      userBehavior,
      index
    );

    onValidationResult?.(result);
  };

  // Get current userInput array for the active step
  const getCurrentUserInput = (): string[] => {
    return userInputs[index] || [''];
  };

  //To be handled later because of validation logic in UserInputValidator
  const handleSpamDetected = () => {
    const messagePrompts = [createMessagePrompt('feedback', 'Spam detected: Please take your time to provide thoughtful answers.', 'system')];
    const userBehavior: UserBehavior = {
      action: 'spam_detected',
      timestamp: new Date(),
      stepIndex: index,
      details: { detectionTime: new Date() }
    };

    addToConversationHistory(
      messagePrompts,
      getCurrentUserInput().join('\n'),
      userBehavior,
      index
    );

    onSpamDetected?.();
    handleValidationResult("spam");
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
                {/* Test Button for Hints - Positioned on the side */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Small className="text-gray-600">Step {index + 1}</Small>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerTestHint}
                      className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md border border-yellow-300 transition-colors"
                    >
                      🧪 Test Hint
                    </button>
                    {hintState.show && (
                      <button
                        onClick={hideHints}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md border border-gray-300 transition-colors"
                      >
                        ✕ Hide
                      </button>
                    )}
                  </div>
                </div>

                <UserInput
                  key={`user-input-${index}`}
                  value={answerLines}
                  onChange={handleInputChange}
                  placeholder="Enter your answer..."
                  maxLines={8}
                  disabled={Boolean(inputDisabled || (correctness[index] === true))}
                  className={inputClasses}
                  expectedSteps={expectedSteps}
                  onSubmit={handleEnterSubmission}
                  onSuggestSubmission={handleSuggestSubmission}
                  onSpamDetected={handleSpamDetected} 
                  onResetSpamFlag={() => {
                    // Reset any spam flags if needed
                  }}
                  // Add hint props
                  showHints={hintState.show}
                  hintText={hintState.text}
                  onRequestHint={triggerTestHint}
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