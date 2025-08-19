import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Operationstopic() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "If f(x) = x + 2 and g(x) = 3x, what is (f + g)(x)?",
      options: ["4x", "x + 5", "4x + 2", "x^2 + 3x"],
      answer: 2,
    },
    {
      question: "Which operation is undefined when g(x) = 0?",
      options: ["Addition", "Subtraction", "Multiplication", "Division"],
      answer: 3,
    },
    {
      question: "If f(x) = x + 2 and g(x) = 3x, what is (f - g)(2)?",
      options: ["-2", "2", "4", "10"],
      answer: 0,
    },
    {
      question: "What is the general form of (f × g)(x)?",
      options: ["f(x) + g(x)", "f(x) - g(x)", "f(x) × g(x)", "f(x) ÷ g(x)"],
      answer: 2,
    },
    {
      question: "If f(x) = x + 2 and g(x) = 3x, what is (f ÷ g)(1)?",
      options: ["1", "3", "1/3", "undefined"],
      answer: 0,
    },
    {
      question: "What must be checked before dividing functions?",
      options: [
        "Whether f(x) = 0",
        "Whether g(x) = 0",
        "Whether x > 0",
        "Whether x < 0",
      ],
      answer: 1,
    },
    {
      question: "If f(x) = 2x and g(x) = x^2, what is (f + g)(3)?",
      options: ["9", "15", "18", "21"],
      answer: 3,
    },
    {
      question: "Which of the following is true about function operations?",
      options: [
        "Addition of functions is always defined.",
        "Division by zero is allowed.",
        "Multiplication of functions is undefined.",
        "You cannot subtract functions.",
      ],
      answer: 0,
    },
    {
      question: "If f(x) = x + 2 and g(x) = 3x, what is (f × g)(2)?",
      options: ["12", "24", "18", "20"],
      answer: 1,
    },
    {
      question: "If f(x) = x + 2 and g(x) = 3x, simplify (f + g)(x).",
      options: ["x + 3x", "4x + 2", "x^2 + 3x", "3x + 2"],
      answer: 1,
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
          Operations on Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          Just like numbers, functions can be added, subtracted, multiplied, and
          divided. These operations allow us to build new functions from existing
          ones and are especially useful when modeling complex situations.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              <strong>Addition:</strong> <code>(f + g)(x) = f(x) + g(x)</code>
            </li>
            <li>
              <strong>Subtraction:</strong> <code>(f - g)(x) = f(x) - g(x)</code>
            </li>
            <li>
              <strong>Multiplication:</strong> <code>(f × g)(x) = f(x) × g(x)</code>
            </li>
            <li>
              <strong>Division:</strong> <code>(f ÷ g)(x) = f(x) ÷ g(x)</code>,
              where <code>g(x) ≠ 0</code>
            </li>
            <li>Always check for undefined cases like division by zero.</li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="grid gap-4">
          {/* same examples as before */}
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 1: Function Addition
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function f(x: number): number {
  return x + 2;
}

function g(x: number): number {
  return 3 * x;
}

function add(x: number): number {
  return f(x) + g(x);
}

add(2); // 4 + 6 = 10`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 2: Function Subtraction
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function subtract(x: number): number {
  return f(x) - g(x);
}

subtract(2); // 4 - 6 = -2`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 3: Function Multiplication
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function multiply(x: number): number {
  return f(x) * g(x);
}

multiply(2); // 4 * 6 = 24`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 4: Function Division
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function divide(x: number): number | string {
  const denominator = g(x);
  if (denominator === 0) return "undefined";
  return f(x) / denominator;
}

divide(1); // 3 / 3 = 1
divide(0); // 2 / 0 = undefined`}
            </pre>
          </div>
        </div>

        {/* Tips Box */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">✅ Key Tips:</p>
          <ul className="list-disc list-inside text-green-800 space-y-1">
            <li>Simplify each function before combining results.</li>
            <li>Check for division by zero before dividing.</li>
            <li>Use parentheses to keep operations clear.</li>
            <li>Composite functions can be created by nesting: f(g(x)).</li>
          </ul>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Operations on Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/3gaxVHVI4cI?si=0lhAkujS2_sB39sx"
            title="Operations on Functions Video"
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
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
                    Quiz: Operations on Functions
                  </h2>
                  <p className="mb-4 text-gray-800">
                    {quizQuestions[currentQuestion].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="w-full text-left px-4 py-2 border rounded hover:bg-blue-100 transition"
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
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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

export default Operationstopic;
