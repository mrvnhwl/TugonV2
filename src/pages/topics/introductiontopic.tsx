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

function Introductiontopic() {
  // For examples
  const [inputValue, setInputValue] = useState(0);
  const linearFunction = (x: number) => x + 3;
  const quadraticFunction = (x: number) => 3 * x * x - 4;
  const rationalFunction = (x: number) => {
    if (x === 0) return "undefined";
    return (1 / x).toFixed(2);
  };

  // For graph
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  const [equation, setEquation] = useState("2*x + 1");
  const [error, setError] = useState("");
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
  }).filter((point) => point.y !== null);

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

  // AI explanation effect
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
    if (equation.trim()) {
      explain();
    } else {
      setAIExplanation("");
      setAILoading(false);
    }
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
      question: "What is the independent variable in a function?",
      options: ["Output", "Input", "Graph", "Equation"],
      answer: 1,
    },
    {
      question: "Which function is quadratic?",
      options: ["f(x) = 2x + 3", "f(x) = x² - 4", "f(x) = 1/x", "f(x) = 5"],
      answer: 1,
    },
    {
      question: "What test determines if a graph is a function?",
      options: [
        "Horizontal line test",
        "Slope test",
        "Vertical line test",
        "Domain test",
      ],
      answer: 2,
    },
    {
      question: "What is the domain of f(x) = 1/x?",
      options: ["All real numbers", "x ≠ 0", "x > 0", "x < 0"],
      answer: 1,
    },
    {
      question: "Which is the range of f(x) = x²?",
      options: ["All real numbers", "y ≥ 0", "y ≤ 0", "y ≠ 0"],
      answer: 1,
    },
    {
      question: "f(x) = 2x + 1 is what type of function?",
      options: ["Linear", "Quadratic", "Rational", "Constant"],
      answer: 0,
    },
    {
      question: "What is f(2) for f(x) = 3x² - 4?",
      options: ["8", "12", "6", "5"],
      answer: 1,
    },
    {
      question: "What happens if the denominator of a rational function is 0?",
      options: ["Value is 0", "Undefined", "Infinity", "Negative"],
      answer: 1,
    },
    {
      question: "Which of these is NOT a function?",
      options: ["y = x + 1", "y² = x", "y = 2x", "y = x³"],
      answer: 1,
    },
    {
      question: "What is the dependent variable in f(x)?",
      options: ["x", "f(x)", "Equation", "Graph"],
      answer: 1,
    },
  ];

  const handleAnswer = (index: number) => {
    if (quizQuestions[currentQuestion].answer === index) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <BackButton />

        {/* Topic Name */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Introduction to Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>function</strong> is a rule that maps a number to another unique number.
          The input to the function is called the independent variable, and the output
          is called the dependent variable. Functions are a foundational concept in
          mathematics, allowing us to describe relationships and predict outcomes.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>The input is called the independent variable, and the output is the dependent variable.</li>
            <li>The graph of a function passes the vertical line test.</li>
            <li>Domain: set of all possible inputs.</li>
            <li>Range: set of all possible outputs.</li>
          </ul>
        </div>

        {/* Domain and Range Section */}
        <h2 className="text-xl font-semibold text-gray-800 mt-6">Domain and Range</h2>
        <p className="text-gray-700 mb-4">
          The <strong>domain</strong> of a function is the set of all possible input values (x-values) 
          for which the function is defined. The <strong>range</strong> is the set of all possible 
          output values (y-values) produced by the function.
        </p>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Table of Values */}
          <div className="overflow-x-auto">
            <table className="border border-gray-300 w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2">x</th>
                  <th className="border border-gray-300 px-3 py-2">f(x) = x²</th>
                </tr>
              </thead>
              <tbody>
                {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
                  <tr key={x}>
                    <td className="border border-gray-300 px-3 py-2">{x}</td>
                    <td className="border border-gray-300 px-3 py-2">{x * x}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Compact Graph */}
          <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={[-3, -2, -1, 0, 1, 2, 3].map((x) => ({ x, y: x * x }))}>
                <CartesianGrid stroke="#ddd" />
                <XAxis dataKey="x" type="number" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke="#16a34a" dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Understanding Domain and Range</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/KirGQOwjBVI?si=DH84IXre2QzIDWee"
            title="Domain and Range Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded border border-gray-300"
          ></iframe>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <label className="block text-sm text-gray-700 mb-2">
          Choose an input value (x):
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none"
          />
        </label>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded border border-gray-300 shadow-sm">
            <p className="font-semibold">Linear Function: f(x) = x + 3</p>
            <p>f({inputValue}) = {linearFunction(inputValue)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded border border-gray-300 shadow-sm">
            <p className="font-semibold">Quadratic Function: f(x) = 3x² - 4</p>
            <p>f({inputValue}) = {quadraticFunction(inputValue)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded border border-gray-300 shadow-sm">
            <p className="font-semibold">Rational Function: f(x) = 1 / x</p>
            <p>f({inputValue}) = {rationalFunction(inputValue)}</p>
          </div>
        </div>

        {/* Interactive Graph Section */}
        <h2 className="text-xl font-semibold text-gray-800">Try Your Own Function</h2>
        <p className="text-sm text-gray-700 mb-2">
          Enter any function of <code>x</code> (e.g., <code>2*x+1</code>,{" "}
          <code>x^2 - 4*x + 3</code>, <code>1/(x-2)</code>).
        </p>

        {/* Function Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label className="text-sm text-gray-700">Function:</label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 shadow-sm"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        {/* X and Y Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <label className="text-sm text-gray-700">
            Input X:
            <input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(Number(e.target.value))}
              className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm"
            />
          </label>
          <label className="text-sm text-gray-700">
            Input Y:
            <input
              type="number"
              value={inputY}
              onChange={(e) => setInputY(Number(e.target.value))}
              className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm"
            />
          </label>
        </div>

        {/* Graph */}
        <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={graphData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="x" type="number" domain={[minX, maxX]} />
              <YAxis type="number" domain={[minY, maxY]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                dot={false}
                name={`f(x) = ${equation}`}
              />
              <Scatter data={pointDataX} dataKey="y" fill="#1d4ed8" name={`Point @ X=${inputX}`} />
              <Scatter data={pointDataY} dataKey="y" fill="#93c5fd" name={`Point @ Y=${inputY}`} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* AI Explanation */}
        <div className="text-center mt-4">
          {aiLoading ? (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-300 rounded text-blue-800 text-sm shadow-sm">
              <strong>TugonAI:</strong> <em>Explaining...</em>
            </div>
          ) : (
            aiExplanation && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-300 rounded text-blue-800 text-sm shadow-sm">
                <strong>TugonAI:</strong> {aiExplanation}
              </div>
            )
          )}
        </div>

        {/* Take Quiz Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Take Quiz
          </button>
        </div>

{/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              {!finished ? (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Quiz: Exponential Functions
                  </h2>
                  <p className="mb-4 text-gray-800">
                    {quizQuestions[currentQuestion].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="w-full text-left px-4 py-2 border rounded hover:bg-indigo-100 transition"
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </p>

                  <button
                    onClick={() => setShowQuiz(false)}
                    className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Exit Quiz
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Quiz Finished!
                  </h2>
                  <p className="mb-4 text-center text-gray-800">
                    You scored {score} out of {quizQuestions.length}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={restartQuiz}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
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
