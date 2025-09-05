import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Star, RefreshCcw, Flame, Heart, Lightbulb, Share2, Home, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import color from "../styles/color";

type Question = {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
};

// --- Curated questions (expand/replace with Supabase later) ---
const BANK: Question[] = [
  {
    question: "Evaluate f(x) = 2x + 3 at x = 5.",
    options: ["10", "11", "13", "15"],
    answer: "13",
    hint: "Plug in x = 5 then multiply first, add after.",
    explanation: "f(5) = 2(5) + 3 = 10 + 3 = 13.",
  },
  {
    question: "Solve: log₂(8) = ?",
    options: ["2", "3", "4", "8"],
    answer: "3",
    hint: "2 raised to what power is 8?",
    explanation: "Since 2³ = 8, log₂(8) = 3.",
  },
  {
    question: "Domain of 1 / (x - 2):",
    options: ["x ≠ 2", "x ≥ 2", "All real numbers", "x < 2"],
    answer: "x ≠ 2",
    hint: "Denominator cannot be 0.",
    explanation: "x - 2 ≠ 0 ⇒ x ≠ 2. All other real numbers are fine.",
  },
  {
    question: "If f(x)=x², compute f(–3).",
    options: ["–9", "9", "–6", "3"],
    answer: "9",
    hint: "Square removes the sign.",
    explanation: "f(–3)= (–3)² = 9.",
  },
  {
    question: "For g(x)=3x–4, find x if g(x)=11.",
    options: ["x=5", "x=3", "x=7", "x=–5"],
    answer: "x=5",
    hint: "Solve 3x – 4 = 11.",
    explanation: "3x – 4 = 11 ⇒ 3x = 15 ⇒ x = 5.",
  },
];

