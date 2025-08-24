import { useState } from "react";
import { MessageType, type HintMessage, predefinedMessages } from "../data/message";

type ValidationProps = {
  userInput: string;
  expectedAnswer: string;
  type: string;
  stepIndex?: number;
};

type Props =
  | { message: HintMessage; userInput?: never; expectedAnswer?: never; type?: never; stepIndex?: never }
  | ({ message?: never } & ValidationProps);

export default function HintBubble(props: Props) {
  // Backward-compatible message mode
  if ("message" in props && props.message) {
    const { message } = props;
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
    return (
      <div className="p-3 rounded-2xl bg-blue-100 shadow-md max-w-sm text-center">
        <p className="text-gray-800 font-medium">{getMessage()}</p>
      </div>
    );
  }

  // New manual validation mode
  const { userInput, expectedAnswer } = props as ValidationProps;
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const check = () => {
    // Strict string comparison
    setStatus(userInput === expectedAnswer ? "correct" : "wrong");
  };

  const base = "p-3 rounded-2xl shadow-md max-w-sm text-center";
  const color =
    status === "correct"
      ? "bg-green-100 text-green-800"
      : status === "wrong"
      ? "bg-red-100 text-red-800"
      : "bg-blue-100 text-gray-800";

  const textFromMessages =
    status === "correct"
      ? predefinedMessages.correct
      : status === "wrong"
      ? predefinedMessages.wrong
      : "Click to check your answer.";

  return (
    <div className={`${base} ${color}`} aria-live="polite">
      <p className="font-medium mb-2">{textFromMessages}</p>
      <button
        type="button"
        onClick={check}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm px-3 py-1.5 hover:bg-blue-700"
      >
        Check Answer
      </button>
    </div>
  );
}
