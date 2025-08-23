import { useMemo, useRef, useState } from "react";
import type { PredefinedAnswer } from "@/components/data/answers";
import { cn } from "../cn";
import GraphAnswerComp, { GraphValue } from "./answers/GraphAnswer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ActivitySquare, AlignLeft, ChevronLeft, ChevronRight, MinusCircle, PlusCircle, Type as TypeIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Allowed answer types
export type AnswerType = "single" | "multi" | "graph";

// Public input step shape (for initializing the wizard)
export type Step = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type?: AnswerType;
  value?: string | GraphValue;
};

// Internal state shape that the wizard manages
export type WizardStep = {
  id: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  type: AnswerType;
  value: string | GraphValue;
};

type AnswerWizardProps = {
  steps?: Step[]; // treated as initial/hydration
  predefinedAnswers?: PredefinedAnswer[];
  onSubmit: (steps: WizardStep[], result?: { correct: boolean[]; allCorrect: boolean }) => void;
  className?: string;
};

// Child components (accept { value, onChange, step })
type ChildProps<T = any> = {
  value: T;
  onChange: (v: T) => void;
  step: WizardStep | Step;
};

function SingleLineAnswer({ value, onChange, step }: ChildProps<string>) {
  return (
    <div className="space-y-2">
      {step?.label && (
        <div className="text-sm font-medium text-foreground">{step.label}</div>
      )}
      <Input
        type="text"
        placeholder={(step as any)?.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MultiLineAnswer({ value, onChange, step }: ChildProps<string>) {
  return (
    <div className="space-y-2">
      {step?.label && (
        <div className="text-sm font-medium text-foreground">{step.label}</div>
      )}
      <Textarea
        rows={(step as any)?.rows ?? 3}
        placeholder={(step as any)?.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const defaultGraph: GraphValue = { xLimit: null, yLimit: null, points: [] };
const defaultFor = (t: AnswerType): string | GraphValue => (t === "graph" ? defaultGraph : "");

export default function AnswerWizard({ steps: initialSteps = [], predefinedAnswers, onSubmit, className }: AnswerWizardProps) {
  // Initialize steps from props or start with one default step
  const [steps, setSteps] = useState<WizardStep[]>(
    () => (initialSteps.length ? initialSteps : [{ id: "s1" }]).map((s, i) => ({
      id: s.id ?? `s${i + 1}`,
      label: s.label,
      placeholder: s.placeholder,
      rows: s.rows,
      type: s.type ?? "single",
      value: s.value ?? defaultFor(s.type ?? "single"),
    }))
  );
  const [index, setIndex] = useState(0);
  const idCounter = useRef(steps.length + 1);

  const total = steps.length;
  const current = steps[index];

  // Compute the debuggable "storedAnswers" payload
  const computeStoredAnswers = (arr: WizardStep[]): { type: AnswerType; answer: string }[] =>
    arr.map((s) => {
      if (s.type === "graph") {
        const g = s.value as GraphValue;
        const pts = (g.points || []).map((p) => `(${p.x},${p.y})`).join(";");
        return { type: s.type, answer: `points:${pts}` };
      }
      const str = (s.value as string) ?? "";
      // strip spaces/newlines for consistency in logs
      return { type: s.type, answer: str.replace(/[\s\n\r]+/g, "") };
    });

  const setTypeForCurrent = (t: AnswerType) => {
    if (!current) return;
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], type: t, value: defaultFor(t) };
      return next;
    });
  };

  const updateCurrentValue = (value: any) => {
    if (!current) return;
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };

  const addStep = () => {
    const newId = `s${idCounter.current++}`;
    setSteps((prev) => [...prev, { id: newId, type: "single", value: "" }]);
    setIndex((prevIndex) => Math.min(prevIndex + 1, total));
  };

  const [openRemove, setOpenRemove] = useState(false);
  const confirmRemove = () => {
    if (!current) return;
    setSteps((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ id: `s${idCounter.current++}`, type: "single", value: "" }];
    });
    setIndex((prevIndex) => Math.max(0, Math.min(prevIndex, total - 2)));
    setOpenRemove(false);
  };

  const content = useMemo(() => {
    if (!current) return <div className="text-sm text-gray-500">No steps yet.</div>;
    switch (current.type) {
      case "single":
        return (
          <SingleLineAnswer step={current} value={(current.value as string) ?? ""} onChange={updateCurrentValue} />
        );
      case "multi":
        return (
          <MultiLineAnswer step={current} value={(current.value as string) ?? ""} onChange={updateCurrentValue} />
        );
      case "graph":
        return (
          <GraphAnswerComp
            step={current}
            value={(current.value as GraphValue) ?? defaultGraph}
            onChange={updateCurrentValue}
          />
        );
      default:
        return null;
    }
  }, [current]);

  const canPrev = index > 0;
  const canNext = index < Math.max(0, total - 1);

  const goPrev = () => {
    if (canPrev) setIndex(index - 1);
  };
  const goNext = () => {
    if (canNext) setIndex(index + 1);
    else handleSubmit();
  };

  const sanitize = (t: AnswerType, v: string | GraphValue): string => {
    if (t === "graph") {
      // naive serialization for comparison; you may replace with a robust serializer later
      const g = v as GraphValue;
      const pts = (g.points || [])
        .map((p) => `(${p.x},${p.y})`)
        .join(";");
      return `points:${pts}`;
    }
    // strip spaces & newlines for text inputs
    const s = (v as string) ?? "";
    return s.replace(/[\s\n\r]+/g, "");
  };

  const handleSubmit = () => {
    if (!predefinedAnswers || predefinedAnswers.length === 0) {
      const storedAnswers = computeStoredAnswers(steps);
      if (import.meta.env.DEV) console.log("Final collected answers:", storedAnswers);
      onSubmit(steps);
      return;
    }
    const storedAnswers = computeStoredAnswers(steps);
    if (import.meta.env.DEV) console.log("Final collected answers:", storedAnswers);
    const len = Math.min(predefinedAnswers.length, steps.length);
    const correctness: boolean[] = [];
    for (let i = 0; i < len; i++) {
      const user = steps[i];
      const expected = predefinedAnswers[i];
      // map multiLine to our internal 'multi'
      const expectedType = expected.type === "multiLine" ? "multi" : expected.type;
      const typeMatches = user.type === expectedType;
      const userSan = sanitize(user.type, user.value);
      const expSan = expected.answer.replace(/[\s\n\r]+/g, "");
      const answerMatches = userSan === expSan;
      correctness.push(typeMatches && answerMatches);
    }
    const allCorrect = correctness.length > 0 && correctness.every(Boolean);
    onSubmit(steps, { correct: correctness, allCorrect });
  };

  return (
    <Card className={cn("rounded-2xl border bg-card shadow-sm", className)}>
  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{current?.label ?? "Answer"}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Step <span className="text-primary font-medium">{total ? index + 1 : 0}</span> of {total}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={addStep}
                  aria-label="Add a new step"
                  className="text-muted-foreground hover:text-primary transition-colors rounded-xl"
                >
                  <PlusCircle />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new step</TooltipContent>
            </Tooltip>
            <Dialog open={openRemove} onOpenChange={setOpenRemove}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!current}
                      aria-label="Remove current step"
                      className="text-muted-foreground hover:text-primary transition-colors rounded-xl"
                    >
                      <MinusCircle />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Remove current step</TooltipContent>
              </Tooltip>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove this step?</DialogTitle>
                  <DialogDescription>
                    This action will delete the current step and its answer. You can’t undo this.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenRemove(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmRemove}>Remove</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Answer type selection */}
        {current && (
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
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
          </div>
        )}

        {/* Input area */}
  <div className="rounded-md bg-muted p-3">
          {content}
        </div>

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
            />)
          )}
        </div>

        {/* Navigation buttons below the indicator */}
  <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={!canPrev}
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
