import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Piecewisetopic() {
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is a piecewise function?",
      options: [
        "A function that has only one rule for all inputs",
        "A function defined by different expressions depending on the interval of the input",
        "A graph with no domain restrictions",
        "A relation that does not pass the vertical line test",
      ],
      answer: 1,
    },
    {
      question: "Which of the following best represents a piecewise function?",
      options: [
        "f(x) = 2x + 1", 
        "f(x) = |x|", 
        "f(x) = { x if x < 0, x if x ≥ 0 }", 
        "f(x) = { x² if x < 0, 2x + 1 if x ≥ 0 }"],
      answer: 3,
    },
    {
      question: "For f(x) = { x² if x ≤ 2, 2x+1 if x > 2 }, what is f(1)?",
      options: [
        "1", 
        "2", 
        "3", 
        "5"],
      answer: 0,
    },
    {
      question: "If f(x) = { x + 2 if x < 0, 3 if x ≥ 0 }, what is f(-5)?",
      options: [
        "-3", 
        "-2", 
        "-1", 
        "7"],
      answer: 0,
    },
    {
      question: "If g(x) = {x² if x ≤ 2, x + 4 if x > 2 }, what is g(2)?",
      options: [
        "8", 
        "6", 
        "4", 
        "Undefined"],
      answer: 2,
    },
    {
      question: " Which of the following inputs makes h(x) = {1 / x if x > 0, 0 if x ≤ 0 undefined} ?",
      options: [
        "-1", 
        "0", 
        "1", 
        "2"],
      answer: 1,
    },
    {
      question: "Determine the domain of p(x) = { 1/(x − 2) for x < 2;  √(x − 2) for x ≥ 2 }.",
      options: [
       "All real numbers", 
       "(-∞, 2) ∪ (2, ∞)", 
       "(-∞, 2)", 
       "[2, ∞)"],
      answer: 0,
    },
    {
      question: "If f(x) = {-x if x < 0, x if x  ≥ 0}, which familiar function is this equivalent to?",
      options: [
        "Square function",
        "Constant function",
        "Absolute value function",
        "Linear function with slope 2",
      ],
      answer: 2,
    },
    {
      question: "Which is the correct piecewise form of |x − 3|?",
      options: [
      "{ x − 3 for x ≥ 3;  3 − x for x < 3 }",
      "{ 3 − x for x ≥ 3;  x − 3 for x < 3 }",
      "{ 3 − x for all x }",
      "{ x − 3 for all x }"],
      answer: 0,
    },
    {
      question: "Which conditions ensure a piecewise function is well-defined on its domain?",
      options: [
        "Intervals must not overlap",
        "Intervals must not leave gaps",
        "Both A and B",
        "Neither A nor B",
      ],
      answer: 3,
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
          Piecewise Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>piecewise function</strong> is defined by different expressions
          depending on the domain interval. Each rule applies to a specific part of
          the input range.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>A piecewise function uses different formulas for different x-ranges.</li>
            <li>Use clear interval notation and avoid gaps or overlapping definitions.</li>
            <li>Graph with filled or open circles to indicate included or excluded endpoints.</li>
            <li>Test boundary values carefully to ensure correct behavior.</li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="grid gap-4">
          {/* Example 1 */}
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 1: Absolute Value as a Piecewise Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`f(x) = {
  -x   if x < 0
   x   if x ≥ 0
}

function f(x: number): number {
  if (x < 0) return -x;
  return x;
}

f(-3); // 3
f(4);  // 4`}
            </pre>
          </div>

          {/* Example 2 */}
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 2: Custom Piecewise Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`h(x) = {
  -x        if x < 0
  x²        if 0 ≤ x ≤ 2
  2x + 1    if x > 2
}

function h(x: number): number {
  if (x < 0) return -x;
  if (x <= 2) return x * x;
  return 2 * x + 1;
}

h(-3); // 3
h(1);  // 1
h(4);  // 9`}
            </pre>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">
            ✅ Tips for Piecewise Functions:
          </p>
          <ul className="list-disc list-inside text-green-800 space-y-1">
            <li>Clearly define each interval without overlap or gaps.</li>
            <li>Use closed/open circles when graphing boundaries correctly.</li>
            <li>Always validate behavior at boundary values.</li>
            <li>Label your graph segments clearly.</li>
          </ul>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Understanding Piecewise Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/OYOXMyFKotc?si=opgyf682WDfpoOrf"
            title="Piecewise Functions Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded border border-gray-300"
          ></iframe>
        </div>

        {/* Take Quiz Button */}
        <div className="text-center">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"
          >
            Take Quiz
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
              {!finished ? (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Quiz: Piecewise Functions
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

export default Piecewisetopic;
