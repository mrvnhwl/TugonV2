import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { questions } from "../questions";

export default function EvaluationPhase2() {
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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if questions data is available
  useEffect(() => {
    if (questions && questions.phase2 && questions.phase2.length > 0) {
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

  const currentQuestion = questions.phase2[currentQuestionIndex];

  const checkAnswer = (inputValue: string) => {
    if (!inputValue) return;

    // Normalize input and correct answer
    const normalizedAnswer = inputValue.trim(); // Remove leading/trailing spaces
    const normalizedCorrectAnswer = currentQuestion.correct_answer.trim();

    console.log("Normalized Answer:", normalizedAnswer);
    console.log("Normalized Correct Answer:", normalizedCorrectAnswer);

    // Compare as numbers if both are numeric
    const isNumericAnswer = !isNaN(Number(normalizedAnswer));
    const isNumericCorrectAnswer = !isNaN(Number(normalizedCorrectAnswer));

    const correct =
      isNumericAnswer && isNumericCorrectAnswer
        ? parseFloat(normalizedAnswer) === parseFloat(normalizedCorrectAnswer) // Use parseFloat for numeric comparison
        : normalizedAnswer.toLowerCase() === normalizedCorrectAnswer.toLowerCase(); // Fallback to case-insensitive string comparison

    console.log("Is Correct:", correct);

    setIsCorrect(correct);
    setProgress(((currentQuestionIndex + 1) / questions.phase2.length) * 100);
    setAttempts((prev) => prev + 1);

    if (correct) {
      setFeedback("Correct! Well done.");
    } else {
      // Safely access feedback with fallbacks
      const feedbackOptions =
        currentQuestion.ai_feedback[normalizedAnswer] ||
        currentQuestion.ai_feedback.default ||
        ["Check your answer and try again."];

      setFeedback(getRandomFeedback(feedbackOptions));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setAnswer(inputValue);

    // Clear any existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set a new timeout to check the answer after 2 seconds of inactivity
    if (inputValue.length > 0 && isCorrect === null) {
      const timeout = setTimeout(() => {
        checkAnswer(inputValue); // Pass the current input value
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
    // Always navigate to Phase 3 after answering a question
    router("/eEvaluationPhase3");
  };

  const getRandomFeedback = (feedbackArray: string[]) => {
    return feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
  };

  const handleSubmit = () => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Check the answer immediately
    if (answer.length > 0 && isCorrect === null) {
      checkAnswer(answer);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instructions Column */}
        <div className="space-y-4">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-700">Instructions</h3>
            </div>
            <p className="text-sm text-green-700">
              Type your answer in the input box and click "Submit" to check your answer.
            </p>
          </Card>

          {/* Hint Button */}
          {!isCorrect && (
            <Button
              variant="ghost"
              onClick={handleShowHint}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50 w-full justify-start"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Need a hint?</span>
            </Button>
          )}

          {/* Hint Display */}
          {showHint && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {currentQuestion.hint}
                </span>
              </div>
            </Card>
          )}
        </div>

        {/* Question Column */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {currentQuestion.question}
            </h2>

            {/* Answer Input */}
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={answer}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(); // Trigger the submit function when Enter is pressed
                  }
                }}
                disabled={isCorrect !== null}
                className="w-full p-4 text-lg"
              />

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isCorrect !== null}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Submit
              </Button>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect ? "bg-green-50" : "bg-yellow-50"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {feedback}
                  </p>

                  {!isCorrect && (
                    <div className="mt-4 flex space-x-4">
                      <Button onClick={handleTryAgain} variant="secondary">
                        Try again
                      </Button>
                      <Button
                        onClick={() => setShowExplanation(true)}
                        variant="outline"
                      >
                        See answer
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {showExplanation && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Explanation
                  </h3>
                  <div className="text-gray-700">
                    <p>{currentQuestion.explanation}</p>
                    <p className="mt-2 font-medium">
                      Correct answer: {currentQuestion.correct_answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Button */}
              {(isCorrect || showExplanation) && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleNext}
                    className="flex items-center space-x-2"
                  >
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
  );
}
