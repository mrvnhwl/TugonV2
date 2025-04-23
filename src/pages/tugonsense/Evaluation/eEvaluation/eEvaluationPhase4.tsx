"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar"; // Import the Navbar component
import Lottie from "react-lottie"; // Import Lottie
import robotAnimation from "@/components/assets/animations/robot1.json"; // Import robot animation
import { questions } from "../questions";

export default function EvaluationPhase4() {
  const router = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lottie options for the robot animation
  const robotOptions = {
    loop: true,
    autoplay: true,
    animationData: robotAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    if (questions && questions.phase4 && questions.phase4.length > 0) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loading questions...</h2>
          <p>Please wait while we prepare your evaluation.</p>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Evaluation Completed!</h1>
          <p className="text-gray-600 mb-8">
            Congratulations! You have successfully completed all phases of the evaluation.
          </p>
          <Button onClick={() => router("./evaluationdifficulty")} size="lg">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions.phase4[currentQuestionIndex];

  const handleTryAgain = () => {
    setAnswer("");
    setIsCorrect(null);
    setFeedback(null);
    setShowExplanation(false);
    setApiError(null);
  };

  const handleNext = () => {
    setCompleted(true);
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar /> {/* Use the Navbar component */}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instructions Column */}
          <div className="space-y-4">
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-amber-700">Instructions</h3>
              </div>
              <p className="text-sm text-amber-700">
                Type your answer in the input box and click "Submit" to check your answer.
              </p>
            </Card>

            {/* Add Robot Animation */}
            <div className="flex justify-center">
              <Lottie options={robotOptions} height={150} width={150} />
            </div>

            {!isCorrect && (
              <Button
                variant="ghost"
                onClick={handleShowHint}
                className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 w-full justify-start"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Need a hint?</span>
              </Button>
            )}

            {showHint && (
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-700">{currentQuestion.hint}</span>
                </div>
              </Card>
            )}
          </div>

          {/* Question Column */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

              {/* Answer Input */}
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      console.log("Submit answer:", answer);
                    }
                  }}
                  disabled={isCorrect !== null}
                  className="w-full p-4 text-lg"
                />

                <Button
                  onClick={() => console.log("Submit answer:", answer)}
                  disabled={isCorrect !== null}
                  className="w-full bg-amber-600 text-white hover:bg-amber-700"
                >
                  Submit
                </Button>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50" : "bg-yellow-50"}`}>
                  <p className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>{feedback}</p>
                </div>
              )}

              {/* Explanation */}
              {showExplanation && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Explanation</h3>
                  <div className="text-gray-700">
                    <p>{currentQuestion.explanation}</p>
                    <p className="mt-2 font-medium">Correct answer: {currentQuestion.correct_answer}</p>
                  </div>
                </div>
              )}

              {(isCorrect || showExplanation) && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleNext}
                    className="flex items-center space-x-2"
                  >
                    <span>Finish</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
