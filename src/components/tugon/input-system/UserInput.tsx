import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../cn";
import InputValidator from "./UserInputValidator";
import type { TwoPhaseValidationResult, CompletionStatus } from "./UserInputValidator";
import type { Step } from "@/components/data/answers";
import ShortHints from "../hint-system/shortHints";
import UserBehaviorClassifier from './UserBehaviorClassifier';
import type { UserBehaviorProfile } from './UserBehaviorClassifier';
type StepProgression = [string, string, boolean, string, number]; 
// [stepLabel, userInput, isCorrect, expectedAnswer, totalProgress]

type UserAttempt = {
  attempt_id: number;
  stepIndex: number;
  stepLabel: string;
  userInput: string;
  isCorrect: boolean;
  expectedAnswer: string;
  cumulativeProgress: number;
  stepStartTime: number; // When step was started
  attemptTime: number;   // When this specific attempt was made
  timeSpentOnStep?: number; // Total time spent on step when completed
};

type StepTiming = {
  stepIndex: number;
  stepLabel: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in milliseconds
  isCompleted: boolean;
};

export interface UserInputProps {
  value: string[];
  onChange: (lines: string[]) => void;
  placeholder?: string;
  maxLines?: number;
  disabled?: boolean;
  className?: string;
  onSpamDetected?: () => void;
  onResetSpamFlag?: () => void;
  expectedSteps?: Step[];
  onSubmit?: (lines: string[]) => void;
  onSuggestSubmission?: (lines: string[]) => void;
  showHints?: boolean;
  hintText?: string;
  onRequestHint?: () => void;
  onAttemptUpdate?: (attempts: UserAttempt[]) => void;
}

