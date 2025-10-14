import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Timer, RefreshCcw, Flame, Heart, Lightbulb,
  Share2, Home, CheckCircle2, XCircle, ChevronRight, X
} from "lucide-react";
import Confetti from "react-confetti";
import { Link, useNavigate } from "react-router-dom";
import color from "../styles/color";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

/* ============================
   Math formatting helpers
============================= */
const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "(": "⁽", ")": "⁾"
};

function toSup(txt: string) {
  return txt.split("").map((c) => SUPERSCRIPT_MAP[c] ?? c).join("");
}

function splitAndWrap(
  text: string,
  regex: RegExp,
  builder: (m: RegExpExecArray, ...rest: any[]) => JSX.Element
): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = [];
  let last = 0, m: RegExpExecArray | null;
  const r = new RegExp(regex, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  let key = 0;
  while ((m = r.exec(text))) {
    if (m.index > last) result.push(text.slice(last, m.index));
    result.push(builder(m, ...m.slice(1), key++));
    last = r.lastIndex;
  }
  if (last < text.length) result.push(text.slice(last));
  return result;
}

function renderMath(input: string): (string | JSX.Element)[] {
  let out: (string | JSX.Element)[] = [input];

  // ^{...}
  out = out.flatMap((chunk, i) =>
    typeof chunk !== "string"
      ? [chunk]
      : splitAndWrap(chunk, /([A-Za-z0-9\)\]])\^\{([^}]+)\}/g,
        (m, base, exp, key) => (
          <span key={`exp-br-${i}-${key}`}>{base}<sup>{toSup(exp)}</sup></span>
        ))
  );

  // simple ^n
  out = out.flatMap((chunk, i) =>
    typeof chunk !== "string"
      ? [chunk]
      : splitAndWrap(chunk, /([A-Za-z0-9\)\]])\^([0-9\+\-\(\)]+)/g,
        (m, base, exp, key) => (
          <span key={`exp-${i}-${key}`}>{base}<sup>{toSup(exp)}</sup></span>
        ))
  );

  // log_{...}
  out = out.flatMap((chunk, i) =>
    typeof chunk !== "string"
      ? [chunk]
      : splitAndWrap(chunk, /(log)_\{([^}]+)\}/g,
        (m, base, sub, key) => (
          <span key={`log-${i}-${key}`}>{base}<sub>{sub}</sub></span>
        ))
  );

  return out;
}

/* ============================
   Question bank (30 items)
============================= */
type Question = {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
};

