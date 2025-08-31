import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function RationalEquationsInequalities() {
  const [equationInput, setEquationInput] = useState(0);
  const [inequalityInput, setInequalityInput] = useState(0);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const [finished, setFinished] = useState(false);

  const solveEquation = (x: number) => {
    if (x === 0) return "No solution (undefined at x = 0)";
    return 1 / x === 2 ? "x = 0.5" : "No solution for x = " + x;
  };

  const checkInequality = (x: number) => {
    if (x === 0) return "No solution (undefined at x = 0)";
    return 1 / x > 1 ? "True" : "False";
  };

  const quizQuestions  = [
    {
      question: "What is a rational equation?",
      options: [
        "An equation involving exponents",
        "An equation containing one or more rational expressions",
        "An equation involving square roots",
        "An equation with only integers",
      ],
      answer: 1,
    },
    {
      question: "Which of the following is a rational equation?",
      options: [
        "x + 5 = 7", 
        "2/x + 3 = 5", 
        "x² + 4 = 0", 
        "√x = 3"],
      answer: 1,
    },
    {
      question: "What is the first step in solving a rational equation?",
      options: [
        "Multiply both sides by the LCD",
        "Take the square root",
        "Factor the numerator",
        "Guess the answer",
      ],
      answer: 0,
    },
    {
      question: "What value of x makes 3/x-2 undefined?",
      options: [
        "x = 3",
        "x = 2",
        "x = -2",
        "x = 0",
      ],
      answer: 1,
    },
    {
      question: "Solve 2/x = 4/6",
      options: [
        "x = 3", 
        "x = 2", 
        "x = 6",
         "x = 3/2"],
      answer: 0,
    },
    {
      question: "What is a rational inequality?",
      options: [
        "An inequality involving integers only",
        "An inequality comparing rational expressions",
        "An inequality with exponents",
        "An inequality involving square roots",
      ],
      answer: 1,
    },
    {
      question: "Which of the following is a rational inequality",
      options: [
        "x²  + 5x > 10",
        "x+2 / x-1 ≤ 0",
        "2x - 7 < 3",
        "√x  ≥ 2",
      ],
      answer: 1,
    },
    {
      question: "Solve 1/x > 0?",
      options: [
        "x > 0",
        "x < 0",
        "x ≠ 0",
        "All real numbers",
      ],
      answer: 0,
    },
    {
      question: "The solution set of x-3 / x+1 = 0 is:?",
      options: [
        "x = -1",
        "x = 3", 
        "x = 0", 
        "x = 1"],
      answer: 1,
    },
    {
      question: "If 2 / x-4 = 1, what is x?",
      options: [
        "x = 2",
        "x = 3", 
        "x = 05", 
        "x = 6"
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
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <BackButton />

        {/* ===== Rational Equations Section ===== */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Rational Equations
          </h1>

          <p className="text-gray-700">
            A <strong>rational equation</strong> is an equation that contains
            one or more rational expressions. These are solved by finding a
            common denominator, eliminating it, and solving the resulting
            equation—while keeping in mind restrictions in the domain.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">
              Important Concepts:
            </p>
            <ul className="list-disc list-inside text-blue-800">
              <li>
                Multiply through by the least common denominator (LCD) to
                eliminate fractions.
              </li>
              <li>
                Always check for extraneous solutions caused by restricted
                values.
              </li>
              <li>
                The equation is undefined if any denominator equals zero.
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              Watch: How to Solve Rational Equations
            </h3>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/1fR_9ke5-n8?si=uCCnVeIVd0vPITwk"
              title="Rational Equations Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="rounded border border-gray-300"
            ></iframe>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">
              Example: Solve 1 / x = 2
            </p>
            <label className="block text-sm text-gray-700 mb-2">
              Enter a value for x:
              <input
                type="number"
                value={equationInput}
                onChange={(e) => setEquationInput(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>
            <p className="text-sm text-gray-700">
              Result: {solveEquation(equationInput)}
            </p>
          </div>
        </section>

        {/* ===== Rational Inequalities Section ===== */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Rational Inequalities
          </h1>

          <p className="text-gray-700">
            A <strong>rational inequality</strong> compares two rational
            expressions using inequality symbols. The solution requires finding
            the critical points from the numerator and denominator and testing
            intervals to determine where the inequality holds.
          </p>

          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold mb-2">
              Important Concepts:
            </p>
            <ul className="list-disc list-inside text-blue-800">
              <li>
                Determine points where the numerator or denominator is zero.
              </li>
              <li>Divide the number line into intervals based on these points.</li>
              <li>
                Test a point from each interval to see if the inequality is
                satisfied.
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              Watch: Solving Rational Inequalities
            </h3>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/gfnVHwhEe6U?si=oaJfoZFFKhpkMXoP"
              title="Rational Inequalities Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="rounded border border-gray-300"
            ></iframe>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">
              Example: Check if 1 / x &gt; 1
            </p>
            <label className="block text-sm text-gray-700 mb-2">
              Enter a value for x:
              <input
                type="number"
                value={inequalityInput}
                onChange={(e) => setInequalityInput(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>
            <p className="text-sm text-gray-700">
              Result: {checkInequality(inequalityInput)}
            </p>
          </div>
        </section>

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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              {!finished ? (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Quiz: Rational Equations and Inequalities
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

export default RationalEquationsInequalities;
