import React from 'react';
import { defaultTopics } from '../../data/question';
import { cn } from '../../cn'; // Add this import

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
      <div className={cn("category-question error", className)}>
        <p className="text-red-600 text-left text-xs sm:text-sm">
          Category question not found for Topic {topicId}, Category {categoryId}.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("category-question", className)}>
      {/* Responsive font sizes: xs on mobile, sm on tablet, base on desktop */}
      <p className="text-xs sm:text-sm md:text-base text-gray-600 font-bold leading-relaxed text-left">
        {categoryQuestion}
      </p>
    </div>
  );
};

export default CategoryQuestion;