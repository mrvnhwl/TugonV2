import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Play, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const lessons = [
  { title: "Operations on Functions", path: "/operations", unlocked: true },
  { title: "Evaluation of Functions", path: "/evaluationdifficulty", unlocked: true },
  { title: "Composition of Functions", path: "/topics/composition-of-functions", unlocked: false },
  { title: "Rational Functions", path: "/topics/rational-functions", unlocked: false },
  { title: "Vertical, Horizontal and Oblique Asymptotes", path: "/topics/asymptotes", unlocked: false },
  { title: "Solving Rational Equations and Inequalities", path: "/topics/solving-rational-equations", unlocked: false },
  { title: "Inverse Functions", path: "/topics/inverse-functions", unlocked: false },
  { title: "Exponential and Logarithmic Functions", path: "/topics/exponential-logarithmic-functions", unlocked: false },
  { title: "Problem Solving Involving Functions", path: "/topics/problem-solving-functions", unlocked: false },
];

function TugonSenseBrilliantStyle() {
  const navigate = useNavigate();

  const handleBack = () => {
    const userType = localStorage.getItem("userType");
    if (userType === "student") navigate("/studentDashboard");
    else if (userType === "teacher") navigate("/teacherDashboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Course Card */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg flex-1 lg:max-w-sm"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tangram.svg/1200px-Tangram.svg.png"
                alt="Course"
                className="w-20 h-20 mx-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-center">Mathematical Thinking</h1>
            <p className="text-gray-600 text-center mt-2">
              Learn to wield important tools in number sense and computation.
            </p>
            <div className="flex justify-center gap-4 mt-4 text-gray-500 text-sm">
              <span>📚 44 Lessons</span>
              <span>📝 602 Exercises</span>
            </div>
          </motion.div>

          {/* Right: Lesson Path */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Level 1 — Functions</h2>

            <div className="flex flex-col gap-8 relative">
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.title}
                  className={`flex items-center gap-4 p-4 rounded-lg shadow-md transition-all ${
                    lesson.unlocked ? "bg-white" : "bg-gray-100"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Lesson Icon */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      lesson.unlocked ? "bg-indigo-100" : "bg-gray-300"
                    }`}
                  >
                    {lesson.unlocked ? (
                      <Play className="text-indigo-600" />
                    ) : (
                      <Lock className="text-gray-500" />
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{lesson.title}</h3>
                  </div>

                  {/* Start Button */}
                  {lesson.unlocked && (
                    <Link
                      to={lesson.path}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Start
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default TugonSenseBrilliantStyle;
