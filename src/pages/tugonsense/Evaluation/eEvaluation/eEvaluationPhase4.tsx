"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, Loader2, XCircle} from "lucide-react";
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
import { Progress } from "@radix-ui/react-progress";

const getColorForProgress = (percent: number): string => {
  if (percent < 25) return "#333";
  if (percent < 50) return "#666";
  if (percent < 75) return "#a3d3a1";
  if (percent < 100) return "#5ec576";
  return "#2ecc71";
};

export default function EvaluationPhase4() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [characterCount, setCharacterCount] = useState(0);
  const [showQuitPopup, setShowQuitPopup] = useState(false); // State for quit confirmation popup
  const [tryAgainCount, setTryAgainCount] = useState(0); // Track "Try again" clicks

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
      "Feedback:",
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
    if (questions && questions.phase4 && questions.phase4.length > 0) {
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

  const currentQuestion = questions.phase4[currentQuestionIndex];

 
  const checkAnswer = async (inputValue: string, scenario: string) => {
    if (!inputValue) return;

    // --- Frontend Check for Completion ---
    const correctAnswer = currentQuestion.correct_answer;
    const isFrontendCorrect = inputValue.trim() === correctAnswer.trim();
    // --- End Frontend Check ---

    try {
      setIsLoadingHint(true); // Show loading indicator for API call
      setApiError(null); // Clear previous API errors
      setFeedback(null); // Clear previous feedback

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
        // Handle HTTP errors (e.g., 4xx, 5xx)
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full API Response:", data); // Log the full API response

      // --- Prioritize Frontend Correctness ---
      if (isFrontendCorrect) {
        // If the frontend comparison confirms correctness, force isCorrect to true
        console.log("Frontend determined correct. Setting isCorrect=true.");
        setIsCorrect(true);
        // Use a specific success message or the API's hint if desired
        setFeedback(data.hint || "Good Job! Your answer is correct.");
      } else {
        // If frontend didn't detect a match, trust the API response
        console.log("Frontend did not detect exact match. Trusting API.");
        const apiIsCorrect = data.isCorrect ?? false; // Default to false if undefined
        setIsCorrect(apiIsCorrect);
        setFeedback(data.hint || "No feedback provided.");
      }
      // --- End Prioritization ---

    } catch (error) {
      console.error("Error getting hint:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setApiError(`Error: ${errorMessage}`); // Set API error state
      // Optionally set feedback to show the error message directly in the feedback area
      // setFeedback(`Error getting feedback: ${errorMessage}`);
      setIsCorrect(false); // Assume incorrect on error
    } finally {
      setIsLoadingHint(false); // Hide loading indicator
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) {
      return; // Skip autochecking if handleSubmit is being processed
    }
    const inputValue = e.target.value;
    const isBackspace = (e.nativeEvent as InputEvent).inputType === "deleteContentBackward";

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
    setAnswer(inputValue);
    if (!isBackspace) {
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
    setProgress(newProgress); // Update progress state immediately

    let timeoutDuration = 2000;
    let scenario = "";

    if (newProgress == 100) {
      timeoutDuration = 2000;
      scenario = "progress_completed";
      // REMOVED: setIsCorrect(true); // Let checkAnswer handle this
    } else if (newProgress > progress) {
      timeoutDuration = 1500;
      scenario = "progress_increased";
    } else if (newProgress < progress) {
      timeoutDuration = 3000;
      scenario = "progress_decreased";
    }  else { // Covers newProgress === 0 or newProgress === progress
      scenario = "no_progress";
      timeoutDuration = 1000;
    }

    console.log("New Progress:", newProgress);
    console.log("Scenario:", scenario);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (inputValue.length > 0) {
       // Only set timeout if not already marked correct or incorrect
      if (isCorrect === null) {
          typingTimeoutRef.current = setTimeout(() => {
          if (typingTimeoutRef.current) { // Check if timeout wasn't cleared by submit
              checkAnswer(inputValue, scenario);
          }
          }, timeoutDuration);
      }
    }
  };
  
  const handleTryAgain = () => {
    setAnswer("");
    setIsCorrect(null);
    setFeedback(null);
    setShowExplanation(false);
    setApiError(null);

    setTryAgainCount((prevCount) => prevCount + 1); // Increment the "Try again" count
  };

  const handleNext = () => {
    router("../../../Dashboard");
  };
  const handleQuit = () => {
    setShowQuitPopup(true); // Show the quit confirmation popup
  };

  const confirmQuit = () => {
    setCompleted(true);
  };

  const cancelQuit = () => {
    setShowQuitPopup(false); // Close the quit confirmation popup
  };


 

  const handleSubmit = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Only submit if an answer exists AND it hasn't been marked correct/incorrect yet
    if (answer.length > 0 && isCorrect === null) {
      setCharacterCount(0);

      // Determine scenario based on CURRENT progress state when submitting
      let scenario = "manual_submit"; // Default scenario for manual submit
      if (progress === 100) {
         scenario = "progress_completed";
         // REMOVED: setIsCorrect(true); // Let checkAnswer handle this
      }
      // You might simplify this further depending on required API behavior
      // scenario = "manual_submit";

      checkAnswer(answer, scenario); // Call checkAnswer
    } else if (isCorrect === true) {
        // If already correct, maybe just navigate? Or do nothing.
        console.log("Already correct, submit button likely disabled or should navigate.");
        // handleNext(); // Example: navigate if submit is clicked when already correct
    }
  };
  return (
    <div className="relative min-h-screen bg-gray-50">
    
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-700">Substitute</h3>
              </div>
              <p className="text-sm text-green-700">
                 Given the equation f(x)=-4x-5 and your previous answer.<br />
                 Substitute the value obtain from the previous question.<br/>
              </p>
            </Card>
            <div className="flex justify-center">
              <Lottie options={robotOptions} height={150} width={150} />
            </div>
           
          </div>
          <div className="md:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                  <BlockMath math= {currentQuestion.question}/>
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
                  disabled={isCorrect === true || isLoadingHint} // Disable input if correct or loading
                  className="w-full p-4 text-lg"
                />
                <Button
                  onClick={handleSubmit}
                  // Disable submit if already marked incorrect OR if loading hint OR if already correct
                  disabled={isCorrect === false || isLoadingHint || isCorrect === true}
                  style={{
                    backgroundColor: getColorForProgress(progress),
                    transition: "background-color 0.3s ease",
                  }}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
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
                {isLoadingHint && ( // Show loading indicator whenever hint is loading
                  <div className="flex items-center justify-center p-4 rounded-lg bg-gray-50">
                    <Loader2 className="h-5 w-5 text-green-600 animate-spin mr-2" /> {/* Adjusted color if needed */}
                    <p>Getting AI hint for your answer...</p>
                  </div>
                )}
                {apiError && !isLoadingHint && ( // Show API error if present and not loading
                   <div className="p-4 rounded-lg bg-red-50 text-red-700">
                      {apiError}
                   </div>
                )}
                {feedback && !isLoadingHint && !apiError && ( // Show feedback only if available, not loading, and no API error
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
                      <BlockMath math={formatFeedback(feedback, 370)} />
                    </div>

                    {/* --- Button Logic --- */}
                    <div className="mt-4 flex space-x-4">
                      {isCorrect ? (
                        // Show "Next Phase" button if the answer is correct
                        <Button onClick={handleNext} className="flex items-center space-x-2">
                          <span>Next Phase</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        // Show "Try Again" and potentially "See Answer" if incorrect
                        <>
                          <Button onClick={handleTryAgain} variant="secondary">
                            Try again
                          </Button>
                          {/* Show "See Answer" only if incorrect AND after enough tries */}
                          {tryAgainCount >= 2 && (
                            <Button onClick={() => setShowExplanation(true)} variant="outline">
                              See answer
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    {/* --- End Button Logic --- */}

                  </div>
                )}
                 {showExplanation && ( // Explanation section remains the same
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Explanation</h3>
                      <div className="text-gray-700">
                        <p>{currentQuestion.explanation}</p>
                        <p className="mt-2 font-medium">
                          Correct answer: {currentQuestion.correct_answer}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                      <Button onClick={handleNext} className="flex items-center space-x-2">
                        <span>Next Phase</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    </div>
                  )}
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

function setCompleted(arg0: boolean) {
  throw new Error("Function not implemented.");
}

