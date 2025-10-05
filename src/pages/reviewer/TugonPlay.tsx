import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionBox from "../../components/tugon/question-system/QuestionBox";
import CategoryQuestion from "../../components/tugon/question-system/CategoryQuestion";
import { defaultTopics } from "../../components/data/questions/index";
import {
  getAnswerForQuestion,
  answersByTopicAndCategory,
} from "../../components/data/answers/index";
import AnswerWizard, {
  Step,
  WizardStep,
} from "../../components/tugon/input-system/AnswerWizard";
import QuestionTemplate from "../../components/tugon/template/QuestionTemplate.tsx";
import { SubHeading } from "../../components/Typography";
import AttemptVisualizer from "../../components/tugon/AttemptVisualizer";
import { UserAttempt } from "../../components/tugon/input-system/UserInput";
import { useProgress } from "../../components/tugon/services/useProgress";
import SuccessModal from "../../components/tugon/successModal";
import color from "../../styles/color";

const FALLBACK_HINT_TEXT = "Try isolating y. Start by substituting x = 2.";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAttempts, setUserAttempts] = useState<UserAttempt[]>([]);
  const idleTimer = useRef<number | null>(null);

  const { recordAttempt, getQuestionProgress } = useProgress();

  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQuickNotification, setShowQuickNotification] = useState(false);
  const [categoryStats, setCategoryStats] = useState<{
    categoryCompleted: boolean;
    totalQuestions: number;
    questionsDetails: Array<{
      questionId: number;
      attempts: number;
      timeSpent: number;
      colorCodedHintsUsed: number;
      shortHintMessagesUsed: number;
    }>;
    totalTimeSpent: number;
    totalAttempts: number;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // URL params
  const topicId = Number(searchParams.get("topic")) || 1;
  const categoryId = Number(searchParams.get("category")) || 1;
  const questionId = Number(searchParams.get("question")) || 1;
  const legacyQ = Number(searchParams.get("q"));
  const finalCategoryId = legacyQ || categoryId;

  // Progress for this question
  const currentQuestionProgress = getQuestionProgress(
    topicId,
    finalCategoryId,
    questionId
  );

  // Reset state when question changes (single effect)
  useEffect(() => {
    setSessionStartTime(Date.now());
    setAttempts(0);
    setIsCorrect(null);
    setUserAttempts([]);
    setCurrentStepIndex(0);

    if (currentQuestionProgress) {
      console.log("📊 Current question progress:", {
        completed: currentQuestionProgress.isCompleted,
        attempts: currentQuestionProgress.attempts,
        correctAnswers: currentQuestionProgress.correctAnswers,
        timeSpent: Math.round(currentQuestionProgress.timeSpent / 60) + " minutes",
      });
    } else {
      console.log("📊 No previous progress for this question");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, finalCategoryId, questionId]);

  const getGuideText = () => {
    const topic = defaultTopics.find((t) => t.id === topicId);
    if (topic) {
      const category = topic.level.find((q) => q.category_id === finalCategoryId);
      if (category) {
        const specificQuestion = category.given_question.find(
          (gq) => gq.question_id === questionId
        );
        return specificQuestion?.guide_text || FALLBACK_HINT_TEXT;
      }
    }
    return FALLBACK_HINT_TEXT;
  };

  const [hint, setHint] = useState(getGuideText());

  useEffect(() => {
    setHint(getGuideText());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, finalCategoryId, questionId]);

  const expectedAnswers = useMemo(() => {
    const topic =
      answersByTopicAndCategory[
        topicId as keyof typeof answersByTopicAndCategory
      ];
    if (!topic) return undefined;
    const category = topic[finalCategoryId as keyof typeof topic];
    if (!category || !Array.isArray(category)) return undefined;
    const specificAnswer = category.find(
      (answer) => answer.questionId === questionId
    );
    return specificAnswer ? [specificAnswer] : undefined;
  }, [topicId, finalCategoryId, questionId]);

  const topic = defaultTopics.find((t) => t.id === topicId);
  const topicName = topic?.name || "Question";

  const getCurrentExpectedAnswer = () => {
    return getAnswerForQuestion(topicId, finalCategoryId, questionId);
  };

  const steps: Step[] = [
    { id: "s1", label: "Short answer", placeholder: "Enter a single-line answer" },
    { id: "m1", label: "Explain your steps", placeholder: "Explain in detail", rows: 4 },
    { id: "g1", label: "Graph your function" },
  ];

  const resetIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!isCorrect) setHint(`Stuck? ${getGuideText()}`);
    }, 20000);
  };

  useEffect(() => {
    resetIdle();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAttempt = ({ correct }: { correct: boolean }) => {
    const currentTime = Date.now();
    const timeSpent = Math.round((currentTime - sessionStartTime) / 1000);
    const sessionAttempts = attempts + 1;

    setAttempts(sessionAttempts);
    setIsCorrect(correct);

    const wasAlreadyCompleted = currentQuestionProgress?.isCompleted || false;

    recordAttempt({
      topicId,
      categoryId: finalCategoryId,
      questionId,
      isCorrect: correct,
      timeSpent,
      score: correct ? 100 : 0,
    });

    if (correct) {
      const modalStats = {
        attempts: sessionAttempts,
        timeSpent,
        isFirstTime: !wasAlreadyCompleted,
      };
      setSuccessStats(modalStats);
      setShowSuccessModal(true);
      setHint("Great job! 🎉 You solved it correctly.");
      return;
    }

    const baseGuideText = getGuideText();
    setHint(() => {
      if (attempts === 0) return `Hint: ${baseGuideText}`;
      if (attempts === 1) return `Try again: ${baseGuideText}`;
      return `Keep trying: ${baseGuideText}`;
    });
    resetIdle();
  };

  const handleNextQuestion = () => {
    const t = defaultTopics.find((tt) => tt.id === topicId);
    if (t) {
      const category = t.level.find((c) => c.category_id === finalCategoryId);
      if (category) {
        const currentQuestionIndex = category.given_question.findIndex(
          (q) => q.question_id === questionId
        );
        const nextQuestion = category.given_question[currentQuestionIndex + 1];

        if (nextQuestion) {
          navigate(
            `/tugonplay?topic=${topicId}&category=${finalCategoryId}&question=${nextQuestion.question_id}`
          );
        } else {
          const currentCategoryIndex = t.level.findIndex(
            (c) => c.category_id === finalCategoryId
          );
          const nextCategory = t.level[currentCategoryIndex + 1];

          if (nextCategory && nextCategory.given_question.length > 0) {
            navigate(
              `/tugonplay?topic=${topicId}&category=${nextCategory.category_id}&question=${nextCategory.given_question[0].question_id}`
            );
          } else {
            navigate("/tugonsense");
          }
        }
      }
    }
    setShowSuccessModal(false);
  };

  const handleBackToSense = () => {
    setShowSuccessModal(false);
    navigate("/tugonsense");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSessionStartTime(Date.now());
  };

  const handleSubmit = (finalSteps: WizardStep[]) => {
    console.log("Wizard steps:", finalSteps);
    console.log("Current expected answer:", getCurrentExpectedAnswer());
  };

  const handleIndexChange = (newIndex: number) => {
    setCurrentStepIndex(newIndex);
  };

  const handleAttemptUpdate = (a: UserAttempt[]) => {
    setUserAttempts(a);
    console.log("🎯 TugonPlay received attempts:", a);
  };

  // Small dev monitor; safe JSX usage (no stray comments)
  const ProgressMonitor = () => {
    if (!currentQuestionProgress) return null;
    return (
      <div
        className="fixed top-20 right-4 backdrop-blur rounded-xl p-3 shadow-lg border text-xs z-40"
        style={{
          background: `${color.deep}dd`,
          borderColor: `${color.ocean}66`,
          color: "white",
        }}
      >
        <div className="text-white/80 font-medium mb-1">Progress Monitor</div>
        <div className="space-y-1">
          <div>Attempts: {currentQuestionProgress.attempts}</div>
          <div>Correct: {currentQuestionProgress.correctAnswers}</div>
          <div>
            Status: {currentQuestionProgress.isCompleted ? "✅ Complete" : "⏳ In Progress"}
          </div>
          <div>Time: {Math.round(currentQuestionProgress.timeSpent / 60)}m</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Progress Monitor - Development only */}
      <ProgressMonitor />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onNextQuestion={handleNextQuestion}
        onBackToSense={handleBackToSense}
        questionInfo={{
          topicId,
          categoryId: finalCategoryId,
          questionId,
        }}
        stats={successStats}
      />

      {/* MOBILE (sm and below) */}
      <div className="flex-1 overflow-y-auto sm:hidden">
        {/* Mobile: Navbar + CategoryQuestion Combined */}
        <div className="bg-gradient-to-r from-[#397F85] to-[#327373]">
          {/* Navbar */}
          <div className="h-16 flex items-center justify-between px-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <SubHeading className="text-white font-bold text-lg">
                TugonPlay {currentQuestionProgress?.isCompleted && "✅"}
              </SubHeading>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span>Q{questionId}</span>
                <div className="w-1 h-4 bg-white/30 rounded-full"></div>
                <span>Topic {topicId}</span>
              </div>

              <button
                onClick={() => navigate("/tugonsense")}
                className="text-white bg-white/10 hover:bg白/20 border-none text-xl p-2 rounded-lg transition-all duration-200 hover:scale-105"
              >
                ✕
              </button>
            </div>
          </div>

          {/* CategoryQuestion */}
          <div className="px-2 pb-6">
            <CategoryQuestion
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
            />
          </div>
        </div>

        {/* Mobile: QuestionTemplate */}
        <div className="px-8 py-8 min-h-[60vh]">
          <QuestionTemplate
            key={`mobile-template-${topicId}-${finalCategoryId}-${questionId}`}
            topicId={topicId}
            categoryId={finalCategoryId}
            questionId={questionId}
            expectedAnswers={expectedAnswers}
            onValidationResult={(type) => {
              if (type === "correct" || type === "incorrect") {
                handleAttempt({ correct: type === "correct" });
              }
            }}
            onSubmit={handleSubmit}
            onIndexChange={handleIndexChange}
            onAnswerChange={resetIdle}
            onAttemptUpdate={handleAttemptUpdate}
          />
        </div>
      </div>

      {/* DESKTOP (sm and above) */}
      <div className="hidden sm:flex sm:flex-col sm:h-screen">
        {/* Top gradient section */}
        <div className="bg-gradient-to-r from-[#397F85] to-[#327373] flex-shrink-0">
          {/* Navbar */}
          <div className="h-16 flex items-center justify-between px-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <SubHeading className="text-white font-bold text-lg">
                TugonPlay {currentQuestionProgress?.isCompleted && "✅"}
              </SubHeading>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span>Q{questionId}</span>
                <div className="w-1 h-4 bg-white/30 rounded-full"></div>
                <span>Topic {topicId}</span>
              </div>

              <button
                onClick={() => navigate("/tugonsense")}
                className="text-white bg-white/10 hover:bg-white/20 border-none text-xl p-2 rounded-lg transition-all duration-200 hover:scale-105"
              >
                ✕
              </button>
            </div>
          </div>

          {/* CategoryQuestion */}
          <div className="px-4 py-8 min-h-[240px] flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <CategoryQuestion
                topicId={topicId}
                categoryId={finalCategoryId}
                questionId={questionId}
              />
            </div>
          </div>
        </div>

        {/* Middle section */}
        <div className="flex-1 bg-gray-50 overflow-y-auto min-h-[50vh]">
          <div className="container mx-auto px-12 py-10">
            <div className="max-w-2xl mx-auto">
              <div
                id="answer-wizard-container" /* desktop anchor for CharacterPositionedDesktop */
                className="rounded-2xl ring-1 ring-black/5 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${color.mist}22 0%, ${color.aqua}22 100%)`,
                }}
              >
                <QuestionTemplate
                  key={`desktop-template-${topicId}-${finalCategoryId}-${questionId}`}
                  topicId={topicId}
                  categoryId={finalCategoryId}
                  questionId={questionId}
                  expectedAnswers={expectedAnswers}
                  onValidationResult={(type) => {
                    if (type === "correct" || type === "incorrect") {
                      handleAttempt({ correct: type === "correct" });
                    }
                  }}
                  onSubmit={handleSubmit}
                  onIndexChange={handleIndexChange}
                  onAnswerChange={resetIdle}
                  onAttemptUpdate={handleAttemptUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attempt Visualizer */}
      <AttemptVisualizer
        attempts={userAttempts}
        className="animate-in slide-in-from-right duration-300"
      />

      {/* Desktop Character */}
      <CharacterPositionedDesktop />
    </div>
  );
}

