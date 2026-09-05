import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trophy, Clock, BarChart, BookOpen, X, Info } from "lucide-react";
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

interface Topic {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  file_url: string | null;
  route_path?: string | null;
  html_url?: string | null;
  created_at: string;
  created_by: string;
  publish_to?: string[] | null | string;
}

function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Add state for topics
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Function to load topics
  const loadTopics = async () => {
    if (!user) return;
    setLoadingTopics(true);

    try {
      // 1) Get student's section
      const { data: sectionRows, error: sectionErr } = await supabase
        .from("section_students")
        .select("section_id")
        .eq("student_id", user.id);

      if (sectionErr) {
        console.error("Error getting section:", sectionErr);
        return;
      }

      const section_id = sectionRows?.[0]?.section_id;
      if (!section_id) {
        console.log("No section found for student");
        return;
      }

      // 2) Get topics for the section
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false });

      if (topicsError) {
        console.error("Error loading topics:", topicsError);
        return;
      }

      // Filter topics by publish_to
      const filteredTopics = (topicsData || []).filter(topic => {
        const pub = topic.publish_to;
        if (!pub) return false;
        
        let publishTo: string[] = [];
        if (Array.isArray(pub)) {
          publishTo = pub.map(String);
        } else if (typeof pub === "string") {
          try {
            const parsed = JSON.parse(pub);
            if (Array.isArray(parsed)) {
              publishTo = parsed.map(String);
            } else {
              publishTo = pub.split(",").map(x => x.trim()).filter(Boolean);
            }
          } catch {
            publishTo = pub.split(",").map(x => x.trim()).filter(Boolean);
          }
        }

        return publishTo.map(String).includes(String(section_id));
      }).map(topic => ({
        ...topic,
        // default to student topic view route
        route_path: topic.route_path || `/student/topics/${topic.slug}`
      }));

      setTopics(filteredTopics);
    } catch (error) {
      console.error("Error in loadTopics:", error);
    } finally {
      setLoadingTopics(false);
    }
  };

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
  const [_mistakes, setMistakes] = useState<Mistake[]>([]);
  const [_mistakesLoaded, setMistakesLoaded] = useState(false);

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

  // Load topics when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadTopics();
    }
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
          quiz: Array.isArray(item.quiz) ? (item.quiz[0] ?? null) : (item.quiz ?? null),
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
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // ---------- Helpers (presentation only; no new connections) ----------
  const humanDate = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  const daysSince = (iso?: string) => {
    if (!iso) return null;
    const ms = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  };

  const lastCompletedAt = progress?.[0]?.completed_at ?? null;
  const daysSinceLastActivity = daysSince(lastCompletedAt);

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

  // Derive some extra summaries (no new queries)
  const bestScore = progress.length
    ? Math.max(...progress.map((p) => p.score ?? 0))
    : 0;
  const recentFiveAvg =
    progress.slice(0, 5).reduce((a, b) => a + (b.score ?? 0), 0) /
      Math.max(1, Math.min(5, progress.length));

  const newestQuizzes = (quizzes || []).slice(0, 3);

  // Random topic jump
  const jumpToRandomTopic = () => {
    if (!topics || topics.length === 0) {
      alert("No topics are currently available for your section.");
      return;
    }
    const t = topics[Math.floor(Math.random() * topics.length)];
    if (t) navigate(`/student/topics/${t.slug}`);
  };

  // Smart nudge (display-only; no side effects)
  const nextBestAction = (() => {
    if (completionRate < 50) {
      return {
        title: "Start building momentum",
        note: "Complete at least one Daily Challenge to boost your streak.",
        link: "/daily-challenge",
        label: "Start Daily Challenge",
      };
    }
    if (daysSinceLastActivity && daysSinceLastActivity >= 3) {
      return {
        title: "It's been a while",
        note: "Pick any topic to refresh your memory.",
        link: topics[0] ? `/student/topics/${topics[0].slug}` : "/daily-challenge",
        label: topics[0] ? "Resume First Topic" : "Go to Daily Challenge",
      };
    }
    return {
      title: "Keep your pace steady",
      note: "Try a random topic for variety.",
      link: "/daily-challenge",
      label: "Try Daily Challenge",
    };
  })();

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
          aria-label="Loading your dashboard"
          role="status"
        />
      </div>
    );
  }

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
              onClick={() => setShowWelcome(false)}
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
                    aria-label="Close welcome dialog"
                    onClick={() => setShowWelcome(false)}
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

                {/* Quick context */}
                <div
                  className="mt-3 text-xs rounded-lg p-3"
                  style={{ background: `${color.mist}22`, color: color.steel }}
                >
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4" />
                    <p>
                      Tip: The dashboard shows your last 5 activities and the most
                      recent quizzes added by your teacher.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    to="/studentDashboard"
                    onClick={() => setShowWelcome(false)}
                    className="inline-flex items-center rounded-xl px-4 py-2 font-semibold shadow-md transition"
                    style={{ background: color.teal, color: "#fff" }}
                    aria-label="Go to your dashboard"
                    title="Open your dashboard"
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold" style={{ color: color.deep }}>
                  Your Progress 🚀
                </h2>
                {lastCompletedAt && (
                  <p className="text-xs" style={{ color: color.steel }}>
                    Last activity: <span title={humanDate(lastCompletedAt)}>
                      {daysSinceLastActivity === 0 ? "today" : `${daysSinceLastActivity}d ago`}
                    </span>
                  </p>
                )}
              </div>

              {/* KPI strip (now with helper captions) */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                variants={containerVariants}
              >
                {[
                  { icon: Trophy, value: quizzesCompleted, label: "Quizzes Completed", hint: `${quizzesCompleted}/${totalChallenges} unique quizzes you've finished` },
                  { icon: BarChart, value: totalScore, label: "Total Score", hint: `Best: ${bestScore} • Recent 5 Avg: ${Math.round(recentFiveAvg)}` },
                  { icon: Clock, value: completionRate, label: "Completion Rate", isPercent: true, hint: `${completionRate}% of available quizzes done` },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    className="rounded-2xl p-6 shadow-sm transition cursor-default"
                    style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`${item.label}: ${item.value}${item.isPercent ? "%" : ""}`}
                    title={item.hint}
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
                    {/* subtle helper line */}
                    <div className="text-xs mt-1" style={{ color: `${color.steel}AA` }}>
                      {item.hint}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Next Best Action (guidance only) */}
              <div
                className="mt-6 rounded-xl p-4"
                style={{ background: "#fff", border: `1px dashed ${color.mist}` }}
              >
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 mt-0.5" style={{ color: color.teal }} />
                  <div>
                    <p className="font-semibold" style={{ color: color.deep }}>
                      {nextBestAction.title}
                    </p>
                    <p className="text-sm" style={{ color: color.steel }}>
                      {nextBestAction.note}
                    </p>
                    <div className="mt-3">
                      <Link
                        to={nextBestAction.link}
                        className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold shadow-sm"
                        style={{ background: color.teal, color: "#fff" }}
                        aria-label={nextBestAction.label}
                        title={nextBestAction.label}
                      >
                        {nextBestAction.label}
                        <Play className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{ color: color.deep }}>
                    Recent Activity 📖
                  </h3>
                  {!!progress.length && (
                    <span className="text-xs" style={{ color: color.steel }}>
                      Showing latest 5
                    </span>
                  )}
                </div>
                <motion.div
                  className="space-y-4 mt-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {progress.length === 0 ? (
                    <div
                      className="rounded-lg p-4"
                      style={{ border: `1px solid ${color.mist}`, background: "#fff", color: color.steel }}
                    >
                      No activity yet. Try the Daily Challenge to see your progress here.
                    </div>
                  ) : (
                    progress.slice(0, 5).map((item) => (
                      <motion.div
                        key={`${item.quiz_id}-${item.completed_at}`}
                        className="rounded-lg p-4 transition"
                        style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        aria-label={`Activity for ${item.quiz?.title ?? "Untitled Quiz"}`}
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
                            {humanDate(item.completed_at)}
                          </span>
                        </div>
                        {item.quiz?.description && (
                          <p className="text-xs mt-2 line-clamp-2" style={{ color: `${color.steel}CC` }}>
                            {item.quiz.description}
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </div>

              {/* What's New (latest quizzes only from existing list) */}
              {newestQuizzes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
                    Newly Added Quizzes 🆕
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {newestQuizzes.map((q) => (
                      <div
                        key={q.id}
                        className="rounded-lg p-4"
                        style={{ background: "#fff", border: `1px solid ${color.mist}` }}
                        title={q.description}
                      >
                        <p className="font-medium mb-1" style={{ color: color.deep }}>
                          {q.title}
                        </p>
                        <p className="text-xs" style={{ color: color.steel }}>
                          Added on {humanDate(q.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  aria-label="Open a random topic"
                  title="Explore a random topic assigned to your section"
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
                  aria-label="Start the Daily Challenge"
                  title="5–10 minute quick practice"
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
                  aria-label="View leaderboards"
                  title="See top scores across your cohort"
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

              {/* Gentle study guidance */}
              <div className="mt-6 text-xs rounded-lg p-3" style={{ background: `${color.mist}22`, color: color.steel }}>
                Pro tip: Alternate between a Daily Challenge and a topic review to reinforce both speed and understanding.
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
                {loadingTopics ? (
                  <div className="text-center py-4" style={{ color: color.steel }}>
                    Loading topics...
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-4" style={{ color: color.steel }}>
                    No topics are currently available for your section.
                    <div className="text-xs mt-2" style={{ color: `${color.steel}AA` }}>
                      If you think this is a mistake, let your teacher know to publish topics to your section.
                    </div>
                  </div>
                ) : (
                  topics.map((topic) => (
                    <motion.div
                      key={topic.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/student/topics/${topic.slug}`)}
                        className="block w-full text-left rounded-lg p-4 transition"
                        style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                        aria-label={`Open topic ${topic.title}`}
                        title={`Open ${topic.title}`}
                      >
                        <div className="flex items-start space-x-3">
                          <BookOpen className="h-6 w-6 mt-0.5" style={{ color: color.teal }} />
                          <div className="min-w-0">
                            <span className="font-medium block" style={{ color: color.deep }}>
                              {topic.title}
                            </span>
                            {topic.description && (
                              <span
                                className="text-xs block mt-1 truncate"
                                style={{ color: `${color.steel}CC` }}
                                title={topic.description}
                              >
                                {topic.description}
                              </span>
                            )}
                            <span className="text-[11px] mt-1 block" style={{ color: `${color.steel}AA` }}>
                              Added {humanDate(topic.created_at)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))
                )}
              </motion.div>

              {/* Study Tips */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
                  Study Tips ✨
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm" style={{ color: color.steel }}>
                  <li>Do one Daily Challenge. Small steps add up.</li>
                  <li>Rotate topics—don’t get stuck on one area.</li>
                  <li>Explain a concept out loud to test understanding.</li>
                </ul>

                {/* Lightweight legend so new users understand the page */}
                <div className="mt-4 text-xs rounded-lg p-3" style={{ background: `${color.mist}22`, color: color.steel }}>
                  <p className="font-semibold mb-1">Dashboard Guide</p>
                  <p>• <strong>Your Progress</strong> shows totals and rates.</p>
                  <p>• <strong>Recent Activity</strong> lists your last five quiz completions.</p>
                  <p>• <strong>Keep Learning</strong> offers quick actions to stay on track.</p>
                  <p>• <strong>Topics</strong> are published by your teacher to your section.</p>
                </div>
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
