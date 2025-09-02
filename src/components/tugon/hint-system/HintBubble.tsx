import { useEffect, useRef, useState } from "react";
import { MessageType, type HintMessage, predefinedMessages, messages, getAIHint } from "../../data/message";
import { Text, Small } from "../../Typography";
import { cn } from "../../cn";

// Constants for hint management
const INITIAL_HINT_TEXT = "Need help getting started? Try breaking down the problem into smaller steps.";
const IDLE_SECONDARY_TEXT = "Still stuck? Consider reviewing the question again or try a different approach.";
const IDLE_TIMEOUT = 20000; // 20 seconds

type ValidationProps = {
  userInput: string;
  expectedAnswer: string;
  type?: string;
  stepIndex?: number;
  className?: string;
  onRequestInputLock?: (ms: number) => void;
  spamSignal?: number; // when this value changes, show spam message in bubble
  onMessageShown?: (message: string, type: "correct" | "wrong" | "aiHint" | "spam") => void; // callback when validation message is shown
  // New props for hint state management
  attempts?: number;
  isCorrect?: boolean | null;
  onAttemptsChange?: (attempts: number) => void;
  onCorrectnessChange?: (isCorrect: boolean) => void;
};

type Props =
  | { message: HintMessage | string; className?: string; userInput?: never; expectedAnswer?: never; type?: never; stepIndex?: never }
  | ({ message?: never; className?: string } & ValidationProps);

function HintBubbleMessage({ message, className = "" }: { message: HintMessage | string; className?: string }) {
  const getMessage = () => {
    // Handle simple string messages
    if (typeof message === 'string') {
      return message;
    }
    
    // Handle complex HintMessage objects
    switch (message.type) {
      case MessageType.DIRECTION:
        return message.text ? `${message.question} – ${message.text}` : message.question;
      case MessageType.PREDEFINED:
        return message.text || predefinedMessages[message.status];
      case MessageType.AI:
        return message.text;
      default:
        return "";
    }
  };
  
  const hintText = getMessage();
  if (!hintText) return null;
  
  return (
    <div className={cn("mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-2xl shadow-md transition-all duration-300", className)}>
      <Text className="text-gray-800">{hintText}</Text>
    </div>
  );
}

