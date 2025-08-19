import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function RationalEquationsInequalities() {
  const [equationInput, setEquationInput] = useState(0);
  const [inequalityInput, setInequalityInput] = useState(0);

  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const solveEquation = (x: number) => {
    if (x === 0) return "No solution (undefined at x = 0)";
    return 1 / x === 2 ? "x = 0.5" : "No solution for x = " + x;
  };

  const checkInequality = (x: number) => {
    if (x === 0) return "No solution (undefined at x = 0)";
    return 1 / x > 1 ? "True" : "False";
  };

  const questions = [
    {
      question: "What is a rational equation?",
      options: [
        "An equation involving exponents",
        "An equation containing one or more rational expressions",
        "An equation involving square roots",
        "An equation with only integers",
      ],
      answer: "An equation containing one or more rational expressions",
    },
    {
      question: "Which of the following can make a rational equation undefined?",
      options: ["A zero in the numerator", "A zero in the denominator", "A negative exponent", "A fraction"],
      answer: "A zero in the denominator",
    },
    {
      question: "What is the first step in solving a rational equation?",
      options: [
        "Multiply both sides by the LCD",
        "Take the square root",
        "Factor the numerator",
        "Guess the answer",
      ],
      answer: "Multiply both sides by the LCD",
    },
    {
      question: "Why must we check for extraneous solutions in rational equations?",
      options: [
        "Because they may not satisfy the original equation",
        "Because solutions can be negative",
        "Because they involve fractions",
        "Because they are approximate",
      ],
      answer: "Because they may not satisfy the original equation",
    },
    {
      question: "Solve 1/x = 2. What is x?",
      options: ["0.5", "2", "-2", "Undefined"],
      answer: "0.5",
    },
    {
      question: "What is a rational inequality?",
      options: [
        "An inequality involving integers only",
        "An inequality comparing rational expressions",
        "An inequality with exponents",
        "An inequality involving square roots",
      ],
      answer: "An inequality comparing rational expressions",
    },
    {
      question: "How do you find the critical points for rational inequalities?",
      options: [
        "By solving where numerator and denominator equal zero",
        "By guessing values",
        "By factoring only the numerator",
        "By graphing without calculation",
      ],
      answer: "By solving where numerator and denominator equal zero",
    },
    {
      question: "When solving rational inequalities, what do you do after finding critical points?",
      options: [
        "Check each interval between the critical points",
        "Ignore negative values",
        "Square both sides",
        "Stop solving",
      ],
      answer: "Check each interval between the critical points",
    },
    {
      question: "For 1/x > 1, which values of x satisfy the inequality?",
      options: ["0 < x < 1", "x > 1", "x < 0", "x = 0"],
      answer: "0 < x < 1",
    },
    {
      question: "Why can x = 0 never be a solution in rational equations or inequalities?",
      options: [
        "Because it makes the denominator undefined",
        "Because it makes the numerator negative",
        "Because 0 cannot be tested",
        "Because fractions cannot involve 0",
      ],
      answer: "Because it makes the denominator undefined",
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

export default RationalEquationsInequalities;
