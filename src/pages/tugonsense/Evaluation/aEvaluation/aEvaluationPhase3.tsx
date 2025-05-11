"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Lottie from "react-lottie";
import robotAnimation from "@/components/assets/animations/robot1.json";
import { questions } from "../questions";
import "../../../../index.css";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const getColorForProgress = (percent: number): string => {
  if (percent < 25) return "#333";
  if (percent < 50) return "#666";
  if (percent < 75) return "#a3d3a1";
  if (percent < 100) return "#5ec576";
  return "#2ecc71";
};

export default function AEvaluationPhase3() {
  const router = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
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
  const [characterCount, setCharacterCount] = useState(0); // Added characterCount state
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const [tryAgainCount, setTryAgainCount] = useState(0); 
  const robotOptions = {
    loop: true,
    autoplay: true,
    animationData: robotAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const formatFeedback = (text: string, maxWidth: number): string => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return text;

    context.font = "15px Arial";

    const formattedLines: string[] = [];
    let currentLine = "";

    text.split(" ").forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = context.measureText(testLine).width;

      if (testWidth > maxWidth) {
        formattedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      formattedLines.push(currentLine);
    }

    // Keywords that should trigger a line break before them and be bold
    const keywords = [
      "Hint:",
      "Example:",
      "Remember",
      "Similar example:",
      "Note:",
      "Tip:",
      "Important:",
      "Caution:",
      "Warning:",
      "Key point:",
      "Did you know:",
      "Pro tip:",
      "Explanation:",
      "Observation:",
      "Suggestion:",
      "Recommendation:",
    ];

    const finalLines: string[] = [];

    formattedLines.forEach((line) => {
      // Create a regex that matches any of the keywords, case-insensitively
      const pattern = new RegExp(`(${keywords.join("|")})`, "gi");

      // Split the line and preserve the keyword part
      const parts = line.split(pattern).filter(Boolean);

      parts.forEach((part) => {
        const trimmed = part.trim();

        // Check if the part matches any keyword (case-insensitively)
        if (keywords.some((kw) => trimmed.toLowerCase() === kw.toLowerCase())) {
          finalLines.push(`\\\\[8pt] \\textbf{${trimmed}}`);
        } else {
          finalLines.push(`\\text{${trimmed}}`);
        }
      });
    });

    return `\\begin{array}{l}${finalLines.join(" \\\\ ")}\\end{array}`;
  };
  
  useEffect(() => {
    if (questions && questions.phase3 && questions.phase3.length > 0) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const progressBar = document.querySelector(".progress-bar") as HTMLElement;
    if (progressBar) {
      progressBar.style.backgroundColor = getColorForProgress(progress);
    }
  }, [progress]);

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
      setApiError("Failed to get AI hint. Using fallback hint.");
      const feedbackOptions =
        currentQuestion.ai_feedback[inputValue.trim()] ||
        currentQuestion.ai_feedback.default ||
        ["Check your answer and try again."];
      setFeedback(getRandomFeedback(feedbackOptions));
    } finally {
      setIsLoadingHint(false);
    }
  };

  const checkAnswer = async (inputValue: string, scenario: string) => {
    if (!inputValue) return;

    try {
      const response = await fetch("http://localhost:3000/api/gemini-hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: inputValue.trim(),
          correctAnswer: currentQuestion.correct_answer,
          scenario,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get hint");
      }

      const data = await response.json();
      setFeedback(data.hint);
    } catch (error) {
      console.error("Error getting hint:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Filter input to count only alphanumeric characters (letters and numbers)
    const alphanumericCount = inputValue.replace(/[^a-zA-Z0-9]/g, "").length;

    // Stop input and trigger "character_limit" scenario if alphanumeric count reaches 20
    if (alphanumericCount >= 20) {
      console.log("Alphanumeric character limit of 20 reached. Triggering 'character_limit' scenario.");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); // Clear any existing timeout
      checkAnswer(inputValue, "character_limit"); // Trigger the "character_limit" scenario
      setIsCorrect(false); // Prevent further typing
      return; // Prevent further input
    }

    // Update the answer and character count only if the input is not caused by backspace
    if ((e.nativeEvent as InputEvent).inputType !== "deleteContentBackward") {
      setAnswer(inputValue);
      setCharacterCount(alphanumericCount); // Update character count with alphanumeric count
      console.log("Alphanumeric characters typed so far:", alphanumericCount); // Log character count
    }

    const correctAnswer = currentQuestion.correct_answer;
    const maxLength = Math.max(inputValue.length, correctAnswer.length);
    let matchedCharacters = 0;

    for (let i = 0; i < inputValue.length; i++) {
      if (inputValue[i] === correctAnswer[i]) {
        matchedCharacters++;
      }
    }

    const newProgress = Math.min((matchedCharacters / maxLength) * 100, 100);
    console.log("Progress:", newProgress, "%");
    let timeoutDuration = 2000;
    let scenario = "";

    if (newProgress > progress) {
      timeoutDuration = 1500;
      scenario = "progress_increased";
    } else if (newProgress < progress) {
      timeoutDuration = 3000;
      scenario = "progress_decreased";
    } else if (newProgress === progress && newProgress < 100) {
      timeoutDuration = 2000;
      scenario = "no_progress";
    }

    setProgress(newProgress);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); // Clear any existing timeout

    // Set a timeout to trigger progress-related scenarios
    if (inputValue.length > 0 && isCorrect === null) {
      typingTimeoutRef.current = setTimeout(() => {
        checkAnswer(inputValue, scenario);
      }, timeoutDuration);
    }
  };


  const handleTryAgain = () => {
    setAnswer("");
    setIsCorrect(null);
    setFeedback(null);
    setShowExplanation(false);
    setCharacterCount(0); // Reset character count

    setTryAgainCount((prevCount) => prevCount + 1); // Increment the "Try again" count
  };


  const handleNext = () => {
    router("/aEvaluationPhase4");
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
      setCharacterCount(0); // Reset character count
      checkAnswer(answer, "manual_submit");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-700">Transform</h3>
              </div>
              <p className="text-sm text-purple-700">
               Given the function, transform the substituted form into the simplified form.
              </p>
            </Card>
            <div className="flex justify-center">
              <Lottie options={robotOptions} height={150} width={150} />
            </div>
           
          </div>
          <div className="md:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                <BlockMath math={currentQuestion.question} />
              </h2>
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
                  disabled={isCorrect !== null || isLoadingHint}
                  className="w-full p-4 text-lg"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isCorrect !== null || isLoadingHint}
                  style={{
                    backgroundColor: getColorForProgress(progress),
                    transition: "background-color 0.3s ease",
                  }}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  {isLoadingHint ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting AI Hint...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                {isLoadingHint && !isCorrect && (
                  <div className="flex items-center justify-center p-4 rounded-lg bg-gray-50">
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin mr-2" />
                    <p>Getting AI hint for your answer...</p>
                  </div>
                )}
                {feedback && !isLoadingHint && (
                  <div
                    className={`p-6 rounded-lg ${
                      isCorrect ? "bg-green-50" : "bg-yellow-50"
                    } feedback-container`}
                  >
                    <div
                      style={{ textAlign: "left" }}
                      className={`font-medium ${
                        isCorrect ? "text-green-700" : "text-amber-700"
                      } break-words`}
                    >
                      <BlockMath math={formatFeedback(feedback, 400)} />
                    </div>
                    {!isCorrect && (
                      <div className="mt-4 flex space-x-4">
                        <Button onClick={handleTryAgain} variant="secondary">
                          Try again
                        </Button>
                       {!isCorrect && tryAgainCount >= 2 &&(
                                               <Button onClick={() => setShowExplanation(true)} variant="outline">
                                                 See answer
                                               </Button>
                                               )}
                      </div>
                    )}
                  </div>
                )}
                {showExplanation && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Explanation</h3>
                    <div className="text-gray-700">
                      <p>{currentQuestion.explanation}</p>
                      <p className="mt-2 font-medium">
                        Correct answer: {currentQuestion.correct_answer}
                      </p>
                    </div>
                  </div>
                )}
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
