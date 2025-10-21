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
  // Renamed 'identification' label for clarity in UI, but kept the value for logic.
  question_type: "multiple_choice" | "true_false" | "identification" | "matching" | "checkboxes"; 
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
  //    - If RHS is a single token/number, brace it.
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

// Helper to create a list of fresh answers
const freshAnswers = () => [
  { answer: "", is_correct: false },
  { answer: "", is_correct: false },
  { answer: "", is_correct: false },
  { answer: "", is_correct: false },
];

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

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_type: "multiple_choice", // ✅ default type
        question: "",
        time_limit: 30,
        points: 1000,
        answers: freshAnswers(),
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
      // If question type changes, reset answers for the new type.
      if (field === 'question_type') {
        let newAnswers: Answer[] = [];
        let newMatches: string[] = [];

        // Retain answers for types that use them similarly
        if (value === "multiple_choice" || value === "true_false" || value === "checkboxes") {
          // If moving from another choice-based, try to keep existing, otherwise use fresh
          newAnswers = prev[index].answers.length > 0 ? prev[index].answers.map(a => ({ ...a, is_correct: value === "multiple_choice" || value === "true_false" ? false : a.is_correct })) : freshAnswers();
          if (value === "true_false") newAnswers = [{ answer: "True", is_correct: false }, { answer: "False", is_correct: false }];

        } else if (value === "identification") { // Identification: start with one empty answer marked as correct
          newAnswers = [{ answer: "", is_correct: true }];

        } else if (value === "matching") {
          // Reset answers for matching, they become left-side options
          newAnswers = prev[index].answers.map(a => ({ ...a, is_correct: false }));
          // Retain matches if available, otherwise start fresh
          newMatches = prev[index].matches || ["", "", ""];
        }
        
        // Update the question object
        next[index] = { 
          ...next[index], 
          [field]: value, 
          answers: newAnswers,
          matches: newMatches,
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      
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
      // Multiple choice/True-False: only one can be correct
      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
         q.answers = q.answers.map((ans, i) => ({ ...ans, is_correct: i === aIndex }));
      } else if (q.question_type === 'identification') {
         // Identification: all answers are implicitly correct variants
         q.answers = q.answers.map((ans, i) => ({ ...ans, is_correct: true }));
      }
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
      // If adding for identification, the new answer is also marked as correct by default.
      const isIdentification = q.question_type === 'identification';
      q.answers = [...q.answers, { answer: "", is_correct: isIdentification || false }];
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

    // Validation by question type
    if (q.question_type === "multiple_choice") {
      if (!q.answers || q.answers.length < 2)
        return `Question ${i + 1} must have at least 2 answer choices.`;

      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount !== 1)
        return `Question ${i + 1} must have exactly one correct answer.`;

    } else if (q.question_type === "true_false") {
      if (q.answers.length !== 2)
        return `Question ${i + 1} must have 2 answers (True and False).`;

      const correctCount = q.answers.filter((a) => a.is_correct).length;
      if (correctCount !== 1)
        return `Question ${i + 1} must have exactly one correct answer.`;

    } else if (q.question_type === "identification") { 
      // SHORT ANSWER: Must have at least one possible answer set.
      const hasAnswers = q.answers && q.answers.length > 0 && q.answers.some(a => a.answer.trim() !== "");
      if (!hasAnswers)
        return `Question ${i + 1} (Short Answer) must have at least one possible correct answer.`;

      // SHORT ANSWER: Ensure all defined answers are non-empty
      const emptyAnswer = q.answers.some(a => a.answer.trim() === "" && q.answers.length > 1);
      if (emptyAnswer)
        return `Question ${i + 1} (Short Answer): All defined possible answers must be non-empty.`;
        
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
          question_type: q.question_type, 
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
            side: "left", 
            match_index: i, 
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
            side: "right", 
          }));
          const { error: rightErr } = await supabase.from("answers").insert(rightRows);
          if (rightErr) throw rightErr;
        }


      } else if (q.question_type === "identification") { // SHORT ANSWER: Handle identification answers
        // All identification answers are considered correct variants
        const answersRows = q.answers
          .filter(a => a.answer.trim() !== "") // only save non-empty answers
          .map((a) => ({
            question_id: qRow.id,
            answer: a.answer,
            is_correct: true, // All possible correct answers are marked as true
          }));

        if (answersRows.length > 0) {
          const { error: aErr } = await supabase.from("answers").insert(answersRows);
          if (aErr) throw aErr;
        }

      } else if (q.answers.length > 0) { // Multiple choice, true/false, or checkbox types
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
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  Question {qIndex + 1}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQuestionAfter(qIndex)}
                    className="text-indigo-600 hover:text-indigo-700 p-1" // Changed to indigo for consistency
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
                  {/* 🚨 Updated Label: 'Identification' is now 'Short Answer' for clarity */}
                  <option value="identification">Identification</option> 
                  <option value="matching">Matching</option>
                  <option value="checkboxes">Checkboxes (multiple correct)</option>
                </select>
              </div>

              {/* Question textarea */}
              <div className="mb-6 border p-3 rounded-lg bg-gray-50 border-gray-200"> {/* Design enhancement */}
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Question {qIndex + 1} Content
                  {/* ✅ Keyboard Icon: KEPT for Question Input */}
                  <button
                    type="button"
                    onClick={() => {
                        if (questionRefs.current[qIndex]) questionRefs.current[qIndex]?.focus();
                        setPadTarget({ type: "question", qIndex });
                        setShowMathPad(true);
                    }}
                    title="Show Math Pad for this question"
                    className="ml-2 p-1 rounded-full text-indigo-600 hover:bg-indigo-50 transition bg-white" // Design enhancement
                  >
                    <Keyboard className="h-5 w-5 inline-block" />
                  </button>
                </label>
                <textarea
                  ref={(el) => (questionRefs.current[qIndex] = el)}
                  onFocus={() => { setPadTarget({ type: "question", qIndex }); }} 
                  onBlur={() => onBlurFormatQuestion(qIndex)}
                  required
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500
                            caret-black resize-none font-mono px-3 py-2 mt-1"
                  rows={2}
                  placeholder="Type your question here (LaTeX supported)"
                />
                {/* ✅ Question Preview: KEPT */}
                {q.question.trim() && (
                  <div className="mt-2 p-2 bg-white border border-dashed border-indigo-300 rounded-md text-sm">
                    <p className="font-semibold text-indigo-700 mb-1">Preview:</p>
                    <MathJax dynamic>{q.question}</MathJax>
                  </div>
                )}
              </div>

              {/* Time & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-3 border rounded-lg bg-white shadow-inner"> {/* Design enhancement */}
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
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50"> {/* Design enhancement */}
                  <h3 className="font-semibold text-gray-700">Answer Choices (Select One Correct)</h3>
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="flex items-start gap-3 bg-white p-3 rounded-md border"> {/* Design enhancement */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer {aIndex + 1}
                        </label>
                        <input
                          ref={(el) => {
                            if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
                            answerRefs.current[qIndex][aIndex] = el;
                          }}
                          onFocus={() => { setPadTarget({ type: "answer", qIndex, aIndex }); }}
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
                      </div>

                      <label className="flex flex-col items-center gap-1 text-xs mt-1"> {/* Design enhancement */}
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={a.is_correct}
                          onChange={() => setCorrectAnswer(qIndex, aIndex)}
                          className="text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                        />
                        <span>Correct</span>
                      </label>

                      {/* Delete answer */}
                      <button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        className="mt-1 text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add answer button */}
                  <button
                    type="button"
                    onClick={() => addAnswerChoice(qIndex)}
                    className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another choice</span>
                  </button>

                  {/* ✅ Student Preview: KEPT */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Student Preview:
                    </p>
                    <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                      <p className="font-semibold text-gray-900 mb-2">
                          <MathJax dynamic>{q.question}</MathJax>
                      </p>
                      {q.answers.filter(a => a.answer.trim() !== "").map((a, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <input type="radio" disabled className="text-indigo-600" />
                            <span className="text-gray-800">
                                <MathJax dynamic>{a.answer || `(Option ${aIndex + 1})`}</MathJax>
                            </span>
                          </div>
                      ))}
                      {q.answers.filter(a => a.answer.trim() === "").length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">({q.answers.filter(a => a.answer.trim() === "").length} empty option(s) hidden in preview)</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Checkboxes type: multiple options can be correct */}
              {(q as any).question_type === "checkboxes" && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50"> {/* Design enhancement */}
                   <h3 className="font-semibold text-gray-700">Answer Options (Select One or More Correct)</h3>
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="flex items-start gap-3 bg-white p-3 rounded-md border"> {/* Design enhancement */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option {aIndex + 1}
                        </label>
                        <input
                          ref={(el) => {
                            if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
                            answerRefs.current[qIndex][aIndex] = el;
                          }}
                          onFocus={() => { setPadTarget({ type: "answer", qIndex, aIndex }); }}
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
                          placeholder="Type your option here"
                        />
                      </div>

                      <label className="flex flex-col items-center gap-1 text-xs mt-1"> {/* Design enhancement */}
                        <input
                          type="checkbox"
                          name={`correct-${qIndex}-${aIndex}`}
                          checked={a.is_correct}
                          onChange={() => toggleCheckboxCorrect(qIndex, aIndex)}
                          className="text-indigo-600 focus:ring-indigo-500 rounded h-5 w-5"
                        />
                        <span>Correct</span>
                      </label>

                      {/* Delete option */}
                      <button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        className="mt-1 text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add option button */}
                  <button
                    type="button"
                    onClick={() => addAnswerChoice(qIndex)}
                    className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another option</span>
                  </button>

                  {/* ✅ Student Preview: KEPT */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Student Preview:
                    </p>
                    <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                       <p className="font-semibold text-gray-900 mb-2">
                          <MathJax dynamic>{q.question}</MathJax>
                      </p>
                      {q.answers.filter(a => a.answer.trim() !== "").map((a, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <input type="checkbox" disabled className="text-indigo-600 rounded" />
                            <span className="text-gray-800">
                                <MathJax dynamic>{a.answer || `(Option ${aIndex + 1})`}</MathJax>
                            </span>
                          </div>
                      ))}
                      {q.answers.filter(a => a.answer.trim() === "").length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">({q.answers.filter(a => a.answer.trim() === "").length} empty option(s) hidden in preview)</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* True or False type: fixed options, single correct */}
              {(q as any).question_type === "true_false" && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50"> {/* Design enhancement */}
                   <h3 className="font-semibold text-gray-700">Set Correct Answer</h3>
                  <p className="text-sm text-gray-700">Select the correct answer:</p>
                  {q.answers.slice(0, 2).map((a, aIndex) => (
                    <div key={aIndex} className={`flex items-center gap-3 p-3 rounded-md border ${a.is_correct ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}> {/* Design enhancement */}
                      <label className="flex items-center gap-3 text-base">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={a.is_correct}
                          onChange={() => setCorrectAnswer(qIndex, aIndex)}
                          className="text-green-600 focus:ring-green-500" // Changed to green
                        />
                        <span>{a.answer}</span>
                      </label>
                    </div>
                  ))}
                  {/* ✅ Student Preview: KEPT */}
                  <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Student Preview:
                      </p>
                      <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                         <p className="font-semibold text-gray-900 mb-2">
                            <MathJax dynamic>{q.question}</MathJax>
                        </p>
                        <div className="flex gap-4">
                          {q.answers.slice(0, 2).map((a, aIndex) => (
                            <div key={aIndex} className="flex items-center gap-2">
                              <input type="radio" disabled className="text-indigo-600" />
                              <span className="text-gray-800">{a.answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </div>
              )}

              {/* IDENTIFICATION type: multiple correct variants, case-insensitive check */}
              {(q as any).question_type === "identification" && (
                <div className="space-y-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200"> {/* Design enhancement for Short Answer */}
                   <h3 className="font-semibold text-yellow-800">Short Answer Settings</h3>
                  <p className="text-sm font-medium text-gray-700">
                    Set **all** possible correct answer variations (case-insensitive check is applied during scoring):
                  </p>
                  <div className="mt-2 text-sm text-yellow-700 p-2 border-l-4 border-yellow-500 bg-white rounded-md"> {/* Design enhancement */}
                    <p className="font-semibold">Tip:</p>
                    <p>Enter the exact word(s) students should use (e.g., "Jupiter," "jupiter," or "JUPITER" if all are valid). Spaces and casing are ignored in the check.</p>
                  </div>
                  
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="flex items-center gap-3 bg-white p-3 rounded-md border border-yellow-300"> {/* Design enhancement */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Variant {aIndex + 1}
                           {/* 🛑 Keyboard Icon: REMOVED from the Short Answer inputs */}
                        </label>
                        <input
                          ref={(el) => {
                            if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
                            answerRefs.current[qIndex][aIndex] = el;
                          }}
                          // 🛑 onFocus: Only sets target, does NOT show pad
                          onFocus={() => { setPadTarget({ type: "answer", qIndex, aIndex }); }}
                          onBlur={() => onBlurFormatAnswer(qIndex, aIndex)}
                          type="text"
                          required={q.answers.length === 1} // Require if it's the only one
                          value={a.answer}
                          onChange={(e) =>
                            updateAnswer(qIndex, aIndex, "answer", e.target.value)
                          }
                          className="w-full rounded-md border-yellow-500 shadow-sm 
                                    focus:border-yellow-700 focus:ring-yellow-700 
                                    caret-black font-mono px-3 py-2 border-2" // Design enhancement
                          placeholder="e.g., Photosynthesis"
                        />
                      </div>
                      
                      {/* Delete answer (prevent deleting the only one if non-empty) */}
                      <button
                        type="button"
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        disabled={q.answers.length === 1 && a.answer.trim() === ""}
                        className={`text-gray-400 hover:text-red-600 p-1 mt-1 ${q.answers.length === 1 && a.answer.trim() === "" ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add answer button */}
                  <button
                    type="button"
                    onClick={() => addAnswerChoice(qIndex)}
                    className="mt-2 flex items-center gap-1 text-yellow-600 hover:text-yellow-800 text-sm font-medium" // Design enhancement
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another correct variant</span>
                  </button>
                  
                  {/* ✅ Student Preview: KEPT */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Student Preview:
                    </p>
                    <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                        <p className="font-semibold text-gray-900 mb-2">
                            <MathJax dynamic>{q.question}</MathJax>
                        </p>
                        <div className="relative">
                          <input type="text" disabled className="w-full border-b border-gray-400 bg-transparent py-1 px-0 focus:outline-none focus:border-indigo-500" placeholder="Type your answer here..." />
                          <span className="absolute right-0 bottom-0 text-xs text-gray-500">(Student Answer)</span>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matching type: left/right columns */}
              {(q as any).question_type === "matching" && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50"> {/* Design enhancement */}
                  <h3 className="font-semibold text-gray-700">Matching Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Design enhancement */}
                    <div className="space-y-3 p-3 bg-white rounded-md border"> {/* Design enhancement */}
                      <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Left Column (Items to Match)</h4>
                      {q.answers.map((a, aIndex) => (
                        <div key={aIndex} className="flex items-center gap-2">
                          <span className="p-2 bg-indigo-100 text-indigo-800 rounded-md text-xs font-mono flex-shrink-0">{String.fromCharCode(65 + aIndex)}</span>
                          <div className="flex-1">
                             <label className="sr-only">Left Item {aIndex + 1}</label>
                            <input
                              ref={(el) => {
                                if (!answerRefs.current[qIndex]) answerRefs.current[qIndex] = [];
                                answerRefs.current[qIndex][aIndex] = el;
                              }}
                              onFocus={() => { setPadTarget({ type: "answer", qIndex, aIndex }); }}
                              onBlur={() => onBlurFormatAnswer(qIndex, aIndex)}
                              type="text"
                              required
                              value={a.answer}
                              onChange={(e) => updateAnswer(qIndex, aIndex, "answer", e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono px-3 py-2"
                              placeholder="Left Item"
                            />
                          </div>
                          <button type="button" onClick={() => removeAnswer(qIndex, aIndex)} className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addAnswerChoice(qIndex)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-3">
                        <Plus className="h-4 w-4" />
                        <span>Add Left Item</span>
                      </button>
                    </div>

                    <div className="space-y-3 p-3 bg-white rounded-md border"> {/* Design enhancement */}
                      <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Right Column (Match Options - Draggable)</h4>
                      {(q.matches || []).map((m, mIndex) => (
                        <div
                          key={mIndex}
                          className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition" // Design enhancement
                          draggable
                          onDragStart={(e) => onMatchDragStart(qIndex, mIndex, e)}
                          onDragOver={onMatchDragOver}
                          onDrop={(e) => onMatchDrop(qIndex, mIndex, e)}
                        >
                          <div className="w-5 h-5 flex-shrink-0 cursor-move text-gray-400 hover:text-gray-700 flex items-center justify-center">
                            &#x2261;
                          </div>
                          <div className="flex-1">
                            <label className="sr-only">Right Option {mIndex + 1}</label>
                            <input
                              ref={(el) => {
                                if (!matchRefs.current[qIndex]) matchRefs.current[qIndex] = [];
                                matchRefs.current[qIndex][mIndex] = el;
                              }}
                              onFocus={() => { setPadTarget({ type: "match", qIndex, mIndex }); }}
                              onBlur={() => onBlurFormatMatch(qIndex, mIndex)}
                              type="text"
                              required
                              value={m}
                              onChange={(e) => updateMatchOption(qIndex, mIndex, e.target.value)}
                              className="w-full border-none focus:ring-0 focus:outline-none font-mono text-sm"
                              placeholder="Right Option"
                            />
                          </div>
                          <button type="button" onClick={() => removeMatchOption(qIndex, mIndex)} className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addMatchOption(qIndex)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-3">
                        <Plus className="h-4 w-4" />
                        <span>Add Right Option</span>
                      </button>
                    </div>
                  </div>
                  {/* ✅ Student Preview: KEPT */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Student Preview:
                    </p>
                    <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                        <p className="font-semibold text-gray-900 mb-2">
                            <MathJax dynamic>{q.question}</MathJax>
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {q.answers.map((a, aIndex) => (
                                <div key={aIndex} className="p-2 border border-gray-300 bg-white rounded flex items-center gap-2">
                                    <span className="font-semibold text-indigo-800 text-sm">{String.fromCharCode(65 + aIndex)}.</span>
                                    <MathJax dynamic>{a.answer || `(Left Item ${aIndex + 1})`}</MathJax>
                                </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            {(q.matches || []).map((m, mIndex) => (
                                <div key={mIndex} className="p-2 border border-gray-300 bg-white rounded flex items-center gap-2">
                                    <select disabled className="border-gray-300 rounded-md py-0 text-sm">
                                      <option value="">A-Z</option>
                                    </select>
                                    <MathJax dynamic>{m || `(Right Option ${mIndex + 1})`}</MathJax>
                                </div>
                            ))}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
        
        {/* Save/Add Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center">
            
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-3" />
              {saving ? "Saving Quiz..." : "Save Quiz"}
            </button>
          
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
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Created! 🎉</h3>
          <p className="text-gray-700 mb-6">Your new quiz {title} has been successfully saved.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate(`/quiz/${createdQuizId}/edit`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
            >
              View/Edit Quiz
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}

export default CreateQuiz;