import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trophy, Clock, BarChart, BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Papa from "papaparse"; // Add this at the top if not already installed: npm install papaparse

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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (quizzesData) {
        setQuizzes(quizzesData);
      }

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
        const fixedProgress = progressData.map((item) => ({
          ...item,
          quiz: Array.isArray(item.quiz) ? item.quiz[0] : item.quiz,
        }));

        setProgress(fixedProgress);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  // Handler for CSV import
  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Ask for confirmation before proceeding
    const confirmed = window.confirm(
      "Are you sure you want to create accounts for all students in this CSV file? This action cannot be undone."
    );
    if (!confirmed) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as {
          student_number: string;
          full_name: string;
          email: string;
          password: string;
          grade_level: string;
          section: string;
          contact_number: string;
        }[];


        for (const row of rows) {
          if (!row.email || !row.password) {
            console.error("Skipping invalid row:", row);
            continue;
          }

          // Check password length (Supabase default = 6 chars)
          if (row.password.trim().length < 6) {
            console.error("Password too short:", row.email);
            continue;
          }
          
          try {
            const { data, error } = await supabase.auth.signUp({
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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          className="rounded-full h-12 w-12 border-4 border-t-4 border-indigo-600 border-opacity-25"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            borderColor: [
              "rgba(99, 102, 241, 0.25)",
              "rgba(99, 102, 241, 1)",
              "rgba(99, 102, 241, 0.25)",
            ],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
          {/* Left Column: Progress and Quizzes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Progress 🚀
              </h2>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                variants={containerVariants}
              >
                {[
                  {
                    icon: Trophy,
                    value: progress.length,
                    label: "Quizzes Completed",
                    percent: quizzes.length
                      ? (progress.length / quizzes.length) * 100
                      : 100,
                  },
                  {
                    icon: BarChart,
                    value: progress.reduce((acc, curr) => acc + curr.score, 0),
                    label: "Total Score",
                    percent: 100, // always full circle
                  },
                  {
                    icon: Clock,
                    value:
                      quizzes.length > 0
                        ? Math.round((progress.length / quizzes.length) * 100)
                        : 0,
                    label: "Completion Rate",
                    percent:
                      quizzes.length > 0
                        ? (progress.length / quizzes.length) * 100
                        : 0,
                    isPercent: true,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    className="bg-indigo-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition cursor-pointer"
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex items-center justify-center mb-4">
                      {/* Full Circle */}
                      <div className="w-24 h-24 rounded-full border-4 border-indigo-600 flex flex-col items-center justify-center">
                        <item.icon className="h-5 w-5 text-indigo-600 mb-1" />
                        <span className="text-xl font-bold text-indigo-600">
                          {item.value}
                          {item.isPercent && "%"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      variants={itemVariants}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-gray-900 font-medium">
                            {item.quiz?.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Score: {item.score}
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
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
              className="bg-white rounded-2xl shadow-xl p-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                      className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {quiz.description}
                        </p>
                      </div>
                      <motion.div
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                        whileHover={{ scale: 1.1 }}
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

          {/* Right Column: Topics Section */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 h-full"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                      className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                        <span className="text-gray-900 font-medium">
                          {topic.title}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              {/* CSV Import Button */}
              <div className="mt-8">
                <label
                  htmlFor="csv-upload"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Import Students via CSV
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  onChange={handleCSVImport}
                />
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
