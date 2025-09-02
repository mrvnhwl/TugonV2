import { useEffect, useMemo, useState } from "react";
import { predefinedAnswers as predefinedAnswersData } from "@/components/data/answers";
import type { PredefinedAnswer } from "@/components/data/answers";
import { cn } from "../../cn";
import CartesianPlane, { GraphValue } from "../answers-type/GraphAnswer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// removed direct Textarea usage; wrapped by AnswerInput
import AnswerInput from "./AnswerInput";
import { CheckCircle } from "lucide-react";
import { Text, Small } from "../../Typography";

// Allowed answer types
export type AnswerType = "single" | "multi" | "graph";

// Public input step shape (for initializing the wizard)
export type Step = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type?: AnswerType; // answer format selector
  // Unified value across all formats. For graph, this is the (x,y) text; for others, plain text.
  answerValue?: string;
  // Optional graph state used only when type === 'graph'
  value?: GraphValue;
};

// Internal state shape that the wizard manages
export type WizardStep = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type: AnswerType;
  // unified answer content regardless of format
  answerValue: string;
  // graph internal state when applicable
  value: GraphValue;
};

type AnswerWizardProps = {
  steps?: Step[]; // treated as initial/hydration
  onSubmit: (steps: WizardStep[], result?: { correct: boolean[]; allCorrect: boolean }) => void;
  className?: string;
  onIndexChange?: (index: number) => void;
  // If provided, these expected answers will be used for step shapes and validation
  expectedAnswers?: PredefinedAnswer[];
  // Notify parent when the current step's unified answerValue changes
  onAnswerChange?: (index: number, value: string) => void;
  inputDisabled?: boolean;
  onSpamDetected?: () => void;
  onValidationResult?: (type: "correct" | "wrong" | "aiHint" | "spam") => void;
};

// Child components (accept { value, onChange, step })
// (removed old format-specific input components in favor of one unified input)

const defaultGraph: GraphValue = { xLimit: null, yLimit: null, points: [] };

// (reverted) No tolerance-based comparing here; graph answers are compared as text from the textarea

