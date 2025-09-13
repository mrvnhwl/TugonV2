import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Course } from "../components/data/question";
import { defaultTopics } from "../components/data/question";
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
};

export default function UnifiedProgressMap({ courses, onActiveChange, onActiveIndexChange, onStartStage }: Props) {
  const [userProgress, setUserProgress] = useState(progressService.getUserProgress());
  const [overallStats, setOverallStats] = useState<OverallStats>(progressService.getStatistics());
  const [isMobile, setIsMobile] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('detailed');
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

  // Define levels from question dataset with descriptions
  const levels: Level[] = useMemo(() => {
    const topicDescriptions = [
      "Learn to wield important tools in number sense and computation.",
      "Master advanced algebraic concepts and problem-solving techniques.",
      "Explore geometric relationships and spatial reasoning skills.",
      "Dive into statistical analysis and data interpretation methods.",
      "Understanding calculus fundamentals and mathematical analysis."
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
      const stats = progressService.getStatistics();
      if (progress) {
        setUserProgress(progress);
        setOverallStats(stats);
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

  // Navigation functions
  const navigateToTopic = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, levels.length - 1));
    setActiveTopic(clampedIndex);
    setIsScrolling(true);
    
    if (isMobile && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: clampedIndex * scrollContainerRef.current.clientWidth,
        behavior: 'smooth'
      });
      
      setTimeout(() => setIsScrolling(false), 500);
    } else {
      setTimeout(() => setIsScrolling(false), 700);
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

  const getTopicProgress = (topicId: number): TopicProgress | undefined => {
    return userProgress?.topicProgress?.find((tp: { topicId: number }) => tp.topicId === topicId);
  };

  const getCurrentQuestion = (category: CategoryInfo): QuestionInfo => {
    return category.questions[category.currentQuestionIndex] || category.questions[0];
  };

  // CourseCard helper functions
  const getTopicIcon = (topicProgress: TopicProgress | undefined) => {
    const completionPercentage = topicProgress?.completionPercentage || 0;
    const isCompleted = topicProgress?.isCompleted || false;
    
    if (isCompleted) return "🏆";
    if (completionPercentage > 75) return "🔥";
    if (completionPercentage > 50) return "⚡";
    if (completionPercentage > 0) return "📖";
    return "📘";
  };

  const getCompletionColor = (topicProgress: TopicProgress | undefined) => {
    const completionPercentage = topicProgress?.completionPercentage || 0;
    const isCompleted = topicProgress?.isCompleted || false;
    
    if (isCompleted) return "text-green-600";
    if (completionPercentage > 75) return "text-purple-600";
    if (completionPercentage > 50) return "text-blue-600";
    if (completionPercentage > 0) return "text-orange-600";
    return "text-gray-500";
  };

  const getBackgroundColor = (topicProgress: TopicProgress | undefined) => {
    const completionPercentage = topicProgress?.completionPercentage || 0;
    const isCompleted = topicProgress?.isCompleted || false;
    
    if (isCompleted) return "bg-green-50 ring-1 ring-green-200";
    if (completionPercentage > 75) return "bg-purple-50 ring-1 ring-purple-200";
    if (completionPercentage > 50) return "bg-blue-50 ring-1 ring-blue-200";
    if (completionPercentage > 0) return "bg-orange-50 ring-1 ring-orange-200";
    return "bg-gray-50 ring-1 ring-gray-200";
  };

  const getProgressBarColor = (topicProgress: TopicProgress | undefined) => {
    const completionPercentage = topicProgress?.completionPercentage || 0;
    const isCompleted = topicProgress?.isCompleted || false;
    
    if (isCompleted) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (completionPercentage > 75) return 'bg-gradient-to-r from-purple-500 to-violet-500';
    if (completionPercentage > 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (completionPercentage > 0) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gray-300';
  };

  if (levels.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl p-6 md:p-8"
      >
        <div className="text-center py-16">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner"
          >
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>
          <div className="text-gray-500 text-sm font-medium">No topics available</div>
        </div>
      </motion.div>
    );
  }

  const currentLevel = levels[activeTopic];
  const currentTopicProgress = getTopicProgress(currentLevel?.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto bg-white rounded-3xl ring-1 ring-black/5 shadow-xl overflow-hidden backdrop-blur-sm"
    >
      {/* Header with Topic Carousel Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-b border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={goToPrevious}
            disabled={activeTopic === 0}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
              activeTopic === 0
                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 bg-white'
            }`}
            whileHover={activeTopic > 0 ? { scale: 1.1 } : {}}
            whileTap={activeTopic > 0 ? { scale: 0.95 } : {}}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <div className="flex-1 text-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-4 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5 relative transition-all duration-300 ${getBackgroundColor(currentTopicProgress)}`}
            >
              <span className="text-3xl">{getTopicIcon(currentTopicProgress)}</span>
              {currentTopicProgress?.isCompleted && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-bold text-indigo-600/80 uppercase tracking-[0.15em] mb-2"
            >
              {currentLevel?.name}
            </motion.div>
            
            <motion.h1 
              key={activeTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight mb-2"
            >
              {currentLevel?.topic}
            </motion.h1>

           
          </div>

          <motion.button
            onClick={goToNext}
            disabled={activeTopic === levels.length - 1}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
              activeTopic === levels.length - 1
                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 bg-white'
            }`}
            whileHover={activeTopic < levels.length - 1 ? { scale: 1.1 } : {}}
            whileTap={activeTopic < levels.length - 1 ? { scale: 0.95 } : {}}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Topic Progress Summary (CourseCard Style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Topic Progress</span>
              <span className={`${getCompletionColor(currentTopicProgress)} font-bold`}>
                {Math.round(currentTopicProgress?.completionPercentage || 0)}%
                {!currentTopicProgress?.completionPercentage && " (Not Started)"}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentTopicProgress?.completionPercentage || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full transition-all duration-500 rounded-full ${getProgressBarColor(currentTopicProgress)}`}
              />
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {currentTopicProgress?.isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full shadow-sm">
                🏆 Topic Master
              </span>
            )}
            
            {currentTopicProgress && currentTopicProgress.categoryProgress.filter(cat => cat.isCompleted).length > 0 && !currentTopicProgress.isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shadow-sm">
                ⭐ {currentTopicProgress.categoryProgress.filter(cat => cat.isCompleted).length} Stage{currentTopicProgress.categoryProgress.filter(cat => cat.isCompleted).length > 1 ? 's' : ''} Complete
              </span>
            )}
            
            {currentTopicProgress && currentTopicProgress.correctAnswers > 0 && !currentTopicProgress.isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full shadow-sm">
                📝 {currentTopicProgress.correctAnswers} Question{currentTopicProgress.correctAnswers > 1 ? 's' : ''} Solved
              </span>
            )}
            
            {overallStats?.streak && overallStats.streak > 1 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full shadow-sm animate-pulse">
                🔥 {overallStats.streak} Day Streak
              </span>
            )}
            
            {(!currentTopicProgress || currentTopicProgress.completionPercentage === 0) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                🚀 Ready to Start 
              </span>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className={`text-lg font-bold ${
                currentTopicProgress?.completionPercentage && currentTopicProgress.completionPercentage > 0 ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                {Math.round(currentTopicProgress?.completionPercentage || 0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Complete</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className={`text-lg font-bold ${
                currentTopicProgress?.correctAnswers && currentTopicProgress.correctAnswers > 0 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {currentTopicProgress?.correctAnswers || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Solved</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className={`text-lg font-bold ${
                currentTopicProgress && currentTopicProgress.categoryProgress.filter(cat => cat.isCompleted).length > 0 ? 'text-purple-600' : 'text-gray-400'
              }`}>
                {currentTopicProgress ? currentTopicProgress.categoryProgress.filter(cat => cat.isCompleted).length : 0}
                <span className="text-sm text-gray-500">
                  /{currentTopicProgress ? currentTopicProgress.categoryProgress.length : currentLevel?.categories.length || 0}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Stages</div>
            </div>
          </div>
        </motion.div>

        {/* Topic Progress Dots */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-3"
        >
          {levels.map((_, index) => {
            const topicProgress = getTopicProgress(levels[index].id);
            return (
              <motion.button
                key={index}
                onClick={() => navigateToTopic(index)}
                className={`h-3 rounded-full transition-all duration-300 flex items-center gap-2 ${
                  index === activeTopic 
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 w-16 shadow-md px-3" 
                    : "bg-gray-300 w-3 hover:bg-gray-400 hover:w-8"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ 
                  scale: index === activeTopic ? 1.05 : 1,
                  opacity: index === activeTopic ? 1 : 0.7
                }}
              >
                {index === activeTopic && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(topicProgress?.completionPercentage || 0)}%
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center mt-4"
        >
          <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm ring-1 ring-black/5">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'overview'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'detailed'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Stages
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' ? (
          /* Overview Mode - Summary Stats */
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Overall Learning Progress
              </h3>
              <p className="text-sm text-gray-600">
                Track your journey across all mathematical topics
              </p>
            </div>

            {/* Overall Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center shadow-sm ring-1 ring-blue-100"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {overallStats.completedTopics}
                  <span className="text-lg text-gray-500">/{overallStats.totalTopics}</span>
                </div>
                <div className="text-sm text-gray-600 font-medium">Topics Mastered</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center shadow-sm ring-1 ring-green-100"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {overallStats.completedQuestions}
                </div>
                <div className="text-sm text-gray-600 font-medium">Questions Solved</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 text-center shadow-sm ring-1 ring-purple-100"
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(overallStats.overallCompletionPercentage)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Overall Progress</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center shadow-sm ring-1 ring-orange-100"
              >
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {overallStats.streak}
                </div>
                <div className="text-sm text-gray-600 font-medium">Day Streak</div>
              </motion.div>
            </div>

            {/* Topics Overview */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 mb-4">All Topics Progress</h4>
              {levels.map((level, index) => {
                const topicProgress = getTopicProgress(level.id);
                const completionPercentage = topicProgress?.completionPercentage || 0;
                
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md ${
                      index === activeTopic
                        ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => navigateToTopic(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${getBackgroundColor(topicProgress)}`}>
                        {getTopicIcon(topicProgress)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-900">{level.topic}</h5>
                          <span className={`text-sm font-bold ${getCompletionColor(topicProgress)}`}>
                            {Math.round(completionPercentage)}%
                          </span>
                        </div>
                        
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 1, delay: 0.2 * index }}
                            className={`h-full ${getProgressBarColor(topicProgress)} rounded-full`}
                          />
                        </div>
                        
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>{topicProgress?.correctAnswers || 0} questions solved</span>
                          <span>{topicProgress ? topicProgress.categoryProgress.filter(cat => cat.isCompleted).length : 0} stages completed</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Detailed Mode - 2x2 Grid Layout for Stage Cards */
          <motion.div
            key="detailed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {currentLevel?.categories.map((category, categoryIndex) => {
                const categoryProgress = getCategoryProgress(currentLevel.id, category.categoryId);
                const currentQuestion = getCurrentQuestion(category);
                const hasProgress = categoryProgress && categoryProgress.attempts > 0;
                const completionPercentage = categoryProgress ? (categoryProgress.correctAnswers / category.totalQuestions) * 100 : 0;
                
                return (
                  <motion.div
                    key={category.categoryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + categoryIndex * 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all duration-300"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm transition-all duration-300 flex-shrink-0 ${
                            categoryProgress?.isCompleted 
                              ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white" 
                              : hasProgress
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                              : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700"
                          }`}
                        >
                          {categoryProgress?.isCompleted ? "✓" : category.categoryId}
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Stage {category.categoryId}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                            {category.categoryName}
                          </p>
                          <div className="text-xs text-gray-500">
                            Question {category.currentQuestionIndex + 1} of {category.totalQuestions}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Progress: {categoryProgress?.correctAnswers || 0}/{category.totalQuestions}
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {Math.round(completionPercentage)}%
                        </span>
                      </div>
                      
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + categoryIndex * 0.1 }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            categoryProgress?.isCompleted
                              ? "bg-gradient-to-r from-emerald-500 to-green-600"
                              : hasProgress
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                              : "bg-gradient-to-r from-gray-400 to-gray-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Current Question Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + categoryIndex * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 mb-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm flex-shrink-0 mt-0.5">
                          {currentQuestion.questionId}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 font-medium leading-relaxed mb-2 line-clamp-3">
                            {currentQuestion.questionText}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                              <span>Current Question</span>
                            </div>
                            {currentQuestion.attempts && currentQuestion.attempts > 0 && (
                              <div className="flex items-center gap-1 text-orange-600">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span>{currentQuestion.attempts} attempt{currentQuestion.attempts > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Button */}
                    <motion.button
                      onClick={() => {
                        onStartStage?.(currentLevel.id, category.categoryId, currentQuestion.questionId);
                      }}
                      className={`w-full px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 ${
                        hasProgress
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-300"
                          : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white focus:ring-emerald-300"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {hasProgress ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Continue
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Start
                          </>
                        )}
                      </span>
                    </motion.button>

                    {/* Category Stats */}
                    {hasProgress && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + categoryIndex * 0.1 }}
                        className="mt-3 flex items-center justify-between text-xs text-gray-500"
                      >
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{categoryProgress.attempts} attempts</span>
                        </div>
                        {categoryProgress.isCompleted && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Completed!</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

           
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}