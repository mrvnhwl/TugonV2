import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../cn";
import InputValidator from "./UserInputValidator";
import type { SimpleValidationResult, CompletionStatus } from "./UserInputValidator";
import type { Step } from "@/components/data/answers/types";
import ShortHints from "../hint-system/shortHints";
import UserBehaviorClassifier from './UserBehaviorClassifier';
import type { UserBehaviorProfile, BehaviorType } from './UserBehaviorClassifier';
import LongHints from "../hint-system/longHints";
import { MathfieldElement } from "mathlive"; // Ensure mathlive is installed
import { FeedbackOverlay } from './FeedbackOverlay';
import { tokenizeMathString } from './tokenUtils';
import toast from 'react-hot-toast';
import { BehaviorAnalyzer } from './BehaviorAnalyzer';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { getStepHint } from '../../data/hints/index';

type StepProgression = [string, string, boolean, string, number];
type UserAttempt = {
  attempt_id: number;
  stepIndex: number;
  stepLabel: string;
  userInput: string;
  sanitizedInput: string;
  tokens: string[];
  isCorrect: boolean;
  expectedAnswer: string;
  sanitizedExpectedAnswer: string;
  expectedTokens: string[];
  cumulativeProgress: number;
  stepStartTime: number;
  attemptTime: number;
  timeSpentOnStep?: number;
};

type StepTiming = {
  stepIndex: number;
  stepLabel: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  isCompleted: boolean;
};

export interface UserInputProps {
  value: string[];
  placeholder?: string;
  maxLines?: number;
  disabled?: boolean;
  className?: string;
  topicId?: number;
  categoryId?: number;
  questionId?: number;
  expectedSteps: Step[];
  showHints?: boolean;
  hintText?: string;
  onChange: (lines: string[]) => void;
  onSpamDetected?: () => void;
  onResetSpamFlag?: () => void;
  onSubmit?: (lines: string[]) => void;
  onSuggestSubmission?: (lines: string[]) => void;
  onRequestHint?: () => void;
  onAttemptUpdate?: (attempts: UserAttempt[]) => void;
  onValidationResult?: (type: 'correct' | 'incorrect' | 'partial', currentStep: number) => void;
}

