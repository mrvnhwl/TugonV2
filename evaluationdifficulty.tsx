"use client"
import { Button } from "@/components/ui/button"
import Footer from "../../../components/Footer"
import { useNavigate } from "react-router-dom"

function DifficultySelector() {
  const router = useNavigate()

  const difficultyInfo = {
    Easy: "Basic problems for quick practice and confidence building.",
    Average: "Moderate problems to test understanding of core concepts.",
    Hard: "Challenging problems to push your problem-solving skills.",
  }

  const difficultyColors = {
    Easy: "bg-green-500 hover:bg-green-600 text-white",
    Average: "bg-yellow-500 hover:bg-yellow-600 text-white",
    Hard: "bg-red-500 hover:bg-red-600 text-white",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Difficulty Level</h1>

          <div className="grid gap-6">
            {(["Easy", "Average", "Hard"] as const).map((level) => (
              <div key={level} className="relative group">
                <Button
                  className={`w-full py-6 text-lg font-medium ${difficultyColors[level as keyof typeof difficultyColors]}`}
                  onClick={() => router("/eEvaluationPhase1")}
                >
                  {level}
                </Button>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-800 text-white text-sm rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                  {difficultyInfo[level]}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 mt-8">Hover over each option to learn more about the difficulty level.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DifficultySelector
