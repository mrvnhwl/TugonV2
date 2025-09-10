// src/pages/topics/Piecewisetopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

function Piecewisetopic() {
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is a piecewise function?",
      options: [
        "A function that has only one rule for all inputs",
        "A function defined by different expressions depending on the interval of the input",
        "A graph with no domain restrictions",
        "A relation that does not pass the vertical line test",
      ],
      answer: 1,
    },
    {
      question: "Which of the following best represents a piecewise function?",
      options: [
        "f(x) = 2x + 1",
        "f(x) = |x|",
        "f(x) = { x if x < 0, x if x ≥ 0 }",
        "f(x) = { x² if x < 0, 2x + 1 if x ≥ 0 }",
      ],
      answer: 3,
    },
    {
      question: "For f(x) = { x² if x ≤ 2, 2x+1 if x > 2 }, what is f(1)?",
      options: ["1", "2", "3", "5"],
      answer: 0,
    },
    {
      question: "If f(x) = { x + 2 if x < 0, 3 if x ≥ 0 }, what is f(-5)?",
      options: ["-3", "-2", "-1", "7"],
      answer: 0,
    },
    {
      question: "If g(x) = { x² if x ≤ 2, x + 4 if x > 2 }, what is g(2)?",
      options: ["8", "6", "4", "Undefined"],
      answer: 2,
    },
    {
      // ✅ wording fixed so 0 is the undefined case
      question:
        "Which input makes h(x) = { 1/x if x > 0, 0 if x < 0 } undefined?",
      options: ["-1", "0", "1", "2"],
      answer: 1,
    },
    {
      question:
        "Determine the domain of p(x) = { 1/(x − 2) for x < 2; √(x − 2) for x ≥ 2 }.",
      options: ["All real numbers", "(-∞, 2) ∪ (2, ∞)", "(-∞, 2)", "[2, ∞)"],
      answer: 0,
    },
    {
      question:
        "If f(x) = { -x if x < 0, x if x ≥ 0 }, which familiar function is this equivalent to?",
      options: [
        "Square function",
        "Constant function",
        "Absolute value function",
        "Linear function with slope 2",
      ],
      answer: 2,
    },
    {
      question: "Which is the correct piecewise form of |x − 3|?",
      options: [
        "{ x − 3 for x ≥ 3;  3 − x for x < 3 }",
        "{ 3 − x for x ≥ 3;  x − 3 for x < 3 }",
        "{ 3 − x for all x }",
        "{ x − 3 for all x }",
      ],
      answer: 0,
    },
    {
      question:
        "Which conditions ensure a piecewise function is well-defined on its domain?",
      options: [
        "Intervals must not overlap",
        "Intervals must not leave gaps",
        "Both A and B",
        "Neither A nor B",
      ],
      answer: 2, // ✅ corrected
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
  const heroGradient = {
    background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <header className="relative" style={heroGradient}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton />
          <div className="mt-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Piecewise Functions
            </h1>
            <p className="mt-2 text-white/90 text-lg">
              Different rules on different intervals
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
        {/* Topic Description */}
        <section
          className="rounded-2xl border bg-white p-6 md:p-7 -mt-8"
          style={{ ...cardBorder, boxShadow: subtleShadow }}
        >
          <p className="leading-relaxed" style={{ color: color.steel }}>
            A <strong>piecewise function</strong> is defined by different expressions
            on different parts of its domain. Each rule applies to a specific interval.
          </p>
        </section>

        {/* Important Concepts */}
        <section className="grid md:grid-cols-2 gap-5 mt-6">
          <div
            className="rounded-xl border bg-white p-5"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>
              Important Concepts
            </h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Different formulas apply on different x-intervals.</li>
              <li>Intervals should have no gaps or overlaps.</li>
              <li>Use open/closed endpoints correctly.</li>
              <li>Check boundary behavior carefully.</li>
            </ul>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              ...cardBorder,
              background: `${color.aqua}0D`,
              boxShadow: subtleShadow,
            }}
          >
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>
              Quick Tip
            </h3>
            <p style={{ color: color.steel }}>
              Use a filled dot for “≤ / ≥” and an open dot for “&lt; / &gt;” at interval
              boundaries when graphing.
            </p>
          </div>
        </section>

        {/* Examples */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: color.deep }}>
            Examples
          </h2>

          <div className="grid gap-4">
            {/* Example 1 */}
            <div
              className="bg-white p-4 rounded border shadow-sm"
              style={{ ...cardBorder }}
            >
              <p className="text-sm mb-2 font-semibold" style={{ color: color.deep }}>
                Example 1: Absolute Value as a Piecewise Function
              </p>
              <pre
                className="whitespace-pre-wrap text-sm p-3 rounded border"
                style={{
                  background: `${color.mist}22`,
                  color: color.steel,
                  borderColor: `${color.mist}66`,
                }}
              >{`f(x) = {
  -x   if x < 0
   x   if x ≥ 0
}

function f(x: number): number {
  if (x < 0) return -x;
  return x;
}

f(-3); // 3
f(4);  // 4`}</pre>
            </div>

            {/* Example 2 */}
            <div
              className="bg-white p-4 rounded border shadow-sm"
              style={{ ...cardBorder }}
            >
              <p className="text-sm mb-2 font-semibold" style={{ color: color.deep }}>
                Example 2: Custom Piecewise Function
              </p>
              <pre
                className="whitespace-pre-wrap text-sm p-3 rounded border"
                style={{
                  background: `${color.mist}22`,
                  color: color.steel,
                  borderColor: `${color.mist}66`,
                }}
              >{`h(x) = {
  -x        if x < 0
  x²        if 0 ≤ x ≤ 2
  2x + 1    if x > 2
}

function h(x: number): number {
  if (x < 0) return -x;
  if (x <= 2) return x * x;
  return 2 * x + 1;
}

h(-3); // 3
h(1);  // 1
h(4);  // 9`}</pre>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-6">
          <div
            className="rounded-xl border p-4"
            style={{ ...cardBorder, background: `${color.teal}12` }}
          >
            <p className="font-semibold mb-2" style={{ color: color.deep }}>
              ✅ Tips for Piecewise Functions:
            </p>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Define each interval clearly without overlaps/gaps.</li>
              <li>Use open/closed circles at boundaries correctly.</li>
              <li>Validate boundary behavior with test points.</li>
              <li>Label graph segments clearly.</li>
            </ul>
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Understanding Piecewise Functions
          </h3>
          <div
            className="rounded-xl border overflow-hidden bg-white"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/OYOXMyFKotc?si=opgyf682WDfpoOrf"
              title="Piecewise Functions Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* Take Quiz Button */}
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
          <div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            <div
              className="bg-white rounded-2xl border p-6 md:p-7 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
              style={{ ...cardBorder, boxShadow: deepShadow }}
            >
              {!finished ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>
                      Quiz: Piecewise Functions
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

export default Piecewisetopic;
