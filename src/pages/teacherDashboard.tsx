import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  BookOpen,
  Heart,
  Users,
  BarChart as BarChartIcon,
  Timer,
  PenSquare,
} from "lucide-react";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import color from "../styles/color";
import { useAuth } from "../hooks/useAuth";

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  quiz_title: string;
  score: number;
  time_spent: string; // e.g., "15 minutes"
  completed_at: string;
}

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

const quizzes: Quiz[] = [
  {
    id: "1",
    title: "Introduction to Functions",
    description: "Learn the basics of functions.",
    created_at: "2025-04-01",
  },
  {
    id: "2",
    title: "Operations on Functions",
    description: "Understand how to perform operations on functions.",
    created_at: "2025-04-02",
  },
];

const studentProgress: StudentProgress[] = [
  {
    student_id: "1",
    student_name: "Alice Johnson",
    quiz_title: "Introduction to Functions",
    score: 85,
    time_spent: "15 minutes",
    completed_at: "2025-04-01 10:00:00",
  },
  {
    student_id: "2",
    student_name: "Bob Smith",
    quiz_title: "Operations on Functions",
    score: 90,
    time_spent: "20 minutes",
    completed_at: "2025-04-02 11:00:00",
  },
  {
    student_id: "3",
    student_name: "Charlie Brown",
    quiz_title: "Evaluation of Functions",
    score: 75,
    time_spent: "25 minutes",
    completed_at: "2025-04-03 12:00:00",
  },
  {
    student_id: "4",
    student_name: "Diana Prince",
    quiz_title: "Composition of Functions",
    score: 80,
    time_spent: "18 minutes",
    completed_at: "2025-04-04 13:00:00",
  },
  {
    student_id: "5",
    student_name: "Ethan Hunt",
    quiz_title: "Rational Functions",
    score: 95,
    time_spent: "22 minutes",
    completed_at: "2025-04-05 14:00:00",
  },
];

