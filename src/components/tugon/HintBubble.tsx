import { MessageType, type HintMessage, predefinedMessages } from "../data/message";

export default function HintBubble({ message }: { message: HintMessage }) {
  const getMessage = () => {
    switch (message.type) {
      case MessageType.DIRECTION:
        return message.text
          ? `${message.question} – ${message.text}`
          : message.question;

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
