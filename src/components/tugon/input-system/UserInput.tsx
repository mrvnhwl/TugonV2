//UserInput

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
import { 
  createDebouncedColoringFunction,
  calculateSimilarity,
  getSimilarityFeedback,
  stripColorCommands
} from './mathColorComparison';
import { HintGeneratorService, BehaviorTemplates } from '../services/hintGenerator';
import { extractWrongTokensFromFeedback, formatWrongTokensForHint } from '../services/feedbackExtractor';
import { CuratedHintLoader } from '../services/curatedHintLoader';
import type { TokenFeedback } from './tokenUtils';

type StepProgression = [string, string, boolean, string, number];
// [stepLabel, userInput, isCorrect, expectedAnswer, totalProgress]

type UserAttempt = {
  attempt_id: number;              // incremental ID
  questionId: number;              // ✨ NEW: which question this belongs to
  stepIndex: number;               // which step/question
  stepLabel: string;
  userInput: string;
  sanitizedInput: string;
  tokens: string[];                // tokenized input from tokenizer
  isCorrect: boolean;              // validator result
  expectedAnswer: string;
  sanitizedExpectedAnswer: string;
  expectedTokens: string[];        // tokenized expected answer
  cumulativeProgress: number;
  stepStartTime: number;           // when step began
  attemptTime: number;             // timestamp (ms)
  timeSpentOnStep?: number;        // optional: total duration when step ends
  colorHintsShownCount?: number;   // ✨ NEW: cumulative color hints shown
  shortHintsShownCount?: number;   // ✨ NEW: cumulative toast hints shown
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
  //mathMode?: boolean; //mathlive
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
  hintText, //might be used later
  onAttemptUpdate,
  onValidationResult
}: UserInputProps) {
  const [lines, setLines] = useState<string[]>(value);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | any)[]>([]); //mathlive


  //add mathlive ref
  //const mfe = new MathfieldElement();
  // Add virtual keyboard control
  const [virtualKeyboardEnabled, setVirtualKeyboardEnabled] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsDesktop(!isMobile);
    setVirtualKeyboardEnabled(true);// Enable by default only on mobile
  }, []);
  // Add to your component state 
  const [behaviorProfile, setBehaviorProfile] = useState<UserBehaviorProfile | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // ✨ NEW: AI behavior templates state
  const [behaviorTemplates, setBehaviorTemplates] = useState<BehaviorTemplates | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);

  // User progression tracking array
  const [userProgressionArray, setUserProgressionArray] = useState<StepProgression[]>([]);
  const [userAttempt, setUserAttempt] = useState<UserAttempt[]>([]);
  const [attemptCounter, setAttemptCounter] = useState<number>(0);

  // Wrong attempt tracking for toast notifications
  const [wrongAttemptCounter, setWrongAttemptCounter] = useState<number>(0);
  const [attemptHistory, setAttemptHistory] = useState<string[]>([]);
  const lastToastTime = useRef<number>(0); // Debounce guard for duplicate toasts
  const activeToastIdRef = useRef<string | null>(null); // Track active toast for dismissal

  // Modal feedback system tracking
  const [shortHintCounter, setShortHintCounter] = useState<number>(0); // Track number of toasts shown
  const [modalShown, setModalShown] = useState<boolean>(false); // Track if modal has been shown
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Control modal visibility
  const [modalData, setModalData] = useState<{ userInput: string; correctAnswer: string } | null>(null);

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

  // Submission cooldown control (2s enforced cooldown)
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const SUBMISSION_COOLDOWN = 2000; // 2 seconds

  // Individual line validation state for immediate feedback
  const [lineValidationStates, setLineValidationStates] = useState<Map<number, SimpleValidationResult | null>>(new Map());
  const [validationTriggers, setValidationTriggers] = useState<Map<number, 'enter' | null>>(new Map());

  // State for error feedback and timing
  const [stepErrorFeedback, setStepErrorFeedback] = useState<Map<number, boolean>>(new Map());
  const [stepTimings, setStepTimings] = useState<Map<number, StepTiming>>(new Map());
  const [currentStepStartTime, setCurrentStepStartTime] = useState<number | null>(null);
  const [pendingLineCreation, setPendingLineCreation] = useState<number | null>(null);


  // NEW: Hint interval tracking
  const [attemptsSinceLastHint, setAttemptsSinceLastHint] = useState<number>(0);
  const [lastBehaviorClassification, setLastBehaviorClassification] = useState<BehaviorType | null>(null);
  const [hintIntervalActive, setHintIntervalActive] = useState<boolean>(false);

  // 🎨 NEW: Real-time color comparison state
  const [realtimeColoringEnabled, setRealtimeColoringEnabled] = useState<boolean>(true);
  const [colorComparisonMode, setColorComparisonMode] = useState<'character' | 'term'>('character'); // Use character mode for granular feedback
  const debouncedColoringRef = useRef(createDebouncedColoringFunction(1000)); // 1000ms = 1 second delay

  // ✨ NEW: Comprehensive tracking for SuccessModal statistics
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now()); // Per-question timer (resets)
  const [colorHintsShown, setColorHintsShown] = useState<number>(0); // Count FeedbackOverlay displays
  const [shortHintsShown, setShortHintsShown] = useState<number>(0); // Count toast.custom() calls
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(questionId || 0); // Track question changes
  
  // 🚫 NEW: Track last processed plain value to detect actual changes
  const lastPlainValueRef = useRef<Map<number, string>>(new Map());
  
  // ✨ NEW: Track previous validation states to detect when feedback is newly shown
  const previousValidationStatesRef = useRef<Map<number, boolean>>(new Map());
  
  // ⏱️ NEW: Timer refs for stripping colors after 3 seconds
  const colorStripTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // 🔊 NEW: Audio refs for sound effects
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    correctSoundRef.current = new Audio('/tugonsenseSounds/correctline.mp3');
    wrongSoundRef.current = new Audio('/tugonsenseSounds/wrong.mp3');
    typingSoundRef.current = new Audio('/tugonsenseSounds/typing.wav');
    
    // Set volume levels
    if (wrongSoundRef.current) {
      wrongSoundRef.current.volume = 0.3; // 30% volume (lower sound)
    }
    if (typingSoundRef.current) {
      typingSoundRef.current.volume = 0.4; // 40% volume for typing
    }
    
    // Preload audio for better performance
    correctSoundRef.current.load();
    wrongSoundRef.current.load();
    typingSoundRef.current.load();
    
    return () => {
      // Cleanup
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
        correctSoundRef.current = null;
      }
      if (wrongSoundRef.current) {
        wrongSoundRef.current.pause();
        wrongSoundRef.current = null;
      }
      if (typingSoundRef.current) {
        typingSoundRef.current.pause();
        typingSoundRef.current = null;
      }
    };
  }, []);

  // 🔊 Play correct sound
  const playCorrectSound = useCallback(() => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0; // Reset to start
      correctSoundRef.current.play().catch(err => {
        console.warn('Could not play correct sound:', err);
      });
    }
  }, []);

  // 🔊 Play wrong sound
  const playWrongSound = useCallback(() => {
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0; // Reset to start
      wrongSoundRef.current.play().catch(err => {
        console.warn('Could not play wrong sound:', err);
      });
    }
  }, []);

  // 🔊 Play typing sound
  const playTypingSound = useCallback(() => {
    if (typingSoundRef.current) {
      // Clone the audio to allow overlapping sounds when typing quickly
      const audio = typingSoundRef.current.cloneNode() as HTMLAudioElement;
      audio.volume = 0.4; // 40% volume
      audio.play().catch(err => {
        console.warn('Could not play typing sound:', err);
      });
    }
  }, []);

  // Sync with prop changes
  useEffect(() => {
    setLines(value);
  }, [value]);

  // ✨ Load context-aware behavior templates when context changes
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const hintService = new HintGeneratorService();
        
        console.log('🔄 Loading templates for context:', { topicId, categoryId, questionId });
        
        // Use context-aware template generation (stepLabel will be determined at hint time)
        const templates = await hintService.generateContextualTemplates(
          topicId,
          categoryId,
          questionId
        );
        
        setBehaviorTemplates(templates);
        console.log('✅ Context-aware behavior templates loaded:', templates);
        console.log('📊 Template count:', templates.templates.length);
        console.log('📝 Sample template:', templates.templates[0]?.templates[0]);
      } catch (error) {
        console.error('❌ Failed to load behavior templates:', error);
        // Templates will remain null, fallback to generic hints
      } finally {
        setTemplatesLoading(false);
      }
    };

    // Only load if we have context
    if (topicId && categoryId && questionId) {
      loadTemplates();
    }
  }, [topicId, categoryId, questionId]); // Reload when context changes

  // ✨ NEW: Reset tracking when question changes (session-based timer)
  useEffect(() => {
    if (questionId !== undefined && questionId !== currentQuestionId) {
      console.log(`🔄 Question changed from ${currentQuestionId} to ${questionId} - Resetting tracking`);
      
      // Reset all tracking counters for new question session
      setSessionStartTime(Date.now()); // Reset timer to now
      setColorHintsShown(0); // Reset color hint counter
      setShortHintsShown(0); // Reset toast hint counter
      setAttemptCounter(0); // Reset attempt counter
      previousValidationStatesRef.current.clear(); // Reset previous validation tracking
      setCurrentQuestionId(questionId); // Update tracked question ID
      
      console.log(`✅ Tracking reset complete for Question ${questionId}`);
    }
  }, [questionId, currentQuestionId]);

  // ✨ NEW: Track color hints when FeedbackOverlay displays (cumulative - counts EVERY display)
  useEffect(() => {
    // Track EACH TIME feedback is displayed (not just once per step)
    let newDisplaysCount = 0;
    
    console.log(`🔍 COLOR HINT TRACKING - Checking validation states:`, {
      validationStatesCount: lineValidationStates.size,
      triggersCount: validationTriggers.size,
      previousStatesCount: previousValidationStatesRef.current.size
    });
    
    lineValidationStates.forEach((validation, index) => {
      const trigger = validationTriggers.get(index);
      
      // Check if feedback should be shown:
      // 1. Has validation result
      // 2. Has trigger (user pressed Enter)
      // 3. Has token feedback array with items
      // 4. Answer is not correct
      const hasTokenFeedback = validation?.tokenFeedback && 
                               Array.isArray(validation.tokenFeedback) && 
                               validation.tokenFeedback.length > 0;
      const shouldShowFeedback = validation && 
                                 trigger && 
                                 hasTokenFeedback && 
                                 !validation.isCorrect;
      
      // Get previous state for this step
      const wasShowingFeedback = previousValidationStatesRef.current.get(index) || false;
      
      console.log(`🔍 Step ${index} check:`, {
        hasValidation: !!validation,
        hasTrigger: !!trigger,
        tokenFeedbackLength: validation?.tokenFeedback?.length || 0,
        hasTokenFeedback,
        isCorrect: validation?.isCorrect,
        shouldShowFeedback,
        wasShowingFeedback,
        transitionDetected: shouldShowFeedback && !wasShowingFeedback
      });
      
      if (shouldShowFeedback && !wasShowingFeedback) {
        // NEW feedback display detected (transition from not showing → showing)
        newDisplaysCount++;
        console.log(`🎨 TRACKING: Color hint displayed for step ${index} - New displays this render: ${newDisplaysCount}`);
        previousValidationStatesRef.current.set(index, true);
      } else if (!shouldShowFeedback && wasShowingFeedback) {
        // Feedback cleared (user corrected or changed input)
        console.log(`🔄 TRACKING: Color hint cleared for step ${index}`);
        previousValidationStatesRef.current.set(index, false);
      }
    });

    // Increment colorHintsShown by the number of NEW displays in this render
    if (newDisplaysCount > 0) {
      setColorHintsShown(prev => {
        const newTotal = prev + newDisplaysCount;
        console.log(`🎨 TRACKING: Color hints incremented by ${newDisplaysCount} - New total: ${newTotal}`);
        return newTotal;
      });
    } else {
      console.log(`⏭️ TRACKING: No new color hints to count this render`);
    }
  }, [lineValidationStates, validationTriggers]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // Clear all strip timers
      colorStripTimersRef.current.forEach(timer => clearTimeout(timer));
      colorStripTimersRef.current.clear();
    };
  }, []);




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

  // Cooldown management functions
  const checkCooldownStatus = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    return timeSinceLastSubmission < SUBMISSION_COOLDOWN;
  }, [lastSubmissionTime, SUBMISSION_COOLDOWN]);

  const startSubmissionCooldown = useCallback(() => {
    const now = Date.now();
    setLastSubmissionTime(now);
    setIsOnCooldown(true);

    console.log(`🚫 COOLDOWN ACTIVE: 2s submission cooldown started at ${now}`);

    // Clear cooldown after the timeout
    setTimeout(() => {
      setIsOnCooldown(false);
      console.log(`✅ COOLDOWN CLEARED: Submissions allowed again`);
    }, SUBMISSION_COOLDOWN);
  }, [SUBMISSION_COOLDOWN]);

  const canSubmit = useCallback((): boolean => {
    const onCooldown = checkCooldownStatus();
    if (onCooldown) {
      console.log(`⏳ SUBMISSION BLOCKED: Still on cooldown`);
      return false;
    }
    return true;
  }, [checkCooldownStatus]);

  // Adapter for math-field input events
  const shouldUseMathMode = useCallback((lineIndex: number): boolean => {
    if (!expectedSteps || lineIndex >= expectedSteps.length) {
      return false; // Default to text mode if no step info
    }

    const stepLabel = expectedSteps[lineIndex].label;

    // Math mode for mathematical operations
    const mathLabels = ["choose", "evaluation", "substitution", "simplification", "final", "math"];

    return mathLabels.includes(stepLabel); //mathlive

  }, [expectedSteps]);

  // Helper function to get placeholder text for each step
  const getStepPlaceholder = useCallback((lineIndex: number): string => {
    if (!expectedSteps || lineIndex >= expectedSteps.length) {
      return "Enter your expression here..."; // Generic fallback
    }

    const step = expectedSteps[lineIndex];
    return step.placeholder || "Enter your expression here..."; // Use step placeholder or fallback
  }, [expectedSteps]);

  // ✨ NEW: Fill hint template with runtime variables
  const fillHintTemplate = useCallback((
    template: string,
    behavior: string,
    wrongPart: string,
    stepLabel: string
  ): string => {
    return template
      .replace(/\{behavior\}/g, behavior)
      .replace(/\{wrongPart\}/g, wrongPart)
      .replace(/\{stepLabel\}/g, stepLabel);
  }, []);

  // Smart hint message system using AI-generated behavior templates with token-level feedback
  const showHintMessage = useCallback((
    userInput: string,
    correctAnswer: string,
    attemptHistory: string[],
    lineIndex: number
  ) => {
    // Debounce guard: prevent duplicate toasts within 500ms
    const now = Date.now();
    if (now - lastToastTime.current < 500) {
      console.log('Toast blocked: too soon after previous toast');
      return; // Exit early if toast was just shown
    }
    lastToastTime.current = now; // Update last toast time

    // Analyze user behavior
    const analysis = BehaviorAnalyzer.analyze(userInput, correctAnswer, attemptHistory);

    // Get stepLabel from expectedSteps
    const stepLabel = expectedSteps[lineIndex]?.label || 'this step';

    // ✨ NEW: Extract wrong tokens from current validation feedback
    const currentValidation = lineValidationStates.get(lineIndex);
    let wrongPart = 'that part';
    
    if (currentValidation?.tokenFeedback) {
      const extracted = extractWrongTokensFromFeedback(currentValidation.tokenFeedback);
      wrongPart = formatWrongTokensForHint(
        extracted.wrongTokens,
        extracted.misplacedTokens,
        extracted.extraTokens
      );
    }

    // Map behavior types to friendly descriptions
    const behaviorDescriptions: Record<string, string> = {
      'sign-error': 'confusing plus and minus signs',
      'repetition': 'repeating the same answer',
      'close-attempt': 'getting very close to the answer',
      'magnitude-error': 'off by a large amount',
      'guessing': 'trying random answers',
      'random': 'making general mistakes',
      'default': 'needing some guidance', 
      'self-correction': 'making progress with corrections'
    };

    const behaviorDescription = behaviorDescriptions[analysis.type] || behaviorDescriptions['default'];

    let hint = "";
    let icon = "💡";

    // ✨ NEW: Use AI-generated templates if available
    if (behaviorTemplates && behaviorTemplates.templates) {
      // Map analysis.type to template behaviorType (with fallback)
      const behaviorMap: Record<string, string> = {
        'sign-error': 'sign-error',
        'magnitude-error': 'magnitude-error',
        'close-attempt': 'close-attempt',
        'guessing': 'guessing',
        'repetition': 'repeating',
        'default': 'general',
        'random': 'general',
        'self-correction': 'self-correction'
      };
      
      const mappedBehavior = behaviorMap[analysis.type] || 'general';
      const templateObj = behaviorTemplates.templates.find(t => t.behaviorType === mappedBehavior);
      
      if (templateObj && templateObj.templates.length > 0) {
        // Randomly select one of the 3 template variations
        const selectedTemplate = templateObj.templates[Math.floor(Math.random() * templateObj.templates.length)];
        
        // Fill in the placeholders
        hint = fillHintTemplate(selectedTemplate, behaviorDescription, wrongPart, stepLabel);
        
        // Extract icon from hint (emojis at start)
        const iconMatch = hint.match(/^([\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?|[\u{2600}-\u{27BF}])/u);
        if (iconMatch) {
          icon = iconMatch[0];
        }
        
        console.log(`✨ Using AI template for behavior: ${mappedBehavior}`);
      }
    } 
    // Fallback to curated hints from hint registry
    else if (topicId && categoryId && questionId && stepLabel) {
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
        if (iconMatch) {
          icon = iconMatch[0];
        }
        console.log(`📚 Using curated hint for Topic ${topicId}, Category ${categoryId}, Question ${questionId}`);
      }
    }
    
    // Final fallback to hardcoded generic hints
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
      console.log(`🔧 Using hardcoded fallback hint`);
    }

    // Debug logging
    console.log(`🔔 TOAST TRIGGERED:`, {
      type: analysis.type,
      userInput,
      correctAnswer,
      wrongPart,
      stepLabel,
      behaviorDescription,
      hint,
      icon,
      usingAITemplate: !!behaviorTemplates,
      timestamp: new Date().toISOString()
    });

    // ✨ Enhanced hint display with emphasized wrongPart and stepLabel
    const renderEnhancedHint = (hintText: string) => {
      const cleanHint = hintText.replace(/^[\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?\s*/u, '');
      
      // Split hint and emphasize wrongPart and stepLabel
      const parts = cleanHint.split(/(".*?"|'.*?'|\b\w+\b)/g).filter(Boolean);
      
      return parts.map((part, index) => {
        // Emphasize quoted wrong parts (e.g., "+", "-", "42")
        if (part.match(/^["'].*["']$/)) {
          return (
            <span key={index} className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              {part}
            </span>
          );
        }
        
        // Emphasize step labels when followed by period or at end
        if (stepLabel && part.toLowerCase() === stepLabel.toLowerCase()) {
          return (
            <span key={index} className="font-semibold text-teal-700 underline decoration-teal-300 decoration-2">
              {part}
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      });
    };

    // ✨ Dismiss previous toast before showing new one
    if (activeToastIdRef.current) {
      toast.dismiss(activeToastIdRef.current);
      console.log(`🗑️ Dismissed previous toast: ${activeToastIdRef.current}`);
    }

    // ✨ NEW: Track context hint (toast.custom call)
    setShortHintsShown(prev => {
      const newCount = prev + 1;
      console.log(`📊 TRACKING: Context hint shown (toast.custom) - Count: ${newCount}`);
      return newCount;
    });

    // Display toast with curated message - Styled format with teal theme
    const toastId = toast.custom(
      (t) => (
        <div 
          className={`max-w-md w-full bg-white border-l-8 border-teal-500 shadow-xl rounded-xl p-5 mb-4 transition-all duration-300 ${
            t.visible ? 'animate-enter' : 'animate-leave'
          }`}
        >
          {/* Header with emoji badge and greeting */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-xl">
              {icon}
            </div>
            <span className="font-bold text-xl text-teal-600">Hey there,</span>
          </div>
          
          {/* Message body - indented with emphasized parts */}
          <div className="ml-12 text-gray-700 text-base leading-relaxed">
            {renderEnhancedHint(hint)}
          </div>
        </div>
      ),
      {
        duration: 3500,
        position: 'top-center',
      }
    );

    // Store the toast ID for future dismissal
    activeToastIdRef.current = toastId;
    console.log(`📌 Stored new toast ID: ${toastId}`);
  }, [topicId, categoryId, questionId, expectedSteps, behaviorTemplates, fillHintTemplate, lineValidationStates]);

  // Varied success messages for positive reinforcement
  const showSuccessMessage = useCallback((attemptCount: number) => {
    const messages = [
      "✅ Perfect! You got it!",
      "🎉 Excellent work!",
      "⭐ That's correct! Well done!",
      "💯 Nailed it!",
      "🏆 Great job! That's right!",
    ];

    // If they got it on first try
    if (attemptCount === 0) {
      toast.success("🌟 First try! Impressive!", {
        duration: 3500, // 3.5 seconds for consistency
        style: {
          borderRadius: "10px",
          background: "#10b981",
          color: "#fff",
          fontSize: "15px",
        },
      });
      return;
    }

    // Random success message for other cases
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast.success(randomMessage, {
      duration: 3500, // 3.5 seconds for consistency
      style: {
        borderRadius: "10px",
        fontSize: "15px",
      },
    });
  }, []);

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


  }, [expectedSteps, stepTimings]);
  useEffect(() => {
    // Reset UserInput state when question parameters change
    if (topicId && categoryId && questionId) {

      // Reset to initial state
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

      // Reset rapid input tracking
      setLastInputTime(0);
      setRapidInputCount(0);
      
      // ✨ Clear any active toast on question reset
      if (activeToastIdRef.current) {
        toast.dismiss(activeToastIdRef.current);
        activeToastIdRef.current = null;
        console.log(`🗑️ Dismissed toast on question reset`);
      }

      // Clear lastProcessedStep ref
      lastProcessedStep.current = null;

      // Notify parent of reset
      onChange(['']);
      onAttemptUpdate?.([]);

    }
  }, [topicId, categoryId, questionId]); // Dependencies
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


    return duration;
  }, [stepTimings]);



  const lastProcessedStep = useRef<{ stepIndex: number, input: string, timestamp: number } | null>(null);

  const storeStepProgressionToAttempt = useCallback((stepProgression: StepProgression, stepIndex: number) => {
    const currentInput = stepProgression[1];
    const now = Date.now();
    const expectedAnswer = stepProgression[3];
    // PREVENT DUPLICATE CALLS: Check if we just processed this exact step/input
    if (lastProcessedStep.current &&
      lastProcessedStep.current.stepIndex === stepIndex &&
      lastProcessedStep.current.input === currentInput &&
      (now - lastProcessedStep.current.timestamp) < 100) {
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
    const sanitizedUserInput = InputValidator.sanitizeTextMathLive(currentInput);
    const sanitizedExpectedAnswer = InputValidator.sanitizeTextMathLive(expectedAnswer);

    // Tokenize both user input and expected answer for behavior analysis
    const userTokens = tokenizeMathString(currentInput);
    const expectedTokens = tokenizeMathString(expectedAnswer);

    setAttemptCounter(prev => {
      const newId = prev + 1;

      const newUserAttempt: UserAttempt = {
        attempt_id: newId,
        questionId: questionId || 0,              // ✨ NEW: Track which question
        stepIndex,
        stepLabel: stepProgression[0],
        userInput: sanitizedUserInput,                    // Original user input
        sanitizedInput: sanitizedUserInput,              // Sanitized user input
        tokens: userTokens,                              // Tokenized input from tokenizer
        isCorrect: stepProgression[2],                   // Validator result
        expectedAnswer: sanitizedExpectedAnswer,          // Original expected answer
        sanitizedExpectedAnswer: sanitizedExpectedAnswer, // Sanitized expected answer
        expectedTokens: expectedTokens,                  // Tokenized expected answer
        cumulativeProgress: stepProgression[4],
        stepStartTime,           // When step timing started
        attemptTime: now,        // When this attempt was made (timestamp ms)
        timeSpentOnStep,         // Total time if step completed
        colorHintsShownCount: colorHintsShown,     // ✨ NEW: Cumulative color hints shown
        shortHintsShownCount: shortHintsShown,     // ✨ NEW: Cumulative toast hints shown
      };

      setUserAttempt(prevAttempts => {
        const newAttempts = [...prevAttempts, newUserAttempt];

        // FIXED: Only increment if we haven't triggered interval yet
        setAttemptsSinceLastHint(prevCount => {
          // Don't increment if interval is already active (prevents double counting)
          if (hintIntervalActive) {
            console.log(`📊 HINT INTERVAL: Already active, not incrementing count`);
            return prevCount;
          }

          const newCount = prevCount + 1;
          console.log(`📊 HINT INTERVAL TRACKING:`);
          console.log(`   Attempts since last hint: ${newCount}`);
          console.log(`   Hint interval threshold: 3`);

          // FIXED: Set hint interval active when threshold reached
          if (newCount >= 3) {
            console.log(`🎯 HINT INTERVAL REACHED - ${newCount} attempts made`);
            setHintIntervalActive(true);
            console.log(`🤖 Hint interval will trigger AI Modal`);
          }

          return newCount;
        });

        console.log('📝 NEW USER ATTEMPT STORED (WITH TIMING):');
        console.log(`   Attempt ID: ${newUserAttempt.attempt_id}`);
        console.log(`   Step: ${newUserAttempt.stepIndex + 1} (${newUserAttempt.stepLabel})`);
        console.log(`   Input: "${newUserAttempt.userInput}"`);
        console.log(`   Correct: ${newUserAttempt.isCorrect}`);
        console.log(`   Cumulative Progress: ${newUserAttempt.cumulativeProgress}%`);

        if (newUserAttempt.timeSpentOnStep) {
          console.log(`   ⏱️ Time Spent on Step: ${(newUserAttempt.timeSpentOnStep / 1000).toFixed(2)} seconds`);
        }

        console.log(`   Total Attempts: ${newAttempts.length}`);
        onAttemptUpdate?.(newAttempts);

        // ANALYZE BEHAVIOR AFTER EACH ATTEMPT
        setTimeout(() => {
          analyzeBehaviorAndUpdateHints(newAttempts);
        }, 150);

        return newAttempts;
      });

      return newId;
    });
  }, [stepTimings, completeStepTimer, onAttemptUpdate, hintIntervalActive]);

  // Function to validate individual line and update its state
  const validateIndividualLine = useCallback((lineIndex: number, trigger: 'enter') => {
    const line = lines[lineIndex];

    // ADD: Don't validate default/placeholder values
    if (line.trim() === '7' && !trigger) {
      console.log(`⏭️ Skipping validation for default value: "${line}"`);
      return;
    }
    const expectedStep = expectedSteps[lineIndex];
    // ✨ Use first answer for logging
    const referenceAnswer = Array.isArray(expectedStep.answer) ? expectedStep.answer[0] : expectedStep.answer;
    console.log(`🔍 Validating line ${lineIndex}: "${line.trim()}" vs expected "${referenceAnswer}"`);
    const userInputSanitized = InputValidator.sanitizeTextMathLive(line.trim());
    const expectedSanitized = InputValidator.sanitizeTextMathLive(referenceAnswer);
    console.log(`🔍 UserInput: Validating line ${lineIndex} (MathLive-aware):`, {
      userInput: line.trim(),
      userInputSanitized: userInputSanitized,
      expectedAnswer: referenceAnswer,
      expectedSanitized: expectedSanitized,
      stepLabel: expectedStep.label
    });
    const validation = InputValidator.validateStepSimple(
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

    // Handle wrong attempt counter and intelligent toast notifications
    if (validation.isCorrect) {
      // ✅ CORRECT ANSWER - Reset counters and show success message
      const attemptCount = attemptHistory.length;

      console.log(`✅ CORRECT ANSWER:`, {
        attemptCount,
        resettingCounter: true,
        clearingHistory: true
      });

      // 🔊 Play correct sound
      playCorrectSound();

      showSuccessMessage(attemptCount);
      setWrongAttemptCounter(0);
      setAttemptHistory([]); // Clear history on correct answer
      setShortHintCounter(0); // Reset toast counter
      setModalShown(false); // Reset modal shown flag for next question
      
      // ✨ Clear any active toast on correct answer
      if (activeToastIdRef.current) {
        toast.dismiss(activeToastIdRef.current);
        activeToastIdRef.current = null;
        console.log(`🗑️ Dismissed toast on correct answer`);
      }
    } else {
      // ❌ WRONG ANSWER - Track attempt and increment counter
      const sanitizedInput = line.trim();
      // ✨ Use first answer for feedback
      const correctAnswer = Array.isArray(expectedStep.answer) ? expectedStep.answer[0] : expectedStep.answer;

      // 🔊 Play wrong sound
      playWrongSound();

      // Update attempt history
      setAttemptHistory(prev => [...prev, sanitizedInput]);

      // Increment wrong attempt counter
      setWrongAttemptCounter(prev => {
        const newCount = prev + 1;

        console.log(`📊 WRONG ATTEMPT COUNTER:`, {
          previousCount: prev,
          newCount,
          shouldTriggerFeedback: newCount === 3,
          userInput: sanitizedInput,
          correctAnswer,
          attemptHistoryLength: attemptHistory.length,
          shortHintCounter,
          modalShown
        });

        // Show feedback on every 3rd wrong attempt
        if (newCount === 3) {
          console.log(`🎯 TRIGGERING FEEDBACK - 3rd attempt in cycle reached`);

          // Increment short hint counter
          setShortHintCounter(prevHintCount => {
            const newHintCount = prevHintCount + 1;
            console.log(`📈 Feedback cycle ${newHintCount} (Total wrong: ${(newHintCount * 3)})`);

            // ✨ MODIFIED: On 5th cycle (15th wrong attempt - AFTER 12th), show modal once
            if (newHintCount === 5 && !modalShown) {
              console.log(`🚨 TRIGGERING MODAL - 15th wrong attempt reached (AFTER 12th attempt)`);
              
              // ✨ Dismiss active toast before showing modal
              if (activeToastIdRef.current) {
                toast.dismiss(activeToastIdRef.current);
                activeToastIdRef.current = null;
                console.log(`🗑️ Dismissed active toast before opening modal`);
              }
              
              setModalData({
                userInput: sanitizedInput,
                correctAnswer: correctAnswer
              });
              setIsModalOpen(true);
              setModalShown(true); // Mark modal as shown for this question
              // DON'T show toast when modal is triggered
            } else {
              // Show toast hint (cycles 1, 2, 3, 4, and 6+)
              console.log(`💬 Showing toast for cycle ${newHintCount}`);
              const currentHistory = [...attemptHistory, sanitizedInput];
              showHintMessage(sanitizedInput, correctAnswer, currentHistory, lineIndex);
            }

            return newHintCount;
          });

          // Reset wrong attempt counter after each cycle
          return 0;
        }

        return newCount;
      });
    }

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

      if (validation.isCorrect) {
        individualStepProgress = stepWeight;
      } else if (line.trim().length > 0) {
        // ✨ Use first answer for length calculation
        const referenceAnswer = Array.isArray(expectedStep.answer) ? expectedStep.answer[0] : expectedStep.answer;
        const expectedLength = referenceAnswer.trim().length;
        const userLength = line.trim().length;
        const excessCharacters = userLength - expectedLength;

        if (excessCharacters <= 3 && expectedLength > 0 && userLength > 0) {
          const consolationPerChar = (stepWeight / expectedLength) / 2;
          const cappedUserLength = Math.min(userLength, expectedLength);
          individualStepProgress = cappedUserLength * consolationPerChar;
        }
      }

      // Update current step
      // ✨ Use first answer for record keeping
      const recordAnswer = Array.isArray(expectedStep.answer) ? expectedStep.answer[0] : expectedStep.answer;
      newArray[lineIndex] = [
        expectedStep.label,
        line.trim(),
        validation.isCorrect,
        recordAnswer,
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
      
      // Notify parent component (TugonPlay) about validation result
      if (onValidationResult) {
        if (completionStatus.allCorrect && completionStatus.isComplete) {
          console.log('🎉 All steps complete and correct - notifying parent');
          onValidationResult('correct', lineIndex);
        } else if (validation.isCorrect) {
          console.log('✅ Current step correct but more steps needed - notifying parent as partial');
          onValidationResult('partial', lineIndex);
        } else {
          console.log('❌ Current step incorrect - notifying parent');
          onValidationResult('incorrect', lineIndex);
        }
      }
      
      return newArray;
    });
  }, [lines, expectedSteps, storeStepProgressionToAttempt, lineValidationStates, validationTriggers, onValidationResult]);

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
    const isCurrentStepCorrect = currentStepValidation?.isCorrect === true;

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
      const isCurrentStepCorrect = currentStepValidation?.isCorrect === true;

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
    const oldValue = newLines[index];
    newLines[index] = newValue;
    setLines(newLines);
    onChange(newLines);

    // 🔊 Play typing sound when input changes (added or deleted)
    if (oldValue !== newValue) {
      playTypingSound();
    }

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
    
    // ✨ CRITICAL: Reset previous state to false when user starts typing
    // This allows the tracking to count the NEXT time feedback is shown
    previousValidationStatesRef.current.set(index, false);
    console.log(`🔄 User editing step ${index} - Reset tracking state to allow re-counting`);
  };

  // Handle key events
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      // 🚫 COOLDOWN CHECK: Block submission if still on cooldown
      if (!canSubmit()) {
        console.log('🚫 ENTER KEY BLOCKED: Submission cooldown active');
        return; // Exit early, ignore the Enter key press
      }

      // SET LOCAL SHOW HINTS TO TRUE WHEN ENTER IS PRESSED
      //setLocalShowHints(true);
      console.log('🔄 Setting localShowHints to TRUE');

      // Validate current line immediately on Enter
      if (lines[index].trim() && expectedSteps && index < expectedSteps.length) {
        // ✅ START COOLDOWN: Begin 2s cooldown period
        startSubmissionCooldown();

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


  // Adapter for math-field keyboard events  
  const handleMathFieldKeyDown = useCallback((index: number, event: any) => {

    // Create React-like event object
    const syntheticEvent = {
      key: event.key,
      shiftKey: event.shiftKey,
      preventDefault: () => event.preventDefault(),
    } as React.KeyboardEvent<HTMLInputElement>;

    handleKeyDown(index, syntheticEvent); // Your existing function works!
  }, [handleKeyDown]); //mathlive

  // Focus management with scroll
  const focusLine = (index: number) => {
    requestAnimationFrame(() => {
      const input = inputRefs.current[index];
      if (input) {
        input.focus();

        // Handle cursor positioning for both types
        if (shouldUseMathMode(index) && input.tagName === 'MATH-FIELD') {
          // For math-field, move cursor to end (MathLive specific)
          try {
            input.executeCommand('moveToMathFieldEnd');
          } catch (e) {
            // Fallback if command doesn't exist
            console.warn('MathLive command not available');
          }
        } else if (input instanceof HTMLInputElement) {
          input.setSelectionRange(input.value.length, input.value.length);
        } else if (input instanceof HTMLTextAreaElement) {
          input.setSelectionRange(input.value.length, input.value.length);
        }

        if (isScrollable) {
          scrollToFocusedInput(index);
        }
      } else {
        // Your existing retry logic stays the same
        setTimeout(() => {
          const retryInput = inputRefs.current[index];
          if (retryInput) {
            retryInput.focus();
            // ... same retry logic you already have
          }
        }, 100);
      }
    });
  }; //mathlive

  // Ensure we have at least one empty line
  useEffect(() => {
    if (lines.length === 0) {
      const newLines = [''];
      setLines(newLines);
      onChange(newLines);
    }
  }, [lines, onChange, expectedSteps, maxLines]);

  // Set up input refs, also triggers shortHints.
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
        console.log(`🔧 Setting up MathLive events for line ${index}`);

        // ✅ FIXED: Replace setOptions() with direct property assignment
        el.virtualKeyboardMode = virtualKeyboardEnabled ? 'manual' : 'off';
        
        // 🎹 NEW: Custom Virtual Keyboard Configuration
        // Simplified keyboard layout for functions - organized and grouped
        el.setOptions({
          virtualKeyboards: {
            'custom-functions': {
              label: 'Functions', // Keyboard label
              tooltip: 'Function Keyboard',
              layer: 'custom-functions-layer'
            }
          },
          customVirtualKeyboardLayers: {
            'custom-functions-layer': {
              styles: '',
              rows: [
                // Row 1: Numbers and basic grouping
                [
                  { class: 'keycap', label: '7', insert: '7' },
                  { class: 'keycap', label: '8', insert: '8' },
                  { class: 'keycap', label: '9', insert: '9' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: '(', insert: '(' },
                  { class: 'keycap', label: ')', insert: ')' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: '+', insert: '+' },
                  { class: 'keycap', label: '−', insert: '-' },
                  { class: 'separator w5' },
                  { class: 'action', label: '<svg><use xlink:href="#svg-delete-backward" /></svg>', command: ['performWithFeedback', 'deleteBackward'] }
                ],
                // Row 2: More numbers
                [
                  { class: 'keycap', label: '4', insert: '4' },
                  { class: 'keycap', label: '5', insert: '5' },
                  { class: 'keycap', label: '6', insert: '6' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: '.', insert: '.' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: '×', insert: '\\times' },
                  { class: 'keycap', label: '÷', insert: '\\div' },
                  { class: 'separator w5' },
                  { class: 'action', label: 'Clear', command: ['performWithFeedback', 'deleteAll'] }
                ],
                // Row 3: Final numbers and power
                [
                  { class: 'keycap', label: '1', insert: '1' },
                  { class: 'keycap', label: '2', insert: '2' },
                  { class: 'keycap', label: '3', insert: '3' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: '0', insert: '0' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: 'x²', insert: '^{2}' },
                  { class: 'keycap', label: 'xⁿ', insert: '^{#?}' },
                  { class: 'keycap', label: '=', insert: '=' }
                ],
                // Row 4: Variables
                [
                  { class: 'keycap', label: 'x', insert: 'x' },
                  { class: 'keycap', label: 'y', insert: 'y' },
                  { class: 'keycap', label: 'a', insert: 'a' },
                  { class: 'keycap', label: 'b', insert: 'b' },
                  { class: 'keycap', label: 'c', insert: 'c' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: 'f(x)', insert: 'f(#?)' },
                  { class: 'keycap', label: 'g(x)', insert: 'g(#?)' }
                ],
                // Row 5: Functions
                [
                  { class: 'keycap', label: 'sin', insert: '\\sin(#?)' },
                  { class: 'keycap', label: 'cos', insert: '\\cos(#?)' },
                  { class: 'keycap', label: 'tan', insert: '\\tan(#?)' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: 'log', insert: '\\log(#?)' },
                  { class: 'keycap', label: 'ln', insert: '\\ln(#?)' },
                  { class: 'separator w5' },
                  { class: 'keycap', label: '√', insert: '\\sqrt{#?}' },
                  { class: 'keycap', label: 'ⁿ√', insert: '\\sqrt[#?]{#?}' }
                ]
              ]
            }
          },
          virtualKeyboardLayout: 'custom-functions'
        });

        // ✅ FIXED: Use addEventListener for input events instead of onInput option

        // ⏱️ Helper: Strip colors from mathfield after delay
        const stripColorsAfterDelay = (mathField: any, index: number, delayMs: number = 3000) => {
          // Clear any existing timer for this field
          const existingTimer = colorStripTimersRef.current.get(index);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }
          
          // Set new timer to strip colors
          const timer = setTimeout(() => {
            const rawValue = mathField.getValue?.() || mathField.value || "";
            if (rawValue.includes('\\textcolor')) {
              console.log(`🧹 Stripping colors from field ${index} after ${delayMs}ms`);
              const cleanLatex = stripColorCommands(rawValue);
              const position = mathField.position;
              mathField.setValue(cleanLatex);
              try {
                mathField.position = position;
              } catch (e) {
                console.debug('Could not restore cursor position');
              }
            }
            colorStripTimersRef.current.delete(index);
          }, delayMs);
          
          colorStripTimersRef.current.set(index, timer);
        };

        const inputHandler = (e: any) => {
          const mathField = e.target;
          console.log(`✅ Input handler fired at index ${index}`);
          
          // Get raw value for debugging
          const rawValue = mathField.getValue?.() || mathField.value || "";
          
          // ✅ EXTRACT PLAIN VALUE FIRST - Strip any existing colors before extraction
          // This ensures we always get clean input for validation
          const plainValue = InputValidator.extractMathFieldValue(mathField);
          
          // 🚫 Check if plain value actually changed (prevent processing setValue events)
          const lastValue = lastPlainValueRef.current.get(index) || '';
          if (plainValue === lastValue && rawValue.includes('\\textcolor')) {
            console.log(`🚫 Skipping - same plain value "${plainValue}", likely setValue event`);
            return;
          }
          
          // Update last processed value
          lastPlainValueRef.current.set(index, plainValue);

          console.log(`🧮 MathField input at index ${index}:`, {
            rawLatex: rawValue.substring(0, 100),
            plainValue: plainValue,
            changed: plainValue !== lastValue
          });

          // 🎨 Apply real-time color comparison if enabled
          // The coloring function now handles stripping old colors and re-applying fresh colors
          if (realtimeColoringEnabled && expectedSteps && index < expectedSteps.length) {
            const expectedAnswer = expectedSteps[index].answer;
            if (expectedAnswer && plainValue.trim()) {
              console.log(`🎨 Applying real-time coloring for step ${index}`);
              
              // ✅ Clear any pending strip timer (user is typing)
              const existingTimer = colorStripTimersRef.current.get(index);
              if (existingTimer) {
                clearTimeout(existingTimer);
                console.log(`🚫 Cleared strip timer for field ${index} - user is typing`);
              }
              
              // ✅ Pass the plain value directly instead of re-extracting
              debouncedColoringRef.current(mathField, expectedAnswer, colorComparisonMode, plainValue);
              
              // ⏱️ Schedule color stripping after 3 seconds (1000ms debounce + 3000ms display)
              stripColorsAfterDelay(mathField, index, 3000);
              
              // Optional: Calculate and log similarity
              const similarity = calculateSimilarity(expectedAnswer, plainValue);
              console.log(`📊 Similarity: ${similarity.toFixed(1)}% - ${getSimilarityFeedback(similarity)}`);
            }
          }

          // Start step timer if needed
          if (plainValue.trim() && !stepTimings.has(index)) {
            startStepTimer(index);
          }

          // ✅ Use the PLAIN VALUE (not colored) for validation and line change
          handleLineChange(index, plainValue);
        };

        // ✅ FIXED: Enhanced keydown handler with proper timing
        const keydownHandler = (e: KeyboardEvent) => {


          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            // ✅ CRITICAL: Get the CURRENT value from MathLive
            const currentValue = el.getValue();


            // ✅ CRITICAL: Update lines state BEFORE validation
            const updatedLines = [...lines];
            updatedLines[index] = currentValue;

            // Update state synchronously
            setLines(updatedLines);
            onChange(updatedLines);

            // ✅ CRITICAL: Use setTimeout to ensure state update completes
            setTimeout(() => {

              // Start step timer if needed
              if (currentValue.trim() && !stepTimings.has(index)) {
                startStepTimer(index);
              }

              // Set local hints to true
              // remove this for now, restore when needed the ShortHints setLocalShowHints(true);

              // Validate with the updated content
              if (currentValue.trim() && expectedSteps && index < expectedSteps.length) {
                console.log(`🎯 Triggering validation for line ${index}`);
                validateIndividualLine(index, 'enter');
                setPendingLineCreation(index);

                // Check if answer is complete
                const isComplete = isAnswerComplete(updatedLines);
                if (isComplete) {
                  onSubmit?.(updatedLines);
                  return;
                }
              }
            }, 10); // Small delay to ensure state updates

            return false;
          }

          // Handle other navigation keys
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Backspace') {
            const syntheticEvent = {
              key: e.key,
              shiftKey: e.shiftKey,
              preventDefault: () => e.preventDefault(),
            } as React.KeyboardEvent<HTMLInputElement>;

            handleMathFieldKeyDown(index, syntheticEvent);
          }
        };

        // Other event handlers remain the same
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

        // ✅ FIXED: Add all event listeners including the new input handler
        el.addEventListener('input', inputHandler);
        el.addEventListener('keydown', keydownHandler);
        el.addEventListener('focus', focusHandler);
        el.addEventListener('blur', blurHandler);

        el.setAttribute('tabindex', '0');

        // ✅ FIXED: Update cleanup to include input handler
        el._cleanup = () => {

          el.removeEventListener('input', inputHandler);
          el.removeEventListener('keydown', keydownHandler);
          el.removeEventListener('focus', focusHandler);
          el.removeEventListener('blur', blurHandler);
        };

        console.log(`✅ MathLive setup complete for line ${index}`);
      }
    } else {
      inputRefs.current[index] = null as any;
    }
  };
  //mathlive

  //remove handleAIHintRequest from deps



  //check async later for any problem
  const analyzeBehaviorAndUpdateHints = useCallback(async (attempts: UserAttempt[]) => {
    if (attempts.length === 0) return;

    console.log('🔍 ANALYZING BEHAVIOR - Input attempts:', attempts.length);

    // Analyze behavior using the classifier
    const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);
    setBehaviorProfile(profile);

    // 🎯 DETAILED BEHAVIOR DETECTION LOGGING
    console.log('🎯 BEHAVIOR ANALYSIS RESULTS:', {
      currentBehavior: profile.currentBehavior,
      activeTriggers: profile.activeTriggers.length,
      triggerDetails: profile.activeTriggers.map(t => ({
        type: t.type,
        severity: t.severity,
        description: t.description,
        evidence: t.evidence,
        stepIndex: t.stepIndex
      })),
      stepBehaviors: Object.entries(profile.stepBehaviors).map(([step, behavior]) => ({
        step: parseInt(step),
        primaryBehavior: behavior.primaryBehavior,
        wrongAttempts: behavior.wrongAttempts,
        totalTime: behavior.totalTime,
        behaviorScores: behavior.behaviorScores
      })),
      overallStats: {
        accuracy: profile.overallAccuracy,
        avgTime: profile.averageTimePerAttempt,
        strugglingSteps: profile.strugglingSteps,
        guessingPatterns: profile.guessingPatterns
      }
    });

    // Check if behavior has changed (new classification)
    const behaviorChanged = lastBehaviorClassification !== profile.currentBehavior;
    if (behaviorChanged) {
      console.log(`🔄 BEHAVIOR CLASSIFICATION CHANGED: ${lastBehaviorClassification} → ${profile.currentBehavior}`);


      // FIXED: Reset attempt count for ANY behavior change (not just problematic ones)
      if (profile.currentBehavior) {
        setAttemptsSinceLastHint(0);
        setHintIntervalActive(false);
        console.log(`🔄 HINT INTERVAL RESET due to behavior classification: ${profile.currentBehavior}`);
      }
      setLastBehaviorClassification(profile.currentBehavior);
    }

    // Get current step index
    const currentStep = lines.findIndex((line, index) =>
      index < (expectedSteps?.length || 0) &&
      !lineValidationStates.get(index)?.isCorrect
    );

    setCurrentStepIndex(Math.max(0, currentStep));

    // FIXED: Check for both behavior triggers AND hint interval
    const behaviorsNeedingAI = ['struggling', 'guessing', 'repeating'];
    const shouldShowAIModalForBehavior = profile.currentBehavior &&
      behaviorsNeedingAI.includes(profile.currentBehavior);

    const shouldShowAIModalForInterval = hintIntervalActive;

    // Show AI modal if EITHER condition is true
    const shouldShowAIModal = shouldShowAIModalForBehavior || shouldShowAIModalForInterval;
    console.log('🧠 BEHAVIOR ANALYSIS UPDATED:', {
      currentBehavior: profile.currentBehavior,
      currentStep,
      activeTriggers: profile.activeTriggers.length,
      showHints,
      profileSet: !!profile,
      shouldShowAIModal,
      behaviorChanged,
      attemptsSinceLastHint,
      hintIntervalActive
    });


  }, [lines, expectedSteps, lineValidationStates, showHints, topicId, categoryId, questionId, lastBehaviorClassification, hintIntervalActive]);

  const status = getCompletionStatus(lines);

  useEffect(() => {
    return () => {
      // Cleanup all MathLive event listeners on unmount
      inputRefs.current.forEach((el, index) => {
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

  // Modal close handler - reactivate short hints after modal closes
  const handleModalClose = () => {
    console.log('📕 Modal closed - short hints resume');
    setIsModalOpen(false);
    
    // ✨ Clear toast ID reference when modal closes
    if (activeToastIdRef.current) {
      activeToastIdRef.current = null;
      console.log(`🗑️ Cleared toast reference on modal close`);
    }
    
    // Note: modalShown stays true, so modal won't appear again
    // But short hints can continue appearing after modal is closed
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
          className={cn(
            "relative",
            isScrollable ? "h-[250px]" : "min-h-[80px]" // 📏 Increased from 200px to 300px and min from 50px to 80px
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
                <div key={index} className="relative group" style={{ minHeight: '70px' }}> {/* 📏 Increased from 50px to 70px */}
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
                        if (individualValidation.isCorrect === true) {
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
                    {shouldUseMathMode(index) ? (
                      <div className="flex-1 flex items-stretch gap-2">
                        {/* Math Field Container - grows to fill space */}
                        <div className="flex-1 min-w-0">
                          <math-field
                            ref={setInputRef(index)}
                            value={line}
                            placeholder={getStepPlaceholder(index)}
                            virtual-keyboard-mode={virtualKeyboardEnabled ? "manual" : "off"}
                            smart-fence={true}
                            smart-superscript={true}
                            smart-mode={true}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              padding: "12px", // 📏 Increased from 8px to 12px
                              color: "#1f2937",
                              fontSize: "2rem", // 📏 Increased from 1.75rem to 2rem
                              minHeight: "60px", // 📏 Increased from 48px to 60px
                              outline: "none",
                              cursor: "text",
                              userSelect: "text"
                            }}
                            className={cn(
                              "focus:ring-0 focus:outline-none transition-all duration-200",
                              "placeholder-gray-400 text-gray-900",
                              "text-lg sm:text-3xl", // � Increased from text-base sm:text-2xl to text-lg sm:text-3xl
                              disabled && "bg-gray-50 text-gray-500",
                              checkCooldownStatus() && "opacity-60 cursor-not-allowed",
                              wrongAttemptCounter >= 3 && !disabled && "ring-2 ring-red-500 ring-opacity-50"
                            )}
                          />
                        </div>

                        {/* Submit Button - Fixed position at right edge */}
                        {virtualKeyboardEnabled && line.trim() && (
                          <button
                            onClick={() => {
                              // 🚫 COOLDOWN CHECK: Block button click if on cooldown
                              if (!canSubmit()) {
                                console.log('🚫 SUBMIT BUTTON BLOCKED: Cooldown active');
                                return;
                              }

                              // ✅ SIMPLE: Just simulate Enter key press on the math field
                              const mathField = inputRefs.current[index];
                              if (mathField) {
                                // Create and dispatch a keyboard event
                                const enterEvent = new KeyboardEvent('keydown', {
                                  key: 'Enter',
                                  code: 'Enter',
                                  keyCode: 13,
                                  which: 13,
                                  bubbles: true,
                                  cancelable: true
                                });

                                // Dispatch the event to trigger your existing Enter handler
                                mathField.dispatchEvent(enterEvent);
                              }
                            }}
                            disabled={checkCooldownStatus()}
                            className={cn(
                              "flex-shrink-0 self-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200",
                              "flex items-center justify-center gap-1",
                              "min-w-[44px] w-[60px] sm:w-auto", // 📱 Fixed width on mobile for consistent positioning
                              checkCooldownStatus()
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                                : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md"
                            )}
                            title={checkCooldownStatus() ? "Cooldown active (2s)" : "Submit this step"}
                          >
                            <span className="text-sm sm:text-base">✓</span>
                            <span className="hidden sm:inline">Submit</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      // Text mode - your existing input (keep exactly as is)
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
                          "flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none py-4 px-4", // 📏 Increased padding from py-3 px-3 to py-4 px-4
                          "placeholder-gray-400 text-gray-900 transition-all duration-200",
                          "text-lg sm:text-2xl", // 📏 Added larger font size
                          disabled && "bg-gray-50 text-gray-500",
                          checkCooldownStatus() && "opacity-60 cursor-not-allowed",
                          wrongAttemptCounter >= 3 && !disabled && "ring-2 ring-red-500 ring-opacity-50"
                        )}
                      />
                    )} {/*mathlive*/}

                    {/* Individual line status indicator */}
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

                    {/* Error message for feedback */}
                    {stepErrorFeedback.get(index) && (
                      <div className="absolute -bottom-6 left-8 text-xs text-red-500 bg-red-50 px-2 py-1 rounded shadow-sm z-10">
                        Complete this step correctly first
                      </div>
                    )}
                  </div>

                  {/* Token Feedback Overlay - Show only when answer is wrong */}
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
            // FIXED: Add these missing props
            attemptsSinceLastHint={attemptsSinceLastHint}
            hintIntervalActive={hintIntervalActive}
            hintIntervalThreshold={3}
          />*/}




          </div>
        )}

        {/* 🚫 COOLDOWN INDICATOR - Remove this after testing */}
        {checkCooldownStatus() && (
          <div className="fixed bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-lg text-sm font-medium z-50 flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Cooldown Active (2s)</span>
          </div>
        )}

        {/* 🎯 BEHAVIOR DEBUG PANEL - Remove this after testing 
        {behaviorProfile && (
          <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50">
            <div className="font-bold text-yellow-400 mb-2">🎯 Behavior Detection Debug</div>

            <div className="mb-2">
              <span className="text-blue-300">Current Behavior:</span>
              <span className={`ml-2 font-bold ${behaviorProfile.currentBehavior === 'struggling' ? 'text-red-400' :
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
        )}*/}
      </div>
    </>
  );

}


export { type StepProgression, type UserAttempt };