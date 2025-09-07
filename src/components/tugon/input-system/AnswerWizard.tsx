import { useEffect, useState } from "react";
import { predefinedAnswers as predefinedAnswersData } from "@/components/data/answers";
import type { PredefinedAnswer, Step as AnswerStep } from "@/components/data/answers";
import { cn } from "../../cn";
import UserInput from './UserInput';
import InputValidator from './UserInputValidator';
import { CheckCircle } from "lucide-react";
import { Small } from "../../Typography";
import { UserAttempt } from './UserInput';

// Missing type definitions - ADD these
interface MessagePrompt {
  id: string;
  type: 'hint' | 'feedback' | 'validation';
  content: string;
  timestamp: Date;
  source: 'system' | 'ai' | 'user';
}

interface UserBehavior {
  action: 'input' | 'submit' | 'hint_request' | 'validation' | 'spam_detected';
  timestamp: Date;
  stepIndex: number;
  details?: any;
}

interface ConversationHistoryEntry {
  messagePrompt: MessagePrompt[];
  userInput: string;
  userBehavior: UserBehavior;
  stepIndex: number;
  timestamp: Date;
}

// Simplified answer types - only text-based now
export type AnswerType = "single" | "multi";

// Public input step shape (for initializing the wizard)
export type Step = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type?: AnswerType;
  answerValue?: string | string[];
};

// Internal state shape that the wizard manages
export type WizardStep = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type: AnswerType;
  answerValue: string[];
};

export interface AnswerWizardProps {
  steps: Step[];
  onSubmit: (finalSteps: WizardStep[], validationResult?: any) => void; // FIXED: Added optional validationResult
  onIndexChange: (index: number) => void;
  expectedAnswers?: PredefinedAnswer[];
  onValidationResult?: (type: 'correct' | 'incorrect' | 'partial', currentStep: number) => void;
  onAnswerChange?: (index: number, value: string) => void; // FIXED: Added proper signature
  onAttemptUpdate?: (attempts: UserAttempt[]) => void;
  className?: string; // ADD: Missing className prop
  disabled?: boolean; // ADD: Missing disabled prop
}

export default function AnswerWizard({
  steps: inputSteps,
  onSubmit,
  onIndexChange,
  expectedAnswers,
  onValidationResult,
  onAnswerChange,
  onAttemptUpdate,
  className, // ADD: Include className
  disabled = false, // ADD: Include disabled with default
}: AnswerWizardProps) {
  // Source answers
  const answersSource: PredefinedAnswer[] = expectedAnswers && expectedAnswers.length > 0
    ? expectedAnswers
    : (predefinedAnswersData || []);
 
  // Fixed steps derived from answers source
  const fixedSteps: WizardStep[] = (answersSource || []).map((_, i) => {
    const t: AnswerType = "multi";
    return {
      id: `s${i + 1}`,
      type: t,
      answerValue: [''],
    } as WizardStep;
  });

  // FIXED: Rename to avoid conflict with props
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>(fixedSteps);
  const [index, setIndex] = useState(0);
  const [correctness, setCorrectness] = useState<Array<boolean | null>>(
    Array.from({ length: fixedSteps.length }, () => null)
  );

  // Store all user inputs as arrays of lines
  const [userInputs, setUserInputs] = useState<string[][]>(
    fixedSteps.map(() => [''])
  );

  // Hint state
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
      newHistory.forEach((historyEntry, histIndex) => {
        console.log(`  Entry[${histIndex}]:`, {
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

  // FIXED: Use wizardSteps instead of steps
  const total = wizardSteps.length;
  const current = wizardSteps[index];

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

    // FIXED: Use wizardSteps and match interface signature
    onSubmit(wizardSteps, validationResult);
  };

  const handleSuggestSubmission = (lines: string[]) => {
    // Removed toast notification - just log for now
    console.log("Suggestion: Fix incorrect steps, then press Enter to submit");
  };

  // Handle input changes from UserInput
   const handleInputChange = (lines: string[]) => {
    const expectedSteps = answersSource?.[index]?.steps;
    
    InputValidator.logValidation(lines, expectedSteps, index);
    
    // FIXED: Update wizardSteps instead of steps
    setWizardSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines } as WizardStep;
      return next;
    });
    
    setUserInputs((prev) => {
      const next = [...prev];
      next[index] = [...lines];
      return next;
    });
    
    // FIXED: Call with correct parameters
    onAnswerChange?.(index, arrayToString(lines));

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
    
    // FIXED: Use wizardSteps
    onSubmit(wizardSteps, validationResult);
    
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

    // FIXED: Match expected signature
    onValidationResult?.(result === 'correct' ? 'correct' : 'incorrect', index);
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
                  disabled={Boolean(disabled || (correctness[index] === true))} // FIXED: Use disabled prop
                  className={inputClasses}
                  expectedSteps={expectedSteps}
                  onSubmit={handleEnterSubmission}
                  onSuggestSubmission={handleSuggestSubmission}
                  onSpamDetected={handleSpamDetected} 
                  onResetSpamFlag={() => {}}
                  // Add hint props
                  showHints={hintState.show}
                  hintText={hintState.text}
                  onRequestHint={triggerTestHint}
                  onAttemptUpdate={onAttemptUpdate}
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