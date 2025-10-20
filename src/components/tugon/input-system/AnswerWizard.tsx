//AnswerWizard

import { useEffect, useState } from "react";
import type { PredefinedAnswer, Step as AnswerStep } from "@/components/data/answers/types";
import { fetchAnswerSteps } from "@/lib/supabaseAnswers"; // ✨ Supabase-only integration
import { cn } from "../../cn";
import UserInput from './UserInput';
import InputValidator from './UserInputValidator';
import { CheckCircle } from "lucide-react";
import { Small } from "../../Typography";
import { UserAttempt } from './UserInput';
import  MathInputs from './MathInputs'; // Import MathInputs component
// Add QuestionBox import
import QuestionBox from '../question-system/QuestionBox';

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
  mathMode?: boolean;
 
  expectedAnswers?: PredefinedAnswer[];
  className?: string;
  disabled?: boolean;
  topicId?: number;
  categoryId?: number;
  questionId?: number;
  onValidationResult?: (type: 'correct' | 'incorrect' | 'partial', currentStep: number) => void;
  onAnswerChange?: (index: number, value: string) => void;
  onAttemptUpdate?: (attempts: UserAttempt[]) => void;
  onSubmit: (finalSteps: WizardStep[], validationResult?: any) => void;
  onIndexChange: (index: number) => void;
  // Add question props for QuestionBox
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
   title,
  fallbackText
}: AnswerWizardProps) {
  // ✨ NEW: State for Supabase answer steps
  const [answersSource, setAnswersSource] = useState<PredefinedAnswer[]>([]);
  const [answersLoading, setAnswersLoading] = useState<boolean>(true);
  const [answersError, setAnswersError] = useState<string | null>(null);

  // ✨ Fetch answer steps from Supabase (NO FALLBACK)
  useEffect(() => {
    let isMounted = true;

    console.log('🔍 ANSWERWIZARD USEEFFECT TRIGGERED:', {
      topicId,
      categoryId, 
      questionId,
      hasExpectedAnswers: expectedAnswers && expectedAnswers.length > 0,
      expectedAnswersLength: expectedAnswers?.length || 0
    });

    const loadAnswerSteps = async () => {
      // Priority 1: Use provided expectedAnswers prop
      if (expectedAnswers && expectedAnswers.length > 0) {
        console.log('📝 Using provided expectedAnswers prop');
        console.log('📝 expectedAnswers content:', expectedAnswers);
        setAnswersSource(expectedAnswers);
        setAnswersLoading(false);
        return;
      }

      // Priority 2: Fetch ONLY from Supabase (no fallback)
      if (topicId && categoryId && questionId) {
        setAnswersLoading(true);
        setAnswersError(null);

        try {
          console.log(`🔄 Fetching answer steps from Supabase ONLY: Topic ${topicId}, Category ${categoryId}, Question ${questionId}`);
          
          // Fetch directly from Supabase (no hybrid, no fallback)
          const steps = await fetchAnswerSteps(topicId, categoryId, questionId);

          if (!isMounted) return;

          if (steps && steps.length > 0) {
            const predefinedAnswer: PredefinedAnswer = {
              questionId: questionId,
              questionText: `Question ${questionId}`,
              type: 'multiLine',
              steps: steps,
            };
            setAnswersSource([predefinedAnswer]);
            console.log('✅ Loaded answer steps from Supabase:', predefinedAnswer);
          } else {
            console.warn('⚠️ No answer steps found in Supabase database');
            setAnswersError('No answer steps found in database. Please add answer data for this question.');
            setAnswersSource([]);
          }
        } catch (err) {
          console.error('❌ Error loading answer steps from Supabase:', err);
          if (isMounted) {
            setAnswersError('Failed to load answer steps from database. Check console for details.');
            setAnswersSource([]);
          }
        } finally {
          if (isMounted) {
            setAnswersLoading(false);
          }
        }
      } else {
        // No IDs provided
        console.warn('⚠️ No topicId, categoryId, or questionId provided to AnswerWizard');
        setAnswersError('Missing question identifiers (topicId, categoryId, or questionId)');
        setAnswersSource([]);
        setAnswersLoading(false);
      }
    };

    loadAnswerSteps();

    return () => {
      isMounted = false;
    };
  }, [topicId, categoryId, questionId, expectedAnswers]);
 
 
  // Fixed steps derived from answers source
   const fixedSteps: WizardStep[] = (answersSource || []).map((_, i) => {
    const t: AnswerType = "multi";
    return {
      id: `s${i + 1}`,
      type: t,
      answerValue: [''],
    } as WizardStep;
  });
    useEffect(() => {
    console.log('🎯 EXPECTED STEPS DEBUG:', {
      topicId,
      categoryId,
      questionId,
      answersSource,
      expectedSteps: answersSource?.[0]?.steps
    });
  }, [topicId, categoryId, questionId, answersSource]);

  // FIXED: Rename to avoid conflict with props
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>(fixedSteps);
  const [index, setIndex] = useState(0);
  const [correctness, setCorrectness] = useState<Array<boolean | null>>(
    Array.from({ length: fixedSteps.length }, () => null)
  );
  const [showHints, setShowHints] = useState(false);
  
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

  useEffect(() => {
    // Reset all state when question parameters change
    const newFixedSteps: WizardStep[] = (answersSource || []).map((_, i) => {
      const t: AnswerType = "multi";
      return {
        id: `s${i + 1}`,
        type: t,
        answerValue: [''],
      } as WizardStep;
    });

    setWizardSteps(newFixedSteps);
    setIndex(0);
    setCorrectness(Array.from({ length: newFixedSteps.length }, () => null));
    setUserInputs(newFixedSteps.map(() => ['']));
    setShowHints(false);
    
    // Reset hint state
    setHintState({
      show: false,
      text: "",
      requestCount: 0
    });
    
    // Reset conversation history
    setUserConversationHistory([]);
    
    console.log('🔄 AnswerWizard state reset for new question:', {
      topicId,
      categoryId,
      questionId,
      steps: newFixedSteps.length
    });
    
  }, [topicId, categoryId, questionId, answersSource]); 
  
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
    console.log("🎯 AnswerWizard: Enter submission triggered:", lines);
    setShowHints(false);
    
    // Note: Validation is now handled by UserInput component
    // UserInput will call onValidationResult when validation completes
    // No need to validate here - just update state
    
    console.log("✅ AnswerWizard: Submission delegated to UserInput validation");

    // Update wizard steps
    setWizardSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answerValue: lines } as WizardStep;
      return next;
    });

    // Call the onSubmit callback
    onSubmit(wizardSteps);
    
    // Show hints after a delay
    setTimeout(() => {
      console.log("🔄 AnswerWizard: Setting showHints to true after delay");
      setShowHints(true);
    }, 200);
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

  // ✨ SHOW LOADING STATE
  if (answersLoading) {
    return (
      <div className={cn("rounded-2xl p-4 space-y-4", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Loading answer steps...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✨ SHOW ERROR STATE
  if (answersError || answersSource.length === 0) {
    return (
      <div className={cn("rounded-2xl p-4 space-y-4 border-2 border-red-200 bg-red-50", className)}>
        <div className="text-center py-4">
          <p className="text-red-700 font-semibold">
            {answersError || 'No answer steps found for this question'}
          </p>
          <p className="text-sm text-red-600 mt-2">
            Please check if the question has been configured in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl  p-4 space-y-4", className)}>
      {/* ADD: QuestionBox Component 
      <QuestionBox
        title={title}
        topicId={topicId}
        categoryId={categoryId}
        questionId={questionId}
        fallbackText={fallbackText}
      />*/}

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
                  key={`user-input-${index}-${topicId}-${categoryId}-${questionId}`}
                  value={answerLines}
                  onChange={handleInputChange}
                  placeholder="Enter your answer..."
                  maxLines={8}
                  disabled={Boolean(disabled || (correctness[index] === true))}
                  className={inputClasses}
                  expectedSteps={expectedSteps}
                  onSubmit={handleEnterSubmission}
                  onSuggestSubmission={handleSuggestSubmission}
                  onSpamDetected={handleSpamDetected} 
                  onResetSpamFlag={() => {}}
                  // Add hint props
                  showHints={showHints}
                  hintText={hintState.text}
                  onRequestHint={triggerTestHint}
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
    </div>
  );
}