// Message types and data definitions for hinting; no React/UI code here.

export enum MessageType {
  DIRECTION = "direction",
  PREDEFINED = "predefined",
  AI = "ai",
}

export type HintMessage =
  | {
      type: MessageType.DIRECTION;
      // Required for direction messages: the current question/prompt
      question: string;
      // Optional extra instructions
      text?: string;
    }
  | {
      type: MessageType.PREDEFINED;
      // Predefined feedback status
      status: "correct" | "wrong";
      // Optional override text for predefined messages
      text?: string;
    }
  | {
      type: MessageType.AI;
      // AI-generated hint text
      text: string;
    };

export const predefinedMessages = {
  correct: "YOU GOT IT right 🎉",
  wrong: "Try again, you’ll get it this time 💪",
} as const;

// General UI messages used by components like HintBubble
export const generalMessages = {
  warning: "Click to check your answer.",
} as const;

// Consolidated messages object for generic consumption (includes placeholder for AI hints)
export const messages = {
  correct: predefinedMessages.correct,
  wrong: predefinedMessages.wrong,
  spam: "Stop spamming",
  aiHint: "In works for AI Generated Hints",
  aiHintFallback: "In works for AI Generated Hints",
} as const;

// Serverless API path
// - In production: same-origin a"/api/gemini-hint" on Vercel
// - In dev: prefer Vite proxy (same-origin). If proxy not active, fallback to localhost:3000
const API_PATH = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE
      ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/api/gemini-hint`
      : "/api/gemini-hint")
  : "/api/gemini-hint";

export async function getAIHint(userInput: string, stepContext?: string): Promise<string> {
  if (!userInput || !userInput.trim()) return messages.aiHintFallback;
  try {
    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput, stepContext }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { hint?: string };
    const hint = typeof data?.hint === "string" ? data.hint : "";
    return hint && hint.trim().length > 0 ? hint : messages.aiHintFallback;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getAIHint error:", err);
    return messages.aiHintFallback;
  }
}
