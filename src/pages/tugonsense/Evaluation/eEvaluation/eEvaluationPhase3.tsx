"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, XCircle } from "lucide-react"; // Added XCircle for Quit button
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  const [showQuitPopup, setShowQuitPopup] = useState(false); // State for quit confirmation popup
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

  const handleQuit = () => {
    setShowQuitPopup(true); // Show the quit confirmation popup
  };

  const confirmQuit = () => {
    router("/tugonsense"); // Navigate back to TugonSense
  };

  const cancelQuit = () => {
    setShowQuitPopup(false); // Close the quit confirmation popup
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
  };

  const handleNext = () => {
    router("/eEvaluationPhase4");
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
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
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quit Quiz Button */}
      <div className="absolute bottom-4 left-4">
        <Button
          variant="outline"
          onClick={handleQuit}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 border border-red-600 px-4 py-2 text-lg"
        >
          <XCircle className="h-6 w-6" />
          <span>Quit Quiz</span>
        </Button>
      </div>

      {/* Quit Confirmation Popup */}
      {showQuitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md w-full">
            <div className="flex justify-center mb-6">
              <Lottie options={robotOptions} height={120} width={120} />
            </div>
            <h3 className="text-xl font-semibold text-center mb-6">Are you sure you want to quit?</h3>
            <div className="flex justify-between">
              <Button onClick={confirmQuit} className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 text-lg">
                Quit
              </Button>
              <Button onClick={cancelQuit} variant="outline" className="px-6 py-2 text-lg">
                Continue
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
