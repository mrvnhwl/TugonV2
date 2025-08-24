// Message types and data definitions for hinting; no React/UI code here.
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  aiHint: "In works for AI Generated Hints",
  spam: "Stop spamming",
} as const;

// Gemini client setup for Vite (browser): expects VITE_GEMINI_API_KEY
let model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;
try {
  const apiKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (e) {
  console.warn("Gemini client not initialized:", e);
}

export async function getAIHint(userInput: string, stepContext?: string): Promise<string> {
  if (!userInput || !model) return messages.aiHint;
  try {
    const prompt = `
You are a helpful math tutor.
The student is solving a problem step-by-step.
Current input: "${userInput}"
Step context: "${stepContext || "General Math"}"
Give only a hint, not the solution.
Be encouraging but concise.
`;
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? result?.response?.text?.call?.(result?.response);
    return (typeof text === "string" && text.trim().length > 0) ? text : "Here’s a hint!";
  } catch (error) {
    console.error("AI Hint Error:", error);
    return messages.aiHint; // fallback
  }
}
