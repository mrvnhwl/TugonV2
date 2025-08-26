import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Play, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Lottie from "react-lottie";
import createAnimation from "../components/assets/animations/create.json";
import competeAnimation from "../components/assets/animations/comp.json";
import progressAnimation from "../components/assets/animations/progress.json";
import quizAnimation from "../components/assets/animations/quiz.json";

const features = [
  {
    title: "Explore Topics",
    description: "Dive into a variety of topics to enhance your knowledge and understanding.",
    icon: BookOpen,
    animation: createAnimation,
    link: "/studentDashboard",
  },
  {
    title: "Take Quizzes",
    description: "Test your knowledge and challenge yourself with interactive quizzes.",
    icon: Play,
    animation: quizAnimation,
    link: "/studentDashboard",
  },
  {
    title: "Track Progress",
    description: "Monitor your learning journey and achievements over time.",
    icon: BarChart,
    animation: progressAnimation,
    link: "/studentDashboard",
  },
  {
    title: "Compete with Friends",
    description: "Engage in exciting quiz competitions and challenge your friends in real-time.",
    icon: Play,
    animation: competeAnimation,
    link: "/studentDashboard",
  },
];

function StudentHome() {
  const lottieOptions = (animationData: any) => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  });

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-indigo-300 rounded-full opacity-40 blur-3xl"
          animate={{ x: [0, 40, -40, 0], y: [0, -40, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-300 rounded-full opacity-40 blur-3xl"
          animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Hero Section */}
        <div className="text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">Tugon for Students</span>
          </motion.h1>

          <motion.p
            className="mt-3 max-w-md mx-auto text-sm sm:text-base md:text-lg text-gray-500 md:mt-5 md:max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Your journey to mastering new skills starts here. Explore topics, take quizzes, and track your progress.
          </motion.p>

          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link
              to="/studentDashboard"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 md:px-10 md:py-4 text-base md:text-lg font-medium rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 sm:mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
                    <h3 className="mt-6 text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-sm sm:text-base text-gray-500">{feature.description}</p>
                    <div className="mt-4 w-full max-w-[200px] sm:max-w-xs">
                      <Lottie options={lottieOptions(feature.animation)} height="100%" width="100%" />
                    </div>
                    <Link
                      to={feature.link}
                      className="mt-4 inline-block text-indigo-600 hover:underline text-sm sm:text-base"
                    >
                      Learn More
                    </Link>
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

export default StudentHome;
