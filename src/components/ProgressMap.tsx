import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "../components/data/questions/index";
import { defaultTopics } from "../components/data/questions/index";
import { progressService, TopicProgress } from "./tugon/services/progressServices";
import color from "@/styles/color";
import { Check, ChevronLeft, ChevronRight, ChevronDown, FileText, CheckCircle, Zap, Play } from "lucide-react";

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
  categoryTitle?: string;
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
  overallStats,
}: Props) {
  const [userProgress, setUserProgress] = useState(progressService.getUserProgress());
  const [isMobile, setIsMobile] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set()); // Track which categories are expanded
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Helper to format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getRandomQuestionIndex = (
    questions: QuestionInfo[],
    topicId: number,
    categoryId: number
  ): number => {
    if (questions.length === 0) return 0;
    const categoryStats = progressService.getCategoryStats(topicId, categoryId);
    if (
      categoryStats.currentQuestionIndex >= 0 &&
      categoryStats.currentQuestionIndex < questions.length
    ) {
      return categoryStats.currentQuestionIndex;
    }
    const newIndex = Math.floor(Math.random() * questions.length);
    progressService.updateCurrentQuestionIndex(topicId, categoryId, newIndex);
    return newIndex;
  };

  const levels: Level[] = useMemo(() => {
    const topicDescriptions = [
      "Learn to wield important tools in number sense and computation.",
      "Master advanced algebraic concepts and problem-solving techniques.",
      "Explore geometric relationships and spatial reasoning skills.",
      "Dive into statistical analysis and data interpretation methods.",
      "Understand calculus fundamentals and mathematical analysis.",
    ];

    return defaultTopics.map((topic, index) => ({
      id: topic.id,
      name: `Level ${topic.id}`,
      topic: topic.name,
      description:
        topicDescriptions[index] ||
        "Enhance your mathematical thinking and problem-solving abilities.",
      categories: topic.level.map((category) => {
        const questions = category.given_question.map((question) => {
          const progressData = userProgress?.topicProgress
            ?.find((tp: { topicId: number; categoryProgress: any[] }) => tp.topicId === topic.id)
            ?.categoryProgress?.find((cp: { categoryId: number }) => cp.categoryId === category.category_id)
            ?.questionProgress?.find((qp: { questionId: number }) => qp.questionId === question.question_id);

          return {
            questionId: question.question_id,
            questionText: question.question_text || `Question ${question.question_id}`,
            isCompleted: progressData?.isCompleted || false,
            attempts: progressData?.attempts || 0,
          };
        });

        const currentQuestionIndex = getRandomQuestionIndex(
          questions,
          topic.id,
          category.category_id
        );

        return {
          categoryId: category.category_id,
          categoryName: category.category_question,
          categoryTitle: category.title,
          questions,
          totalQuestions: questions.length,
          currentQuestionIndex,
        };
      }),
    }));
  }, [userProgress]);

  useEffect(() => {
    const refreshProgress = () => {
      const p = progressService.getUserProgress();
      if (p) setUserProgress(p);
    };
    refreshProgress();
    window.addEventListener("focus", refreshProgress);
    const interval = setInterval(refreshProgress, 30000);
    return () => {
      window.removeEventListener("focus", refreshProgress);
      clearInterval(interval);
    };
  }, []);

  // Navigation helpers
  const navigateToTopic = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, levels.length - 1));
    setActiveTopic(clampedIndex);
    onActiveIndexChange?.(clampedIndex);
    if (courses && courses[clampedIndex] && onActiveChange) {
      onActiveChange(courses[clampedIndex]);
    }
    if (isMobile && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: clampedIndex * scrollContainerRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const goToPrevious = () => {
    if (activeTopic > 0) navigateToTopic(activeTopic - 1);
  };
  const goToNext = () => {
    if (activeTopic < levels.length - 1) navigateToTopic(activeTopic + 1);
  };

  const getCategoryProgress = (topicId: number, categoryId: number) =>
    progressService.getCategoryStats(topicId, categoryId);

  const getTopicProgress = (topicId: number) =>
    userProgress?.topicProgress?.find((tp: { topicId: number }) => tp.topicId === topicId);

  const getCurrentQuestion = (category: CategoryInfo): QuestionInfo =>
    category.questions[category.currentQuestionIndex] || category.questions[0];

  const getNextQuestionId = (topicId: number, categoryId: number): number => {
    const categoryStats = progressService.getCategoryStats(topicId, categoryId);
    const category = levels
      .find((l) => l.id === topicId)
      ?.categories.find((c) => c.categoryId === categoryId);

    if (!category) return 1;
    
    // ✨ NEW: If category has been completed before (everCompleted) but isCompleted is false,
    // it means we're starting a fresh replay - start from question 1
    const categoryProgress = progressService.getCategoryProgress(topicId, categoryId);
    if (categoryProgress?.everCompleted && !categoryProgress?.isCompleted) {
      console.log(`🔄 Starting fresh replay of Category ${categoryId} from Question 1`);
      return category.questions[0]?.questionId || 1;
    }
    
    let nextIndex = categoryStats.currentQuestionIndex;
    for (let i = 0; i < category.questions.length; i++) {
      const questionIndex = (nextIndex + i) % category.questions.length;
      const question = category.questions[questionIndex];
      if (!question.isCompleted) return question.questionId;
    }
    return category.questions[0]?.questionId || 1;
  };

  if (levels.length === 0) {
    return (
      <div
        className="w-full max-w-lg mx-auto rounded-3xl p-6 md:p-8"
        style={{
          background: "white",
          border: "1px solid #E6EDF3",
          boxShadow: `0 12px 28px ${color.mist}22`,
        }}
      >
        <div className="text-center py-16">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: "#F8FAFC" }}
          >
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <div className="text-gray-500 text-sm font-medium">No topics available</div>
        </div>
      </div>
    );
  }

  /* ============================
     Mobile Layout (merged card)
     ============================ */
  if (isMobile) {
    const currentLevel = levels[activeTopic];
    const currentTopicProgress = getTopicProgress(currentLevel?.id);
    const stats = overallStats || progressService.getStatistics();

    return (
      <div
        className="w-full mx-auto rounded-3xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid #E6EDF3",
          boxShadow: `0 12px 28px ${color.mist}22`,
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFD 100%)",
            borderColor: "#EEF3F6",
          }}
        >
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
              style={{
                background: `${color.aqua}12`,
                border: `1px solid ${color.aqua}3a`,
                color: color.teal,
              }}
            >
              {currentTopicProgress?.isCompleted ? <Check className="w-6 h-6" /> : currentLevel?.id}
            </div>
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: `${color.mist}` }}>
              {currentLevel?.name}
            </div>
            <h1 className="text-xl font-black tracking-tight mt-1" style={{ color: color.deep }}>
              {currentLevel?.topic}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{currentLevel?.description}</p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Topic Progress</span>
                <span className="font-bold">{Math.round(currentTopicProgress?.completionPercentage || 0)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E6EDF3" }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${currentTopicProgress?.completionPercentage || 0}%`,
                    background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div ref={scrollContainerRef} className="h-[70vh] overflow-y-auto no-scrollbar" style={{ background: "white" }}>
          <div className="p-5 space-y-4">
            {currentLevel.categories.map((category) => {
              const categoryProgress = getCategoryProgress(currentLevel.id, category.categoryId);
              const currentQuestion = getCurrentQuestion(category);
              const hasProgress = !!categoryProgress && categoryProgress.attempts > 0;
              const completionPercentage = categoryProgress
                ? (categoryProgress.correctAnswers / category.totalQuestions) * 100
                : 0;
              const isCompleted = categoryProgress?.isCompleted;

              return (
                <div
                  key={category.categoryId}
                  className="rounded-2xl p-4 transition-all"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFE 100%)",
                    border: "1px solid #E6EDF3",
                    boxShadow: hasProgress ? `0 10px 20px ${color.mist}22` : "0 4px 10px rgba(2, 16, 15, 0.04)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        background: isCompleted ? "#ECFDF5" : hasProgress ? `${color.aqua}12` : "#F1F5F9",
                        color: isCompleted ? "#047857" : color.teal,
                        border: `1px solid ${isCompleted ? "#A7F3D0" : `${color.aqua}3a`}`,
                      }}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : category.categoryId}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: color.deep }}>
                        Stage {category.categoryId}
                        {category.categoryTitle && (
                          <span className="ml-2 text-xs font-semibold text-teal-600">
                            • {category.categoryTitle}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{category.categoryName}</p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">Progress</span>
                        <span
                          className={`text-xs font-bold ${
                            isCompleted ? "text-emerald-600" : hasProgress ? "text-teal-600" : "text-gray-500"
                          }`}
                        >
                          {Math.round(completionPercentage)}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full transition-all duration-700 ease-out rounded-full shadow-sm"
                          style={{
                            width: `${completionPercentage}%`,
                            background: isCompleted
                              ? "linear-gradient(to right, #10b981, #059669)"
                              : hasProgress
                              ? "linear-gradient(to right, #14b8a6, #0d9488)"
                              : "linear-gradient(to right, #a855f7, #9333ea)",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: "#E6EDF3" }}>
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${completionPercentage}%`,
                                background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
                              }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 text-center font-medium">
                            {categoryProgress?.correctAnswers || 0} of {category.totalQuestions} questions correct
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const nextQuestionId = getNextQuestionId(currentLevel.id, category.categoryId);
                            onStartStage?.(currentLevel.id, category.categoryId, nextQuestionId);
                          }}
                          className="py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow hover:shadow-md text-white"
                          style={{
                            backgroundColor: isCompleted ? "#10b981" : "#14b8a6",
                            boxShadow: isCompleted
                              ? "0 6px 18px rgba(16, 185, 129, 0.45)"
                              : "0 6px 18px rgba(20, 184, 166, 0.45)",
                          }}
                        >
                          {isCompleted ? "Review Stage" : hasProgress ? "Continue Stage" : "Start Stage"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Question preview */}
                  <div
                    className="p-3 rounded-xl mb-4"
                    style={{ background: `${color.aqua}08`, border: `1px dashed ${color.aqua}33` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                        style={{
                          background: `linear-gradient(180deg, ${color.teal}, ${color.aqua})`,
                          color: "white",
                        }}
                      >
                        {currentQuestion.questionId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 line-clamp-2 font-medium leading-relaxed mb-1">
                          {currentQuestion.questionText}
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span style={{ color: color.teal }} className="font-bold">
                            NEXT UP
                          </span>
                          {!!currentQuestion.attempts && currentQuestion.attempts > 0 && (
                            <span className="text-orange-600 font-medium">{currentQuestion.attempts} attempts</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                    <button
                      onClick={() => {
                        const nextQuestionId = getNextQuestionId(currentLevel.id, category.categoryId);
                        onStartStage?.(currentLevel.id, category.categoryId, nextQuestionId);
                      }}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-transform active:scale-95"
                      style={{
                        background: isCompleted
                          ? "linear-gradient(90deg, #10B981, #059669)"
                          : `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
                        color: "white",
                        boxShadow: `0 10px 22px ${color.aqua}33`,
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span>Start Stage</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>

                  {/* Footer mini-stats with expandable details */}
                  {hasProgress && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleCategoryExpansion(category.categoryId)}
                        className="w-full flex items-center justify-between text-xs transition-colors hover:opacity-70"
                      >
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{categoryProgress.attempts} attempts</span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </div>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedCategories.has(category.categoryId) ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expandable Question Stats */}
                      {expandedCategories.has(category.categoryId) && (
                        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
                          {category.questions.map((question) => {
                            // Get full category progress with questionProgress array
                            const fullCategoryProgress = progressService.getCategoryProgress(currentLevel.id, category.categoryId);
                            const questionProgress = fullCategoryProgress?.questionProgress?.find(
                              (qp: any) => qp.questionId === question.questionId
                            );
                            
                            if (!questionProgress || questionProgress.attempts === 0) {
                              return null;
                            }

                            return (
                              <div
                                key={question.questionId}
                                className="p-3 rounded-lg"
                                style={{
                                  background: questionProgress.isCompleted ? "#F0FDF4" : "#FEF3C7",
                                  border: `1px solid ${questionProgress.isCompleted ? "#BBF7D0" : "#FDE68A"}`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div
                                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0"
                                    style={{
                                      background: questionProgress.isCompleted
                                        ? "linear-gradient(135deg, #10B981, #059669)"
                                        : "linear-gradient(135deg, #F59E0B, #D97706)",
                                      color: "white",
                                    }}
                                  >
                                    {questionProgress.isCompleted ? "✓" : question.questionId}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold text-gray-800">
                                      Question {question.questionId}
                                    </div>
                                  </div>
                                </div>

                                {/* Time Spent - Inline Display */}
                                {(() => {
                                  // Always use latest attempt
                                  const displayData = questionProgress.latestAttempt || {
                                    timeSpent: questionProgress.timeSpent,
                                    attempts: questionProgress.attempts,
                                    colorHintsUsed: questionProgress.colorCodedHintsUsed,
                                    shortHintsUsed: questionProgress.shortHintMessagesUsed,
                                  };

                                  return (
                                    <>
                                      <div className="mb-2 text-right text-xs text-gray-600">
                                        Time spent: <span className="font-bold text-gray-800">{formatTime(displayData.timeSpent)}</span>
                                      </div>

                                      {/* Stats Grid - 3 metrics */}
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                          <div className="font-bold text-gray-800 text-sm">{displayData.attempts}</div>
                                          <div className="text-gray-600 text-xs mt-0.5">Attempts</div>
                                        </div>
                                        
                                        <div className="text-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                          <div className="font-bold text-gray-800 text-sm">{displayData.colorHintsUsed}</div>
                                          <div className="text-gray-600 text-xs mt-0.5">Color Hints</div>
                                        </div>
                                        
                                        <div className="text-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                          <div className="font-bold text-gray-800 text-sm">{displayData.shortHintsUsed}</div>
                                          <div className="text-gray-600 text-xs mt-0.5">Context Hints</div>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            );
                          })}
                          
                          {category.questions.every(q => {
                            const fullCategoryProgress = progressService.getCategoryProgress(currentLevel.id, category.categoryId);
                            const qp = fullCategoryProgress?.questionProgress?.find(
                              (qprog: any) => qprog.questionId === q.questionId
                            );
                            return !qp || qp.attempts === 0;
                          }) && (
                            <div className="text-center text-xs text-gray-400 py-2">
                              No statistics yet. Start the stage to track your progress!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination dots */}
        <div className="p-5 flex justify-center gap-3 bg-white border-t" style={{ borderColor: "#EEF3F6" }}>
          {levels.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToTopic(index)}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: index === activeTopic ? 32 : 10,
                background:
                  index === activeTopic ? `linear-gradient(90deg, ${color.teal}, ${color.aqua})` : "#CBD5E1",
                boxShadow: index === activeTopic ? `0 4px 10px ${color.aqua}44` : "none",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ============================
     Desktop Layout (stacked)
     ============================ */
  return (
    <div
      className="w-full max-w-lg mx-auto rounded-3xl p-4 sm:p-5 md:p-7"
      style={{
        background: "white",
        border: "1px solid #E6EDF3",
        boxShadow: `0 12px 28px ${color.mist}22`,
      }}
    >
      <div className="relative h-[62vh] overflow-hidden">
        <div className="relative h-full">
          {levels.map((level, levelIndex) => {
            const isActive = levelIndex === activeTopic;
            const isPrevious = levelIndex < activeTopic;
            const isNext = levelIndex > activeTopic;
            const topicProgress = getTopicProgress(level.id);

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
              const d = activeTopic - levelIndex;
              translateY = -d * 10;
              scale = Math.max(0.94 - d * 0.03, 0.88);
              opacity = Math.max(0.6 - d * 0.15, 0.2);
              blur = Math.min(d * 0.5, 2);
            } else if (isNext) {
              const d = levelIndex - activeTopic;
              translateY = d * 10;
              scale = Math.max(0.94 - d * 0.03, 0.88);
              opacity = Math.max(0.6 - d * 0.15, 0.2);
              blur = Math.min(d * 0.5, 2);
            }

            return (
              <div
                key={level.id}
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  filter: blur > 0 ? `blur(${blur}px)` : "none",
                }}
                onClick={() => !isActive && setActiveTopic(levelIndex)}
              >
                <div
                  className="h-full rounded-3xl cursor-pointer overflow-y-auto no-scrollbar"
                  style={{
                    background: "white",
                    border: "1px solid #E6EDF3",
                    boxShadow: isActive ? `0 20px 40px ${color.mist}33` : "0 8px 20px rgba(2, 16, 15, 0.06)",
                  }}
                >
                  {isActive ? (
                    <div className="p-5 space-y-5">
                      {level.categories.map((category) => {
                        const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                        const currentQuestion = getCurrentQuestion(category);
                        const hasProgress = !!categoryProgress && categoryProgress.attempts > 0;
                        const completionPercentage = categoryProgress
                          ? (categoryProgress.correctAnswers / category.totalQuestions) * 100
                          : 0;
                        const isCompleted = categoryProgress?.isCompleted;

                        return (
                          <div
                            key={category.categoryId}
                            className="rounded-2xl p-4 transition-all"
                            style={{
                              background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFE 100%)",
                              border: "1px solid #E6EDF3",
                              boxShadow: hasProgress ? `0 10px 20px ${color.mist}22` : "0 4px 10px rgba(2,16,15,0.04)",
                            }}
                          >
                            <div className="flex items-start gap-3 mb-4">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                                style={{
                                  background: isCompleted ? "#ECFDF5" : hasProgress ? `${color.aqua}12` : "#F1F5F9",
                                  color: isCompleted ? "#047857" : color.teal,
                                  border: `1px solid ${isCompleted ? "#A7F3D0" : `${color.aqua}3a`}`,
                                }}
                              >
                                {isCompleted ? <Check className="w-5 h-5" /> : category.categoryId}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-lg font-bold" style={{ color: color.deep }}>
                    
                                  {category.categoryTitle && (
                                    <span className="ml-2 text-base font-bold text-teal-600">
                                      {category.categoryTitle}
                                    </span>
                                  )}
                                </div>
                             

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: "#E6EDF3" }}>
                                      <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                          width: `${completionPercentage}%`,
                                          background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600 font-semibold">
                                      {categoryProgress?.correctAnswers || 0}/{category.totalQuestions}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 font-medium">
                                    Question: {category.currentQuestionIndex + 1}/{category.totalQuestions}
                                  </div>
                                </div>
                              </div>
                            </div>

                      
                          

                            {/* CTA */}
                            <button
                              onClick={() => {
                                const nextQuestionId = getNextQuestionId(level.id, category.categoryId);
                                onStartStage?.(level.id, category.categoryId, nextQuestionId);
                              }}
                              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-transform active:scale-95"
                              style={{
                                background: isCompleted
                                  ? "linear-gradient(90deg, #10B981, #059669)"
                                  : `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
                                color: "white",
                                boxShadow: `0 10px 22px ${color.aqua}33`,
                              }}
                            >
                              <span className="inline-flex items-center gap-2">
                                <span>{isCompleted ? "Retry Stage" : "Start Stage"}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </span>
                            </button>

                            {/* Footer status with expandable stats */}
                            <div className="pt-3 border-t border-gray-100">
                              <button
                                onClick={() => toggleCategoryExpansion(category.categoryId)}
                                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-70"
                              >
                                <span
                                  className={`flex items-center gap-1.5 ${
                                    isCompleted ? "text-emerald-600" : hasProgress ? "text-teal-600" : "text-indigo-600"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>See Latest Attempt</span>
                                    </>
                                  ) : hasProgress ? (
                                    <>
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>See Current Attempt</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3.5 h-3.5" />
                                      <span>Try to See Statistics</span>
                                    </>
                                  )}
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    expandedCategories.has(category.categoryId) ? "rotate-180" : ""
                                  } ${
                                    isCompleted ? "text-emerald-500" : hasProgress ? "text-teal-500" : "text-indigo-500"
                                  }`}
                                />
                              </button>

                              {/* Expandable Question Stats */}
                              {expandedCategories.has(category.categoryId) && (
                                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
                                  {category.questions.map((question) => {
                                    // Get full category progress with questionProgress array
                                    const fullCategoryProgress = progressService.getCategoryProgress(level.id, category.categoryId);
                                    const questionProgress = fullCategoryProgress?.questionProgress?.find(
                                      (qp: any) => qp.questionId === question.questionId
                                    );
                                    
                                    if (!questionProgress || questionProgress.attempts === 0) {
                                      return null; // Don't show questions with no attempts
                                    }

                                    return (
                                      <div
                                        key={question.questionId}
                                        className="p-3 rounded-lg"
                                        style={{
                                          background: questionProgress.isCompleted ? "#F0FDF4" : "#FEF3C7",
                                          border: `1px solid ${questionProgress.isCompleted ? "#BBF7D0" : "#FDE68A"}`,
                                        }}
                                      >
                                        <div className="flex items-center gap-2 mb-3">
                                          <div
                                            className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{
                                              background: questionProgress.isCompleted
                                                ? "linear-gradient(135deg, #10B981, #059669)"
                                                : "linear-gradient(135deg, #F59E0B, #D97706)",
                                              color: "white",
                                            }}
                                          >
                                            {questionProgress.isCompleted ? "✓" : question.questionId}
                                          </div>
                                          <div className="flex-1 flex items-center justify-between">
                                            <div className="text-sm font-bold text-gray-800">
                                              Question {question.questionId}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Time Spent - Inline Display */}
                                        {(() => {
                                          // Always use latest attempt
                                          const displayData = questionProgress.latestAttempt || {
                                            timeSpent: questionProgress.timeSpent,
                                            attempts: questionProgress.attempts,
                                            colorHintsUsed: questionProgress.colorCodedHintsUsed,
                                            shortHintsUsed: questionProgress.shortHintMessagesUsed,
                                          };

                                          return (
                                            <>
                                              <div className="mb-2 text-right text-xs text-gray-600">
                                                Time spent: <span className="font-bold text-gray-800">{formatTime(displayData.timeSpent)}</span>
                                              </div>

                                              {/* Stats Grid - 3 metrics */}
                                              <div className="grid grid-cols-3 gap-2">
                                                <div className="text-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                                  <div className="font-bold text-gray-800 text-sm">{displayData.attempts}</div>
                                                  <div className="text-gray-600 text-xs mt-0.5">Attempts</div>
                                                </div>
                                                
                                                <div className="text-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                                  <div className="font-bold text-gray-800 text-sm">{displayData.colorHintsUsed}</div>
                                                  <div className="text-gray-600 text-xs mt-0.5">Color Hints</div>
                                                </div>
                                                
                                                <div className="text-center py-2 px-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                                  <div className="font-bold text-gray-800 text-sm">{displayData.shortHintsUsed}</div>
                                                  <div className="text-gray-600 text-xs mt-0.5">Context Hints</div>
                                                </div>
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    );
                                  })}
                                  
                                  {category.questions.every(q => {
                                    const fullCategoryProgress = progressService.getCategoryProgress(level.id, category.categoryId);
                                    const qp = fullCategoryProgress?.questionProgress?.find(
                                      (qprog: any) => qprog.questionId === q.questionId
                                    );
                                    return !qp || qp.attempts === 0;
                                  }) && (
                                    <div className="text-center text-xs text-gray-400 py-2">
                                      No statistics yet. Start the stage to track your progress!
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-gray-500 text-sm font-medium mb-2">Click to view stages</div>
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

      {/* Arrow + dots */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={goToPrevious}
          disabled={activeTopic === 0}
          className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition disabled:opacity-40"
          style={{
            borderColor: activeTopic === 0 ? "#E2E8F0" : `${color.aqua}55`,
            background: "white",
            color: activeTopic === 0 ? "#94A3B8" : color.teal,
            boxShadow: activeTopic === 0 ? "none" : `0 6px 16px ${color.mist}22`,
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex justify-center gap-3">
          {levels.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToTopic(index)}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: index === activeTopic ? 32 : 10,
                background:
                  index === activeTopic
                    ? `linear-gradient(90deg, ${color.teal}, ${color.aqua})`
                    : "#CBD5E1",
                boxShadow: index === activeTopic ? `0 4px 10px ${color.aqua}44` : "none",
              }}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={activeTopic === levels.length - 1}
          className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition disabled:opacity-40"
          style={{
            borderColor: activeTopic === levels.length - 1 ? "#E2E8F0" : `${color.aqua}55`,
            background: "white",
            color: activeTopic === levels.length - 1 ? "#94A3B8" : color.teal,
            boxShadow: activeTopic === levels.length - 1 ? "none" : `0 6px 16px ${color.mist}22`,
          }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}