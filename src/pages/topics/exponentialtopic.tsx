// src/pages/topics/Exponentialtopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

function Exponentialtopic() {
  const [inputValue, setInputValue] = useState(1);
  const exponentialFunction = (x: number) => Math.pow(2, x); // f(x) = 2^x

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is the general form of an exponential function?",
      options: ["f(x) = ax + b", "f(x) = a^x", "f(x) = x^a", "f(x) = log(x)"],
      answer: 1,
    },
    {
      question: "Which of the following is an exponential function?",
      options: ["f(x) = x^2", "f(x) = 2^x", "f(x) = log(x)", "f(x) = √x"],
      answer: 1, // ✅ corrected (was 0)
    },
    {
      question: "If f(x) = 2^x, what is f(3)?",
      options: ["6", "8", "9", "12"],
      answer: 1,
    },
    {
      question: "What is the base of the exponential function f(x) = 5^x?",
      options: ["5", "x", "f(x)", "None of the above"],
      answer: 0,
    },
    {
      question: "Evaluate f(x) = 2^x when x = -2.",
      options: ["2", "1/2", "1/4", "-4"],
      answer: 2, // ✅ corrected (1/4)
    },
    {
      question: "The domain of an exponential function f(x) = a^x (a > 0, a ≠ 1) is:",
      options: ["x > 0", "All real numbers", "x ≥ 0", "x < 0"],
      answer: 1,
    },
    {
      question: "If f(x) = 3^x, what is f(-2)?",
      options: ["1/9", "1/6", "9", "-9"],
      answer: 0,
    },
    {
      question: "The range of an exponential function f(x) = a^x (a > 0, a ≠ 1) is:",
      options: ["(-∞, ∞)", "(0, -∞)", "[0, ∞)", "(0, ∞)"],
      answer: 3,
    },
    {
      question: "If f(x) = 2^x, what happens as x → ∞?",
      options: ["f(x) → 0", "f(x) → ∞", "f(x) → -∞", "f(x) → 2"],
      answer: 1,
    },
    {
      question: "If f(x) = e^x, then f(0) = ?",
      options: ["1", "0", "e", "Undefined"],
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Exponential Functions</h1>
            <p className="mt-2 text-white/90 text-lg">Growth & decay with a variable in the exponent</p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Description */}
        <section className="rounded-2xl border bg-white p-6 md:p-7 -mt-8" style={{ ...cardBorder, boxShadow: subtleShadow }}>
          <p className="leading-relaxed" style={{ color: color.steel }}>
            An <strong>exponential function</strong> has the form <code>f(x) = a^x</code>, where the variable is in the exponent. These functions model
            growth/decay in science, finance, and engineering.
          </p>
        </section>

        {/* Important Concepts */}
        <section className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="rounded-xl border bg-white p-5" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>The base <code>a</code> must be positive and not equal to 1.</li>
              <li>If <code>a &gt; 1</code>, we have exponential growth.</li>
              <li>If <code>0 &lt; a &lt; 1</code>, we have exponential decay.</li>
              <li>As <code>x</code> increases, growth accelerates rapidly.</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Tip</h3>
            <p style={{ color: color.steel }}>
              Negative inputs flip growth to fractions: <code>2^{-2} = 1/4</code>.
            </p>
          </div>
        </section>

        {/* Example */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: color.deep }}>
            Example: Exploring f(x) = 2<sup>x</sup>
          </h2>
          <label className="block text-sm mb-2" style={{ color: color.steel }}>
            Enter a value for x:
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

          <div className="p-4 rounded border bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <p className="font-semibold" style={{ color: color.deep }}>
              Exponential Function: f(x) = 2<sup>x</sup>
            </p>
            <p className="text-sm mt-1" style={{ color: color.steel }}>
              f({inputValue}) = {exponentialFunction(inputValue)}
            </p>
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Exponential Functions Explained
          </h3>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/9tutJ5xrRwg?si=WEzcnw1kptuhCAGX"
              title="Exponential Functions Video"
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
            style={{ background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`, color: "#fff", boxShadow: subtleShadow }}
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
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Exponential Functions</h2>
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

export default Exponentialtopic;
