import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

function Operationstopic() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    { question: "If f(x) = x + 2 and g(x) = 3x, what is (f + g)(x)?", options: ["4x", "x + 5", "4x + 2", "x² + 3x"], answer: 2 },
    { question: "Which operation is undefined when g(x) = 0?", options: ["Addition", "Subtraction", "Multiplication", "Division"], answer: 3 },
    { question: "Let f(x) = x² + 3x and g(x) = 2x - 5. What is (f + g)(x) ?", options: ["x² + 5x - 5", "x² + x - 5", "x² + 3x - 5", "x² + 2x -5"], answer: 0 },
    { question: "Let f(x) = x² and g(x) = 4x + 1. What is (f - g)(2)?", options: ["-5", "5", "13", "9"], answer: 0 },
    { question: "If f(x) = x + 2 and g(x) = 3x, what is (f ÷ g)(1)?", options: ["3", "1/3", "undefined", "1"], answer: 3 },
    { question: "Let f(x) = x - 3 and g(x) = x + 3. What is (fg)(x)?", options: ["x² + 6x + 9", "x² - 9", "x² - 6x + 9", "x² + 9"], answer: 1 },
    { question: "If f(x) = 2x and g(x) = x², what is (f - g)(8)?", options: ["48", "44", "-48", "49"], answer: 2 },
    { question: "Let f(x) = x² - 1 and g(x) = x - 1. What is correct for (f/g)(x)?", options: ["x + 1, for all real x", "x + 1, for x ≠ 1", "x - 1, for x ≠ 1", "x² - 1 / x - 1 , for all real x"], answer: 1 },
    { question: "If f(x) = x + 2 and g(x) = 3x, what is (f × g)(2)?", options: ["24", "12", "18", "20"], answer: 0 },
    { question: "Let f(x) = 3x - 4 and g(x) = x + 5. What is (2f-g)(x)?", options: ["7x + 13", "5x - 13", "5x + 6", "6x - 8"], answer: 1 },
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

  // UI helpers
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Operations on Functions</h1>
            <p className="mt-2 text-white/90 text-lg">Add, subtract, multiply, and divide functions safely</p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Overview */}
        <section className="rounded-2xl border bg-white p-6 md:p-7 -mt-8" style={{ ...cardBorder, boxShadow: subtleShadow }}>
          <p className="leading-relaxed" style={{ color: color.steel }}>
            Just like numbers, functions can be added, subtracted, multiplied, and divided. These operations help build
            new models—but always watch out for division by zero and domain restrictions.
          </p>
        </section>

        {/* Concepts */}
        <section className="mt-6 grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border bg-white p-5" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li><strong>Addition:</strong> <code>(f + g)(x) = f(x) + g(x)</code></li>
              <li><strong>Subtraction:</strong> <code>(f - g)(x) = f(x) - g(x)</code></li>
              <li><strong>Multiplication:</strong> <code>(f × g)(x) = f(x) × g(x)</code></li>
              <li><strong>Division:</strong> <code>(f ÷ g)(x) = f(x) ÷ g(x)</code>, with <code>g(x) ≠ 0</code></li>
              <li>Always check for undefined cases (e.g., division by zero).</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-white p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Tips</h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Simplify each function before combining.</li>
              <li>Use parentheses generously to avoid order mistakes.</li>
              <li>Composite functions arise by nesting: <code>f(g(x))</code>.</li>
            </ul>
          </div>
        </section>

        {/* Examples */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: color.deep }}>Examples</h2>
          <div className="grid gap-4">
            {[
              {
                title: "Example 1: Function Addition",
                code: `function f(x: number): number { return x + 2; }
function g(x: number): number { return 3 * x; }
function add(x: number): number { return f(x) + g(x); }
add(2); // 4 + 6 = 10`,
              },
              {
                title: "Example 2: Function Subtraction",
                code: `function subtract(x: number): number { return f(x) - g(x); }
subtract(2); // 4 - 6 = -2`,
              },
              {
                title: "Example 3: Function Multiplication",
                code: `function multiply(x: number): number { return f(x) * g(x); }
multiply(2); // 4 * 6 = 24`,
              },
              {
                title: "Example 4: Function Division",
                code: `function divide(x: number): number | string {
  const denominator = g(x);
  if (denominator === 0) return "undefined";
  return f(x) / denominator;
}
divide(1); // 3 / 3 = 1
divide(0); // 2 / 0 = undefined`,
              },
            ].map((ex, i) => (
              <div key={i} className="bg-white p-4 rounded border" style={{ ...cardBorder, boxShadow: subtleShadow }}>
                <p className="text-sm mb-2 font-semibold" style={{ color: color.deep }}>{ex.title}</p>
                <pre className="whitespace-pre-wrap text-sm rounded p-3" style={{ background: "#f8fafc", border: `1px solid ${color.mist}66`, color: color.steel }}>
                  {ex.code}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>Watch: Operations on Functions</h3>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/3gaxVHVI4cI?si=0lhAkujS2_sB39sx"
              title="Operations on Functions Video"
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
            onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
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
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Operations on Functions</h2>
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

export default Operationstopic;
