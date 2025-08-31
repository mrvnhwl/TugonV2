import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Rationaltopic() {
  const [inputValue, setInputValue] = useState(0);

  const rationalFunction = (x: number) => {
    if (x === 0) return "undefined (division by zero)";
    return (1 / x).toFixed(2);
  };

  const shiftedRationalFunction = (x: number) => {
    if (x === 2) return "undefined (division by zero)";
    return (1 / (x - 2)).toFixed(2);
  };


  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "Which best defines a rational function?",
      options: [
        "Ratio of two linear equations only",
        "Ratio of two polynomial functions",
        "Any function with a square root",
        "Any function with an asymptote",
      ],
      answer: 1,
    },
    {
      question: "For f(x) = x+1 / x-3, the domain is:",
      options: [
        "ℝ", 
        "ℝ \ {-1}", 
        "ℝ \ {3}", 
        "ℝ \ {0}"],
      answer: 2, 
    },
    {
      question: "The x-intercepts of f(x) = (x-5)(x+1) / x-1 are:",
      options: [
        "x = 1 only",
        "x = -1 only",
        "x = 5 only",
        "x = -1 and x = 5",
      ],
      answer: 3,
    },
    {
      question: "The y-intercept of g(x) = 2x-6 / x+3 is:",
      options: [
        "(0,-2)", 
        "(0,2)", 
        "(0,-6)", 
        "Undefined"],
      answer: 0,
    },
    {
      question: "Which statement about m(x) = x²-1 / x²+1 is true?",
      options: [
        "Domain exclude x = ±1",
        "Has a vertical asymptotes at x = ±1", 
        "No vertical asymptotes; horizontal asymptote y = 1", 
        "No horizontal asymptote"],
      answer: 2, 
    },
    {
      question: "Which is a rational function?",
      options: [
        " x²+1 / x-3",
        "√x / x+1", 
        "sinx / x", 
        "|x| / x+1"],
      answer: 0, 
    },
    {
      question: "Which statement is true about rational function?",
      options: [
        "They are defined for all real numbers",
        "They are undefined exactly where the denominator equals zero", 
        "They never cross the axes", 
        "They always simply to polynomials"],
      answer: 1, 
    },
    {
      question: "Which description is correct for f(x) = x²-1 / x-1?",
      options: [
        "f(x) = x + 1 for all real x.",
        "f(x) = x + 1 for x ≠ 1.", 
        "f(x) = x - 1 for x ≠ 1.", 
        "f(x) is undefined for all x."],
      answer: 1, 
    },
    {
      question: "Which is NOT a rational function?",
      options: [
        "x+1 / x² + 1",
        "3 / x-4", 
        "x^π +1 / x", 
        "x^3-2 / x²-5x+6"],
      answer: 2, 
    },
    {
      question: "The y-intercept of h(x) = 4x+1 / x-2 is:",
      options: [
        "-1/2",
        "1/2", 
        "2", 
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
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <BackButton />

        {/* ===== Topic Name ===== */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Rational Functions
        </h1>

        {/* ===== Topic Description ===== */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>rational function</strong> is a ratio of two polynomial
          functions. For example,{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded">f(x) = 1 / x</code>{" "}
          or{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded">f(x) = 1 / (x - 2)</code>.
          These functions often have restrictions on their domain to avoid values
          that make the denominator zero.
        </p>

        {/* ===== Important Concepts ===== */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Rational functions are undefined where their denominator equals zero.</li>
            <li>They often have vertical and horizontal asymptotes.</li>
            <li>The graph behavior near asymptotes is key for understanding their properties.</li>
          </ul>
        </div>

        {/* ===== Examples ===== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
          <div className="bg-white p-4 rounded border border-gray-300 shadow-sm space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">f(x) = 1 / x</p>
              <p className="text-sm text-gray-700">Example: If x = 4, then f(4) = 0.25</p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">f(x) = 1 / (x - 2)</p>
              <p className="text-sm text-gray-700">Example: If x = 3, then f(3) = 1.00</p>
            </div>
          </div>
        </section>

        {/* ===== Interactive Input ===== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Try It Yourself</h2>
          <label className="block text-sm text-gray-700 mb-2">
            Choose an input value (x):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </label>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">
                Rational Function: f(x) = 1 / x
              </p>
              <p className="text-sm text-gray-700">
                f({inputValue}) = {rationalFunction(inputValue)}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold text-gray-800">
                Shifted Rational Function: f(x) = 1 / (x - 2)
              </p>
              <p className="text-sm text-gray-700">
                f({inputValue}) = {shiftedRationalFunction(inputValue)}
              </p>
            </div>
          </div>
        </section>

        {/* ===== Embedded Video ===== */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Rational Functions</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/XE-Z2-F3oWw?si=lmVcZniVQARpA4Ne"
            title="Rational Functions Video"
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
                    Quiz: Rational Functions
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

export default Rationaltopic;
