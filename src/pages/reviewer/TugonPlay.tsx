import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoryQuestion from "../../components/tugon/question-system/CategoryQuestion";
import { defaultTopics } from "../../components/data/questions/index";
import {
  getAnswerForQuestion,
  answersByTopicAndCategory,
} from "../../components/data/answers/index";
import QuestionTemplate from "../../components/tugon/template/QuestionTemplate";
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

  // ===== URL params =====
  const topicId = Number(searchParams.get("topic")) || 1;
  const categoryId = Number(searchParams.get("category")) || 1;
  const questionId = Number(searchParams.get("question")) || 1;

  // ===== State management =====
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAttempts, setUserAttempts] = useState<UserAttempt[]>([]);
  const [hint, setHint] = useState(FALLBACK_HINT_TEXT);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successStats, setSuccessStats] = useState<{
    attempts: number;
    timeSpent: number;
    isFirstTime: boolean;
  } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  const idleTimer = useRef<number | null>(null);
  const { recordAttempt, getQuestionProgress } = useProgress();

  // ===== Question Data =====
  const topic = defaultTopics.find((t) => t.id === topicId);
  const category = topic?.level.find((c) => c.category_id === categoryId);
  const currentQuestion = category?.given_question.find(
    (q) => q.question_id === questionId
  );

  // ===== Progress =====
  const currentQuestionProgress = getQuestionProgress(topicId, categoryId, questionId);

  // ===== Expected answer =====
  const expectedAnswers = useMemo(() => {
    const topicSet = answersByTopicAndCategory[topicId];
    if (!topicSet) return undefined;
    const categorySet = topicSet[categoryId];
    if (!categorySet || !Array.isArray(categorySet)) return undefined;
    const specificAnswer = categorySet.find(
      (a) => a.questionId === questionId
    );
    return specificAnswer ? [specificAnswer] : undefined;
  }, [topicId, categoryId, questionId]);

  // ===== Reset on question change =====
  useEffect(() => {
    setSessionStartTime(Date.now());
    setAttempts(0);
    setIsCorrect(null);
    setUserAttempts([]);
    setCurrentStepIndex(0);
    setHint(currentQuestion?.guide_text || FALLBACK_HINT_TEXT);
  }, [topicId, categoryId, questionId, currentQuestion?.guide_text]);

  // ===== Idle hint =====
  const resetIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!isCorrect) setHint(`Need help? ${currentQuestion?.guide_text || FALLBACK_HINT_TEXT}`);
    }, 20000);
  };

  useEffect(() => {
    resetIdle();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  // ===== Handle Attempts =====
  const handleAttempt = ({ correct }: { correct: boolean }) => {
    const now = Date.now();
    const timeSpent = Math.round((now - sessionStartTime) / 1000);
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setIsCorrect(correct);

    recordAttempt({
      topicId,
      categoryId,
      questionId,
      isCorrect: correct,
      timeSpent,
      score: correct ? 100 : 0,
    });

    if (correct) {
      setSuccessStats({
        attempts: newAttempts,
        timeSpent,
        isFirstTime: !currentQuestionProgress?.isCompleted,
      });
      setShowSuccessModal(true);
      setHint("Great job! 🎉 You solved it!");
    } else {
      setHint(`Try again! ${currentQuestion?.guide_text || FALLBACK_HINT_TEXT}`);
    }
  };

  // ===== Navigation Controls =====
  const handleNextQuestion = () => {
    if (!topic || !category) return;
    const questionIndex = category.given_question.findIndex(
      (q) => q.question_id === questionId
    );
    const nextQuestion = category.given_question[questionIndex + 1];

    if (nextQuestion) {
      navigate(
        `/tugonplay?topic=${topicId}&category=${categoryId}&question=${nextQuestion.question_id}`
      );
    } else {
      const nextCategory = topic.level[topic.level.indexOf(category) + 1];
      if (nextCategory && nextCategory.given_question.length > 0) {
        navigate(
          `/tugonplay?topic=${topicId}&category=${nextCategory.category_id}&question=${nextCategory.given_question[0].question_id}`
        );
      } else {
        navigate("/tugonsense");
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

  // ===== Attempt Visualizer Update =====
  const handleAttemptUpdate = (attempts: UserAttempt[]) => {
    setUserAttempts(attempts);
  };

  const handleSubmit = (steps: any) => {
    console.log("Submitted Steps:", steps);
  };

  const handleIndexChange = (i: number) => {
    setCurrentStepIndex(i);
  };

  // ===== Dev Overlay =====
  const ProgressMonitor = () => {
    if (!currentQuestionProgress) return null;
    return (
      <div
        className="fixed top-20 right-4 p-3 text-xs text-white rounded-xl shadow-lg z-50"
        style={{
          background: `${color.deep}cc`,
          border: `1px solid ${color.teal}55`,
        }}
      >
        <div className="font-bold mb-1">Progress Monitor</div>
        <div>Attempts: {currentQuestionProgress.attempts}</div>
        <div>Correct: {currentQuestionProgress.correctAnswers}</div>
        <div>
          Status:{" "}
          {currentQuestionProgress.isCompleted ? "✅ Complete" : "⏳ In Progress"}
        </div>
        <div>Time: {Math.round(currentQuestionProgress.timeSpent / 60)}m</div>
      </div>
    );
  };

  // ===== Blank Handling =====
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <h2 className="text-lg font-semibold mb-2">Question not found</h2>
        <button
          onClick={() => navigate("/tugonsense")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Back to Topics
        </button>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <ProgressMonitor />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onNextQuestion={handleNextQuestion}
        onBackToSense={handleBackToSense}
        questionInfo={{ topicId, categoryId, questionId }}
        stats={successStats}
      />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#397F85] to-[#327373] shadow-lg">
        <div className="h-16 flex items-center justify-between px-6">
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

        {/* Category header */}
        <div className="px-6 py-6">
          <CategoryQuestion
            topicId={topicId}
            categoryId={categoryId}
            questionId={questionId}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gray-50 overflow-y-auto py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <QuestionTemplate
            topicId={topicId}
            categoryId={categoryId}
            questionId={questionId}
            expectedAnswers={expectedAnswers}
            onValidationResult={(type) => {
              handleAttempt({ correct: type === "correct" });
            }}
            onSubmit={handleSubmit}
            onIndexChange={handleIndexChange}
            onAnswerChange={resetIdle}
            onAttemptUpdate={handleAttemptUpdate}
          />
        </div>
      </div>

      {/* Attempt Visualizer */}
      <AttemptVisualizer
        attempts={userAttempts}
        className="animate-in slide-in-from-right duration-300"
      />
    </div>
  );
}
