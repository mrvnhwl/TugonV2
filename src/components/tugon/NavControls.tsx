type NavControlsProps = {
  total: number;
  index: number;
  onPrev?: () => void;
  onNext?: () => void;
  onCheck?: () => void;
};

export default function NavControls({ total, index, onPrev, onNext, onCheck }: NavControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-gray-400">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={[
              "w-2 h-2 rounded-full",
              i === index ? "bg-green-600" : "bg-gray-300",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="flex items-center gap-6">
        <button
          className="px-4 py-2 rounded-lg ring-1 ring-black/10 bg-white hover:bg-gray-50 shadow"
          onClick={onPrev}
        >
          ←
        </button>
        <button
          className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-500"
          onClick={onCheck}
        >
          Check
        </button>
        <button
          className="px-4 py-2 rounded-lg ring-1 ring-black/10 bg-white hover:bg-gray-50 shadow"
          onClick={onNext}
        >
          →
        </button>
      </div>
    </div>
  );
}