// Mobile Character positioning (unchanged)
function CharacterPositionedMobile() {
  const [position, setPosition] = useState({ top: "50%", left: "50%" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 640);
      if (screenWidth < 640) {
        const questionBoxElement = document.querySelector(
          "#question-box-container-mobile .bg-white, #question-box-container-mobile .border, #question-box-container-mobile > div"
        );
        if (questionBoxElement) {
          const rect = (questionBoxElement as HTMLElement).getBoundingClientRect();
          setPosition({
            top: `${rect.top + 35}px`,
            left: `${rect.right - 60}px`,
          });
        }
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    const timer = setTimeout(updatePosition, 100);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      clearTimeout(timer);
    };
  }, []);

  if (!isMobile) return null;

  return (
    <div
      className="fixed z-50 transition-all duration-300 sm:hidden"
      style={{ top: position.top, left: position.left }}
    />
  );
}

// Desktop Character positioning (unchanged)
function CharacterPositionedDesktop() {
  const [position, setPosition] = useState({ top: "50%", left: "50%" });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth;
      setIsDesktop(screenWidth >= 640);
      if (screenWidth >= 640) {
        const container = document.getElementById("answer-wizard-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          setPosition({
            top: `${rect.top + rect.height / 2}px`,
            left: `${rect.right + 16}px`,
          });
        }
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      className="fixed z-50 transform -translate-y-1/2 transition-all duration-300"
      style={{ top: position.top, left: position.left }}
    />
  );
}