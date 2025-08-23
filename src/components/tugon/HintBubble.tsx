import { PropsWithChildren } from "react";

type HintBubbleProps = PropsWithChildren<{
  className?: string;
}>;

export default function HintBubble({ children, className }: HintBubbleProps) {
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <div className="inline-flex items-center justify-center rounded-2xl bg-white ring-1 ring-black/10 shadow-sm p-3 text-gray-900 font-bold text-lg text-center">
        {children}
      </div>
    </div>
  );
}
