import React, { useMemo, useRef, useState } from "react";
import { Keyboard, ChevronDown, X } from "lucide-react";

type MathSymbolPadProps = {
  onInsert: (text: string) => void;
  open: boolean;
  onClose: () => void;
  anchorClassName?: string;
};

type TabKey = "basic" | "greek" | "func" | "ops" | "sets" | "calc";

const TABS: { key: TabKey; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "greek", label: "αβγ" },
  { key: "func",  label: "sin cos" },
  { key: "ops",   label: "≥ · ÷ →" },
  { key: "sets",  label: "∑∫Π ( ) ⦿" },
  { key: "calc",  label: "H₂O" },
];

type KeyDef = { label: string; insert: string };

const PAD_SYMBOLS: Record<TabKey, KeyDef[]> = {
  basic: [
    { label: "x²",   insert: "x^{ }" },
    { label: "xⁿ",   insert: "x^{ }" },           // generic exponent
    { label: "√",    insert: "\\sqrt{ }" },
    { label: "∛",    insert: "\\sqrt[3]{ }" },
    { label: "ⁿ√",   insert: "\\sqrt[n]{ }" },
    { label: "□",    insert: "\\square" },
    { label: "▭",    insert: "\\Box" },
    { label: "log",  insert: "\\log" },
    { label: "ln",   insert: "\\ln" },
    { label: "π",    insert: "\\pi" },
    { label: "θ",    insert: "\\theta" },
    { label: "∞",    insert: "\\infty" },
    { label: "∫",    insert: "\\int" },
    { label: "d/dx", insert: "\\frac{d}{dx}" },
    { label: "∂/∂x", insert: "\\frac{\\partial}{\\partial x}" },

    { label: "≥",    insert: "\\ge" },
    { label: "≤",    insert: "\\le" },
    { label: "·",    insert: "\\cdot" },
    { label: "÷",    insert: "\\div" },
    { label: "×",    insert: "\\times" },
    { label: "′",    insert: "^{\\prime}" },
    { label: "°",    insert: "^{\\circ}" },
    { label: "≈",    insert: "\\approx" },
    { label: "≠",    insert: "\\ne" },
    { label: "≡",    insert: "\\equiv" },
    { label: "±",    insert: "\\pm" },
    { label: "∣",    insert: "\\mid" },

    { label: "( )",  insert: "()" },
    { label: "[ ]",  insert: "[]" },
    { label: "{ }",  insert: "\\{\\}" },
    { label: "| |",  insert: "\\left| \\right|" },
    { label: "⌊ ⌋",  insert: "\\left\\lfloor \\right\\rfloor" },
    { label: "⌈ ⌉",  insert: "\\left\\lceil \\right\\rceil" },

    { label: "lim",  insert: "\\lim_{x \\to }" },
    { label: "∑",    insert: "\\sum_{n=1}^{ }" },
    { label: "∏",    insert: "\\prod_{n=1}^{ }" },
    { label: "→",    insert: "\\to" },
    { label: "↔",    insert: "\\leftrightarrow" },
    { label: "↦",    insert: "\\mapsto" },
    { label: "…",    insert: "\\dots" },
  ],

  greek: [
    // lowercase
    ...["alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa","lambda","mu","nu","xi","omicron","pi","rho","sigma","tau","upsilon","phi","chi","psi","omega"]
      .map((n) => ({ label: n[0]!, insert: `\\${n}` } as KeyDef)),
    // uppercase (selected)
    ...["Gamma","Delta","Theta","Lambda","Xi","Pi","Sigma","Phi","Psi","Omega"]
      .map((n) => ({ label: n[0]!, insert: `\\${n}` } as KeyDef)),
  ],

  func: [
    { label: "sin",  insert: "\\sin" },
    { label: "cos",  insert: "\\cos" },
    { label: "tan",  insert: "\\tan" },
    { label: "cot",  insert: "\\cot" },
    { label: "csc",  insert: "\\csc" },
    { label: "sec",  insert: "\\sec" },
    { label: "arcsin", insert: "\\arcsin" },
    { label: "arccos", insert: "\\arccos" },
    { label: "arctan", insert: "\\arctan" },
    { label: "sinh", insert: "\\sinh" },
    { label: "cosh", insert: "\\cosh" },
    { label: "tanh", insert: "\\tanh" },
    { label: "exp",  insert: "\\exp" },
    { label: "log",  insert: "\\log" },
    { label: "ln",   insert: "\\ln" },

    { label: "abs( )",   insert: "\\left|  \\right|" },
    { label: "floor( )", insert: "\\left\\lfloor  \\right\\rfloor" },
    { label: "ceil( )",  insert: "\\left\\lceil  \\right\\rceil" },

    { label: "f(x)", insert: "f(x)" },
    { label: "g(x)", insert: "g(x)" },
    { label: "h(x)", insert: "h(x)" },
    { label: "y(x)", insert: "y(x)" },
  ],

  ops: [
    { label: "+", insert: "+" },
    { label: "−", insert: "-" },
    { label: "×", insert: "\\times" },
    { label: "÷", insert: "\\div" },
    { label: "·", insert: "\\cdot" },
    { label: "%", insert: "\\%" },
    { label: "^", insert: "^" },
    { label: "=", insert: "=" },
    { label: "≈", insert: "\\approx" },
    { label: "≠", insert: "\\ne" },
    { label: "≡", insert: "\\equiv" },
    { label: "≜", insert: "\\triangleq" },

    { label: "<", insert: "<" },
    { label: "≤", insert: "\\le" },
    { label: "≥", insert: "\\ge" },
    { label: ">", insert: ">" },

    { label: "→", insert: "\\to" },
    { label: "↦", insert: "\\mapsto" },
    { label: "↔", insert: "\\leftrightarrow" },
    { label: "∝", insert: "\\propto" },

    { label: "∧", insert: "\\land" },
    { label: "∨", insert: "\\lor" },
    { label: "¬", insert: "\\lnot" },
    { label: "⊕", insert: "\\oplus" },
    { label: "⊗", insert: "\\otimes" },
    { label: "⊙", insert: "\\odot" },

    { label: "⊂", insert: "\\subset" },
    { label: "⊄", insert: "\\nsubseteq" },
    { label: "⊆", insert: "\\subseteq" },
    { label: "⊈", insert: "\\nsubseteq" },
    { label: "⊃", insert: "\\supset" },
    { label: "⊇", insert: "\\supseteq" },

    { label: "∈", insert: "\\in" },
    { label: "∉", insert: "\\notin" },
    { label: "∋", insert: "\\ni" },
    { label: "∌", insert: "\\not\\ni" },

    { label: "∴", insert: "\\therefore" },
    { label: "∵", insert: "\\because" },
    { label: "∥", insert: "\\parallel" },
    { label: "⊥", insert: "\\perp" },
  ],

  sets: [
    { label: "∑", insert: "\\sum_{n=1}^{ }" },
    { label: "∏", insert: "\\prod_{n=1}^{ }" },
    { label: "∐", insert: "\\coprod" },

    { label: "∫",   insert: "\\int" },
    { label: "∮",   insert: "\\oint" },
    { label: "∯",   insert: "\\oiint" },
    { label: "∰",   insert: "\\oiiint" },

    { label: "( )", insert: "()" },
    { label: "[ ]", insert: "[]" },
    { label: "{ }", insert: "\\{\\}" },
    { label: "⟨ ⟩", insert: "\\langle \\rangle" },
    { label: "| |", insert: "\\left|  \\right|" },
    { label: "‖ ‖", insert: "\\left\\|  \\right\\|" },

    { label: "∅", insert: "\\varnothing" },
    { label: "ℕ", insert: "\\mathbb{N}" },
    { label: "ℤ", insert: "\\mathbb{Z}" },
    { label: "ℚ", insert: "\\mathbb{Q}" },
    { label: "ℝ", insert: "\\mathbb{R}" },
    { label: "ℂ", insert: "\\mathbb{C}" },

    { label: "∪", insert: "\\cup" },
    { label: "∩", insert: "\\cap" },
    { label: "⊎", insert: "\\uplus" },
    { label: "⨁", insert: "\\bigoplus" },
    { label: "⨂", insert: "\\bigotimes" },
    { label: "⨀", insert: "\\bigodot" },
  ],

  calc: [
    { label: "d/dx", insert: "\\frac{d}{dx}" },
    { label: "∂/∂x", insert: "\\frac{\\partial}{\\partial x}" },
    { label: "Δ",    insert: "\\Delta" },
    { label: "∇",    insert: "\\nabla" },

    { label: "∫",      insert: "\\int" },
    { label: "∫∫",    insert: "\\iint" },
    { label: "∫∫∫",  insert: "\\iiint" },
    { label: "∮",      insert: "\\oint" },

    { label: "lim",  insert: "\\lim_{x \\to }" },
    { label: "∞",    insert: "\\infty" },
    { label: "≈",    insert: "\\approx" },
    { label: "≃",    insert: "\\simeq" },
    { label: "≅",    insert: "\\cong" },

    { label: "x′", insert: "x^{\\prime}" },
    { label: "x″", insert: "x^{\\prime\\prime}" },
    { label: "x‴", insert: "x^{\\prime\\prime\\prime}" },

    { label: "θ̇", insert: "\\dot{\\theta}" },
    { label: "θ̈", insert: "\\ddot{\\theta}" },

    { label: "dx", insert: "\\,dx" },
    { label: "dy", insert: "\\,dy" },
    { label: "dt", insert: "\\,dt" },
    { label: "du", insert: "\\,du" },
    { label: "dv", insert: "\\,dv" },
  ],
};