const BANK: Question[] = [
  { question: "Evaluate the function f(x)=2x+3 when x=5.", options: ["10","11","13","15"], answer:"13", hint:"Multiply then add.", explanation:"f(5) = 2·5 + 3 = 13." },
  { question: "Solve: log_{2}(8) = ?", options:["2","3","4","8"], answer:"3", hint:"2^? = 8", explanation:"2^3 = 8 → log_{2}(8)=3." },
  { question: "Find the domain of the function f(x) = 1/(x−2).", options:["x≠2","x≥2","All real","x<2"], answer:"x≠2", hint:"Denominator ≠ 0.", explanation:"x−2≠0 ⇒ x≠2." },
  { question: "Compute the value of f(-3) if f(x)=x^2.", options:["−9","9","−6","3"], answer:"9", hint:"Square removes sign.", explanation:"(−3)^2 = 9." },
  { question: "Given g(x)=3x−4. Solve for x when g(x)=11.", options:["x=5","x=3","x=7","x=−5"], answer:"x=5", hint:"3x−4=11.", explanation:"3x=15 ⇒ x=5." },
  { question: "Determine the domain of √(x−1).", options:["x≥1","x>1","x≤1","All real"], answer:"x≥1", hint:"Inside root ≥ 0.", explanation:"x−1≥0 ⇒ x≥1." },
  { question: "Evaluate |x−2| when x=−1.", options:["1","2","3","4"], answer:"3", hint:"Distance from 2.", explanation:"|−1−2|=3." },
  { question: "If h(x)=x^3, find h(−2).", options:["8","−8","4","−4"], answer:"−8", hint:"Odd powers keep sign.", explanation:"(−2)^3=−8." },
  { question: "Evaluate log_{10}(1000) =", options:["1","2","3","10"], answer:"3", hint:"10^?=1000", explanation:"10^3=1000." },
  { question: "Evaluate e^0 =", options:["0","1","e","undefined"], answer:"1", hint:"Any a^0=1.", explanation:"e^0=1." },
  { question: "Find the inverse of the function f(x)=x+5.", options:["x−5","x/5","5x","x+5"], answer:"x−5", hint:"Undo +5.", explanation:"Inverse subtracts 5." },
  { question: "Find the inverse of the function f(x)=2x", options:["x/2","x−2","2x+1","x+2"], answer:"x/2", hint:"Undo ×2.", explanation:"Divide by 2." },
  { question: "Given f(x)=x+1 and g(x)=2x, find (f∘g)(3).", options:["5","6","7","8"], answer:"7", hint:"g(3)=6; f(6)=7.", explanation:"(f∘g)(3)=f(2·3)=7." },
  { question: "Given f(x)=x+1 and g(x)=2x, find (g∘f)(3).", options:["6","7","8","10"], answer:"8", hint:"f(3)=4; g(4)=8.", explanation:"2·(3+1)=8." },
  { question: "Given the piecewise function f(x)=x^2 (x≤0); f(x)=x (x>0). Find f(−2).", options:["−2","2","4","0"], answer:"4", hint:"Use branch.", explanation:"x≤0 ⇒ (−2)^2=4." },
  { question: "Given the piecewise function f(x)=x^2 (x≤0); f(x)=x (x>0). Find f(2).", options:["−2","2","4","0"], answer:"2", hint:"Use x>0 branch.", explanation:"f(2)=2." },
  { question: "Determine the horizontal asymptote of (2x^2+3)/(x^2−1)", options:["y=0","y=1","y=2","none"], answer:"y=2", hint:"Same degree ⇒ ratio of leads.", explanation:"(2x^2)/(x^2)⇒2." },
  { question: "Fine the vertical asymptote of the function f(x)=(x+1)/(x^2−1).", options:["x=−1","x=1","x=±1","none"], answer:"x=±1", hint:"Denominator zero.", explanation:"x=±1." },
  { question: "Solve for x in the equation 2^x=16.", options:["2","3","4","5"], answer:"4", hint:"2^4=16.", explanation:"x=4." },
  { question: "log_{3}(27)=", options:["2","3","4","9"], answer:"3", hint:"3^3=27.", explanation:"=3." },
  { question: "Find the range of the function f(x)=x^2.", options:["x≥0","y≥0","y≤0","all y"], answer:"y≥0", hint:"Square ≥0.", explanation:"Outputs ≥0." },
  { question: "Find the domain of the function f(x)=ln(x−1).", options:["x>1","x≥1","x≠1","x<1"], answer:"x>1", hint:"ln needs positive input.", explanation:"x−1>0." },
  { question: "Find the zero of the function f(x)=x−7.", options:["x=0","x=1","x=7","x=−7"], answer:"x=7", hint:"Solve x−7=0.", explanation:"x=7." },
  { question: "Find the domain of the function f(x)=1/x^2.", options:["x≠0","x>0","all x","x≥0"], answer:"x≠0", hint:"Denominator ≠0.", explanation:"x≠0." },
  { question: "Find the horizontal asymptote of the function f(x)=(3x+1)/(x−4).", options:["y=0","y=1","y=3","none"], answer:"y=3", hint:"Same degree.", explanation:"3/1 ⇒ y=3." },
  { question: "Find the slant asymptote of the function f(x)=(x^2+1)/(x−1).", options:["y=x","y=x+1","y=x−1","y=1"], answer:"y=x+1", hint:"Divide poly.", explanation:"Quotient x+1." },
  { question: "Solve for x in the equation x^2=25.", options:["x=5","x=±5","x=−5","x=25"], answer:"x=±5", hint:"Square roots ±.", explanation:"±5." },
  { question: "Solve for x in the equation |x|=7.", options:["x=7","x=−7","x=±7","x=0"], answer:"x=±7", hint:"Distance 7.", explanation:"x=7 or x=−7." },
  { question: "Find the derivative of the function f(x)=x^2.", options:["1","x","2x","x^3"], answer:"2x", hint:"Power rule.", explanation:"d/dx x^n = nx^{n−1}." },
  { question: "find the ∫ 2x dx =", options:["x^2","x^2+C","2x^2","x+C"], answer:"x^2+C", hint:"Reverse power rule.", explanation:"(2/2)x^2 + C." },
];

