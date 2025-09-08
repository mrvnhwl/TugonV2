import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Keyboard } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import MathSymbolPad from "../components/MathSymbolPad";
import { MathJax } from "better-react-mathjax";

/* ----------------------------- Types & helpers ---------------------------- */

interface Answer {
  answer: string;
  is_correct: boolean;
}
interface Question {
  question: string;
  time_limit: number;
  points: number;
  answers: Answer[];
}
type PadTarget =
  | { type: "question"; qIndex: number }
  | { type: "answer"; qIndex: number; aIndex: number };

const freshAnswers = () =>
  Array.from({ length: 4 }, () => ({ answer: "", is_correct: false }));

// Quick check if caret is inside \( ... \)
const isInsideInlineMath = (text: string, caret: number) => {
  const before = text.slice(0, caret);
  const lastOpen = before.lastIndexOf("\\(");
  const lastClose = before.lastIndexOf("\\)");
  return lastOpen !== -1 && lastOpen > lastClose;
};

// Ensure a given snippet is wrapped as inline math \( ... \) if it isn't already.
const wrapInlineIfNeeded = (s: string) => {
  const trimmed = s.trim();
  if (trimmed.startsWith("\\(") && trimmed.endsWith("\\)")) return s;
  return `\\(${trimmed}\\)`;
};

// Very light, safe “smart formatter” for common patterns.
// It tries to transform only simple, *standalone* math and avoids double-wrapping.
function smartFormat(text: string): string {
  let out = text;

  // Skip quick exit if there are no math-y triggers at all
  if (
    !/[A-Za-z]\^|\bsqrt\s*\(|\b\d+\/\d+\b|\b(alpha|beta|theta|lambda|pi|Delta)\b|\b(sin|cos|tan)\s*\(/.test(
      out
    )
  ) {
    return out;
  }

  // 1) sqrt(...) -> \sqrt{...}
  out = out.replace(/\bsqrt\s*\(\s*([^()]+?)\s*\)/g, (_m, inner) =>
    wrapInlineIfNeeded(`\\sqrt{${inner}}`)
  );

  // 2) trig like sin(x) -> \sin(x)
  out = out.replace(
    /\b(sin|cos|tan)\s*\(\s*([^()]+?)\s*\)/g,
    (_m, fn, inner) => wrapInlineIfNeeded(`\\${fn}(${inner})`)
  );

  // 3) simple exponents x^2 or (x+1)^3 -> ^{...}
  //    - If RHS is a single token/number, brace it.
  out = out.replace(
    /(\w|\)|\])\^(\w)/g,
    (_m, base, power) => wrapInlineIfNeeded(`${base}^{${power}}`)
  );

  // 4) simple standalone a/b with small integers -> \frac{a}{b}
  out = out.replace(
    /\b(\d{1,3})\s*\/\s*(\d{1,3})\b/g,
    (_m, a, b) => wrapInlineIfNeeded(`\\frac{${a}}{${b}}`)
  );

  // 5) common greek names -> \alpha etc. (only if not already escaped)
  out = out.replace(
    /\b(alpha|beta|theta|lambda|pi|Delta)\b/g,
    (_m, name) => wrapInlineIfNeeded(`\\${name}`)
  );

  // 6) inequalities
  out = out
    .replace(/\s<=\s/g, () => wrapInlineIfNeeded(`\\le`))
    .replace(/\s>=\s/g, () => wrapInlineIfNeeded(`\\ge`))
    .replace(/\sto\s/g, () => wrapInlineIfNeeded(`\\to`));

  // Avoid nested \( \(x\) \) from repeated passes
  out = out.replace(/\\\(\s*\\\((.*?)\\\)\s*\\\)/g, (_m, inner) => `\\(${inner}\\)`);

  return out;
}