function HintBubbleValidation({ userInput, expectedAnswer, onRequestInputLock, spamSignal, onMessageShown, attempts = 0, isCorrect = null, onAttemptsChange, onCorrectnessChange }: ValidationProps) {
  const [status, setStatus] = useState<"idle" | "correct" | "wrong" | "aiHint" | "spam">("idle");
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);
  const [hasShownMessage, setHasShownMessage] = useState(false); // Track if any message has been shown
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInputRef = useRef<string>("");
  const [inputDisabled, setInputDisabled] = useState(false);
  // Track which input value we have already shown an AI hint for, to avoid repeat triggers without edit
  const aiHintForValueRef = useRef<string | null>(null);
  
  // Hint state management
  const [currentHint, setCurrentHint] = useState<string>(INITIAL_HINT_TEXT);
  const [internalAttempts, setInternalAttempts] = useState(attempts);
  const [internalIsCorrect, setInternalIsCorrect] = useState(isCorrect);
  
  // Idle timer management
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // Reset idle timer function
  const resetIdleTimer = () => {
    lastInteractionRef.current = Date.now();
    
    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Set new timer only if not already correct
    if (!internalIsCorrect) {
      idleTimerRef.current = setTimeout(() => {
        // Only show nudge if still not correct
        if (!internalIsCorrect) {
          // Show secondary message if already showing the primary nudge
          const nextHint = currentHint === INITIAL_HINT_TEXT ? IDLE_SECONDARY_TEXT : INITIAL_HINT_TEXT;
          setCurrentHint(nextHint);
          setHasShownMessage(true);
          
          if (onMessageShown) {
            onMessageShown(nextHint, "aiHint");
          }
        }
      }, IDLE_TIMEOUT);
    }
  };

  // Initialize idle timer and reset on user input
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [userInput, internalIsCorrect]);

  // Clear hint state when question changes (detected by expectedAnswer change)
  useEffect(() => {
    setCurrentHint(INITIAL_HINT_TEXT);
    setInternalAttempts(0);
    setInternalIsCorrect(null);
    setStatus("idle");
    setHasShownMessage(false);
    resetIdleTimer();
  }, [expectedAnswer]);

  const check = () => {
    // Strict string comparison
    // eslint-disable-next-line no-console
    console.log("[HintBubble] manual check() called", { userInput, expectedAnswer });
    const isCorrect = userInput === expectedAnswer;
    const newStatus = isCorrect ? "correct" : "wrong";
    
    // Update internal state
    const newAttempts = internalAttempts + 1;
    setInternalAttempts(newAttempts);
    setInternalIsCorrect(isCorrect);
    setStatus(newStatus);
    setHasShownMessage(true);
    
    // Update hint based on result
    if (isCorrect) {
      setCurrentHint("Great job! You got it right!");
    } else {
      setCurrentHint("Try reviewing your steps and check for calculation errors.");
    }
    
    // Notify parent about changes
    onAttemptsChange?.(newAttempts);
    onCorrectnessChange?.(isCorrect);
    
    // Notify parent about the message
    if (onMessageShown) {
      const message = isCorrect ? "Correct answer! Well done." : "Incorrect answer. Let's try again.";
      onMessageShown(message, newStatus);
    }
    
    // Reset idle timer after validation
    resetIdleTimer();
  };

  // Auto-check after 3s of inactivity, only once per typing session
  useEffect(() => {
    const trimmed = (userInput || "").trim();
  // eslint-disable-next-line no-console
  console.debug("[HintBubble] input changed:", { userInput, trimmed, prev: lastInputRef.current, status, hasWarned });

    // If input changed (user typed), reset hasWarned and (re)start timer
    const inputChanged = lastInputRef.current !== userInput;
    if (inputChanged) {
      setHasWarned(false);
      // If user typed after an AI hint, return to idle state
      if (status === "aiHint") setStatus("idle");
      // Allow AI hint to trigger again on new content
      aiHintForValueRef.current = null;
    }

    // Always clear any existing timer before setting a new one
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Do not auto-validate while AI hint is displayed
    if (status === "aiHint") {
      lastInputRef.current = userInput;
      // eslint-disable-next-line no-console
      console.debug("[HintBubble] AI hint active — suppressing auto-check");
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    // Only schedule if there's some input and we haven't auto-warned yet
  if (trimmed.length > 0 && hasWarned === false) {
      // eslint-disable-next-line no-console
      console.debug("[HintBubble] scheduling auto-check in 3s");
      timerRef.current = setTimeout(() => {
        // Re-check guard and perform validation once
        if (hasWarned === false) {
          // eslint-disable-next-line no-console
          console.debug("[HintBubble] auto-check firing now");
          check();
          setHasWarned(true);
        }
      }, 3000);
    }

    lastInputRef.current = userInput;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [userInput, hasWarned, expectedAnswer, status]);

  // Keyword-based AI hint trigger (clue|guide me|help), case-insensitive
  useEffect(() => {
    const text = (userInput || "").toLowerCase();
    // Detect: "clue", "help", or phrase "guide me" (case-insensitive), honoring word boundaries
    const hasKeyword = /(\b(?:clue|help)\b|\bguide\s*me\b)/i.test(text);
  // eslint-disable-next-line no-console
  console.debug("[HintBubble] keyword detection", { text, hasKeyword });
    if (!hasKeyword) return;
    // Prevent re-trigger for the same exact input value
    if (aiHintForValueRef.current === userInput) {
      // eslint-disable-next-line no-console
      console.debug("[HintBubble] AI hint already shown for this input value; skipping");
      return;
    }

    // Show AI hint with same styling as wrong (red), disable input briefly
  // eslint-disable-next-line no-console
  console.log("[HintBubble] AI hint triggered by keyword");
    setInputDisabled(true);
  setStatus("aiHint");
  setHasShownMessage(true);
  setIsLoadingHint(true);
    aiHintForValueRef.current = userInput;

    // Notify parent about AI hint trigger
    if (onMessageShown) {
      onMessageShown("AI hint triggered by keyword", "aiHint");
    }

    // Ask parent to lock input for 5 seconds
    try {
  onRequestInputLock?.(5000);
  // eslint-disable-next-line no-console
  console.log("[HintBubble] requested input lock for 5000ms");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[HintBubble] onRequestInputLock threw:", e);
    }
    // Async fetch hint
    let mounted = true;
    (async () => {
      try {
        // Show loading text while awaiting
        // eslint-disable-next-line no-console
        console.debug("[HintBubble] fetching AI hint...");
  const hint = await getAIHint(userInput, "Algebra step solving");
        if (!mounted) return;
        // replace bubble text via messages.aiHint pathway by temporarily overriding
        // We'll store the hint in a ref: but to minimize changes, we can directly render it by swapping status to aiHint and monkey-patching text below
        // Simpler: set a local state with dynamic text
  setAiText(hint || messages.aiHintFallback);
  } catch (e) {
        if (!mounted) return;
  setAiText(messages.aiHintFallback);
      } finally {
        if (mounted) {
          setInputDisabled(false);
          setIsLoadingHint(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [userInput]);

  const [aiText, setAiText] = useState<string | null>(null);
  const textFromMessages =
    status === "correct"
      ? predefinedMessages.correct
      : status === "wrong"  
      ? predefinedMessages.wrong
      : status === "aiHint"
      ? (isLoadingHint ? "Loading hint…" : (aiText || messages.aiHintFallback))
      : status === "spam"
      ? messages.spam
      : currentHint; // Use currentHint for idle state instead of warning

  // React to spamSignal changes by showing spam message; do not override AI hint
  useEffect(() => {
    if (!spamSignal) return;
    if (status === "aiHint") return; // preserve AI hint priority
    // eslint-disable-next-line no-console
    console.debug("[HintBubble] spamSignal received — showing spam message", { spamSignal });
    setStatus("spam");
    setHasShownMessage(true);
    
    // Notify parent about spam message
    if (onMessageShown) {
      onMessageShown("Spam detected", "spam");
    }
  }, [spamSignal, onMessageShown]);

  // Always show the hint bubble (remove the hasShownMessage check for idle state)
  const shouldShow = hasShownMessage || status === "idle" || currentHint === INITIAL_HINT_TEXT;
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-2xl shadow-md transition-all duration-300 w-full">
      <p className="text-sm text-gray-800 mb-2">{textFromMessages}</p>
      {internalAttempts > 0 && (
        <div className="text-xs text-gray-600 mb-2">
          Attempts: {internalAttempts} {internalIsCorrect !== null && (internalIsCorrect ? "✓ Correct" : "✗ Try again")}
        </div>
      )}
      <button
        type="button"
        onClick={check}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
        disabled={inputDisabled}
      >
        Check Answer
      </button>
    </div>
  );
}

export default function HintBubble(props: Props) {
  const { className = "" } = props;
  
  if ("message" in props && props.message) {
    return <HintBubbleMessage message={props.message} className={className} />;
  }
  const { userInput = "", expectedAnswer = "", onRequestInputLock, spamSignal, onMessageShown } = props as ValidationProps;
  return (
    <HintBubbleValidation
      userInput={userInput}
      expectedAnswer={expectedAnswer}
      onRequestInputLock={onRequestInputLock}
      spamSignal={spamSignal}
      onMessageShown={onMessageShown}
      className={className}
    />
  );
}
