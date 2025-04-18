import React from "react";
import { Link } from "react-router-dom";
import { Brain, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const features = [
  {
    title: "Create Quizzes",
    description: "Easily create interactive quizzes with multiple choice questions and time limits.",
    icon: Brain,
  },
  {
    title: "Track Progress",
    description: "Monitor student performance and progress with detailed analytics.",
    icon: Users,
  },
  {
    title: "Compete",
    description: "Engage students with real-time competition and leaderboards.",
    icon: Trophy,
  },
];

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <motion.h1
            className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <>
              <span className="block">Welcome to</span>
              <span className="block text-indigo-600">Tugon</span>
            </>
          </motion.h1>

          <motion.p
            className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Create engaging quizzes, track student progress, and make learning fun!
          </motion.p>

          <motion.div
            className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link
              to="/login"
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
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base text-gray-500">{feature.description}</p>
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

export default Home;
