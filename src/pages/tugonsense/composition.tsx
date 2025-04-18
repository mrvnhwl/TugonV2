import Latex from "react-latex-next";
import { useAuth } from "../../hooks/useAuth";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { DraggableAnswer } from "../../components/DraggableAnswer";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RefreshCcw, Lightbulb } from "lucide-react";

type Question = {
  id: string;
  question: string;
  explanation: string;
  hint: string;
  options: string[];
  correct_answer: string;
  ai_feedback: {
    [key: string]: string[]; // Feedback per answer
  };
};

function Composition() {
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
      question: "If $f(x) = 2x + 3$ and $g(x) = x^2$, find $(f \\circ g)(2)$.",
      explanation: `To find $(f \\circ g)(2)$, first evaluate $g(2)$:
  
  $g(2) = (2)^2 = 4$
  
  Then, substitute $g(2)$ into $f(x)$:
  
  $f(g(2)) = f(4) = 2(4) + 3 = 8 + 3 = 11$
  
  So, $(f \\circ g)(2) = 11$.`,
      hint: "Evaluate $g(2)$ first, then substitute the result into $f(x)$.",
      options: ["7", "8", "11", "12"],
      correct_answer: "11",
      ai_feedback: {
        "7": ["Not quite. Did you evaluate $g(2)$ correctly?"],
        "8": ["Close, but don't forget to apply $f(x)$ to $g(2)$. Check your addition."],
        "11": ["Great job! You correctly evaluated the composition of functions."],
        "12": ["Hmm, check your addition step again."],
      },
    },
    {
      id: "2",
      question: "If $f(x) = x + 1$ and $g(x) = 3x - 2$, find $(g \\circ f)(3)$.",
      explanation: `To find $(g \\circ f)(3)$, first evaluate $f(3)$:
  
  $f(3) = 3 + 1 = 4$
  
  Then, substitute $f(3)$ into $g(x)$:
  
  $g(f(3)) = g(4) = 3(4) - 2 = 12 - 2 = 10$
  
  So, $(g \\circ f)(3) = 10$.`,
      hint: "Evaluate $f(3)$ first, then substitute the result into $g(x)$.",
      options: ["8", "9", "10", "11"],
      correct_answer: "10",
      ai_feedback: {
        "8": ["Not quite. Did you evaluate $f(3)$ correctly?"],
        "9": ["Close, but check your subtraction step in $g(x)$. Double-check your math."],
        "10": ["Excellent! You correctly evaluated the composition of functions."],
        "11": ["Hmm, check your calculations again."],
      },
    },
    {
      id: "3",
      question: "If $f(x) = 2x$ and $g(x) = x - 3$, find $(f \\circ g)(5)$.",
      explanation: `To find $(f \\circ g)(5)$, first evaluate $g(5)$:
  
  $g(5) = 5 - 3 = 2$
  
  Then, substitute $g(5)$ into $f(x)$:
  
  $f(g(5)) = f(2) = 2(2) = 4$
  
  So, $(f \\circ g)(5) = 4$.`,
      hint: "Evaluate $g(5)$ first, then substitute the result into $f(x)$.",
      options: ["2", "4", "6", "8"],
      correct_answer: "4",
      ai_feedback: {
        "2": ["Not quite. Did you apply $f(x)$ to $g(5)$ correctly?"],
        "4": ["Great work! You correctly evaluated the composition of functions."],
        "6": ["Close, but check your multiplication step in $f(x)$. Double-check your math."],
        "8": ["Hmm, check your calculations again."],
      },
    },
    {
      id: "4",
      question: "If $f(x) = x^2$ and $g(x) = 2x + 1$, find $(f \\circ g)(-1)$.",
      explanation: `To find $(f \\circ g)(-1)$, first evaluate $g(-1)$:
  
  $g(-1) = 2(-1) + 1 = -2 + 1 = -1$
  
  Then, substitute $g(-1)$ into $f(x)$:
  
  $f(g(-1)) = f(-1) = (-1)^2 = 1$
  
  So, $(f \\circ g)(-1) = 1$.`,
      hint: "Evaluate $g(-1)$ first, then substitute the result into $f(x)$.",
      options: ["-1", "0", "1", "2"],
      correct_answer: "1",
      ai_feedback: {
        "-1": ["Not quite. Did you square $g(-1)$ correctly?"],
        "0": ["Close, but check your calculations for $g(-1)$. Double-check your math."],
        "1": ["Excellent! You correctly evaluated the composition of functions."],
        "2": ["Hmm, check your calculations again."],
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
    setAttempts(0); // Reset attempts for the next question
  }, [currentQuestionIndex]);

  const handleDragEnd = (event: { active: { id: string } }) => {
    const { active } = event;
    const answer = active.id;
    if (!selectedAnswer) {
      setDroppedAnswer(answer);
      setSelectedAnswer(answer);
      const correct = answer === questions[currentQuestionIndex].correct_answer;
      setIsCorrect(correct);
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
      if (!correct) setAttempts((prev) => prev + 1);
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
    } else {
      navigate("/dashboard"); // Navigate to the dashboard or finish page
    }
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
            key={currentQuestionIndex} // Ensure this updates when the question index changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
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

            <div
              className="mb-6 p-4 border-2 border-dashed border-gray-400 rounded-md min-h-[60px] flex items-center justify-center text-gray-600"
              aria-label="Drop area for answers"
            >
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
                <p
                  className={`font-medium ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect
                    ? questions[currentQuestionIndex].ai_feedback[selectedAnswer][0]
                    : questions[currentQuestionIndex].ai_feedback[selectedAnswer][0]}
                </p>

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

export default Composition;