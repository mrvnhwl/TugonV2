import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trophy, Clock, BarChart, BookOpen, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import color from "../styles/color";
import Confetti from "react-confetti";

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
  }, [user]); // eslint-disable-line

  // track window size for confetti
  useEffect(() => {
    const onResize = () => setWin({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ONE-TIME PER LOGIN POPUP
  useEffect(() => {
    if (!user) return;

    // Supabase supplies last_sign_in_at; use it to scope a unique session key
    const lastSignIn = (user as any)?.last_sign_in_at || "";
    const welcomeKey = `welcomeShown:${user.id}:${lastSignIn}`;

    const alreadyShown = sessionStorage.getItem(welcomeKey);
    if (!alreadyShown) {
      // first time this login -> show
      setShowWelcome(true);
      setConfettiOn(true);
      sessionStorage.setItem(welcomeKey, "1"); // mark as shown for this login/session
      const t = setTimeout(() => setConfettiOn(false), 3000);
      return () => clearTimeout(t);
    }
  }, [user]);

  const closeWelcome = () => setShowWelcome(false);

  const loadDashboard = async () => {
    try {
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (quizzesData) setQuizzes(quizzesData);

      const { data: progressData } = await supabase
        .from("user_progress")
        .select(`
          quiz_id,
          score,
          completed_at,
          quiz:quizzes (*)
        `)
        .eq("user_id", user?.id)
        .order("completed_at", { ascending: false });

      if (progressData) {
        const fixed = progressData.map((item) => ({
          ...item,
          quiz: Array.isArray(item.quiz) ? item.quiz[0] : item.quiz,
        }));
        setProgress(fixed);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "Are you sure you want to create accounts for all students in this CSV file? This action cannot be undone."
    );
    if (!confirmed) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as {
          student_number?: string;
          full_name?: string;
          email: string;
          password: string;
          grade_level?: string;
          section?: string;
          contact_number?: string;
        }[];

        for (const row of rows) {
          if (!row.email || !row.password) {
            console.error("Skipping invalid row:", row);
            continue;
          }
          if (row.password.trim().length < 6) {
            console.error("Password too short:", row.email);
            continue;
          }
          try {
            const { error } = await supabase.auth.signUp({
              email: row.email.trim(),
              password: row.password.trim(),
            });
            if (error) throw error;
            console.log(`✅ Created user: ${row.email}`);
          } catch (err: any) {
            console.error(`❌ Failed to create user ${row.email}:`, err.message);
            alert(`Error creating user for ${row.email}: ${err.message}`);
          }
        }
        alert("CSV import completed!");
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message);
      },
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
      >
        <motion.div
          className="rounded-full h-12 w-12 border-4 border-t-4"
          style={{ borderColor: `${color.teal}40` }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            borderColor: [`${color.teal}40`, color.teal, `${color.teal}40`],
          }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
        />
      </div>
    );
  }

  // KPIs
  const completed = progress.length;
  const totalScore = progress.reduce((acc, curr) => acc + (curr.score ?? 0), 0);
  const completionRate = quizzes.length ? Math.round((completed / quizzes.length) * 100) : 0;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
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
                style={{ background: `linear-gradient(120deg, ${color.teal}, ${color.aqua})`, color: "#fff" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold leading-tight">
                      Welcome back, <span className="underline decoration-white/50">{username}</span>! 👋
                    </h2>
                    {email && <p className="text-white/90 text-sm mt-1">Signed in as {email}</p>}
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
                  Keep your streak alive—jump into a quiz or review a topic. You’ve got this!
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

              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center" variants={containerVariants}>
                {[
                  { icon: Trophy, value: completed, label: "Quizzes Completed" },
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
                <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
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
                            {item.quiz?.title}
                          </h4>
                          <p className="text-sm" style={{ color: color.steel }}>
                            Score: {item.score}
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

            {/* Available Quizzes */}
            <motion.div
              className="rounded-2xl p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: color.deep }}>
                Available Quizzes 🧠
              </h2>
              <motion.div className="space-y-4" variants={containerVariants}>
                {quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={`/quiz/${quiz.id}`}
                      className="block rounded-lg p-4 transition flex justify-between items-center"
                      style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                    >
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: color.deep }}>
                          {quiz.title}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: color.steel }}>
                          {quiz.description}
                        </p>
                      </div>
                      <motion.div
                        className="flex items-center space-x-2 px-4 py-2 rounded-full transition"
                        style={{ background: color.teal, color: "#fff" }}
                        whileHover={{ scale: 1.08 }}
                      >
                        <Play className="h-4 w-4" />
                        <span>Start</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Topics + CSV */}
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

              {/* CSV Import */}
              <div className="mt-8">
                <label htmlFor="csv-upload" className="block text-sm font-medium mb-2" style={{ color: color.deep }}>
                  Import Students via CSV
                </label>

                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleCSVImport}
                />
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold shadow-md cursor-pointer"
                    style={{ background: color.teal, color: "#fff" }}
                  >
                    Upload CSV
                  </label>
                  <span className="text-xs" style={{ color: color.steel }}>
                    Expected headers: <code>email, password</code> (plus optional fields).
                  </span>
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
