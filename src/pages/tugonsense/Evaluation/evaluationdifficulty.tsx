import React from "react";
import { Button } from "@/components/ui/button";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar"; // Import Navbar
import { useNavigate } from "react-router-dom";

function DifficultySelector() {
  const router = useNavigate();

  const difficultyInfo = {
    Easy: "Basic problems for quick practice and confidence building.",
    Average: "Moderate problems to test understanding of core concepts.",
    Hard: "Challenging problems to push your problem-solving skills.",
  };

  const difficultyColors = {
    Easy: "bg-green-100 border-green-500 text-green-700 hover:bg-green-200",
    Average: "bg-yellow-100 border-yellow-500 text-yellow-700 hover:bg-yellow-200",
    Hard: "bg-red-100 border-red-500 text-red-700 hover:bg-red-200",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Difficulty Level</h1>

          <div className="grid gap-6">
            {(["Easy", "Average", "Hard"] as const).map((level) => (
              <div key={level} className="relative group">
                <Button
                  className={`w-full py-6 text-lg font-semibold rounded-xl border-2 transition-all duration-300 ${difficultyColors[level as keyof typeof difficultyColors]}`}
                  onClick={() => router("/eEvaluationPhase1")}
                >
                  {level}
                </Button>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-800 text-white text-sm rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none shadow-lg">
                  {difficultyInfo[level]}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 mt-8">
            Hover over each option to learn more about the difficulty level.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DifficultySelector;