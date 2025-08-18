import { PropsWithChildren } from "react";
import { cn } from "../cn";

type AnswerBoxProps = PropsWithChildren<{
  className?: string;
}>;

export default function AnswerBox({ className, children }: AnswerBoxProps) {
  return (
    <div
      className={cn(
        "w-full min-h-[160px] rounded-2xl bg-white ring-1 ring-black/10 shadow-sm p-5 sm:p-6 md:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
