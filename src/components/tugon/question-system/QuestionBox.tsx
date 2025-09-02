import { PropsWithChildren, useMemo } from "react";
import { cn } from "../../cn";
import { Card, CardContent } from "@/components/ui/card";
import { defaultTopics } from "../../data/question";

type QuestionBoxProps = PropsWithChildren<{
  title?: string;
  className?: string;
  // IDs to identify specific question
  topicId?: number;
  categoryId?: number;
  questionId?: number;
  // Fallback text if no IDs provided
  fallbackText?: string;
}>;

export default function QuestionBox({
  title,
  className,
  children,
  topicId,
  categoryId,
  questionId,
  fallbackText,
}: QuestionBoxProps) {
  
  // Find specific question text using the IDs
  const questionText = useMemo(() => {
    if (topicId && categoryId && questionId) {
      const topic = defaultTopics.find(t => t.id === topicId);
      if (topic) {
        const category = topic.level.find(q => q.category_id === categoryId);
        if (category) {
          const specificQuestion = category.given_question.find(gq => gq.question_id === questionId);
          return specificQuestion?.question_text;
        }
      }
    }
    return fallbackText || null;
  }, [topicId, categoryId, questionId, fallbackText]);

  return (
    <Card className={cn("w-full rounded-2xl border bg-card shadow-sm", className)}>
      <CardContent className="p-5 sm:p-6 md:p-8">
        <div className="flex flex-col">


          {questionText && (
            <div className={cn(
              "mt-3 text-xl md:text-2xl font-semibold leading-relaxed text-foreground break-words text-center mx-auto",
              title ? "mt-4" : "mt-2"
            )}>
              {questionText}
            </div>
          )}

          {children && (
            <div className={cn(
              "text-base leading-relaxed text-foreground break-words text-center mx-auto",
              (title || questionText) ? "mt-4" : "mt-2"
            )}>
              {children}
            </div>
          )}

          {!questionText && !children && (
            <div className="mt-3 text-center text-muted-foreground italic">
              No question selected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
