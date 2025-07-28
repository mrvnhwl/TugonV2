import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { questions } from "../questions";
import useSound from "use-sound";
import correctSound from "@/components/assets/sound/correct.mp3";
import wrongSound from "@/components/assets/sound/wrong.mp3";
import dragSound from "@/components/assets/sound/drag.mp3";
import Lottie from "react-lottie";
import robotAnimation from "@/components/assets/animations/robot1.json";

export default function EvaluationPhase1() {
  const router = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuitPopup, setShowQuitPopup] = useState(false); // State for quit confirmation popup

  const [playCorrect] = useSound(correctSound);
  const [playWrong] = useSound(wrongSound);
  const [playDrag] = useSound(dragSound);

  const robotOptions = {
    loop: true,
    autoplay: true,
    animationData: robotAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    if (questions && questions.phase1 && questions.phase1.length > 0) {
      setIsLoading(false);
    }
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

  const currentQuestion = questions.phase1[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct_answer;
    setIsCorrect(correct);

    if (correct) {
      playCorrect();
      setProgress(((currentQuestionIndex + 1) / questions.phase1.length) * 100);
    } else {
      playWrong();
    }

    setAttempts((prev) => prev + 1);
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setAttempts((prev) => prev + 1);
  };

  const handleNext = () => {
    router("/eEvaluationPhase2");
  };

  const handleQuit = () => {
    setShowQuitPopup(true); // Show the quit confirmation popup
  };

  const confirmQuit = () => {
    router("/tugonsense"); // Navigate back to TugonSense
  };

  const cancelQuit = () => {
    setShowQuitPopup(false); // Close the quit confirmation popup
  };

  const handleShowHint = () => {
    setShowHint(true);
    playDrag();
  };

  const getRandomFeedback = (feedbackArray: string[]) => {
    return feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <Progress value={progress} className="h-2 flex-grow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instructions Column */}
          <div className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-700">Instructions</h3>
              </div>
              <p className="text-sm text-blue-700">
                Read the question carefully and select the correct answer from the options provided.
              </p>
            </Card>

            {/* Robot Animation */}
            <div className="flex justify-center">
              <Lottie options={robotOptions} height={150} width={150} />
            </div>

            {!selectedAnswer && (
              <Button
                variant="ghost"
                onClick={handleShowHint}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full justify-start"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Need a hint?</span>
              </Button>
            )}

            {showHint && !selectedAnswer && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{currentQuestion.hint}</span>
                </div>
              </Card>
            )}
          </div>

          {/* Question Column */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAnswer === option
                        ? isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>

              {/* Feedback */}
              {selectedAnswer && (
                <div className={`mt-6 p-4 rounded-lg ${isCorrect ? "bg-green-50" : "bg-yellow-50"}`}>
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <p className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                      {getRandomFeedback(currentQuestion.ai_feedback[selectedAnswer] || ["Check your answer."])}
                    </p>
                  </div>

                  {!isCorrect && attempts < 3 && (
                    <div className="mt-4 flex space-x-4">
                      <Button onClick={handleTryAgain} variant="secondary" className="flex items-center space-x-2">
                        <span>Try again</span>
                      </Button>
                      <Button onClick={() => setShowExplanation(true)} variant="outline">
                        See answer
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {(showExplanation || (attempts >= 3 && !isCorrect)) && (
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Explanation</h3>
                  <div className="text-gray-700">{currentQuestion.explanation}</div>
                </div>
              )}

              {/* Next Button */}
              {(isCorrect || showExplanation || attempts >= 3) && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleNext} className="flex items-center space-x-2">
                    <span>Next Phase</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