export default function AnswerWizard({ steps: _initialSteps = [], onSubmit, className, onIndexChange, expectedAnswers, onAnswerChange, inputDisabled, onSpamDetected, onValidationResult }: AnswerWizardProps) {
  // Source answers: prefer per-question answers if provided; otherwise fall back to global sample
  const answersSource: PredefinedAnswer[] = expectedAnswers && expectedAnswers.length > 0
    ? expectedAnswers
    : (predefinedAnswersData || []);
  // Fixed steps derived strictly from the selected answers source
  const fixedSteps: WizardStep[] = (answersSource || []).map((_, i) => {
    // Default to single-line format for all steps initially
    const t: AnswerType = "single";
    return {
      id: `s${i + 1}`,
      type: t,
      answerValue: "",
      value: defaultGraph,
    } as WizardStep;
  });
  if (import.meta.env?.DEV) console.log("Total steps:", fixedSteps.length);

  const [steps, setSteps] = useState<WizardStep[]>(fixedSteps);
  const [index, setIndex] = useState(0);
  const [correctness, setCorrectness] = useState<Array<boolean | null>>(
    Array.from({ length: fixedSteps.length }, () => null)
  );
  // unified input lives in steps[i].answerValue, so no separate graphTexts needed

  const total = steps.length;
  const current = steps[index];
  // Graph modal state (Tailwind-only modal)
  const [graphOpen, setGraphOpen] = useState(false);
  const [graphInputs, setGraphInputs] = useState<{ x: string; y: string }>({ x: "10", y: "10" });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (graphOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [graphOpen]);

  // Notify parent when the active index changes
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const setTypeForCurrent = (t: AnswerType) => {
    if (!current) return;
    setSteps((prev) => {
      const next = [...prev];
      // Do not reset answerValue when switching formats; keep graph value as-is when switching back
      const existing = next[index];
      next[index] = {
        ...existing,
        type: t,
        value: (existing.value as GraphValue) ?? defaultGraph,
      } as WizardStep;
      return next;
    });
  };

  const updateCurrentGraphValue = (value: GraphValue) => {
    if (!current) return;
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value } as WizardStep;
      return next;
    });
  };

  // Dynamic add/remove disabled: steps are fixed by predefinedAnswers

  // Sanitizer shared by validation and submission
  const sanitizeText = (v: string) => (v ?? "").replace(/[\s\n\r]+/g, "").toLowerCase();

  // Unified validation function per requirements
  const validateAnswer = (step: WizardStep | undefined, answer: string | undefined, stepIndex: number): boolean => {
    if (!step) return false;
    const a = (answer ?? "").trim();
    if (!a) return false;
    const expected = answersSource?.[stepIndex]?.answer;
    if (!expected) {
      // Fallback: if no expected is defined, consider non-empty as valid
      return a.length > 0;
    }
    // Graph-specific minimum validity:
    // Only enforce coordinate/points requirement when the expected answer looks like coordinates.
    if (step.type === "graph") {
      const coordRe = /\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)/;
      const expectedLooksLikeCoords = coordRe.test(expected);
      if (expectedLooksLikeCoords) {
        const hasPlotted = Array.isArray(step.value?.points) && step.value.points.length > 0;
        const hasCoordText = coordRe.test(a);
        if (!hasPlotted && !hasCoordText) return false;
      }
    }
    return sanitizeText(a) === sanitizeText(expected);
  };

  const content = useMemo(() => {
    if (!current) return <div className="text-sm text-gray-500">No steps yet.</div>;
    // Only show format-specific helpers here (e.g., graph plane trigger). The unified input is rendered below the step indicator.
    if (current.type !== "graph") return null;
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-600">xLimit (1-20)</label>
            <Input
              type="number"
              min={1}
              max={20}
              className="w-28"
              value={graphInputs.x}
              onChange={(e) => setGraphInputs((s) => ({ ...s, x: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">yLimit (1-20)</label>
            <Input
              type="number"
              min={1}
              max={20}
              className="w-28"
              value={graphInputs.y}
              onChange={(e) => setGraphInputs((s) => ({ ...s, y: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const clamp = (v: number) => Math.max(1, Math.min(20, Math.floor(v)));
              const xl = clamp(Number(graphInputs.x) || 0);
              const yl = clamp(Number(graphInputs.y) || 0);
              // seed the step's graph value so modal canvas draws with these limits
              setSteps((prev) => {
                const next = [...prev];
                next[index] = { ...next[index], value: { xLimit: xl, yLimit: yl, points: [] } as GraphValue } as WizardStep;
                return next;
              });
              setGraphOpen(true);
            }}
          >
            Generate Plane
          </Button>
        </div>

        {/* Lightweight modal (lazy render) */}
        {graphOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setGraphOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="absolute top-2 right-2" onClick={() => setGraphOpen(false)}>
                X
              </button>
              <div className="text-base font-semibold mb-3">Cartesian Plane</div>
              <div className="max-h-[70vh] overflow-auto">
                <CartesianPlane
                  step={current}
                  value={(current.value as GraphValue) ?? defaultGraph}
                  onChange={updateCurrentGraphValue}
                  hideControls
                  onPointsCommit={(pts: Array<{ x: number; y: number }>) => {
                    const formatted = (pts || []).map((p) => `(${p.x}, ${p.y})`).join("\n");
                    setSteps((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], answerValue: formatted } as WizardStep;
                      return next;
                    });
                    onAnswerChange?.(index, formatted);
                  }}
                />
              </div>
              {/* Submit to transfer points into unified input and close */}
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    const g = (current.value as GraphValue) ?? defaultGraph;
                    const pts = Array.isArray(g.points) ? g.points : [];
                    const formatted = pts.map((p) => `(${p.x}, ${p.y})`).join("\n");
                    setSteps((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], answerValue: formatted } as WizardStep;
                      return next;
                    });
                    onAnswerChange?.(index, formatted);
                    setGraphOpen(false);
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [current, index, graphOpen, graphInputs]);

  const canProceed = validateAnswer(current, current?.answerValue, index);

  // Centralized progression + feedback router
  const nextStep = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      // Finalize: compute results summary and submit
      const len = Math.min(answersSource.length, steps.length);
      const correctnessArr: boolean[] = [];
      for (let i = 0; i < len; i++) {
        const u = steps[i];
        correctnessArr.push(validateAnswer(u, u.answerValue, i));
      }
      const allCorrect = correctnessArr.length > 0 && correctnessArr.every(Boolean);
      onSubmit(steps, { correct: correctnessArr, allCorrect });
    }
  };

  const handleValidationResult = (result: "correct" | "wrong" | "aiHint" | "spam") => {
    onValidationResult?.(result);
    if (result === "correct") {
      nextStep();
    } else {
      // stay on step; optionally we could focus the input
    }
  };

  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm p-4 space-y-4", className)}>
      {/* Format-specific helpers (e.g., Graph controls + modal) */}
      {content && (
        <div className="rounded-md bg-muted p-3">{content}</div>
      )}

      {/* Unified input box */}
      {current && (
        <div className="space-y-2">
          {(() => {
            // compute dynamic classes for input based on validation/correctness
            const answer = current.answerValue ?? "";
            const isValid = validateAnswer(current, answer, index);
            const nonEmpty = answer.trim().length > 0;
            const isCorrect = correctness[index] === true;
            const isWrong = nonEmpty && !isValid && !isCorrect;
            const okClass = "border-green-500 bg-green-50 focus-visible:ring-green-500/40";
            const wrongClass = "border-red-500 bg-red-50 focus-visible:ring-red-500/40";
            const inputClasses = isCorrect ? okClass : isWrong ? wrongClass : undefined;
            return (
              <div className="relative">
                <AnswerInput
                  key={`ai-${index}`}
                  value={answer}
                  onChange={(v) => {
                    setSteps((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], answerValue: v } as WizardStep;
                      return next;
                    });
                    onAnswerChange?.(index, v);
                  }}
                  placeholder={current.placeholder || (current.type === "graph" ? "Your points will appear here..." : undefined)}
                  multiline={current.type !== "single"}
                  disabled={Boolean(inputDisabled || (correctness[index] === true && current.type !== "graph"))}
                  className={cn("pr-16", inputClasses)}
                  onSpamDetected={() => {
                    onSpamDetected?.();
                    handleValidationResult("spam");
                  }}
                />
                
                {/* Answer type dropdown button embedded in input */}
                <div className="absolute right-2 top-2">
                  <select
                    value={current.type}
                    onChange={(e) => setTypeForCurrent(e.target.value as AnswerType)}
                    className="bg-white border border-gray-300 text-xs text-muted-foreground cursor-pointer focus:outline-none rounded px-1 py-0.5"
                  >
                    <option value="single">Single</option>
                    <option value="multi">Multi</option>
                    <option value="graph">Graph</option>
                  </select>
                </div>
              </div>
            );
          })()}
          {!canProceed && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
              Answer required before continuing.
            </div>
          )}
          {correctness[index] === true && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Correct!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
