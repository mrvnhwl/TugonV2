import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

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
        "g(f(x)) means apply g then f"],
      answer: 2, 
    },
    {
      question: "With f(x) = 2x + 1 and g(x) = x², and find (f ∘ g)(2). ",
      options: [
        "7",
        "9",
        "5",
        "25",
      ],
      answer: 1,
    },
    {
      question: "Given f(x) = 3x − 4 and g(x) = x + 2, find f(g(x)).",
      options: [
        "3x + 2", 
        "3x - 2", 
        "3x + 6", 
        "3x - 6"],
      answer: 0,
    },
    {
      question: "If f(x) = 3x - 4, g(x) = x + 2, what is g(f(x))?",
      options: [
        "x + 6",
        "3x + 2", 
        "x - 2", 
        "3x - 2"],
      answer: 3, 
    },
    {
      question: "For f(x) = 3x - 2 and g(x) = x + 4, simply (f ∘ g)(x)?",
      options: [
        "3x + 10",
        "3x + 2", 
        "3x - 2", 
        "x + 4"],
      answer: 0, 
    },
    {
      question: "If f(x) = √x - 1 and g(x) = x², what is the domain of (f ∘ g)(x) = √x² - 1?",
      options: [
        "All real numbers",
        "x ≤ -1", 
        "x ≥ -1", 
        "|x| ≥ 1"],
      answer: 3, 
    },
    {
      question: "Which f(x) = 1/x-2 and g(x) = x + 2, which expression equals (f ∘ g)(x)?",
      options: [
        "1/x",
        "1/x+2", 
        "1/x-2", 
        "x"],
      answer: 0, 
    },
    {
      question: "If f(x) = 2x , find(f ∘ g)(x)?",
      options: [
        "2x²",
        "4x", 
        "2x - 2", 
        "4x + 2"],
      answer: 1, 
    },
    {
      question: "Let h(x) = x(identity). Which statement is always true?",
      options: [
        "f ∘ h = f",
        "h ∘ f = f", 
        "Both A and B", 
        "Neither A nor B"],
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
          Composition of Functions
        </h1>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          The <strong>composition of functions</strong> combines two functions into
          one by applying one function to the result of another. If we have
          functions <code>f(x)</code> and <code>g(x)</code>, then{" "}
          <code>f(g(x))</code> means applying <code>g(x)</code> first, then applying{" "}
          <code>f</code> to the result.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              The order of composition matters: <code>f(g(x))</code> is generally
              different from <code>g(f(x))</code>.
            </li>
            <li>
              Always start with the innermost function and work outward.
            </li>
            <li>
              Composition allows us to create more complex operations from simpler
              ones.
            </li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="bg-white p-4 rounded border border-gray-300 shadow-sm space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">g(x) = x + 2</p>
            <p className="text-sm text-gray-700">Example: g(4) = 6</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">f(x) = 3x - 4</p>
            <p className="text-sm text-gray-700">Example: f(4) = 8</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Composition: f(g(x))</p>
            <pre className="whitespace-pre-wrap text-sm">
{`f(g(x)) = 3(x + 2) - 4
         = 3x + 6 - 4
         = 3x + 2`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Composition: g(f(x))</p>
            <pre className="whitespace-pre-wrap text-sm">
{`g(f(x)) = (3x - 4) + 2
         = 3x - 2`}
            </pre>
          </div>
        </div>

        {/* Interactive Input */}
        <h2 className="text-xl font-semibold text-gray-800">
          Try It Yourself:
        </h2>
        <label className="block text-sm text-gray-700 mb-2">
          Choose an input value (x):
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </label>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              g({inputValue}) = {functionG(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              f({inputValue}) = {functionF(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              f(g({inputValue})) = {compositionFG(inputValue)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-800 font-semibold">
              g(f({inputValue})) = {compositionGF(inputValue)}
            </p>
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Watch: Composition of Functions
          </h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/ZFPkQkURSxk?si=BjMaBb2DctJ3QLcU"
            title="Composition of Functions Video"
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
                    Quiz: Composition of Functions
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

export default Compositiontopic;
