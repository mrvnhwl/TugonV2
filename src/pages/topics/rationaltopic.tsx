import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

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

  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    { question: "Which best defines a rational function?", options: ["Ratio of two linear equations only", "Ratio of two polynomial functions", "Any function with a square root", "Any function with an asymptote"], answer: 1 },
    { question: "For f(x) = (x+1)/(x-3), the domain is:", options: ["ℝ", "ℝ \\ {-1}", "ℝ \\ {3}", "ℝ \\ {0}"], answer: 2 },
    { question: "The x-intercepts of f(x) = ((x-5)(x+1))/(x-1) are:", options: ["x = 1 only", "x = -1 only", "x = 5 only", "x = -1 and x = 5"], answer: 3 },
    { question: "The y-intercept of g(x) = (2x-6)/(x+3) is:", options: ["(0,-2)", "(0,2)", "(0,-6)", "Undefined"], answer: 0 },
    { question: "Which statement about m(x) = (x²-1)/(x²+1) is true?", options: ["Domain exclude x = ±1", "Has vertical asymptotes at x = ±1", "No vertical asymptotes; horizontal asymptote y = 1", "No horizontal asymptote"], answer: 2 },
    { question: "Which is a rational function?", options: ["(x²+1)/(x-3)", "√x/(x+1)", "sin x / x", "|x|/(x+1)"], answer: 0 },
    { question: "Which statement is true about rational function?", options: ["They are defined for all real numbers", "They are undefined exactly where the denominator equals zero", "They never cross the axes", "They always simplify to polynomials"], answer: 1 },
    { question: "Which description is correct for f(x) = (x²-1)/(x-1)?", options: ["f(x) = x + 1 for all real x.", "f(x) = x + 1 for x ≠ 1.", "f(x) = x - 1 for x ≠ 1.", "f(x) is undefined for all x."], answer: 1 },
    { question: "Which is NOT a rational function?", options: ["(x+1)/(x² + 1)", "3/(x-4)", "(x^π +1)/x", "(x^3-2)/(x²-5x+6)"], answer: 2 },
    { question: "The y-intercept of h(x) = (4x+1)/(x-2) is:", options: ["-1/2", "1/2", "2", "Undefined"], answer: 0 },
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Rational Functions</h1>
            <p className="mt-2 text-white/90 text-lg">Ratios of polynomials, with domain care</p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-10">
        {/* Description */}
        <section className="rounded-2xl border bg-white p-6 md:p-7 -mt-8" style={{ ...cardBorder, boxShadow: subtleShadow }}>
          <p className="leading-relaxed" style={{ color: color.steel }}>
            A <strong>rational function</strong> is a ratio of two polynomial functions, e.g., <code>f(x) = 1/x</code> or{" "}
            <code>f(x) = 1/(x - 2)</code>. The denominator cannot be zero, which creates domain restrictions and often asymptotes.
          </p>
        </section>

        {/* Concepts */}
        <section className="rounded-xl border bg-white p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
          <p className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</p>
          <ul className="list-disc list-inside" style={{ color: color.steel }}>
            <li>Undefined where denominators equal zero.</li>
            <li>Often have vertical and horizontal asymptotes.</li>
            <li>Behavior near asymptotes is key to understanding graphs.</li>
          </ul>
        </section>

        {/* Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: color.deep }}>Examples</h2>
          <div className="bg-white p-4 rounded border" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <div className="bg-[#f8fafc] p-4 rounded border" style={{ borderColor: `${color.mist}66` }}>
              <p className="font-semibold" style={{ color: color.deep }}>f(x) = 1 / x</p>
              <p className="text-sm" style={{ color: color.steel }}>Example: If x = 4, then f(4) = 0.25</p>
            </div>
            <div className="bg-[#f8fafc] p-4 rounded border mt-4" style={{ borderColor: `${color.mist}66` }}>
              <p className="font-semibold" style={{ color: color.deep }}>f(x) = 1 / (x - 2)</p>
              <p className="text-sm" style={{ color: color.steel }}>Example: If x = 3, then f(3) = 1.00</p>
            </div>
          </div>
        </section>

        {/* Interactive */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: color.deep }}>Try It Yourself</h2>
          <label className="block text-sm" style={{ color: color.steel }}>
            Choose an input value (x):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none"
              style={{ border: `1px solid ${color.mist}66`, color: color.deep }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border" style={{ ...cardBorder, boxShadow: subtleShadow }}>
              <p className="font-semibold" style={{ color: color.deep }}>Rational Function: f(x) = 1 / x</p>
              <p className="text-sm mt-1" style={{ color: color.steel }}>
                f({inputValue}) = {rationalFunction(inputValue)}
              </p>
            </div>

            <div className="bg-white p-4 rounded border" style={{ ...cardBorder, boxShadow: subtleShadow }}>
              <p className="font-semibold" style={{ color: color.deep }}>Shifted Rational Function: f(x) = 1 / (x - 2)</p>
              <p className="text-sm mt-1" style={{ color: color.steel }}>
                f({inputValue}) = {shiftedRationalFunction(inputValue)}
              </p>
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="mt-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>Watch: Rational Functions</h3>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/XE-Z2-F3oWw?si=lmVcZniVQARpA4Ne"
              title="Rational Functions Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg transition focus:outline-none"
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
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Rational Functions</h2>
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

export default Rationaltopic;
