import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Timer, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import color from "../styles/color";

interface Question {
  id: string;
  question: string;
  time_limit: number;
  points: number;
}

interface Answer {
  id: string;
  answer: string;
  is_correct: boolean;
}

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  const returnTo = location.state?.returnTo || "/challenge";

  // Hide navbar on quiz page
  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (currentQuestion) {
      const start = currentQuestion.time_limit || 30;
      setTimeLeft(start);
      loadAnswers(currentQuestion.id);
      setIsAnswered(false);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
  }, [timeLeft, isAnswered]);

  const totalPoints = useMemo(
    () => (questions?.length ? questions.reduce((s, q) => s + (q.points || 0), 0) : 0),
    [questions]
  );

  const progressPct = useMemo(
    () => (questions.length ? Math.round(((questionIndex + 1) / questions.length) * 100) : 0),
    [questionIndex, questions.length]
  );

  const loadQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      const { data: questionsData, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", id)
        .order("created_at");

      if (qErr) throw qErr;

      if (questionsData && questionsData.length > 0) {
        const qs = questionsData as Question[];
        setQuestions(qs);
        setCurrentQuestion(qs[0]);
        setQuestionIndex(0);
        setScore(0);
        setCorrectCount(0);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz.");
    }
  };

  const loadAnswers = async (questionId: string) => {
    try {
      const { data: answersData, error } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", questionId);

      if (error) throw error;
      setAnswers((answersData as Answer[]) || []);
    } catch (e) {
      console.error("Error loading answers:", e);
      toast.error("Failed to load answers.");
    }
  };

  const handleTimeout = () => setIsAnswered(true);

  const handleAnswer = (answer: Answer) => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);

    if (answer.is_correct) {
      const base = currentQuestion.points || 0;
      const limit = currentQuestion.time_limit || 30;
      const timeBonus = Math.floor((timeLeft / Math.max(1, limit)) * base);
      setScore((prev) => prev + timeBonus);
      setCorrectCount((c) => c + 1);
    }
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (questionIndex > 0) {
      const prevIndex = questionIndex - 1;
      setQuestionIndex(prevIndex);
      setCurrentQuestion(questions[prevIndex]);
    }
  };

  const finishQuiz = async () => {
    try {
      await supabase.from("user_progress").insert({
        user_id: user?.id,
        quiz_id: id,
        score,
        user_email: user?.email,
      });
    } catch (e) {
      console.error("Error saving progress:", e);
      toast.error("Failed to save progress.");
    }
    setShowResult(true); // ⬅️ show final score modal
  };

  if (!quiz || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: color.teal }}
        />
      </div>
    );
  }

  const headerGradient = `linear-gradient(135deg, ${color.ocean} 0%, ${color.teal} 55%, ${color.aqua} 100%)`;
  const cardBorder = `${color.mist}66`;

  return (
    <MathJaxContext>
      <div className="min-h-screen" style={{ background: `linear-gradient(${color.mist}11, #fff)` }}>
        {/* Header (palette + progress) */}
        <header
          className="relative"
          style={{ background: headerGradient, boxShadow: "0 10px 26px rgba(0,0,0,0.08)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
                <MathJax dynamic>{quiz.title}</MathJax>
              </h1>

              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ background: "#ffffff22", border: "1px solid #ffffff33" }}
              >
                <Timer className="h-4 w-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <div className="mt-3 text-xs opacity-90">
              Question {questionIndex + 1} of {questions.length}
            </div>

            <div className="mt-2 h-2.5 w-full rounded-full overflow-hidden" style={{ background: "#ffffff2f" }}>
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: "#fff",
                  boxShadow: "0 2px 10px rgba(255,255,255,.45)",
                  transition: "width .25s ease",
                }}
              />
            </div>
          </div>
        </header>

        {/* Card */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div
            className="bg-white rounded-2xl shadow-xl ring-1 p-6 sm:p-7"
            style={{ borderColor: cardBorder }}
          >
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold" style={{ color: color.deep }}>
                <MathJax dynamic>{currentQuestion.question}</MathJax>
              </h2>
            </div>

            {/* Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {answers.map((answer) => {
                const isCorrect = answer.is_correct;
                const base =
                  "p-4 rounded-xl text-left transition-all border-2 focus:outline-none focus-visible:ring-2";
                const neutral =
                  "bg-gray-50 hover:bg-gray-100 border-transparent focus-visible:ring-[rgba(0,0,0,.06)]";
                const whenAnswered = isCorrect
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500";
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswer(answer)}
                    disabled={isAnswered}
                    className={`${base} ${isAnswered ? whenAnswered : neutral}`}
                  >
                    <div className="flex items-center">
                      <span className="flex-grow" style={{ color: color.deep }}>
                        <MathJax dynamic>{answer.answer}</MathJax>
                      </span>
                      {isAnswered &&
                        (isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevQuestion}
                disabled={questionIndex === 0}
                className="px-4 py-2 rounded-lg disabled:opacity-50 border"
                style={{ background: "#fff", color: color.deep, borderColor: cardBorder }}
              >
                Prev
              </button>

              <div className="text-sm sm:text-base font-semibold" style={{ color: color.steel }}>
                Points: <span style={{ color: color.teal }}>{score}</span> / {totalPoints}
              </div>

              <button
                onClick={nextQuestion}
                className="px-4 py-2 rounded-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                }}
              >
                {questionIndex === questions.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </main>

        {/* Final Score Modal */}
        {showResult && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,.32)" }}
          >
            <div
              className="w-[92%] max-w-md rounded-2xl shadow-2xl ring-1 p-6"
              style={{ background: "#fff", borderColor: cardBorder }}
            >
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                    color: "#fff",
                  }}
                >
                  🏁
                </div>
                <h3 className="text-xl font-extrabold" style={{ color: color.deep }}>
                  Challenge Completed!
                </h3>
                <p className="mt-1 text-sm" style={{ color: color.steel }}>
                  You answered <strong>{correctCount}</strong> out of{" "}
                  <strong>{questions.length}</strong> correctly.
                </p>

                <div className="mt-4 text-3xl font-extrabold" style={{ color: color.teal }}>
                  {score} <span className="text-base font-semibold" style={{ color: color.steel }}>/ {totalPoints}</span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      // restart current quiz quickly
                      setShowResult(false);
                      setQuestionIndex(0);
                      setCurrentQuestion(questions[0]);
                      setScore(0);
                      setCorrectCount(0);
                    }}
                    className="px-4 py-2 rounded-lg border font-semibold"
                    style={{ background: "#fff", color: color.deep, borderColor: cardBorder }}
                  >
                    Retry Quiz
                  </button>
                  <button
                    onClick={() => navigate(returnTo)}
                    className="px-4 py-2 rounded-lg text-white font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                    }}
                  >
                    Back to Challenges
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}

export default Quiz;
