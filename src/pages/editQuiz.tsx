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
  side?: "left" | "right";
  match_index?: number | null;
}

interface EditableQuestion {
  id?: UUID;
  question: string;
  time_limit: number;
  points: number;
  question_type:
    | "multiple_choice"
    | "true_false"
    | "identification" // Changed from 'paragraph' to 'identification'
    | "matching"
    | "checkboxes"
    | string;
  answers: EditableAnswer[];
  matches?: string[];
}

type PadTarget =
  | { type: "question"; qIndex: number }
  | { type: "answer"; qIndex: number; aIndex: number }
  | { type: "match"; qIndex: number; mIndex: number };

function cleanLatex(text: string) {
  return (text || "").replace(/\\\(|\\\)/g, "");
}

// FIX: Simplified the formatting function to use \text{} within MathJax,
// preventing formatting issues with punctuation like '?'.
function formatWithText(text: string) {
    if (!text?.trim()) return "";
    
    // 1. Clean up any existing MathJax wrappers
    const cleanText = text.replace(/\\\(|\\\)|\\\[|\\\]/g, "");

    // 2. Wrap the text in the \text{} command, inside inline math delimiters
    return `\\(\\text{${cleanText.replace(/\s+/g, " ").trim()}}\\)`;
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

  const [showMathPad, setShowMathPad] = useState(false);
  const [padTarget, setPadTarget] = useState<PadTarget | null>(null);
  const currentInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // ---------- Load quiz ----------
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!quizId) return setLoading(false);
      try {
        const { data: quizRow, error: quizError } = await supabase
          .from("quizzes")
          .select("id, title, description")
          .eq("id", quizId)
          .single();
        if (quizError) throw quizError;

        const { data: qRows, error: qErr } = await supabase
          .from("questions")
          .select(`
            id,
            question,
            time_limit,
            points,
            question_type,
            answers ( id, answer, is_correct, side, match_index )
          `)
          .eq("quiz_id", quizId)
          .order("created_at", { ascending: true });

        if (qErr) throw qErr;

        const mapped: EditableQuestion[] = (qRows ?? []).map((r: any) => {
          const rawAnswers = r.answers ?? [];
          if (r.question_type === "matching") {
            const lefts = rawAnswers
              .filter((a: any) => a.side === "left")
              .map((a: any) => ({
                id: a.id,
                answer: a.answer ?? "",
                is_correct: false,
                side: "left" as const,
                match_index: a.match_index ?? null,
              }));
            const rights = rawAnswers
              .filter((a: any) => a.side === "right")
              .map((a: any) => a.answer ?? "");
            return {
              id: r.id,
              question: cleanLatex(r.question ?? ""),
              time_limit: r.time_limit ?? 30,
              points: r.points ?? 1000,
              question_type: r.question_type,
              answers: lefts,
              matches: rights,
            };
          }
          return {
            id: r.id,
            question: cleanLatex(r.question ?? ""),
            time_limit: r.time_limit ?? 30,
            points: r.points ?? 1000,
            question_type: r.question_type,
            answers: (rawAnswers ?? []).map((a: any) => ({
              id: a.id,
              answer: a.answer ?? "",
              is_correct: !!a.is_correct,
            })),
          };
        });

        if (mounted) {
          setTitle(quizRow.title ?? "");
          setDescription(quizRow.description ?? "");
          setQuestions(mapped);
          setOriginalQuestions(JSON.parse(JSON.stringify(mapped)));
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  // ---------- State Helpers ----------
  const addQuestion = useCallback(() => {
    setQuestions(prev => [
      ...prev,
      {
        question: "",
        time_limit: 30,
        points: 1000,
        question_type: "multiple_choice",
        answers: [
          { answer: "", is_correct: false },
          { answer: "", is_correct: false },
        ],
        matches: [],
      },
    ]);
  }, []);

  const removeQuestion = useCallback(
    (qIndex: number) => setQuestions(prev => prev.filter((_, i) => i !== qIndex)),
    []
  );

  const updateQuestionField = useCallback(
  (
    qIndex: number,
    field: keyof Omit<EditableQuestion, "answers" | "id">,
    value: any
  ) =>
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };

      (q as any)[field] = value;

      // 🧩 Handle automatic setups when switching types
      if (field === "question_type") {
        if (value === "true_false") {
          q.answers = [
            { answer: "True", is_correct: true },
            { answer: "False", is_correct: false },
          ] as EditableAnswer[];
        } else if (value === "multiple_choice" || value === "checkboxes") {
          if (q.answers.length < 2) {
            q.answers = [
              { answer: "", is_correct: false },
              { answer: "", is_correct: false },
            ] as EditableAnswer[];
          }
        } else if (value === "identification") {
            // For identification, ensure at least one answer slot exists, marked as correct
            if (q.answers.length < 1) {
                q.answers = [{ answer: "", is_correct: true }] as EditableAnswer[];
            } else {
                // Ensure all existing answers are marked as correct for identification
                q.answers = q.answers.map(a => ({ ...a, is_correct: true }));
            }
        } else if (value === "matching") {
          if (!q.matches) q.matches = [];
          if (q.answers.length < 2) {
              q.answers = [
                  { answer: "", is_correct: false, side: "left", match_index: 0 },
                  { answer: "", is_correct: false, side: "left", match_index: 1 },
              ];
              q.matches = ["", ""];
          }
        }
      }

      next[qIndex] = q;
      return next;
    }),
  []
);


  const addAnswer = useCallback((qIndex: number) =>
    setQuestions(prev => {
      const next = [...prev];
      const q = { ...next[qIndex] };

      // Set is_correct to true by default for identification
      const isCorrect = q.question_type === 'identification' ? true : false;
      
      q.answers = [...q.answers, { answer: "", is_correct: isCorrect }];
      next[qIndex] = q;
      return next;
    }),
    []
  );

  const removeAnswer = useCallback((qIndex: number, aIndex: number) =>
    setQuestions(prev => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.answers = q.answers.filter((_, i) => i !== aIndex);
      next[qIndex] = q;
      return next;
    }),
    []
  );

  const updateAnswerField = useCallback(
    (qIndex: number, aIndex: number, field: keyof EditableAnswer, value: any) =>
      setQuestions(prev => {
        const next = [...prev];
        const q = { ...next[qIndex] };
        const updated = [...q.answers];
        (updated[aIndex] as any)[field] = value;
        q.answers = updated;
        next[qIndex] = q;
        return next;
      }),
    []
  );

  const toggleCheckboxCorrect = useCallback((qIndex: number, aIndex: number) =>
    setQuestions(prev => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const updated = [...q.answers];
      // FIX: Corrected typo in logic
      updated[aIndex] = { ...updated[aIndex], is_correct: !updated[aIndex].is_correct }; 
      q.answers = updated;
      next[qIndex] = q;
      return next;
    }),
    []
  );

  const addMatchOption = useCallback((qIndex: number) =>
    setQuestions(prev => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.matches = [...(q.matches || []), ""];
      next[qIndex] = q;
      return next;
    }),
    []
  );

  const removeMatchOption = useCallback((qIndex: number, mIndex: number) =>
    setQuestions(prev => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      q.matches = (q.matches || []).filter((_, i) => i !== mIndex);
      next[qIndex] = q;
      return next;
    }),
    []
  );

  // ---------- Save ----------
  const saveAll = async () => {
    if (!quizId) return;
    setSaving(true);
    try {
      for (const q of questions) {
        const payload = {
          question: q.question,
          time_limit: q.time_limit,
          points: Math.round(q.points),
          question_type: q.question_type,
        };

        let currentQId = q.id;

        // 1. Update/Insert Question
        if (q.id) {
          await supabase.from("questions").update(payload).eq("id", q.id);
        } else {
          const { data: newQ, error: insertError } = await supabase
            .from("questions")
            .insert({ ...payload, quiz_id: quizId })
            .select()
            .single();
          if (insertError) throw insertError;
          currentQId = newQ.id;
        }

        if (!currentQId) continue;

        // 2. Delete existing answers for this question
        await supabase.from("answers").delete().eq("question_id", currentQId);

        // 3. Insert new answers based on type
        if (q.question_type === "matching") {
          const lefts = (q.answers || []).map((a, i) => ({
            question_id: currentQId,
            answer: a.answer,
            side: "left",
            match_index: i,
            is_correct: false,
          }));
          const rights = (q.matches || []).map(m => ({
            question_id: currentQId,
            answer: m,
            side: "right",
            is_correct: false,
          }));
          await supabase.from("answers").insert([...lefts, ...rights]);
        } else if (q.question_type === "identification") {
            // For identification, save the list of acceptable answers, all marked as correct.
            await supabase.from("answers").insert(
                q.answers.map(a => ({ 
                    question_id: currentQId, 
                    answer: a.answer, 
                    is_correct: true 
                })).filter(a => a.answer.trim()) // Only save non-empty answers
            );
        } else {
          // Multiple Choice, True/False, Checkboxes
          await supabase
            .from("answers")
            .insert(q.answers.map(a => ({ question_id: currentQId, ...a })));
        }
      }
      setSuccessMsg("Saved successfully!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete ----------
  const deleteQuiz = async () => {
    if (!quizId) return;
    if (!window.confirm("Are you sure you want to permanently delete this quiz?")) return;
    setDeleting(true);
    try {
      await supabase.from("quizzes").delete().eq("id", quizId);
      navigate("/teacherDashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- UI ----------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <main className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/teacherDashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex gap-2">
            <button
              onClick={deleteQuiz}
              disabled={saving || deleting}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {deleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="mb-6">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Quiz title"
            className="w-full border rounded-md p-2 mb-3"
          />
          <textarea
            value={description ?? ""}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Questions */}
        {questions.map((q, qi) => (
          // FIX: Added 'relative' and 'shadow-lg' for better separation
          <div key={q.id ?? qi} ref={qi === questions.length - 1 ? lastQuestionRef : null} 
               className="border rounded-xl p-4 mb-6 bg-gray-50 shadow-lg relative"> 
            
            {/* FIX: Question Indicator Bar for visual separation */}
            <div 
              className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl"
              style={{ backgroundColor: color.teal }} 
            ></div>
            
            <div className="flex justify-between items-center mb-2">
              {/* FIX: Displayed as 'No. 1', 'No. 2', etc. */}
              <h2 className="font-semibold text-lg">No. {qi + 1}</h2> 
              <button onClick={() => removeQuestion(qi)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <select
              value={q.question_type}
              onChange={e => updateQuestionField(qi, "question_type", e.target.value)}
              className="w-full border rounded-md p-2 mb-3"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="identification">Identification (Short Answer)</option>
              <option value="matching">Matching</option>
              <option value="checkboxes">Checkboxes (Multiple Correct)</option>
            </select>

            <textarea
              value={q.question}
              onChange={e => updateQuestionField(qi, "question", e.target.value)}
              className="w-full border rounded-md p-2 mb-2"
              rows={3}
              placeholder="Enter your question here (supports LaTeX: \(\dots\))"
            />
            
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => {
                    // Logic to set pad target and show math pad (omitted for brevity)
                    setShowMathPad(true);
                }}
                className="text-gray-500 hover:text-teal-600 flex items-center text-sm gap-1"
              >
                <Keyboard className="h-4 w-4" /> Insert Math (LaTeX)
              </button>
            </div>


            {/* Preview */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-gray-500 text-sm font-semibold">Preview</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* 🪶 Preview Box */}
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-sm mb-6">
              <MathJax dynamic>{formatWithText(q.question)}</MathJax>
            </div>

            {/* 🧠 Answer Section Separator */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-gray-500 text-sm font-semibold">Answers</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>



            {/* Matching UI */}
            {q.question_type === "matching" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Left items</h3>
                  {q.answers.map((a, ai) => (
                    <div key={ai} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={a.answer}
                        onChange={e => updateAnswerField(qi, ai, "answer", e.target.value)}
                        className="flex-1 border rounded-md p-1"
                      />
                      <button
                        onClick={() => removeAnswer(qi, ai)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addAnswer(qi)}
                    className="text-teal-600 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add left item
                  </button>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Right options</h3>
                  {(q.matches || []).map((m, mi) => (
                    <div key={mi} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={m}
                        onChange={e => {
                          const val = e.target.value;
                          setQuestions(prev => {
                            const next = [...prev];
                            const qx = { ...next[qi] };
                            const matches = [...(qx.matches || [])];
                            matches[mi] = val;
                            qx.matches = matches;
                            next[qi] = qx;
                            return next;
                          });
                        }}
                        className="flex-1 border rounded-md p-1"
                      />
                      <button
                        onClick={() => removeMatchOption(qi, mi)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addMatchOption(qi)}
                    className="text-teal-600 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add right option
                  </button>
                </div>
              </div>
            ) : (
                
                // --- Identification and all other types (MC, Checkbox) ---
                <div>
                    {(q.question_type === "identification" || q.question_type === "multiple_choice" || q.question_type === "checkboxes" || q.question_type === "true_false") && (
                        <>
                            {q.question_type === "identification" && (
                                <p className="text-gray-500 text-sm italic mb-3">
                                    List all acceptable answers.
                                </p>
                            )}

                            {q.answers.map((a, ai) => (
                                <div key={ai} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={a.answer}
                                        onChange={e => updateAnswerField(qi, ai, "answer", e.target.value)}
                                        className={`flex-1 border rounded-md p-2 
                                            ${(q.question_type === "multiple_choice" || q.question_type === "true_false") && a.is_correct ? 'border-teal-500 bg-teal-50' : ''}
                                            ${q.question_type === "identification" ? 'border-amber-500 bg-amber-50' : ''}
                                        `}
                                        placeholder={q.question_type === "identification" ? "Acceptable answer" : "Answer option"}
                                    />

                                    {/* Correctness Checkbox/Radio */}
                                    {(q.question_type === "multiple_choice" || q.question_type === "true_false") ? (
                                        // Radio for Multiple Choice / True/False (Only one correct)
                                        <input
                                            type="radio"
                                            name={`q-${qi}`}
                                            checked={a.is_correct}
                                            onChange={() =>
                                                setQuestions(prev => {
                                                    const next = [...prev];
                                                    const qx = { ...next[qi] };
                                                    qx.answers = qx.answers.map((ans, idx) => ({
                                                        ...ans,
                                                        is_correct: idx === ai,
                                                    }));
                                                    next[qi] = qx;
                                                    return next;
                                                })
                                            }
                                            className="w-5 h-5 text-teal-600"
                                        />
                                    ) : q.question_type === "checkboxes" ? (
                                        // Checkbox for Multiple Correct Answers
                                        <input
                                            type="checkbox"
                                            checked={a.is_correct}
                                            onChange={() => toggleCheckboxCorrect(qi, ai)}
                                            className="w-5 h-5 text-teal-600"
                                        />
                                    ) : q.question_type === "identification" ? (
                                        // Identification doesn't need a correctness toggle, as all entries are correct answers
                                        <span className="text-amber-600 text-sm font-semibold">Correct</span>
                                    ) : null}

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeAnswer(qi, ai)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Add Answer Button */}
                            {(q.question_type !== "true_false") && (
                                <button
                                    onClick={() => addAnswer(qi)}
                                    className="text-teal-600 text-sm flex items-center gap-1 mt-2"
                                >
                                    <Plus className="h-4 w-4" /> 
                                    {q.question_type === "identification" ? "Add acceptable answer" : "Add answer option"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="bg-teal-100 text-teal-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Question
        </button>

        {errorMsg && <p className="text-red-600 mt-3">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 mt-3">{successMsg}</p>}
      </main>

      {/* Math Symbol Pad Component (assuming it's implemented) */}
      {/* <MathSymbolPad
          open={showMathPad}
          onClose={() => setShowMathPad(false)}
          onInsert={handleMathInsert}
          inputRef={currentInputRef}
      />
      */}
    </div>
  );
}