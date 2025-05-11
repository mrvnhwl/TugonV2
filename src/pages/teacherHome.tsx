import React from "react";
import { Link } from "react-router-dom";
import { Brain, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Lottie from "react-lottie";
import createAnimation from "../components/assets/animations/create.json"; // Animation for Create Quiz
import progressAnimation from "../components/assets/animations/progress.json"; // Animation for Track Progress
import engageAnimation from "../components/assets/animations/engage.json"; // Animation for Compete

const features = [
  {
    title: "Create Quizzes",
    description: "Easily create interactive quizzes with multiple choice questions and time limits.",
    icon: Brain,
    animation: createAnimation, // Add animation for Create Quizzes
  },
  {
    title: "Track Progress",
    description: "Monitor student performance and progress with detailed analytics.",
    icon: Users,
    animation: progressAnimation, // Add animation for Track Progress
  },
  {
    title: "Engage Students",
    description: "Make learning fun with real-time competitions and leaderboards.",
    icon: Trophy,
    animation: engageAnimation, // Add animation for Engage Students
  },
];

function TeacherHome() {
  const lottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  });

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background SVG Animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-indigo-300 rounded-full opacity-50 blur-3xl"
          animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full opacity-50 blur-3xl"
          animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <motion.h1
            className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">Tugon</span>
          </motion.h1>

          <motion.p
            className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Empower your teaching with tools to create quizzes, track student progress, and engage your class like never before.
          </motion.p>

          <motion.div
            className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link
              to="/teacherDashboard"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md md:py-4 md:text-lg md:px-10 transition-all"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.7 }}
              >
                <div className="group flow-root bg-white rounded-2xl px-6 pb-8 shadow-md hover:shadow-lg transition-all">
                  <div className="-mt-6 flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-500 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                      {React.createElement(feature.icon, { className: "h-6 w-6 text-white" })}
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base text-gray-500">{feature.description}</p>
                    {/* Add Lottie Animation */}
                    <div className="mt-4 w-48 h-48">
                      <Lottie options={lottieOptions(feature.animation)} height={192} width={192} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default TeacherHome;
