import { PropsWithChildren } from "react";

export default function HintBubble({ children }: PropsWithChildren) {
  return (
    <div className="relative inline-block max-w-xs sm:max-w-sm md:max-w-md">
      <div className="rounded-2xl bg-white ring-1 ring-black/10 shadow-sm px-4 py-3 text-gray-900 font-bold text-lg">
        {children}
      </div>
      <div className="absolute -right-2 top-6 w-4 h-4 rotate-45 bg-white ring-1 ring-black/10" />
    </div>
  );
}
