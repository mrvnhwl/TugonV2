import { useEffect, useRef, useState } from "react";
import { MessageType, type HintMessage, predefinedMessages, generalMessages, messages, getAIHint } from "../data/message";

type ValidationProps = {
  userInput: string;
  expectedAnswer: string;
  type?: string;
  stepIndex?: number;
  onRequestInputLock?: (ms: number) => void;
  spamSignal?: number; // when this value changes, show spam message in bubble
};

type Props =
  | { message: HintMessage; userInput?: never; expectedAnswer?: never; type?: never; stepIndex?: never }
  | ({ message?: never } & ValidationProps);

function HintBubbleMessage({ message }: { message: HintMessage }) {
  const getMessage = () => {
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
    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-2xl shadow-md transition-all duration-300">
      <p className="text-sm text-gray-800">{hintText}</p>
    </div>
  );
}

function HintBubbleValidation({ userInput, expectedAnswer, onRequestInputLock, spamSignal }: ValidationProps) {
  const [status, setStatus] = useState<"idle" | "correct" | "wrong" | "aiHint" | "spam">("idle");
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);
  const [hasShownMessage, setHasShownMessage] = useState(false); // Track if any message has been shown
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInputRef = useRef<string>("");
  const [inputDisabled, setInputDisabled] = useState(false);
  // Track which input value we have already shown an AI hint for, to avoid repeat triggers without edit
  const aiHintForValueRef = useRef<string | null>(null);

  const check = () => {
    // Strict string comparison
  // eslint-disable-next-line no-console
  console.log("[HintBubble] manual check() called", { userInput, expectedAnswer });
    const isCorrect = userInput === expectedAnswer;
    setStatus(isCorrect ? "correct" : "wrong");
    setHasShownMessage(true); // Mark that we've shown a message
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
      : generalMessages.warning;

  // React to spamSignal changes by showing spam message; do not override AI hint
  useEffect(() => {
    if (!spamSignal) return;
    if (status === "aiHint") return; // preserve AI hint priority
    // eslint-disable-next-line no-console
    console.debug("[HintBubble] spamSignal received — showing spam message", { spamSignal });
    setStatus("spam");
    setHasShownMessage(true);
  }, [spamSignal]);

  // Don't show anything on initial load or idle state unless a message has been triggered
  if (!hasShownMessage || status === "idle") {
    return (
      <div className="h-full min-h-[200px] p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            💡
          </div>
          <h3 className="font-medium text-gray-700">Tugon</h3>
        </div>
        <div className="text-sm text-gray-500">
          I'm here to help when you need a hint!
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[200px] p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          💡
        </div>
        <h3 className="font-medium text-gray-700">Tugon</h3>
      </div>
      
      {/* Hint message bubble */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-800">{textFromMessages}</p>
      </div>
      
      <button
        type="button"
        onClick={check}
        className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        disabled={inputDisabled}
      >
        Check Answer
      </button>
    </div>
  );
}

export default function HintBubble(props: Props) {
  if ("message" in props && props.message) {
    return <HintBubbleMessage message={props.message} />;
  }
  const { userInput = "", expectedAnswer = "", onRequestInputLock, spamSignal } = props as ValidationProps;
  return (
    <HintBubbleValidation
      userInput={userInput}
      expectedAnswer={expectedAnswer}
      onRequestInputLock={onRequestInputLock}
      spamSignal={spamSignal}
    />
  );
}