/* ============================
   Game constants
============================= */
const TIME_PER_Q = 30;
const MAX_LIVES = 3;
const XP_CORRECT = 10;

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }
const today = () => new Date().toISOString().slice(0, 10);

/* ============================
   Small components
============================= */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: "#ffffff22", border: "1px solid #ffffff44" }}
    >
      {children}
    </span>
  );
}

function ConfirmLeaveModal({
  open,
  onCancel,
  onConfirm
}: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal
          role="dialog"
        >
          <div className="absolute inset-0 backdrop-blur bg-black/30" />
          <motion.div
            className="relative w-full max-w-md rounded-2xl shadow-2xl"
            initial={{ scale: 0.95, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            style={{ background: "#fff", border: `1px solid ${color.mist}` }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: color.mist }}>
              <h3 className="font-bold text-lg" style={{ color: color.deep }}>Leave this page?</h3>
              <button onClick={onCancel} className="p-1 rounded hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 text-sm" style={{ color: color.steel }}>
              Your current daily challenge progress is saved, but you’ll lose your timer and flow. Are you sure you want to leave?
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="rounded-xl px-4 py-2 font-semibold border"
                style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
              >
                Stay
              </button>
              <button
                onClick={onConfirm}
                className="rounded-xl px-4 py-2 font-semibold"
                style={{ background: color.teal, color: "#fff" }}
              >
                Leave page
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================
   Component
============================= */
export default function DailyChallengeGame() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Confetti sizing
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Game state
  const [deck, setDeck] = useState<Question[]>(() => shuffle(BANK));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // Leave guards
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingPathRef = useRef<string | null>(null);

  const currentQ = deck[index];

  // Timer
  useEffect(() => {
    if (!currentQ || result) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result, currentQ]);

  // Keyboard shortcuts 1..4
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentQ || result || lives <= 0) return;
      const num = Number(e.key);
      if (num >= 1 && num <= currentQ.options.length) {
        handleAnswer(currentQ.options[num - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQ, result, lives]);

  // ---------- Supabase persistence ----------
  const saveRun = async (s: number, st: number, h: number) => {
    if (!user?.id) return;
    try {
      await supabase
        .from("daily_challenge_runs")
        .upsert(
          { user_id: user.id, run_date: today(), score: s, streak: st, hearts_left: h },
          { onConflict: "user_id,run_date" }
        );
    } catch (e) {
      console.warn("Save failed (will retry later)", e);
    }
  };

  // Save periodically (every 20s)
  useEffect(() => {
    const id = setInterval(() => { saveRun(score, streak, lives); }, 20000);
    return () => clearInterval(id);
  }, [score, streak, lives]);

  // Save on tab hide / unload
  useEffect(() => {
    const handler = () => { saveRun(score, streak, lives); };
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, [score, streak, lives]);

  // Browser-level leave confirm (refresh/close/back)
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show the native browser confirm dialog
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ---------- Core interactions ----------
  const handleAnswer = (opt: string | null) => {
    if (!currentQ || result) return;

    setSelected(opt);
    const correct = opt === currentQ.answer;

    if (correct) {
      setScore((s) => s + XP_CORRECT + Math.max(0, streak * 2));
      setStreak((s) => s + 1);
      setResult("correct");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1000);
    } else {
      setResult("wrong");
      setStreak(0);
      setLives((h) => Math.max(0, h - 1));
    }

    // Save immediately
    const nextScore = correct ? (score + XP_CORRECT + Math.max(0, streak * 2)) : score;
    const nextStreak = correct ? (streak + 1) : 0;
    const nextHearts = correct ? lives : Math.max(0, lives - 1);
    saveRun(nextScore, nextStreak, nextHearts);
  };

  const nextQuestion = () => {
    if (lives <= 0) return;
    setIndex((i) => (i + 1) % deck.length); // endless loop
    setSelected(null);
    setResult(null);
    setShowHint(false);
    setTimeLeft(TIME_PER_Q);
  };

  const refillHeartsAndContinue = () => {
    setLives(MAX_LIVES);
    setSelected(null);
    setResult(null);
    setShowHint(false);
    setTimeLeft(TIME_PER_Q);
    setIndex((i) => (i + 1) % deck.length);
  };

  const restart = () => {
    setDeck(shuffle(BANK));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setLives(MAX_LIVES);
    setTimeLeft(TIME_PER_Q);
    setSelected(null);
    setResult(null);
    setShowHint(false);
    setConfetti(false);
  };

  // Intercept internal navigation to show modal
  const tryNavigate = (path: string) => {
    pendingPathRef.current = path;
    setConfirmOpen(true);
  };
  const confirmLeave = () => {
    setConfirmOpen(false);
    const target = pendingPathRef.current;
    pendingPathRef.current = null;
    if (target) navigate(target);
  };

  const timerPct = Math.max(0, Math.min(100, (timeLeft / TIME_PER_Q) * 100));

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{
        background: `radial-gradient(80% 60% at 50% 0%, ${color.aqua}14 0%, transparent 60%), linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)`
      }}
    >
      <AnimatePresence>
        {confetti && (
          <Confetti width={vw} height={vh} recycle={false} numberOfPieces={220} />
        )}
      </AnimatePresence>

      {/* Sticky HUD */}
      <div
        className="sticky top-0 z-10 w-full max-w-3xl rounded-2xl shadow-lg backdrop-blur mb-6"
        style={{ background: `linear-gradient(120deg, ${color.teal}, ${color.aqua})`, color: "#fff" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-3 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">{score}</span>
            <Pill>Score</Pill>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            <span className="font-semibold">{streak}</span>
            <Pill>Streak</Pill>
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
            <Pill>Lives</Pill>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span className="font-semibold">{timeLeft}s</span>
            <Pill>Timer</Pill>
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="h-2 w-full rounded-b-2xl overflow-hidden bg-white/20">
          <motion.div
            className="h-full"
            style={{ background: "#ffffff" }}
            initial={{ width: "0%" }}
            animate={{ width: `${timerPct}%` }}
            transition={{ ease: "linear", duration: 0.2 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        className="w-full max-w-3xl rounded-3xl shadow-xl ring-1 overflow-hidden"
        style={{ background: "#fff", borderColor: `${color.mist}55` }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="px-6 pt-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: color.deep }}>
              {currentQ ? renderMath(currentQ.question) : "Loading…"}
            </h2>

            {currentQ?.hint && (
              <button
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 rounded-full shadow-sm"
                style={{ background: "#fff", color: color.steel, border: `1px solid ${color.mist}` }}
              >
                <Lightbulb className="h-4 w-4" />
                {showHint ? "Hide hint" : "Hint"}
              </button>
            )}
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && currentQ?.hint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden rounded-xl"
                style={{ background: `${color.mist}15`, border: `1px dashed ${color.mist}` }}
              >
                <div className="px-4 py-3 text-sm" style={{ color: color.steel }}>
                  {renderMath(currentQ.hint)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options */}
        <div className="px-6 py-6">
          {currentQ && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isChosen = selected === opt;
                const isCorrect = result && opt === currentQ.answer;
                const isWrong = result && isChosen && opt !== currentQ.answer;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <motion.button
                    key={`${opt}-${idx}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => lives > 0 && handleAnswer(opt)}
                    disabled={!!result || lives <= 0}
                    className="w-full text-left rounded-xl px-4 py-3 font-medium shadow-sm border transition group focus:outline-none focus:ring-2"
                    style={{
                      background: isCorrect ? "#e8f9f0" : isWrong ? "#fdecec" : "#fff",
                      color: isCorrect ? "#117a53" : isWrong ? "#8f1a1a" : color.deep,
                      borderColor: isCorrect ? "#2ecc71" : isWrong ? "#e74c3c" : `${color.mist}`,
                      boxShadow: "0 1px 8px rgba(16,24,40,0.06)"
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border"
                          style={{
                            borderColor: isCorrect ? "#2ecc71" : isWrong ? "#e74c3c" : color.mist,
                            background: isCorrect ? "#2ecc71" : isWrong ? "#e74c3c" : "#f8fafc",
                            color: isCorrect || isWrong ? "#fff" : "#0f172a"
                          }}
                        >
                          {letter}
                        </span>
                        <span>{renderMath(opt)}</span>
                      </div>
                      {isCorrect && <CheckCircle2 className="h-5 w-5" style={{ color: "#2ecc71" }} />}
                      {isWrong && <XCircle className="h-5 w-5" style={{ color: "#e74c3c" }} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Explanation + Continue */}
          <AnimatePresence>
            {result && lives > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mt-5 rounded-2xl border p-4 flex items-center justify-between gap-2"
                style={{ borderColor: `${color.mist}`, background: "#fff" }}
              >
                <div className="text-sm">
                  <div
                    className="font-semibold mb-1"
                    style={{ color: result === "correct" ? "#117a53" : "#8f1a1a" }}
                  >
                    {result === "correct" ? "Nice! That's correct." : "Not quite. Here's why:"}
                  </div>
                  {currentQ?.explanation && (
                    <div style={{ color: color.steel }}>{renderMath(currentQ.explanation)}</div>
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Out of hearts panel */}
          {lives <= 0 && (
            <div className="mt-6 rounded-2xl border p-5 text-center" style={{ borderColor: `${color.mist}` }}>
              <div className="text-lg font-semibold mb-1" style={{ color: color.deep }}>
                You’re out of hearts 💔
              </div>
              <p className="text-sm mb-4" style={{ color: color.steel }}>
                Take a breath and keep going—your progress is saved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={refillHeartsAndContinue}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  Keep going (refill)
                </button>
                {/* Intercept link with confirm modal */}
                <button
                  onClick={() => tryNavigate("/studentDashboard")}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm border"
                  style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
                >
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Footer microcopy */}
          {!result && lives > 0 && (
            <div className="mt-4 text-xs text-center" style={{ color: color.steel }}>
              Tip: press <strong>1–4</strong> on your keyboard to answer faster.
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* Intercept navigation instead of plain Link */}
        <button
          onClick={() => tryNavigate("/studentDashboard")}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm border"
          style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </button>
        <button
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-sm"
          style={{ background: color.teal, color: "#fff" }}
        >
          <RefreshCcw className="h-4 w-4" />
          Restart
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "Tugon Daily Challenge", text: `I scored ${score}`, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(`I scored ${score} on Tugon!`).catch(() => {});
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

      {/* Confirm-leave modal */}
      <ConfirmLeaveModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmLeave}
      />
    </div>
  );
}