const GAME_LENGTH = 5;          // number of questions per run
const TIME_PER_Q = 30;          // seconds per question
const MAX_LIVES = 3;            // hearts
const XP_CORRECT = 10;          // base XP per correct

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function DailyChallengeGame() {
  // Window size for confetti
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Game state
  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const currentQ = deck[index];

  // Prepare deck
  useEffect(() => {
    const picked = shuffle(BANK).slice(0, GAME_LENGTH);
    setDeck(picked);
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver || !currentQ || result) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver, result, currentQ]);

  // Keyboard shortcuts: 1..4 to pick option
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentQ || gameOver || result) return;
      const num = Number(e.key);
      if (num >= 1 && num <= currentQ.options.length) {
        handleAnswer(currentQ.options[num - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQ, gameOver, result]);

  // Progress values
  const progressPct = useMemo(
    () => Math.round(((TIME_PER_Q - timeLeft) / TIME_PER_Q) * 100),
    [timeLeft]
  );

  const handleAnswer = (option: string | null) => {
    if (!currentQ || gameOver || result) return;
    setSelected(option);

    const isCorrect = option === currentQ.answer;
    if (isCorrect) {
      setScore((s) => s + XP_CORRECT + Math.max(0, streak * 2)); // streak bonus
      setStreak((s) => s + 1);
      setResult("correct");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
    } else {
      setResult("wrong");
      setStreak(0);
      setLives((h) => h - 1);
    }
  };

  const nextQuestion = () => {
    if (index + 1 >= deck.length || lives <= 0) {
      setGameOver(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
    setShowHint(false);
    setTimeLeft(TIME_PER_Q);
  };

  const restart = () => {
    setDeck(shuffle(BANK).slice(0, GAME_LENGTH));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setLives(MAX_LIVES);
    setTimeLeft(TIME_PER_Q);
    setSelected(null);
    setResult(null);
    setShowHint(false);
    setGameOver(false);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: `radial-gradient(80% 60% at 50% 0%, ${color.aqua}14 0%, transparent 60%), linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)`,
      }}
    >
      <AnimatePresence>{confetti && <Confetti width={vw} height={vh} recycle={false} numberOfPieces={240} />}</AnimatePresence>

      <motion.div
        className="w-full max-w-2xl rounded-3xl shadow-xl ring-1 overflow-hidden"
        style={{ background: "#fff", borderColor: `${color.mist}55` }}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header / HUD */}
        <div
          className="px-6 py-5"
          style={{
            background: `linear-gradient(120deg, ${color.teal}, ${color.aqua})`,
            color: "#fff",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5" />
              <div className="font-semibold">Score: {score}</div>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5" />
              <div className="font-semibold">Streak: {streak}</div>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(MAX_LIVES)].map((_, i) => (
                <Heart
                  key={i}
                  className="h-5 w-5"
                  style={{ color: i < lives ? "#ff6b6b" : "#ffffff88" }}
                  fill={i < lives ? "#ff6b6b" : "none"}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <div className="font-semibold">{timeLeft}s</div>
            </div>
          </div>

          {/* Timer bar */}
          <div className="mt-3 h-2 w-full rounded-full overflow-hidden bg-white/30">
            <motion.div
              className="h-full"
              style={{ background: "#ffffff" }}
              initial={{ width: "0%" }}
              animate={{ width: `${(timeLeft / TIME_PER_Q) * 100}%` }}
              transition={{ ease: "linear", duration: 0.95 }}
              key={timeLeft}
            />
          </div>

          {/* Stepper dots */}
          <div className="mt-3 flex gap-1">
            {deck.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    i < index
                      ? "rgba(255,255,255,0.9)"
                      : i === index
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.35)",
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {!gameOver && currentQ ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold" style={{ color: color.deep }}>
                  {currentQ.question}
                </h2>

                {/* Hint button */}
                <button
                  onClick={() => setShowHint((v) => !v)}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                  style={{
                    background: `${color.mist}22`,
                    color: color.steel,
                    border: `1px solid ${color.mist}55`,
                  }}
                >
                  <Lightbulb className="h-4 w-4" />
                  {showHint ? "Hide hint" : "Hint"}
                </button>
              </div>

              <AnimatePresence>
                {showHint && currentQ.hint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 overflow-hidden rounded-xl"
                    style={{
                      background: `${color.mist}15`,
                      border: `1px dashed ${color.mist}`,
                    }}
                  >
                    <div className="px-4 py-3 text-sm" style={{ color: color.steel }}>
                      {currentQ.hint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isChosen = selected === opt;
                  const isCorrect = result && opt === currentQ.answer;
                  const isWrong = result && isChosen && opt !== currentQ.answer;

                  return (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!result}
                      className="w-full text-left rounded-xl px-4 py-3 font-medium shadow-sm border transition"
                      style={{
                        background: isCorrect
                          ? "#e8f9f0"
                          : isWrong
                          ? "#fdecec"
                          : "#fff",
                        color: isCorrect
                          ? "#117a53"
                          : isWrong
                          ? "#8f1a1a"
                          : color.deep,
                        borderColor: isCorrect
                          ? "#2ecc71"
                          : isWrong
                          ? "#e74c3c"
                          : `${color.mist}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{opt}</span>
                        {result && isCorrect && (
                          <CheckCircle2 className="h-5 w-5" style={{ color: "#2ecc71" }} />
                        )}
                        {result && isWrong && (
                          <XCircle className="h-5 w-5" style={{ color: "#e74c3c" }} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation + Continue */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="mt-5 rounded-2xl border p-4"
                    style={{ borderColor: `${color.mist}`, background: "#fff" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm">
                        <div
                          className="font-semibold mb-1"
                          style={{ color: result === "correct" ? "#117a53" : "#8f1a1a" }}
                        >
                          {result === "correct" ? "Nice! That's correct." : "Not quite. Here's why:"}
                        </div>
                        {currentQ.explanation && (
                          <div style={{ color: color.steel }}>{currentQ.explanation}</div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextQuestion}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm"
                        style={{ background: color.teal, color: "#fff" }}
                      >
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer microcopy */}
              {!result && (
                <div className="mt-4 text-xs text-center" style={{ color: color.steel }}>
                  Tip: press <strong>1–4</strong> on your keyboard to answer faster.
                </div>
              )}
            </>
          ) : (
            // End screen
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-3"
                   style={{ background: `${color.teal}18`, border: `1px solid ${color.teal}44` }}>
                <Star className="h-8 w-8" style={{ color: color.teal }} />
              </div>

              <h2 className="text-2xl font-extrabold" style={{ color: color.deep }}>
                Daily Challenge Complete 🎉
              </h2>
              <p className="mt-2 text-sm" style={{ color: color.steel }}>
                Final score: <span className="font-semibold" style={{ color: color.teal }}>{score} </span> ·
                Streak: <span className="font-semibold">{streak}</span> ·
                {lives > 0 ? ` Lives left: ${lives}` : " No lives left"}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Play Again
                </button>
                <Link
                  to="/studentDashboard"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm border"
                  style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
                >
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({ title: "Tugon Daily Challenge", text: `I scored ${score}`, url: window.location.href })
                        .catch(() => {});
                    } else {
                      navigator.clipboard.writeText(`I scored ${score}  on Tugon!`).catch(() => {});
                      alert("Copied text — share with your friends!");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm border"
                  style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              <div className="mt-6 text-xs" style={{ color: color.steel }}>
                New set every day. Come back tomorrow for fresh questions!
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default DailyChallengeGame;