function TeacherDashboard() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const username = useMemo(
    () => (email.includes("@") ? email.split("@")[0] : email || "Teacher"),
    [email]
  );

  // Local favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (topicTitle: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(topicTitle)) next.delete(topicTitle);
      else next.add(topicTitle);
      return next;
    });
  };

  // KPIs
  const totalQuizzes = quizzes.length;
  const totalStudents = new Set(studentProgress.map((s) => s.student_id)).size;
  const averageScore = studentProgress.length
    ? Math.round(
        studentProgress.reduce((acc, s) => acc + s.score, 0) / studentProgress.length
      )
    : 0;

  // Parse "15 minutes" → 15 (best-effort)
  const avgMinutes = useMemo(() => {
    if (!studentProgress.length) return 0;
    const nums = studentProgress
      .map((s) => parseInt(String(s.time_spent).match(/\d+/)?.[0] ?? "0", 10))
      .filter((n) => !Number.isNaN(n));
    if (!nums.length) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  }, []);

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)`,
      }}
    >
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Greeting */}
        <motion.div
          className="rounded-3xl p-6 sm:p-8 shadow-xl ring-1 mb-8"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight"
                  style={{ color: color.deep }}>
                Welcome back, <span style={{ color: color.teal }}>{username}</span> 👋
              </h1>
              {email && (
                <p className="mt-1 text-sm" style={{ color: color.steel }}>
                  Signed in as {email}
                </p>
              )}
              <p className="mt-3" style={{ color: color.steel }}>
                Plan lessons, monitor progress, and keep your class engaged.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/quiz/new" // 👉 change this route to your actual "create quiz" page
                className="inline-flex items-center rounded-xl px-5 py-3 font-semibold shadow-md transition"
                style={{ background: color.teal, color: "#fff" }}
              >
                <PenSquare className="mr-2 h-4 w-4" />
                Create quiz
              </Link>
              <Link
                to="/teacherDashboard"
                className="inline-flex items-center rounded-xl border px-5 py-3 font-semibold transition"
                style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
              >
                View reports
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
          {/* LEFT: KPIs + Student Progress + Quizzes */}
          <div className="lg:col-span-2 space-y-8">
            {/* KPIs */}
            <motion.div
              className="rounded-2xl p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: color.deep }}>
                Class Overview 📊
              </h2>
              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-6" variants={containerVariants}>
                {/* Students */}
                <motion.div
                  className="rounded-2xl p-6 shadow-sm transition"
                  style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: `${color.teal}22` }}
                    >
                      <Users className="h-6 w-6" style={{ color: color.teal }} />
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: color.steel }}>Active Students</div>
                      <div className="text-2xl font-extrabold" style={{ color: color.deep }}>
                        {totalStudents}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Avg Score */}
                <motion.div
                  className="rounded-2xl p-6 shadow-sm transition"
                  style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: `${color.teal}22` }}
                    >
                      <BarChartIcon className="h-6 w-6" style={{ color: color.teal }} />
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: color.steel }}>Average Score</div>
                      <div className="text-2xl font-extrabold" style={{ color: color.deep }}>
                        {averageScore}%
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Avg Time */}
                <motion.div
                  className="rounded-2xl p-6 shadow-sm transition"
                  style={{ background: `${color.mist}11`, border: `1px solid ${color.mist}55` }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: `${color.teal}22` }}
                    >
                      <Timer className="h-6 w-6" style={{ color: color.teal }} />
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: color.steel }}>Avg. Time per Quiz</div>
                      <div className="text-2xl font-extrabold" style={{ color: color.deep }}>
                        {avgMinutes}m
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Student Progress Table */}
            <motion.div
              className="rounded-2xl p-6 shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: color.deep }}>
                Student Progress 📈
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: color.mist }}>
                  <thead style={{ background: `${color.mist}11` }}>
                    <tr>
                      {["Student Name", "Quiz Title", "Score", "Time Spent", "Completed At"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: color.steel }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
                    {studentProgress.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                          {student.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                          {student.quiz_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                          {student.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                          {student.time_spent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.steel }}>
                          {new Date(student.completed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                {quizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="rounded-lg p-4 transition flex justify-between items-start"
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
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="flex items-center space-x-2 px-4 py-2 rounded-full transition"
                        style={{ background: color.teal, color: "#fff" }}
                      >
                        <Play className="h-4 w-4" />
                        <span>Edit Quiz</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Small footer count */}
              <div className="mt-4 text-sm" style={{ color: color.steel }}>
                {totalQuizzes} quiz{totalQuizzes === 1 ? "" : "zes"} total
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Topics w/ favorites */}
          <div className="lg:col-span-1">
            <motion.div
              className="rounded-2xl p-6 h-full shadow-xl ring-1"
              style={{ background: "#fff", borderColor: `${color.mist}55` }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: color.deep }}>
                  Topics 📚
                </h2>
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: `${color.teal}15`, color: color.teal, border: `1px solid ${color.teal}40` }}
                >
                  {topics.length} total
                </span>
              </div>

              <motion.div className="space-y-3" variants={containerVariants}>
                {topics.map((topic, index) => {
                  const fav = favorites.has(topic.title);
                  return (
                    <motion.div
                      key={topic.title}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="flex items-center rounded-lg p-4 transition relative"
                        style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                      >
                        <Link to={topic.path} className="flex-grow flex items-center">
                          <BookOpen className="h-5 w-5 mr-3" style={{ color: color.teal }} />
                          <span className="font-medium" style={{ color: color.deep }}>
                            {topic.title}
                          </span>
                        </Link>
                        <button
                          onClick={() => toggleFavorite(topic.title)}
                          className="ml-3 p-1.5 rounded-full transition"
                          aria-label={`Toggle favorite for ${topic.title}`}
                          style={{ color: fav ? color.teal : "#9CA3AF", background: fav ? `${color.teal}15` : "transparent" }}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TeacherDashboard;
