// src/pages/topics/Compositiontopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color"; // ✅ centralized palette

function Compositiontopic() {
  const [inputValue, setInputValue] = useState(0);

  const functionG = (x: number) => x + 2; // g(x) = x + 2
  const functionF = (x: number) => 3 * x - 4; // f(x) = 3x - 4

  const compositionFG = (x: number) => functionF(functionG(x)); // f(g(x))
  const compositionGF = (x: number) => functionG(functionF(x)); // g(f(x))

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What does composition of functions mean?",
      options: [
        "Adding two functions together",
        "Applying one function to the result of another",
        "Multiplying two functions",
        "Subtracting two functions",
      ],
      answer: 1,
    },
    {
      question: "Which statement about composition is always true?",
      options: [
        "f ∘ g = g ∘ f",
        "f ∘ g is the same as f + g",
        "Evaluate the inner function first in f(g(x))",
        "g(f(x)) means apply g then f",
      ],
      answer: 2,
    },
    {
      question: "With f(x) = 2x + 1 and g(x) = x², find (f ∘ g)(2).",
      options: ["7", "9", "5", "25"],
      answer: 1,
    },
    {
      question: "Given f(x) = 3x − 4 and g(x) = x + 2, find f(g(x)).",
      options: ["3x + 2", "3x - 2", "3x + 6", "3x - 6"],
      answer: 0,
    },
    {
      question: "If f(x) = 3x - 4, g(x) = x + 2, what is g(f(x))?",
      options: ["x + 6", "3x + 2", "x - 2", "3x - 2"],
      answer: 3,
    },
    {
      question: "For f(x) = 3x - 2 and g(x) = x + 4, simplify (f ∘ g)(x).",
      options: ["3x + 10", "3x + 2", "3x - 2", "x + 4"],
      answer: 0,
    },
    {
      question:
        "If f(x) = √x - 1 and g(x) = x², what is the domain of (f ∘ g)(x) = √(x²) - 1?",
      options: ["All real numbers", "x ≤ -1", "x ≥ -1", "|x| ≥ 1"],
      answer: 3,
    },
    {
      question:
        "With f(x) = 1/(x-2) and g(x) = x + 2, which expression equals (f ∘ g)(x)?",
      options: ["1/x", "1/(x+2)", "1/(x-2)", "x"],
      answer: 0,
    },
    {
      question: "If f(x) = 2x and g(x) = x + 2, find (f ∘ g)(x).",
      options: ["2x²", "4x", "2x - 2", "2x + 4"],
      answer: 3,
    },
    {
      question: "Let h(x) = x (identity). Which statement is always true?",
      options: ["f ∘ h = f", "h ∘ f = f", "Both A and B", "Neither A nor B"],
      answer: 2,
    },
  ];

  const handleAnswer = (index: number) => {
    if (quizQuestions[currentQuestion].answer === index) {
      setScore((s) => s + 1);
    }
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion((q) => q + 1);
    } else {
      setFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
  };

  // Theming helpers (palette)
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
  const deepShadow = "0 20px 40px rgba(0,0,0,0.14)";
  const cardBorder = { borderColor: `${color.mist}66` };
  const ringFocus = `0 0 0 3px ${color.aqua}33`;
  const heroGradient = {
    background: `linear-gradient(135deg, ${color.teal} 0%, ${color.aqua} 100%)`,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <header className="relative" style={heroGradient}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton />
          <div className="mt-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Composition of Functions
            </h1>
            <p className="mt-2 text-white/90 text-lg">
              Build complex mappings from simpler ones: f(g(x)) and g(f(x))
            </p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path
            d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Overview */}
        <section
          className="rounded-2xl border bg-white p-6 md:p-7 -mt-8"
          style={{ ...cardBorder, boxShadow: subtleShadow }}
        >
          <p className="leading-relaxed" style={{ color: color.steel }}>
            The <strong>composition of functions</strong> combines two functions by
            applying one to the result of the other. For functions{" "}
            <code>f(x)</code> and <code>g(x)</code>, the expression{" "}
            <code>f(g(x))</code> means “apply <code>g</code> first, then apply{" "}
            <code>f</code> to the result.” Order matters—generally{" "}
            <code>f(g(x)) ≠ g(f(x))</code>.
          </p>
        </section>

        {/* Concepts */}
        <section className="grid md:grid-cols-3 gap-5 mt-6">
          {[
            {
              title: "Order of Operations",
              text:
                "In f(g(x)), evaluate g(x) first (inner), then apply f to that output (outer).",
            },
            {
              title: "Non-Commutative",
              text:
                "Usually f(g(x)) ≠ g(f(x)). Always check both if asked to compare.",
            },
            {
              title: "Why Compose?",
              text:
                "Composition lets you model multi-step processes with simple building blocks.",
            },
          ].map((c) => (
            <article
              key={c.title}
              className="rounded-xl border bg-white p-5"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              <h3 className="font-semibold mb-2" style={{ color: color.deep }}>
                {c.title}
              </h3>
              <p style={{ color: color.steel }}>{c.text}</p>
            </article>
          ))}
        </section>

        {/* Examples */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: color.deep }}>
            Examples
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div
              className="rounded-xl border bg-white p-5"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              <p className="font-semibold" style={{ color: color.deep }}>
                g(x) = x + 2
              </p>
              <p className="text-sm mt-1" style={{ color: color.steel }}>
                Example: g(4) = 6
              </p>
            </div>

            <div
              className="rounded-xl border bg-white p-5"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              <p className="font-semibold" style={{ color: color.deep }}>
                f(x) = 3x − 4
              </p>
              <p className="text-sm mt-1" style={{ color: color.steel }}>
                Example: f(4) = 8
              </p>
            </div>

            <div
              className="rounded-xl border bg-white p-5 md:col-span-1"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              <p className="font-semibold" style={{ color: color.deep }}>
                Composition: f(g(x))
              </p>
              <pre
                className="whitespace-pre-wrap text-sm mt-2 p-3 rounded"
                style={{
                  background: `${color.aqua}0D`,
                  color: color.steel,
                  border: `1px solid ${color.mist}66`,
                }}
              >{`f(g(x)) = 3(x + 2) − 4
         = 3x + 6 − 4
         = 3x + 2`}</pre>
            </div>

            <div
              className="rounded-xl border bg-white p-5 md:col-span-1"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              <p className="font-semibold" style={{ color: color.deep }}>
                Composition: g(f(x))
              </p>
              <pre
                className="whitespace-pre-wrap text-sm mt-2 p-3 rounded"
                style={{
                  background: `${color.aqua}0D`,
                  color: color.steel,
                  border: `1px solid ${color.mist}66`,
                }}
              >{`g(f(x)) = (3x − 4) + 2
         = 3x − 2`}</pre>
            </div>
          </div>
        </section>

        {/* Interactive Input */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold" style={{ color: color.deep }}>
            Try It Yourself
          </h2>
          <label className="block text-sm mt-2" style={{ color: color.steel }}>
            Choose an input value (x):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none"
              style={{
                border: `1px solid ${color.mist}66`,
                color: color.deep,
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {[
              {
                label: `g(${inputValue})`,
                value: functionG(inputValue),
              },
              {
                label: `f(${inputValue})`,
                value: functionF(inputValue),
              },
              {
                label: `f(g(${inputValue}))`,
                value: compositionFG(inputValue),
              },
              {
                label: `g(f(${inputValue}))`,
                value: compositionGF(inputValue),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="p-4 rounded border bg-white"
                style={{ ...cardBorder, boxShadow: subtleShadow }}
              >
                <p className="font-semibold" style={{ color: color.deep }}>
                  {row.label} ={" "}
                  <span style={{ color: color.teal }}>{row.value}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Composition of Functions
          </h3>
          <div
            className="rounded-xl border overflow-hidden bg-white"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/ZFPkQkURSxk?si=BjMaBb2DctJ3QLcU"
              title="Composition of Functions Video"
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
            onMouseDown={(e) => (e.currentTarget.style.boxShadow = "none")}
            onMouseUp={(e) => (e.currentTarget.style.boxShadow = subtleShadow)}
          >
            Take Quiz
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            <div
              className="w-full max-w-2xl rounded-2xl border bg-white p-6 md:p-7 relative max-h-[90vh] overflow-y-auto"
              style={{ ...cardBorder, boxShadow: deepShadow }}
            >
              {!finished ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>
                      Quiz: Composition of Functions
                    </h2>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: `${color.aqua}1a`,
                        color: color.teal,
                        border: `1px solid ${color.mist}66`,
                      }}
                    >
                      {currentQuestion + 1} / {quizQuestions.length}
                    </span>
                  </div>

                  <p className="mb-4" style={{ color: color.steel }}>
                    {quizQuestions[currentQuestion].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="w-full text-left px-4 py-2 rounded transition focus:outline-none"
                        style={{
                          border: `1px solid ${color.mist}66`,
                          color: color.deep,
                          background: "#fff",
                          boxShadow: subtleShadow,
                        }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = subtleShadow)}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = `${color.teal}0D`)
                        }
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
                      style={{
                        background: "#f3f4f6",
                        color: color.steel,
                        border: `1px solid ${color.mist}66`,
                      }}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      Exit Quiz
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2
                    className="text-2xl font-extrabold text-center"
                    style={{ color: color.deep }}
                  >
                    Quiz Finished!
                  </h2>
                  <p className="mt-3 text-center" style={{ color: color.steel }}>
                    You scored{" "}
                    <span style={{ color: color.teal, fontWeight: 800 }}>
                      {score}
                    </span>{" "}
                    out of {quizQuestions.length}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <button
                      onClick={restartQuiz}
                      className="px-5 py-2 rounded-lg font-semibold transition focus:outline-none"
                      style={{
                        background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                        color: "#fff",
                        boxShadow: subtleShadow,
                      }}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = subtleShadow)}
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-5 py-2 rounded-lg font-semibold transition focus:outline-none"
                      style={{
                        background: "#f3f4f6",
                        color: color.steel,
                        border: `1px solid ${color.mist}66`,
                      }}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = ringFocus)}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
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

export default Compositiontopic;
