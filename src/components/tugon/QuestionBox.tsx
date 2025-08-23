import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { cn } from "../cn";
import { Card, CardContent } from "@/components/ui/card";

export type Question = { id: number; text: string };
export type Topic = { id: number; name: string; questions: Question[] };

// Default topics with 1 placeholder question each
export const defaultTopics: Topic[] = [
  "Introduction to Functions",
  "Evaluating Functions",
  "Piecewise-Defined Functions",
  "Operations on Functions",
  "Composition of Functions",
  "Rational Functions",
  "Graphing Rational Functions",
  "Rational Equations and Inequalities",
  "Inverse Functions",
  "Exponential Functions",
  "Logarithmic Functions",
].map((name, idx) => ({
  id: idx + 1,
  name,
  questions: [
    {
      id: 1,
  text: "If f(x) = x + 2 and g(x) = x - 1, what is (f + g)(x)?",
    },
  ],
}));

type QuestionBoxProps = PropsWithChildren<{
  title?: string;
  className?: string;
  // When true, renders the topics list; otherwise behaves like a plain container
  showTopics?: boolean;
  // Optional initial topics; defaults to defaultTopics
  initialTopics?: Topic[];
  // Notify parent when topics change (useful if you add editing later)
  onTopicsChange?: (topics: Topic[]) => void;
}>;

export default function QuestionBox({
  title,
  className,
  children,
  showTopics = false,
  initialTopics,
  onTopicsChange,
}: QuestionBoxProps) {
  const [topics, setTopics] = useState<Topic[]>(() => initialTopics ?? defaultTopics);

  // Keep parent informed of topic state changes (if callback provided)
  useEffect(() => {
    onTopicsChange?.(topics);
  }, [topics, onTopicsChange]);

  // Respond to external changes to initialTopics
  useEffect(() => {
    if (initialTopics) setTopics(initialTopics);
  }, [initialTopics]);

  // For rendering, ensure each topic has at least one placeholder
  const topicsToRender = useMemo(() => {
    return topics.map((t) =>
      t.questions && t.questions.length > 0
        ? t
        : { ...t, questions: [{ id: 1, text: `Placeholder: A sample question for ${t.name}` }] }
    );
  }, [topics]);

  return (
    <Card className={cn("w-full rounded-2xl border bg-card shadow-sm", className)}>
      <CardContent className="p-5 sm:p-6 md:p-8">
        <div className="flex flex-col">
          {title && (
            <h3 className="text-xs md:text-sm font-semibold text-foreground">
              {title}
            </h3>
          )}

          {children && (
            <div className={cn("mt-3 text-base leading-relaxed text-foreground break-words text-center mx-auto")}>{children}</div>
          )}

          {showTopics && (
            <div className={cn(title ? "mt-6" : "mt-2")}> 
              <div className="text-sm text-muted-foreground mb-3">Topics and placeholder questions</div>
              <ul className="space-y-4">
                {topicsToRender.map((topic) => (
                  <li key={topic.id} className="rounded-lg border p-4 bg-muted/50">
                    <div className="font-semibold text-foreground">{topic.name}</div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-foreground/90">
                      {topic.questions.slice(0, 1).map((q) => (
                        <li key={q.id}>{q.text}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
