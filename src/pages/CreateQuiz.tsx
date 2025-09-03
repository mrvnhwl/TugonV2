import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import MathSymbolPad from "../components/MathSymbolPad";
import { MathJax } from "better-react-mathjax";

interface Answer {
  answer: string;
  is_correct: boolean;
}
interface Question {
  question: string;
  time_limit: number; // seconds
  points: number;
  answers: Answer[];
}

const freshAnswers = () =>
  Array.from({ length: 4 }, () => ({ answer: "", is_correct: false }));

// What field is currently focused (target for the global math keyboard)
type PadTarget =
  | { type: "question"; qIndex: number }
  | { type: "answer"; qIndex: number; aIndex: number };

function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", time_limit: 30, points: 1000, answers: freshAnswers() },
  ]);

  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);

  // GLOBAL: always-on math keyboard + preview outside question boxes
  const [padTarget, setPadTarget] = useState<PadTarget | null>(null);

  // Refs for caret placement
  const questionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const answerRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", time_limit: 30, points: 1000, answers: freshAnswers() },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    // If we deleted the focused question/answer, clear target
    if (padTarget && padTarget.qIndex === index) setPadTarget(null);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateAnswer = (
    qIndex: number,
    aIndex: number,
    field: keyof Answer,
    value: any
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = q.answers.map((ans, i) =>
        i === aIndex ? { ...ans, [field]: value } : ans
      );
      next[qIndex] = q;
      return next;
    });
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = q.answers.map((ans, i) => ({
        ...ans,
        is_correct: i === aIndex,
      }));
      next[qIndex] = q;
      return next;
    });
  };

  // === Inline-math helpers ===
  const isInsideInlineMath = (text: string, caret: number) => {
    const before = text.slice(0, caret);
    const lastOpen = before.lastIndexOf("\\(");
    const lastClose = before.lastIndexOf("\\)");
    return lastOpen !== -1 && lastOpen > lastClose;
  };

  const insertFromPad = (snippet: string) => {
    if (!padTarget) {
      alert("Click a question or an answer field first, then use the Math Keyboard.");
      return;
    }

    const isPlain = /^[0-9a-zA-Z+\-*/=() .,]+$/.test(snippet);
    const looksLatex = snippet.startsWith("\\") || /[\^_{}]/.test(snippet);

    const insertIntoText = ({
      text,
      selStart,
      selEnd,
      alreadyInMath,
    }: {
      text: string;
      selStart: number;
      selEnd: number;
      alreadyInMath: boolean;
    }) => {
      const before = text.slice(0, selStart);
      const after = text.slice(selEnd);
      let inserted: string;
      if (isPlain) inserted = snippet;
      else if (alreadyInMath || !looksLatex) inserted = snippet;
      else inserted = `\\(${snippet}\\)`;

      const newText = before + inserted + after;

      // Smart caret placement
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
      return { newText, caretPos };
    };

    if (padTarget.type === "question") {
      const { qIndex } = padTarget;
      const el = questionRefs.current[qIndex];
      const current = questions[qIndex].question;
      const selStart = el?.selectionStart ?? current.length;
      const selEnd = el?.selectionEnd ?? selStart;
      const alreadyInMath = isInsideInlineMath(current, selStart);

      const { newText, caretPos } = insertIntoText({
        text: current,
        selStart,
        selEnd,
        alreadyInMath,
      });

      const next = [...questions];
      next[qIndex] = { ...next[qIndex], question: newText };
      setQuestions(next);

      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(caretPos, caretPos);
      });
    } else {
      const { qIndex, aIndex } = padTarget;
      if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
      const el = answerRefs.current[qIndex][aIndex];
      const current = questions[qIndex].answers[aIndex].answer;
      const selStart = el?.selectionStart ?? current.length;
      const selEnd = el?.selectionEnd ?? selStart;
      const alreadyInMath = isInsideInlineMath(current, selStart);

      const { newText, caretPos } = insertIntoText({
        text: current,
        selStart,
        selEnd,
        alreadyInMath,
      });

      updateAnswer(qIndex, aIndex, "answer", newText);

      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(caretPos, caretPos);
      });
    }
  };

  // === Validation ===
  const validate = () => {
    if (!title.trim()) return "Please add a quiz title.";
    if (!questions.length) return "Add at least one question.";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} is empty.`;
      if (!Number.isFinite(q.time_limit) || q.time_limit < 5 || q.time_limit > 600)
        return `Question ${i + 1}: time limit should be between 5 and 600 seconds.`;
      if (!Number.isFinite(q.points) || q.points < 50 || q.points > 10000)
        return `Question ${i + 1}: points should be between 50 and 10000.`;
      if (q.answers.length !== 4) return `Question ${i + 1} must have 4 answers.`;
      const empty = q.answers.findIndex((a) => !a.answer.trim());
      if (empty !== -1) return `Question ${i + 1}: Answer ${empty + 1} is empty.`;
      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount !== 1) return `Question ${i + 1} must have exactly one correct answer.`;
    }
    return null;
  };

  // === Submit: quizzes → questions → answers ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reason = validate();
    if (reason) {
      alert(reason);
      return;
    }
    if (!user?.id) {
      alert("You must be signed in to create a quiz.");
      return;
    }

    setSaving(true);
    let quizId: string | null = null;

    try {
      // 1) Insert quiz
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .insert({ title, description, created_by: user.id })
        .select("*")
        .single();

      if (quizErr || !quiz) throw quizErr || new Error("Failed to insert quiz.");
      quizId = quiz.id;

      // 2) Insert questions and answers
      for (const q of questions) {
        const { data: qRow, error: qErr } = await supabase
          .from("questions")
          .insert({
            quiz_id: quizId,
            question: q.question,
            time_limit: q.time_limit,
            points: q.points,
          })
          .select("*")
          .single();

        if (qErr || !qRow) throw qErr || new Error("Failed to insert question.");

        const answersRows = q.answers.map((a) => ({
          question_id: qRow.id,
          answer: a.answer,
          is_correct: a.is_correct,
        }));

        const { error: aErr } = await supabase.from("answers").insert(answersRows);
        if (aErr) throw aErr;
      }

      setCreatedQuizId(quizId);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error creating quiz:");
      console.error(JSON.stringify(err, null, 2));

      // Optional rollback if child insert failed
      if (quizId) {
        await supabase.from("quizzes").delete().eq("id", quizId);
      }

      alert(err?.message ?? "Something went wrong creating the quiz.");
    } finally {
      setSaving(false);
    }
  };

  // ===== Global toolbar preview text (current focused field) =====
  const previewText = (() => {
    if (!padTarget) return "";
    if (padTarget.type === "question") {
      return questions[padTarget.qIndex]?.question ?? "";
    } else {
      return questions[padTarget.qIndex]?.answers?.[padTarget.aIndex]?.answer ?? "";
    }
  })();

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
              placeholder="Quiz Description (optional)"
              rows={3}
            />
          </div>

          {/* ===== ALWAYS-VISIBLE MATH TOOLBAR (outside question boxes) ===== */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="text-xs text-gray-500">
              Tip: click any question or answer first, then insert symbols below.
            </div>

            {/* Live LaTeX preview (for the currently focused field) */}
            <div className="rounded-md bg-gray-50 border px-3 py-2">
              <div className="text-xs text-gray-500 mb-1">Live Preview</div>
              <MathJax dynamic>
                {previewText && previewText.trim() !== ""
                  ? previewText
                  : "\\(\\text{(empty)}\\)"}
              </MathJax>
            </div>

            {/* Global Math Keyboard (always shown) */}
            <div className="pt-2">
              <MathSymbolPad
                open
                onInsert={insertFromPad}
                onClose={() => { /* kept for API compatibility, no-op */ }}
              />
            </div>
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

              {/* QUESTION TEXTAREA (focus sets global pad target) */}
              <textarea
                ref={(el) => (questionRefs.current[qIndex] = el)}
                onFocus={() => setPadTarget({ type: "question", qIndex })}
                required
                rows={3}
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Type your question here. Use \( ... \) for inline math."
              />

              {/* Time & Points */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min={5}
                  max={600}
                  required
                  value={q.time_limit}
                  onChange={(e) =>
                    updateQuestion(qIndex, "time_limit", parseInt(e.target.value || "0", 10))
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Time Limit (sec)"
                />
                <input
                  type="number"
                  min={50}
                  max={10000}
                  step={50}
                  required
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, "points", parseInt(e.target.value || "0", 10))
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Points"
                />
              </div>

              {/* Answers (use the global keyboard) */}
              <div className="space-y-2">
                {q.answers.map((a, aIndex) => (
                  <div key={aIndex} className="flex items-center space-x-3">
                    <input
                      ref={(el) => {
                        if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
                        answerRefs.current[qIndex][aIndex] = el;
                      }}
                      onFocus={() => setPadTarget({ type: "answer", qIndex, aIndex })}
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
                      onChange={() => setCorrectAnswer(qIndex, aIndex)}
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
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? "Saving..." : "Save Quiz"}</span>
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
              Your quiz was saved with all questions and answers.
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
                  setQuestions([{ question: "", time_limit: 30, points: 1000, answers: freshAnswers() }]);
                  setCreatedQuizId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Create Another Quiz
              </button>
              {createdQuizId && (
                <button
                  onClick={() => navigate(`/edit-quiz/${createdQuizId}`)}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition"
                >
                  Edit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateQuiz;
