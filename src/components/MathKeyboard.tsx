import React, { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";

interface MathKeyboardProps {
  theme?: "light" | "dark";
}

type Txt = HTMLInputElement | HTMLTextAreaElement;

export function MathKeyboard({ theme = "light" }: MathKeyboardProps) {
  const [open, setOpen] = useState(false);
  const [lastFocused, setLastFocused] = useState<Txt | null>(null);

  // formatted preview state (position + text)
  const [preview, setPreview] = useState({
    show: false,
    text: "",
    top: 0,
    left: 0,
  });

  // Track last focused input/textarea and keep preview in sync
  useEffect(() => {
    const onFocusIn = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        setLastFocused(el as Txt);
        updatePreview(el as Txt);
      }
    };
    const onInput = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        updatePreview(el as Txt);
      }
    };
    const onScrollOrResize = () => {
      if (lastFocused) updatePreview(lastFocused);
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("input", onInput, true);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("input", onInput, true);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [lastFocused]);

  // ---------- Pretty formatting JUST for the preview ----------
  const toPretty = (raw: string) => {
    // superscripts map
    const sup: Record<string, string> = {
      "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
      "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
    };

    let s = raw;

    // sqrt( -> √(
    s = s.replace(/sqrt\(/g, "√(");

    // a^(-?digits) -> a^{superscripts}
    // handles things like x^-2, y^10, etc.
    s = s.replace(/\^(-?\d+)/g, (_, n: string) =>
      [...n].map(ch => sup[ch] ?? ch).join("")
    );

    return s;
  };

  const updatePreview = (el: Txt) => {
    const rect = el.getBoundingClientRect();
    const raw = el.value ?? "";
    const pretty = toPretty(raw);
    const show = !!raw && pretty !== raw;

    setPreview({
      show,
      text: pretty,
      top: Math.min(window.innerHeight - 48, rect.bottom + 6), // just below field
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 8)), // clamp to screen
    });
  };

  // ---------- Keyboard mappings (ALWAYS raw for parsing!) ----------
  const symbolMap: Record<string, string> = {
    "x²": "x^2",
    "xᵇ": "x^",     // user can type exponent next
    "√": "sqrt(",
    "÷": "/",
    "×": "*",
    "−": "-",       // use ASCII minus for parsers
    "|a|": "abs(",  // common function; user can type closing )
    "π": "pi",
  };

  const leftGroup = [
    ["x", "y", "x²", "xᵇ"],
    ["(", ")", "<", ">"],
    ["|a|", ",", "≤", "≥"],
    ["ABC", "π", "√", ""],
  ];
  const middleGroup = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "−"],
    ["0", ".", "=", "+"],
  ];
  const rightGroup = [["←", "→"], ["⌫"], ["Enter"]];

  // ---------- Insert raw text into the last focused field ----------
  const insertAtCursor = (rawInsert: string) => {
    const el = lastFocused;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);

    // Insert raw (caret) text for the parser
    el.value = before + rawInsert + after;

    // Move caret after inserted raw text
    const caret = start + rawInsert.length;
    el.selectionStart = el.selectionEnd = caret;

    // Notify React/consumers
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();

    // Update preview bubble
    updatePreview(el);
  };

  // ---------- Styles ----------
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const keyBase =
    "h-12 w-14 rounded-xl text-lg font-medium flex items-center justify-center transition-all duration-200 shadow active:scale-95";
  const keyBg = isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200";

  return (
    <>
      {/* Always-visible toggle button */}
      <button
        className="fixed bottom-6 left-6 z-[1000] p-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition"
        onClick={() => setOpen(!open)}
        title="Math Keyboard"
      >
        <Keyboard size={24} />
      </button>

      {/* Live pretty preview bubble (does NOT change the input value) */}
      {preview.show && (
        <div
          className={`fixed pointer-events-none ${bgColor} ${borderColor} ${textColor} border rounded-lg shadow-md px-3 py-1 text-sm`}
          style={{ top: preview.top, left: preview.left, maxWidth: "90vw", zIndex: 999 }}
        >
          {preview.text}
        </div>
      )}

      {/* Keyboard panel (centered bottom) */}
      {open && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[999]">
          <div
            className={`${bgColor} ${borderColor} border shadow-xl rounded-2xl p-6`}
            style={{ fontFamily: "monospace", width: "90vw", maxWidth: "820px" }}
          >
            <div className="flex gap-6 justify-center">
              {/* Left group */}
              <div className="flex flex-col gap-3 items-center border-r pr-4">
                {leftGroup.map((row, i) => (
                  <div key={i} className="flex gap-3">
                    {row.map((label, j) =>
                      label ? (
                        <button
                          key={j}
                          className={`${keyBase} ${keyBg} ${textColor}`}
                          onClick={() => insertAtCursor(symbolMap[label] ?? label)}
                          title={symbolMap[label] ? `${label} → ${symbolMap[label]}` : label}
                        >
                          {label}
                        </button>
                      ) : (
                        <div key={j} className="w-14" />
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* Middle group */}
              <div className="flex flex-col gap-3 items-center border-r pr-4">
                {middleGroup.map((row, i) => (
                  <div key={i} className="flex gap-3">
                    {row.map((label, j) => (
                      <button
                        key={j}
                        className={`${keyBase} ${keyBg} ${textColor}`}
                        onClick={() => insertAtCursor(symbolMap[label] ?? label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right group */}
              <div className="flex flex-col gap-3 items-center">
                {rightGroup.map((row, i) => (
                  <div key={i} className="flex gap-3">
                    {row.map((label, j) => {
                      let style = `${keyBg} ${textColor}`;
                      if (label === "⌫") style = "bg-red-500 text-white hover:bg-red-600";
                      if (label === "Enter") style = "bg-indigo-500 text-white hover:bg-indigo-600";

                      return (
                        <button
                          key={j}
                          className={`${keyBase} ${style}`}
                          onClick={() => {
                            if (!lastFocused) return;
                            const el = lastFocused;

                            if (label === "⌫") {
                              const start = el.selectionStart ?? 0;
                              const end = el.selectionEnd ?? 0;
                              if (start > 0) {
                                el.value = el.value.slice(0, start - 1) + el.value.slice(end);
                                el.selectionStart = el.selectionEnd = start - 1;
                                el.dispatchEvent(new Event("input", { bubbles: true }));
                                updatePreview(el);
                              }
                            } else if (label === "Enter") {
                              insertAtCursor("\n");
                            } else if (label === "←") {
                              const pos = Math.max(0, (el.selectionStart ?? 0) - 1);
                              el.selectionStart = el.selectionEnd = pos;
                              el.focus();
                              updatePreview(el);
                            } else if (label === "→") {
                              const pos = Math.min(el.value.length, (el.selectionEnd ?? 0) + 1);
                              el.selectionStart = el.selectionEnd = pos;
                              el.focus();
                              updatePreview(el);
                            } else {
                              insertAtCursor(symbolMap[label] ?? label);
                            }
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
