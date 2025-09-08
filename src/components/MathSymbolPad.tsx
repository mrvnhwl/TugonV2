import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
// Inline SVG for the Keyboard and X icons
const KeyboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
    <path d="M6 8h.01" />
    <path d="M6 12h.01" />
    <path d="M6 16h.01" />
    <path d="M10 8h.01" />
    <path d="M10 12h.01" />
    <path d="M10 16h.01" />
    <path d="M14 8h.01" />
    <path d="M14 12h.01" />
    <path d="M14 16h.01" />
    <path d="M18 8h.01" />
    <path d="M18 12h.01" />
    <path d="M18 16h.01" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" />
    <path d="M6 6L18 18" />
  </svg>
);

// Declare a global type for the KaTeX library to avoid TypeScript errors.
declare global {
  interface Window {
    katex: any;
  }
}

export type MathSymbolPadProps = {
  onInsert: (text: string) => void;
  onClose: () => void;
  onPreventFocusLoss: (e: React.MouseEvent) => void;
};

// Component to render LaTeX using KaTeX
const RenderedMath = ({ latex }: { latex: string }) => {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        if (latex) {
          window.katex.render(latex, ref.current, {
            throwOnError: false,
            displayMode: false,
          });
        } else {
          ref.current.textContent = '';
        }
      } catch (e) {
        ref.current.textContent = latex;
      }
    }
  }, [latex]);

  return <span ref={ref} className="text-gray-900 dark:text-gray-100"></span>;
};

// A custom hook to dynamically load KaTeX, ensuring it's ready before rendering.
const useKaTeX = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
    script.onload = () => setLoading(false);
    script.onerror = () => {
      console.error("Failed to load KaTeX script.");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);
  return { loading };
};

type TabKey = "basic" | "greek" | "func" | "ops" | "sets" | "calc";

const TABS: { key: TabKey; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "greek", label: "\\alpha\\beta\\gamma" },
  { key: "func", label: "\\sin \\cos" },
  { key: "ops", label: "\\ge \\cdot \\div \\to" },
  { key: "sets", label: "\\sum\\int\\Pi" },
  { key: "calc", label: "H_2O" },
];

type KeyDef = { label: string; insert: string };

const MINI_STRIP: KeyDef[] = [
  { label: "1", insert: "1" },
  { label: "2", insert: "2" },
  { label: "3", insert: "3" },
  { label: "4", insert: "4" },
  { label: "5", insert: "5" },
  { label: "6", insert: "6" },
  { label: "7", insert: "7" },
  { label: "8", insert: "8" },
  { label: "9", insert: "9" },
  { label: "0", insert: "0" },
  { label: "+", insert: "+" },
  { label: "−", insert: "-" },
  { label: "\\times", insert: "\\times" },
  { label: "\\div", insert: "\\div" },
  { label: "=", insert: "=" },
  { label: ".", insert: "." },
  { label: "x^{2}", insert: "x^{2}" },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
];

const BASIC_WITH_NUMPAD: KeyDef[] = [
  { label: "1", insert: "1" },
  { label: "2", insert: "2" },
  { label: "3", insert: "3" },
  { label: "4", insert: "4" },
  { label: "5", insert: "5" },
  { label: "6", insert: "6" },
  { label: "7", insert: "7" },
  { label: "8", insert: "8" },
  { label: "9", insert: "9" },
  { label: "0", insert: "0" },
  { label: ".", insert: "." },
  { label: "+", insert: "+" },
  { label: "−", insert: "-" },
  { label: "\\times", insert: "\\times" },
  { label: "\\div", insert: "\\div" },
  { label: "·", insert: "\\cdot" },
  { label: "=", insert: "=" },
  { label: "x^{2}", insert: "x^{2}" },
  { label: "x^{n}", insert: "x^{ }" },
  { label: "\\sqrt{ }", insert: "\\sqrt{ }" },
  { label: "\\sqrt[n]{ }", insert: "\\sqrt[n]{ }" },
  { label: "\\log", insert: "\\log" },
  { label: "\\ln", insert: "\\ln" },
  { label: "\\pi", insert: "\\pi" },
  { label: "\\theta", insert: "\\theta" },
  { label: "\\infty", insert: "\\infty" },
  { label: "\\int", insert: "\\int" },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
  { label: "[", insert: "[" },
  { label: "]", insert: "]" },
  { label: "\\{\\}", insert: "\\{\\}" },
  { label: "| |", insert: "\\left| \\right|" },
  { label: "<", insert: "<" },
  { label: ">", insert: ">" },
  { label: "\\le", insert: "\\le" },
  { label: "\\ge", insert: "\\ge" },
  { label: "\\ne", insert: "\\ne" },
  { label: "\\approx", insert: "\\approx" },
  { label: "\\to", insert: "\\to" },
  { label: "\\dots", insert: "\\dots" },
  { label: "x", insert: "x" },
  { label: "y", insert: "y" },
];

