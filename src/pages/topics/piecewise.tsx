import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Piecewisetopic() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      question: "What is a piecewise function?",
      options: [
        "A function that uses only one formula for all inputs",
        "A function defined by different formulas over different intervals",
        "A function that only works for negative numbers",
        "A function that cannot be graphed",
      ],
      answer: "A function defined by different formulas over different intervals",
    },
    {
      question: "Which of the following is the piecewise definition of |x|?",
      options: ["f(x) = x", "f(x) = -x", "f(x) = { -x if x < 0, x if x ≥ 0 }", "f(x) = x²"],
      answer: "f(x) = { -x if x < 0, x if x ≥ 0 }",
    },
    {
      question: "For f(x) = { x² if x ≤ 2, 2x+1 if x > 2 }, what is f(1)?",
      options: ["1", "2", "3", "5"],
      answer: "1",
    },
    {
      question: "For f(x) = { x² if x ≤ 2, 2x+1 if x > 2 }, what is f(3)?",
      options: ["5", "6", "7", "9"],
      answer: "7",
    },
    {
      question: "Which line reflects the symmetry of a function and its inverse?",
      options: ["y = 0", "y = x", "x = 0", "y = -x"],
      answer: "y = x",
    },
    {
      question: "What symbol is typically used to indicate whether an endpoint is included in an interval?",
      options: ["Parentheses ( )", "Brackets [ ]", "Curly braces { }", "Absolute value bars | |"],
      answer: "Brackets [ ]",
    },
    {
      question: "In graphing piecewise functions, what does an open circle represent?",
      options: [
        "The point is included in the function",
        "The point is not included in the function",
        "The graph continues infinitely",
        "The graph has no value there",
      ],
      answer: "The point is not included in the function",
    },
    {
      question: "Which of these is a piecewise definition for the floor function ⌊x⌋?",
      options: [
        "f(x) = x",
        "f(x) = the greatest integer less than or equal to x",
        "f(x) = x + 1",
        "f(x) = -x",
      ],
      answer: "f(x) = the greatest integer less than or equal to x",
    },
    {
      question: "If f(x) = { -x if x < 0, x if x ≥ 0 }, what is f(-4)?",
      options: ["-4", "0", "4", "Undefined"],
      answer: "4",
    },
    {
      question: "Which of the following is important when defining piecewise functions?",
      options: [
        "Intervals must not overlap",
        "Intervals must not leave gaps",
        "Both A and B",
        "Neither A nor B",
      ],
      answer: "Both A and B",
    },
  ];

  const handleAnswer = () => {
    if (selectedAnswer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
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
  x^2       if 0 ≤ x ≤ 2
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
                  <h2 className="text-xl font-bold mb-4">
                    Question {currentQuestion + 1} of {questions.length}
                  </h2>
                  <p className="mb-4">{questions[currentQuestion].question}</p>
                  <div className="space-y-2">
                    {questions[currentQuestion].options.map((option, idx) => (
                      <label key={idx} className="block">
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={selectedAnswer === option}
                          onChange={() => setSelectedAnswer(option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleAnswer}
                    disabled={!selectedAnswer}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    {currentQuestion + 1 === questions.length ? "Finish Quiz" : "Next"}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
                  <p className="mb-4">
                    Your score: {score} / {questions.length}
                  </p>
                  <button
                    onClick={() => {
                      setShowQuiz(false);
                      setCurrentQuestion(0);
                      setScore(0);
                      setFinished(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Close
                  </button>
                </div>
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