export default function UserInput({
  value = [''],
  onChange,
  placeholder = "Type your answer here...",
  maxLines = 10,
  disabled = false,
  className,
  topicId,
  categoryId,
  questionId,
  onSpamDetected,
  onResetSpamFlag,
  expectedSteps,
  onSubmit,
  showHints = false,
  hintText,
  onAttemptUpdate,
  onValidationResult
}: UserInputProps) {
  const [lines, setLines] = useState<string[]>(value);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | any)[]>([]);

  const [virtualKeyboardEnabled, setVirtualKeyboardEnabled] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsDesktop(!isMobile);
    setVirtualKeyboardEnabled(true);
  }, []);

  const [behaviorProfile, setBehaviorProfile] = useState<UserBehaviorProfile | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const [userProgressionArray, setUserProgressionArray] = useState<StepProgression[]>([]);
  const [userAttempt, setUserAttempt] = useState<UserAttempt[]>([]);
  const [attemptCounter, setAttemptCounter] = useState<number>(0);

  const [wrongAttemptCounter, setWrongAttemptCounter] = useState<number>(0);
  const [attemptHistory, setAttemptHistory] = useState<string[]>([]);
  const lastToastTime = useRef<number>(0);

  const [shortHintCounter, setShortHintCounter] = useState<number>(0);
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{ userInput: string; correctAnswer: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const [lastInputTime, setLastInputTime] = useState<number>(0);
  const [rapidInputCount, setRapidInputCount] = useState<number>(0);
  const spamThreshold = 10;
  const spamTimeWindow = 1000;

  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const SUBMISSION_COOLDOWN = 2000;

  const [lineValidationStates, setLineValidationStates] = useState<Map<number, SimpleValidationResult | null>>(new Map());
  const [validationTriggers, setValidationTriggers] = useState<Map<number, 'enter' | null>>(new Map());

  const [stepErrorFeedback, setStepErrorFeedback] = useState<Map<number, boolean>>(new Map());
  const [stepTimings, setStepTimings] = useState<Map<number, StepTiming>>(new Map());
  const [currentStepStartTime, setCurrentStepStartTime] = useState<number | null>(null);
  const [pendingLineCreation, setPendingLineCreation] = useState<number | null>(null);

  const [attemptsSinceLastHint, setAttemptsSinceLastHint] = useState<number>(0);
  const [lastBehaviorClassification, setLastBehaviorClassification] = useState<BehaviorType | null>(null);
  const [hintIntervalActive, setHintIntervalActive] = useState<boolean>(false);

  useEffect(() => {
    setLines(value);
  }, [value]);

  const checkScrollNeeded = useCallback(() => {
    const needsScrolling = lines.length > 2;
    setIsScrollable(needsScrolling);
    setShowScrollIndicator(needsScrolling);
  }, [lines.length]);

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

  useEffect(() => {
    checkScrollNeeded();
  }, [lines.length, checkScrollNeeded]);

  useEffect(() => {
    if (focusedIndex !== null && isScrollable) {
      scrollToFocusedInput(focusedIndex);
    }
  }, [focusedIndex, isScrollable, scrollToFocusedInput]);

  const checkCooldownStatus = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    return timeSinceLastSubmission < SUBMISSION_COOLDOWN;
  }, [lastSubmissionTime, SUBMISSION_COOLDOWN]);

  const startSubmissionCooldown = useCallback(() => {
    const now = Date.now();
    setLastSubmissionTime(now);
    setIsOnCooldown(true);
    setTimeout(() => {
      setIsOnCooldown(false);
    }, SUBMISSION_COOLDOWN);
  }, [SUBMISSION_COOLDOWN]);

  const canSubmit = useCallback((): boolean => {
    const onCooldown = checkCooldownStatus();
    if (onCooldown) return false;
    return true;
  }, [checkCooldownStatus]);

  const shouldUseMathMode = useCallback((lineIndex: number): boolean => {
    if (!expectedSteps || lineIndex >= expectedSteps.length) return false;
    const stepLabel = expectedSteps[lineIndex].label;
    const mathLabels = ["choose", "evaluation", "substitution", "simplification", "final", "math"];
    return mathLabels.includes(stepLabel);
  }, [expectedSteps]);

  const getStepPlaceholder = useCallback((lineIndex: number): string => {
    if (!expectedSteps || lineIndex >= expectedSteps.length) {
      return "Enter your expression here...";
    }
    const step = expectedSteps[lineIndex];
    return step.placeholder || "Enter your expression here...";
  }, [expectedSteps]);

  const showHintMessage = useCallback((
    userInput: string,
    correctAnswer: string,
    attemptHistory: string[],
    lineIndex: number
  ) => {
    const now = Date.now();
    if (now - lastToastTime.current < 500) return;
    lastToastTime.current = now;

    const analysis = BehaviorAnalyzer.analyze(userInput, correctAnswer, attemptHistory);
    let hint = "";
    let icon = "💡";

    const stepLabel = expectedSteps[lineIndex]?.label || '';

    if (topicId && categoryId && questionId && stepLabel) {
      const contextHint = getStepHint(
        topicId,
        categoryId,
        questionId,
        stepLabel,
        analysis.type as any
      );
      if (contextHint) {
        hint = contextHint;
        const iconMatch = hint.match(/^([\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?|[\u{2600}-\u{27BF}])/u);
        if (iconMatch) icon = iconMatch[0];
      }
    }

    if (!hint) {
      switch (analysis.type) {
        case 'sign-error':
          hint = "⚠️ Double-check your signs (+ or -). The magnitude looks right!";
          icon = "⚠️";
          break;
        case 'repetition':
          hint = `🔁 You've tried "${userInput}" multiple times. Try a different approach or review the problem steps.`;
          icon = "🔁";
          break;
        case 'close-attempt':
          hint = "🎯 You're getting close! Review your calculations carefully—you might have a small arithmetic error.";
          icon = "🎯";
          break;
        case 'magnitude-error':
          hint = "📏 Your answer seems off by a factor of 10 or more. Check your decimal point or unit conversions.";
          icon = "📏";
          break;
        case 'guessing':
          hint = "🎲 Your attempts seem random. Take a moment to work through the problem step by step on paper.";
          icon = "🎲";
          break;
        case 'random':
          hint = `💭 Your answer "${userInput}" doesn't match. Try breaking the problem into smaller steps.`;
          icon = "💭";
          break;
        case 'default':
        default:
          hint = `💡 "${userInput}" isn't quite right. Review the problem and check your work.`;
          icon = "💡";
          break;
      }
    }

    toast(hint, {
      icon,
      duration: 3500,
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
        padding: "16px",
        fontSize: "15px",
        maxWidth: "500px",
        textAlign: "center",
      },
    });
  }, [topicId, categoryId, questionId, expectedSteps]);

  const showSuccessMessage = useCallback((attemptCount: number) => {
    const messages = [
      "✅ Perfect! You got it!",
      "🎉 Excellent work!",
      "⭐ That's correct! Well done!",
      "💯 Nailed it!",
      "🏆 Great job! That's right!",
    ];
    if (attemptCount === 0) {
      toast.success("🌟 First try! Impressive!", {
        duration: 3500,
        style: { borderRadius: "10px", background: "#10b981", color: "#fff", fontSize: "15px" },
      });
      return;
    }
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast.success(randomMessage, { duration: 3500, style: { borderRadius: "10px", fontSize: "15px" } });
  }, []);

  const startStepTimer = useCallback((stepIndex: number) => {
    const now = Date.now();
    if (stepTimings.has(stepIndex) && stepTimings.get(stepIndex)?.isCompleted === false) return;
    const stepLabel = expectedSteps?.[stepIndex]?.label || `Step ${stepIndex + 1}`;
    const newTiming: StepTiming = { stepIndex, stepLabel, startTime: now, isCompleted: false };
    setStepTimings(prev => {
      const newMap = new Map(prev);
      newMap.set(stepIndex, newTiming);
      return newMap;
    });
    setCurrentStepStartTime(now);
  }, [expectedSteps, stepTimings]);

  useEffect(() => {
    if (topicId && categoryId && questionId) {
      setLines(['']);
      setFocusedIndex(null);
      setBehaviorProfile(null);
      setCurrentStepIndex(0);
      setUserProgressionArray([]);
      setUserAttempt([]);
      setAttemptCounter(0);
      setLineValidationStates(new Map());
      setValidationTriggers(new Map());
      setStepErrorFeedback(new Map());
      setStepTimings(new Map());
      setCurrentStepStartTime(null);
      setPendingLineCreation(null);
      setAttemptsSinceLastHint(0);
      setLastBehaviorClassification(null);
      setHintIntervalActive(false);
      setLastInputTime(0);
      setRapidInputCount(0);
      lastProcessedStep.current = null;
      onChange(['']);
      onAttemptUpdate?.([]);
    }
  }, [topicId, categoryId, questionId]);

  const completeStepTimer = useCallback((stepIndex: number) => {
    const now = Date.now();
    const existingTiming = stepTimings.get(stepIndex);
    if (!existingTiming || existingTiming.isCompleted) return 0;
    const duration = now - existingTiming.startTime;
    const completedTiming: StepTiming = { ...existingTiming, endTime: now, duration, isCompleted: true };
    setStepTimings(prev => {
      const newMap = new Map(prev);
      newMap.set(stepIndex, completedTiming);
      return newMap;
    });
    return duration;
  }, [stepTimings]);

  const lastProcessedStep = useRef<{ stepIndex: number, input: string, timestamp: number } | null>(null);

  const storeStepProgressionToAttempt = useCallback((stepProgression: StepProgression, stepIndex: number) => {
    const currentInput = stepProgression[1];
    const now = Date.now();
    const expectedAnswer = stepProgression[3];

    if (lastProcessedStep.current &&
      lastProcessedStep.current.stepIndex === stepIndex &&
      lastProcessedStep.current.input === currentInput &&
      (now - lastProcessedStep.current.timestamp) < 100) {
      return;
    }
    lastProcessedStep.current = { stepIndex, input: currentInput, timestamp: now };

    const stepTiming = stepTimings.get(stepIndex);
    const stepStartTime = stepTiming?.startTime || now;
    let timeSpentOnStep: number | undefined = undefined;

    if (stepProgression[2] === true) {
      timeSpentOnStep = completeStepTimer(stepIndex);
    }
    const sanitizedUserInput = InputValidator.sanitizeTextMathLive(currentInput);
    const sanitizedExpectedAnswer = InputValidator.sanitizeTextMathLive(expectedAnswer);

    const userTokens = tokenizeMathString(currentInput);
    const expectedTokens = tokenizeMathString(expectedAnswer);

    setAttemptCounter(prev => {
      const newId = prev + 1;

      const newUserAttempt: UserAttempt = {
        attempt_id: newId,
        stepIndex,
        stepLabel: stepProgression[0],
        userInput: sanitizedUserInput,
        sanitizedInput: sanitizedUserInput,
        tokens: userTokens,
        isCorrect: stepProgression[2],
        expectedAnswer: sanitizedExpectedAnswer,
        sanitizedExpectedAnswer: sanitizedExpectedAnswer,
        expectedTokens,
        cumulativeProgress: stepProgression[4],
        stepStartTime,
        attemptTime: now,
        timeSpentOnStep,
      };

      setUserAttempt(prevAttempts => {
        const newAttempts = [...prevAttempts, newUserAttempt];

        setAttemptsSinceLastHint(prevCount => {
          if (hintIntervalActive) return prevCount;
          const newCount = prevCount + 1;
          if (newCount >= 3) {
            setHintIntervalActive(true);
          }
          return newCount;
        });

        onAttemptUpdate?.(newAttempts);

        setTimeout(() => {
          analyzeBehaviorAndUpdateHints(newAttempts);
        }, 150);

        return newAttempts;
      });

      return newId;
    });
  }, [stepTimings, completeStepTimer, onAttemptUpdate, hintIntervalActive, analyzeBehaviorAndUpdateHints]);

  const validateIndividualLine = useCallback((lineIndex: number, trigger: 'enter') => {
    const line = lines[lineIndex];
    const expectedStep = expectedSteps[lineIndex];

    const userInputSanitized = InputValidator.sanitizeTextMathLive(line.trim());
    const expectedSanitized = InputValidator.sanitizeTextMathLive(expectedStep.answer);

    const validation = InputValidator.validateStepSimple(
      line.trim(),
      expectedStep.answer,
      expectedStep.label,
      lineIndex,
      expectedSteps
    );

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

    if (validation.isCorrect) {
      const attemptCount = attemptHistory.length;
      showSuccessMessage(attemptCount);
      setWrongAttemptCounter(0);
      setAttemptHistory([]);
      setShortHintCounter(0);
      setModalShown(false);
    } else {
      const sanitizedInput = line.trim();
      const correctAnswer = expectedStep.answer;

      setAttemptHistory(prev => [...prev, sanitizedInput]);

      setWrongAttemptCounter(prev => {
        const newCount = prev + 1;

        if (newCount === 3) {
          setShortHintCounter(prevHintCount => {
            const newHintCount = prevHintCount + 1;

            if (newHintCount === 4 && !modalShown) {
              setModalData({ userInput: sanitizedInput, correctAnswer });
              setIsModalOpen(true);
              setModalShown(true);
            } else {
              const currentHistory = [...attemptHistory, sanitizedInput];
              showHintMessage(sanitizedInput, correctAnswer, currentHistory, lineIndex);
            }
            return newHintCount;
          });

          return 0;
        }
        return newCount;
      });
    }

    const updatedValidationStates = new Map(lineValidationStates);
    updatedValidationStates.set(lineIndex, validation);
    const updatedValidationTriggers = new Map(validationTriggers);
    updatedValidationTriggers.set(lineIndex, trigger);

    const completionStatus = InputValidator.getCompletionStatus(
      lines,
      expectedSteps,
      updatedValidationStates,
      updatedValidationTriggers
    );

    setUserProgressionArray(prev => {
      const newArray = [...prev];
      while (newArray.length <= lineIndex) {
        newArray.push(['', '', false, '', 0]);
      }

      const stepWeight = 100 / expectedSteps.length;
      let individualStepProgress = 0;

      if (validation.isCorrect) {
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

      newArray[lineIndex] = [
        expectedStep.label,
        line.trim(),
        validation.isCorrect,
        expectedStep.answer,
        Math.round(individualStepProgress * 100) / 100
      ];

      let cumulativeProgress = 0;
      newArray.forEach((step, index) => {
        if (step[0]) {
          cumulativeProgress += step[4];
          newArray[index] = [
            step[0],
            step[1],
            step[2],
            step[3],
            Math.round(cumulativeProgress * 100) / 100
          ];
        }
      });

      storeStepProgressionToAttempt(newArray[lineIndex], lineIndex);

      if (onValidationResult) {
        if (completionStatus.allCorrect && completionStatus.isComplete) {
          onValidationResult('correct', lineIndex);
        } else if (validation.isCorrect) {
          onValidationResult('partial', lineIndex);
        } else {
          onValidationResult('incorrect', lineIndex);
        }
      }

      return newArray;
    });
  }, [lines, expectedSteps, storeStepProgressionToAttempt, lineValidationStates, validationTriggers, onValidationResult, attemptHistory, showSuccessMessage, showHintMessage, modalShown]);

  const isAnswerComplete = useCallback((currentLines: string[]): boolean => {
    if (!expectedSteps) return false;
    return InputValidator.isAnswerComplete(currentLines, expectedSteps);
  }, [expectedSteps]);

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

    const currentStepValidation = lineValidationStates.get(currentIndex);
    const isCurrentStepCorrect = currentStepValidation?.isCorrect === true;

    return hasContent && withinLimit && notLastAndEmpty && withinStepLimit && isCurrentStepCorrect;
  }, [lines, maxLines, expectedSteps, lineValidationStates]);

  const showStepRequiredFeedback = useCallback((index: number) => {
    setStepErrorFeedback(prev => {
      const newMap = new Map(prev);
      newMap.set(index, true);
      return newMap;
    });

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
      inputElement.style.borderColor = '#ef4444';
      setTimeout(() => {
        inputElement.style.animation = '';
        inputElement.style.borderColor = '';
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (pendingLineCreation !== null) {
      const currentStepValidation = lineValidationStates.get(pendingLineCreation);
      const isCurrentStepCorrect = currentStepValidation?.isCorrect === true;

      if (isCurrentStepCorrect) {
        const hasEmptyLineAfter = pendingLineCreation + 1 < lines.length && lines[pendingLineCreation + 1].trim() === '';
        if (hasEmptyLineAfter) {
          focusLine(pendingLineCreation + 1);
        } else if (canCreateNewLine(pendingLineCreation)) {
          const newLines = [...lines];
          newLines.splice(pendingLineCreation + 1, 0, '');
          setLines(newLines);
          onChange(newLines);
          setTimeout(() => {
            focusLine(pendingLineCreation + 1);
          }, 20);
        }
      } else {
        showStepRequiredFeedback(pendingLineCreation);
      }
      setPendingLineCreation(null);
    }
  }, [lineValidationStates, pendingLineCreation, lines, onChange, canCreateNewLine, showStepRequiredFeedback]);

  const handleLineChange = (index: number, newValue: string) => {
    const now = Date.now();
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

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!canSubmit()) return;

      if (lines[index].trim() && expectedSteps && index < expectedSteps.length) {
        startSubmissionCooldown();
        validateIndividualLine(index, 'enter');
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

  const handleMathFieldKeyDown = useCallback((index: number, event: any) => {
    const syntheticEvent = {
      key: event.key,
      shiftKey: event.shiftKey,
      preventDefault: () => event.preventDefault(),
    } as React.KeyboardEvent<HTMLInputElement>;
    handleKeyDown(index, syntheticEvent);
  }, [handleKeyDown]);

  const focusLine = (index: number) => {
    requestAnimationFrame(() => {
      const input = inputRefs.current[index];
      if (input) {
        input.focus();
        if (shouldUseMathMode(index) && input.tagName === 'MATH-FIELD') {
          try {
            input.executeCommand('moveToMathFieldEnd');
          } catch {}
        } else if (input instanceof HTMLInputElement) {
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
          if (retryInput) retryInput.focus();
        }, 100);
      }
    });
  };

  useEffect(() => {
    if (lines.length === 0) {
      const newLines = [''];
      setLines(newLines);
      onChange(newLines);
    }
  }, [lines, onChange, expectedSteps, maxLines]);

  const setInputRef = (index: number) => (el: HTMLInputElement | HTMLTextAreaElement | any | null) => {
    while (inputRefs.current.length <= index) {
      inputRefs.current.push(null as any);
    }

    if (inputRefs.current[index] && inputRefs.current[index]._cleanup) {
      inputRefs.current[index]._cleanup();
    }

    if (el) {
      inputRefs.current[index] = el;

      if (shouldUseMathMode(index) && el.tagName === 'MATH-FIELD') {
        el.virtualKeyboardMode = virtualKeyboardEnabled ? 'manual' : 'off';

        const inputHandler = (e: any) => {
          const mathField = e.target;
          const extractedValue = InputValidator.extractMathFieldValue(mathField);
          if (extractedValue.trim() && !stepTimings.has(index)) {
            startStepTimer(index);
          }
          handleLineChange(index, extractedValue);
        };

        const keydownHandler = (e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const currentValue = el.getValue?.() ?? el.value ?? "";

            const updatedLines = [...lines];
            updatedLines[index] = currentValue;
            setLines(updatedLines);
            onChange(updatedLines);

            setTimeout(() => {
              if (currentValue.trim() && !stepTimings.has(index)) {
                startStepTimer(index);
              }
              if (currentValue.trim() && expectedSteps && index < expectedSteps.length) {
                validateIndividualLine(index, 'enter');
                setPendingLineCreation(index);
                const isComplete = isAnswerComplete(updatedLines);
                if (isComplete) {
                  onSubmit?.(updatedLines);
                  return;
                }
              }
            }, 10);
            return false;
          }

          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Backspace') {
            const syntheticEvent = {
              key: e.key,
              shiftKey: e.shiftKey,
              preventDefault: () => e.preventDefault(),
            } as React.KeyboardEvent<HTMLInputElement>;
            handleMathFieldKeyDown(index, syntheticEvent);
          }
        };

        const focusHandler = () => {
          setFocusedIndex(index);
          if (virtualKeyboardEnabled && el.virtualKeyboard) {
            setTimeout(() => {
              el.virtualKeyboard.show();
            }, 100);
          }
        };

        const blurHandler = () => {
          setFocusedIndex(null);
        };

        el.addEventListener('input', inputHandler);
        el.addEventListener('keydown', keydownHandler);
        el.addEventListener('focus', focusHandler);
        el.addEventListener('blur', blurHandler);

        el.setAttribute('tabindex', '0');

        el._cleanup = () => {
          el.removeEventListener('input', inputHandler);
          el.removeEventListener('keydown', keydownHandler);
          el.removeEventListener('focus', focusHandler);
          el.removeEventListener('blur', blurHandler);
        };
      }
    } else {
      inputRefs.current[index] = null as any;
    }
  };

  const analyzeBehaviorAndUpdateHints = useCallback(async (attempts: UserAttempt[]) => {
    if (attempts.length === 0) return;

    const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);
    setBehaviorProfile(profile);

    const behaviorChanged = lastBehaviorClassification !== profile.currentBehavior;
    if (behaviorChanged) {
      if (profile.currentBehavior) {
        setAttemptsSinceLastHint(0);
        setHintIntervalActive(false);
      }
      setLastBehaviorClassification(profile.currentBehavior);
    }

    const currentStep = lines.findIndex((line, index) =>
      index < (expectedSteps?.length || 0) &&
      !lineValidationStates.get(index)?.isCorrect
    );

    setCurrentStepIndex(Math.max(0, currentStep));

    const behaviorsNeedingAI = ['struggling', 'guessing', 'repeating'];
    const shouldShowAIModalForBehavior = profile.currentBehavior &&
      behaviorsNeedingAI.includes(profile.currentBehavior);

    const shouldShowAIModalForInterval = hintIntervalActive;
    const shouldShowAIModal = shouldShowAIModalForBehavior || shouldShowAIModalForInterval;

    // (Hook for future AI modal logic)
    if (shouldShowAIModal) {
      // console.log('AI modal should show');
    }
  }, [lines, expectedSteps, lineValidationStates, lastBehaviorClassification, hintIntervalActive]);

  const status = getCompletionStatus(lines);

  useEffect(() => {
    return () => {
      inputRefs.current.forEach((el) => {
        if (el && el.tagName === 'MATH-FIELD' && el._eventHandlers) {
          const handlers = el._eventHandlers;
          el.removeEventListener('input', handlers.input);
          el.removeEventListener('keydown', handlers.keydown);
          el.removeEventListener('focus', handlers.focus);
          el.removeEventListener('blur', handlers.blur);
        }
      });
    };
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Feedback Modal */}
      {modalData && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          userInput={modalData.userInput}
          correctAnswer={modalData.correctAnswer}
        />
      )}

      <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
        {/* Container with fixed height when scrollable */}
        <div
          ref={containerRef}
          className={cn("relative", isScrollable ? "h-[200px]" : "min-h-[50px]")}
        >
          {/* Scrollable content */}
          <div
            ref={scrollableRef}
            className={cn(
              "divide-y",
              isScrollable ? "h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" : ""
            )}
            style={{ scrollBehavior: 'smooth' }}
          >
            {lines.map((line, index) => {
              const individualValidation = lineValidationStates.get(index);
              const validationTrigger = validationTriggers.get(index);

              return (
                <div key={index} className="relative group" style={{ minHeight: '50px' }}>
                  <div
                    className={cn(
                      "flex items-center transition-colors duration-200",
                      focusedIndex === index && "bg-blue-50",
                      (() => {
                        if (!line.trim() && index < status.totalSteps) {
                          return "border-l-4 border-l-gray-300";
                        }
                        if (line.trim() && individualValidation && validationTrigger) {
                          if (individualValidation.isCorrect === true) {
                            return "border-l-4 border-l-green-400 bg-green-50";
                          }
                          if (individualValidation.finalAnswerDetected === true) {
                            return "border-l-4 border-l-orange-400 bg-orange-50";
                          }
                          return "border-l-4 border-l-red-400 bg-red-50";
                        }
                        return "";
                      })()
                    )}
                  >
                    {/* Line number */}
                    <div className="w-8 flex-shrink-0 text-center text-xs text-gray-400 font-mono">
                      {index + 1}
                    </div>

                    {/* Input */}
                    {shouldUseMathMode(index) ? (
                      <div className="flex-1 flex items-center gap-2">
                        <math-field
                          ref={setInputRef(index)}
                          value={line}
                          placeholder={getStepPlaceholder(index)}
                          virtual-keyboard-mode={virtualKeyboardEnabled ? "manual" : "off"}
                          smart-fence={true}
                          smart-superscript={true}
                          smart-mode={true}
                          style={{
                            flex: 1,
                            border: "none",
                            background: "transparent",
                            padding: "12px",
                            color: "#1f2937",
                            fontSize: "2rem",
                            minHeight: "48px",
                            outline: "none",
                            cursor: "text",
                            userSelect: "text"
                          }}
                          className={cn(
                            "focus:ring-0 focus:outline-none transition-all duration-200",
                            "placeholder-gray-400 text-gray-900",
                            disabled && "bg-gray-50 text-gray-500",
                            checkCooldownStatus() && "opacity-60 cursor-not-allowed",
                            wrongAttemptCounter >= 3 && !disabled && "ring-2 ring-red-500 ring-opacity-50"
                          )}
                        />

                        {/* Submit for Math Field */}
                        {virtualKeyboardEnabled && line.trim() && (
                          <button
                            onClick={() => {
                              if (!canSubmit()) return;
                              const mathField = inputRefs.current[index];
                              if (mathField) {
                                const enterEvent = new KeyboardEvent('keydown', {
                                  key: 'Enter',
                                  code: 'Enter',
                                  keyCode: 13,
                                  which: 13,
                                  bubbles: true,
                                  cancelable: true
                                });
                                mathField.dispatchEvent(enterEvent);
                              }
                            }}
                            disabled={checkCooldownStatus()}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                              "flex items-center gap-1",
                              checkCooldownStatus()
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                                : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md"
                            )}
                            title={checkCooldownStatus() ? "Cooldown active (2s)" : "Submit this step"}
                          >
                            <span>✓</span>
                            <span className="hidden sm:inline">Submit</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        ref={setInputRef(index)}
                        type="text"
                        value={line}
                        onChange={(e) => handleLineChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={disabled}
                        placeholder={getStepPlaceholder(index)}
                        className={cn(
                          "flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none py-3 px-3",
                          "placeholder-gray-400 text-gray-900 transition-all duration-200",
                          disabled && "bg-gray-50 text-gray-500",
                          checkCooldownStatus() && "opacity-60 cursor-not-allowed",
                          wrongAttemptCounter >= 3 && !disabled && "ring-2 ring-red-500 ring-opacity-50"
                        )}
                      />
                    )}

                    {/* Line status */}
                    {expectedSteps && index < expectedSteps.length && (
                      <div className="w-6 flex-shrink-0 text-center text-sm">
                        {!line.trim() ? (
                          <span className="text-gray-300">○</span>
                        ) : individualValidation && validationTrigger ? (
                          individualValidation.isCorrect === true ? (
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

                    {stepErrorFeedback.get(index) && (
                      <div className="absolute -bottom-6 left-8 text-xs text-red-500 bg-red-50 px-2 py-1 rounded shadow-sm z-10">
                        Complete this step correctly first
                      </div>
                    )}
                  </div>

                  {/* Token Feedback Overlay */}
                  {individualValidation && validationTrigger && individualValidation.tokenFeedback && !individualValidation.isCorrect && (
                    <div className="px-8 pb-2">
                      <FeedbackOverlay
                        feedback={individualValidation.tokenFeedback}
                        show={true}
                        className="mt-1"
                        userInput={line}
                        expectedAnswer={expectedSteps[index]?.answer}
                        showHint={true}
                      />
                    </div>
                  )}
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 px-4 py-3 space-y-3">
            {/* Virtual Keyboard Toggle (Desktop Only) */}
            {/* Main Progress Section */}

            {/* Short Hints Component 
              <ShortHints 
                userAttempts={userAttempt}
                behaviorProfile={behaviorProfile}
                currentStepIndex={currentStepIndex}
                topicId={topicId}
                categoryId={categoryId}
                questionId={questionId}
                isVisible={localShowHints}
                hintText={hintText}
                onRequestHint={onRequestHint}
                onRequestAIHelp={() => setShowAIModal(true)}
                attemptsSinceLastHint={attemptsSinceLastHint}
                hintIntervalActive={hintIntervalActive}
                hintIntervalThreshold={3}
              />
            */}
          </div>
        )}

        {/* 🚫 COOLDOWN INDICATOR - Remove this after testing */}
        {checkCooldownStatus() && (
          <div className="fixed bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-lg text-sm font-medium z-50 flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Cooldown Active (2s)</span>
          </div>
        )}

        {/* 🎯 BEHAVIOR DEBUG PANEL */}
        {behaviorProfile && (
          <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50">
            <div className="font-bold text-yellow-400 mb-2">🎯 Behavior Detection Debug</div>
            <div className="mb-2">
              <span className="text-blue-300">Current Behavior:</span>
              <span className={`ml-2 font-bold ${
                behaviorProfile.currentBehavior === 'struggling' ? 'text-red-400' :
                behaviorProfile.currentBehavior === 'guessing' ? 'text-orange-400' :
                behaviorProfile.currentBehavior === 'repeating' ? 'text-yellow-400' :
                behaviorProfile.currentBehavior === 'self-correction' ? 'text-green-400' :
                'text-gray-400'
              }`}>
                {behaviorProfile.currentBehavior || 'None'}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-blue-300">Active Triggers:</span>
              <span className="ml-2 text-yellow-300">{behaviorProfile.activeTriggers.length}</span>
            </div>
            {behaviorProfile.activeTriggers.length > 0 && (
              <div className="mb-2 text-orange-300">
                {behaviorProfile.activeTriggers.map((trigger, i) => (
                  <div key={i} className="ml-2">
                    • {trigger.type} ({trigger.severity}) - Step {(trigger.stepIndex || 0) + 1}
                  </div>
                ))}
              </div>
            )}
            <div className="text-gray-300 text-xs">
              Accuracy: {(behaviorProfile.overallAccuracy * 100).toFixed(1)}% |
              Attempts: {behaviorProfile.totalAttempts} |
              Struggling Steps: {behaviorProfile.strugglingSteps.length}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export { type StepProgression, type UserAttempt };
