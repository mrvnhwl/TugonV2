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
  FolderCog
} from "lucide-react";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import color from "../styles/color";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Papa from "papaparse";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  // publish_to holds array of section ids this quiz is published to
  publish_to?: string[] | null | string;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  latest_quiz_title: string;
  completed_at: string;
}

type Section = { id: string; name: string };

export default function TeacherDashboard() {
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
        // Sections owned by this teacher
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

  // CSV Import
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

  // Build latest-per-student list, optionally filtered by section
  const buildStudentProgress = async (rows: any[], sectionId: string) => {
    let filtered = rows;

    if (sectionId) {
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
        student_name: row.user_email || (row.user_id ?? "").slice(0, 8) || "Unknown",
        latest_quiz_title: row.quizzes?.title ?? "Untitled quiz",
        completed_at: row.completed_at,
      }))
      .sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at));

    setStudentProgress(latestPerStudent);
  };

  // Rebuild filtered list when dropdown changes
  useEffect(() => {
    buildStudentProgress(progressAll, selectedSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);

  // ---------- KPI: Average Score ----------
  const averageScore = useMemo(() => {
    if (!quizForAvg) return 0;
    const subset = progressAll.filter((r) => r.quiz_id === quizForAvg);
    if (!subset.length) return 0;

    const toPct = (n: number) => {
      const x = Number(n ?? 0);
      const pct = x > 100 ? x / 10 : x;
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

  // ---------- update quiz publish_to on DB and reflect locally
  const updateQuizPublish = async (quizId: string, publishTo: string[]) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ publish_to: publishTo })
        .eq("id", quizId);
      if (error) throw error;
      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, publish_to: publishTo } : q)));
      // small feedback (you can replace with toast)
      alert("Publish settings updated");
    } catch (e) {
      console.error("Failed to update publish settings:", e);
      alert("Failed to update publish settings");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Derived for table & pagination ----------
  const totalStudents = studentProgress.length;
  const totalPages = Math.max(1, Math.ceil(totalStudents / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pagedStudents = studentProgress.slice(start, start + PER_PAGE);

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
              {/* NEW: Manage Topics button */}
              <Link
                to="/manage-topics"
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold transition w-full sm:w-auto"
                style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
              >
                <FolderCog className="mr-2 h-4 w-4" />
                Manage topics
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
                        Number of Students
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

            {/* Student Progress */}
            <motion.div
              className="rounded-2xl p-4 sm:p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: color.deep }}>
                Student Progress 📈
              </h2>

              {/* Section dropdown */}
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
            <QuizzesBlock
              quizzes={quizzes}
              sections={sections}
              onUpdatePublish={updateQuizPublish}
            />
          </div>

          {/* RIGHT: Topics w/ realtime updates */}
          <TopicsBlock favorites={favorites} toggleFavorite={toggleFavorite} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ----------------------- small presentational blocks ---------------------- */

function QuizzesBlock({
  quizzes,
  sections,
  onUpdatePublish,
}: {
  quizzes: Quiz[];
  sections: { id: string; name: string }[];
  onUpdatePublish: (quizId: string, publishTo: string[]) => Promise<void>;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
    } as const;
    const itemVariants = {
      hidden: { y: 16, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    } as const;

  // Search and filter state
  const [quizSearch, setQuizSearch] = React.useState("");
  
  // Modal state
  const [publishModalOpenFor, setPublishModalOpenFor] = React.useState<string | null>(null);
  const [publishSelection, setPublishSelection] = React.useState<Set<string>>(new Set());
  const [sectionSearch, setSectionSearch] = React.useState("");

  const normalizePublishTo = (pub: Quiz['publish_to']): string[] => {
    if (!pub) return [];
    if (Array.isArray(pub)) return pub.map(String);
    if (typeof pub === 'string') {
      try {
        const parsed = JSON.parse(pub);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {}
      // fallback: comma separated
      return pub.split(',').map(x => x.trim()).filter(Boolean);
    }
    return [];
  };

  const openPublishModal = async (quiz: Quiz) => {
    // fetch latest publish_to from DB to ensure we show the persisted value
    try {
      const { data, error } = await supabase.from('quizzes').select('publish_to').eq('id', quiz.id).single();
      if (error) throw error;
      const initial = new Set(normalizePublishTo((data as any)?.publish_to ?? quiz.publish_to));
      setPublishSelection(initial);
    } catch (e) {
      console.error('Failed to fetch latest publish_to for quiz', quiz.id, e);
      // fallback to whatever we had in memory
      const initial = new Set(normalizePublishTo(quiz.publish_to));
      setPublishSelection(initial);
    }
    setPublishModalOpenFor(quiz.id);
  };

  const closePublishModal = () => {
    setPublishModalOpenFor(null);
    setPublishSelection(new Set());
  };

  const toggleSection = (id: string) => {
    setPublishSelection((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const savePublish = async (quizId: string) => {
    await onUpdatePublish(quizId, Array.from(publishSelection));
    closePublishModal();
  };

  return (
    <motion.div
      className="rounded-2xl p-4 sm:p-6 shadow-xl ring-1"
      style={{ background: "#fff", borderColor: `${color.mist}55` }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-2xl font-bold" style={{ color: color.deep }}>
          Available Quizzes 🧠
        </h2>
        
        {/* Quiz search */}
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            value={quizSearch}
            onChange={(e) => setQuizSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full sm:w-64 px-4 py-2 pr-8 rounded-xl border text-sm"
            style={{ borderColor: color.mist, color: color.deep }}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: color.steel }} />
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-sm" style={{ color: color.steel }}>
          No quizzes yet. Create one to get started.
        </div>
      ) : (
        <motion.div className="space-y-3 sm:space-y-4" variants={containerVariants}>
          {quizzes
            .filter(quiz => 
              !quizSearch || 
              quiz.title.toLowerCase().includes(quizSearch.toLowerCase())
            )
            .map((quiz) => (
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
                <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 w-full">
                {/* LEFT SIDE (text) */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-base sm:text-lg font-semibold truncate"
                    style={{ color: color.deep }}
                    title={quiz.title}
                  >
                    {quiz.title}
                  </h3>

                  <p
                    className="text-sm mt-1 line-clamp-2"
                    style={{
                      color: color.steel,
                      maxWidth: "100%",
                    }}
                  >
                    {quiz.description ?? ""}
                  </p>
                </div>

                {/* RIGHT SIDE (buttons) */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    to={`/edit-quiz/${quiz.id}`}
                    className="flex items-center justify-center space-x-2 px-4 py-2 rounded-full transition text-sm sm:text-base"
                    style={{ background: color.teal, color: "#fff" }}
                  >
                    <PenSquare className="h-4 w-4" />
                    <span>Edit Quiz</span>
                  </Link>

                  <button
                    onClick={() => openPublishModal(quiz)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 rounded-full border transition text-sm sm:text-base"
                    style={{
                      background: "#fff",
                      borderColor: color.mist,
                      color: color.deep,
                    }}
                  >
                    <span>Publish To</span>
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Publish modal */}
      {publishModalOpenFor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closePublishModal} />
          <div 
            className="relative w-[480px] rounded-2xl shadow-2xl bg-white flex flex-col" 
              style={{ border: `1px solid ${color.mist}`, height: '500px' }}
          >
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: color.mist }}>
              <h3 className="font-bold" style={{ color: color.deep }}>Who can access this quiz?</h3>
            </div>
            
            {/* Search and Select All - Fixed section */}
            <div className="p-4 border-b" style={{ borderColor: color.mist }}>
              <div className="relative mb-3">
                <input
                  type="text"
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  placeholder="Search sections..."
                  className="w-full px-4 py-2 pr-8 rounded-xl border text-sm"
                  style={{ borderColor: color.mist, color: color.deep }}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: color.steel }} />
              </div>
              
              <label className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={sections.length > 0 && sections.every(s => publishSelection.has(s.id))}
                  onChange={() => {
                    if (sections.every(s => publishSelection.has(s.id))) {
                      setPublishSelection(new Set());
                    } else {
                      setPublishSelection(new Set(sections.map(s => s.id)));
                    }
                  }}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="font-medium" style={{ color: color.deep }}>Select All Sections</span>
              </label>
            </div>

            {/* Scrollable section list */}
            <div className="flex-1 overflow-y-auto p-4">
              {sections.length === 0 ? (
                <div className="text-sm" style={{ color: color.steel }}>No sections available.</div>
              ) : (
                sections
                  .filter(s => !sectionSearch || s.name.toLowerCase().includes(sectionSearch.toLowerCase()))
                  .map((s) => {
                  const checked = publishSelection.has(s.id);
                  // Show published state more clearly
                  return (
                    <label key={s.id} className="flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSection(s.id)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span style={{ color: color.deep }}>{s.name}</span>
                      {checked && (
                        <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${color.teal}22`, color: color.teal }}>
                          Published
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
            {/* Fixed footer */}
            <div className="border-t p-4" style={{ borderColor: color.mist }}>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={closePublishModal} 
                  className="rounded-xl px-4 py-2 border" 
                  style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => savePublish(publishModalOpenFor)} 
                  className="rounded-xl px-4 py-2" 
                  style={{ background: color.teal, color: "#fff" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
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
  type TopicRow = { id: string; title: string; file_url: string | null; created_at: string };

  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("id, title, file_url, created_at")
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) {
        console.error(error);
        setTopics([]);
      } else {
        setTopics((data ?? []) as TopicRow[]);
      }
      setLoading(false);
    })();

    // Realtime subscription (INSERT | UPDATE | DELETE)
    const channel = supabase
      .channel("public:topics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "topics" },
        async (payload) => {
          // Re-fetch list on any change to keep it simple & consistent
          const { data, error } = await supabase
            .from("topics")
            .select("id, title, file_url, created_at")
            .order("created_at", { ascending: false });
          if (!error && data) setTopics(data as TopicRow[]);
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

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
          {loading ? "…" : `${topics.length} total`}
        </span>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: color.steel }}>Loading…</div>
      ) : topics.length === 0 ? (
        <div className="text-sm" style={{ color: color.steel }}>
          No topics yet. Click <Link to="/manage-topics" className="underline" style={{ color: color.teal }}>Manage topics</Link> to add one.
        </div>
      ) : (
        <motion.div className="space-y-3" variants={containerVariants}>
          {topics.map((t) => {
            const fav = favorites.has(t.title);
            return (
              <motion.div
                key={t.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="flex items-center rounded-lg p-3 sm:p-4 transition relative"
                  style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                >
                  {t.file_url ? (
                    <a
                      href={t.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-grow flex items-center min-w-0"
                      title={t.title}
                    >
                      <BookOpen className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: color.teal }} />
                      <span className="font-medium truncate" style={{ color: color.deep }}>
                        {t.title}
                      </span>
                    </a>
                  ) : (
                    <div className="flex-grow flex items-center min-w-0">
                      <BookOpen className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: color.teal }} />
                      <span className="font-medium truncate" style={{ color: color.deep }}>
                        {t.title}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => toggleFavorite(t.title)}
                    className="ml-2 sm:ml-3 p-2 rounded-full transition"
                    aria-label={`Toggle favorite for ${t.title}`}
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
      )}
    </motion.div>
  );
}
