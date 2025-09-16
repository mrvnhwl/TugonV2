// src/pages/EditQuiz.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, Plus, Trash2, ArrowLeft, Loader2, Keyboard } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import color from "../styles/color";
import MathSymbolPad from "../components/MathSymbolPad";
import { MathJax } from "better-react-mathjax";

type UUID = string;

interface EditableAnswer {
  id?: UUID;
  answer: string;
  is_correct: boolean;
}

interface EditableQuestion {
  id?: UUID;
  question: string;
  time_limit: number;
  points: number;
  answers: EditableAnswer[];
}

type PadTarget =
  | { type: "question"; qIndex: number }
  | { type: "answer"; qIndex: number; aIndex: number };

// 🔧 Helper functions for LaTeX formatting
function cleanLatex(text: string) {
  return text.replace(/\\\(|\\\)/g, ""); // remove \( and \)
}

/**
 * Automatically wraps non-math text in \text{} for proper spacing.
 * Also converts spaces into LaTeX spacing so preview looks correct.
 * @param {string} text - The input string from the user.
 * @returns {string} The formatted string ready for MathJax.
 */
/**
 * Formats input so words keep proper spacing in MathJax.
 */
function formatWithText(text: string): string {
  if (!text.trim()) return "";

  const parts = text
    .split(/(\\[a-zA-Z]+|[0-9]+(?:\.[0-9]+)?|[+\-*/=<>!~^_{}()])/)
    .filter(Boolean);

  let result: string[] = [];

  parts.forEach((part, i) => {
    if (/^\\[a-zA-Z]+$/.test(part)) {
      // LaTeX commands (\infty, \sqrt, etc.)
      result.push(part);
    } else if (/^[a-zA-Z\s]+$/.test(part)) {
      // Wrap plain words in \text{}
      const clean = part.replace(/\s+/g, " "); // normalize spaces
      result.push(`\\text{${clean.trim()}}`);
    } else {
      result.push(part); // numbers/operators
    }

    // Add spacing between parts if next part is not an operator
    if (i < parts.length - 1 && !/[+\-*/=<>!~^_{}()]/.test(parts[i + 1] || "")) {
      result.push("\\;");
    }
  });

  return `\\(${result.join("")}\\)`;
}






function renderMath(text: string) {
  if (!text.trim()) return "";
  return `\\(${text}\\)`;
}

