import ProgressIndicators from "./ProgressIndicators";

type TugonPlayNavProps = {
  coins: number;
  onExit: () => void;
  progressValues?: number[]; // optional per-bar fill 0..1
};

export default function TugonPlayNav({ coins, onExit, progressValues }: TugonPlayNavProps) {
  return (
    <nav className="sticky top-0 z-20 w-full bg-white ring-1 ring-black/10 shadow">
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between gap-4">
        {/* Exit button */}
        <button
          aria-label="Exit"
          className="text-2xl leading-none px-2 py-1 rounded-lg hover:bg-gray-100"
          onClick={onExit}
        >
          ×
        </button>

        {/* Center progress indicators */}
        <div className="flex-1 flex items-center justify-center">
          <ProgressIndicators values={progressValues} />
        </div>

        {/* Coin indicator */}
        <div className="flex items-center gap-2 min-w-[64px] justify-end">
          <div className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 shadow-inner" />
          <span className="text-sm font-semibold text-gray-800">{coins}</span>
        </div>
      </div>
    </nav>
  );
}
