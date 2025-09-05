// src/pages/teacherDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Heart,
  Users,
  BarChart as BarChartIcon,
  Timer,
  PenSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import color from "../styles/color";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  latest_quiz_title: string;
  completed_at: string;
}

type Section = { id: string; name: string }; // <-- added

function TeacherDashboard() {
  const { user } = useAuth();

  // ---------- Auth display ----------
  const email = user?.email ?? "";
  const username = useMemo(
    () => (email.includes("@") ? email.split("@")[0] : email || "Teacher"),
    [email]
  );

  // ---------- State ----------
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progressAll, setProgressAll] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);

  // NEW: sections + selected section
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");

  // KPI filter: which quiz to compute average for
  const [quizForAvg, setQuizForAvg] = useState<string>("");

  // pagination for Student Progress (10 / page)
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // ---------- Data fetch ----------
  useEffect(() => {
    const load = async () => {
      try {
        // NEW: load teacher's sections (by id or email)
        const { data: sectionRows, error: secErr } = await supabase
          .from("sections")
          .select("id, name")
          .or(`created_by.eq.${user?.id},created_by_email.eq.${email}`)
          .order("created_at", { ascending: true });
        if (secErr) throw secErr;
        setSections(sectionRows ?? []);

        // Quizzes
        const { data: quizzesData, error: quizzesErr } = await supabase
          .from("quizzes")
          .select("id, title, description, created_at")
          .order("created_at", { ascending: false });
        if (quizzesErr) throw quizzesErr;

        setQuizzes(quizzesData ?? []);
        if (!quizForAvg && quizzesData && quizzesData.length) {
          setQuizForAvg(quizzesData[0].id);
        }

        // Progress rows newest-first
        const { data: progressRows, error: progressErr } = await supabase
          .from("user_progress")
          .select(`
            user_id,
            user_email,
            quiz_id,
            score,
            completed_at,
            quizzes ( title )
          `)
          .order("completed_at", { ascending: false })
          .limit(1000);
        if (progressErr) throw progressErr;

        setProgressAll(progressRows ?? []);

        // Build latest-per-student list (initially "All Sections")
        await buildStudentProgress(progressRows ?? [], "");
        setPage(1);
      } catch (e) {
        console.error("Error loading teacher dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NEW: helper to (re)build StudentProgress list, optionally filtered by section
  const buildStudentProgress = async (rows: any[], sectionId: string) => {
    let filtered = rows;

    if (sectionId) {
      // get member emails for the chosen section
      const { data: members, error: mErr } = await supabase
        .from("section_students")
        .select("student_email")
        .eq("section_id", sectionId);
      if (!mErr && members) {
        const memberEmails = new Set(members.map((m) => m.student_email));
        filtered = rows.filter((r) => memberEmails.has(r.user_email));
      }
    }

    // Latest per student by user_id
    const latestMap = new Map<string, any>();
    for (const row of filtered) {
      const uid = row.user_id as string;
      if (!uid || latestMap.has(uid)) continue;
      latestMap.set(uid, row);
    }

    const latestPerStudent: StudentProgress[] = Array.from(latestMap.values())
      .map((row: any) => ({
        student_id: row.user_id,
        student_name:
          row.user_email || (row.user_id ?? "").slice(0, 8) || "Unknown",
        latest_quiz_title: row.quizzes?.title ?? "Untitled quiz",
        completed_at: row.completed_at,
      }))
      .sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at));

    setStudentProgress(latestPerStudent);
  };

  // NEW: when dropdown changes, rebuild filtered list
  useEffect(() => {
    buildStudentProgress(progressAll, selectedSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);

  // ---------- KPI: Average Score (per selected quiz) ----------
  const averageScore = useMemo(() => {
    if (!quizForAvg) return 0;
    const subset = progressAll.filter((r) => r.quiz_id === quizForAvg);
    if (!subset.length) return 0;

    const toPct = (n: number) => {
      const x = Number(n ?? 0);
      const pct = x > 100 ? x / 10 : x; // normalize if points-like
      return Math.max(0, Math.min(100, pct));
    };

    const mean =
      subset.reduce((acc: number, r: any) => acc + toPct(r.score ?? 0), 0) /
      subset.length;
    return Number(mean.toFixed(1));
  }, [progressAll, quizForAvg]);

  // ---------- Favorites ----------
  const toggleFavorite = (topicTitle: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(topicTitle) ? next.delete(topicTitle) : next.add(topicTitle);
      return next;
    });
  };

  // ---------- Derived for table & pagination ----------
  const totalStudents = studentProgress.length;
  const totalPages = Math.max(1, Math.ceil(totalStudents / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pagedStudents = studentProgress.slice(start, start + PER_PAGE);

  const avgMinutes = 0;

  // ---------- Motion variants ----------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
      >
        <motion.div
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-t-4"
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

  const safeDate = (d: string) => (d ? new Date(d).toLocaleDateString?.() || "" : "");

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
    >
      <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        {/* Hero / Greeting */}
        <motion.div
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl ring-1 mb-4 sm:mb-8"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1
                className="text-lg sm:text-3xl font-extrabold leading-tight truncate"
                style={{ color: color.deep }}
                title={`Welcome back, ${username}`}
              >
                Welcome back, <span style={{ color: color.teal }}>{username}</span> 👋
              </h1>
              {email && (
                <p className="mt-1 text-xs sm:text-sm truncate" style={{ color: color.steel }}>
                  Signed in as {email}
                </p>
              )}
              <p className="mt-2 sm:mt-3 text-xs sm:text-base" style={{ color: color.steel }}>
                Plan lessons, monitor progress, and keep your class engaged.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <Link
                to="/create-quiz"
                className="inline-flex items-center justify-center rounded-xl px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold shadow-md transition w-full sm:w-auto"
                style={{ background: color.teal, color: "#fff" }}
              >
                <PenSquare className="mr-2 h-4 w-4" />
                Create quiz
              </Link>
              <Link
                to="/teacherDashboard"
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold transition w-full sm:w-auto"
                style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
              >
                View reports
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 gap-4">
          {/* LEFT: KPIs + Student Progress + Quizzes */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* KPIs */}
            <motion.div
              className="rounded-2xl p-4 sm:p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: color.deep }}>
                Class Overview 📊
              </h2>

              {/* KPI Select */}
              <div className="mb-3">
                <label className="block text-xs mb-1" style={{ color: color.steel }}>
                  Average Quiz Score
                </label>
                <select
                  value={quizForAvg}
                  onChange={(e) => setQuizForAvg(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title || "(Untitled)"}
                    </option>
                  ))}
                </select>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
                variants={containerVariants}
              >
                {/* Students */}
                <motion.div
                  className="rounded-2xl p-4 sm:p-5 shadow-sm transition"
                  style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-3" style={{ background: `${color.teal}22` }}>
                      <Users className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: color.teal }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm" style={{ color: color.steel }}>
                        Active Students
                      </div>
                      <div className="text-lg sm:text-2xl font-extrabold" style={{ color: color.deep }}>
                        {studentProgress.length}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Avg Score */}
                <motion.div
                  className="rounded-2xl p-4 sm:p-5 shadow-sm transition"
                  style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-3" style={{ background: `${color.teal}22` }}>
                      <BarChartIcon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: color.teal }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm" style={{ color: color.steel }}>
                        Average Score
                      </div>
                      <div className="text-lg sm:text-2xl font-extrabold" style={{ color: color.deep }}>
                        {averageScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Avg Time */}
                <motion.div
                  className="rounded-2xl p-4 sm:p-5 shadow-sm transition"
                  style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-3" style={{ background: `${color.teal}22` }}>
                      <Timer className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: color.teal }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm" style={{ color: color.steel }}>
                        Avg. Time per Quiz
                      </div>
                      <div className="text-lg sm:text-2xl font-extrabold" style={{ color: color.deep }}>
                        0m
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Student Progress (latest per student) */}
            <motion.div
              className="rounded-2xl p-4 sm:p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: color.deep }}>
                Student Progress 📈
              </h2>

              {/* NEW: Section dropdown */}
              <div className="mb-4">
                <label className="block text-xs mb-1" style={{ color: color.steel }}>
                  Filter by Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full sm:w-64 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
                >
                  <option value="">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {studentProgress.length === 0 ? (
                <div className="text-sm" style={{ color: color.steel }}>
                  No progress yet. Once students complete quizzes, their latest results will appear here.
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {pagedStudents.map((s) => (
                      <div
                        key={s.student_id}
                        className="rounded-xl p-4 transition"
                        style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div
                              className="font-semibold text-sm truncate"
                              style={{ color: color.deep }}
                              title={s.student_name}
                            >
                              {s.student_name}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: color.steel }}>
                              {safeDate(s.completed_at)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm" style={{ color: color.steel }}>
                          Latest quiz:{" "}
                          <span className="font-medium" style={{ color: color.deep }}>
                            {s.latest_quiz_title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-[560px] w-full divide-y" style={{ borderColor: color.mist }}>
                        <thead style={{ background: `${color.mist}11` }}>
                          <tr>
                            {["Student", "Latest Quiz", "Completed At"].map((h) => (
                              <th
                                key={h}
                                className="px-4 sm:px-6 py-3 text-left text-s font-medium uppercase tracking-wider"
                                style={{ color: color.steel }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
                          {pagedStudents.map((s) => (
                            <tr key={s.student_id} className="hover:bg-gray-50/60">
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                {s.student_name}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                {s.latest_quiz_title}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.steel }}>
                                {safeDate(s.completed_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 sm:mt-5 flex items-center justify-between">
                    <div className="text-xs sm:text-sm" style={{ color: color.steel }}>
                      Showing <strong>{pagedStudents.length}</strong> of{" "}
                      <strong>{studentProgress.length}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border px-3 py-2 disabled:opacity-40 active:scale-95"
                        style={{ borderColor: color.mist, background: "#fff" }}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm" style={{ color: color.steel }}>
                        Page {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="rounded-lg border px-3 py-2 disabled:opacity-40 active:scale-95"
                        style={{ borderColor: color.mist, background: "#fff" }}
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Available Quizzes */}
            <QuizzesBlock quizzes={quizzes} />
          </div>

          {/* RIGHT: Topics w/ favorites */}
          <TopicsBlock favorites={favorites} toggleFavorite={toggleFavorite} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ----------------------- small presentational blocks ---------------------- */

function QuizzesBlock({ quizzes }: { quizzes: Quiz[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="rounded-2xl p-4 sm:p-6 shadow-xl ring-1"
      style={{ background: "#fff", borderColor: `${color.mist}55` }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: color.deep }}>
        Available Quizzes 🧠
      </h2>

      {quizzes.length === 0 ? (
        <div className="text-sm" style={{ color: color.steel }}>
          No quizzes yet. Create one to get started.
        </div>
      ) : (
        <motion.div className="space-y-3 sm:space-y-4" variants={containerVariants}>
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="rounded-lg p-4 transition flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
              >
                <div className="min-w-0">
                  <h3
                    className="text-base sm:text-lg font-semibold truncate"
                    style={{ color: color.deep }}
                    title={quiz.title}
                  >
                    {quiz.title}
                  </h3>
                  <p className="text-sm mt-1 line-clamp-2 sm:line-clamp-none" style={{ color: color.steel }}>
                    {quiz.description ?? ""}
                  </p>
                </div>
                <Link
                  to={`/edit-quiz/${quiz.id}`}
                  className="flex items-center justify-center space-x-2 px-4 py-2 rounded-full transition w-full sm:w-auto text-sm sm:text-base"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  <PenSquare className="h-4 w-4" />
                  <span>Edit Quiz</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-4 text-sm" style={{ color: color.steel }}>
        {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} total
      </div>
    </motion.div>
  );
}

function TopicsBlock({
  favorites,
  toggleFavorite,
}: {
  favorites: Set<string>;
  toggleFavorite: (title: string) => void;
}) {
  const topics = [
    { title: "Introduction to Functions", path: "/introductiontopic" },
    { title: "Evaluating Functions", path: "/evaluationtopic" },
    { title: "Piecewise-Defined Functions", path: "/piecewise" },
    { title: "Operations on Functions", path: "/operationstopic" },
    { title: "Composition of Functions", path: "/compositiontopic" },
    { title: "Rational Functions", path: "/rationaltopic" },
    { title: "Vertical, Horizontal and Oblique Asymptotes", path: "/asymptotestopic" },
    { title: "Rational Equations and Inequalities", path: "/rationalinequalitiestopic" },
    { title: "Inverse Functions", path: "/inversetopic" },
    { title: "Exponential Functions", path: "/exponentialtopic" },
    { title: "Logarithmic Functions", path: "/logarithmictopic" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="rounded-2xl p-4 sm:p-6 shadow-xl ring-1"
      style={{ background: "#fff", borderColor: `${color.mist}55` }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold" style={{ color: color.deep }}>
          Topics 📚
        </h2>
        <span
          className="rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium whitespace-nowrap"
          style={{ background: `${color.teal}15`, color: color.teal, border: `1px solid ${color.teal}40` }}
        >
          {topics.length} total
        </span>
      </div>

      <motion.div className="space-y-3" variants={containerVariants}>
        {topics.map((topic) => {
          const fav = favorites.has(topic.title);
          return (
            <motion.div
              key={topic.title}
              variants={itemVariants}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="flex items-center rounded-lg p-3 sm:p-4 transition relative"
                style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
              >
                <Link to={topic.path} className="flex-grow flex items-center min-w-0">
                  <BookOpen className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: color.teal }} />
                  <span className="font-medium truncate" style={{ color: color.deep }} title={topic.title}>
                    {topic.title}
                  </span>
                </Link>
                <button
                  onClick={() => toggleFavorite(topic.title)}
                  className="ml-2 sm:ml-3 p-2 rounded-full transition"
                  aria-label={`Toggle favorite for ${topic.title}`}
                  style={{
                    color: fav ? color.teal : "#9CA3AF",
                    background: fav ? `${color.teal}15` : "transparent",
                  }}
                  title={fav ? "Unfavorite" : "Favorite"}
                >
                  <Heart className="h-5 w-5" fill={fav ? color.teal : "none"} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default TeacherDashboard;
