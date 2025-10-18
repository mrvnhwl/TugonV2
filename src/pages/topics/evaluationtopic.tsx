// src/pages/topics/Evaluationtopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

function Evaluationtopic() {
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What does it mean to evaluate a function?",
      options: ["Find its domain", "Find its output for a given input", "Draw its graph", "Factorize it"],
      answer: 1,
    },
    {
      question: "If f(x) = x² + 3x - 4, what is f(2)?",
      options: ["4", "6", "10", "2"],
      answer: 1,
    },
    {
      question: "If f(x) = 3x + 2, what is f(4)?",
      options: ["10", "12", "14", "16"],
      answer: 2,
    },
    {
      question: "If f(x) = x² - 5x + 6, what is f(2)?",
      options: ["0", "2", "4", "6"],
      answer: 0,
    },
    {
      question: "If f(x) = 10 / x, which value of x makes the function undefined?",
      options: ["0", "1", "2", "5"],
      answer: 0,
    },
    {
      question: "If f(x) = 2x² + 3x, what is f(-2)?",
      options: ["-2", "-4", "2", "10"],
      answer: 2,
    },
    {
      question: "What is the first step when evaluating a function?",
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
      options: ["To avoid undefined values", "To ensure correct order of simplification", "To make the input equal to the output", "To eliminate fractions"],
      answer: 1,
    },
    {
      // minor wording tweak for clarity: parentheses around denominator
      question: "If f(x) = 1 / (x - 2), what happens at x = 2?",
      options: ["The output is 0", "The output is 1", "The function is undefined", "The output is infinite"],
      answer: 2,
    },
    {
      question: "If f(x) = |x-4|, what is f(1)?",
      options: ["3", "-3", "4", "5"],
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Evaluating Functions</h1>
            <p className="mt-2 text-white/90 text-lg">Substitute, simplify, and interpret outputs</p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Topic Description */}
        <section className="relative -mt-8 z-10 rounded-2xl border bg-white p-6 md:p-7" style={{ ...cardBorder, boxShadow: subtleShadow }}>
          <p className="leading-relaxed" style={{ color: color.steel }}>
            To <strong>evaluate a function</strong> means to find the output value <code>f(x)</code> for a given input <code>x</code> by substituting the
            value and simplifying the result.
          </p>
        </section>

        {/* Important Concepts */}
        <section className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="rounded-xl border bg-white p-5" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Evaluating means getting the output for a specific input.</li>
              <li>Substitute carefully and follow PEMDAS.</li>
              <li>Watch for undefined values (e.g., division by zero).</li>
              <li>Respect absolute value and piecewise conditions.</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Quick Watch-Out</h3>
            <p style={{ color: color.steel }}>Expressions like <code>1/(x-2)</code> are undefined at <code>x = 2</code>.</p>
          </div>
        </section>

        {/* Examples */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: color.deep }}>Examples</h2>

          {[
            {
              title: "Example 1: Quadratic Function",
              code: `function f(x: number): number {
  return x * x + 3 * x - 4;
}

f(2);   // 6
f(-1);  // -6
f(0);   // -4`,
            },
            {
              title: "Example 2: Rational Function",
              code: `function g(t: number): number | string {
  if (t === 1) return "undefined";
  return 5 / (t - 1);
}

g(3); // 2.5
g(1); // undefined
g(0); // -5`,
            },
            {
              title: "Example 3: Piecewise Function",
              code: `function h(x: number): number {
  if (x < 0) return -x;
  if (x >= 0 && x <= 2) return x * x;
  return 2 * x + 1;
}

h(-3);  // 3
h(1);   // 1
h(4);   // 9`,
            },
            {
              title: "Example 4: Function with Multiple Variables",
              code: `function area(length: number, width: number): number {
  return length * width;
}

area(5, 3);  // 15
area(10, 0); // 0`,
            },
          ].map((ex) => (
            <div key={ex.title} className="bg-white p-4 rounded border shadow-sm mb-4" style={{ ...cardBorder }}>
              <p className="text-sm mb-2 font-semibold" style={{ color: color.deep }}>{ex.title}</p>
              <pre className="whitespace-pre-wrap text-sm p-3 rounded border" style={{ background: `${color.mist}22`, color: color.steel, borderColor: `${color.mist}66` }}>
                {ex.code}
              </pre>
            </div>
          ))}
        </section>

        {/* Warning + Tips */}
        <div className="rounded-xl border p-4 mt-4" style={{ ...cardBorder, background: `${color.peach}22` }}>
          <p style={{ color: color.deep }}>
            ⚠️ <strong>Watch Out:</strong> Check for undefined expressions (like division by zero) or inputs outside the domain.
          </p>
        </div>

        <div className="rounded-xl border p-4 mt-4" style={{ ...cardBorder, background: `${color.teal}12` }}>
          <p className="font-semibold mb-2" style={{ color: color.deep }}>
            ✅ Tips for Evaluating Functions:
          </p>
          <ul className="list-disc list-inside" style={{ color: color.steel }}>
            <li>Substitute carefully.</li>
            <li>Follow PEMDAS.</li>
            <li>Note absolute value/piecewise rules.</li>
            <li>Show intermediate steps.</li>
          </ul>
        </div>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>Watch: How to Evaluate Functions</h3>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/HyNie_PYgsY?si=zzBg1KogJ0011Xnx"
              title="How to Evaluate Functions"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* Take Quiz */}
        <div className="text-center mt-10">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg transition focus:outline-none"
            style={{
              background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
              color: "#fff",
              boxShadow: subtleShadow,
            }}
          >
            Take Quiz
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 md:p-7 relative max-h-[90vh] overflow-y-auto" style={{ ...cardBorder, boxShadow: deepShadow }}>
              {!finished ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Evaluating Functions</h2>
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
                        onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
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
                      onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
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
                      style={{ background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`, color: "#fff", boxShadow: subtleShadow }}
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

export default Evaluationtopic;
