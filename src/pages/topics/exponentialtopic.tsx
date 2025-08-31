import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Exponentialtopic() {
  const [inputValue, setInputValue] = useState(1);

  const exponentialFunction = (x: number) => Math.pow(2, x); // f(x) = 2^x

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is the general form of an exponential function?",
      options: [
        "f(x) = ax + b", 
        "f(x) = a^x",
        "f(x) = x^a", 
        "f(x) = log(x)"],
      answer: 1,
    },
    {
      question: "Which of the following is an exponential function?",
      options: [
        "f(x) = x^2", 
        "f(x) = 2^x",
        "f(x) = logx", 
        "f(x) = √x "],
      answer: 0,
    },
    {
      question: "If f(x) = 2^x, what is f(3)?",
      options: [
        "6", 
        "8", 
        "9",
        "12"],
      answer: 1,
    },
    {
      question: "What is the base of the exponential function f(x) = 5^x",
      options: [
        "5",
        "x",
        "f(x)",
        "None of the above"],
      answer: 0,
    },
    {
      question: "Evaluate f(x) = 2^x when x = -2?",
      options: [
        "2",
        "1/2",
        "1/4",
        "-4",
      ],
      answer: 1,
    },
    {
      question: "The domain of an exponential function f(x) = a^x, where a > 0 and a ≠ 1, is:",
      options: [
        "x > 0", 
        "All real numbers", 
        "x ≥ 0", 
        "x < 0"],
      answer: 1,
    },
    {
      question: "If f(x) = 3^x, what is f(-2)?",
      options: [
        "1/9", 
        "1/6", 
        "9", 
        "-9"],
      answer: 0,
    },
    {
      question: "The range of an exponential function f(x) = a^x, where a > 0 and a ≠ 1, is: ",
      options: [
        "(-∞,∞)", 
        "(0,-∞)",
         "[0,∞)", 
         "(0,∞)"],
      answer: 3,
    },
    {
      question: "If f(x) = 2^x, what happens as x → ∞?",
      options: [
        "f(x) → 0", 
        "f(x) → ∞", 
        "f(x) → -∞", 
        "f(x) → 2"],
      answer: 1,
    },
    {
      question: "If f(x) = e^x, then f(0) = ?",
      options: [
        "1", 
        "0", 
        "e",
        "Undefined"],
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
          Exponential Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          An <strong>exponential function</strong> has the form{" "}
          <code>f(x) = a^x</code>, where the variable is in the exponent. These
          functions are widely used to model growth and decay processes in
          science, finance, and engineering.
        </p>

        {/* Important Concepts */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-green-800">
            <li>
              The base <code>a</code> must be positive and not equal to 1.
            </li>
            <li>
              If <code>a &gt; 1</code>, the function represents exponential
              growth.
            </li>
            <li>
              If <code>0 &lt; a &lt; 1</code>, the function represents
              exponential decay.
            </li>
            <li>
              Exponential growth is rapid and increases without bound as x
              increases.
            </li>
          </ul>
        </div>

        {/* Example Section */}
        <h2 className="text-xl font-semibold text-gray-800">
          Example: Exploring f(x) = 2<sup>x</sup>
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Enter a value for x:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-green-200"
          />
        </label>

        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold text-gray-800">
            Exponential Function: f(x) = 2<sup>x</sup>
          </p>
          <p className="text-sm text-gray-700">
            f({inputValue}) = {exponentialFunction(inputValue)}
          </p>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Exponential Functions Explained
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/9tutJ5xrRwg?si=WEzcnw1kptuhCAGX"
            title="Exponential Functions Video"
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
                    Quiz: Exponential Functions
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
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Quiz Finished!
                  </h2>
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

export default Exponentialtopic;
