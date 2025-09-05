import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../cn";
import InputValidator from "./UserInputValidator";
import type { Step } from "@/components/data/answers";
import ShortHints from "../hint-system/shortHints";

export interface UserInputProps {
  value: string[];
  onChange: (lines: string[]) => void;
  placeholder?: string;
  maxLines?: number;
  disabled?: boolean;
  className?: string;
  onSpamDetected?: () => void;
  onResetSpamFlag?: () => void;
  // Props for smart Enter submission
  expectedSteps?: Step[];
  onSubmit?: (lines: string[]) => void;
  onSuggestSubmission?: (lines: string[]) => void;
  // Props for Short Hints
  showHints?: boolean;
  hintText?: string;
  onRequestHint?: () => void;
}

// Two-phase validation result type
type TwoPhaseValidationResult = {
  mathematicallyCorrect: boolean;
  positionallyValid: boolean;
  finalAnswerDetected: boolean;
  isCurrentStepCorrect: boolean;
};

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
}: UserInputProps) {
  const [lines, setLines] = useState<string[]>(value);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement)[]>([]);
  
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

  // Sync with prop changes
  useEffect(() => {
    setLines(value);
  }, [value]);

  // Check if scrolling is needed
  const checkScrollNeeded = useCallback(() => {
    const visibleLines = Math.min(lines.length, 2);
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

  // TWO-PHASE VALIDATION: Mathematical equivalence + positional validation
  const validateStepWithTwoPhase = useCallback((
    userInput: string,
    expectedAnswer: string,
    stepLabel: string,
    currentStepIndex: number,
    allExpectedSteps: Step[]
  ): TwoPhaseValidationResult => {
    
    // Phase 1: Mathematical equivalence check (flexible)
    const mathematicallyCorrect = InputValidator.isMathematicallyEquivalentRobust(
      userInput.trim(), 
      expectedAnswer.trim()
    );
    
    // Initialize result
    let positionallyValid = mathematicallyCorrect;
    let finalAnswerDetected = false;
    let isCurrentStepCorrect = mathematicallyCorrect;
    
    // FIXED: If the current step is mathematically correct, accept it regardless of final answer match
    if (mathematicallyCorrect) {
      // The user got the current step right - this is the PRIMARY validation
      isCurrentStepCorrect = true;
      positionallyValid = true;
      
      // SECONDARY: Check if this also happens to be the final answer (for detection purposes only)
      if (allExpectedSteps.length > 0) {
        const finalStep = allExpectedSteps[allExpectedSteps.length - 1];
        const isFinalAnswerMathematically = InputValidator.isMathematicallyEquivalentRobust(
          userInput.trim(),
          finalStep.answer.trim()
        );
        
        // Only flag as "final answer detected" if it's NOT the current expected step
        if (isFinalAnswerMathematically && stepLabel !== "final" && userInput.trim() !== expectedAnswer.trim()) {
          finalAnswerDetected = true;
          
          // SPECIAL CASE: Only block if user literally wrote the final answer format (like "40")
          // But allow mathematical variations of the current step (like "6*6+4" vs "6(6)+4")
          const isLiteralFinalAnswer = userInput.trim() === finalStep.answer.trim();
          
          if (isLiteralFinalAnswer && currentStepIndex === 0) {
            // User literally wrote "40" in step 1 - this should be blocked
            positionallyValid = false;
            isCurrentStepCorrect = false;
            finalAnswerDetected = true;
          }
          // Otherwise, keep the step as correct even if it mathematically equals final answer
        }
      }
    } else {
      // Phase 2: Check for step confusion if current step is wrong
      if (allExpectedSteps.length > 0) {
        // Check if user input matches other steps
        for (let i = 0; i < allExpectedSteps.length; i++) {
          if (i === currentStepIndex) continue; // Skip current step
          
          const otherStep = allExpectedSteps[i];
          const matchesOtherStep = InputValidator.isMathematicallyEquivalentRobust(
            userInput.trim(),
            otherStep.answer.trim()
          );
          
          if (matchesOtherStep) {
            if (otherStep.label === "final" && currentStepIndex === 0) {
              // Final answer in step 1 - block it
              finalAnswerDetected = true;
              positionallyValid = false;
              isCurrentStepCorrect = false;
            } else if (otherStep.label === "final" && currentStepIndex > 0) {
              // Final answer in step 2+ - allow it for 80% progression
              finalAnswerDetected = true;
              positionallyValid = true;
              isCurrentStepCorrect = true;
            } else {
              // Other step confusion
              console.log(`Step confusion: "${userInput}" matches step ${i + 1} (${otherStep.label}) but is in position ${currentStepIndex + 1} (${stepLabel})`);
              positionallyValid = false;
              isCurrentStepCorrect = false;
            }
            break;
          }
        }
      }
    }
    
    return { 
      mathematicallyCorrect, 
      positionallyValid, 
      finalAnswerDetected,
      isCurrentStepCorrect
    };
  }, []);

  // Check if answer is complete using two-phase validation
  const isAnswerComplete = useCallback((currentLines: string[]): boolean => {
    if (!expectedSteps || expectedSteps.length === 0) return false;
    
    const nonEmptyLines = currentLines.filter(line => line.trim().length > 0);
    
    if (nonEmptyLines.length < expectedSteps.length) return false;
    
    // Check each step with two-phase validation
    for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
      const userLine = nonEmptyLines[i];
      const expectedStep = expectedSteps[i];
      
      const validation = validateStepWithTwoPhase(
        userLine,
        expectedStep.answer,
        expectedStep.label,
        i,
        expectedSteps
      );
      
      if (!validation.isCurrentStepCorrect) {
        return false;
      }
    }
    
    return true;
  }, [expectedSteps, validateStepWithTwoPhase]);

  // Get completion status with two-phase validation approach
  const getCompletionStatus = useCallback((currentLines: string[]) => {
    if (!expectedSteps || expectedSteps.length === 0) {
      return {
        totalSteps: 1,
        completedSteps: currentLines.filter(line => line.trim().length > 0).length,
        correctSteps: 0,
        isComplete: false,
        allCorrect: false,
        percentage: 0,
        finalAnswerDetected: false,
        finalAnswerPosition: -1,
        stepCorrectness: []
      };
    }

    const nonEmptyLines = currentLines.filter(line => line.trim().length > 0);
    const totalSteps = expectedSteps.length;
    let correctSteps = 0;
    const stepCorrectness: boolean[] = [];
    
    // Track final answer detection
    let finalAnswerDetected = false;
    let finalAnswerPosition = -1;
    const finalStepIndex = totalSteps - 1;

    // TWO-PHASE: Check each step for correctness
    for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
      const userLine = nonEmptyLines[i];
      const expectedStep = expectedSteps[i];
      
      // Use two-phase validation
      const validation = validateStepWithTwoPhase(
        userLine,
        expectedStep.answer,
        expectedStep.label,
        i,
        expectedSteps
      );
      
      stepCorrectness[i] = validation.isCurrentStepCorrect;
      
      if (validation.isCurrentStepCorrect) {
        correctSteps++;
      }
    }

    // TWO-PHASE: Enhanced final answer detection across all lines
    for (let i = 0; i < nonEmptyLines.length; i++) {
      const userLine = nonEmptyLines[i];
      
      if (expectedSteps.length > 0) {
        const finalStep = expectedSteps[finalStepIndex];
        
        // Check if this line is mathematically equivalent to final answer
        const isMathematicallyFinal = InputValidator.isMathematicallyEquivalentRobust(
          userLine.trim(),
          finalStep.answer.trim()
        );
        
        if (isMathematicallyFinal) {
          // Apply positional rules
          if (i === 0) {
            // Final answer in position 1 - not allowed
            continue;
          } else {
            // Final answer in position 2+ - allowed
            finalAnswerDetected = true;
            finalAnswerPosition = i;
            break;
          }
        }
      }
    }

    const isComplete = nonEmptyLines.length >= totalSteps;
    const allCorrect = correctSteps === totalSteps && isComplete;
    
    // TWO-PHASE: Percentage calculation with your rules
    const calculatePercentage = (): number => {
      if (totalSteps === 0) return 0;
      
      let percentage = 0;
      
      // YOUR RULE: Award 80% if final answer is detected in position 2+
      if (finalAnswerDetected && finalAnswerPosition > 0) {
        percentage += 80;
      }
      
      // YOUR RULE: Step 1 gets 20%, must be substitution
      if (stepCorrectness[0]) {
        percentage += 20;
      }
      
      // Award remaining percentage for other intermediate steps
      for (let i = 1; i < totalSteps - 1; i++) {
        if (stepCorrectness[i]) {
          const stepValue = Math.max(15 - ((i - 1) * 5), 5); // 15%, 10%, 5%...
          percentage += stepValue;
        }
      }
      
      // Handle final step separately to avoid double counting
      const finalStepCorrect = stepCorrectness[finalStepIndex];
      if (finalStepCorrect && !finalAnswerDetected) {
        // Only award final step points if we haven't already awarded final answer points
        percentage += Math.max(80 - (stepCorrectness.filter(Boolean).length - 1) * 20, 20);
      }
      
      // Only award 100% if ALL steps are correct AND complete
      if (allCorrect && isComplete) {
        return 100;
      }
      
      return Math.min(percentage, 99); // Cap at 99% unless truly complete
    };

    const percentage = calculatePercentage();

    return {
      totalSteps,
      completedSteps: nonEmptyLines.length,
      correctSteps,
      isComplete,
      allCorrect,
      percentage,
      stepCorrectness,
      finalAnswerDetected,
      finalAnswerPosition
    };
  }, [expectedSteps, validateStepWithTwoPhase]);

  // Handle line changes with spam detection
  const handleLineChange = (index: number, newValue: string) => {
    const now = Date.now();
    
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
  };

  // Handle key events
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      const isComplete = isAnswerComplete(lines);
      
      if (isComplete) {
        console.log("🎯 Answer complete! Submitting via Enter key...");
        onSubmit?.(lines);
        return;
      }
      
      // FIXED: Check if there's already an empty line after current position
      const hasEmptyLineAfter = index + 1 < lines.length && lines[index + 1].trim() === '';
      
      if (hasEmptyLineAfter) {
        // Don't create new line, just move to the existing empty line
        focusLineAggressively(index + 1);
      } else if (canCreateNewLine(index)) {
        // Create new line only if one doesn't exist
        const newLines = [...lines];
        newLines.splice(index + 1, 0, '');
        setLines(newLines);
        onChange(newLines);
        
        // Use aggressive focus for better reliability
        setTimeout(() => {
          focusLineAggressively(index + 1);
        }, 20); // Slightly longer delay
      } else {
        // Check if we've reached step limit
        const stepLimit = expectedSteps?.length || maxLines;
        if (lines.length >= stepLimit && expectedSteps) {
          console.log(`📋 Step limit reached: ${stepLimit}/${expectedSteps.length} steps`);
          // Don't create new line, just check if answer is ready for submission
          const status = getCompletionStatus(lines);
          if (status.completedSteps >= status.totalSteps && !status.allCorrect) {
            onSuggestSubmission?.(lines);
          }
        } else {
          // Original logic for other limits
          const status = getCompletionStatus(lines);
          if (status.completedSteps >= status.totalSteps && !status.allCorrect) {
            onSuggestSubmission?.(lines);
          }
        }
      }
    } else if (event.key === 'Backspace' && lines[index] === '' && index > 0) {
      event.preventDefault();
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
      onChange(newLines);
      focusLineAggressively(index - 1);
    } else if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      focusLineAggressively(index - 1);
    } else if (event.key === 'ArrowDown' && index < lines.length - 1) {
      event.preventDefault();
      focusLineAggressively(index + 1);
    }
  };

  // Check if we can create a new line
  const canCreateNewLine = (currentIndex: number): boolean => {
    const hasContent = lines[currentIndex].trim().length > 0;
    const withinLimit = lines.length < maxLines;
    const notLastAndEmpty = !(currentIndex === lines.length - 1 && lines[currentIndex] === '');
    
    // NEW: Restrict to the number of expected steps
    const withinStepLimit = !expectedSteps || lines.length < expectedSteps.length;
    
    return hasContent && withinLimit && notLastAndEmpty && withinStepLimit;
  };

  // Focus management with scroll
  const focusLine = (index: number) => {
    // Use requestAnimationFrame for more reliable DOM timing
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
        // If input doesn't exist yet, try again after a short delay
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
        }, 100); // Longer delay for element creation
      }
    });
  };

  // More aggressive focus approach - add this as a backup
  const focusLineAggressively = (index: number) => {
    const attemptFocus = (attempt: number = 0) => {
      if (attempt > 15) { // Increased attempts
        console.warn(`Failed to focus line ${index} after ${attempt} attempts`);
        return;
      }
      
      const input = inputRefs.current[index];
      if (input && document.contains(input)) {
        try {
          input.focus();
          if (input instanceof HTMLInputElement) {
            input.setSelectionRange(input.value.length, input.value.length);
          }
          console.log(`Successfully focused line ${index} on attempt ${attempt + 1}`);
          
          // Update the focused index state
          setFocusedIndex(index);
        } catch (error) {
          console.warn(`Focus attempt ${attempt + 1} failed:`, error);
          setTimeout(() => attemptFocus(attempt + 1), 30);
        }
      } else {
        console.log(`Attempt ${attempt + 1}: Input not ready for index ${index}, retrying...`);
        setTimeout(() => attemptFocus(attempt + 1), 30);
      }
    };
    
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      setTimeout(() => attemptFocus(), 10);
    });
  };

  // Ensure we have at least one empty line
  useEffect(() => {
    if (lines.length === 0) {
      // Always ensure at least one line exists
      const newLines = [''];
      setLines(newLines);
      onChange(newLines);
    } else if (lines.every(line => line.trim().length > 0)) {
      // Only add empty line if we haven't reached the step limit AND no empty line exists
      const stepLimit = expectedSteps?.length || maxLines;
      const hasEmptyLine = lines.some(line => line.trim() === '');
      
      if (lines.length < stepLimit && !hasEmptyLine) {
        const newLines = [...lines, ''];
        setLines(newLines);
        onChange(newLines);
      }
    }
  }, [lines, onChange, expectedSteps, maxLines]);

  // Set up input refs
  const setInputRef = (index: number) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    // Ensure the refs array is large enough
    while (inputRefs.current.length <= index) {
      inputRefs.current.push(null as any);
    }
    
    if (el) {
      inputRefs.current[index] = el;
      // Debug log to track ref assignments
      console.log(`Input ref set for index ${index}:`, !!el);
    } else {
      inputRefs.current[index] = null as any;
    }
  };

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
          {lines.map((line, index) => (
            <div key={index} className="relative group" style={{ minHeight: '50px' }}>
              <div className={cn(
                "flex items-center transition-colors duration-200",
                focusedIndex === index && "bg-blue-50",
                !line.trim() && index < status.totalSteps && "border-l-4 border-l-gray-300",
                // TWO-PHASE: Use two-phase validation for line styling
                line.trim() && index < status.totalSteps && 
                  (() => {
                    if (!expectedSteps?.[index]) return "";
                    
                    const validation = validateStepWithTwoPhase(
                      line.trim(),
                      expectedSteps[index].answer,
                      expectedSteps[index].label,
                      index,
                      expectedSteps
                    );
                    
                    return validation.isCurrentStepCorrect
                      ? "border-l-4 border-l-green-400 bg-green-50"
                      : "border-l-4 border-l-red-400 bg-red-50";
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

                {/* TWO-PHASE: Step status indicator using two-phase validation */}
                {expectedSteps && index < expectedSteps.length && (
                  <div className="w-6 flex-shrink-0 text-center text-sm">
                    {!line.trim() ? (
                      <span className="text-gray-300">○</span>
                    ) : (() => {
                        const validation = validateStepWithTwoPhase(
                          line.trim(),
                          expectedSteps[index].answer,
                          expectedSteps[index].label,
                          index,
                          expectedSteps
                        );
                        
                        return validation.isCurrentStepCorrect ? (
                          <span className="text-green-500">✅</span>
                        ) : validation.mathematicallyCorrect && validation.finalAnswerDetected && index === 0 ? (
                          <span className="text-orange-500" title="Final answer in wrong position">⚠️</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        );
                      })()
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
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
          {/* Minimal Progress bar */}
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

          {/* Compact Status message */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {status.allCorrect && status.percentage === 100 ? (
                <span className="text-green-600">🎯 Complete!</span>
              ) : status.finalAnswerDetected && status.percentage >= 80 ? (
                <span className="text-emerald-600">
                  🎉 Final answer found!
                </span>
              ) : status.percentage >= 20 ? (
                <span className="text-blue-600">Keep going...</span>
              ) : (
                <span className="text-gray-500">Begin solving...</span>
              )}
            </div>

            <div className="text-right">
              {status.allCorrect ? (
                <span className="text-green-600 font-medium">Press Enter ↵</span>
              ) : (
                <span className="text-gray-400">
                  {status.correctSteps+1} Steps Created
                </span>
              )}
            </div>
          </div>

          {/* Short Hints Component */}
          <ShortHints 
            isVisible={showHints}
            hintText={hintText}
            onRequestHint={onRequestHint}
          />
        </div>
      )}

      {/* ENHANCED: Debug info showing two-phase validation results */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="text-xs bg-yellow-50 border-t px-3 py-1 text-yellow-800">
          Debug: {status.completedSteps}/{status.totalSteps} steps, {status.correctSteps} correct, 
          {status.percentage}% complete, Lines: {lines.length}
          <br />
          Final Answer: {status.finalAnswerDetected ? `Yes (line ${status.finalAnswerPosition + 1})` : 'No'}
          <br />
          Two-Phase Validation: {status.stepCorrectness?.map((correct, i) => {
            if (!expectedSteps?.[i] || i >= lines.filter(l => l.trim()).length) return '';
            const userLine = lines.filter(l => l.trim())[i];
            const validation = validateStepWithTwoPhase(
              userLine?.trim() || '',
              expectedSteps[i].answer,
              expectedSteps[i].label,
              i,
              expectedSteps
            );
            return `Step ${i + 1}(${expectedSteps[i].label}): ${correct ? '✅' : '❌'} [Math:${validation.mathematicallyCorrect ? '✅' : '❌'}, Pos:${validation.positionallyValid ? '✅' : '❌'}, Final:${validation.finalAnswerDetected ? '⚠️' : '➖'}]`;
          }).filter(Boolean).join(', ')}
          <br />
          Expected: {expectedSteps?.map((step, i) => 
            `${i + 1}:"${step.answer}" (${step.label})`
          ).join(' | ')}
        </div>
      )} */}
    </div>
  );
}