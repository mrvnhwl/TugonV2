import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trophy, Clock, BarChart, BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

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
  { title: "Operations on Functions", path: "/operationstopic" },
  { title: "Evaluation of Functions", path: "/evaluationtopic" },
  { title: "Composition of Functions", path: "/compositiontopic" },
  { title: "Rational Functions", path: "/rationaltopic" },
  { title: "Vertical, Horizontal and Oblique Asymptotes", path: "/asymptotestopic" },
  { title: "Solving Rational Equations and Inequalities", path: "/rationalinequalitiestopic" },
  { title: "Inverse Functions", path: "/inversetopic" },
  { title: "Exponential and Logarithmic Functions", path: "/exponentialandlogtopic" },
  { title: "Problem Solving Involving Functions", path: "/problemsolvingfunctopic" },
  { title: "Graphs", path: "/graphs" },
];

function Dashboard() {
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
    quiz: Array.isArray(item.quiz) ? item.quiz[0] : item.quiz, // ensure single object
  }));

  setProgress(fixedProgress);
}

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Topics Section */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              >
                <Link
                  to={topic.path}
                  className="flex items-center border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-indigo-600 mr-3" />
                  <span className="text-gray-900 font-medium">{topic.title}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Quizzes */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Quizzes</h2>
            <div className="space-y-4">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                      </div>
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[ 
                  { icon: Trophy, value: progress.length, label: "Quizzes Completed" },
                  { icon: BarChart, value: progress.reduce((acc, curr) => acc + curr.score, 0), label: "Total Score" },
                  { icon: Clock, value: quizzes.length > 0 ? Math.round((progress.length / quizzes.length) * 100) : 0, label: "Completion Rate", isPercent: true }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="bg-indigo-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <item.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {item.value}
                        {item.isPercent && "%"}
                      </div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {progress.slice(0, 5).map((item, index) => (
                    <motion.div
                      key={item.quiz_id}
                      className="border border-gray-200 rounded-lg p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-gray-900 font-medium">{item.quiz?.title}</h4>
                          <p className="text-sm text-gray-500">Score: {item.score}</p>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(item.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
