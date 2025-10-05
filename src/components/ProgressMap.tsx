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
  const [popupCategoryId, setPopupCategoryId] = useState<number | null>(null);
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
      <div className="w-full mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl overflow-hidden backdrop-blur-sm relative">
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
                        <button 
                          key={category.categoryId}
                          onClick={() => setPopupCategoryId(category.categoryId)}
                          className={`w-full text-left bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md ring-1 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${
                            isCompleted 
                              ? 'ring-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-emerald-100' 
                              : hasProgress 
                              ? 'ring-teal-200 bg-gradient-to-br from-teal-50/30 to-white shadow-teal-100' 
                              : 'ring-gray-200 hover:ring-indigo-200'
                          }`}
                        >
                          {/* Enhanced Header with Badge and Title */}
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-black transition-all duration-300 shadow-lg flex-shrink-0 ${
                                isCompleted 
                                  ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-300/50" 
                                  : hasProgress
                                  ? "text-white shadow-teal-300/50"
                                  : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-gray-300/50"
                              }`}
                              style={hasProgress && !isCompleted ? { background: 'linear-gradient(to bottom right, #14b8a6, #0d9488)' } : {}}
                            >
                              {isCompleted ? "✓" : category.categoryId}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-gray-900">
                                  Stage {category.categoryId}
                                </h3>
                                {isCompleted && (
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                                    COMPLETE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                {category.categoryName}
                              </p>
                            </div>
                          </div>

                          {/* Progress Section with Better Visual Hierarchy */}
                          <div className="space-y-3 mb-4">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">Progress</span>
                                <span className={`text-xs font-bold ${
                                  isCompleted ? 'text-emerald-600' : hasProgress ? 'text-teal-600' : 'text-gray-500'
                                }`}>
                                  {Math.round(completionPercentage)}%
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full transition-all duration-700 ease-out rounded-full shadow-sm"
                                  style={{ 
                                    width: `${completionPercentage}%`,
                                    background: isCompleted 
                                      ? 'linear-gradient(to right, #10b981, #059669)' 
                                      : hasProgress 
                                      ? 'linear-gradient(to right, #14b8a6, #0d9488)' 
                                      : 'linear-gradient(to right, #a855f7, #9333ea)'
                                  }}
                                />
                              </div>
                            </div>

                            {/* Metadata Cards */}
                            <div className="grid grid-cols-3 gap-2">
                              {/* Questions Completed */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  <span className="text-xs font-semibold text-blue-900">Questions</span>
                                </div>
                                <div className="text-base font-black text-blue-700">
                                  {categoryProgress?.correctAnswers || 0}/{category.totalQuestions}
                                </div>
                              </div>

                              {/* Attempts */}
                              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2.5 border border-orange-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <svg className="w-3.5 h-3.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                                  </svg>
                                  <span className="text-xs font-semibold text-orange-900">Attempts</span>
                                </div>
                                <div className="text-base font-black text-orange-700">
                                  {categoryProgress?.attempts || 0}
                                </div>
                              </div>

                              {/* Current Question */}
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                                  </svg>
                                  <span className="text-xs font-semibold text-purple-900">Next Up</span>
                                </div>
                                <div className="text-base font-black text-purple-700">
                                  Q{category.currentQuestionIndex + 1}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Popup Modal */}
                          {popupCategoryId === category.categoryId && (
                            <div 
                              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] backdrop-blur-sm"
                              onClick={() => setPopupCategoryId(null)}
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                            >
                              <div 
                                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl ring-1 ring-black/5 transform scale-100 animate-in"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-xl font-black text-gray-900">
                                    Stage {category.categoryId}
                                  </h3>
                                  <button
                                    onClick={() => setPopupCategoryId(null)}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                                  >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                
                                <p className="text-base text-gray-700 mb-6 leading-relaxed">
                                  {category.categoryName}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-8">
                                  <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                                    <span className="font-semibold">Progress</span>
                                    <span className="font-black text-lg">{Math.round(completionPercentage)}%</span>
                                  </div>
                                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                      className="h-full transition-all duration-700 ease-out rounded-full"
                                      style={{ 
                                        width: `${completionPercentage}%`,
                                        backgroundColor: '#14b8a6'
                                      }}
                                    />
                                  </div>
                                  <div className="mt-3 text-sm text-gray-600 text-center font-medium">
                                    {categoryProgress?.correctAnswers || 0} of {category.totalQuestions} questions correct
                                  </div>
                                </div>

                                {/* Start Button */}
                                <button
                                  onClick={() => {
                                    const nextQuestionId = getNextQuestionId(level.id, category.categoryId);
                                    onStartStage?.(level.id, category.categoryId, nextQuestionId);
                                    setPopupCategoryId(null);
                                  }}
                                  className="w-full py-5 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 text-white"
                                  style={{ 
                                    backgroundColor: isCompleted ? '#10b981' : '#14b8a6',
                                    boxShadow: isCompleted ? '0 8px 24px rgba(16, 185, 129, 0.5)' : '0 8px 24px rgba(20, 184, 166, 0.5)'
                                  }}
                                >
                                  {isCompleted ? "Review Stage" : hasProgress ? "Continue Stage" : "Start Stage"}
                                </button>
                              </div>
                            </div>
                          )}


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

                          {/* Action Footer with Status */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className={`text-xs font-bold uppercase tracking-wider ${
                              isCompleted ? 'text-emerald-600' : hasProgress ? 'text-teal-600' : 'text-indigo-600'
                            }`}>
                              {isCompleted ? '✓ Complete' : hasProgress ? '⚡ In Progress' : '▶ Start Now'}
                            </div>
                            <svg className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${
                              isCompleted ? 'text-emerald-500' : hasProgress ? 'text-teal-500' : 'text-indigo-500'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </button>
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
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl p-4 sm:p-5 md:p-7 backdrop-blur-sm relative">

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
                          <button
                            key={category.categoryId}
                            onClick={() => setPopupCategoryId(category.categoryId)}
                            className={`w-full text-left bg-white rounded-2xl p-5 shadow-md ring-1 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${
                              isCompleted 
                                ? 'ring-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white shadow-emerald-100' 
                                : hasProgress 
                                ? 'ring-teal-200 bg-gradient-to-br from-teal-50/30 to-white shadow-teal-100' 
                                : 'ring-gray-200 hover:ring-indigo-200'
                            }`}
                          >
                            {/* Enhanced Header with Badge and Title */}
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-black transition-all duration-300 shadow-lg flex-shrink-0 ${
                                  isCompleted 
                                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-300/50" 
                                    : hasProgress
                                    ? "text-white shadow-teal-300/50"
                                    : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-gray-300/50"
                                }`}
                                style={hasProgress && !isCompleted ? { background: 'linear-gradient(to bottom right, #14b8a6, #0d9488)' } : {}}
                              >
                                {isCompleted ? "✓" : category.categoryId}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-bold text-gray-900">
                                    Stage {category.categoryId}
                                  </h3>
                                  {isCompleted && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                                      COMPLETE
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                  {category.categoryName}
                                </p>
                              </div>
                            </div>

                            {/* Progress Section with Better Visual Hierarchy */}
                            <div className="space-y-3 mb-4">
                              {/* Progress Bar */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-gray-700">Progress</span>
                                  <span className={`text-xs font-bold ${
                                    isCompleted ? 'text-emerald-600' : hasProgress ? 'text-teal-600' : 'text-gray-500'
                                  }`}>
                                    {Math.round(completionPercentage)}%
                                  </span>
                                </div>
                                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className="h-full transition-all duration-700 ease-out rounded-full shadow-sm"
                                    style={{ 
                                      width: `${completionPercentage}%`,
                                      background: isCompleted 
                                        ? 'linear-gradient(to right, #10b981, #059669)' 
                                        : hasProgress 
                                        ? 'linear-gradient(to right, #14b8a6, #0d9488)' 
                                        : 'linear-gradient(to right, #a855f7, #9333ea)'
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Metadata Cards */}
                              <div className="grid grid-cols-3 gap-2">
                                {/* Questions Completed */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-xs font-semibold text-blue-900">Questions</span>
                                  </div>
                                  <div className="text-base font-black text-blue-700">
                                    {categoryProgress?.correctAnswers || 0}/{category.totalQuestions}
                                  </div>
                                </div>

                                {/* Attempts */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2.5 border border-orange-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <svg className="w-3.5 h-3.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-xs font-semibold text-orange-900">Attempts</span>
                                  </div>
                                  <div className="text-base font-black text-orange-700">
                                    {categoryProgress?.attempts || 0}
                                  </div>
                                </div>

                                {/* Current Question */}
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-xs font-semibold text-purple-900">Next Up</span>
                                  </div>
                                  <div className="text-base font-black text-purple-700">
                                    Q{category.currentQuestionIndex + 1}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Popup Modal for Desktop */}
                            {popupCategoryId === category.categoryId && (
                              <div 
                                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] backdrop-blur-sm"
                                onClick={() => setPopupCategoryId(null)}
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                              >
                                <div 
                                  className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl ring-1 ring-black/5 transform scale-100 animate-in"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-gray-900">
                                      Stage {category.categoryId}
                                    </h3>
                                    <button
                                      onClick={() => setPopupCategoryId(null)}
                                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    >
                                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  
                                  <p className="text-base text-gray-700 mb-6 leading-relaxed">
                                    {category.categoryName}
                                  </p>

                                  {/* Progress Bar */}
                                  <div className="mb-8">
                                    <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                                      <span className="font-semibold">Progress</span>
                                      <span className="font-black text-lg">{Math.round(completionPercentage)}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                      <div 
                                        className="h-full transition-all duration-700 ease-out rounded-full"
                                        style={{ 
                                          width: `${completionPercentage}%`,
                                          backgroundColor: '#14b8a6'
                                        }}
                                      />
                                    </div>
                                    <div className="mt-3 text-sm text-gray-600 text-center font-medium">
                                      {categoryProgress?.correctAnswers || 0} of {category.totalQuestions} questions correct
                                    </div>
                                  </div>

                                  {/* Start Button */}
                                  <button
                                    onClick={() => {
                                      const nextQuestionId = getNextQuestionId(level.id, category.categoryId);
                                      onStartStage?.(level.id, category.categoryId, nextQuestionId);
                                      setPopupCategoryId(null);
                                    }}
                                    className="w-full py-5 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 text-white"
                                    style={{ 
                                      backgroundColor: isCompleted ? '#10b981' : '#14b8a6',
                                      boxShadow: isCompleted ? '0 8px 24px rgba(16, 185, 129, 0.5)' : '0 8px 24px rgba(20, 184, 166, 0.5)'
                                    }}
                                  >
                                    {isCompleted ? "Review Stage" : hasProgress ? "Continue Stage" : "Start Stage"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Action Footer with Status */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className={`text-xs font-bold uppercase tracking-wider ${
                                isCompleted ? 'text-emerald-600' : hasProgress ? 'text-teal-600' : 'text-indigo-600'
                              }`}>
                                {isCompleted ? '✓ Complete' : hasProgress ? '⚡ In Progress' : '▶ Start Now'}
                              </div>
                              <svg className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${
                                isCompleted ? 'text-emerald-500' : hasProgress ? 'text-teal-500' : 'text-indigo-500'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </button>
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
      
    </div>
  );
}