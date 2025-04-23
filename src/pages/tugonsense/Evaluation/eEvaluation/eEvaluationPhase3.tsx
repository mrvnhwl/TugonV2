"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar"; // Import the Navbar component
import Lottie from "react-lottie"; // Import Lottie
import robotAnimation from "@/components/assets/animations/robot1.json"; // Import robot animation
import { questions } from "../questions";

export default function EvaluationPhase3() {
  const router = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
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

  // Check if questions data is available
  useEffect(() => {
    if (questions && questions.phase3 && questions.phase3.length > 0) {
      setIsLoading(false);
    }
  }, []);

  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Show loading state if questions aren't loaded yet
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

  const currentQuestion = questions.phase3[currentQuestionIndex];

  const getGeminiHint = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    setIsLoadingHint(true);
    setApiError(null);

    try {
      console.log("Sending request with:", {
        question: currentQuestion.question,
        userAnswer: inputValue.trim(),
        correctAnswer: currentQuestion.correct_answer,
      });

      const response = await fetch("http://localhost:3000/api/gemini-hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: inputValue.trim(),
          correctAnswer: currentQuestion.correct_answer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get hint");
      }

      const data = await response.json();
      setFeedback(data.hint);
    } catch (error) {
      console.error("Error getting Gemini hint:", error);
      setApiError("Failed to get AI hint. Using fallback hint.");

      // Fallback to static hints
      const feedbackOptions =
        currentQuestion.ai_feedback[inputValue.trim()] ||
        currentQuestion.ai_feedback.default ||
        ["Check your answer and try again."];
      setFeedback(getRandomFeedback(feedbackOptions));
    } finally {
      setIsLoadingHint(false);
    }
  };

  const checkAnswer = async (inputValue: string) => {
    if (!inputValue) return;

    const normalizedAnswer = inputValue.trim();
    const normalizedCorrectAnswer = currentQuestion.correct_answer.trim();

    console.log("Normalized Answer:", normalizedAnswer);
    console.log("Normalized Correct Answer:", normalizedCorrectAnswer);

    const isNumericAnswer = !isNaN(Number(normalizedAnswer));
    const isNumericCorrectAnswer = !isNaN(Number(normalizedCorrectAnswer));

    const correct =
      isNumericAnswer && isNumericCorrectAnswer
        ? parseFloat(normalizedAnswer) === parseFloat(normalizedCorrectAnswer)
        : normalizedAnswer.toLowerCase() === normalizedCorrectAnswer.toLowerCase();

    console.log("Is Correct:", correct);

    setIsCorrect(correct);
    setProgress(((currentQuestionIndex + 1) / questions.phase3.length) * 100);
    setAttempts((prev) => prev + 1);

    if (correct) {
      setFeedback("Correct! Well done.");
    } else {
      await getGeminiHint(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setAnswer(inputValue);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (inputValue.length > 0 && isCorrect === null) {
      const timeout = setTimeout(() => {
        checkAnswer(inputValue);
      }, 2000);
      typingTimeoutRef.current = timeout;
    }
  };

  const handleTryAgain = () => {
    setAnswer("");
    setIsCorrect(null);
    setFeedback(null);
    setShowExplanation(false);
    setApiError(null);
  };

  const handleNext = () => {
    router("/eEvaluationPhase4");
  };

  const getRandomFeedback = (feedbackArray: string[]) => {
    return feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
  };

  const handleSubmit = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (answer.length > 0 && isCorrect === null) {
      checkAnswer(answer);
    }
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
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-700">Instructions</h3>
              </div>
              <p className="text-sm text-purple-700">
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
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full justify-start"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Need a hint?</span>
              </Button>
            )}

            {showHint && (
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">{currentQuestion.hint}</span>
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
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  disabled={isCorrect !== null}
                  className="w-full p-4 text-lg"
                />

                <Button
                  onClick={handleSubmit}
                  disabled={isCorrect !== null}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  Submit
                </Button>

                {/* Feedback */}
                {feedback && (
                  <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50" : "bg-yellow-50"}`}>
                    <p className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>{feedback}</p>

                    {!isCorrect && (
                      <div className="mt-4 flex space-x-4">
                        <Button onClick={handleTryAgain} variant="secondary">
                          Try again
                        </Button>
                        <Button onClick={() => setShowExplanation(true)} variant="outline">
                          See answer
                        </Button>
                      </div>
                    )}
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

                {/* Next Button */}
                {(isCorrect || showExplanation) && (
                  <div className="flex justify-end">
                    <Button onClick={handleNext} className="flex items-center space-x-2">
                      <span>Next Phase</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
