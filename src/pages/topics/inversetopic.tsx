import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Inversetopic() {
  const [inputValue, setInputValue] = useState(0);

  const originalFunction = (x: number) => 2 * x + 3; // f(x) = 2x + 3
  const inverseFunction = (y: number) => (y - 3) / 2; // f⁻¹(y) = (y - 3) / 2

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What does an inverse function do?",
      options: [
        "Repeats the original function",
        "Reverses the original function",
        "Squares the function",
        "Multiplies outputs by 2",
      ],
      answer: 1,
    },
    {
      question:"Given f(x) = 2x + 3, which is the inverse function f⁻¹(x)?",
      options: [
        "f⁻¹(x) = 2x - 3", 
        "f⁻¹(x) = (x - 3) / 2", 
        "f⁻¹(x) = x/2 + 3", 
        "f⁻¹(x) = x² - 3"],
      answer: 1,
    },
    {
      question:"Find the inverse of f(x) = 2x",
      options: [
        "f⁻¹(x) = 2x - 3", 
        "f⁻¹(x) = (x - 3) / 2", 
        "f⁻¹(x) = x/2 + 3", 
        "f⁻¹(x) = 1 / 2x"],
      answer: 3,
    },
    {
      question: "Which type of function (on its domain) is guaranteed to have an inverse?",
      options: [
        "Many-to-one functions",
        "One-to-one functions",
        "Quadratic functions",
        "All functions",
      ],
      answer: 1,
    },
    {
      question: "If f(4) = 11 for f(x) = 2x + 3, what is f⁻¹(11)?",
      options: [
        "2", 
        "3",
        "4", 
        "5"],
      answer: 2,
    },
{
      question: "Find the inverse of the linear y = 1/2x + 3?",
      options: [
        "f⁻¹(x) = 2x - 3", 
        "f⁻¹(x) = 2x - 6", 
        "f⁻¹(x) = x/2 + 3", 
        "f⁻¹(x) = 2x + 6"
      ],
      answer: 1,
    },
    {
      question:"Find the inverse of f(x) = x + 10?",
      options: [
        "f⁻¹(x) = x - 2", 
        "f⁻¹(x) = x + 10", 
        "f⁻¹(x) = x - 10", 
        "f⁻¹(x) = x + 5"],
      answer: 2,
    },
    {
      question:"Find the inverse of f(x) = 6 - 1/x",
      options: [
        "f⁻¹(x) = -1/x-6", 
        "f⁻¹(x) = 1/x-6", 
        "f⁻¹(x) = -1/x+6", 
        "f⁻¹(x) = 1/6"],
      answer: 0,
    },
    {
      question: "Find the inverse of the function f(x) = 2x+5 / 4x-1",
      options: [
        "f⁻¹(x) =  x+5 / 4x+2", 
        "f⁻¹(x) =  x-5 / 4x-2", 
        "f⁻¹(x) = x+5 / 4x-2", 
        "f⁻¹(x) =  5 / 4x-2"],
      answer: 2,
    },
    {
      question: "Given f(x) = x^3 + 8, which is the inverse function f⁻¹(x)?",
      options: [
        "f⁻¹(x) = ∛(x - 8)",
        "f⁻¹(x) = ∛(x + 8)",
        "f⁻¹(x) = x^3 - 8",
        "f⁻¹(x) = 1 / (x^3 + 8)"],
      answer: 0,
    },
  ];

  const handleAnswer = (index: number) => {
    if (quizQuestions[currentQuestion].answer === index) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Inverse Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          An <strong>inverse function</strong> reverses the operation of the
          original function. If f(x) maps x to y, then the inverse function f⁻¹(y)
          maps y back to x.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>An inverse function exists only if the original function is one-to-one (bijective).</li>
            <li>The graph of a function and its inverse are symmetric about the line y = x.</li>
            <li>To find the inverse, solve the equation y = f(x) for x in terms of y.</li>
          </ul>
        </div>

        {/* Example Section */}
        <h2 className="text-xl font-semibold text-gray-800">
          Example: Exploring Inverse Functions
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Enter an input value for the original function f(x) = 2x + 3:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </label>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Original Function: f(x) = 2x + 3</p>
            <p className="text-sm text-gray-700">f({inputValue}) = {originalFunction(inputValue)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Inverse Function: f⁻¹(y) = (y - 3) / 2</p>
            <p className="text-sm text-gray-700">
              f⁻¹({originalFunction(inputValue)}) = {inverseFunction(originalFunction(inputValue))}
            </p>
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Inverse Functions Explained</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/TN4ybFiuV3k?si=y2e-ffaS93Lafcfc"
            title="Inverse Functions Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded border border-gray-300"
          ></iframe>
        </div>

        {/* Take Quiz Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Take Quiz
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              {!finished ? (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Quiz: Inverse Functions
                  </h2>
                  <p className="mb-4 text-gray-800">
                    {quizQuestions[currentQuestion].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="w-full text-left px-4 py-2 border rounded hover:bg-indigo-100 transition"
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </p>

                  <button
                    onClick={() => setShowQuiz(false)}
                    className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Exit Quiz
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">Quiz Finished!</h2>
                  <p className="mb-4 text-center text-gray-800">
                    You scored {score} out of {quizQuestions.length}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={restartQuiz}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Inversetopic;
