import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Keyboard } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import MathSymbolPad from "../components/MathSymbolPad";
import { MathJax } from "better-react-mathjax";
import { BlockMath } from "react-katex"

/* ----------------------------- Types & helpers ---------------------------- */

interface Answer {
  answer: string;
  is_correct: boolean;
  id?: string;
}

interface Question {
  id?: string;
  question: string;
  question_type: "multiple_choice" | "true_false" | "paragraph" | "matching" | "checkboxes";
  time_limit: number;
  points: number;
  answers: Answer[];
  matches?: string[]; // right‑side options for matching questions
}

type PadTarget =
  | { type: "question"; qIndex: number }
  | { type: "answer"; qIndex: number; aIndex: number }
  | { type: "match"; qIndex: number; mIndex: number };

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
    {
      question: "",
      question_type: "multiple_choice", // default to multiple choice
      time_limit: 30,
      points: 1000,
      answers: freshAnswers(),
    },
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
  // refs for match (right-side) inputs
  const matchRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // guard to prevent double-add of answers per question (debounce-like)
  const answerAddGuard = useRef<Record<number, boolean>>({});

  // Sync refs when questions change
  useEffect(() => {
    questionRefs.current = questions.map(() => null);
    answerRefs.current = questions.map((q) => Array(q.answers.length).fill(null));
    matchRefs.current = questions.map((q) => Array((q.matches || []).length).fill(null));
  }, [questions.length]);

  /* ----------------------------- Mutators (UI) ---------------------------- */
  const [leftItems, setLeftItems] = useState<string[]>([""]);
  const [rightItems, setRightItems] = useState<string[]>([""]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_type: "multiple_choice", // ✅ default type
        question: "",
        time_limit: 30,
        points: 1000,
        answers: [
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
        ],
        matches: [], // new for matching type
      },
    ]);
  };

  // Insert a new question right after the given index
  const addQuestionAfter = (index: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, {
        question_type: "multiple_choice",
        question: "",
        time_limit: 30,
        points: 1000,
        answers: freshAnswers(),
        matches: [],
      });
      return next;
    });
    // ensure padTarget doesn't point to removed/out-of-range item
    setPadTarget(null);
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

  // toggle correctness for checkbox-type questions (allow multiple correct)
  const toggleCheckboxCorrect = (qIndex: number, aIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = q.answers.map((ans, i) =>
        i === aIndex ? { ...ans, is_correct: !ans.is_correct } : ans
      );
      next[qIndex] = q;
      return next;
    });
  };

  // safe add answer that prevents double insertion from rapid clicks/events
  const addAnswerChoice = (qIndex: number) => {
    if (answerAddGuard.current[qIndex]) return;
    answerAddGuard.current[qIndex] = true;

    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = [...q.answers, { answer: "", is_correct: false }];
      next[qIndex] = q;
      return next;
    });

    // release guard shortly after to allow subsequent legitimate adds
    setTimeout(() => {
      answerAddGuard.current[qIndex] = false;
    }, 300);
  };

  // safe removeAnswer helper (immutable, updates padTarget)
  const removeAnswer = (qIndex: number, aIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, answers: q.answers.filter((_, j) => j !== aIndex) } : q
      )
    );

    // adjust or clear padTarget if it referenced the removed answer
    setPadTarget((pt) => {
      if (!pt || pt.type !== "answer" || pt.qIndex !== qIndex) return pt;
      if (pt.aIndex === aIndex) return null;
      if (pt.aIndex > aIndex) return { type: "answer", qIndex, aIndex: pt.aIndex - 1 };
      return pt;
    });
  };

  const updateMatchOption = (qIndex: number, mIndex: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.matches = [...(q.matches || [])];
      q.matches[mIndex] = value;
      next[qIndex] = q;
      return next;
    });
  };

  const addMatchOption = (qIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.matches = [...(q.matches || []), ""];
      next[qIndex] = q;
      return next;
    });
  };

  const removeMatchOption = (qIndex: number, mIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, matches: (q.matches || []).filter((_, j) => j !== mIndex) } : q
      )
    );
  };

  // drag ref for reordering match options (right-side)
  const matchDragRef = useRef<{ qIndex: number; mIndex: number } | null>(null);

  const onMatchDragStart = (qIndex: number, mIndex: number, e: React.DragEvent) => {
    matchDragRef.current = { qIndex, mIndex };
    try { e.dataTransfer!.setData("text/plain", `${mIndex}`); } catch {}
    e.dataTransfer!.effectAllowed = "move";
  };

  const onMatchDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer!.dropEffect = "move";
  };

  const onMatchDrop = (qIndex: number, destIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    const src = matchDragRef.current;
    if (!src) return;
    if (src.qIndex !== qIndex) {
      matchDragRef.current = null;
      return; // don't allow cross-question drops
    }
    if (src.mIndex === destIndex) {
      matchDragRef.current = null;
      return;
    }

    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const arr = [...(q.matches || [])];
      const [item] = arr.splice(src.mIndex, 1);
      arr.splice(destIndex, 0, item);
      q.matches = arr;
      next[qIndex] = q;
      return next;
    });

    matchDragRef.current = null;
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
    } else if (padTarget.type === "answer") {
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
    } else if (padTarget.type === "match") {
      const { qIndex, mIndex } = padTarget;
      if (!matchRefs.current[qIndex]) matchRefs.current[qIndex] = [];
      const el = matchRefs.current[qIndex][mIndex];
      const current = (questions[qIndex].matches || [])[mIndex] ?? "";
      const selStart = el?.selectionStart ?? current.length;
      const selEnd = el?.selectionEnd ?? selStart;
      const alreadyInMath = isInsideInlineMath(current, selStart);

      const { newText, caretPos } = insertIntoText({
        text: current,
        selStart,
        selEnd,
        alreadyInMath,
      });

      // update matches array immutably
      setQuestions((prev) => {
        const next = [...prev];
        const q = { ...next[qIndex] };
        q.matches = [...(q.matches || [])];
        q.matches[mIndex] = newText;
        next[qIndex] = q;
        return next;
      });

      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(caretPos, caretPos);
      });
    } else {
      // fallback safety
      alert("Unsupported pad target.");
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

  // format match (right-side) entries on blur the same way as answers
  const onBlurFormatMatch = (qIndex: number, mIndex: number) => {
    const current = (questions[qIndex].matches || [])[mIndex] ?? "";
    const next = smartFormat(current);
    if (next !== current) updateMatchOption(qIndex, mIndex, next);
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

    // ✅ Validation by question type
    if (q.question_type === "multiple_choice") {
      // ❗ Allow any number of answers (at least 2)
      if (!q.answers || q.answers.length < 2)
        return `Question ${i + 1} must have at least 2 answer choices.`;

      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount !== 1)
        return `Question ${i + 1} must have exactly one correct answer.`;

    } else if (q.question_type === "true_false") {
      // ✅ True/False still exactly 2 choices
      if (q.answers.length !== 2)
        return `Question ${i + 1} must have 2 answers (True and False).`;

      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount !== 1)
        return `Question ${i + 1} must have exactly one correct answer.`;

    } else if (q.question_type === "paragraph") {
      // ✅ Paragraph shouldn't have predefined choices
      if (q.answers && q.answers.length > 0) {
        console.warn(`Question ${i + 1} is paragraph type and should not have answer choices.`);
      }
    } else if (q.question_type === "matching") {
      if (!q.answers || q.answers.length < 1) return `Question ${i + 1} must have at least 1 left item.`;
      if (!q.matches || q.matches.length < 1) return `Question ${i + 1} must have at least 1 right option.`;
    } else if (q.question_type === "checkboxes") {
      if (!q.answers || q.answers.length < 1) return `Question ${i + 1} must have at least 1 option.`;
      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount < 1) return `Question ${i + 1} must have at least one correct option.`;
    }
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
    // 1️⃣ Insert quiz record
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .insert({ title, description, created_by: user.id })
      .select("*")
      .single();

    if (quizErr || !quiz) throw quizErr || new Error("Failed to insert quiz.");
    quizId = quiz.id;

    // 2️⃣ Insert all questions
    for (const q of questions) {
      const { data: qRow, error: qErr } = await supabase
        .from("questions")
        .insert({
          quiz_id: quizId,
          question: q.question,
          time_limit: q.time_limit,
          points: q.points,
          question_type: q.question_type, // ✅ Save question type
        })
        .select("*")
        .single();

      if (qErr || !qRow) throw qErr || new Error("Failed to insert question.");

      // 3️⃣ Handle all answer types
      if (q.question_type === "matching") {
  // Left items (questions)
  if (q.answers.length > 0) {
    const leftRows = q.answers.map((a, i) => ({
      question_id: qRow.id,
      answer: a.answer,
      is_correct: false,
      side: "left", // optional column in DB
      match_index: i, // ✅ this line ensures scoring works
    }));
    const { error: leftErr } = await supabase.from("answers").insert(leftRows);
    if (leftErr) throw leftErr;
  }

  // Right items (answers)
  if (q.matches?.length) {
    const rightRows = q.matches.map((m) => ({
      question_id: qRow.id,
      answer: m,
      is_correct: false,
      side: "right", // optional column in DB
    }));
    const { error: rightErr } = await supabase.from("answers").insert(rightRows);
    if (rightErr) throw rightErr;
  }



      } else if (q.question_type !== "paragraph" && q.answers.length > 0) {
        // Multiple choice, true/false, or checkbox types
        const answersRows = q.answers.map((a) => ({
          question_id: qRow.id,
          answer: a.answer,
          is_correct: a.is_correct,
        }));

        const { error: aErr } = await supabase.from("answers").insert(answersRows);
        if (aErr) throw aErr;
      }
    }

    // ✅ Success
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


  /* --------------------------------- UI ----------------------------------- */

  return (
  <>
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
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

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No questions yet — click below to add one.</p>
            <button
              type="button"
              onClick={() => addQuestionAfter(0)} // or addQuestion()
              className="mt-3 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>
        ) : (
          questions.map((q, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-semibold">
                  Question {qIndex + 1}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQuestionAfter(qIndex)}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="Add question below"
                    aria-label="Add question below"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 p-1"
                    aria-label="Remove question"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Question type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={(q as any).question_type || "multiple_choice"}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question_type" as any, e.target.value)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True or False</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="matching">Matching</option>
                  <option value="checkboxes">Checkboxes (multiple correct)</option>
                </select>
              </div>

              {/* Question textarea */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question {qIndex + 1}
                </label>
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
                  placeholder="Type your question here:"
                />
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
                      updateQuestion(
                        qIndex,
                        "time_limit",
                        parseInt(e.target.value || "0", 10)
                      )
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
                      updateQuestion(
                        qIndex,
                        "points",
                        parseInt(e.target.value || "0", 10)
                      )
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-indigo-500 focus:ring-indigo-500 font-mono px-3 py-2"
                    placeholder="Points"
                  />
                </div>
              </div>

              {/* ANSWERS SECTION (depends on type) */}
              {(q as any).question_type === "multiple_choice" && (
                <div className="space-y-4">
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="flex items-start gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer {aIndex + 1}
                        </label>
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
                          placeholder="Type your answer here"
                        />
                        {a.answer.trim() && (
                          <div className="mt-1 p-2 bg-gray-50 border rounded-md">
                            <MathJax dynamic>{a.answer}</MathJax>
                          </div>
                        )}
                      </div>

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

                      {/* Delete answer */}
                      <button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        className="mt-7 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add answer button */}
                  <button
                    type="button"
                    onClick={() => addAnswerChoice(qIndex)}
                    className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another choice</span>
                  </button>
                </div>
              )}

              {/* Checkboxes type: multiple options can be correct */}
              {(q as any).question_type === "checkboxes" && (
                <div className="space-y-4">
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="flex items-start gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option {aIndex + 1}
                        </label>
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
                          placeholder="Type option text"
                        />
                        {a.answer.trim() && (
                          <div className="mt-1 p-2 bg-gray-50 border rounded-md">
                            <MathJax dynamic>{a.answer}</MathJax>
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-2 text-sm mt-7">
                        <input
                          type="checkbox"
                          checked={a.is_correct}
                          onChange={() => toggleCheckboxCorrect(qIndex, aIndex)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Correct</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        className="mt-7 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addAnswerChoice(qIndex)}
                    className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another option</span>
                  </button>
                </div>
              )}

              {/* Matching */}
              {(q as any).question_type === "matching" && (
                <div className="overflow-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left items (editable) */}
                    <div>
                      <div className="font-semibold p-2 border bg-gray-50">Left items</div>
                      <div className="mt-2 space-y-2">
                        {q.answers.map((a, ai) => (
                          <div key={ai} className="flex items-center gap-2">
                            <input
                              ref={(el) => {
                                if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
                                answerRefs.current[qIndex][ai] = el;
                              }}
                              onFocus={() => setPadTarget({ type: "answer", qIndex, aIndex: ai })}
                              onBlur={() => onBlurFormatAnswer(qIndex, ai)}
                              type="text"
                              value={a.answer}
                              onChange={(e) => updateAnswer(qIndex, ai, "answer", e.target.value)}
                              className="flex-1 rounded-md border px-2 py-1 font-mono"
                              placeholder={`Left item ${ai + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswer(qIndex, ai)}
                              className="text-gray-400 hover:text-red-600 p-1"
                              aria-label={`Remove left item ${ai + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => addAnswerChoice(qIndex)}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add left item</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right options (editable & one-column) */}
                    <div>
                      <div className="font-semibold p-2 border bg-gray-50">Right options</div>
                      <div className="mt-2 space-y-2">
                        {(q.matches || []).map((m, mi) => (
                          <div key={mi} className="flex items-center gap-2">
                            <input
                              ref={(el) => {
                                if (!matchRefs.current[qIndex]) matchRefs.current[qIndex] = [];
                                matchRefs.current[qIndex][mi] = el;
                              }}
                              onFocus={() => setPadTarget({ type: "match", qIndex, mIndex: mi })}
                              onBlur={() => onBlurFormatMatch(qIndex, mi)}
                              type="text"
                              value={m}
                              onChange={(e) => updateMatchOption(qIndex, mi, e.target.value)}
                              className="flex-1 rounded-md border px-2 py-1 font-mono"
                              placeholder={`Right option ${mi + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeMatchOption(qIndex, mi)}
                              className="text-gray-400 hover:text-red-600 p-1"
                              aria-label={`Remove right option ${mi + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => addMatchOption(qIndex)}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add right option</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* separator + preview */}
                  <div className="my-4 relative">
                    <div className="border-t border-dashed border-gray-200" />
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-sm text-gray-500">
                      Question Preview
                    </span>
                  </div>

                  {/* Preview below the inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold p-2 border bg-gray-50">Preview — Left items</div>
                      <div className="mt-2 space-y-2">
                        {q.answers.map((a, ai) => (
                          <div key={ai} className="p-2 border rounded bg-white">
                            <MathJax dynamic>{a.answer || `Left ${ai + 1}`}</MathJax>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold p-2 border bg-gray-50">Preview — Right options</div>
                      <div className="mt-2 space-y-2">
                        {(q.matches || []).map((m, mi) => (
                          <div key={mi} className="p-2 border rounded bg-white flex items-center justify-between">
                            <MathJax dynamic>{m || `Option ${mi + 1}`}</MathJax>
                            <input type="checkbox" disabled />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* True/False */}
              {(q as any).question_type === "true_false" && (
                <div className="space-y-3">
                  {["True", "False"].map((val, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`tf-${qIndex}`}
                        checked={
                          q.answers[i]?.is_correct ||
                          (!q.answers.length && val === "True")
                        }
                        onChange={() =>
                          updateQuestion(qIndex, "answers", [
                            { answer: "True", is_correct: val === "True" },
                            { answer: "False", is_correct: val === "False" },
                          ])
                        }
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Paragraph */}
              {(q as any).question_type === "paragraph" && (
                <div className="text-gray-500 italic">
                  (Students will answer this question in paragraph form.)
                </div>
              )}
            </motion.div>
          ))
        )}

        {/* Student preview */}
        <div className="student-preview bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2 text-center text-gray-700">Student Preview</h2>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 border rounded-lg">
              <div className="font-semibold mb-2 text-lg font-mono">
                Question {qIndex + 1}:
                <div className="mt-1">
                  <MathJax dynamic>{q.question || ""}</MathJax>
                </div>
              </div>

              {/* Multiple Choice (rendered) */}
              {q.question_type === "multiple_choice" && (
                <div className="flex flex-col gap-2">
                  {q.answers.map((a, aIndex) => (
                    <label
                      key={aIndex}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                    >
                      <input type="radio" name={`q-${qIndex}`} disabled />
                      <span className="font-mono">
                        <MathJax dynamic>{a.answer || `Choice ${aIndex + 1}`}</MathJax>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkboxes (rendered) */}
              {q.question_type === "checkboxes" && (
                <div className="flex flex-col gap-2">
                  {q.answers.map((a, aIndex) => (
                    <label
                      key={aIndex}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                    >
                      <input type="checkbox" name={`q-${qIndex}`} disabled />
                      <span className="font-mono">
                        <MathJax dynamic>{a.answer || `Option ${aIndex + 1}`}</MathJax>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* True / False (rendered) */}
              {q.question_type === "true_false" && (
                <div className="flex flex-col gap-2">
                  {(q.answers.length > 0 ? q.answers : [{ answer: "True" }, { answer: "False" }]).map(
                    (a, aIndex) => (
                      <label
                        key={aIndex}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                      >
                        <input type="radio" name={`q-${qIndex}`} disabled />
                        <span className="font-mono">
                          <MathJax dynamic>{a.answer}</MathJax>
                        </span>
                      </label>
                    )
                  )}
                </div>
              )}

              {/* Paragraph preview */}
              {q.question_type === "paragraph" && (
                <div className="mt-2">
                  <textarea
                    disabled
                    className="w-full border rounded p-2 mt-2 font-mono"
                    placeholder="Student answer will appear here..."
                  ></textarea>
                  <div className="mt-2 p-2 bg-gray-50 border rounded-md">
                    <MathJax dynamic>{""}</MathJax>
                  </div>
                </div>
              )}

              {/* Matching preview */}
              {q.question_type === "matching" && (
                <div className="overflow-auto mt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold p-2 border bg-gray-50">Left items</div>
                      <div className="mt-2 space-y-2">
                        {q.answers.map((a, ai) => (
                          <div key={ai} className="p-2 border rounded bg-white">
                            <MathJax dynamic>{a.answer || `Left ${ai + 1}`}</MathJax>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold p-2 border bg-gray-50">Right options</div>
                      <div className="mt-2 space-y-2">
                        {(q.matches || []).map((m, mi) => (
                          <div key={mi} className="p-2 border rounded bg-white flex items-center justify-between">
                            <MathJax dynamic>{m || `Option ${mi + 1}`}</MathJax>
                            <input type="checkbox" disabled />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-2">
                ⏱️ {q.time_limit}s | {q.points} points
              </div>
            </div>
          ))}
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
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
                  {
                    question_type: "multiple_choice",
                    question: "",
                    time_limit: 30,
                    points: 1000,
                    answers: freshAnswers(),
                    matches: [],
                  },
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

const freshAnswers = (): Answer[] =>
  Array.from({ length: 4 }, () => ({ answer: "", is_correct: false }));