const PAD_SYMBOLS: Record<TabKey, KeyDef[]> = {
  basic: BASIC_WITH_NUMPAD,
  greek: [
    ...["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"].map((n) => ({ label: `\\${n}`, insert: `\\${n}` } as KeyDef)),
    ...["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Phi", "Psi", "Omega"].map((n) => ({ label: `\\${n}`, insert: `\\${n}` } as KeyDef)),
  ],
  func: [
    { label: "\\sin", insert: "\\sin" },
    { label: "\\cos", insert: "\\cos" },
    { label: "\\tan", insert: "\\tan" },
    { label: "\\cot", insert: "\\cot" },
    { label: "\\csc", insert: "\\csc" },
    { label: "\\sec", insert: "\\sec" },
    { label: "\\arcsin", insert: "\\arcsin" },
    { label: "\\arccos", insert: "\\arccos" },
    { label: "\\arctan", insert: "\\arctan" },
    { label: "\\sinh", insert: "\\sinh" },
    { label: "\\cosh", insert: "\\cosh" },
    { label: "\\tanh", insert: "\\tanh" },
    { label: "\\exp", insert: "\\exp" },
    { label: "\\log", insert: "\\log" },
    { label: "\\ln", insert: "\\ln" },
    { label: "\\left| \\right|", insert: "\\left|  \\right|" },
    { label: "\\left\\lfloor \\right\\rfloor", insert: "\\left\\lfloor  \\right\\rfloor" },
    { label: "\\left\\lceil \\right\\rceil", insert: "\\left\\lceil  \\right\\rceil" },
    { label: "f(x)", insert: "f(x)" },
    { label: "g(x)", insert: "g(x)" },
    { label: "h(x)", insert: "h(x)" },
    { label: "y(x)", insert: "y(x)" },
  ],
  ops: [
    { label: "+", insert: "+" },
    { label: "−", insert: "-" },
    { label: "\\times", insert: "\\times" },
    { label: "\\div", insert: "\\div" },
    { label: "·", insert: "\\cdot" },
    { label: "%", insert: "\\%" },
    { label: "^", insert: "^" },
    { label: "=", insert: "=" },
    { label: "\\approx", insert: "\\approx" },
    { label: "\\ne", insert: "\\ne" },
    { label: "\\equiv", insert: "\\equiv" },
    { label: "\\triangleq", insert: "\\triangleq" },
    { label: "<", insert: "<" },
    { label: "\\le", insert: "\\le" },
    { label: "\\ge", insert: "\\ge" },
    { label: ">", insert: ">" },
    { label: "\\to", insert: "\\to" },
    { label: "\\mapsto", insert: "\\mapsto" },
    { label: "\\leftrightarrow", insert: "\\leftrightarrow" },
    { label: "\\propto", insert: "\\propto" },
    { label: "\\land", insert: "\\land" },
    { label: "\\lor", insert: "\\lor" },
    { label: "\\lnot", insert: "\\lnot" },
    { label: "\\oplus", insert: "\\oplus" },
    { label: "\\otimes", insert: "\\otimes" },
    { label: "\\odot", insert: "\\odot" },
    { label: "\\subset", insert: "\\subset" },
    { label: "\\not\\subseteq", insert: "\\nsubseteq" },
    { label: "\\subseteq", insert: "\\subseteq" },
    { label: "\\not\\subseteq", insert: "\\nsubseteq" },
    { label: "\\supset", insert: "\\supset" },
    { label: "\\supseteq", insert: "\\supseteq" },
    { label: "\\in", insert: "\\in" },
    { label: "\\notin", insert: "\\notin" },
    { label: "\\ni", insert: "\\ni" },
    { label: "\\not\\ni", insert: "\\not\\ni" },
    { label: "\\therefore", insert: "\\therefore" },
    { label: "\\because", insert: "\\because" },
    { label: "\\parallel", insert: "\\parallel" },
    { label: "\\perp", insert: "\\perp" },
  ],
  sets: [
    { label: "\\sum", insert: "\\sum_{n=1}^{ }" },
    { label: "\\prod", insert: "\\prod_{n=1}^{ }" },
    { label: "\\coprod", insert: "\\coprod" },
    { label: "\\int", insert: "\\int" },
    { label: "\\oint", insert: "\\oint" },
    { label: "\\oiint", insert: "\\oiint" },
    { label: "\\oiiint", insert: "\\oiiint" },
    { label: "( )", insert: "()" },
    { label: "[ ]", insert: "[]" },
    { label: "\\{\\}", insert: "\\{\\}" },
    { label: "\\langle \\rangle", insert: "\\langle \\rangle" },
    { label: "\\left| \\right|", insert: "\\left|  \\right|" },
    { label: "\\left\\| \\right\\|", insert: "\\left\\|  \\right\\|" },
    { label: "\\varnothing", insert: "\\varnothing" },
    { label: "\\mathbb{N}", insert: "\\mathbb{N}" },
    { label: "\\mathbb{Z}", insert: "\\mathbb{Z}" },
    { label: "\\mathbb{Q}", insert: "\\mathbb{Q}" },
    { label: "\\mathbb{R}", insert: "\\mathbb{R}" },
    { label: "\\mathbb{C}", insert: "\\mathbb{C}" },
    { label: "\\cup", insert: "\\cup" },
    { label: "\\cap", insert: "\\cap" },
    { label: "\\uplus", insert: "\\uplus" },
    { label: "\\bigoplus", insert: "\\bigoplus" },
    { label: "\\bigotimes", insert: "\\bigotimes" },
    { label: "\\bigodot", insert: "\\bigodot" },
  ],
  calc: [
    { label: "\\frac{d}{dx}", insert: "\\frac{d}{dx}" },
    { label: "\\frac{\\partial}{\\partial x}", insert: "\\frac{\\partial}{\\partial x}" },
    { label: "\\Delta", insert: "\\Delta" },
    { label: "\\nabla", insert: "\\nabla" },
    { label: "\\int", insert: "\\int" },
    { label: "\\iint", insert: "\\iint" },
    { label: "\\iiint", insert: "\\iiint" },
    { label: "\\oint", insert: "\\oint" },
    { label: "\\lim", insert: "\\lim_{x \\to }" },
    { label: "\\infty", insert: "\\infty" },
    { label: "\\approx", insert: "\\approx" },
    { label: "\\simeq", insert: "\\simeq" },
    { label: "\\cong", insert: "\\cong" },
    { label: "x^{\\prime}", insert: "x^{\\prime}" },
    { label: "x^{\\prime\\prime}", insert: "x^{\\prime\\prime}" },
    { label: "x^{\\prime\\prime\\prime}", insert: "x^{\\prime\\prime\\prime}" },
    { label: "\\dot{\\theta}", insert: "\\dot{\\theta}" },
    { label: "\\ddot{\\theta}", insert: "\\ddot{\\theta}" },
    { label: "\\,dx", insert: "\\,dx" },
    { label: "\\,dy", insert: "\\,dy" },
    { label: "\\,dt", insert: "\\,dt" },
    { label: "\\,du", insert: "\\,du" },
    { label: "\\,dv", insert: "\\,dv" },
  ],
};

