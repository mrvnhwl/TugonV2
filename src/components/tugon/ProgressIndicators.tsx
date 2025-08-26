type ProgressIndicatorsProps = {
  count?: number; // number of bars, default 4
  values?: number[]; // per-bar progress 0..1
  className?: string;
};

export default function ProgressIndicators({ count = 4, values, className }: ProgressIndicatorsProps) {
  const progress = Array.from({ length: count }).map((_, i) => Math.max(0, Math.min(1, values?.[i] ?? 0)));

  return (
    <div className={["flex items-center gap-1.5 sm:gap-2", className || ""].join(" ")}
         aria-label="Progress indicators">
      {progress.map((v, i) => (
        <div
          key={i}
          className={[
            "rounded-md ring-1 ring-black/5",
            v > 0 ? "bg-green-600" : "bg-gray-300/80",
            // compact square sizes
            "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5",
          ].join(" ")}
          aria-label={`Progress box ${i + 1}`}
        />
      ))}
    </div>
  );
}
