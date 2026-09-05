// src/pages/topics/Introductiontopic.tsx
import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { evaluate } from "mathjs";
import { askTugonAI } from "../../components/FloatingAIButton";
import color from "../../styles/color"; // central palette

function Introductiontopic() {
  // For examples
  const [inputValue, setInputValue] = useState(0);
  const linearFunction = (x: number) => x + 3;
  const quadraticFunction = (x: number) => 3 * x * x - 4;
  const rationalFunction = (x: number) => {
    if (x === 0) return "undefined";
    return (1 / x).toFixed(2);
  };

  // For graph (no keyboard, no input text, fixed equation)
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  const equation = "2*x + 1"; // ✅ fixed equation (no state)

  const [aiExplanation, setAIExplanation] = useState<string>("");
  const [aiLoading, setAILoading] = useState<boolean>(false);

  const userFunction = (x: number) => {
    try {
      return evaluate(equation, { x });
    } catch {
      return null;
    }
  };

  const graphData = Array.from({ length: 100 }, (_, i) => {
    const x = i - 50;
    const y = userFunction(x);
    return { x, y };
  }).filter((point) => point.y !== null) as { x: number; y: number }[];

  const pointDataX = [{ x: inputX, y: userFunction(inputX) }];
  const pointDataY = [{ x: inputY, y: userFunction(inputY) }];

  const values = [inputX, inputY];
  const minX = Math.min(-5, ...values) - 2;
  const maxX = Math.max(5, ...values) + 2;
  const outputs = [userFunction(inputX), userFunction(inputY)].filter(
    (v) => v !== null
  ) as number[];
  const minY = Math.min(...outputs, -10) - 2;
  const maxY = Math.max(...outputs, 10) + 2;

  // AI explanation effect for the fixed equation
  useEffect(() => {
    let cancelled = false;
    const explain = async () => {
      setAILoading(true);
      setAIExplanation("");
      const prompt = `
Given the function: "${equation}", explain in one sentence whether its graph is linear, quadratic, or rational, and why. Use clear, student-friendly language.
      `;
      const response = await askTugonAI(prompt);
      if (!cancelled) {
        setAIExplanation(response);
        setAILoading(false);
      }
    };
    explain();
    return () => {
      cancelled = true;
    };
  }, [equation]);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "Which of the following best describes a function?",
      options: [
        "A rule that assigns one output to many inputs",
        "A rule that assigns each input to exactly one output",
        "A graph with more than one y-value for the same x-value",
        "A set of unrelated numbers",
      ],
      answer: 1,
    },
    {
      question: "In a function, the input is called:",
      options: ["Dependent variable", "Constant", "Independent variable", "Output"],
      answer: 2,
    },
    {
      question: "In a function, the output is called:",
      options: ["Dependent variable", "Independent variable", "Domain", "Constant"],
      answer: 0,
    },
    {
      question: "Which set of ordered pairs does represent a function?",
      options: [
        "{(1,2), (1,3), (2,4)}",
        "{(2,5), (3,6), (4,7)}",
        "{(1,4), (2,5), (2,6)}",
        "{(3,2), (3,3), (4,5)}",
      ],
      answer: 1,
    },
    {
      question: "The set of all possible inputs of a function is called:",
      options: ["Range", "Codomain", "Domain", "Output"],
      answer: 2,
    },
    {
      question: "The set of all possible outputs of a function is called:",
      options: ["Domain", "Range", "Independent variable", "Constant"],
      answer: 1,
    },
    {
      question: "Which of the following is NOT a function?",
      options: ["f(x) = x + 2", "f(x) = x²", "f(x) = ±√ x", "f(x) = 3x -1"],
      answer: 2,
    },
    {
      question: "If f(x) = 2x + 1, what is f(3)?",
      options: ["5", "6", "7", "9"],
      answer: 2,
    },
    {
      question: "Which of these is NOT a function?",
      options: ["y = x + 1", "y² = x", "y = 2x", "y = x³"],
      answer: 1,
    },
    {
      question: "Which of the following is NOT a function?",
      options: ["f(x) = x + 3", "f(x) = x²", "f(x) = √ x", "f(x) = ±x"],
      answer: 3,
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

  // Theme helpers
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
  const deepShadow = "0 20px 40px rgba(0,0,0,0.14)";
  const cardBorder = { borderColor: `${color.mist}66` };
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
              Introduction to Functions
            </h1>
            <p className="mt-2 text-white/90 text-lg">
              Inputs, outputs, domain, range, and graphs
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
          className="relative -mt-8 z-10 rounded-2xl border bg-white p-6 md:p-7"
          style={{ ...cardBorder, boxShadow: subtleShadow }}
        >
          <p className="leading-relaxed" style={{ color: color.steel }}>
            A <strong>function</strong> is a rule that maps each input to a{" "}
            <em>single</em> output. The input is the{" "}
            <strong>independent variable</strong>, and the output is the{" "}
            <strong>dependent variable</strong>. Functions model relationships
            and help us predict outcomes.
          </p>
        </section>

        {/* Important Concepts */}
        <section className="mt-6 grid md:grid-cols-2 gap-5">
          <div
            className="rounded-xl border bg-white p-5"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <h3 className="font-semibold mb-2" style={{ color: color.deep }}>
              Important Concepts
            </h3>
            <ul className="list-disc list-inside" style={{ color: color.steel }}>
              <li>Independent vs. dependent variables</li>
              <li>Vertical line test</li>
              <li>Domain: all valid inputs</li>
              <li>Range: all outputs produced</li>
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
              If any vertical line touches the graph more than once, it’s{" "}
              <em>not</em> a function.
            </p>
          </div>
        </section>

        {/* Domain and Range */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: color.deep }}>
            Domain and Range
          </h2>
          <p className="mb-4" style={{ color: color.steel }}>
            The <strong>domain</strong> is the set of inputs (x-values) where
            the function is defined. The <strong>range</strong> is the set of
            outputs (y-values) the function produces.
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Table of Values */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left rounded-md overflow-hidden">
                <thead style={{ background: `${color.mist}22`, color: color.deep }}>
                  <tr>
                    <th className="px-3 py-2 border" style={cardBorder}>
                      x
                    </th>
                    <th className="px-3 py-2 border" style={cardBorder}>
                      f(x) = x²
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
                    <tr key={x} style={{ color: color.steel }}>
                      <td className="px-3 py-2 border" style={cardBorder}>
                        {x}
                      </td>
                      <td className="px-3 py-2 border" style={cardBorder}>
                        {x * x}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact Graph */}
            <div
              className="p-3 rounded border bg-white"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart
                  data={[-3, -2, -1, 0, 1, 2, 3].map((x) => ({ x, y: x * x }))}
                >
                  <CartesianGrid stroke={`${color.mist}66`} />
                  <XAxis dataKey="x" type="number" stroke={color.steel} />
                  <YAxis stroke={color.steel} />
                  <Tooltip />
                  <Line type="monotone" dataKey="y" stroke={color.teal} dot />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Understanding Domain and Range
          </h3>
          <div
            className="rounded-xl border overflow-hidden bg-white"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/KirGQOwjBVI?si=DH84IXre2QzIDWee"
              title="Domain and Range Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* Examples */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: color.deep }}>
            Examples
          </h2>
          <label className="block text-sm mb-2" style={{ color: color.steel }}>
            Choose an input value (x):
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 rounded shadow-sm focus:outline-none"
              style={{
                border: `1px solid ${color.mist}66`,
                color: color.deep,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </label>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Linear Function: f(x) = x + 3",
                value: linearFunction(inputValue),
              },
              {
                title: "Quadratic Function: f(x) = 3x² − 4",
                value: quadraticFunction(inputValue),
              },
              {
                title: "Rational Function: f(x) = 1 / x",
                value: rationalFunction(inputValue),
              },
            ].map((c) => (
              <div
                key={c.title}
                className="p-4 rounded border bg-white"
                style={{ ...cardBorder, boxShadow: subtleShadow }}
              >
                <p className="font-semibold" style={{ color: color.deep }}>
                  {c.title}
                </p>
                <p className="mt-1" style={{ color: color.steel }}>
                  f({inputValue}) = {c.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Try Your Own Function (fixed equation shown, no input) */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold" style={{ color: color.deep }}>
            Try Your Own Function (demo)
          </h2>
          <p className="text-sm mb-2" style={{ color: color.steel }}>
            We’re currently graphing the fixed function <code>f(x) = 2x + 1</code>.
            The points below evaluate that function at your chosen X and Y.
          </p>

          {/* X and Y Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mt-2">
            <label className="text-sm" style={{ color: color.steel }}>
              Input X:
              <input
                type="number"
                value={inputX}
                onChange={(e) => setInputX(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-md text-sm shadow-sm focus:outline-none"
                style={{ border: `1px solid ${color.mist}66`, color: color.deep }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </label>
            <label className="text-sm" style={{ color: color.steel }}>
              Input Y:
              <input
                type="number"
                value={inputY}
                onChange={(e) => setInputY(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-md text-sm shadow-sm focus:outline-none"
                style={{ border: `1px solid ${color.mist}66`, color: color.deep }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </label>
          </div>

          {/* Graph */}
          <div
            className="mt-4 p-4 rounded border bg-white"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={graphData}>
                <CartesianGrid stroke={`${color.mist}66`} />
                <XAxis dataKey="x" type="number" domain={[minX, maxX]} stroke={color.steel} />
                <YAxis type="number" domain={[minY, maxY]} stroke={color.steel} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={color.teal}
                  dot={false}
                  name={`f(x) = ${equation}`}
                />
                <Scatter
                  data={pointDataX as any}
                  dataKey="y"
                  fill={color.ocean}
                  name={`Point @ X=${inputX}`}
                />
                <Scatter
                  data={pointDataY as any}
                  dataKey="y"
                  fill={color.mist}
                  name={`Point @ Y=${inputY}`}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* AI Explanation */}
        <section className="text-center mt-6">
          {aiLoading ? (
            <div
              className="mt-3 p-3 rounded border inline-block text-sm"
              style={{
                background: `${color.aqua}1a`,
                color: color.teal,
                border: `1px solid ${color.mist}66`,
                boxShadow: subtleShadow,
              }}
            >
              <strong>TugonAI:</strong> <em>Explaining...</em>
            </div>
          ) : (
            aiExplanation && (
              <div
                className="mt-3 p-3 rounded border inline-block text-sm text-left"
                style={{
                  background: `${color.aqua}1a`,
                  color: color.teal,
                  border: `1px solid ${color.mist}66`,
                  boxShadow: subtleShadow,
                }}
              >
                <strong>TugonAI:</strong> {aiExplanation}
              </div>
            )
          )}
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
                      Quiz: Introduction to Functions
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
                        onFocus={(e) =>
                          (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
                        }
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
                      style={{
                        background: "#f3f4f6",
                        color: color.steel,
                        border: `1px solid ${color.mist}66`,
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
                      }
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
                      onFocus={(e) =>
                        (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
                      }
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
                      onFocus={(e) =>
                        (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
                      }
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

export default Introductiontopic;
