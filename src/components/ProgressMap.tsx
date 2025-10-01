import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "../components/data/questions/index";
import { defaultTopics } from "../components/data/questions/index";
import { progressService, TopicProgress } from "./tugon/services/progressServices";
import color from "@/styles/color";

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
  // merged CourseCard props (mobile)
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Mobile swipe
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
      container.scrollTo({ left: targetIndex * cardWidth, behavior: "smooth" });
      setActiveTopic(Math.max(0, Math.min(targetIndex, levels.length - 1)));
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, levels.length]);

  const navigateToTopic = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, levels.length - 1));
    setActiveTopic(clampedIndex);
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

  useEffect(() => {
    if (!courses || !onActiveChange) return;
    if (activeTopic < 0 || activeTopic >= courses.length) return;
    onActiveChange(courses[activeTopic]);
  }, [activeTopic, courses, onActiveChange]);

  useEffect(() => {
    onActiveIndexChange?.(activeTopic);
  }, [activeTopic, onActiveIndexChange]);

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
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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
        {/* Header block */}
        <div
          className="p-6 border-b"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFD 100%)",
            borderColor: "#EEF3F6",
          }}
        >
          {/* Progress strip */}
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
              style={{
                background: `${color.aqua}12`,
                border: `1px solid ${color.aqua}3a`,
                color: color.teal,
              }}
            >
              {currentTopicProgress?.isCompleted ? "✓" : currentLevel?.id}
            </div>
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: `${color.mist}` }}>
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
                <span className="font-bold">
                  {Math.round(currentTopicProgress?.completionPercentage || 0)}%
                </span>
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

        {/* Horizontal scroll of categories */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {levels.map((level, levelIndex) => {
            const topicProgress = getTopicProgress(level.id);
            return (
              <div key={level.id} className="flex-shrink-0 w-full snap-center">
                <div className="h-[70vh] overflow-y-auto no-scrollbar" style={{ background: "white" }}>
                  <div className="p-5 space-y-4">
                    {level.categories.map((category) => {
                      const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                      const currentQuestion = getCurrentQuestion(category);
                      const hasProgress = categoryProgress && categoryProgress.attempts > 0;
                      const completionPercentage = categoryProgress
                        ? (categoryProgress.correctAnswers / category.totalQuestions) * 100
                        : 0;
                      const isCompleted = categoryProgress?.isCompleted;

                      return (
                        <div
                          key={category.categoryId}
                          className="rounded-2xl p-4 transition-all"
                          style={{
                            background:
                              "linear-gradient(180deg, #FFFFFF 0%, #FAFCFE 100%)",
                            border: "1px solid #E6EDF3",
                            boxShadow: hasProgress
                              ? `0 10px 20px ${color.mist}22`
                              : "0 4px 10px rgba(2, 16, 15, 0.04)",
                          }}
                        >
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                              style={{
                                background: isCompleted
                                  ? "#ECFDF5"
                                  : hasProgress
                                  ? `${color.aqua}12`
                                  : "#F1F5F9",
                                color: isCompleted ? "#047857" : color.teal,
                                border: `1px solid ${
                                  isCompleted ? "#A7F3D0" : `${color.aqua}3a`
                                }`,
                              }}
                            >
                              {isCompleted ? "✓" : category.categoryId}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold" style={{ color: color.deep }}>
                                Stage {category.categoryId}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {category.categoryName}
                              </div>

                              <div className="flex items-center justify-between">
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

                          {/* Question preview */}
                          <div
                            className="p-3 rounded-xl mb-4"
                            style={{
                              background: `${color.aqua}08`,
                              border: `1px dashed ${color.aqua}33`,
                            }}
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
                                    <span className="text-orange-600 font-medium">
                                      {currentQuestion.attempts} attempts
                                    </span>
                                  )}
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
                              <span>Start Stage</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </button>

                          {/* Footer mini-stats */}
                          {hasProgress && (
                            <div className="mt-3 flex items-center justify-between text-xs">
                              <div className="text-gray-600">
                                ⚡ {categoryProgress.attempts} attempts
                              </div>
                              {isCompleted && (
                                <div className="text-emerald-600">🏆 Completed</div>
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

        {/* Dots */}
        <div className="p-5 flex justify-center gap-3 bg-white border-t" style={{ borderColor: "#EEF3F6" }}>
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
              >
                <div
                  className="h-full rounded-3xl cursor-pointer overflow-y-auto no-scrollbar"
                  style={{
                    background: "white",
                    border: "1px solid #E6EDF3",
                    boxShadow: isActive
                      ? `0 20px 40px ${color.mist}33`
                      : "0 8px 20px rgba(2, 16, 15, 0.06)",
                  }}
                  onClick={() => !isActive && setActiveTopic(levelIndex)}
                >
                  {/* Active content */}
                  {isActive && (
                    <div className="p-5 space-y-5">
                      {level.categories.map((category) => {
                        const categoryProgress = getCategoryProgress(level.id, category.categoryId);
                        const currentQuestion = getCurrentQuestion(category);
                        const hasProgress = categoryProgress && categoryProgress.attempts > 0;
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
                              boxShadow: hasProgress
                                ? `0 10px 20px ${color.mist}22`
                                : "0 4px 10px rgba(2,16,15,0.04)",
                            }}
                          >
                            <div className="flex items-start gap-3 mb-4">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                                style={{
                                  background: isCompleted
                                    ? "#ECFDF5"
                                    : hasProgress
                                    ? `${color.aqua}12`
                                    : "#F1F5F9",
                                  color: isCompleted ? "#047857" : color.teal,
                                  border: `1px solid ${
                                    isCompleted ? "#A7F3D0" : `${color.aqua}3a`
                                  }`,
                                }}
                              >
                                {isCompleted ? "✓" : category.categoryId}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold" style={{ color: color.deep }}>
                                  Stage {category.categoryId}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  {category.categoryName}
                                </div>
                                <div className="flex items-center justify-between">
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

                            <div
                              className="p-3 rounded-xl mb-4"
                              style={{
                                background: `${color.aqua}08`,
                                border: `1px dashed ${color.aqua}33`,
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                  style={{
                                    background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
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
                                      <span className="text-orange-600 font-medium">
                                        {currentQuestion.attempts} attempts
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

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
                                <span>{isCompleted ? "Review Stage" : "Start Stage"}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </span>
                            </button>

                            {hasProgress && (
                              <div className="mt-3 flex items-center justify-between text-xs">
                                <div className="text-gray-600">⚡ {categoryProgress.attempts} attempts</div>
                                {isCompleted && <div className="text-emerald-600">🏆 Completed</div>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
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
            boxShadow:
              activeTopic === levels.length - 1 ? "none" : `0 6px 16px ${color.mist}22`,
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
