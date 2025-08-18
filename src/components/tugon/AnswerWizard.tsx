import { useMemo, useState } from "react";
import { cn } from "../cn";
import GraphAnswerComp, { GraphValue } from "./answers/GraphAnswer";

// Types per spec
export type AnswerType = "single" | "multi" | "mcq" | "graph";

export type Step = {
  id: string;
  type: AnswerType;
  label: string;
  placeholder?: string;
  options?: string[];
  multiple?: boolean;
  rows?: number;
};

type AnswerWizardProps = {
  steps: Step[];
  onSubmit: (answers: Record<string, any>) => void;
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

function MultiChoiceAnswer({ value, onChange, step }: ChildProps<string | string[]>) {
  const multiple = !!step.multiple;
  const options = step.options ?? [];

  const toggle = (opt: string) => {
    if (!multiple) return onChange(opt);
    const arr = Array.isArray(value) ? value : [];
    if (arr.includes(opt)) onChange(arr.filter((v) => v !== opt));
    else onChange([...arr, opt]);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">{step.label}</div>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type={multiple ? "checkbox" : "radio"}
              name={step.id}
              value={opt}
              className="h-4 w-4"
              checked={multiple ? Array.isArray(value) && value.includes(opt) : value === opt}
              onChange={() => toggle(opt)}
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}


export default function AnswerWizard({ steps, onSubmit, className }: AnswerWizardProps) {
  // answers keyed by step.id
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [index, setIndex] = useState(0);

  const total = steps.length;
  const current = steps[index];

  const update = (id: string, value: any) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const valueFor = (s: Step) => {
    switch (s.type) {
      case "single":
      case "multi":
        return (answers[s.id] ?? "") as string;
      case "mcq": {
        const def = s.multiple ? [] : "";
        return answers[s.id] ?? def;
      }
      case "graph":
        return (answers[s.id] ?? { xLimit: null, yLimit: null, points: [] }) as GraphValue;
      default:
        return answers[s.id];
    }
  };

  const content = useMemo(() => {
    if (!current) return null;
    const common = { step: current } as const;
    switch (current.type) {
      case "single":
        return (
          <SingleLineAnswer
            {...common}
            value={valueFor(current) as string}
            onChange={(v) => update(current.id, v)}
          />
        );
      case "multi":
        return (
          <MultiLineAnswer
            {...common}
            value={valueFor(current) as string}
            onChange={(v) => update(current.id, v)}
          />
        );
      case "mcq":
        return (
          <MultiChoiceAnswer
            {...common}
            value={valueFor(current) as any}
            onChange={(v) => update(current.id, v)}
          />
        );
    case "graph": {
        const val = valueFor(current) as GraphValue;
        return (
      <GraphAnswerComp
            {...common}
            step={current}
            value={val}
            onChange={(v) => update(current.id, v)}
          />
        );
      }
      default:
        return null;
    }
  }, [current, answers]);

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
