import { PropsWithChildren, useMemo } from "react";
import { cn } from "../../cn";
import { defaultTopics } from "../../data/question";
import { SubHeading, Text, Small } from "../../Typography";

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
    <div className={cn("w-full p-5 sm:p-6 md:p-8 mt-8 sm:mt-10 md:mt-12 mb-4 sm:mb-5 md:mb-6", className)} role="region" aria-label="Question content">
      <div className="flex flex-col max-w-reading mx-auto">

        {questionText && (
          <div className={cn(
            "mt-6 mb-3 sm:mt-8 sm:mb-4 md:mt-10 md:mb-5 text-center mx-auto",
            title ? "mt-6 sm:mt-8 md:mt-10" : "mb-3 sm:mb-4 md:mb-5"
          )}>
            <SubHeading className="font-semibold leading-relaxed text-foreground break-words text-fluid-lg sm:text-fluid-xl lg:text-2xl">
              {questionText}
            </SubHeading>
          </div>
        )}

        {children && (
          <div className={cn(
            "text-center mx-auto mt-6 mb-3 sm:mt-8 sm:mb-4",
            (title || questionText) ? "mt-6 sm:mt-8" : "mt-4"
          )}>
            <Text className="leading-relaxed text-foreground break-words text-fluid-base sm:text-fluid-lg">
              {children}
            </Text>
          </div>
        )}

        {!questionText && !children && (
          <div className="mt-6 mb-3 sm:mt-8 sm:mb-4 text-center">
            <Small className="text-muted-foreground italic">
              No question selected
            </Small>
          </div>
        )}
      </div>
    </div>
  );
}