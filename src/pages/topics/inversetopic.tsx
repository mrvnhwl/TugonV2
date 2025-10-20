// src/pages/topics/Inversetopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

function Inversetopic() {
  const [inputValue, setInputValue] = useState(0);

  const originalFunction = (x: number) => 2 * x + 3; // f(x) = 2x + 3
  const inverseFunction = (y: number) => (y - 3) / 2; // f⁻¹(y) = (y - 3) / 2

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What does an inverse function do?",
      options: [
        "Repeats the original function",
        "Reverses the original function",
        "Squares the function",
        "Multiplies outputs by 2",
      ],
      answer: 1,
    },
    {
      question: "Given f(x) = 2x + 3, which is the inverse function f⁻¹(x)?",
      options: [
        "f⁻¹(x) = 2x - 3",
        "f⁻¹(x) = (x - 3) / 2",
        "f⁻¹(x) = x/2 + 3",
        "f⁻¹(x) = x² - 3",
      ],
      answer: 1,
    },
    {
      // ✅ fixed: correct inverse is x/2
      question: "Find the inverse of f(x) = 2x.",
      options: ["f⁻¹(x) = 2x", "f⁻¹(x) = x/2", "f⁻¹(x) = 2/x", "f⁻¹(x) = 1/(2x)"],
      answer: 1,
    },
    {
      question: "Which type of function (on its domain) is guaranteed to have an inverse?",
      options: ["Many-to-one functions", "One-to-one functions", "Quadratic functions", "All functions"],
      answer: 1,
    },
    {
      question: "If f(4) = 11 for f(x) = 2x + 3, what is f⁻¹(11)?",
      options: ["2", "3", "4", "5"],
      answer: 2,
    },
    {
      // y = 1/2 x + 3  →  x = 2(y - 3) → f⁻¹(x) = 2x - 6
      question: "Find the inverse of y = (1/2)x + 3.",
      options: ["f⁻¹(x) = 2x - 3", "f⁻¹(x) = 2x - 6", "f⁻¹(x) = x/2 + 3", "f⁻¹(x) = 2x + 6"],
      answer: 1,
    },
    {
      question: "Find the inverse of f(x) = x + 10.",
      options: ["f⁻¹(x) = x - 2", "f⁻¹(x) = x + 10", "f⁻¹(x) = x - 10", "f⁻¹(x) = x + 5"],
      answer: 2,
    },
    {
      // ✅ fixed: f⁻¹(x) = 1/(6 - x)
      question: "Find the inverse of f(x) = 6 - 1/x.",
      options: ["f⁻¹(x) = 1/(6 - x)", "f⁻¹(x) = 1/x - 6", "f⁻¹(x) = -1/x + 6", "f⁻¹(x) = 1/6"],
      answer: 0,
    },
    {
      question: "Find the inverse of the function f(x) = (2x+5) / (4x-1).",
      options: ["f⁻¹(x) = (x+5) / (4x+2)", "f⁻¹(x) = (x-5) / (4x-2)", "f⁻¹(x) = (x+5) / (4x-2)", "f⁻¹(x) = 5 / (4x-2)"],
      answer: 2,
    },
    {
      question: "Given f(x) = x^3 + 8, which is the inverse function f⁻¹(x)?",
      options: ["f⁻¹(x) = ∛(x - 8)", "f⁻¹(x) = ∛(x + 8)", "f⁻¹(x) = x^3 - 8", "f⁻¹(x) = 1 / (x^3 + 8)"],
      answer: 0,
    },
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

  // Theme helpers
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
  const deepShadow = "0 20px 40px rgba(0,0,0,0.14)";
  const cardBorder = { borderColor: `${color.mist}66` };
  const ringFocus = `0 0 0 3px ${color.aqua}33`;
  const heroGradient = { background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})` };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <header className="relative" style={heroGradient}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton />
          <div className="mt-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Inverse Functions</h1>
            <p className="mt-2 text-white/90 text-lg">Undoing a function: reflect across y = x</p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Overview */}
        <section className="relative -mt-8 z-10 rounded-2xl border bg-white p-6 md:p-7" style={{ ...cardBorder, boxShadow: subtleShadow }}>
          <p className="leading-relaxed" style={{ color: color.steel }}>
            An <strong>inverse function</strong> reverses the mapping of the original function. If <code>f(x)=y</code>, then{" "}
            <code>f⁻¹(y)=x</code>. Graphs of a function and its inverse are symmetric about the line <code>y = x</code>.
          </p>
        </section>

        {/* Concepts */}
        <section className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="rounded-xl border bg-white p-5" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>An inverse exists only if the function is one-to-one on its domain.</li>
              <li>Swap x and y, then solve for y to find the inverse.</li>
              <li>Composition check: <code>f(f⁻¹(x)) = x</code> and <code>f⁻¹(f(x)) = x</code>.</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Quick Tip</h3>
            <p style={{ color: color.steel }}>Restrict domains (e.g., quadratics) to make functions one-to-one and invertible.</p>
          </div>
        </section>

        {/* Example */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: color.deep }}>
            Example: f(x) = 2x + 3 and f⁻¹(y) = (y - 3) / 2
          </h2>
          <label className="block text-sm mb-2" style={{ color: color.steel }}>
            Enter an input value:
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

          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <div className="p-4 rounded border bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
              <p className="font-semibold" style={{ color: color.deep }}>Original: f(x) = 2x + 3</p>
              <p className="text-sm mt-1" style={{ color: color.steel }}>
                f({inputValue}) = {originalFunction(inputValue)}
              </p>
            </div>
            <div className="p-4 rounded border bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
              <p className="font-semibold" style={{ color: color.deep }}>Inverse: f⁻¹(y) = (y − 3) / 2</p>
              <p className="text-sm mt-1" style={{ color: color.steel }}>
                f⁻¹({originalFunction(inputValue)}) = {inverseFunction(originalFunction(inputValue))}
              </p>
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Inverse Functions Explained
          </h3>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/TN4ybFiuV3k?si=y2e-ffaS93Lafcfc"
              title="Inverse Functions Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* CTA */}
        <div className="text-center mt-10">
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
            <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 md:p-7 relative max-h-[90vh] overflow-y-auto" style={{ borderColor: `${color.mist}66`, boxShadow: deepShadow }}>
              {!finished ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Inverse Functions</h2>
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
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = subtleShadow)}
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

export default Inversetopic;
