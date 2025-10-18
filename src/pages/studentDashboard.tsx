import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trophy, Clock, BarChart, BookOpen, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import color from "../styles/color";
import Confetti from "react-confetti";

/* 🔊 Welcome popup sound */
import welcomeSfx from "../components/assets/sound/Welcome 2.mp3";

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Progress {
  quiz_id: string;
  score: number;
  completed_at: string;
  quiz: Quiz | null;
}

/** Mistakes captured from Daily Challenge runs.
 *  Expected Supabase table: daily_challenge_mistakes
 *  Columns:
 *   - id (uuid)
 *   - user_id (uuid)
 *   - question (text)
 *   - last_wrong_at (timestamp)
 *   - times_wrong (int)
 */
interface Mistake {
  id: string;
  user_id: string;
  question: string;
  last_wrong_at: string;
  times_wrong: number | null;
}

const topics = [
  { title: "Introduction to Functions", path: "/introductiontopic" },
  { title: "Evaluating Functions", path: "/evaluationtopic" },
  { title: "Piecewise-Defined Functions", path: "/piecewise" },
  { title: "Operations on Functions", path: "/operationstopic" },
  { title: "Composition of Functions", path: "/compositiontopic" },
  { title: "Rational Functions", path: "/rationaltopic" },
  { title: "Graphing Rational Functions", path: "/asymptotestopic" },
  { title: "Rational Equations and Inequalities", path: "/rationalinequalitiestopic" },
  { title: "Inverse Functions", path: "/inversetopic" },
  { title: "Exponential Functions", path: "/exponentialtopic" },
  { title: "Logarithmic Functions", path: "/logarithmictopic" },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  // Welcome modal + confetti
  const [showWelcome, setShowWelcome] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);
  const [win, setWin] = useState({ width: 0, height: 0 });

  // 🔊 hold welcome audio so it doesn't get GC'd mid-play
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Mistakes from Daily Challenge
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);

  // derive username/email safely
  const email = user?.email ?? "";
  const username = useMemo(
    () => (email.includes("@") ? email.split("@")[0] : email || "there"),
    [email]
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // track window size for confetti
  useEffect(() => {
    const onResize = () =>
      setWin({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ONE-TIME PER LOGIN POPUP
  useEffect(() => {
    if (!user) return;

    const lastSignIn = (user as any)?.last_sign_in_at || "";
    const welcomeKey = `welcomeShown:${user.id}:${lastSignIn}`;

    const alreadyShown = sessionStorage.getItem(welcomeKey);
    if (!alreadyShown) {
      setShowWelcome(true);
      setConfettiOn(true);
      sessionStorage.setItem(welcomeKey, "1");
      const t = setTimeout(() => setConfettiOn(false), 3000);
      return () => clearTimeout(t);
    }
  }, [user]);

  // 🔊 Play welcome sound when the popup becomes visible
  useEffect(() => {
    if (!showWelcome) return;

    try {
      const a = new Audio(welcomeSfx);
      a.preload = "auto";
      a.volume = 0.9;
      welcomeAudioRef.current = a;
      a.play().catch((err) => {
        // Autoplay may be blocked by some browsers; safely ignore.
        console.warn("Welcome sound could not play:", err);
      });
    } catch (e) {
      console.warn("Welcome sound init failed:", e);
    }

    return () => {
      try {
        welcomeAudioRef.current?.pause();
      } catch {}
      welcomeAudioRef.current = null;
    };
  }, [showWelcome]);

  const closeWelcome = () => setShowWelcome(false);

  const loadDashboard = async () => {
    try {
      // All quizzes (RLS should allow SELECT for authenticated)
      const { data: quizzesData, error: qErr } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (qErr) throw qErr;
      if (quizzesData) setQuizzes(quizzesData);

      // Only this user's progress (RLS: user_id = auth.uid())
      const { data: progressData, error: pErr } = await supabase
        .from("user_progress")
        .select(
          `
          quiz_id,
          score,
          completed_at,
          quiz:quizzes (*)
        `
        )
        .eq("user_id", user?.id)
        .order("completed_at", { ascending: false });
      if (pErr) throw pErr;

      if (progressData) {
        const fixed = progressData.map((item) => ({
          ...item,
          quiz: Array.isArray(item.quiz) ? item.quiz[0] ?? null : item.quiz ?? null,
          score: item.score ?? 0,
        })) as Progress[];
        setProgress(fixed);
      }

      // Load mistakes from Daily Challenge (if table exists)
      await loadMistakes();

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  const loadMistakes = async () => {
    setMistakesLoaded(false);
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("daily_challenge_mistakes")
        .select("id, user_id, question, last_wrong_at, times_wrong")
        .eq("user_id", user.id)
        .order("last_wrong_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setMistakes((data ?? []) as Mistake[]);
    } catch (e) {
      // If the table doesn't exist or RLS blocks, just leave mistakes empty.
      console.warn("Could not load mistakes:", e);
      setMistakes([]);
    } finally {
      setMistakesLoaded(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // ---------- KPIs ----------
  // Unique quizzes completed (no duplicates)
  const uniqueCompletedQuizIds = new Set(
    (progress || []).map((p) => p?.quiz_id).filter(Boolean) as string[]
  );
  const quizzesCompleted = uniqueCompletedQuizIds.size;

  // Completion Rate = uniqueCompleted / total quizzes * 100
  const totalChallenges = quizzes?.length ?? 0;
  const completionRate =
    totalChallenges > 0
      ? Math.round((quizzesCompleted / totalChallenges) * 100)
      : 0;

  const totalScore = (progress || []).reduce(
    (acc, curr) => acc + (curr?.score ?? 0),
    0
  );

  // Fallback suggestions from low quiz scores (if no mistake data available)
  const weakAttempts = progress.filter((p) => (p.score ?? 0) < 70);
  const seen = new Set<string>();
  const fallbackSuggested = weakAttempts
    .filter((p) => {
      if (seen.has(p.quiz_id)) return false;
      seen.add(p.quiz_id);
      return true;
    })
    .slice(0, 5);

  // Random topic jump
  const jumpToRandomTopic = () => {
    const t = topics[Math.floor(Math.random() * topics.length)];
    if (t) navigate(t.path);
  };

  // ✅ Connect "Review Mistakes" straight to Daily Challenge
  const goReviewFirst = () => {
    navigate("/daily-challenge");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)`,
        }}
      >
        <motion.div
          className="rounded-full h-12 w-12 border-4 border-t-4"
          style={{ borderColor: `${color.teal}40` }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            borderColor: [`${color.teal}40`, color.teal, `${color.teal}40`],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      </div>
    );
  }

  // Helper to trim question text for list items
  const snippet = (s: string, n = 80) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)`,
      }}
    >
      {/* Confetti */}
      <AnimatePresence>
        {confettiOn && (
          <Confetti
            width={win.width}
            height={win.height}
            numberOfPieces={250}
            recycle={false}
            gravity={0.25}
          />
        )}
      </AnimatePresence>

      {/* Welcome Modal (shows once per login) */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeWelcome}
            />
            {/* Dialog */}
            <motion.div
              className="relative z-10 w-full max-w-md rounded-3xl shadow-2xl ring-1 overflow-hidden"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Accent header */}
              <div
                className="px-6 py-5"
                style={{
                  background: `linear-gradient(120deg, ${color.teal}, ${color.aqua})`,
                  color: "#fff",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold leading-tight">
                      Welcome back,{" "}
                      <span className="underline decoration-white/50">
                        {username}
                      </span>
                      ! 👋
                    </h2>
                    {email && (
                      <p className="text-white/90 text-sm mt-1">
                        Signed in as {email}
                      </p>
                    )}
                  </div>
                  <button
                    aria-label="Close"
                    onClick={closeWelcome}
                    className="rounded-full p-1.5 hover:bg-white/15 transition"
                    style={{ color: "#fff" }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-sm" style={{ color: color.steel }}>
                  Keep your streak alive—jump into a daily challenge or review a
                  topic. You’ve got this!
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    to="/studentDashboard"
                    onClick={closeWelcome}
                    className="inline-flex items-center rounded-xl px-4 py-2 font-semibold shadow-md transition"
                    style={{ background: color.teal, color: "#fff" }}
                  >
                    Let’s go
                    <Play className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <motion.div
              className="rounded-2xl p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: color.deep }}>
                Your Progress 🚀
              </h2>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                variants={containerVariants}
              >
                {[
                  { icon: Trophy, value: quizzesCompleted, label: "Quizzes Completed" },
                  { icon: BarChart, value: totalScore, label: "Total Score" },
                  { icon: Clock, value: completionRate, label: "Completion Rate", isPercent: true },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    className="rounded-2xl p-6 shadow-sm transition cursor-pointer"
                    style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex items-center justify-center mb-4">
                      <div
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                        style={{ border: `4px solid ${color.teal}` }}
                      >
                        <item.icon className="h-5 w-5 mb-1" style={{ color: color.teal }} />
                        <span className="text-xl font-bold" style={{ color: color.teal }}>
                          {item.value}
                          {item.isPercent && "%"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium" style={{ color: color.steel }}>
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: color.deep }}>
                  Recent Activity 📖
                </h3>
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {progress.slice(0, 5).map((item) => (
                    <motion.div
                      key={`${item.quiz_id}-${item.completed_at}`}
                      className="rounded-lg p-4 transition"
                      style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium" style={{ color: color.deep }}>
                            {item.quiz?.title ?? "Untitled Quiz"}
                          </h4>
                          <p className="text-sm" style={{ color: color.steel }}>
                            Score: {item.score ?? 0}
                          </p>
                        </div>
                        <span className="text-sm" style={{ color: color.steel }}>
                          {new Date(item.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Keep Learning */}
            <motion.div
              className="rounded-2xl p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: color.deep }}>
                Keep Learning ⚡
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Random Topic */}
                <motion.button
                  onClick={jumpToRandomTopic}
                  className="flex items-center justify-between rounded-xl px-4 py-3 shadow-sm"
                  style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-2 font-medium" style={{ color: color.deep }}>
                    <BookOpen className="h-5 w-5" style={{ color: color.teal }} />
                    Random Topic
                  </span>
                  <span className="text-xs" style={{ color: color.steel }}>
                    Explore anything
                  </span>
                </motion.button>

                {/* Daily Challenge */}
                <Link
                  to="/daily-challenge"
                  className="flex items-center justify-between rounded-xl px-4 py-3 shadow-sm"
                  style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                >
                  <span className="flex items-center gap-2 font-medium" style={{ color: color.deep }}>
                    <Play className="h-5 w-5" style={{ color: color.teal }} />
                    Daily Challenge
                  </span>
                  <span className="text-xs" style={{ color: color.steel }}>
                    5–10 mins
                  </span>
                </Link>

                {/* Leaderboards */}
                <Link
                  to="/leaderboards"
                  className="flex items-center justify-between rounded-xl px-4 py-3 shadow-sm"
                  style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                >
                  <span className="flex items-center gap-2 font-medium" style={{ color: color.deep }}>
                    <Trophy className="h-5 w-5" style={{ color: color.teal }} />
                    View Leaderboards
                  </span>
                  <span className="text-xs" style={{ color: color.steel }}>
                    See top scores
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Topics + Tips */}
          <div className="lg:col-span-1">
            <motion.div
              className="rounded-2xl p-6 h-full shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: color.deep }}>
                Topics 📚
              </h2>
              <motion.div className="space-y-4" variants={containerVariants}>
                {topics.map((topic) => (
                  <motion.div
                    key={topic.title}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={topic.path}
                      className="block rounded-lg p-4 transition"
                      style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-6 w-6" style={{ color: color.teal }} />
                        <span className="font-medium" style={{ color: color.deep }}>
                          {topic.title}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Study Tips */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
                  Study Tips ✨
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm" style={{ color: color.steel }}>
                  <li>Do one Daily Challenge. Small steps add up.</li>
                  <li>Review mistakes immediately while they’re fresh.</li>
                  <li>Rotate topics—don’t get stuck on one area.</li>
                  <li>Explain a concept out loud to test understanding.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StudentDashboard;