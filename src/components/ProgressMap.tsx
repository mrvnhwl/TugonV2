import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "../components/data/question";
import { defaultTopics } from "../components/data/question";
import { progressService } from "./tugon/services/progressServices";

type Level = {
  id: number;
  name: string;
  topic: string;
  categories: CategoryInfo[];
};

type CategoryInfo = {
  categoryId: number;
  categoryName: string;
  questions: QuestionInfo[];
};

type QuestionInfo = {
  questionId: number;
  questionText: string;
  isCompleted?: boolean;
  attempts?: number;
};

type Props = {
  courses?: Course[];
  onActiveChange?: (course: Course) => void;
  onActiveIndexChange?: (index: number) => void;
  onStartStage?: (topicId: number, categoryId: number, questionId: number) => void;
};

export default function ProgressMap({ courses, onActiveChange, onActiveIndexChange, onStartStage }: Props) {
  const [userProgress, setUserProgress] = useState(progressService.getUserProgress());
  const [isMobile, setIsMobile] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Define levels from question dataset
  const levels: Level[] = useMemo(() => {
    return defaultTopics.map((topic) => ({
      id: topic.id,
      name: `Level ${topic.id}`,
      topic: topic.name,
      categories: topic.level.map((category) => ({
        categoryId: category.category_id,
        categoryName: category.category_question,
        questions: category.given_question.map((question) => {
          const progressData = userProgress?.topicProgress
            ?.find((tp: { topicId: number; categoryProgress: any[] }) => tp.topicId === topic.id)?.categoryProgress
            ?.find((cp: { categoryId: number }) => cp.categoryId === category.category_id)?.questionProgress
            ?.find((qp: { questionId: number }) => qp.questionId === question.question_id);

          return {
            questionId: question.question_id,
            questionText: question.question_text || `Question ${question.question_id}`,
            isCompleted: progressData?.isCompleted || false,
            attempts: progressData?.attempts || 0,
          };
        }),
      })),
    }));
  }, [userProgress]);
  
  // Track expanded categories and selected questions
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<Record<string, number>>({});

  // Refresh progress data
  useEffect(() => {
    const refreshProgress = () => {
      const progress = progressService.getUserProgress();
      if (progress) {
        setUserProgress(progress);
      }
    };

    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    const interval = setInterval(refreshProgress, 30000);
    
    return () => {
      window.removeEventListener('focus', refreshProgress);
      clearInterval(interval);
    };
  }, []);

  // Mobile swipe detection
  useEffect(() => {
    if (!isMobile || !scrollContainerRef.current) return;

    let startX = 0;
    let scrollLeft = 0;
    let isScrolling = false;

    const container = scrollContainerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      isScrolling = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) return;
      e.preventDefault();
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isScrolling = false;
      
      const cardWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const targetIndex = Math.round(currentScroll / cardWidth);
      
      container.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth'
      });
      
      setActiveTopic(Math.max(0, Math.min(targetIndex, levels.length - 1)));
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, levels.length]);

  // Navigation functions
  const navigateToTopic = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, levels.length - 1));
    setActiveTopic(clampedIndex);
    
    if (isMobile && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: clampedIndex * scrollContainerRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const goToPrevious = () => {
    if (activeTopic > 0) {
      navigateToTopic(activeTopic - 1);
    }
  };

  const goToNext = () => {
    if (activeTopic < levels.length - 1) {
      navigateToTopic(activeTopic + 1);
    }
  };

  // Notify parent of changes
  useEffect(() => {
    if (!courses || !onActiveChange) return;
    if (activeTopic < 0 || activeTopic >= courses.length) return;
    onActiveChange(courses[activeTopic]);
  }, [activeTopic, courses, onActiveChange]);

  useEffect(() => {
    onActiveIndexChange?.(activeTopic);
  }, [activeTopic, onActiveIndexChange]);

  // Helper functions
  const toggleCategory = (topicId: number, categoryId: number) => {
    const key = `${topicId}-${categoryId}`;
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectQuestion = (topicId: number, categoryId: number, questionId: number) => {
    const key = `${topicId}-${categoryId}`;
    setSelectedQuestion(prev => ({
      ...prev,
      [key]: questionId
    }));
  };

  const getSelectedQuestion = (topicId: number, categoryId: number): number => {
    const key = `${topicId}-${categoryId}`;
    return selectedQuestion[key] || 1;
  };

  const isCategoryExpanded = (topicId: number, categoryId: number): boolean => {
    const key = `${topicId}-${categoryId}`;
    return expandedCategories[key] || false;
  };

  const getCategoryProgress = (topicId: number, categoryId: number) => {
    return userProgress?.topicProgress
        ?.find((tp: { topicId: number; categoryProgress: any[] }) => tp.topicId === topicId)?.categoryProgress
      ?.find((cp: { categoryId: number }) => cp.categoryId === categoryId);
  };

  const getTopicProgress = (topicId: number) => {
    return userProgress?.topicProgress?.find((tp: { topicId: number }) => tp.topicId === topicId);
  };

  if (levels.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl p-6 md:p-8">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-gray-500 text-sm font-medium">No topics available</div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl overflow-hidden backdrop-blur-sm">
        {/* Enhanced Header with Icon Space */}
        <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-b border-white/20">
          <div className="text-center">
            {/* Icon Placeholder */}
            <div className="w-12 h-12 mx-auto mb-3 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
            </div>
            
            <div className="text-xs font-bold text-indigo-600/80 uppercase tracking-[0.15em] mb-1">
              {levels[activeTopic]?.name}
            </div>
            
            {/* Emphasized Topic Name */}
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight">
              {levels[activeTopic]?.topic}
            </h1>
          </div>
        </div>

        {/* Horizontal Scrolling Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {levels.map((level, levelIndex) => {
            const isActive = levelIndex === activeTopic;
            const topicProgress = getTopicProgress(level.id);
            
            return (
              <div
                key={level.id}
                className="flex-shrink-0 w-full h-[62vh] snap-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div className="h-full bg-gradient-to-br from-white to-gray-50/30 overflow-y-auto">
                  {/* Enhanced Topic Content */}
                  <div className="p-5 space-y-5">
                    {/* Topic Status Card */}
                    <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300 ${
                          topicProgress?.isCompleted 
                            ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200" 
                            : topicProgress?.completionPercentage && topicProgress.completionPercentage > 0
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200"
                            : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-gray-100"
                        }`}
                      >
                        {topicProgress?.isCompleted ? "✓" : level.id}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-gray-900 mb-1">
                          {level.topic}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {level.categories.length} stages available
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Categories */}
                    {level.categories.map((category, categoryIndex) => {
                      const isExpanded = isCategoryExpanded(level.id, category.categoryId);
                      const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                      const selectedQuestionId = getSelectedQuestion(level.id, category.categoryId);
                      
                      return (
                        <div 
                          key={category.categoryId} 
                          className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md hover:ring-black/10 ${
                            isExpanded ? 'shadow-lg ring-indigo-100' : ''
                          }`}
                        >
                          {/* Enhanced Category Header */}
                          <button
                            onClick={() => toggleCategory(level.id, category.categoryId)}
                            className="w-full flex items-center justify-between text-left group hover:bg-white/50 rounded-xl p-3 transition-all duration-200"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${
                                categoryProgress?.isCompleted 
                                  ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200" 
                                  : categoryProgress?.completionPercentage && categoryProgress.completionPercentage > 0
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200"
                                  : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-gray-100"
                              }`}>
                                {categoryProgress?.isCompleted ? "✓" : category.categoryId}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-gray-900 mb-1">
                                  Stage {category.categoryId}
                                </div>
                                <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                                  {category.categoryName}
                                </div>
                                {categoryProgress && (
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-14 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                      <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out rounded-full"
                                        style={{ width: `${(categoryProgress.correctAnswers || 0) / category.questions.length * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                      {categoryProgress.correctAnswers || 0}/{category.questions.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={`transform transition-all duration-300 ml-2 ${
                              isExpanded ? "rotate-180 text-indigo-600 scale-110" : "text-gray-400 group-hover:text-gray-600"
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* Enhanced Questions */}
                          {isExpanded && (
                            <div className="mt-4 space-y-3 animate-fadeIn">
                              {category.questions.map((question, questionIndex) => {
                                const isSelected = selectedQuestionId === question.questionId;
                                
                                return (
                                  <button
                                    key={question.questionId}
                                    onClick={() => selectQuestion(level.id, category.categoryId, question.questionId)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] ${
                                      isSelected 
                                        ? "border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md ring-2 ring-indigo-200/40" 
                                        : "border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                                    } ${question.isCompleted ? "ring-2 ring-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50" : ""}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 transition-all duration-300 shadow-sm ${
                                        question.isCompleted 
                                          ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200"
                                          : question.attempts && question.attempts > 0
                                          ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-200"
                                          : isSelected
                                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200"
                                          : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-gray-100"
                                      }`}>
                                        {question.isCompleted ? "✓" : question.questionId}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="text-sm text-gray-900 line-clamp-3 font-medium leading-relaxed">
                                          {question.questionText}
                                        </div>
                                        {question.attempts && question.attempts > 0 && (
                                          <div className="text-xs text-orange-600 mt-2 flex items-center gap-1 font-medium">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                            {question.attempts} attempt{question.attempts > 1 ? 's' : ''}
                                          </div>
                                        )}
                                      </div>
                                      {isSelected && (
                                        <div className="text-indigo-600 text-xs font-bold bg-indigo-100 px-2 py-1 rounded-full animate-pulse">
                                          Selected
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                              
                              {/* Enhanced Start Button */}
                              <div className="pt-3">
                                <button
                                  onClick={() => {
                                    const questionId = getSelectedQuestion(level.id, category.categoryId);
                                    onStartStage?.(level.id, category.categoryId, questionId);
                                  }}
                                  className="w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                                >
                                  <span className="flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V14a1.5 1.5 0 01-3 0V10.5M15 10h.5a2 2 0 012 2V15a2 2 0 01-4 0v-2.5" />
                                    </svg>
                                    <span>Start Question {getSelectedQuestion(level.id, category.categoryId)}</span>
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Mobile Navigation Dots */}
        <div className="p-5 flex justify-center gap-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
          {levels.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToTopic(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeTopic 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 w-8 shadow-md" 
                  : "bg-gray-300 w-2.5 hover:bg-gray-400 hover:w-4"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop Layout (Stack-based with arrow navigation)
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl p-4 sm:p-5 md:p-7 backdrop-blur-sm">
      {/* Enhanced Header with Icon Space */}
      <div className="mb-8 text-center">
        {/* Icon Placeholder */}
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm"></div>
        </div>
        
        <div className="text-xs sm:text-sm font-bold text-indigo-600/80 uppercase tracking-[0.15em] mb-2">
          {levels[activeTopic]?.name}
        </div>
        
        {/* Emphasized Topic Name */}
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
          {levels[activeTopic]?.topic}
        </h1>
      </div>

      {/* Enhanced Stack of Topic Cards */}
      <div className="relative h-[62vh] overflow-hidden">
        <div className="relative h-full">
          {levels.map((level, levelIndex) => {
            const isActive = levelIndex === activeTopic;
            const isPrevious = levelIndex < activeTopic;
            const isNext = levelIndex > activeTopic;
            const topicProgress = getTopicProgress(level.id);
            
            // Enhanced stack position calculations
            let zIndex = levels.length - Math.abs(levelIndex - activeTopic);
            let translateY = 0;
            let scale = 1;
            let opacity = 1;
            let blur = 0;
            
            if (isActive) {
              translateY = 0;
              scale = 1;
              opacity = 1;
              zIndex = levels.length + 1;
              blur = 0;
            } else if (isPrevious) {
              const distance = activeTopic - levelIndex;
              translateY = -distance * 10;
              scale = Math.max(0.94 - distance * 0.03, 0.88);
              opacity = Math.max(0.6 - distance * 0.15, 0.2);
              blur = Math.min(distance * 0.5, 2);
            } else if (isNext) {
              const distance = levelIndex - activeTopic;
              translateY = distance * 10;
              scale = Math.max(0.94 - distance * 0.03, 0.88);
              opacity = Math.max(0.6 - distance * 0.15, 0.2);
              blur = Math.min(distance * 0.5, 2);
            }

            return (
              <div
                key={level.id}
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  filter: blur > 0 ? `blur(${blur}px)` : 'none',
                }}
              >
                <div
                  className={`h-full bg-white rounded-3xl shadow-lg ring-1 transition-all duration-500 cursor-pointer overflow-y-auto ${
                    isActive 
                      ? 'ring-indigo-300/50 shadow-2xl shadow-indigo-100/50' 
                      : 'ring-black/10 hover:ring-indigo-200 hover:shadow-xl'
                  }`}
                  onClick={() => !isActive && setActiveTopic(levelIndex)}
                >
                  {/* Enhanced Topic Header */}
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-5 border-b border-gray-100/80 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-base font-black text-gray-900 mb-1">
                          {level.name}: {level.topic}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {level.categories.length} stages available
                        </div>
                      </div>
                      
                      {/* Enhanced Topic Status */}
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300 ${
                            topicProgress?.isCompleted 
                              ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200" 
                              : topicProgress?.completionPercentage && topicProgress.completionPercentage > 0
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200"
                              : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-gray-100"
                          }`}
                        >
                          {topicProgress?.isCompleted ? "✓" : level.id}
                        </div>
                        
                        {!isActive && (
                          <div className="text-gray-400 transition-colors duration-300 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categories Content - Only show for active topic */}
                  {isActive && (
                    <div className="p-5 space-y-5">
                      {level.categories.map((category, categoryIndex) => {
                        const isExpanded = isCategoryExpanded(level.id, category.categoryId);
                        const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                        const selectedQuestionId = getSelectedQuestion(level.id, category.categoryId);
                        
                        return (
                          <div 
                            key={category.categoryId} 
                            className={`bg-gradient-to-br from-gray-50/50 to-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md hover:ring-black/10 ${
                              isExpanded ? 'shadow-lg ring-indigo-100/50' : ''
                            }`}
                          >
                            {/* Enhanced Category Header */}
                            <button
                              onClick={() => toggleCategory(level.id, category.categoryId)}
                              className="w-full flex items-center justify-between text-left group hover:bg-white/70 rounded-xl p-3 transition-all duration-200"
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                                  categoryProgress?.isCompleted 
                                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200" 
                                    : categoryProgress?.completionPercentage && categoryProgress.completionPercentage > 0
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200"
                                    : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-gray-100"
                                }`}>
                                  {categoryProgress?.isCompleted ? "✓" : category.categoryId}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-gray-900 mb-1">
                                    Stage {category.categoryId}
                                  </div>
                                  <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {category.categoryName}
                                  </div>
                                  {categoryProgress && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-14 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out rounded-full"
                                          style={{ width: `${(categoryProgress.correctAnswers || 0) / category.questions.length * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-500 font-medium">
                                        {categoryProgress.correctAnswers || 0}/{category.questions.length}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className={`transform transition-all duration-300 ml-2 ${
                                isExpanded ? "rotate-180 text-indigo-600 scale-110" : "text-gray-400 group-hover:text-gray-600"
                              }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>

                            {/* Enhanced Questions */}
                            {isExpanded && (
                              <div className="mt-4 space-y-3 animate-fadeIn">
                                {category.questions.map((question, questionIndex) => {
                                  const isSelected = selectedQuestionId === question.questionId;
                                  
                                  return (
                                    <button
                                      key={question.questionId}
                                      onClick={() => selectQuestion(level.id, category.categoryId, question.questionId)}
                                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] ${
                                        isSelected 
                                          ? "border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md ring-2 ring-indigo-200/40" 
                                          : "border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                                      } ${question.isCompleted ? "ring-2 ring-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50" : ""}`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 transition-all duration-300 shadow-sm ${
                                          question.isCompleted 
                                            ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200"
                                            : question.attempts && question.attempts > 0
                                            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-200"
                                            : isSelected
                                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200"
                                            : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-gray-100"
                                        }`}>
                                          {question.isCompleted ? "✓" : question.questionId}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-sm text-gray-900 line-clamp-3 font-medium leading-relaxed">
                                            {question.questionText}
                                          </div>
                                          {question.attempts && question.attempts > 0 && (
                                            <div className="text-xs text-orange-600 mt-2 flex items-center gap-1 font-medium">
                                              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                              {question.attempts} attempt{question.attempts > 1 ? 's' : ''}
                                            </div>
                                          )}
                                        </div>
                                        {isSelected && (
                                          <div className="text-indigo-600 text-xs font-bold bg-indigo-100 px-2 py-1 rounded-full animate-pulse hidden sm:block">
                                            Selected
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                                
                                {/* Enhanced Start Button */}
                                <div className="pt-3">
                                  <button
                                    onClick={() => {
                                      const questionId = getSelectedQuestion(level.id, category.categoryId);
                                      onStartStage?.(level.id, category.categoryId, questionId);
                                    }}
                                    className="w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                                  >
                                    <span className="flex items-center justify-center gap-3">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V14a1.5 1.5 0 01-3 0V10.5M15 10h.5a2 2 0 012 2V15a2 2 0 01-4 0v-2.5" />
                                      </svg>
                                      <span>Start Question {getSelectedQuestion(level.id, category.categoryId)}</span>
                                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                      </svg>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Enhanced Inactive Topic Preview */}
                  {!isActive && (
                    <div className="p-6 text-center">
                      <div className="text-gray-500 text-sm font-medium mb-2">
                        Click to view stages
                      </div>
                      {topicProgress && (
                        <div className="text-xs text-gray-400 font-medium">
                          {Math.round(topicProgress.completionPercentage || 0)}% Complete
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Desktop Arrow Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {/* Enhanced Left Arrow */}
        <button
          onClick={goToPrevious}
          disabled={activeTopic === 0}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
            activeTopic === 0
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 active:scale-95 shadow-sm hover:shadow-md bg-white'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Enhanced Navigation Dots */}
        <div className="flex justify-center gap-3">
          {levels.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToTopic(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeTopic 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 w-8 shadow-md" 
                  : "bg-gray-300 w-2.5 hover:bg-gray-400 hover:w-4 hover:shadow-sm"
              }`}
            />
          ))}
        </div>

        {/* Enhanced Right Arrow */}
        <button
          onClick={goToNext}
          disabled={activeTopic === levels.length - 1}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
            activeTopic === levels.length - 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 active:scale-95 shadow-sm hover:shadow-md bg-white'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}