import "https://esm.run/mathlive";
import { useState } from "react";

interface MathInputsProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  focused?: boolean;
  error?: boolean;
  status?: "correct" | "incorrect" | "final" | "pending";
  lineNumber?: number;
}

export default function MathInputs({
  value = "",
  onChange,
  disabled = false,
  placeholder = "",
  focused = false,
  error = false,
  status = "pending",
  lineNumber = 1,
}: MathInputsProps) {
  const [internalValue, setInternalValue] = useState<string>(value);

  const handleInput = (evt: any) => {
    const mathValue = (evt.target as any).value ?? "";
    setInternalValue(mathValue);
    onChange?.(mathValue);
  };

  // Status indicator
  let statusIndicator = <span className="text-gray-300">○</span>;
  if (internalValue.trim()) {
    if (status === "correct") {
      statusIndicator = <span className="text-green-500" title="Correct">✅</span>;
    } else if (status === "final") {
      statusIndicator = <span className="text-orange-500" title="Final answer in wrong position">⚠️</span>;
    } else if (status === "incorrect") {
      statusIndicator = <span className="text-red-500" title="Incorrect">❌</span>;
    } else {
      statusIndicator = <span className="text-gray-300" title="Not yet validated">⏳</span>;
    }
  }

  // Border color logic
  let borderClass = "border-l-4 border-l-gray-300";
  let bgClass = "";
  if (internalValue.trim()) {
    if (status === "correct") {
      borderClass = "border-l-4 border-l-green-400";
      bgClass = "bg-green-50";
    } else if (status === "final") {
      borderClass = "border-l-4 border-l-orange-400";
      bgClass = "bg-orange-50";
    } else if (status === "incorrect") {
      borderClass = "border-l-4 border-l-red-400";
      bgClass = "bg-red-50";
    }
  }
  if (focused) {
    bgClass = "bg-blue-50";
  }

  return (
    <div className="relative group" style={{ minHeight: "50px" }}>
      <div className={`flex items-center transition-colors duration-200 ${borderClass} ${bgClass}`}>
        {/* Line number indicator */}
        <div className="w-8 flex-shrink-0 text-center text-xs text-gray-400 font-mono">
          {lineNumber}
        </div>
        {/* MathField input */}
        <math-field
          value={internalValue}
          onInput={handleInput}
          virtual-keyboard-mode="off"
          smart-fence={true}
          smart-superscript={true}
          smart-mode={true}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            padding: "12px",
            color: "#1f2937",
            fontSize: "1rem",
            minHeight: "48px",
            outline: "none",
            cursor: "text",
            userSelect: "text",
          }}
          className={`focus:ring-0 focus:outline-none placeholder-gray-400 text-gray-900 ${disabled ? "bg-gray-50 text-gray-500" : ""}`}
        />
        {/* Status indicator */}
        <div className="w-6 flex-shrink-0 text-center text-sm">
          {statusIndicator}
        </div>
        {/* Error message */}
        {error && (
          <div className="absolute -bottom-6 left-8 text-xs text-red-500 bg-red-50 px-2 py-1 rounded shadow-sm z-10">
            Complete this step correctly first
          </div>
        )}
      </div>
    </div>
  );
}