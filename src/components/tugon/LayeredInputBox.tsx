import { useEffect, useMemo, useState } from "react";
import { cn } from "../cn";

type LayeredInputBoxProps = {
  layers: string[]; // layer labels
  initialValues?: string[]; // optional defaults
  onSubmit: (values: string[]) => void;
  currentIndex?: number; // if provided, component is controlled
  onIndexChange?: (index: number) => void;
  className?: string;
  showControls?: boolean; // render internal Prev/Next/Submit
  showStepIndicator?: boolean;
  animation?: "fade" | "slide" | "flip";
};

export default function LayeredInputBox({
  layers,
  initialValues,
  onSubmit,
  currentIndex,
  onIndexChange,
  className,
  showControls = true,
  showStepIndicator = true,
  animation = "fade",
}: LayeredInputBoxProps) {
  const total = layers.length;
  const [internalIndex, setInternalIndex] = useState(0);
  const index = currentIndex ?? internalIndex;

  // values state for all layers
  const [values, setValues] = useState<string[]>(() =>
    Array.from({ length: total }).map((_, i) => initialValues?.[i] ?? "")
  );

  // keep values array length in sync if layers change
  useEffect(() => {
    setValues((prev) => {
      const next = Array.from({ length: total }).map((_, i) => prev[i] ?? "");
      return next;
    });
  }, [total]);

  const canPrev = index > 0;
  const canNext = index < total - 1;

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(total - 1, idx));
    if (currentIndex !== undefined) {
      onIndexChange?.(clamped);
    } else {
      setInternalIndex(clamped);
      onIndexChange?.(clamped);
    }
  };

  const handlePrev = () => canPrev && goTo(index - 1);
  const handleNext = () => {
    if (canNext) return goTo(index + 1);
    // last layer -> submit
    onSubmit(values);
  };

  const handleChange = (v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  // simple enter fade/slide on index change
  const [enter, setEnter] = useState(true);
  useEffect(() => {
    setEnter(false);
    const t = setTimeout(() => setEnter(true), 10);
    return () => clearTimeout(t);
  }, [index]);

  const motionClass = useMemo(() => {
    if (animation === "slide") {
      return enter
        ? "opacity-100 translate-x-0"
        : "opacity-0 translate-x-2";
    }
    if (animation === "flip") {
      return enter
        ? "opacity-100 [transform:rotateY(0deg)]"
        : "opacity-0 [transform:rotateY(90deg)]";
    }
    // fade
    return enter ? "opacity-100" : "opacity-0";
  }, [animation, enter]);

  return (
    <div className={cn("bg-white rounded-xl shadow ring-1 ring-black/10 p-4 sm:p-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">
          {layers[index]}
        </label>
        {showStepIndicator && (
          <div className="text-xs text-gray-500">
            Layer {index + 1} of {total}
          </div>
        )}
      </div>

      <div className="[perspective:1000px]">
        <div
          className={cn(
            "transform transition-all duration-300 [backface-visibility:hidden] origin-left",
            motionClass
          )}
          key={index}
        >
          <textarea
            className="w-full min-h-32 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-3 py-2 text-gray-900 resize-y"
            placeholder={layers[index]}
            value={values[index] ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            rows={5}
          />
        </div>
      </div>

      {showControls && (
        <div className="mt-4 flex items-center justify-between">
          <button
            className="px-4 py-2 rounded-lg ring-1 ring-black/10 bg-white hover:bg-gray-50 disabled:opacity-50"
            onClick={handlePrev}
            disabled={!canPrev}
          >
            Prev
          </button>

          {canNext ? (
            <button
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-500"
              onClick={() => onSubmit(values)}
            >
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
