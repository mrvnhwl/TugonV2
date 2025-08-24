import { useEffect, useMemo, useState } from "react";
import { predefinedAnswers as predefinedAnswersData } from "@/components/data/answers";
import { cn } from "../cn";
import GraphAnswerComp, { GraphValue } from "./answers/GraphAnswer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ActivitySquare, AlignLeft, ChevronLeft, ChevronRight, Type as TypeIcon, CheckCircle } from "lucide-react";

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
};

// Child components (accept { value, onChange, step })
// (removed old format-specific input components in favor of one unified input)

const defaultGraph: GraphValue = { xLimit: null, yLimit: null, points: [] };

// (reverted) No tolerance-based comparing here; graph answers are compared as text from the textarea

export default function AnswerWizard({ steps: _initialSteps = [], onSubmit, className, onIndexChange }: AnswerWizardProps) {
  // Fixed steps derived strictly from predefinedAnswers in data/answers.ts
  const fixedSteps: WizardStep[] = (predefinedAnswersData || []).map((a, i) => {
    const t: AnswerType = a.type === "multiLine" ? "multi" : (a.type as any);
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

  // Compute the debuggable "storedAnswers" payload
  const computeStoredAnswers = (arr: WizardStep[]): { type: AnswerType; answer: string }[] =>
    arr.map((s) => {
      const str = s.answerValue ?? "";
      return { type: s.type, answer: str.replace(/[\s\n\r]+/g, "") };
    });

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
    const expected = predefinedAnswersData?.[stepIndex]?.answer;
    if (!expected) {
      // Fallback: if no expected is defined, consider non-empty as valid
      return a.length > 0;
    }
    // Graph specific minimum validity: at least one plotted point or a valid (x,y) text
    if (step.type === "graph") {
      const hasPlotted = Array.isArray(step.value?.points) && step.value.points.length > 0;
      const hasCoordText = /\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)/.test(a);
      if (!hasPlotted && !hasCoordText) return false;
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
                <GraphAnswerComp
                  step={current}
                  value={(current.value as GraphValue) ?? defaultGraph}
                  onChange={updateCurrentGraphValue}
                  hideControls
                  onPointsCommit={(pts) => {
                    const formatted = (pts || []).map((p) => `(${p.x}, ${p.y})`).join("\n");
                    setSteps((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], answerValue: formatted } as WizardStep;
                      return next;
                    });
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

  const canPrev = index > 0;
  const canNext = index < Math.max(0, total - 1);
  const canProceed = validateAnswer(current, current?.answerValue, index);

  const goPrev = () => {
    if (canPrev) setIndex(index - 1);
  };
  const goNext = () => {
    if (canNext) setIndex(index + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    // Evaluate all steps each time: mark correct inputs across the wizard
    if (!predefinedAnswersData || predefinedAnswersData.length === 0) {
      const storedAnswers = computeStoredAnswers(steps);
      if (import.meta.env.DEV) console.log("Final collected answers:", storedAnswers);
      onSubmit(steps);
      return;
    }
    const len = Math.min(predefinedAnswersData.length, steps.length);
    const nextCorrectness: Array<boolean | null> = [...correctness];
    const correctnessArr: boolean[] = [];
    for (let i = 0; i < len; i++) {
      const u = steps[i];
      // Use unified validator for all steps
      const isCorrect = validateAnswer(u, u.answerValue, i);
      correctnessArr.push(isCorrect);
      if (import.meta.env.DEV) {
        console.log("Validated step", i + 1, "=>", isCorrect);
      }
      // Mark correct or incorrect; correct ones will lock via UI, incorrect stay editable
      nextCorrectness[i] = isCorrect ? true : false;
    }
    setCorrectness(nextCorrectness);
    const allCorrect = correctnessArr.length > 0 && correctnessArr.every(Boolean);
    onSubmit(steps, { correct: correctnessArr, allCorrect });
  };

  return (
    <Card className={cn("rounded-2xl border bg-card shadow-sm", className)}>
  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{current?.label ?? "Answer"}</CardTitle>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Answer type toggles moved to header right side */}
          {current && (
            <div className="flex items-center gap-2 flex-wrap">
              <Toggle
                pressed={current.type === "single"}
                onPressedChange={(on) => on && setTypeForCurrent("single")}
                aria-label="Single line"
              >
                <TypeIcon className="mr-2" /> Single
              </Toggle>
              <Toggle
                pressed={current.type === "multi"}
                onPressedChange={(on) => on && setTypeForCurrent("multi")}
                aria-label="Multi line"
              >
                <AlignLeft className="mr-2" /> MultiLine
              </Toggle>
              <Toggle
                pressed={current.type === "graph"}
                onPressedChange={(on) => on && setTypeForCurrent("graph")}
                aria-label="Graph"
              >
                <ActivitySquare className="mr-2" /> Graph
              </Toggle>
            </div>
          )}
          <div className="flex items-center gap-2 whitespace-nowrap" aria-live="polite">
            <span className="text-[13px] md:text-sm text-muted-foreground">Step</span>
            <span className="text-primary font-bold text-base md:text-lg leading-none">{total ? index + 1 : 0}</span>
            <span className="text-[13px] md:text-sm text-muted-foreground">of {total}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format-specific helpers (e.g., Graph controls + modal) */}
        {content && (
          <div className="rounded-md bg-muted p-3">{content}</div>
        )}

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-2 px-2 overflow-x-auto max-w-full">
          {steps.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                i === index ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Unified input box below the step indicator */}
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
                <>
                  {current.type === "single" ? (
                    <Input
                      type="text"
                      placeholder={current.placeholder}
                      value={answer}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSteps((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], answerValue: v } as WizardStep;
                          return next;
                        });
                      }}
                      disabled={correctness[index] === true}
                      className={inputClasses}
                    />
                  ) : (
                    <Textarea
                      rows={current.rows ?? 3}
                      placeholder={current.placeholder || (current.type === "graph" ? "Your points will appear here..." : undefined)}
                      value={answer}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSteps((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], answerValue: v } as WizardStep;
                          return next;
                        });
                      }}
                      disabled={correctness[index] === true && current.type !== "graph"}
                      className={inputClasses}
                    />
                  )}
                </>
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

        {/* Navigation buttons below the indicator */}
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={false}
            aria-label="Go to previous step"
            className="rounded-xl hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            className="rounded-xl"
            aria-label="Check answers"
          >
            Check
          </Button>
          <Button
            variant="secondary"
            onClick={goNext}
            aria-label={canNext ? "Go to next step" : "Submit answers"}
            disabled={!canProceed}
            className="rounded-xl hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight />
            <span className="sr-only">{canNext ? "Next" : "Submit"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
