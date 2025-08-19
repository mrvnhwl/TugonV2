import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

function Asymptotestopic() {
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quizQuestions = [
    {
      question: "What is an asymptote?",
      options: [
        "A line the graph crosses infinitely often",
        "A line the graph approaches but never touches",
        "A tangent line to a curve",
        "The x-intercept of a function",
      ],
      answer: 1,
    },
    {
      question: "Where do vertical asymptotes occur in rational functions?",
      options: [
        "Where the numerator = 0",
        "Where the denominator = 0",
        "At infinity",
        "At y = 0",
      ],
      answer: 1,
    },
    {
      question: "What is the horizontal asymptote of f(x) = 3 / (x + 1)?",
      options: ["y = 3", "y = 1", "y = 0", "No horizontal asymptote"],
      answer: 2,
    },
    {
      question: "When does an oblique asymptote occur?",
      options: [
        "Numerator and denominator have same degree",
        "Degree of numerator is one higher than denominator",
        "Denominator has higher degree",
        "Function is linear",
      ],
      answer: 1,
    },
    {
      question: "What is the oblique asymptote of f(x) = (2x² + 3)/x?",
      options: ["y = 2", "y = 2x", "y = x²", "No oblique asymptote"],
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
          Graphing Rational Functions
        </h1>
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          Vertical, Horizontal, and Oblique Asymptotes
        </h2>

        {/* Topic Description */}
        <p className="text-gray-700 bg-white p-4 rounded border border-gray-300 shadow-sm">
          An <strong>asymptote</strong> is a line that a graph approaches but never touches. 
          Rational functions often have vertical, horizontal, or oblique asymptotes, 
          which help describe the function's behavior at extreme values or undefined points.
        </p>

        {/* Important Concepts */}
        <div className="bg-blue-50 p-4 rounded border border-blue-300 shadow-sm">
          <p className="text-blue-800 font-semibold mb-2">Important Concepts:</p>
          <ul className="list-disc list-inside text-blue-800">
            <li>
              <strong>Vertical asymptotes</strong> occur where the denominator of a rational function equals zero.
            </li>
            <li>
              <strong>Horizontal asymptotes</strong> describe the end behavior of a function as x approaches ±∞.
            </li>
            <li>
              <strong>Oblique asymptotes</strong> appear when the degree of the numerator is one higher than the degree of the denominator.
            </li>
          </ul>
        </div>

        {/* Examples */}
        <h2 className="text-xl font-semibold text-gray-800">Examples</h2>
        <div className="space-y-4 bg-white p-4 rounded border border-gray-300 shadow-sm">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Vertical Asymptote</p>
            <p className="text-sm text-gray-700">
              Example: f(x) = 1 / (x - 2) has a vertical asymptote at x = 2.
            </p>
            <img
              src="/images/vertical.png"
              alt="Graph with vertical asymptote"
              className="mt-2 w-full h-auto rounded shadow"
            />
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Horizontal Asymptote</p>
            <p className="text-sm text-gray-700">
              Example: f(x) = 3 / (x + 1) has a horizontal asymptote at y = 0.
            </p>
            <img
              src="/images/horizontal.png"
              alt="Graph with horizontal asymptote"
              className="mt-2 w-full h-auto rounded shadow"
            />
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="font-semibold text-gray-800">Oblique Asymptote</p>
            <p className="text-sm text-gray-700">
              Example: f(x) = (2x² + 3) / (x) has an oblique asymptote y = 2x.
            </p>
            <img
              src="/images/oblique.png"
              alt="Graph with oblique asymptote"
              className="mt-2 w-full h-auto rounded shadow"
            />
          </div>
        </div>

        {/* Embedded Video */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Watch: Asymptotes</h3>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/qGCKjuhA4eQ?si=GHfjGJHOgg2R-j9V"
            title="Asymptotes Video"
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
                    Quiz: Asymptotes
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

export default Asymptotestopic;
