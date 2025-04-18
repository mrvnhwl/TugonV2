// Operation.tsx
import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { Brain, Lightbulb, ArrowRight, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Latex from "react-latex-next";
import { useAuth } from "../../hooks/useAuth";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { DraggableAnswer } from "../../components/DraggableAnswer";


type Question = {
  id: string;
  question: string;
  explanation: string;
  hint: string;
  image_url?: string;
  options: string[];
  correct_answer: string;
  ai_feedback: {
    [key: string]: string[]; // Feedback per answer
  };
};

function Evaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [droppedAnswer, setDroppedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);


  const questions: Question[] = [
    {
      id: "1",
      question: "Evaluate $f(x) = 2x^2 + 3$ when $x = 4$",
      explanation: `To evaluate $f(x) = 2x + 3$ when $x = 4$, substitute $4$ for $x$:
  
  $f(4) = 2(4) + 3 = 8 + 3 = 11$
  
  So, $f(4) = 11$.`,
      hint: "Substitute the value of x into the function and simplify.",
      options: ["7", "8", "11", "12"],
      correct_answer: "11",
      ai_feedback: {
        "7": ["Not quite. Did you multiply $2x$ correctly?"],
        "8": ["Close, but don't forget to add the constant $3$."],
        "11": ["Great job! You evaluated the function correctly."],
        "12": ["Hmm, check your addition step again."],
      },
    },
    {
      id: "2",
      question: "If $g(x) = x^2 - 5x + 6$, what is $g(2)$?",
      explanation: `To evaluate $g(x) = x^2 - 5x + 6$ when $x = 2$, substitute $2$ for $x$:
  
  $g(2) = (2)^2 - 5(2) + 6 = 4 - 10 + 6 = 0$
  
  So, $g(2) = 0$.`,
      hint: "Substitute $x = 2$ into the function and simplify step by step.",
      options: ["0", "2", "-2", "6"],
      correct_answer: "0",
      ai_feedback: {
        "0": ["Excellent! You evaluated the function correctly."],
        "2": ["Not quite. Did you simplify all terms correctly?"],
        "-2": ["Hmm, check your subtraction step again."],
        "6": ["Close, but double-check your calculations."],
      },
    },
    {
      id: "3",
      question: "Find $h(3)$ if $h(x) = 3x^2 - 4x + 1$.",
      explanation: `To evaluate $h(x) = 3x^2 - 4x + 1$ when $x = 3$, substitute $3$ for $x$:
  
  $h(3) = 3(3)^2 - 4(3) + 1 = 3(9) - 12 + 1 = 27 - 12 + 1 = 16$
  
  So, $h(3) = 16$.`,
      hint: "Substitute $x = 3$ into the function and simplify step by step.",
      options: ["10", "16", "18", "20"],
      correct_answer: "16",
      ai_feedback: {
        "10": ["Not quite. Did you calculate $3x^2$ correctly?"],
        "16": ["Great work! You evaluated the function correctly."],
        "18": ["Close, but check your subtraction step."],
        "20": ["Hmm, double-check your calculations."],
      },
    },
    {
      id: "4",
      question: "Evaluate $k(x) = \\frac{x + 2}{x - 1}$ when $x = 3$.",
      explanation: `To evaluate $k(x) = \\frac{x + 2}{x - 1}$ when $x = 3$, substitute $3$ for $x$:
  
  $k(3) = \\frac{3 + 2}{3 - 1} = \\frac{5}{2}$
  
  So, $k(3) = \\frac{5}{2}$.`,
      hint: "Substitute $x = 3$ into the function and simplify the fraction.",
      options: ["2", "2.5", "3", "5"],
      correct_answer: "2.5",
      ai_feedback: {
        "2": ["Not quite. Did you simplify the fraction correctly?"],
        "2.5": ["Excellent! You evaluated the function correctly."],
        "3": ["Close, but check your division step."],
        "5": ["Hmm, double-check your calculations."],
      },
    },
  ];

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const currentOptions = [...questions[currentQuestionIndex].options];
    setShuffledOptions(currentOptions.sort(() => Math.random() - 0.5));
    setDroppedAnswer(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setShowHint(false);
  }, [currentQuestionIndex]);

 
  const handleDragEnd = (event: any) => {
    const { active } = event;
    const answer = active.id as string;
    if (!selectedAnswer) {
      setDroppedAnswer(answer);
      setSelectedAnswer(answer);
      const correct = answer === questions[currentQuestionIndex].correct_answer;
      setIsCorrect(correct);
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
      setAttempts((prev) => prev + 1);
    }
  };

  const handleTryAgain = () => {
    setDroppedAnswer(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false); // Ensure explanation is hidden
    setAttempts((prev) => prev + 1); // Increment attempts
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1); // Move to the next question
      setDroppedAnswer(null); // Reset dropped answer
      setSelectedAnswer(null); // Reset selected answer
      setIsCorrect(null); // Reset correctness state
      setShowExplanation(false); // Hide explanation
      setShowHint(false); // Hide hint
      setAttempts(0); // Reset attempts for the next question
    } else {
      navigate("/dashboard"); // Navigate to the dashboard or finish page
    }
  };

  const getRandomFeedback = (feedbackArray: string[]) => {
    return feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="relative h-1 w-full bg-gray-200 rounded-full mb-8">
        <motion.div
          className="absolute h-full bg-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <div className="flex items-center space-x-3 mb-6 p-4 bg-indigo-50 rounded-lg">
              <Brain className="h-6 w-6 text-indigo-600" />
              <div className="text-sm text-indigo-700">
                Think deeply and drag the correct answer.
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-6">
              <Latex>{questions[currentQuestionIndex].question}</Latex>
            </h2>

            {!selectedAnswer && (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center space-x-2 mb-6 text-indigo-600 hover:text-indigo-700"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Need a hint?</span>
              </button>
            )}

            {showHint && !selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-50 rounded-lg text-blue-700"
              >
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>{questions[currentQuestionIndex].hint}</span>
                </div>
              </motion.div>
            )}

            <div className="mb-6 p-4 border-2 border-dashed border-gray-400 rounded-md min-h-[60px] flex items-center justify-center text-gray-600">
              {droppedAnswer ? (
                <div className="text-lg font-semibold text-gray-800">{droppedAnswer}</div>
              ) : (
                <span>Drag your answer here</span>
              )}
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={shuffledOptions} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {shuffledOptions.map((option) => (
                    <DraggableAnswer key={option} id={option} answer={option} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  isCorrect ? "bg-green-50" : "bg-yellow-50"
                } mb-6`}
              >
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  <p
                    className={`font-medium ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {getRandomFeedback(questions[currentQuestionIndex].ai_feedback[selectedAnswer!])}
                  </p>
                </div>

                {!isCorrect && attempts < 3 && (
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={handleTryAgain}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span>Try again</span>
                    </button>
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      See explanation
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {(showExplanation || (attempts >= 3 && !isCorrect)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gray-50 rounded-lg p-6 mb-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">
                  Let me explain this concept
                </h3>
                <div className="prose">
                  <Latex>{questions[currentQuestionIndex].explanation}</Latex>
                </div>
              </motion.div>
            )}

            {(isCorrect || showExplanation || attempts >= 3) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <span>
                    {currentQuestionIndex === questions.length - 1 ? "Finish" : "Continue"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Evaluation;
