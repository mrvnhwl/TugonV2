import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../cn";
import InputValidator from "./UserInputValidator";
import type { TwoPhaseValidationResult, CompletionStatus } from "./UserInputValidator";
import type { Step } from "@/components/data/answers";
import ShortHints from "../hint-system/shortHints";
type StepProgression = [string, string, boolean, string]; // [stepLabel, userInput, isCorrect, expectedAnswer]
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
}: UserInputProps) {
  const [lines, setLines] = useState<string[]>(value);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement)[]>([]);
  
   // ADD: User progression tracking array
  const [userProgressionArray, setUserProgressionArray] = useState<StepProgression[]>([]);
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

    // Update validation states
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
     const stepProgression: StepProgression = [
      expectedStep.label,              // stepLabel
      line.trim(),                     // userInput
      validation.isCurrentStepCorrect, // right or wrong (boolean)
      expectedStep.answer              // expectedAnswer (predefinedAnswer)
    ];
    setUserProgressionArray(prev => {
      const newArray = [...prev];
      
      // Update existing step or add new step
      while (newArray.length <= lineIndex) {
        newArray.push(['', '', false, '']); // Fill gaps if necessary
      }
      
      newArray[lineIndex] = stepProgression;
      
      // Console log the updated progression array
      console.log('=== USER PROGRESSION ARRAY UPDATE ===');
      console.log(`Step ${lineIndex + 1} (${expectedStep.label}) entered:`, stepProgression);
      console.log('Complete userProgressionArray:', newArray);
      console.log('Array breakdown:');
      newArray.forEach((step, index) => {
        if (step[0]) { // Only log steps that have been filled
          console.log(`  Step[${index}]: [${step[0]}, "${step[1]}", ${step[2]}, "${step[3]}"]`);
        }
      });
      console.log('=====================================');
      
      return newArray;
    });
  }, [lines, expectedSteps]);

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
      }
      
      const isComplete = isAnswerComplete(lines);
      
      if (isComplete) {
        onSubmit?.(lines);
        return;
      }
      
      // Check if there's already an empty line after current position
      const hasEmptyLineAfter = index + 1 < lines.length && lines[index + 1].trim() === '';
      
      if (hasEmptyLineAfter) {
        // Don't create new line, just move to the existing empty line
        focusLine(index + 1);
      } else if (canCreateNewLine(index)) {
        // Create new line only if one doesn't exist
        const newLines = [...lines];
        newLines.splice(index + 1, 0, '');
        setLines(newLines);
        onChange(newLines);
        
        setTimeout(() => {
          focusLine(index + 1);
        }, 20);
      } else {
        // Check if we've reached step limit
        const stepLimit = expectedSteps?.length || maxLines;
        if (lines.length >= stepLimit && expectedSteps) {
          const status = getCompletionStatus(lines);
          if (status.completedSteps >= status.totalSteps && !status.allCorrect) {
            onSuggestSubmission?.(lines);
          }
        } else {
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
      focusLine(index - 1);
    } else if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      focusLine(index - 1);
    } else if (event.key === 'ArrowDown' && index < lines.length - 1) {
      event.preventDefault();
      focusLine(index + 1);
    }
  };

  // Check if we can create a new line
  const canCreateNewLine = (currentIndex: number): boolean => {
    const hasContent = lines[currentIndex].trim().length > 0;
    const withinLimit = lines.length < maxLines;
    const notLastAndEmpty = !(currentIndex === lines.length - 1 && lines[currentIndex] === '');
    const withinStepLimit = !expectedSteps || lines.length < expectedSteps.length;
    
    return hasContent && withinLimit && notLastAndEmpty && withinStepLimit;
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

          {/* Short Hints Component */}
          <ShortHints 
            isVisible={showHints}
            hintText={hintText}
            onRequestHint={onRequestHint}
          />
        </div>
      )}
    </div>
  );
}