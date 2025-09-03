import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Keyboard } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import MathSymbolPad from "../components/MathSymbolPad";
import { MathJax } from "better-react-mathjax";

interface Question {
  question: string;
  time_limit: number;
  points: number;
  answers: Answer[];
}
interface Answer {
  answer: string;
  is_correct: boolean;
}

function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      time_limit: 30,
      points: 1000,
      answers: Array(4).fill({ answer: "", is_correct: false }),
    },
  ]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Which question’s pad is open (null = none)
  const [padOpenFor, setPadOpenFor] = useState<number | null>(null);

  // Refs for placing text at the cursor
  const questionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        time_limit: 30,
        points: 1000,
        answers: Array(4).fill({ answer: "", is_correct: false }),
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (padOpenFor === index) setPadOpenFor(null);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const next = [...questions];
    next[index] = { ...next[index], [field]: value };
    setQuestions(next);
  };

  const updateAnswer = (qIndex: number, aIndex: number, field: keyof Answer, value: any) => {
    const next = [...questions];
    next[qIndex].answers[aIndex] = { ...next[qIndex].answers[aIndex], [field]: value };
    setQuestions(next);
  };

  // === Insert logic ===
  const isInsideInlineMath = (text: string, caret: number) => {
    const before = text.slice(0, caret);
    const lastOpen = before.lastIndexOf("\\(");
    const lastClose = before.lastIndexOf("\\)");
    return lastOpen !== -1 && lastOpen > lastClose;
  };

  const insertFromPad = (qIndex: number, snippet: string) => {
    const el = questionRefs.current[qIndex];
    const next = [...questions];
    const text = next[qIndex].question;

    const selStart = el?.selectionStart ?? text.length;
    const selEnd = el?.selectionEnd ?? selStart;

    const before = text.slice(0, selStart);
    const after = text.slice(selEnd);

    // Heuristics
    const isPlain = /^[0-9a-zA-Z+\-*/=() .,]+$/.test(snippet);
    const looksLatex = snippet.startsWith("\\") || /[\^_{}]/.test(snippet);
    const alreadyInMath = isInsideInlineMath(text, selStart);

    let inserted: string;
    if (isPlain) {
      inserted = snippet; // plain → no wrapping
    } else if (alreadyInMath || !looksLatex) {
      inserted = snippet; // already in math OR not LaTeX → insert raw
    } else {
      inserted = `\\(${snippet}\\)`; // wrap LaTeX snippet if outside math
    }

    const newText = before + inserted + after;
    next[qIndex].question = newText;
    setQuestions(next);

    // Caret placement
    const basePos = before.length;
    let caretPos = basePos + inserted.length;

    const searchTarget = inserted.startsWith("\\(") ? inserted.slice(2, -2) : inserted;
    const firstBrace = searchTarget.indexOf("{");
    if (firstBrace !== -1) {
      const offset = inserted.startsWith("\\(") ? 2 : 0;
      caretPos = basePos + offset + firstBrace + 1;
    } else if (searchTarget.includes("()")) {
      caretPos = basePos + inserted.indexOf("()") + 1;
    } else if (searchTarget.includes("[]")) {
      caretPos = basePos + inserted.indexOf("[]") + 1;
    }

    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(caretPos, caretPos);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: quiz, error } = await supabase
        .from("quizzes")
        .insert({ title, description, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;

      for (const question of questions) {
        const { data: qData, error: qError } = await supabase
          .from("questions")
          .insert({
            quiz_id: quiz.id,
            question: question.question,
            time_limit: question.time_limit,
            points: question.points,
          })
          .select()
          .single();
        if (qError) throw qError;

        const answers = question.answers.map((a) => ({
          question_id: qData.id,
          answer: a.answer,
          is_correct: a.is_correct,
        }));
        const { error: aError } = await supabase.from("answers").insert(answers);
        if (aError) throw aError;
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error creating quiz:", err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz meta */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Quiz Title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Quiz Description"
              rows={3}
            />
          </div>

          {/* Questions */}
          {questions.map((q, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.05 }}
              className="bg-white rounded-lg shadow-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Question {qIndex + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600"></span>
                  <button
                    type="button"
                    onClick={() =>
                      setPadOpenFor((prev) => (prev === qIndex ? null : qIndex))
                    }
                    className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                    title="Math Keyboard"
                  >
                    <Keyboard className="h-4 w-4" />
                    <span className="text-xs font-medium">Math Keyboard</span>
                  </button>
                </div>

                <textarea
                  ref={(el) => (questionRefs.current[qIndex] = el)}
                  required
                  rows={3}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Type your question here."
                />

                {/* Live LaTeX preview */}
                <div className="rounded-md bg-gray-50 border px-3 py-2">
                  <div className="text-xs text-gray-500 mb-1">Preview</div>
                  <MathJax dynamic>
                    {q.question && q.question.trim() !== ""
                      ? q.question
                      : "\\(\\text{(empty)}\\)"}
                  </MathJax>
                </div>

                {/* Math pad popover */}
                {padOpenFor === qIndex && (
                  <div className="relative">
                    <div className="absolute z-20 mt-2 w-full">
                      <MathSymbolPad
                        open
                        onInsert={(latex) => insertFromPad(qIndex, latex)}
                        onClose={() => setPadOpenFor(null)}
                        anchorClassName="mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Time & Points */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min={5}
                  max={120}
                  required
                  value={q.time_limit}
                  onChange={(e) =>
                    updateQuestion(qIndex, "time_limit", parseInt(e.target.value, 10))
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Time Limit (sec)"
                />
                <input
                  type="number"
                  min={100}
                  max={2000}
                  step={100}
                  required
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, "points", parseInt(e.target.value, 10))
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Points"
                />
              </div>

              {/* Answers */}
              <div className="space-y-2">
                {q.answers.map((a, aIndex) => (
                  <div key={aIndex} className="flex items-center space-x-3">
                    <input
                      type="text"
                      required
                      value={a.answer}
                      onChange={(e) => updateAnswer(qIndex, aIndex, "answer", e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={`Answer ${aIndex + 1}`}
                    />
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={a.is_correct}
                      onChange={() => {
                        const next = [...questions];
                        next[qIndex].answers = next[qIndex].answers.map((ans, i) => ({
                          ...ans,
                          is_correct: i === aIndex,
                        }));
                        setQuestions(next);
                      }}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Correct</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Footer buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <Save className="h-5 w-5" />
              <span>Save Quiz</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Quiz Created Successfully!</h2>
            <p className="text-gray-600">
              Go to dashboard to see the quiz or create another one.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate("/teacherDashboard")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setTitle("");
                  setDescription("");
                  setQuestions([
                    {
                      question: "",
                      time_limit: 30,
                      points: 1000,
                      answers: Array(4).fill({ answer: "", is_correct: false }),
                    },
                  ]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Create Another Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateQuiz;