export default function EditQuiz() {
  const { id: quizId } = useParams<{ id: UUID }>();
  const navigate = useNavigate();
  const lastQuestionRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | null>("");

  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<EditableQuestion[]>([]);

  // Floating keyboard states
  const [showMathPad, setShowMathPad] = useState(false);
  const [padTarget, setPadTarget] = useState<PadTarget | null>(null);

  // Ref to hold the current input element
  const currentInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // ---------- Load quiz ----------
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!quizId) {
        if (mounted) setLoading(false);
        return;
      }
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: quizRow, error: qErr } = await supabase
          .from("quizzes")
          .select("id, title, description")
          .eq("id", quizId)
          .single();
        if (qErr) throw qErr;
        if (!quizRow) throw new Error("Quiz not found");

        const { data: qRows, error: qsErr } = await supabase
          .from("questions")
          .select(`
            id,
            question,
            time_limit,
            points,
            answers ( id, answer, is_correct )
          `)
          .eq("quiz_id", quizId)
          .order("created_at", { ascending: true });
        if (qsErr) throw qsErr;

        const mapped: EditableQuestion[] = (qRows ?? []).map((r: any) => ({
          id: r.id,
          question: cleanLatex(r.question ?? ""),
          time_limit: Number(r.time_limit ?? 30),
          points: Number(r.points ?? 1000),
          answers:
            (r.answers ?? []).map((a: any) => ({
              id: a.id,
              answer: cleanLatex(a.answer ?? ""),
              is_correct: Boolean(a.is_correct),
            })) || [],
        }));

        if (mounted) {
          setTitle(quizRow.title ?? "");
          setDescription(quizRow.description ?? "");
          setQuestions(mapped);
          setOriginalQuestions(JSON.parse(JSON.stringify(mapped)));
        }
      } catch (e: any) {
        if (mounted) setErrorMsg(e.message ?? "Failed to load quiz.");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  // ---------- UI State Helpers ----------
  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        time_limit: 30,
        points: 1000,
        answers: [
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
        ],
      },
    ]);
    setTimeout(() => lastQuestionRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const removeQuestion = useCallback((qIndex: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex)),
    []
  );

  const updateQuestionField = useCallback((
    qIndex: number,
    field: keyof Omit<EditableQuestion, "answers" | "id">,
    value: any
  ) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], [field]: value };
      return next;
    }),
    []
  );

  const addAnswer = useCallback((qIndex: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers = [...next[qIndex].answers, { answer: "", is_correct: false }];
      return next;
    }),
    []
  );

  const removeAnswer = useCallback((qIndex: number, aIndex: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers = next[qIndex].answers.filter((_, i) => i !== aIndex);
      return next;
    }),
    []
  );

  const updateAnswerField = useCallback((
    qIndex: number,
    aIndex: number,
    field: keyof EditableAnswer,
    value: any
  ) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers[aIndex] = { ...next[qIndex].answers[aIndex], [field]: value };
      return next;
    }),
    []
  );

  const setCorrectAnswer = useCallback((qIndex: number, aIndex: number) =>
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers = next[qIndex].answers.map((a, i) => ({
        ...a,
        is_correct: i === aIndex,
      }));
      return next;
    }),
    []
  );

  // ---------- Insert from Pad ----------
  const insertFromPad = useCallback((symbol: string) => {
    if (!padTarget || !currentInputRef.current) {
      return;
    }

    const input = currentInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value;

    const newValue = value.substring(0, start) + symbol + value.substring(end);
    
    input.value = newValue;

    if (padTarget.type === "question") {
      updateQuestionField(padTarget.qIndex, "question", newValue);
    } else if (padTarget.type === "answer") {
      updateAnswerField(padTarget.qIndex, padTarget.aIndex, "answer", newValue);
    }

    const newCursorPos = start + symbol.length;
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [padTarget, updateQuestionField, updateAnswerField]);

  // ---------- Save ----------
  // 🔧 SaveAll now saves RAW text
const saveAll = async () => {
  if (!quizId) return;
  setSaving(true);
  setErrorMsg(null);
  setSuccessMsg(null);

  try {
    const updates = questions.map(async (q) => {
      const questionPayload = {
        question: q.question, // ✅ RAW, no formatWithText
        time_limit: q.time_limit,
        points: q.points,
      };

      if (q.id) {
        await supabase.from("questions").update(questionPayload).eq("id", q.id);

        const answerUpdates = q.answers.map(async (a) => {
          const answerPayload = {
            answer: a.answer, // ✅ RAW, no formatWithText
            is_correct: a.is_correct,
            question_id: q.id,
          };
          if (a.id) {
            return supabase.from("answers").update(answerPayload).eq("id", a.id);
          } else {
            return supabase.from("answers").insert(answerPayload);
          }
        });
        await Promise.all(answerUpdates);

      } else {
        const { data: newQuestion, error: qInsertError } = await supabase
          .from("questions")
          .insert({ ...questionPayload, quiz_id: quizId })
          .select()
          .single();

        if (qInsertError) throw qInsertError;

        const newAnswersPayload = q.answers.map((a) => ({
          answer: a.answer, // ✅ RAW
          is_correct: a.is_correct,
          question_id: newQuestion.id,
        }));
        await supabase.from("answers").insert(newAnswersPayload);
      }
    });

    // Handle deleted questions
    const deletedQuestionIds = originalQuestions
      .filter(oq => !questions.find(q => q.id === oq.id))
      .map(oq => oq.id);

    if (deletedQuestionIds.length > 0) {
      await supabase.from("questions").delete().in("id", deletedQuestionIds);
    }

    await Promise.all(updates);

    const { error: quizError } = await supabase
      .from("quizzes")
      .update({ title, description })
      .eq("id", quizId);
    if (quizError) throw quizError;

    setSuccessMsg("Saved successfully!");
    setOriginalQuestions(JSON.parse(JSON.stringify(questions)));

  } catch (e: any) {
    console.error("Save failed:", e);
    setErrorMsg(e.message ?? "Failed to save changes.");
  } finally {
    setSaving(false);
    setTimeout(() => setSuccessMsg(null), 2000);
  }
};


  // ---------- Delete Quiz ----------
  const deleteQuiz = async () => {
    if (!quizId) return;
    const confirmed = window.confirm("Are you sure you want to delete this quiz permanently?");
    if (!confirmed) return;
    setDeleting(true);

    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
      navigate("/teacherDashboard");
    } catch (e: any) {
      console.error("Delete failed:", e);
      setErrorMsg(e?.message ?? "Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
      >
        <motion.div
          className="rounded-full h-12 w-12 border-4 border-t-4"
          style={{ borderColor: `${color.teal}40` }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            borderColor: [`${color.teal}40`, color.teal, `${color.teal}40`],
          }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
    >
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            to="/teacherDashboard"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold transition"
            style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={deleteQuiz}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-md transition disabled:opacity-70"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "Deleting..." : "Delete quiz"}
            </button>

            <button
              onClick={saveAll}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-md transition disabled:opacity-70"
              style={{ background: color.teal, color: "#fff" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* Quiz Meta */}
        <motion.div
          className="rounded-2xl p-6 shadow-xl ring-1 mb-6"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: color.deep }}>
            Edit Quiz
          </h1>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Quiz title"
            />
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Description (optional)"
              rows={3}
            />
          </div>
        </motion.div>

        {/* Questions */}
        {questions.map((q, qIndex) => (
          <motion.div
            key={q.id ?? `new-${qIndex}`}
            ref={qIndex === questions.length - 1 ? lastQuestionRef : null}
            className="rounded-2xl p-6 shadow-xl ring-1 mb-6"
            style={{ background: "#fff", borderColor: `${color.mist}55` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: color.deep }}>
                Question {qIndex + 1}
              </h2>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Question Preview */}
        
<div className="mb-2 text-gray-900 whitespace-pre-wrap">
  <MathJax dynamic>{formatWithText(q.question)}</MathJax>
</div>


            <textarea
              value={q.question}
              onChange={(e) => updateQuestionField(qIndex, "question", e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Type the question here..."
              onFocus={(e) => {
                setPadTarget({ type: "question", qIndex });
                currentInputRef.current = e.target;
              }}
            />

            {/* Time + Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: color.steel }}>
                  Time Limit (seconds)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={q.time_limit}
                  onChange={(e) =>
                    updateQuestionField(qIndex, "time_limit", parseInt(e.target.value || "0", 10))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: color.steel }}>
                  Points
                </label>
                <input
                  type="number"
                  min={100}
                  max={2000}
                  step={100}
                  value={q.points}
                  onChange={(e) =>
                    updateQuestionField(qIndex, "points", parseInt(e.target.value || "0", 10))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Answers */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: color.deep }}>
                  Answers
                </h3>
                <button
                  type="button"
                  onClick={() => addAnswer(qIndex)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
                  style={{ background: `${color.teal}15`, color: color.teal }}
                >
                  <Plus className="h-4 w-4" />
                  Add answer
                </button>
              </div>

              <div className="space-y-2">
                {q.answers.map((a, aIndex) => (
                  <div key={a.id ?? `new-a-${aIndex}`} className="flex flex-col gap-1">
                    <div className="text-gray-900">
  <MathJax dynamic>{formatWithText(a.answer)}</MathJax>
</div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={a.answer}
                        onChange={(e) => updateAnswerField(qIndex, aIndex, "answer", e.target.value)}
                        onFocus={(e) => {
                          setPadTarget({ type: "answer", qIndex, aIndex });
                          currentInputRef.current = e.target;
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={`Answer ${aIndex + 1}`}
                      />
                      <label className="inline-flex items-center gap-2 text-sm" style={{ color: color.steel }}>
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={a.is_correct}
                          onChange={() => setCorrectAnswer(qIndex, aIndex)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        Correct
                      </label>
                      <button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add Question + Save */}
        <div className="flex items-center justify-between mb-14">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-md transition"
            style={{ background: `${color.teal}15`, color: color.teal }}
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>

          <button
            onClick={saveAll}
            disabled={saving || deleting}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-md transition disabled:opacity-70"
            style={{ background: color.teal, color: "#fff" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </main>

      {/* Floating keyboard button */}
      <motion.button
        onClick={() => setShowMathPad(true)}
        className="fixed bottom-6 left-6 rounded-full shadow-lg p-4"
        style={{ background: color.teal, color: "#fff" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Keyboard className="h-6 w-6" />
      </motion.button>

      {/* Math Symbol Pad */}
      {showMathPad && (
        <MathSymbolPad
          onInsert={insertFromPad}
          onClose={() => setShowMathPad(false)}
          onPreventFocusLoss={() => currentInputRef.current?.focus()}
        />
      )}
    </div>
  );
}