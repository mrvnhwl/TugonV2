import React from "react";
import { Link } from "react-router-dom";
import { Play, BookOpen, Heart } from "lucide-react"; // Import icons
import Footer from "../components/Footer";
import { motion } from "framer-motion";


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
  time_spent: string;
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
  { title: "SRational Equations and Inequalities", path: "/rationalinequalitiestopic" },
  { title: "Inverse Functions", path: "/inversetopic" },
  { title: "Exponential Functions", path: "/exponentialtopic" },
  { title: "Logarithmic Functions", path: "/logarithmictopic" },
 
];

const quizzes: Quiz[] = [
  { id: "1", title: "Introduction to Functions", description: "Learn the basics of functions.", created_at: "2025-04-01" },
  { id: "2", title: "Operations on Functions", description: "Understand how to perform operations on functions.", created_at: "2025-04-02" },
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
  const toggleFavorite = (topicTitle: string) => {
    console.log(`Toggled favorite for topic: ${topicTitle}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Render the teacher-specific Navbar */}
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
                <div className="flex items-center border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors relative">
                  <Link to={topic.path} className="flex-grow flex items-center">
                    <BookOpen className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="text-gray-900 font-medium">{topic.title}</span>
                  </Link>
                  <button
                    onClick={() => toggleFavorite(topic.title)}
                    className="absolute top-2 right-2 focus:outline-none"
                    aria-label={`Toggle favorite for ${topic.title}`}
                  >
                    <Heart className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Student Progress Section */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Progress</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentProgress.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.quiz_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.time_spent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(student.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Available Quizzes Section */}
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
                      <span>Edit Quiz</span>
                    </Link>
                  </div>
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

export default TeacherDashboard;
