// src/pages/topics/Asymptotestopic.tsx
import React, { useState } from "react";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color"; // ✅ use your centralized palette

function Asymptotestopic() {
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const quizQuestions = [
    {
      question: "What is an asymptote?",
      options: [
        "A line the graph approaches",
        "A line the graph must cross",
        "A segment the graph coincides with",
        "A point of discontinuity",
      ],
      answer: 0,
    },
    {
      question: "For f(x) = (x² − 1) / (x − 1), which vertical asymptotes exist?",
      options: ["x = 1", "x = −1", "x = ±1", "None"],
      answer: 3,
    },
    {
      question: "What is the horizontal asymptote of f(x) = 3 / (x + 1)?",
      options: ["y = 3", "y = 1", "y = 0", "No horizontal asymptote"],
      answer: 2,
    },
    {
      question: "When does an oblique (slant) asymptote occur?",
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
    {
      question:
        "The horizontal asymptote of f(x) = (5x² − 3x + 1) / (x² + 7x − 4) is?",
      options: ["y = 0", "y = 1", "y = 5", "y = 7"],
      answer: 1,
    },
    {
      question: "The horizontal asymptote of f(x) = (2x + 1) / (x² + 9) is?",
      options: ["y = 0", "y = 1", "y = 2", "y = 3"],
      answer: 0,
    },
    {
      question: "Find the oblique asymptote of f(x) = (x² + 1) / (x − 2).",
      options: ["y = x − 2", "y = x + 2", "y = 0", "y = 2"],
      answer: 1,
    },
    {
      question: "Which type of asymptote does f(x) = (2x³ − 1) / (x² + 1) have?",
      options: ["Horizontal y = 0", "Oblique y = 2x", "Vertical x = 1", "None"],
      answer: 1,
    },
    {
      question: "Vertical asymptotes of f(x) = (x + 1)/(x² − 2x − 8) are:",
      options: ["x = 4 only", "x = −2 only", "x = 4 and x = −2", "x = 0"],
      answer: 2,
    },
  ];

  const handleAnswer = (index: number) => {
    setPicked(index);
    const correct = quizQuestions[currentQuestion].answer === index;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setPicked(null);
      if (currentQuestion + 1 < quizQuestions.length) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setFinished(true);
      }
    }, 450);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinished(false);
    setPicked(null);
  };

  // Theme helpers (using your palette)
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
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
              Graphing Rational Functions
            </h1>
            <p className="mt-2 text-white/90 text-lg">
              Vertical, Horizontal, and Oblique Asymptotes
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

      {/* Main */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Overview */}
        <section
          className="rounded-2xl border bg-white p-6 md:p-7 -mt-8"
          style={{ ...cardBorder, boxShadow: subtleShadow }}
        >
          <p className="leading-relaxed" style={{ color: color.steel }}>
            An <strong>asymptote</strong> is a line that a graph approaches but
            does not cross or only crosses finitely many times. Rational
            functions can have <strong>vertical</strong>,{" "}
            <strong>horizontal</strong>, or <strong>oblique (slant)</strong>{" "}
            asymptotes, which describe behavior near undefined points and at
            extreme values of <em>x</em>.
          </p>
        </section>

        {/* Concepts */}
        <section className="grid md:grid-cols-3 gap-5 mt-6">
          {[
            {
              title: "Vertical Asymptotes",
              text:
                "Occur where the denominator is zero (after simplifying common factors). They are vertical lines x = a.",
            },
            {
              title: "Horizontal Asymptotes",
              text:
                "Describe end behavior as x → ±∞. Compare degrees of numerator and denominator.",
            },
            {
              title: "Oblique (Slant) Asymptotes",
              text:
                "Happen when the numerator’s degree is exactly one more than the denominator’s; use polynomial long division.",
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
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: "Vertical Asymptote",
                text: "f(x) = 1 / (x − 2) has a vertical asymptote at x = 2.",
                src: "/images/vertical.png",
                alt: "Graph with vertical asymptote",
              },
              {
                title: "Horizontal Asymptote",
                text: "f(x) = 3 / (x + 1) has a horizontal asymptote at y = 0.",
                src: "/images/horizontal.png",
                alt: "Graph with horizontal asymptote",
              },
              {
                title: "Oblique Asymptote",
                text: "f(x) = (2x² + 3) / x has an oblique asymptote y = 2x.",
                src: "/images/oblique.png",
                alt: "Graph with oblique asymptote",
              },
            ].map((ex) => (
              <div
                key={ex.title}
                className="rounded-xl border bg-white p-5"
                style={{ ...cardBorder, boxShadow: subtleShadow }}
              >
                <p className="font-semibold" style={{ color: color.deep }}>
                  {ex.title}
                </p>
                <p className="text-sm mt-1" style={{ color: color.steel }}>
                  {ex.text}
                </p>
                <img
                  src={ex.src}
                  alt={ex.alt}
                  className="mt-3 w-full h-auto rounded-md"
                  style={{ boxShadow: subtleShadow }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Video */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3" style={{ color: color.deep }}>
            Watch: Asymptotes
          </h3>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/qGCKjuhA4eQ?si=GHfjGJHOgg2R-j9V"
              title="Asymptotes Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>

        {/* Take Quiz CTA */}
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
              style={{ ...cardBorder, boxShadow: "0 20px 40px rgba(0,0,0,0.14)" }}
            >
              {!finished ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: color.deep }}>
                      Quiz: Asymptotes
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
                    {quizQuestions[currentQuestion].options.map((option, index) => {
                      const isPicked = picked === index;
                      const isCorrect =
                        picked !== null &&
                        index === quizQuestions[currentQuestion].answer;

                      let bg = "#fff";
                      if (picked !== null) {
                        if (isCorrect) bg = `${color.teal}14`;
                        else if (isPicked) bg = "#faf0f0";
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => picked === null && handleAnswer(index)}
                          className="w-full text-left px-4 py-3 rounded-xl transition focus:outline-none"
                          style={{
                            background: bg,
                            border: `1px solid ${color.mist}66`,
                            color: color.deep,
                            boxShadow: subtleShadow,
                          }}
                          onFocus={(e) =>
                            (e.currentTarget.style.boxShadow = ringFocus)
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.boxShadow = subtleShadow)
                          }
                        >
                          {option}
                        </button>
                      );
                    })}
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

export default Asymptotestopic;
