import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

function RationalEquationsInequalities() {
  const [equationInput, setEquationInput] = useState(0);
  const [inequalityInput, setInequalityInput] = useState(0);

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

  const quizQuestions = [
    { question: "What is a rational equation?", options: ["An equation involving exponents", "An equation containing one or more rational expressions", "An equation involving square roots", "An equation with only integers"], answer: 1 },
    { question: "Which of the following is a rational equation?", options: ["x + 5 = 7", "2/x + 3 = 5", "x² + 4 = 0", "√x = 3"], answer: 1 },
    { question: "What is the first step in solving a rational equation?", options: ["Multiply both sides by the LCD", "Take the square root", "Factor the numerator", "Guess the answer"], answer: 0 },
    { question: "What value of x makes 3/(x-2) undefined?", options: ["x = 3", "x = 2", "x = -2", "x = 0"], answer: 1 },
    { question: "Solve 2/x = 4/6", options: ["x = 3", "x = 2", "x = 6", "x = 3/2"], answer: 0 },
    { question: "What is a rational inequality?", options: ["An inequality involving integers only", "An inequality comparing rational expressions", "An inequality with exponents", "An inequality involving square roots"], answer: 1 },
    { question: "Which of the following is a rational inequality?", options: ["x² + 5x > 10", "(x+2)/(x-1) ≤ 0", "2x - 7 < 3", "√x ≥ 2"], answer: 1 },
    { question: "Solve 1/x > 0?", options: ["x > 0", "x < 0", "x ≠ 0", "All real numbers"], answer: 0 },
    { question: "The solution set of (x-3)/(x+1) = 0 is?", options: ["x = -1", "x = 3", "x = 0", "x = 1"], answer: 1 },
    { question: "If 2/(x-4) = 1, what is x?", options: ["x = 2", "x = 3", "x = 05", "x = 6"], answer: 3 },
  ];

  const handleAnswer = (index: number) => {
    if (quizQuestions[currentQuestion].answer === index) setScore((s) => s + 1);
    if (currentQuestion + 1 < quizQuestions.length) setCurrentQuestion((q) => q + 1);
    else setFinished(true);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
  };

  const cardBorder = { borderColor: `${color.mist}66` };
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
  const ringFocus = `0 0 0 3px ${color.aqua}33`;
  const heroGradient = { background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})` };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <header className="relative" style={heroGradient}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton />
          <div className="mt-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Rational Equations & Inequalities</h1>
            <p className="mt-2 text-white/90 text-lg">Clear steps, careful domains</p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {/* Rational Equations */}
        <section className="space-y-6">
          <div className="relative -mt-8 z-10 rounded-2xl border bg-white p-6 md:p-7" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: color.deep }}>Rational Equations</h2>
            <p style={{ color: color.steel }}>
              A <strong>rational equation</strong> contains one or more rational expressions. Multiply by the LCD to eliminate fractions,
              then solve—while respecting domain restrictions.
            </p>
          </div>

          <div className="rounded-xl border p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <p className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</p>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Multiply through by the least common denominator (LCD).</li>
              <li>Check for extraneous solutions caused by restrictions.</li>
              <li>Undefined when any denominator equals zero.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: color.deep }}>Watch: How to Solve Rational Equations</h3>
            <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
              <iframe
                width="100%"
                height="500"
                src="https://www.youtube.com/embed/1fR_9ke5-n8?si=uCCnVeIVd0vPITwk"
                title="Rational Equations Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="p-4 rounded border bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <p className="font-semibold mb-2" style={{ color: color.deep }}>Example: Solve 1 / x = 2</p>
            <label className="block text-sm mb-2" style={{ color: color.steel }}>
              Enter a value for x:
              <input
                type="number"
                value={equationInput}
                onChange={(e) => setEquationInput(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none"
                style={{ border: `1px solid ${color.mist}66`, color: color.deep }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </label>
            <p className="text-sm" style={{ color: color.steel }}>Result: {solveEquation(equationInput)}</p>
          </div>
        </section>

        {/* Rational Inequalities */}
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 md:p-7" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: color.deep }}>Rational Inequalities</h2>
            <p style={{ color: color.steel }}>
              A <strong>rational inequality</strong> compares rational expressions with inequality symbols. Find critical points from the
              numerator and denominator, split the number line, and test intervals.
            </p>
          </div>

          <div className="rounded-xl border p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <p className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</p>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Find zeros of numerator and denominator.</li>
              <li>Divide the number line into intervals.</li>
              <li>Test a point in each interval to see where the inequality holds.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: color.deep }}>Watch: Solving Rational Inequalities</h3>
            <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
              <iframe
                width="100%"
                height="500"
                src="https://www.youtube.com/embed/gfnVHwhEe6U?si=oaJfoZFFKhpkMXoP"
                title="Rational Inequalities Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="p-4 rounded border bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <p className="font-semibold mb-2" style={{ color: color.deep }}>Example: Check if 1 / x &gt; 1</p>
            <label className="block text-sm mb-2" style={{ color: color.steel }}>
              Enter a value for x:
              <input
                type="number"
                value={inequalityInput}
                onChange={(e) => setInequalityInput(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none"
                style={{ border: `1px solid ${color.mist}66`, color: color.deep }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </label>
            <p className="text-sm" style={{ color: color.steel }}>Result: {checkInequality(inequalityInput)}</p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg transition focus:outline-none mt-6"
            style={{ background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`, color: "#fff" }}
          >
            Take Quiz
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 md:p-7 relative max-h-[90vh] overflow-y-auto" style={{ borderColor: `${color.mist}66`, boxShadow: "0 20px 40px rgba(0,0,0,0.14)" }}>
              {!finished ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Rational Equations & Inequalities</h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${color.aqua}1a`, color: color.teal, border: `1px solid ${color.mist}66` }}>
                      {currentQuestion + 1} / {quizQuestions.length}
                    </span>
                  </div>

                  <p className="mb-4" style={{ color: color.steel }}>{quizQuestions[currentQuestion].question}</p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="w-full text-left px-4 py-2 rounded transition focus:outline-none"
                        style={{ border: `1px solid ${color.mist}66`, color: color.deep, background: "#fff", boxShadow: subtleShadow }}
                        onMouseOver={(e) => (e.currentTarget.style.background = `${color.teal}0D`)}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-4 py-2 rounded-lg transition focus:outline-none"
                      style={{ background: "#f3f4f6", color: color.steel, border: `1px solid ${color.mist}66` }}
                    >
                      Exit Quiz
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold text-center" style={{ color: color.deep }}>Quiz Finished!</h2>
                  <p className="mt-3 text-center" style={{ color: color.steel }}>
                    You scored <span style={{ color: color.teal, fontWeight: 800 }}>{score}</span> out of {quizQuestions.length}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <button
                      onClick={restartQuiz}
                      className="px-5 py-2 rounded-lg font-semibold transition focus:outline-none"
                      style={{ background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`, color: "#fff" }}
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-5 py-2 rounded-lg font-semibold transition focus:outline-none"
                      style={{ background: "#f3f4f6", color: color.steel, border: `1px solid ${color.mist}66` }}
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