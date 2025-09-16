import React from 'react';
import { defaultTopics } from '../../data/question';
import { cn } from '../../cn';
import { Text } from '../../Typography';
import { Card, CardContent } from "@/components/ui/card";
import { answersByTopicAndCategory } from '../../data/answers'; // Import your answers

interface CategoryQuestionProps {
  topicId: number;
  categoryId: number;
  className?: string;
  questionId: number;
}

const CategoryQuestion: React.FC<CategoryQuestionProps> = ({ 
  topicId,
  categoryId,
  questionId, // Make sure this prop is available
  className = ""
}) => {
  // Find the specific category
  const categoryData = React.useMemo(() => {
    const topic = defaultTopics.find(t => t.id === topicId);
    if (topic) {
      return topic.level.find(q => q.category_id === categoryId);
    }
    return null;
  }, [topicId, categoryId]);
   
  // Find the specific question to get category_text
  const questionData = React.useMemo(() => {
    if (!categoryData) return null;
    return categoryData.given_question.find(q => q.question_id === questionId);
  }, [categoryData, questionId]);

  // Extract values
  const categoryQuestion = categoryData?.category_question || null;
  const categoryText = questionData?.category_text || null; // Get from question object

  // Get the label from answers for conditional rendering
  const answerLabel = React.useMemo(() => {
    const topicAnswers = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
    if (!topicAnswers) return null;
    const categoryAnswers = topicAnswers[categoryId as keyof typeof topicAnswers];
    if (!categoryAnswers || !Array.isArray(categoryAnswers)) return null;
    return categoryAnswers[0]?.steps[0]?.label || null;
  }, [topicId, categoryId]);
   
  if (!categoryQuestion) {
    return (
      <Card className={cn("w-full max-w-fit mx-auto rounded-2xl border-2 border-red-200 bg-red-50 shadow-lg", className)}>
        <CardContent className="p-4 sm:p-5">
          <Text className="text-red-700 text-left font-semibold">
            Category question not found for Topic {topicId}, Category {categoryId}.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-auto max-w-full mx-auto rounded-2xl border-0 bg-[#5da295] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
      className
    )}>
      <CardContent className="p-5 sm:p-6 px-8 sm:px-10 relative">
        {/* Show category_text above the question if available */}
        {categoryText && (
          <div className="mb-3 text-white text-opacity-80 text-base font-medium leading-snug">
            {categoryQuestion}
          </div>
        )}
        
        {/* Conditional rendering based on label */}
        {answerLabel === "text" ? (
          <div
            key={`text-${topicId}-${categoryId}-${questionId}`} // Add key for text
            style={{
              color: "white",
              fontWeight: "bold",
              textAlign: "left",
              fontSize: "1.5rem",
              background: "transparent",
              border: "none",
              width: "100%",
              pointerEvents: "none",
              fontFamily: "Arial, sans-serif"
            }}
            className="leading-relaxed tracking-wide"
          >
            {categoryText}
          </div>
        ) : (
          <math-field
             key={`text-${topicId}-${categoryId}-${questionId}`} // Add key for text
            value={categoryText || ""}
            read-only={true}
            style={{
              color: "white",
              fontWeight: "bold",
              textAlign: "left",
              fontSize: "1.5rem",
              background: "transparent",
              border: "none",
              width: "100%",
              pointerEvents: "none",
              fontFamily: "Arial, sans-serif"
            }}
            className="leading-relaxed tracking-wide"
          ></math-field>
        )}
        
        {/* Subtle accent line */}
        <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-[#397F85] to-[#327373] rounded-full"></div>
      </CardContent>
    </Card>
  );
};

export default CategoryQuestion;