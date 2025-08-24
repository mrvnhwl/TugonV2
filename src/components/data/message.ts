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