/* -------------------------------- Component ------------------------------- */

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

  // State for floating keyboard visibility
  const [showMathPad, setShowMathPad] = useState(false);

  // math keyboard target
  const [padTarget, setPadTarget] = useState<PadTarget | null>(null);

  // Refs for caret placement
  const questionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const answerRefs = useRef<(HTMLInputElement | null)[][]>([]);

  /* ----------------------------- Mutators (UI) ---------------------------- */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", time_limit: 30, points: 1000, answers: freshAnswers() },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (padTarget && padTarget.qIndex === index) setPadTarget(null);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateAnswer = (qIndex: number, aIndex: number, field: keyof Answer, value: any) => {
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
      q.answers = q.answers.map((ans, i) => ({ ...ans, is_correct: i === aIndex }));
      next[qIndex] = q;
      return next;
    });
  };

  /* -------------------------- Keyboard insert logic ----------------------- */

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
      else inserted = `\\(${snippet}\\)`; // auto-wrap LaTeX

      const newText = before + inserted + after;

      // Smart caret placement
      const basePos = before.length;
      let caretPos = basePos + inserted.length;
      const searchTarget = inserted.startsWith("\\(")
        ? inserted.slice(2, -2)
        : inserted;
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

  /* ---------------------------- Smart formatting -------------------------- */

  // Apply “smartFormat” when a field loses focus (auto-LaTeX).
  const onBlurFormatQuestion = (qIndex: number) => {
    const current = questions[qIndex].question;
    const next = smartFormat(current);
    if (next !== current) updateQuestion(qIndex, "question", next);
  };

  const onBlurFormatAnswer = (qIndex: number, aIndex: number) => {
    const current = questions[qIndex].answers[aIndex].answer;
    const next = smartFormat(current);
    if (next !== current) updateAnswer(qIndex, aIndex, "answer", next);
  };

  /* ------------------------------- Validation ----------------------------- */

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
      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount !== 1) return `Question ${i + 1} must have exactly one correct answer.`;
    }
    return null;
  };

  /* ------------------------------- Submit --------------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reason = validate();
    if (reason) return alert(reason);
    if (!user?.id) return alert("You must be signed in to create a quiz.");

    setSaving(true);
    let quizId: string | null = null;

    try {
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .insert({ title, description, created_by: user.id })
        .select("*")
        .single();

      if (quizErr || !quiz) throw quizErr || new Error("Failed to insert quiz.");
      quizId = quiz.id;

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
      console.error("Error creating quiz:", err);
      if (quizId) await supabase.from("quizzes").delete().eq("id", quizId);
      alert(err?.message ?? "Something went wrong creating the quiz.");
    } finally {
      setSaving(false);
    }
  };

  // Live preview text for the focused field
  const previewText = (() => {
    if (!padTarget) return "";
    if (padTarget.type === "question") return questions[padTarget.qIndex]?.question ?? "";
    return questions[padTarget.qIndex]?.answers?.[padTarget.aIndex]?.answer ?? "";
  })();

  /* --------------------------------- UI ----------------------------------- */

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Quiz meta */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Create New Quiz
            </h1>
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

          {/* Always-visible math tools */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="text-[11px] sm:text-xs text-gray-500">
              Tip: click any question or answer first, then insert symbols below. Blur (tap away) to auto-format.
            </div>

            {/* Live LaTeX preview */}
            <div className="rounded-md bg-gray-50 border px-3 py-2">
              <div className="text-[11px] sm:text-xs text-gray-500 mb-1">Live Preview</div>
              <MathJax dynamic>
                {previewText && previewText.trim() !== ""
                  ? previewText
                  : "\\(\\text{(empty)}\\)"}
              </MathJax>
            </div>
          </div>

          {/* Questions */}
          {questions.map((q, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.04 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-semibold">Question {qIndex + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

           {/* ===== TEACHER / EDITOR VIEW ===== */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Question {qIndex + 1}
  </label>

  {/* Editable Textarea */}
  <textarea
    ref={(el) => (questionRefs.current[qIndex] = el)}
    onFocus={() => setPadTarget({ type: "question", qIndex })}
    onBlur={() => onBlurFormatQuestion(qIndex)}
    required
    value={q.question}
    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
    className="w-full rounded-md border-gray-300 shadow-sm 
               focus:border-indigo-500 focus:ring-indigo-500
               caret-black resize-none font-mono px-3 py-2"
    rows={2}
    placeholder="Type your question here (LaTeX supported)"
  />

  {/* Live MathJax Preview */}
  {q.question.trim() && (
    <div className="mt-2 p-2 bg-gray-50 border rounded-md">
      <MathJax dynamic>{q.question}</MathJax>
    </div>
  )}
</div>

{/* Time & Points */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Time Limit (sec)
    </label>
    <input
      type="number"
      min={5}
      max={600}
      required
      value={q.time_limit}
      onChange={(e) =>
        updateQuestion(qIndex, "time_limit", parseInt(e.target.value || "0", 10))
      }
      className="w-full rounded-md border-gray-300 shadow-sm 
                 focus:border-indigo-500 focus:ring-indigo-500 font-mono px-3 py-2"
      placeholder="Time Limit"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Points
    </label>
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
      className="w-full rounded-md border-gray-300 shadow-sm 
                 focus:border-indigo-500 focus:ring-indigo-500 font-mono px-3 py-2"
      placeholder="Points"
    />
  </div>
</div>

{/* ANSWERS with live render */}
<div className="space-y-4">
  {q.answers.map((a, aIndex) => (
    <div key={aIndex} className="flex items-start gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Answer {aIndex + 1}
        </label>

        {/* Editable Input */}
        <input
          ref={(el) => {
            if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
            answerRefs.current[qIndex][aIndex] = el;
          }}
          onFocus={() => setPadTarget({ type: "answer", qIndex, aIndex })}
          onBlur={() => onBlurFormatAnswer(qIndex, aIndex)}
          type="text"
          required
          value={a.answer}
          onChange={(e) =>
            updateAnswer(qIndex, aIndex, "answer", e.target.value)
          }
          className="w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-indigo-500 focus:ring-indigo-500 
                     caret-black font-mono px-3 py-2"
          placeholder="Type answer (LaTeX supported)"
        />

        {/* Live MathJax Preview */}
        {a.answer.trim() && (
          <div className="mt-1 p-2 bg-gray-50 border rounded-md">
            <MathJax dynamic>{a.answer}</MathJax>
          </div>
        )}
      </div>

      {/* Correct Answer Selector */}
      <label className="flex items-center gap-2 text-sm mt-7">
        <input
          type="radio"
          name={`correct-${qIndex}`}
          checked={a.is_correct}
          onChange={() => setCorrectAnswer(qIndex, aIndex)}
          className="text-indigo-600 focus:ring-indigo-500"
        />
        <span>Correct</span>
      </label>
    </div>
  ))}
</div>

{/* ===== STUDENT VIEW ===== */}
{/* Rendered question */}
<div className="mb-4 text-lg font-mono">
  <MathJax dynamic>{q.question}</MathJax>
</div>

{/* Rendered answers */}
<ul className="space-y-2">
  {q.answers.map((a, idx) => (
    <li
  key={idx}
  className="p-2 border rounded-md"
>
  <MathJax dynamic>{a.answer}</MathJax>
</li>

  ))}
</ul>





            </motion.div>
          ))}

          {/* Footer buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  // Format all fields in one go
                  setQuestions((prev) =>
                    prev.map((q) => ({
                      ...q,
                      question: smartFormat(q.question),
                      answers: q.answers.map((a) => ({
                        ...a,
                        answer: smartFormat(a.answer),
                      })),
                    }))
                  );
                }}
                className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition"
              >
                Format all math
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? "Saving..." : "Save Quiz"}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* The floating button to open the math pad */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        type="button"
        // 1. Toggle the visibility of the math pad on click
        onClick={() => setShowMathPad(!showMathPad)}
        className="sticky bottom-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Toggle Math Keyboard"
      >
        <Keyboard className="h-6 w-6" />
      </motion.button>

      {/* Conditionally render the portable Math Pad */}
      {showMathPad && (
        <MathSymbolPad
          onInsert={insertFromPad}
          // 2. The onClose handler now only toggles the state
          onClose={() => setShowMathPad(false)}
          onPreventFocusLoss={(e) => e.preventDefault()}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3">
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Quiz Created Successfully!
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Your quiz was saved with all questions and answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
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
                    { question: "", time_limit: 30, points: 1000, answers: freshAnswers() },
                  ]);
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