export default function MathSymbolPad({ onInsert, onClose, onPreventFocusLoss }: MathSymbolPadProps) {
  const { loading } = useKaTeX();
  const [fullPad, setFullPad] = useState(false);
  const [tab, setTab] = useState<TabKey>("basic");
  const padRef = useRef<HTMLDivElement | null>(null);

  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  }, [isDragging, dragOffset]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  const renderButton = (k: KeyDef, key?: string) => (
    <button
      key={key ?? k.label}
      type="button"
      onMouseDown={onPreventFocusLoss}
      onClick={() => onInsert(k.insert.trim())}
      className="px-2 py-1 text-[15px] rounded border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm"
      title={k.insert}
    >
      <RenderedMath latex={k.label} />
    </button>
  );

  return (
    <div
      ref={padRef}
      className="fixed z-50 rounded-2xl border bg-white shadow-xl p-3 w-[760px] max-w-[96vw]"
      style={{ top: position.y, left: position.x, transform: "translate(-50%, -50%)" }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-gray-500">Loading symbols...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between cursor-grab active:cursor-grabbing" onMouseDown={onMouseDown}>
            <div className="inline-flex items-center gap-2 text-gray-700">
              <KeyboardIcon className="h-5 w-5" />
              <span className="font-medium">Math pad</span>
            </div>

            <div className="flex items-center gap-3 select-none no-drag">
              <span className="text-sm text-gray-500">Full pad</span>
              <label className="inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={fullPad}
                  onChange={() => setFullPad((v) => !v)}
                  onMouseDown={onPreventFocusLoss}
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-rose-500 relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 after:transition" />
              </label>

              <button
                type="button"
                onClick={onClose}
                onMouseDown={onPreventFocusLoss}
                className="p-1 rounded hover:bg-gray-100"
              >
                <XIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {!fullPad ? (
            <div className="mt-3 grid grid-cols-10 gap-2">
              {MINI_STRIP.map((k, i) => renderButton(k, `mini-${i}`))}
            </div>
          ) : (
            <>
              <div className="mt-4 flex gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`px-3 py-1 rounded-t-lg border-b-0 border ${t.key === tab
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    }`}
                    onMouseDown={onPreventFocusLoss}
                    onClick={() => setTab(t.key)}
                  >
                    <RenderedMath latex={t.label} />
                  </button>
                ))}
              </div>
              <div className="rounded-b-xl rounded-tr-xl border border-t-0 p-3 bg-white">
                <div className="grid grid-cols-10 gap-2">
                  {PAD_SYMBOLS[tab].map((k, i) => renderButton(k, `${tab}-${i}`))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
