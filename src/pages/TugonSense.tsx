import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Play, Heart, ArrowLeft } from "lucide-react"; // Import ArrowLeft for Back button
import { motion } from "framer-motion";

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
  const [favorites, setFavorites] = useState<string[]>([]); // State to track favorite topics
  const navigate = useNavigate();

  // Function to handle Back button navigation
  const handleBack = () => {
    const userType = localStorage.getItem("userType"); // Assuming userType is stored in localStorage
    if (userType === "student") {
      navigate("/studentDashboard");
    } else if (userType === "teacher") {
      navigate("/teacherDashboard");
    }
  };

  const toggleFavorite = (topicTitle: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(topicTitle)
        ? prevFavorites.filter((title) => title !== topicTitle) // Remove from favorites
        : [...prevFavorites, topicTitle] // Add to favorites
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Choose a topic to study with TugonSense — your AI learning buddy
          </h1>
          <p className="mt-2 text-gray-600">
            Explore topics, test your knowledge, and track your progress with TugonSense.
          </p>
        </motion.div>

        {/* Topics Section */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="flex flex-col justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Topic Title and Icon */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 text-indigo-600 mr-3" aria-hidden="true" />
                    <span className="text-gray-900 font-medium">{topic.title}</span>
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(topic.title)}
                    className="focus:outline-none"
                    aria-label={`${
                      favorites.includes(topic.title) ? "Remove from favorites" : "Add to favorites"
                    }`}
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        favorites.includes(topic.title) ? "text-red-500 fill-current" : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Start Button */}
                <div className="mt-4">
                  <Link
                    to={topic.path}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Play className="h-5 w-5" aria-hidden="true" />
                    <span>Start</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default TugonSense;
