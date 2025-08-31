import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Evaluationtopic() {
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What does it mean to evaluate a function?",
      options: [
        "Find its domain",
        "Find its output for a given input",
        "Draw its graph",
        "Factorize it",
      ],
      answer: 1,
    },
    {
      question: "If f(x) = x² + 3x - 4, what is f(2)?",
      options: [
        "4", 
        "6", 
        "10", 
        "2"],
      answer: 1,
    },
    {
      question: "If f(x) = 3x + 2, what is f(4)?",
      options: [
        "10", 
        "12", 
        "14", 
        "16"],
      answer: 2,
    },
    {
      question: "If f(x) = x² - 5x + 6, what is f(2)?",
      options: [
        "0", 
        "2", 
        "4", 
        "6"],
      answer: 0,
    },
    {
      question: "If f(x) = 10 / x, which value of x makes the function undefined?",
      options: [
        "0", 
        "1", 
        "2", 
        "5"],
      answer: 0,
    },
    {
      question: "If f(x) = 2x² + 3x, what is f(-2)?",
      options: [
        "-2", 
        "-4", 
        "2", 
        "10"],
      answer: 2,
    },
    {
      question: "What is the first step when evaluating a function? ",
      options: [
        "Factor the function completely",
        "Substitute the given value of x into the function",
        "Simplify the answer first before substitution",
        "Ignore PEMDAS",
      ],
      answer: 1,
    },
    {
      question: "Why is it important to follow PEMDAS when evaluating functions?",
      options: [
        "To avoid undefined values", 
        "To ensure correct order of simplification", 
        "To make the input equal to the output", 
        "To eliminate fractions"],
      answer: 1,
    },
    {
      question: "If f(x) = 1 / x-2, what happens x = 2?",
      options: [
        "The output is 0", 
        "The output is 1", 
        "The function is undefined",
         "The output is infinite"],
      answer: 2,
    },
    {
      question: "If f(x) = |x-4|, what is f(1)?",
      options: [
        "3", 
        "-3", 
        "4", 
        "5"],
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
          Evaluating Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          To <strong>evaluate a function</strong> means to find the output value,{" "}
          <code>f(x)</code>, for a given input <code>x</code>. You substitute the
          value into the function and simplify the result.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>Evaluating a function means finding its output for a specific input.</li>
            <li>Always substitute the value of x carefully into the function.</li>
            <li>Follow the correct order of operations (PEMDAS).</li>
            <li>Be cautious of undefined values like division by zero.</li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="grid gap-4">
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 1: Quadratic Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function f(x: number): number {
  return x * x + 3 * x - 4;
}

f(2);   // 6
f(-1);  // -6
f(0);   // -4`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 2: Rational Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function g(t: number): number | string {
  if (t === 1) return "undefined";
  return 5 / (t - 1);
}

g(3); // 2.5
g(1); // undefined
g(0); // -5`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 3: Piecewise Function
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function h(x: number): number {
  if (x < 0) return -x;
  if (x >= 0 && x <= 2) return x * x;
  return 2 * x + 1;
}

h(-3);  // 3
h(1);   // 1
h(4);   // 9`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Example 4: Function with Multiple Variables
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded border border-gray-300">
{`function area(length: number, width: number): number {
  return length * width;
}

area(5, 3);  // 15
area(10, 0); // 0`}
            </pre>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-300 shadow-sm">
          <p className="text-yellow-800">
            ⚠️ <strong>Watch Out:</strong> Always check for undefined values such
            as division by zero or values outside of the function's domain.
          </p>
        </div>

        {/* Tips Box */}
        <div className="bg-green-50 p-4 rounded border border-green-300 shadow-sm">
          <p className="text-green-800 font-semibold mb-2">
            ✅ Tips for Evaluating Functions:
          </p>
          <ul className="list-disc list-inside text-green-800 space-y-1">
            <li>Substitute the input value carefully into the function.</li>
            <li>Follow the correct order of operations (PEMDAS).</li>
            <li>Look out for special rules like absolute value or piecewise conditions.</li>
            <li>Label your intermediate steps for clarity.</li>
          </ul>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: How to Evaluate Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/HyNie_PYgsY?si=zzBg1KogJ0011Xnx"
            title="YouTube video player"
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

export default Evaluationtopic;