export default function UserInput({
  value = [''],
  onChange,
  placeholder = "Type your answer here...",
  maxLines = 10,
  disabled = false,
  className,
  onSpamDetected,
  onResetSpamFlag,
  expectedSteps,
  onSubmit,
  onSuggestSubmission,
  showHints = false,
  hintText,
  onRequestHint,
  onAttemptUpdate
}: UserInputProps) {
  const [lines, setLines] = useState<string[]>(value);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement)[]>([]);

  // Add to your component state 
  const [behaviorProfile, setBehaviorProfile] = useState<UserBehaviorProfile | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // User progression tracking array
  const [userProgressionArray, setUserProgressionArray] = useState<StepProgression[]>([]);
  const [userAttempt, setUserAttempt] = useState<UserAttempt[]>([]);
  const [attemptCounter, setAttemptCounter] = useState<number>(0);
  
  // Scrolling refs and state
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Anti-spam detection
  const [lastInputTime, setLastInputTime] = useState<number>(0);
  const [rapidInputCount, setRapidInputCount] = useState<number>(0);
  const spamThreshold = 10;
  const spamTimeWindow = 1000;

  // Individual line validation state for immediate feedback
  const [lineValidationStates, setLineValidationStates] = useState<Map<number, TwoPhaseValidationResult | null>>(new Map());
  const [validationTriggers, setValidationTriggers] = useState<Map<number, 'enter' | null>>(new Map());

  // State for error feedback and timing
  const [stepErrorFeedback, setStepErrorFeedback] = useState<Map<number, boolean>>(new Map());
  const [stepTimings, setStepTimings] = useState<Map<number, StepTiming>>(new Map());
  const [currentStepStartTime, setCurrentStepStartTime] = useState<number | null>(null);
  const [pendingLineCreation, setPendingLineCreation] = useState<number | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setLines(value);
  }, [value]);

  // Check if scrolling is needed
  const checkScrollNeeded = useCallback(() => {
    const needsScrolling = lines.length > 2;
    setIsScrollable(needsScrolling);
    setShowScrollIndicator(needsScrolling);
  }, [lines.length]);

  // Auto-scroll to focused input
  const scrollToFocusedInput = useCallback((index: number) => {
    if (!scrollableRef.current || !isScrollable) return;
    
    const inputElement = inputRefs.current[index];
    if (!inputElement) return;

    const lineHeight = 50;
    const containerHeight = 2 * lineHeight;
    const inputTop = index * lineHeight;
    const inputBottom = inputTop + lineHeight;
    
    const currentScrollTop = scrollableRef.current.scrollTop;
    const viewportBottom = currentScrollTop + containerHeight;
    
    if (inputTop < currentScrollTop) {
      scrollableRef.current.scrollTop = inputTop;
    } else if (inputBottom > viewportBottom) {
      scrollableRef.current.scrollTop = inputBottom - containerHeight;
    }
  }, [isScrollable]);

  // Update scroll check when lines change
  useEffect(() => {
    checkScrollNeeded();
  }, [lines.length, checkScrollNeeded]);

  // Auto-scroll when focus changes
  useEffect(() => {
    if (focusedIndex !== null && isScrollable) {
      scrollToFocusedInput(focusedIndex);
    }
  }, [focusedIndex, isScrollable, scrollToFocusedInput]);

  // Timing functions
  const startStepTimer = useCallback((stepIndex: number) => {
    const now = Date.now();
    
    // Don't restart timer if step is already being timed
    if (stepTimings.has(stepIndex) && stepTimings.get(stepIndex)?.isCompleted === false) {
      return;
    }
    
    const stepLabel = expectedSteps?.[stepIndex]?.label || `Step ${stepIndex + 1}`;
    
    const newTiming: StepTiming = {
      stepIndex,
      stepLabel,
      startTime: now,
      isCompleted: false
    };
    
    setStepTimings(prev => {
      const newMap = new Map(prev);
      newMap.set(stepIndex, newTiming);
      return newMap;
    });
    
    setCurrentStepStartTime(now);
    
    console.log(`⏱️ STEP TIMER STARTED: Step ${stepIndex + 1} (${stepLabel})`);
  }, [expectedSteps, stepTimings]);
  
  const completeStepTimer = useCallback((stepIndex: number) => {
    const now = Date.now();
    const existingTiming = stepTimings.get(stepIndex);
    
    if (!existingTiming || existingTiming.isCompleted) {
      return 0; // Return 0 if no timing found or already completed
    }
    
    const duration = now - existingTiming.startTime;
    
    const completedTiming: StepTiming = {
      ...existingTiming,
      endTime: now,
      duration,
      isCompleted: true
    };
    
    setStepTimings(prev => {
      const newMap = new Map(prev);
      newMap.set(stepIndex, completedTiming);
      return newMap;
    });
    
    console.log(`⏱️ STEP TIMER COMPLETED:`);
    console.log(`   Step ${stepIndex + 1} (${existingTiming.stepLabel})`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`   Start: ${new Date(existingTiming.startTime).toLocaleTimeString()}`);
    console.log(`   End: ${new Date(now).toLocaleTimeString()}`);
    
    return duration;
  }, [stepTimings]);

  const getTimingStatistics = useCallback(() => {
    const completedSteps = Array.from(stepTimings.values()).filter(timing => timing.isCompleted);
    
    if (completedSteps.length === 0) {
      return {
        totalStepsCompleted: 0,
        averageTimePerStep: 0,
        fastestStep: null,
        slowestStep: null,
        totalTimeSpent: 0
      };
    }
    
    const durations = completedSteps.map(step => step.duration!);
    const totalTime = durations.reduce((sum, duration) => sum + duration, 0);
    const averageTime = totalTime / durations.length;
    
    const fastestTime = Math.min(...durations);
    const slowestTime = Math.max(...durations);
    
    const fastestStep = completedSteps.find(step => step.duration === fastestTime);
    const slowestStep = completedSteps.find(step => step.duration === slowestTime);
    
    return {
      totalStepsCompleted: completedSteps.length,
      averageTimePerStep: averageTime,
      fastestStep: fastestStep ? {
        stepIndex: fastestStep.stepIndex,
        stepLabel: fastestStep.stepLabel,
        duration: fastestTime
      } : null,
      slowestStep: slowestStep ? {
        stepIndex: slowestStep.stepIndex,
        stepLabel: slowestStep.stepLabel,
        duration: slowestTime
      } : null,
      totalTimeSpent: totalTime
    };
  }, [stepTimings]);

  const lastProcessedStep = useRef<{stepIndex: number, input: string, timestamp: number} | null>(null);

  const storeStepProgressionToAttempt = useCallback((stepProgression: StepProgression, stepIndex: number) => {
    const currentInput = stepProgression[1];
    const now = Date.now();
    
    // PREVENT DUPLICATE CALLS: Check if we just processed this exact step/input
    if (lastProcessedStep.current && 
        lastProcessedStep.current.stepIndex === stepIndex &&
        lastProcessedStep.current.input === currentInput &&
        (now - lastProcessedStep.current.timestamp) < 100) { // Within 100ms
      console.log('🚫 DUPLICATE CALL DETECTED - IGNORING');
      return;
    }
    
    // Update the last processed step
    lastProcessedStep.current = { stepIndex, input: currentInput, timestamp: now };
    
    // Get step timing info
    const stepTiming = stepTimings.get(stepIndex);
    const stepStartTime = stepTiming?.startTime || now;
    let timeSpentOnStep: number | undefined = undefined;
    
    // If this attempt is correct, complete the timer
    if (stepProgression[2] === true) { // isCorrect
      timeSpentOnStep = completeStepTimer(stepIndex);
    }
    
    setAttemptCounter(prev => {
      const newId = prev + 1;
      
      const newUserAttempt: UserAttempt = {
        attempt_id: newId,
        stepIndex,
        stepLabel: stepProgression[0],      
        userInput: stepProgression[1],      
        isCorrect: stepProgression[2],      
        expectedAnswer: stepProgression[3], 
        cumulativeProgress: stepProgression[4],
        stepStartTime,           // When step timing started
        attemptTime: now,        // When this attempt was made
        timeSpentOnStep,         // Total time if step completed
      };

      setUserAttempt(prevAttempts => {
        const newAttempts = [...prevAttempts, newUserAttempt];
        
        console.log('📝 NEW USER ATTEMPT STORED (WITH TIMING):');
        console.log(`   Attempt ID: ${newUserAttempt.attempt_id}`);
        console.log(`   Step: ${newUserAttempt.stepIndex + 1} (${newUserAttempt.stepLabel})`);
        console.log(`   Input: "${newUserAttempt.userInput}"`);
        console.log(`   Correct: ${newUserAttempt.isCorrect}`);
        console.log(`   Cumulative Progress: ${newUserAttempt.cumulativeProgress}%`);
        console.log(`   Step Start Time: ${new Date(newUserAttempt.stepStartTime).toLocaleTimeString()}`);
        console.log(`   Attempt Time: ${new Date(newUserAttempt.attemptTime).toLocaleTimeString()}`);
        
        if (newUserAttempt.timeSpentOnStep) {
          console.log(`   ⏱️ Time Spent on Step: ${(newUserAttempt.timeSpentOnStep / 1000).toFixed(2)} seconds`);
        } else {
          const currentDuration = now - stepStartTime;
          console.log(`   ⏱️ Current Time on Step: ${(currentDuration / 1000).toFixed(2)} seconds (ongoing)`);
        }
        
        console.log(`   Total Attempts: ${newAttempts.length}`);
        console.log('🗃️ Complete userAttempt array:', newAttempts);
        onAttemptUpdate?.(newAttempts);
          // ANALYZE BEHAVIOR AFTER EACH ATTEMPT
  setTimeout(() => {
    analyzeBehaviorAndUpdateHints(newAttempts);
  }, 100); // Small delay to ensure state is updated
        return newAttempts;
      });
      
      return newId;
    });
  }, [stepTimings, completeStepTimer, onAttemptUpdate]);

  // Function to validate individual line and update its state
  const validateIndividualLine = useCallback((lineIndex: number, trigger: 'enter') => {
    const line = lines[lineIndex];
    
    // Only validate if line has content and we have expected steps
    if (!line.trim() || !expectedSteps || lineIndex >= expectedSteps.length) {
      return;
    }
   
    const expectedStep = expectedSteps[lineIndex];
    
    const validation = InputValidator.validateStepWithTwoPhase(
      line.trim(),
      expectedStep.answer,
      expectedStep.label,
      lineIndex,
      expectedSteps
    );

    // Update validation states FIRST
    setLineValidationStates(prev => {
      const newMap = new Map(prev);
      newMap.set(lineIndex, validation);
      return newMap;
    });
    
    setValidationTriggers(prev => {
      const newMap = new Map(prev);
      newMap.set(lineIndex, trigger);
      return newMap;
    });

    // THEN get completion status with ALL validation states (not just current one)
    const updatedValidationStates = new Map(lineValidationStates);
    updatedValidationStates.set(lineIndex, validation);

    const updatedValidationTriggers = new Map(validationTriggers);
    updatedValidationTriggers.set(lineIndex, trigger);

    const completionStatus = InputValidator.getCompletionStatus(
      lines, 
      expectedSteps, 
      updatedValidationStates,    // ALL validation states
      updatedValidationTriggers   // ALL triggers
    );
    
    setUserProgressionArray(prev => {
      const newArray = [...prev];
      
      // Update existing step or add new step
      while (newArray.length <= lineIndex) {
        newArray.push(['', '', false, '', 0]); // Fill gaps with 5 default values
      }
      
      // Calculate individual step progress
      const stepWeight = 100 / expectedSteps.length;
      let individualStepProgress = 0;

      if (validation.isCurrentStepCorrect) {
        individualStepProgress = stepWeight;
      } else if (line.trim().length > 0) {
        const expectedLength = expectedStep.answer.trim().length;
        const userLength = line.trim().length;
        const excessCharacters = userLength - expectedLength;
        
        if (excessCharacters <= 3 && expectedLength > 0 && userLength > 0) {
          const consolationPerChar = (stepWeight / expectedLength) / 2;
          const cappedUserLength = Math.min(userLength, expectedLength);
          individualStepProgress = cappedUserLength * consolationPerChar;
        }
      }

      // Update current step
      newArray[lineIndex] = [
        expectedStep.label,              
        line.trim(),                     
        validation.isCurrentStepCorrect, 
        expectedStep.answer,             
        Math.round(individualStepProgress * 100) / 100
      ];

      // RECALCULATE CUMULATIVE PROGRESS for all steps
      let cumulativeProgress = 0;
      newArray.forEach((step, index) => {
        if (step[0]) { // If step has content
          cumulativeProgress += step[4]; // Add this step's progress
          // Update the step with cumulative progress
          newArray[index] = [
            step[0], // stepLabel
            step[1], // userInput
            step[2], // isCorrect
            step[3], // expectedAnswer
            Math.round(cumulativeProgress * 100) / 100 // CUMULATIVE progress
          ];
        }
      });
      
      // Enhanced console logging with validator data
      console.log('=== USER PROGRESSION ARRAY UPDATE ===');
      console.log(`Step ${lineIndex + 1} (${expectedStep.label}) entered:`, newArray[lineIndex]);
      console.log('📊 Validator Completion Status:', {
        totalProgress: completionStatus.percentage,
        baseProgress: completionStatus.baseProgress,
        consolationProgress: completionStatus.consolationProgress,
        correctSteps: completionStatus.correctSteps,
        totalSteps: completionStatus.totalSteps
      });
      console.log('📈 Step Breakdown:');
      console.log(`   User Input: "${newArray[lineIndex][1]}"`);
      console.log(`   Expected: "${newArray[lineIndex][3]}"`);
      console.log(`   Correct: ${newArray[lineIndex][2]}`);
      console.log(`   Individual Step Progress: ${Math.round(individualStepProgress * 100) / 100}%`);
      console.log(`   Cumulative Progress: ${newArray[lineIndex][4]}%`);
      console.log('Complete userProgressionArray:', newArray);
      console.log('📈 Array breakdown:');
      newArray.forEach((step, index) => {
        if (step[0]) { // Only log steps that have been filled
          console.log(`  Step[${index}]: [${step[0]}, "${step[1]}", ${step[2]}, "${step[3]}", cumulative:${step[4]}%]`);
        }
      });
      
      console.log(`🎯 Validator Total Progress: ${completionStatus.percentage}%`);
      console.log(`   📊 Base: ${completionStatus.baseProgress}% | Consolation: ${completionStatus.consolationProgress}%`);
      console.log('=====================================');
       storeStepProgressionToAttempt(newArray[lineIndex], lineIndex);
      return newArray;
    });
  }, [lines, expectedSteps, storeStepProgressionToAttempt, lineValidationStates, validationTriggers]);
  
  // Check if answer is complete using validator
  const isAnswerComplete = useCallback((currentLines: string[]): boolean => {
    if (!expectedSteps) return false;
    return InputValidator.isAnswerComplete(currentLines, expectedSteps);
  }, [expectedSteps]);

  // Get completion status using validator
  const getCompletionStatus = useCallback((currentLines: string[]) => {
    if (!expectedSteps) {
      return InputValidator.getCompletionStatus(currentLines, [], lineValidationStates, validationTriggers);
    }
    return InputValidator.getCompletionStatus(currentLines, expectedSteps, lineValidationStates, validationTriggers);
  }, [expectedSteps, lineValidationStates, validationTriggers]);

  const canCreateNewLine = useCallback((currentIndex: number): boolean => {
    const hasContent = lines[currentIndex].trim().length > 0;
    const withinLimit = lines.length < maxLines;
    const notLastAndEmpty = !(currentIndex === lines.length - 1 && lines[currentIndex] === '');
    const withinStepLimit = !expectedSteps || lines.length < expectedSteps.length;
    
    // Check if current step is correct (NO EXCEPTIONS - applies to ALL steps)
    const currentStepValidation = lineValidationStates.get(currentIndex);
    const isCurrentStepCorrect = currentStepValidation?.isCurrentStepCorrect === true;
    
    return hasContent && withinLimit && notLastAndEmpty && withinStepLimit && isCurrentStepCorrect;
  }, [lines, maxLines, expectedSteps, lineValidationStates]);

  const showStepRequiredFeedback = useCallback((index: number) => {
    // Set error state
    setStepErrorFeedback(prev => {
      const newMap = new Map(prev);
      newMap.set(index, true);
      return newMap;
    });
    
    // Clear error state after animation
    setTimeout(() => {
      setStepErrorFeedback(prev => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });
    }, 2000);
    
    const inputElement = inputRefs.current[index];
    if (inputElement) {
      inputElement.style.animation = 'shake 0.5s';
      inputElement.style.borderColor = '#ef4444'; // Red border
    
      setTimeout(() => {
        inputElement.style.animation = '';
        inputElement.style.borderColor = '';
      }, 500);
    }
  }, []);

  // useEffect to watch for validation state changes and handle line creation
  useEffect(() => {
    if (pendingLineCreation !== null) {
      const currentStepValidation = lineValidationStates.get(pendingLineCreation);
      const isCurrentStepCorrect = currentStepValidation?.isCurrentStepCorrect === true;
      
      if (isCurrentStepCorrect) {
        // Check if there's already an empty line after current position
        const hasEmptyLineAfter = pendingLineCreation + 1 < lines.length && lines[pendingLineCreation + 1].trim() === '';
        
        if (hasEmptyLineAfter) {
          // Don't create new line, just move to the existing empty line
          focusLine(pendingLineCreation + 1);
        } else if (canCreateNewLine(pendingLineCreation)) {
          // Create new line only if one doesn't exist
          const newLines = [...lines];
          newLines.splice(pendingLineCreation + 1, 0, '');
          setLines(newLines);
          onChange(newLines);
          
          setTimeout(() => {
            focusLine(pendingLineCreation + 1);
          }, 20);
        }
      } else {
        // Show feedback for incorrect step
        console.log(`❌ Step ${pendingLineCreation + 1} must be correct before proceeding to the next step.`);
        showStepRequiredFeedback(pendingLineCreation);
      }
      
      // Clear pending line creation
      setPendingLineCreation(null);
    }
  }, [lineValidationStates, pendingLineCreation, lines, onChange, canCreateNewLine, showStepRequiredFeedback]);

  // Handle line changes with spam detection
  const handleLineChange = (index: number, newValue: string) => {
    const now = Date.now();
    
    // START TIMER: When user starts typing on a new step
    if (newValue.trim() && !stepTimings.has(index)) {
      startStepTimer(index);
    }
    
    if (now - lastInputTime < spamTimeWindow) {
      setRapidInputCount(prev => prev + 1);
      if (rapidInputCount > spamThreshold) {
        onSpamDetected?.();
        return;
      }
    } else {
      setRapidInputCount(0);
      onResetSpamFlag?.();
    }
    setLastInputTime(now);

    const newLines = [...lines];
    newLines[index] = newValue;
    setLines(newLines);
    onChange(newLines);

    // Clear any existing validation state for this line
    setLineValidationStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(index);
      return newMap;
    });
    setValidationTriggers(prev => {
      const newMap = new Map(prev);
      newMap.delete(index);
      return newMap;
    });
  };

  // Handle key events
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      // Validate current line immediately on Enter
      if (lines[index].trim() && expectedSteps && index < expectedSteps.length) {
        validateIndividualLine(index, 'enter');
        
        // Set pending line creation to be handled by useEffect
        setPendingLineCreation(index);
        
        const isComplete = isAnswerComplete(lines);
        if (isComplete) {
          onSubmit?.(lines);
          return;
        }
      }
    } else if (event.key === 'Backspace' && lines[index] === '' && index > 0) {
      event.preventDefault();
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
      onChange(newLines);
      focusLine(index - 1);
    } else if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      focusLine(index - 1);
    } else if (event.key === 'ArrowDown' && index < lines.length - 1) {
      event.preventDefault();
      focusLine(index + 1);
    }
  };

  // Focus management with scroll
  const focusLine = (index: number) => {
    requestAnimationFrame(() => {
      const input = inputRefs.current[index];
      if (input) {
        input.focus();
        if (input instanceof HTMLInputElement) {
          input.setSelectionRange(input.value.length, input.value.length);
        } else if (input instanceof HTMLTextAreaElement) {
          input.setSelectionRange(input.value.length, input.value.length);
        }
        
        if (isScrollable) {
          scrollToFocusedInput(index);
        }
      } else {
        setTimeout(() => {
          const retryInput = inputRefs.current[index];
          if (retryInput) {
            retryInput.focus();
            if (retryInput instanceof HTMLInputElement) {
              retryInput.setSelectionRange(retryInput.value.length, retryInput.value.length);
            } else if (retryInput instanceof HTMLTextAreaElement) {
              retryInput.setSelectionRange(retryInput.value.length, retryInput.value.length);
            }
            
            if (isScrollable) {
              scrollToFocusedInput(index);
            }
          }
        }, 100);
      }
    });
  };

  // Ensure we have at least one empty line
  useEffect(() => {
    if (lines.length === 0) {
      const newLines = [''];
      setLines(newLines);
      onChange(newLines);
    } 
  }, [lines, onChange, expectedSteps, maxLines]);

  // Set up input refs
  const setInputRef = (index: number) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    while (inputRefs.current.length <= index) {
      inputRefs.current.push(null as any);
    }
    
    if (el) {
      inputRefs.current[index] = el;
    } else {
      inputRefs.current[index] = null as any;
    }
  };

  const analyzeBehaviorAndUpdateHints = useCallback((attempts: UserAttempt[]) => {
  if (attempts.length === 0) return;
  
  // Analyze behavior using the classifier
  const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);
  setBehaviorProfile(profile);
  
  // Get current step index (find first incomplete step)
  const currentStep = lines.findIndex((line, index) => 
    index < (expectedSteps?.length || 0) && 
    !lineValidationStates.get(index)?.isCurrentStepCorrect
  );
  
  setCurrentStepIndex(Math.max(0, currentStep));
  
  console.log('🧠 BEHAVIOR ANALYSIS UPDATED:', {
    currentBehavior: profile.currentBehavior,
    currentStep,
    activeTriggers: profile.activeTriggers.length
  });
}, [lines, expectedSteps, lineValidationStates]);

  const status = getCompletionStatus(lines);
  
  return (
    <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
      {/* Container with fixed height when scrollable */}
      <div 
        ref={containerRef}
        className={cn(
          "relative",
          isScrollable ? "h-[100px]" : "min-h-[50px]"
        )}
      >
        {/* Scrollable content */}
        <div 
          ref={scrollableRef}
          className={cn(
            "divide-y",
            isScrollable ? "h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" : ""
          )}
          style={{
            scrollBehavior: 'smooth'
          }}
        >
          {lines.map((line, index) => {
            const individualValidation = lineValidationStates.get(index);
            const validationTrigger = validationTriggers.get(index);
            
            return (
              <div key={index} className="relative group" style={{ minHeight: '50px' }}>
                <div className={cn(
                  "flex items-center transition-colors duration-200",
                  focusedIndex === index && "bg-blue-50",
                  (() => {
                    // No content - gray border
                    if (!line.trim() && index < status.totalSteps) {
                      return "border-l-4 border-l-gray-300";
                    }
                    
                    // Has content and validation result
                    if (line.trim() && individualValidation && validationTrigger) {
                      // PRIORITY 1: If step is correct, always show green
                      if (individualValidation.isCurrentStepCorrect === true) {
                        return "border-l-4 border-l-green-400 bg-green-50";
                      }
                      
                      // PRIORITY 2: If wrong but final answer detected, show orange
                      if (individualValidation.finalAnswerDetected === true) {
                        return "border-l-4 border-l-orange-400 bg-orange-50";
                      }
                      
                      // PRIORITY 3: Otherwise wrong, show red
                      return "border-l-4 border-l-red-400 bg-red-50";
                    }
                    
                    // Default: no special styling
                    return "";
                  })()
                )}>
                  {/* Line number indicator */}
                  <div className="w-8 flex-shrink-0 text-center text-xs text-gray-400 font-mono">
                    {index + 1}
                  </div>
                  
                  {/* Input field */}
                  <input
                    ref={setInputRef(index)}
                    type="text"
                    value={line}
                    onChange={(e) => handleLineChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    disabled={disabled}
                    placeholder={index === 0 ? placeholder : `Step ${index + 1}...`}
                    className={cn(
                      "flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none py-3 px-3",
                      "placeholder-gray-400 text-gray-900",
                      disabled && "bg-gray-50 text-gray-500"
                    )}
                  />

                  {/* Individual line status indicator */}
                  {expectedSteps && index < expectedSteps.length && (
                    <div className="w-6 flex-shrink-0 text-center text-sm">
                      {!line.trim() ? (
                        <span className="text-gray-300">○</span>
                      ) : individualValidation && validationTrigger ? (
                        individualValidation.isCurrentStepCorrect === true ? (
                          <span className="text-green-500" title={`Correct (validated on ${validationTrigger})`}>✅</span>
                        ) : individualValidation.finalAnswerDetected === true ? (
                          <span className="text-orange-500" title="Final answer in wrong position">⚠️</span>
                        ) : (
                          <span className="text-red-500" title={`Incorrect (validated on ${validationTrigger})`}>❌</span>
                        )
                      ) : (
                        <span className="text-gray-300" title="Not yet validated">⏳</span>
                      )}
                    </div>
                  )}

                  {/* Error message for feedback */}
                  {stepErrorFeedback.get(index) && (
                    <div className="absolute -bottom-6 left-8 text-xs text-red-500 bg-red-50 px-2 py-1 rounded shadow-sm z-10">
                      Complete this step correctly first
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll indicators */}
        {isScrollable && (
          <>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10" />
            
            {showScrollIndicator && (
              <div className="absolute top-1 right-1 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded shadow-sm pointer-events-none z-20">
                <span className="flex items-center gap-1">
                  <span>↕</span>
                  <span>Scroll</span>
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Progress bar indicator */}
      {expectedSteps && expectedSteps.length > 0 && (
        <div className="bg-gray-50 border-t px-3 py-2 space-y-1">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 min-w-[50px]">
              Progress:
            </span>
            
            <div className="flex-1 relative">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300 ease-out rounded-full",
                    status.percentage === 100 
                      ? "bg-green-500"           
                      : status.percentage >= 80  
                      ? "bg-emerald-500"         
                      : status.percentage >= 50  
                      ? "bg-blue-500"            
                      : status.percentage >= 20  
                      ? "bg-orange-500"          
                      : status.percentage > 0    
                      ? "bg-yellow-500"          
                      : "bg-gray-300"            
                  )}
                  style={{ width: `${status.percentage}%` }}
                />
              </div>
            </div>
            
            <span className="text-xs text-gray-400 min-w-[35px] text-right">
              {status.percentage}%
            </span>
          </div>

          {/* Timing Information Display */}
          {(() => {
            const currentStep = lines.findIndex((line, index) => 
              index < expectedSteps.length && !lineValidationStates.get(index)?.isCurrentStepCorrect
            );
            const currentStepTiming = currentStep >= 0 ? stepTimings.get(currentStep) : null;
            const stats = getTimingStatistics();
            
            return (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {/* Current Step Timer */}
                {currentStepTiming && !currentStepTiming.isCompleted && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>
                      Step {currentStep + 1}: {
                        Math.floor((Date.now() - currentStepTiming.startTime) / 1000)
                      }s
                    </span>
                  </div>
                )}
                
                {/* Completed Steps Stats */}
                {stats.totalStepsCompleted > 0 && (
                  <div className="flex items-center gap-3">
                    <span>✅ {stats.totalStepsCompleted} completed</span>
                    <span>⏱️ Avg: {(stats.averageTimePerStep / 1000).toFixed(1)}s</span>
                    {stats.fastestStep && (
                      <span>🏃 Fastest: {(stats.fastestStep.duration / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Short Hints Component */}
          <ShortHints 
            userAttempts={userAttempt}
            behaviorProfile={behaviorProfile}
            currentStepIndex={currentStepIndex}
            isVisible={showHints}
            hintText={hintText}
            onRequestHint={onRequestHint}
          />
        </div>
      )}
    </div>
  );
}

export { type StepProgression, type UserAttempt };