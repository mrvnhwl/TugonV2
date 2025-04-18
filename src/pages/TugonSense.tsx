import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Play } from "lucide-react";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Radio from "../components/Radio"; // Ensure this component exists

const topics = [
  { title: "Operations on Functions", path: "/operations" },
  { title: "Evaluation of Functions", path: "/evaluationdifficulty" },
  { title: "Composition of Functions", path: "/topics/composition-of-functions" },
  { title: "Rational Functions", path: "/topics/rational-functions" },
  { title: "Vertical, Horizontal and Oblique Asymptotes", path: "/topics/asymptotes" },
  { title: "Solving Rational Equations and Inequalities", path: "/topics/solving-rational-equations" },
  { title: "Inverse Functions", path: "/topics/inverse-functions" },
  { title: "Exponential and Logarithmic Functions", path: "/topics/exponential-logarithmic-functions" },
  { title: "Problem Solving Involving Functions", path: "/topics/problem-solving-functions" },
];

function TugonSense() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Choose a topic to study with TugonSense — your AI learning buddy
          </h1>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="flex flex-col justify-between border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-indigo-600 mr-3" aria-hidden="true" />
                    <span className="text-gray-900 font-medium">{topic.title}</span>
                  </div>
                  <Link
                    to={topic.path}
                    className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Play className="h-4 w-4" aria-hidden="true" />
                    <span>Start</span>
                  </Link>
                </div>
                
                {/* Star Rating */}
                <div className="mt-3 flex justify-center">
                  <Radio />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default TugonSense;
