// MathKeyboard.tsx
import React, { useEffect, useRef } from "react";

interface MathKeyboardProps {
  onInsert: (symbol: string) => void;
  onClose?: () => void;
  theme?: "light" | "dark";
}

export function MathKeyboard({ onInsert, onClose, theme = "light" }: MathKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Detect click outside to close keyboard
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        keyboardRef.current &&
        !keyboardRef.current.contains(e.target as Node)
      ) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Keyboard layout
  const rows = [
    [
      { label: "∞", type: "symbol" },
      { label: "≠", type: "symbol" },
      { label: "∈", type: "symbol" },
      { label: "π", type: "symbol" },
      { label: "√", type: "symbol" },
      { label: "x²", type: "symbol" },
      { label: "sin", type: "symbol" },
      { label: "cos", type: "symbol" },
      { label: "tan", type: "symbol" },
      { label: "^", type: "symbol" },
      { label: "(", type: "symbol" },
      { label: ")", type: "symbol" },
    ],
    [
      { label: "x", type: "symbol" },
      { label: "y", type: "symbol" },
      { label: "n", type: "symbol" },
      { label: "a", type: "symbol" },
      { label: "7", type: "number" },
      { label: "8", type: "number" },
      { label: "9", type: "number" },
      { label: "/", type: "symbol" },
      { label: "*", type: "symbol" },
      { label: "⌫", type: "delete" },
    ],
    [
      { label: "4", type: "number" },
      { label: "5", type: "number" },
      { label: "6", type: "number" },
      { label: "+", type: "symbol" },
      { label: "-", type: "symbol" },
      { label: "=", type: "symbol" },
      { label: ".", type: "symbol" },
      { label: ",", type: "symbol" },
      { label: "Enter", type: "enter", colSpan: 2 },
    ],
    [
      { label: "1", type: "number" },
      { label: "2", type: "number" },
      { label: "3", type: "number" },
      { label: "0", type: "number", colSpan: 2 },
      { label: "÷", type: "symbol" },
      { label: "×", type: "symbol" },
    ],
  ];

  // Theme styles
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const shadow = isDark ? "shadow-2xl" : "shadow-lg";

  return (
    <div
      ref={keyboardRef}
      className={`fixed left-0 right-0 bottom-0 z-50 ${bgColor} ${borderColor} border-t ${shadow} p-4`}
      style={{
        fontFamily: "monospace",
        minHeight: "260px",
        maxHeight: "50vh",
        width: "100vw",
        transition: "box-shadow 0.2s",
      }}
    >
      <div className={`text-center text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Tip: Click outside the keyboard to hide it.
      </div>
      <div className="flex flex-col gap-2 w-full">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 w-full">
            {row.map((key, keyIdx) => {
              let base =
                "h-12 rounded flex-1 text-lg flex items-center justify-center transition font-mono";
              let style = isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200";
              if (key.type === "delete") style = isDark
                ? "bg-red-900 text-red-300 hover:bg-red-800"
                : "bg-red-300 text-red-900 hover:bg-red-400";
              if (key.type === "enter") style = isDark
                ? "bg-indigo-700 text-white hover:bg-indigo-600"
                : "bg-indigo-500 text-white hover:bg-indigo-600";
              if (key.type === "number") style = isDark
                ? "bg-gray-900 hover:bg-gray-800"
                : "bg-white hover:bg-gray-100";
              if (key.colSpan) base += ` flex-[${key.colSpan}]`;

              return (
                <button
                  key={keyIdx}
                  className={`${base} ${style} ${textColor}`}
                  style={key.colSpan ? { flex: key.colSpan } : undefined}
                  onClick={() => {
                    if (key.type === "delete") onInsert("⌫");
                    else if (key.type === "enter") onInsert("\n");
                    else onInsert(key.label);
                  }}
                  tabIndex={-1}
                >
                  {key.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
