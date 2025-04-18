import React from "react";
import { Button } from "@/components/ui/button"

import Footer from "../../components/Footer";

function DifficultySelector() {
  const difficultyInfo = {
    Easy: "Basic problems for quick practice and confidence building.",
    Average: "Moderate problems to test understanding of core concepts.",
    Hard: "Challenging problems to push your problem-solving skills.",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Select Difficulty Level</h1>
          <div className="flex flex-col sm:flex-column justify-center items-center gap-4">
            {["Easy", "Average", "Hard"].map((level) => (
              <div key={level} className="relative group">
                <button
                  className={`px-6 py-3 rounded-lg shadow text-white font-semibold transition-colors duration-300 ${
                    level === "Easy"
                      ? "bg-green-500 hover:bg-green-600"
                      : level === "Average"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {level}
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-56 bg-gray-800 text-white text-sm rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  {difficultyInfo[level]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DifficultySelector;
