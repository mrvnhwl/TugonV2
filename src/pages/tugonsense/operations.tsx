// Operation.tsx
import React, { useEffect, useState } from "react";
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

function Operation() {
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
      question: "What's the weight of raven",
      explanation: `Let me break this down step by step:
  
  1. We can see that 5 squares together weigh 40 units  
  2. Since all squares are identical, each must weigh the same amount  
  3. To find the weight of one square, we divide the total weight by the number of squares:  
  
  $\\frac{40}{5} = 8$  
  
  Therefore, each square weighs 8 units.`,
      hint: "Look at the total weight and count how many squares there are. What mathematical operation would give you the weight of one square?",
      options: ["4", "8", "10", "16"],
      correct_answer: "8",
      ai_feedback: {
        "4": ["Almost there. Are you sure you divided correctly?"],
        "8": ["Excellent work! You've demonstrated a strong understanding of division and proportional reasoning."],
        "10": ["Not quite, double-check the division calculation."],
        "16": ["Hmm, looks like you missed the division step. Try again!"],
      },
    },
    {
      id: "2",
      question: "Solve for x: $3x + 5 = 20$",
      explanation: `Let's solve this equation step by step:
  
  1. Start by isolating the term with x:  
  $3x + 5 = 20$  
  Subtract 5 from both sides:  
  $3x = 15$
  
  2. Now divide both sides by 3:  
  $x = \\frac{15}{3} = 5$
  
  So, the solution is $x = 5$.`,
      hint: "Try to isolate x by removing constants first. What’s the opposite of adding 5?",
      options: ["3", "5", "7", "10"],
      correct_answer: "5",
      ai_feedback: {
        "3": ["Hmm, it seems like you might have missed the division step after isolating x."],
        "5": ["Great job! You followed the algebraic steps perfectly."],
        "7": ["Not quite. Make sure to subtract 5 first, then divide."],
        "10": ["You’re close, but don’t forget to divide after isolating x."],
      },
    },
    {
      id: "3",
      question: "What’s the area of a triangle with base 10 and height 6?",
      explanation: `We can use the triangle area formula:  
  $\\text{Area} = \\frac{1}{2} \\times \\text{base} \\times \\text{height}$  
  
  Plug in the values:  
  $\\text{Area} = \\frac{1}{2} \\times 10 \\times 6 = 30$  
  
  So, the area is 30 square units.`,
      hint: "Do you remember the formula for the area of a triangle?",
      options: ["60", "30", "16", "36"],
      correct_answer: "30",
      ai_feedback: {
        "60": ["Close, but don't forget to divide by 2 in the formula."],
        "30": ["Perfect! You applied the triangle area formula correctly."],
        "16": ["Not quite, try again using the correct formula."],
        "36": ["Oops, check the multiplication and make sure you divide by 2."],
      },
    },
    {
      id: "4",
      question: "Which of these numbers is a prime number?",
      explanation: `Prime numbers are numbers that have only two factors: 1 and themselves.  
  
  Let’s look at the options:  
  - 4: divisible by 1, 2, 4  
  - 6: divisible by 1, 2, 3, 6  
  - 9: divisible by 1, 3, 9  
  - 7: divisible by only 1 and 7  
  
  So the correct answer is 7.`,
      hint: "A prime number has only two factors: 1 and itself.",
      options: ["4", "6", "9", "7"],
      correct_answer: "7",
      ai_feedback: {
        "4": ["Not quite, 4 has divisors other than 1 and itself."],
        "6": ["Close, but 6 has more divisors than just 1 and itself."],
        "9": ["Almost there! Remember that prime numbers only have two divisors."],
        "7": ["Exactly right. Prime numbers only have two divisors, and 7 fits that definition perfectly."],
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

export default Operation;
