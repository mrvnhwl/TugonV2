import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "../components/data/questions/index";
import { defaultTopics } from "../components/data/questions/index";
import { progressService, TopicProgress } from "./tugon/services/progressServices";

type Level = {
  id: number;
  name: string;
  topic: string;
  categories: CategoryInfo[];
  description?: string;
};

type CategoryInfo = {
  categoryId: number;
  categoryName: string;
  questions: QuestionInfo[];
  totalQuestions: number;
  currentQuestionIndex: number;
};

type QuestionInfo = {
  questionId: number;
  questionText: string;
  isCompleted?: boolean;
  attempts?: number;
};

type OverallStats = {
  totalTopics: number;
  completedTopics: number;
  totalQuestions: number;
  completedQuestions: number;
  overallCompletionPercentage: number;
  streak: number;
  totalTimeSpent: number;
};

type Props = {
  courses?: Course[];
  onActiveChange?: (course: Course) => void;
  onActiveIndexChange?: (index: number) => void;
  onStartStage?: (topicId: number, categoryId: number, questionId: number) => void;
  // Course Card props for mobile merge
  title?: string;
  description?: string;
  lessons?: number;
  exercises?: number;
  topicId?: number;
  progress?: TopicProgress;
  overallStats?: OverallStats;
};

export default function ProgressMap({ 
  courses, 
  onActiveChange, 
  onActiveIndexChange, 
  onStartStage,
  title,
  description,
  lessons,
  exercises,
  topicId,
  progress,
  overallStats
}: Props) {
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

  // Get random question index for each category using progress service
  const getRandomQuestionIndex = (questions: QuestionInfo[], topicId: number, categoryId: number): number => {
    if (questions.length === 0) return 0;
    
    const categoryStats = progressService.getCategoryStats(topicId, categoryId);
    
    if (categoryStats.currentQuestionIndex >= 0 && categoryStats.currentQuestionIndex < questions.length) {
      return categoryStats.currentQuestionIndex;
    }
    
    const newIndex = Math.floor(Math.random() * questions.length);
    progressService.updateCurrentQuestionIndex(topicId, categoryId, newIndex);
    
    return newIndex;
  };

  // Define levels from question dataset
  const levels: Level[] = useMemo(() => {
    const topicDescriptions = [
      "Learn to wield important tools in number sense and computation.",
      "Master advanced algebraic concepts and problem-solving techniques.",
      "Explore geometric relationships and spatial reasoning skills.",
      "Dive into statistical analysis and data interpretation methods.",
      "Understanding calculus fundamentals and mathematical analysis.",
    ];
    
    return defaultTopics.map((topic, index) => ({
      id: topic.id,
      name: `Level ${topic.id}`,
      topic: topic.name,
      description: topicDescriptions[index] || "Enhance your mathematical thinking and problem-solving abilities.",
      categories: topic.level.map((category) => {
        const questions = category.given_question.map((question) => {
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
        });

        const currentQuestionIndex = getRandomQuestionIndex(questions, topic.id, category.category_id);

        return {
          categoryId: category.category_id,
          categoryName: category.category_question,
          questions,
          totalQuestions: questions.length,
          currentQuestionIndex
        };
      }),
    }));
  }, [userProgress]);

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
  const getCategoryProgress = (topicId: number, categoryId: number) => {
    return progressService.getCategoryStats(topicId, categoryId);
  };

  const getTopicProgress = (topicId: number) => {
    return userProgress?.topicProgress?.find((tp: { topicId: number }) => tp.topicId === topicId);
  };

  const getCurrentQuestion = (category: CategoryInfo): QuestionInfo => {
    return category.questions[category.currentQuestionIndex] || category.questions[0];
  };

  const getNextQuestionId = (topicId: number, categoryId: number): number => {
    const categoryStats = progressService.getCategoryStats(topicId, categoryId);
    const category = levels.find(l => l.id === topicId)?.categories.find(c => c.categoryId === categoryId);
    
    if (!category) return 1;

    // Find the next unanswered question, or cycle back to the beginning
    let nextIndex = categoryStats.currentQuestionIndex;
    
    for (let i = 0; i < category.questions.length; i++) {
      const questionIndex = (nextIndex + i) % category.questions.length;
      const question = category.questions[questionIndex];
      
      if (!question.isCompleted) {
        return question.questionId;
      }
    }
    
    // If all questions are completed, start from the beginning
    return category.questions[0]?.questionId || 1;
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

  // Mobile Layout - Merged with CourseCard
  if (isMobile) {
    const currentLevel = levels[activeTopic];
    const currentTopicProgress = getTopicProgress(currentLevel?.id);
    const stats = overallStats || progressService.getStatistics();

    return (
      <div className="w-full mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl overflow-hidden backdrop-blur-sm">
        {/* Course Card Header - Enhanced */}
        <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-b border-white/20">
          {/* Course Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">{lessons || 25}</div>
              <div className="text-xs text-gray-600">Lessons</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">{exercises || 150}</div>
              <div className="text-xs text-gray-600">Exercises</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">{stats.streak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900">{Math.round(stats.overallCompletionPercentage)}%</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>

          {/* Current Level Info */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                currentTopicProgress?.isCompleted 
                  ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white" 
                  : currentTopicProgress?.completionPercentage && currentTopicProgress.completionPercentage > 0
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
              }`}>
                {currentTopicProgress?.isCompleted ? "✓" : currentLevel?.id}
              </div>
            </div>
            
            <div className="text-xs font-bold text-indigo-600/80 uppercase tracking-[0.15em] mb-1">
              {currentLevel?.name}
            </div>
            
            <h1 className="text-xl font-black text-gray-900 leading-tight tracking-tight mb-2">
              {currentLevel?.topic}
            </h1>
            
            <p className="text-sm text-gray-600 mb-4">
              {currentLevel?.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Topic Progress</span>
                <span className="font-bold">{Math.round(currentTopicProgress?.completionPercentage || 0)}%</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${currentTopicProgress?.completionPercentage || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Container for Topics */}
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
                className="flex-shrink-0 w-full snap-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div className="h-[70vh] bg-gradient-to-br from-white to-gray-50/30 overflow-y-auto">
                  <div className="p-5 space-y-4">
                    {/* Enhanced Categories */}
                    {level.categories.map((category, categoryIndex) => {
                      const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                      const currentQuestion = getCurrentQuestion(category);
                      const hasProgress = categoryProgress && categoryProgress.attempts > 0;
                      const completionPercentage = categoryProgress ? (categoryProgress.correctAnswers / category.totalQuestions) * 100 : 0;
                      const isCompleted = categoryProgress?.isCompleted;
                      
                      return (
                        <div 
                          key={category.categoryId} 
                          className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md hover:ring-black/10 ${
                            isCompleted ? 'shadow-lg ring-green-100' : hasProgress ? 'shadow-lg ring-blue-100' : ''
                          }`}
                        >
                          {/* Category Header */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                              isCompleted 
                                ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200" 
                                : hasProgress
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200"
                                : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-gray-100"
                            }`}>
                              {isCompleted ? "✓" : category.categoryId}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-gray-900 mb-1">
                                Stage {category.categoryId}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {category.categoryName}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out rounded-full"
                                      style={{ width: `${completionPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {categoryProgress?.correctAnswers || 0}/{category.totalQuestions}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Q{category.currentQuestionIndex + 1}/{category.totalQuestions}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Question Preview */}
                          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg flex-shrink-0">
                                {currentQuestion.questionId}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900 line-clamp-2 font-medium leading-relaxed mb-2">
                                  {currentQuestion.questionText}
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <div className="flex items-center gap-1 text-indigo-600">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                    <span className="font-bold">NEXT UP</span>
                                  </div>
                                  {currentQuestion.attempts && currentQuestion.attempts > 0 && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                      <span className="font-bold">{currentQuestion.attempts} attempts</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Start Button - Positioned at bottom like in the image */}
                          <button
                            onClick={() => {
                              const nextQuestionId = getNextQuestionId(level.id, category.categoryId);
                              onStartStage?.(level.id, category.categoryId, nextQuestionId);
                            }}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 ${
                              isCompleted
                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-300 shadow-green-500/50"
                                : hasProgress
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white focus:ring-blue-300 shadow-blue-500/50"
                                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white focus:ring-indigo-300 shadow-indigo-500/50"
                            }`}
                          >
                            <span className="flex items-center justify-center gap-3">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V14a1.5 1.5 0 01-3 0V10.5M15 10h.5a2 2 0 012 2V15a2 2 0 01-4 0v-2.5" />
                              </svg>
                              <span>
                                {isCompleted ? "Review Stage" : hasProgress ? "Continue Stage" : "Start Stage"}
                              </span>
                              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </button>

                          {/* Stats Footer */}
                          {hasProgress && (
                            <div className="mt-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-blue-600">
                                <span className="text-lg">⚡</span>
                                <span className="font-bold">{categoryProgress.attempts} attempts</span>
                              </div>
                              {isCompleted && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <span className="text-lg">🏆</span>
                                  <span className="font-bold">Completed!</span>
                                </div>
                              )}
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

  // Desktop Layout (unchanged)
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl p-4 sm:p-5 md:p-7 backdrop-blur-sm">

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


                  {/* Categories Content - Only show for active topic */}
                  {isActive && (
                    <div className="p-5 space-y-5">
                      {level.categories.map((category, categoryIndex) => {
                        const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                        const currentQuestion = getCurrentQuestion(category);
                        const hasProgress = categoryProgress && categoryProgress.attempts > 0;
                        const completionPercentage = categoryProgress ? (categoryProgress.correctAnswers / category.totalQuestions) * 100 : 0;
                        const isCompleted = categoryProgress?.isCompleted;
                        
                        return (
                          <div 
                            key={category.categoryId} 
                            className={`bg-gradient-to-br from-gray-50/50 to-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md hover:ring-black/10 ${
                              isCompleted ? 'shadow-lg ring-green-100/50' : hasProgress ? 'shadow-lg ring-blue-100/50' : ''
                            }`}
                          >
                            {/* Enhanced Category Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                                  isCompleted 
                                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-200" 
                                    : hasProgress
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200"
                                    : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-gray-100"
                                }`}>
                                  {isCompleted ? "✓" : category.categoryId}
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
                                          style={{ width: `${completionPercentage}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-500 font-medium">
                                        {categoryProgress.correctAnswers || 0}/{category.totalQuestions}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Start Button - Positioned prominently */}
                            <button
                              onClick={() => {
                                const nextQuestionId = getNextQuestionId(level.id, category.categoryId);
                                onStartStage?.(level.id, category.categoryId, nextQuestionId);
                              }}
                              className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 ${
                                isCompleted
                                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-300 shadow-green-500/50"
                                  : hasProgress
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white focus:ring-blue-300 shadow-blue-500/50"
                                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white focus:ring-indigo-300 shadow-indigo-500/50"
                              }`}
                            >
                              <span className="flex items-center justify-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V14a1.5 1.5 0 01-3 0V10.5M15 10h.5a2 2 0 012 2V15a2 2 0 01-4 0v-2.5" />
                                </svg>
                                <span>
                                  {isCompleted ? "Review Stage" : hasProgress ? "Continue Stage" : "Start Stage"}
                                </span>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </span>
                            </button>

                            {/* Stats Footer */}
                            {hasProgress && (
                              <div className="mt-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-blue-600">
                                  <span className="text-lg">⚡</span>
                                  <span className="font-bold">{categoryProgress.attempts} attempts</span>
                                </div>
                                {isCompleted && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <span className="text-lg">🏆</span>
                                    <span className="font-bold">Completed!</span>
                                  </div>
                                )}
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