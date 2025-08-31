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

function Logarithmictopic() {
  const [inputValue, setInputValue] = useState(1);

  // Log base 2
  const logarithmicFunction = (x: number) => {
    if (x <= 0) return null; // undefined for x <= 0
    return Math.log2(x);
  };

  // Graph data for log₂(x), skipping undefined values
  const graphData = Array.from({ length: 40 }, (_, i) => {
    const x = i / 2 + 0.1; // start slightly > 0
    return { x, y: logarithmicFunction(x) };
  }).filter((point) => point.y !== null);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is the domain of a logarithmic function?",
      options: [
        "x > 0", 
        "All real numbers", 
        "x ≥ 0", 
        "x ≠ 0"],
      answer: 0,
    },
    {
      question: "What is the range of a logarithmic function?",
      options: [
        "x > 0", 
        "y ≥ 0", 
        "All real numbers", 
        "y > 0"],
      answer: 2,
    },
    {
      question: "Which of the following is a logarithmic function?",
      options: [
        "f(x) = 2^x", 
        "f(x) = √x", 
        "f(x) = x^2", 
        "f(x) = log₂​(x)"],
      answer: 3,
    },
    {
      question: "The logarithmic function is the inverse of which function?",
      options: [
        "Quadratic function",
        "Exponential function",
        "Linear function",
        "Rational function"
      ],
      answer: 1,
    },
    {
      question: "Which of the following is equivalent to log₁₀(1000)?",
      options: [
        "1",
        "2",
        "3",
        "10"
      ],
      answer: 2,
    },
    {
      question: "What is the domain of f(x) = log(x)?",
      options: [
        "x > 0", 
        "All real numbers", 
        "x ≥ 0", 
        "x ≠ 0"],
      answer: 0,
    },
    {
      question: "Simply: log₅(25)?",
      options: [
        "1/2", 
        "1", 
        "3", 
        "2"],
      answer: 3,
    },
    {
      question: "log₂(8) = ?",
      options: [
        "2", 
        "3", 
        "4", 
        "8"],
      answer: 1,
    },
    {
      question: "If log₇(x) = 2, then x = ?",
      options: [
        "7",
        "14",
        "49",
        "9"
      ],
      answer: 2,
    },
    {
      question: "If log₂(16) = x, then x = ?",
      options: [
        "2",
        "3",
        "4",
        "5"
      ],
      answer: 2,
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
          Logarithmic Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          A <strong>logarithmic function</strong> is the inverse of an exponential function. 
          In general, <code>logₐ(x)</code> answers the question: 
          “To what power must the base <code>a</code> be raised, to get <code>x</code>?”
        </p>

        {/* Important Concepts */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-300 shadow-sm">
          <p className="text-yellow-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-yellow-800">
            <li>Domain: <code>x &gt; 0</code> (logarithms are undefined for zero or negative values).</li>
            <li>Range: all real numbers (<code>-∞</code> to <code>+∞</code>).</li>
            <li>If <code>a &gt; 1</code>, the log function increases; if <code>0 &lt; a &lt; 1</code>, it decreases.</li>
            <li>The graph of <code>y = logₐ(x)</code> is the reflection of <code>y = a^x</code> across the line <code>y = x</code>.</li>
          </ul>
        </div>

        {/* Example Section */}
        <h2 className="text-xl font-semibold text-gray-800">
          Example: Exploring f(x) = log₂(x)
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Enter a positive value for x:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-yellow-200"
          />
        </label>

        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold text-gray-800">
            Logarithmic Function: f(x) = log₂(x)
          </p>
          <p className="text-sm text-gray-700">
            f({inputValue}) ={" "}
            {logarithmicFunction(inputValue) !== null
              ? logarithmicFunction(inputValue)?.toFixed(4)
              : "undefined"}
          </p>
        </div>

        {/* Graph */}
        <div className="bg-white p-4 rounded border border-gray-300 shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={graphData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="x" type="number" domain={[0, "auto"]} />
              <YAxis type="number" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#f59e0b"
                dot={false}
                name="f(x) = log₂(x)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Logarithmic Functions Explained
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/kqVpPSzkTYA?si=0mXoAbnD7zKSpu9u"
            title="Logarithmic Functions Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded border border-gray-300"
          ></iframe>
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
                    Quiz: Logarithmic Functions
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

export default Logarithmictopic;
