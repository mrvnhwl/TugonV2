import { PropsWithChildren } from "react";
import { cn } from "../cn";

type QuestionBoxProps = PropsWithChildren<{
  title?: string;
  className?: string;
}>;

export default function QuestionBox({ title, className, children }: QuestionBoxProps) {
  return (
    <section
      className={cn(
        "w-full rounded-2xl bg-white ring-1 ring-black/10 shadow-sm p-5 sm:p-6 md:p-8",
        className
      )}
    >
      {title && (
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-gray-900 text-center">
          {title}
        </h2>
      )}
      {children && <div className={title ? "mt-4" : undefined}>{children}</div>}
    </section>
  );
}
