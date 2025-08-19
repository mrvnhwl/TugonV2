import { useMemo, useState } from "react";
import { cn } from "../cn";
import GraphAnswerComp, { GraphValue } from "./answers/GraphAnswer";

// Allowed answer types (MCQ removed by spec change)
export type AnswerType = "single" | "multi" | "graph";

export type Step = {
  id: string;
  label: string;
  placeholder?: string;
  rows?: number;
};

type AnswerValue = { type: AnswerType; value: any };

type AnswerWizardProps = {
  steps: Step[];
  onSubmit: (answers: Record<string, AnswerValue>) => void;
  className?: string;
};

// Child components (defined in-file) — accept { value, onChange, step }
type ChildProps<T = any> = {
  value: T;
  onChange: (v: T) => void;
  step: Step;
};

function SingleLineAnswer({ value, onChange, step }: ChildProps<string>) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{step.label}</label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={step.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MultiLineAnswer({ value, onChange, step }: ChildProps<string>) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{step.label}</label>
      <textarea
        rows={step.rows ?? 3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        placeholder={step.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// MCQ removed


export default function AnswerWizard({ steps, onSubmit, className }: AnswerWizardProps) {
  // answers keyed by step.id: { type, value }
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [index, setIndex] = useState(0);
  // per-step selected type
  const [selectedType, setSelectedType] = useState<Record<string, AnswerType>>({});

  const total = steps.length;
  const current = steps[index];

  const defaultGraph: GraphValue = { xLimit: null, yLimit: null, points: [] };
  const defaultFor = (t: AnswerType) => (t === "graph" ? defaultGraph : "");

  // (init handled inline when rendering)

  const setTypeForStep = (id: string, t: AnswerType) => {
    setSelectedType((prev) => ({ ...prev, [id]: t }));
    // reset value to default on type change
    setAnswers((prev) => ({ ...prev, [id]: { type: t, value: defaultFor(t) } }));
  };

  const updateValue = (id: string, t: AnswerType, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: { type: t, value } }));
  };

  // compute selected type for current step (default single)
  const currentType: AnswerType | null = current ? selectedType[current.id] ?? "single" : null;

  const content = useMemo(() => {
    if (!current || !currentType) return null;
    const common = { step: current } as const;
    // Make sure answer slot exists
    // Note: this runs during render; it's safe because setState is batched but to avoid render loops,
    // we gate by checking existing first.
    const existing = answers[current.id];
    if (!existing || existing.type !== currentType) {
      // initialize synchronously via effect-like guard
      setAnswers((prev) => ({ ...prev, [current.id]: { type: currentType, value: defaultFor(currentType) } }));
    }

    switch (currentType) {
      case "single":
        return (
          <SingleLineAnswer
            {...common}
            value={(answers[current.id]?.value as string) ?? ""}
            onChange={(v) => updateValue(current.id, "single", v)}
          />
        );
      case "multi":
        return (
          <MultiLineAnswer
            {...common}
            value={(answers[current.id]?.value as string) ?? ""}
            onChange={(v) => updateValue(current.id, "multi", v)}
          />
        );
      case "graph":
        return (
          <GraphAnswerComp
            {...common}
            value={(answers[current.id]?.value as GraphValue) ?? defaultGraph}
            onChange={(v) => updateValue(current.id, "graph", v)}
          />
        );
      default:
        return null;
    }
  }, [current, currentType, answers]);

  const canPrev = index > 0;
  const canNext = index < total - 1;

  const goPrev = () => {
    if (canPrev) setIndex(index - 1);
  };
  const goNext = () => {
    if (canNext) setIndex(index + 1);
    else onSubmit(answers);
  };

  return (
    <div className={cn("bg-white rounded-xl shadow ring-1 ring-black/10 p-4 sm:p-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-700">{current?.label ?? "Answer"}</div>
        <div className="text-xs text-gray-500">Step {Math.min(index + 1, total)} of {total}</div>
      </div>

      {/* Type selector */}
      {current && (
        <div className="mb-3 flex items-center gap-3 text-sm">
          <span className="text-gray-600">Answer type:</span>
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name={`atype-${current.id}`}
              value="single"
              checked={currentType === "single"}
              onChange={() => setTypeForStep(current.id, "single")}
            />
            <span>Single</span>
          </label>
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name={`atype-${current.id}`}
              value="multi"
              checked={currentType === "multi"}
              onChange={() => setTypeForStep(current.id, "multi")}
            />
            <span>MultiLine</span>
          </label>
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name={`atype-${current.id}`}
              value="graph"
              checked={currentType === "graph"}
              onChange={() => setTypeForStep(current.id, "graph")}
            />
            <span>Graph</span>
          </label>
        </div>
      )}

      {content}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="px-4 py-2 rounded-lg ring-1 ring-black/10 disabled:opacity-50"
          onClick={goPrev}
          disabled={!canPrev}
        >
          Prev
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          onClick={goNext}
        >
          {canNext ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
}
