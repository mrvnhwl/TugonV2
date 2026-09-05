// src/pages/topics/Logarithmictopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import color from "../../styles/color";

function Logarithmictopic() {
  const [inputValue, setInputValue] = useState(1);

  // log base 2
  const logarithmicFunction = (x: number) => {
    if (x <= 0) return null;
    return Math.log2(x);
  };

  const graphData = Array.from({ length: 40 }, (_, i) => {
    const x = i / 2 + 0.1; // start > 0
    return { x, y: logarithmicFunction(x) };
  }).filter((p) => p.y !== null);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is the domain of a logarithmic function?",
      options: ["x > 0", "All real numbers", "x ≥ 0", "x ≠ 0"],
      answer: 0,
    },
    {
      question: "What is the range of a logarithmic function?",
      options: ["x > 0", "y ≥ 0", "All real numbers", "y > 0"],
      answer: 2,
    },
    {
      question: "Which of the following is a logarithmic function?",
      options: ["f(x) = 2^x", "f(x) = √x", "f(x) = x^2", "f(x) = log₂(x)"],
      answer: 3,
    },
    {
      question: "The logarithmic function is the inverse of which function?",
      options: ["Quadratic function", "Exponential function", "Linear function", "Rational function"],
      answer: 1,
    },
    {
      question: "Which of the following is equivalent to log₁₀(1000)?",
      options: ["1", "2", "3", "10"],
      answer: 2,
    },
    {
      question: "What is the domain of f(x) = log(x)?",
      options: ["x > 0", "All real numbers", "x ≥ 0", "x ≠ 0"],
      answer: 0,
    },
    {
      question: "Simplify: log₅(25)",
      options: ["1/2", "1", "3", "2"],
      answer: 3,
    },
    {
      question: "log₂(8) = ?",
      options: ["2", "3", "4", "8"],
      answer: 1,
    },
    {
      question: "If log₇(x) = 2, then x = ?",
      options: ["7", "14", "49", "9"],
      answer: 2,
    },
    {
      question: "If log₂(16) = x, then x = ?",
      options: ["2", "3", "4", "5"],
      answer: 2,
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Logarithmic Functions</h1>
            <p className="mt-2 text-white/90 text-lg">The inverse of exponential growth/decay</p>
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
            A <strong>logarithmic function</strong> is the inverse of an exponential function. In general, <code>logₐ(x)</code> answers:
            “To what power must the base <code>a</code> be raised to get <code>x</code>?”
          </p>
        </section>

        {/* Concepts */}
        <section className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="rounded-xl border bg-white p-5" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Important Concepts</h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Domain: <code>x &gt; 0</code>; Range: all real numbers.</li>
              <li>If <code>a &gt; 1</code> the log increases; if <code>0 &lt; a &lt; 1</code> it decreases.</li>
              <li><code>y = logₐ(x)</code> reflects <code>y = a^x</code> across the line <code>y = x</code>.</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5" style={{ ...cardBorder, background: `${color.aqua}0D`, boxShadow: subtleShadow }}>
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>Tip</h3>
            {/* ✅ FIXED: removed backslashes that broke JSX parsing */}
            <p style={{ color: color.steel }}>
              Change of base: <code>log_b(x) = ln(x) / ln(b)</code>.
            </p>
          </div>
        </section>

        {/* Example */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: color.deep }}>
            Example: Exploring f(x) = log₂(x)
          </h2>
          <label className="block text-sm mb-2" style={{ color: color.steel }}>
            Enter a positive value for x:
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
            <p className="font-semibold" style={{ color: color.deep }}>Logarithmic Function: f(x) = log₂(x)</p>
            <p className="text-sm mt-1" style={{ color: color.steel }}>
              f({inputValue}) = {logarithmicFunction(inputValue) !== null ? logarithmicFunction(inputValue)!.toFixed(4) : "undefined"}
            </p>
          </div>
        </section>

        {/* Graph */}
        <section className="mt-6">
          <div className="bg-white p-4 rounded border shadow-sm" style={{ ...cardBorder }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={graphData as { x: number; y: number }[]}>
                <CartesianGrid stroke={`${color.mist}66`} />
                <XAxis dataKey="x" type="number" domain={[0, "auto"]} />
                <YAxis type="number" />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke={color.teal} dot={false} name="f(x) = log₂(x)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Logarithmic Functions Explained
          </h3>
          <div className="rounded-xl border overflow-hidden bg-white" style={{ ...cardBorder, boxShadow: subtleShadow }}>
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/kqVpPSzkTYA?si=0mXoAbnD7zKSpu9u"
              title="Logarithmic Functions Video"
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
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>Quiz: Logarithmic Functions</h2>
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

export default Logarithmictopic;