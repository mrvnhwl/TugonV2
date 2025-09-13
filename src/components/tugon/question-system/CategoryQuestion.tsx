import React from 'react';
import { defaultTopics } from '../../data/question';
import { cn } from '../../cn';
import { Text } from '../../Typography';
import { Card, CardContent } from "@/components/ui/card";

interface CategoryQuestionProps {
  topicId: number;
  categoryId: number;
  className?: string;
}

const CategoryQuestion: React.FC<CategoryQuestionProps> = ({ 
  topicId,
  categoryId,
  className = ""
}) => {
  // Find the specific category question using topicId and categoryId
  const categoryQuestion = React.useMemo(() => {
    const topic = defaultTopics.find(t => t.id === topicId);
    if (topic) {
      const category = topic.level.find(q => q.category_id === categoryId);
      return category?.category_question;
    }
    return null;
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
    {/* Main text with enhanced styling */}
    <Text className="text-white font-bold text-left leading-relaxed text-fluid-sm sm:text-fluid-base tracking-wide">
      {categoryQuestion}
    </Text>
    {/* Subtle accent line */}
    <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-[#397F85] to-[#327373] rounded-full"></div>
  </CardContent>
</Card>
  );
};

export default CategoryQuestion;