// compact strip (Symbolab-like “mini pad”)
const MINI_STRIP: KeyDef[] = [
  { label: "x²",   insert: "x^{ }" },
  { label: "xⁿ",   insert: "x^{ }" },
  { label: "√",    insert: "\\sqrt{ }" },
  { label: "ⁿ√",   insert: "\\sqrt[n]{ }" },
  { label: "log",  insert: "\\log" },
  { label: "π",    insert: "\\pi" },
  { label: "θ",    insert: "\\theta" },
  { label: "∞",    insert: "\\infty" },
  { label: "∫",    insert: "\\int" },
  { label: "d/dx", insert: "\\frac{d}{dx}" },
  { label: "≥",    insert: "\\ge" },
  { label: "≤",    insert: "\\le" },
  { label: "·",    insert: "\\cdot" },
  { label: "÷",    insert: "\\div" },
  { label: "×",    insert: "\\times" },
  { label: "′",    insert: "^{\\prime}" },
  { label: "lim",  insert: "\\lim_{x \\to }" },
  { label: "∑",    insert: "\\sum_{n=1}^{ }" },
  { label: "( )",  insert: "()" },
  { label: "[ ]",  insert: "[]" },
];

export default function MathSymbolPad({
  onInsert,
  open,
  onClose,
  anchorClassName,
}: MathSymbolPadProps) {
  const [fullPad, setFullPad] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [tab, setTab] = useState<TabKey>("basic");
  const padRef = useRef<HTMLDivElement | null>(null);

  // close when clicking outside
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!padRef.current) return;
      if (open && !padRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  const renderButton = (k: KeyDef, key?: string) => (
    <button
      key={key ?? k.label}
      type="button"
      onClick={() => onInsert(k.insert)}
      className="px-2 py-1 text-[15px] rounded border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm"
      title={k.insert}
    >
      {k.label}
    </button>
  );

  const NUMPAD = useMemo(() => {
    const rows: KeyDef[][] = [
      [{label:"−",insert:"-"}, {label:"<",insert:"<"}, {label:">",insert:">"}, {label:"9",insert:"9"}, {label:"AC",insert:""}],
      [{label:"+",insert:"+"}, {label:"≥",insert:"\\ge"}, {label:"≤",insert:"\\le"}, {label:"8",insert:"8"}, {label:"□",insert:"\\square"}],
      [{label:"×",insert:"\\times"}, {label:"4",insert:"4"}, {label:"5",insert:"5"}, {label:"6",insert:"6"}, {label:"x",insert:"x"}],
      [{label:"÷",insert:"\\div"}, {label:"(",insert:"("}, {label:"1",insert:"1"}, {label:"2",insert:"2"}, {label:"3",insert:"3"}],
      [{label:"=",insert:"="}, {label:")",insert:")"}, {label:".",insert:"."}, {label:"0",insert:"0"}, {label:"y",insert:"y"}],
    ];
    return (
      <div className="mt-2 rounded-xl border bg-white shadow-lg p-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-2 last:mb-0">
            {r.map((c, j) => renderButton(c, `num-${i}-${j}`))}
          </div>
        ))}
      </div>
    );
  }, []);

  if (!open) return null;

  return (
    <div ref={padRef} className={`relative z-50 ${anchorClassName ?? ""}`}>
      <div className="rounded-2xl border bg-white shadow-xl p-3 w-[760px] max-w-[96vw]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-gray-700">
            <Keyboard className="h-5 w-5" />
            <span className="font-medium">Math pad</span>
          </div>

          <div className="flex items-center gap-3 select-none">
            <span className="text-sm text-gray-500">Full pad</span>
            <label className="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={fullPad}
                onChange={() => setFullPad((v) => !v)}
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-rose-500 relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 after:transition" />
            </label>

            <button
              type="button"
              onClick={() => setShowNumpad((s) => !s)}
              className="ml-2 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              title="Toggle numpad"
            >
              <ChevronDown className={`h-4 w-4 transition ${showNumpad ? "rotate-180" : ""}`} />
              <span>numpad</span>
            </button>

            <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-500" />
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
                  className={`px-3 py-1 rounded-t-lg border-b-0 border ${
                    t.key === tab
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
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
      </div>

      {showNumpad && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[100%] mt-2">{NUMPAD}</div>
      )}
    </div>
  );
}
