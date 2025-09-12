// src/pages/editQuiz.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import color from "../styles/color";

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

export default function EditQuiz() {
  const { id: quizId } = useParams<{ id: UUID }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | null>("");

  // live (editable) questions
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  // snapshot to compute diffs on save
  const [originalQuestions, setOriginalQuestions] = useState<EditableQuestion[]>([]);

  // ---------- Load quiz + nested questions/answers ----------
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!quizId) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        // quiz meta
        const { data: quizRow, error: qErr } = await supabase
          .from("quizzes")
          .select("id, title, description")
          .eq("id", quizId)
          .single();

        if (qErr) throw qErr;
        if (!quizRow) throw new Error("Quiz not found");

        // questions + answers
        const { data: qRows, error: qsErr } = await supabase
          .from("questions")
          .select(
            `
            id,
            question,
            time_limit,
            points,
            answers ( id, answer, is_correct )
          `
          )
          .eq("quiz_id", quizId)
          .order("created_at", { ascending: true });

        if (qsErr) throw qsErr;

        const mapped: EditableQuestion[] = (qRows ?? []).map((r: any) => ({
          id: r.id,
          question: r.question ?? "",
          time_limit: Number(r.time_limit ?? 30),
          points: Number(r.points ?? 1000),
          answers:
            (r.answers ?? []).map((a: any) => ({
              id: a.id,
              answer: a.answer ?? "",
              is_correct: Boolean(a.is_correct),
            })) || [],
        }));

        if (mounted) {
          setTitle(quizRow.title ?? "");
          setDescription(quizRow.description ?? "");
          setQuestions(mapped);
          // deep copy for original snapshot
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

  // ---------- Helpers to modify UI state ----------
  const addQuestion = () => {
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
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const updateQuestionField = (
    qIndex: number,
    field: keyof Omit<EditableQuestion, "answers" | "id">,
    value: any
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], [field]: value };
      return next;
    });
  };

  const addAnswer = (qIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers = [...next[qIndex].answers, { answer: "", is_correct: false }];
      return next;
    });
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers = next[qIndex].answers.filter((_, i) => i !== aIndex);
      return next;
    });
  };

  const updateAnswerField = (
    qIndex: number,
    aIndex: number,
    field: keyof EditableAnswer,
    value: any
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers[aIndex] = { ...next[qIndex].answers[aIndex], [field]: value };
      return next;
    });
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    // Single correct answer per question
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].answers = next[qIndex].answers.map((a, i) => ({
        ...a,
        is_correct: i === aIndex,
      }));
      return next;
    });
  };

  // ---------- Diff helpers (for save) ----------
  const originalById = useMemo(() => {
    const map = new Map<string, EditableQuestion>();
    for (const q of originalQuestions) if (q.id) map.set(q.id, q);
    return map;
  }, [originalQuestions]);

  // ---------- Save handler ----------
  const saveAll = async () => {
    if (!quizId) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1) Update the quiz meta
      {
        const { error } = await supabase
          .from("quizzes")
          .update({ title, description })
          .eq("id", quizId);
        if (error) throw error;
      }

      // 2) Compute question diffs
      const currIds = new Set(questions.filter((q) => q.id).map((q) => q.id!));
      const origIds = new Set(originalQuestions.filter((q) => q.id).map((q) => q.id!));

      // 2a) Deletions (questions removed by the teacher)
      const toDelete = [...origIds].filter((id) => !currIds.has(id));
      if (toDelete.length) {
        const { error } = await supabase.from("questions").delete().in("id", toDelete);
        if (error) throw error;
        // answers are ON DELETE CASCADE → removed automatically
      }

      // 2b) Upserts for existing & new questions
      for (const q of questions) {
        if (q.id) {
          // existing question → update fields
          const { error: upErr } = await supabase
            .from("questions")
            .update({
              question: q.question,
              time_limit: q.time_limit,
              points: q.points,
            })
            .eq("id", q.id);
          if (upErr) throw upErr;

          // answers diff
          const origQ = originalById.get(q.id) || { answers: [] };
          const origAnswerIds = new Set(
            (origQ.answers || []).filter((a) => a.id).map((a) => a.id as string)
          );
          const currAnswerIds = new Set(q.answers.filter((a) => a.id).map((a) => a.id as string));

          // delete removed answers
          const delAns = [...origAnswerIds].filter((aid) => !currAnswerIds.has(aid));
          if (delAns.length) {
            const { error: delAErr } = await supabase
              .from("answers")
              .delete()
              .in("id", delAns);
            if (delAErr) throw delAErr;
          }

          // update existing answers
          const updates = q.answers.filter((a) => a.id);
          if (updates.length) {
            const updatePromises = updates.map((a) =>
              supabase
                .from("answers")
                .update({ answer: a.answer, is_correct: a.is_correct })
                .eq("id", a.id)
            );
            const res = await Promise.all(updatePromises);
            const anyErr = res.find((r) => r.error);
            if (anyErr?.error) throw anyErr.error;
          }

          // insert new answers
          const inserts = q.answers.filter((a) => !a.id).map((a) => ({
            question_id: q.id,
            answer: a.answer,
            is_correct: a.is_correct,
          }));
          if (inserts.length) {
            const { error: insErr } = await supabase.from("answers").insert(inserts);
            if (insErr) throw insErr;
          }
        } else {
          // new question → insert, then insert its answers
          const { data: qIns, error: qInsErr } = await supabase
            .from("questions")
            .insert({
              quiz_id: quizId,
              question: q.question,
              time_limit: q.time_limit,
              points: q.points,
            })
            .select("id")
            .single();

          if (qInsErr) throw qInsErr;
          const newQid = qIns.id as string;

          if (q.answers.length) {
            const payload = q.answers.map((a) => ({
              question_id: newQid,
              answer: a.answer,
              is_correct: a.is_correct,
            }));
            const { error: aErr } = await supabase.from("answers").insert(payload);
            if (aErr) throw aErr;
          }
        }
      }

      setSuccessMsg("Saved successfully!");
      // Refresh "original" snapshot so future edits diff correctly
      setOriginalQuestions(JSON.parse(JSON.stringify(questions)));
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
      // small auto-hide of success
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  // ---------- Delete handler (quiz + related rows) ----------
  const deleteQuiz = async () => {
    if (!quizId) return;
    const confirmed = window.confirm(
      "Delete this quiz? This will remove the quiz, its questions, answers, and any related student progress. This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Gather question ids
      const { data: qIdsRes, error: qIdsErr } = await supabase
        .from("questions")
        .select("id")
        .eq("quiz_id", quizId);

      if (qIdsErr) throw qIdsErr;

      const qIds = (qIdsRes ?? []).map((r: any) => r.id as string);

      // Delete answers first (safe even if FK cascade exists)
      if (qIds.length) {
        const { error: aErr } = await supabase.from("answers").delete().in("question_id", qIds);
        if (aErr) throw aErr;
      }

      // Delete user progress referencing this quiz (in case FK is restrictive)
      const { error: upErr } = await supabase.from("user_progress").delete().eq("quiz_id", quizId);
      if (upErr && upErr.code !== "42P01") {
        // ignore missing-table error, throw others
        throw upErr;
      }

      // Delete questions
      const { error: qDelErr } = await supabase.from("questions").delete().eq("quiz_id", quizId);
      if (qDelErr) throw qDelErr;

      // Finally, delete the quiz
      const { error: quizDelErr } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (quizDelErr) throw quizDelErr;

      navigate("/teacherDashboard");
    } catch (e: any) {
      console.error("Failed to delete quiz:", e);
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
              title="Delete this quiz"
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

        {/* Alerts */}
        {errorMsg && (
          <div
            className="mb-4 rounded-xl p-3 text-sm"
            style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            className="mb-4 rounded-xl p-3 text-sm"
            style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
          >
            {successMsg}
          </div>
        )}

        {/* Quiz meta */}
        <motion.div
          className="rounded-2xl p-6 shadow-xl ring-1 mb-6"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
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
            className="rounded-2xl p-6 shadow-xl ring-1 mb-6"
            style={{ background: "#fff", borderColor: `${color.mist}55` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: color.deep }}>
                Question {qIndex + 1}
              </h2>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-700"
                aria-label="Remove question"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                value={q.question}
                onChange={(e) => updateQuestionField(qIndex, "question", e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Type the question here (supports LaTeX if you render later)."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="mt-2">
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
                    <div key={a.id ?? `new-a-${aIndex}`} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={a.answer}
                        onChange={(e) =>
                          updateAnswerField(qIndex, aIndex, "answer", e.target.value)
                        }
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
                        aria-label="Remove answer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add question + Save */}
        <div className="flex items-center justify-between mb-14">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition"
            style={{ border: `1px solid ${color.mist}`, background: "#fff", color: color.teal }}
          >
            <Plus className="h-4 w-4" />
            Add question
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
    </div>
  );
}
