// Replace your existing QuestionBox component with this updated version:

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
  
  // Find specific question data using the IDs
  const questionData = useMemo(() => {
    if (topicId && categoryId && questionId) {
      const topic = defaultTopics.find(t => t.id === topicId);
      if (topic) {
        const category = topic.level.find(q => q.category_id === categoryId);
        if (category) {
          const specificQuestion = category.given_question.find(gq => gq.question_id === questionId);
          return specificQuestion;
        }
      }
    }
    return null;
  }, [topicId, categoryId, questionId]);

  const questionText = questionData?.question_text || fallbackText || null;
  const imageUrl = questionData?.image_url;
  const imageAlt = questionData?.image_alt;

  // ADD THIS CONDITION: If there's an image, prioritize it over text
  const hasImage = Boolean(imageUrl);
  const showText = !hasImage && Boolean(questionText);

  return (
    <div className={cn("w-full p-5 sm:p-6 md:p-8 mt-8 sm:mt-10 md:mt-12 mb-4 sm:mb-5 md:mb-6", className)} role="region" aria-label="Question content">
      <div className="flex flex-col max-w-reading mx-auto">

        {/* MODIFIED: Only show text if there's NO image */}
        {showText && (
          <div className={cn(
            "mt-6 mb-3 sm:mt-8 sm:mb-4 md:mt-10 md:mb-5 text-center mx-auto",
            title ? "mt-6 sm:mt-8 md:mt-10" : "mb-3 sm:mb-4 md:mb-5"
          )}>
            <SubHeading className="font-semibold leading-relaxed text-foreground break-words text-fluid-lg sm:text-fluid-xl lg:text-2xl">
              {questionText}
            </SubHeading>
          </div>
        )}

        {/* SHOW IMAGE (this takes priority over text) */}
        {hasImage && (
          <div className={cn(
            "mt-4 mb-6 sm:mt-6 sm:mb-8 text-center mx-auto",
            "max-w-reading" // Same constraint as question text
          )}>
            <div className="relative w-full">
              <img 
                src={imageUrl}
                alt={imageAlt || 'Question diagram'}
                className={cn(
                  // Match the question text container sizing
                  "w-full max-h-80 object-contain", // Full width of container, constrained height
                  "rounded-lg border shadow-sm",
                  "transition-opacity duration-200",
                  "bg-gray-50"
                )}
                onError={(e) => {
                  console.error('❌ Failed to load question image:', imageUrl);
                  e.currentTarget.style.display = 'none';
                  
                  // Show error message in same container style
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-red-500 text-sm p-4 border border-red-300 rounded bg-red-50 w-full';
                  errorDiv.textContent = `Failed to load image: ${imageUrl?.split('/').pop()}`;
                  e.currentTarget.parentNode?.replaceChild(errorDiv, e.currentTarget);
                }}
                onLoad={(e) => {
                  console.log('✅ Image loaded:', imageUrl);
                  e.currentTarget.classList.add('opacity-100');
                }}
                loading="lazy"
              />
              
              {/* Caption matches text styling */}
              {imageAlt && (
                <div className="mt-3 text-sm text-gray-600 italic text-center">
                  {imageAlt}
                </div>
              )}
            </div>
          </div>
        )}

        {children && (
          <div className={cn(
            "text-center mx-auto mt-6 mb-3 sm:mt-8 sm:mb-4",
            (title || showText) ? "mt-6 sm:mt-8" : "mt-4"
          )}>
            <Text className="leading-relaxed text-foreground break-words text-fluid-base sm:text-fluid-lg">
              {children}
            </Text>
          </div>
        )}

        {/* UPDATED: Show fallback only if no image AND no text AND no children */}
        {!showText && !children && !hasImage && (
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