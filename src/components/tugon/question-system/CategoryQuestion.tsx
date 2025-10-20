import React from 'react';

import { cn } from '../../cn';
import { Text } from '../../Typography';
import { Card, CardContent } from "@/components/ui/card";
import { answersByTopicAndCategory } from '../../data/answers/index';
import { convertToLatex } from './mathConverter';
import { fetchCategoryQuestionData } from '@/lib/supabaseCategories';

interface CategoryQuestionProps {
  topicId: number;
  categoryId: number;
  className?: string;
  questionId: number;
}

const CategoryQuestion: React.FC<CategoryQuestionProps> = ({ 
  topicId,
  categoryId,
  questionId,
  className = ""
}) => {
  const [mathKey, setMathKey] = React.useState(0);
  const [isMathLiveReady, setIsMathLiveReady] = React.useState(false);
  const mathFieldRef = React.useRef<any>(null);
  
  // ✨ NEW: State for Supabase data
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryQuestion, setCategoryQuestion] = React.useState<string | null>(null);
  const [categoryText, setCategoryText] = React.useState<string | null>(null);
  const [questionText, setQuestionText] = React.useState<string>('');
  const [answerType, setAnswerType] = React.useState<'multiLine' | 'singleLine' | null>(null);

  // ✨ NEW: Fetch data from Supabase on mount or when IDs change
  React.useEffect(() => {
    let isMounted = true;
    
    const loadQuestionData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔄 Loading question data from Supabase: Topic ${topicId}, Category ${categoryId}, Question ${questionId}`);
        
        const data = await fetchCategoryQuestionData(topicId, categoryId, questionId);
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        if (data) {
          setCategoryQuestion(data.categoryQuestion);
          setCategoryText(data.categoryText);
          setQuestionText(data.questionText);
          setAnswerType(data.answerType);
          console.log('✅ Loaded question data from Supabase:', {
            categoryQuestion: data.categoryQuestion,
            categoryText: data.categoryText,
            questionText: data.questionText,
            answerType: data.answerType
          });
        } else {
          console.warn('⚠️ No data found, falling back to hardcoded data');
          // Fallback to hardcoded data
          //loadFallbackData();
        }
      } catch (err) {
        console.error('❌ Error loading from Supabase, using fallback:', err);
        if (isMounted) {
          setError('Failed to load question from database');
          // Fallback to hardcoded data
          //loadFallbackData();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    /*const loadFallbackData = () => {
      // Fallback to hardcoded data if Supabase fails
      const topic = defaultTopics.find(t => t.id === topicId);
      if (topic) {
        const category = topic.level.find(q => q.category_id === categoryId);
        if (category) {
          const question = category.given_question.find(q => q.question_id === questionId);
          setCategoryQuestion(category.category_question || null);
          setCategoryText(question?.category_text || null);
          setQuestionText(question?.question_text || '');
        }
      }
    }; */

    loadQuestionData();
    
    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [topicId, categoryId, questionId]);

  // Get the label from answers for conditional rendering
  const answerLabel = React.useMemo(() => {
    const topicAnswers = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
    if (!topicAnswers) return null;
    const categoryAnswers = topicAnswers[categoryId as keyof typeof topicAnswers];
    if (!categoryAnswers || !Array.isArray(categoryAnswers)) return null;
    return categoryAnswers[0]?.steps[0]?.label || null;
  }, [topicId, categoryId]);

  const formattedCategoryText = React.useMemo(() => {
    if (!categoryText) return "";
    return convertToLatex(categoryText);
  }, [categoryText]);

  // Multiple strategies to ensure MathLive renders properly
  React.useEffect(() => {
    // Strategy 1: Immediate re-render
    setMathKey(k => k + 1);
    
    // Strategy 2: Delayed re-render
    const timer1 = setTimeout(() => {
      setMathKey(k => k + 1);
    }, 50);
    
    // Strategy 3: Double delayed re-render
    const timer2 = setTimeout(() => {
      setMathKey(k => k + 1);
      setIsMathLiveReady(true);
    }, 200);
    
    // Strategy 4: Force value update on math field if ref exists
    const timer3 = setTimeout(() => {
      if (mathFieldRef.current && formattedCategoryText) {
        try {
          mathFieldRef.current.value = formattedCategoryText;
          mathFieldRef.current.focus();
          mathFieldRef.current.blur();
        } catch (e) {
          console.log('MathField update failed:', e);
        }
      }
      setMathKey(k => k + 1);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [formattedCategoryText, topicId, categoryId, questionId]);

  // Additional effect for window load
  React.useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setMathKey(k => k + 1);
      }, 100);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  // ✨ SHOW LOADING STATE
  if (loading) {
    return (
      <Card className={cn(
        "w-auto max-w-full mx-auto rounded-2xl border-2 border-[white] bg-[#5da295] shadow-lg",
        className
      )}>
        <CardContent className="p-5 sm:p-6 px-8 sm:px-10 relative text-center">
          <div className="flex items-center justify-center gap-3 text-white">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Loading question...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✨ SHOW ERROR STATE
  if (error || !categoryQuestion) {
    return (
      <Card className={cn("w-full max-w-fit mx-auto rounded-2xl border-2 border-red-200 bg-red-50 shadow-lg", className)}>
        <CardContent className="p-4 sm:p-5">
          <Text className="text-red-700 text-left font-semibold">
            {error || `Category question not found for Topic ${topicId}, Category ${categoryId}.`}
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-auto max-w-full mx-auto rounded-2xl border-2 border-[white] bg-[#5da295] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
      className
    )}>
      <CardContent className="p-5 sm:p-6 px-8 sm:px-10 relative text-center">
        {/* Show category_text above the question if available */}
        {categoryText && questionText && (
          <div className="mb-3 text-white text-opacity-80 text-base font-medium leading-snug text-left">
            {categoryQuestion} <span className="font-bold text-white">{questionText}</span>
          </div>
        )}

        {/* Conditional rendering based on label */}
        {answerLabel === "text" ? (
          <div
            key={`text-${topicId}-${categoryId}-${questionId}`}
            style={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "1.5rem",
              background: "transparent",
              border: "none",
              width: "100%",
              pointerEvents: "none",
              fontFamily: "Arial, sans-serif"
            }}
            className="leading-relaxed tracking-wide text-center"
          >
            {categoryText}
          </div>
        ) : (
          <div className="relative">
            {/* Backup rendering while MathLive loads */}
            {!isMathLiveReady && (
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "1.8rem",
                  background: "transparent",
                  width: "100%",
                  fontFamily: "monospace",
                  opacity: 0.7
                }}
                className="leading-relaxed tracking-wide text-center"
              >
                {categoryText}
              </div>
            )}
            
            {/* MathLive field */}
            <math-field
              ref={mathFieldRef}
              key={`mathfield-${mathKey}-${topicId}-${categoryId}-${questionId}-${Date.now()}`}
              value={formattedCategoryText || ""}
              read-only={true}
              style={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                justifyContent: "center",
                display: "flex",
                fontSize: "2.5rem",
                background: "transparent",
                border: "none",
                width: "100%",
                pointerEvents: "none",
                fontFamily: "Arial, sans-serif",
                opacity: isMathLiveReady ? 1 : 0,
                position: isMathLiveReady ? 'static' : 'absolute',
                top: 0,
                left: 0
              }}
              className="leading-relaxed tracking-wide text-center"
              onLoad={() => {
                setIsMathLiveReady(true);
                setMathKey(k => k + 1);
              }}
            ></math-field>
          </div>
        )}
        
        {/* Subtle accent line */}
        <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-[#397F85] to-[#327373] rounded-full"></div>
      </CardContent>
    </Card>
  );
};

export default CategoryQuestion;