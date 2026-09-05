import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { MathJax } from "better-react-mathjax";
import { MathInput } from "../components/MathInput";
import { MathPreview } from "../components/MathPreview";


/* ----------------------------- Types & helpers ---------------------------- */

interface Answer {
  answer: string;
  is_correct: boolean;
  id?: string;
}

interface Question {
  id?: string;
  question: string;
  question_type: "multiple_choice" | "true_false" | "identification" | "matching" | "checkboxes";
  time_limit: number;
  points: number;
  answers: Answer[];
  matches?: string[];
}

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
      question_type: "multiple_choice",
      time_limit: 30,
      points: 1000,
      answers: freshAnswers(),
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);

  /* ----------------------------- Mutators (UI) ---------------------------- */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_type: "multiple_choice",
        question: "",
        time_limit: 30,
        points: 1000,
        answers: freshAnswers(),
        matches: [],
      },
    ]);
  };

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
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      if (field === "question_type") {
        let newAnswers: Answer[] = [];
        let newMatches: string[] = [];

        if (value === "multiple_choice" || value === "true_false" || value === "checkboxes") {
          newAnswers = prev[index].answers.length > 0 ? prev[index].answers.map(a => ({ ...a, is_correct: value === "multiple_choice" || value === "true_false" ? false : a.is_correct })) : freshAnswers();
          if (value === "true_false") newAnswers = [{ answer: "True", is_correct: false }, { answer: "False", is_correct: false }];
        } else if (value === "identification") {
          newAnswers = [{ answer: "", is_correct: true }];
        } else if (value === "matching") {
          newAnswers = prev[index].answers.map(a => ({ ...a, is_correct: false }));
          newMatches = prev[index].matches || ["", "", ""];
        }

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
      if (q.question_type === "multiple_choice" || q.question_type === "true_false") {
        q.answers = q.answers.map((ans, i) => ({ ...ans, is_correct: i === aIndex }));
      } else if (q.question_type === "identification") {
        q.answers = q.answers.map((ans, i) => ({ ...ans, is_correct: true }));
      }
      next[qIndex] = q;
      return next;
    });
  };

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

  const addAnswerChoice = (qIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const isIdentification = q.question_type === "identification";
      q.answers = [...q.answers, { answer: "", is_correct: isIdentification || false }];
      next[qIndex] = q;
      return next;
    });
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, answers: q.answers.filter((_, j) => j !== aIndex) } : q
      )
    );
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

  const matchDragRef = React.useRef<{ qIndex: number; mIndex: number } | null>(null);

  const onMatchDragStart = (qIndex: number, mIndex: number, e: React.DragEvent) => {
    matchDragRef.current = { qIndex, mIndex };
    try { e.dataTransfer!.setData("text/plain", `${mIndex}`); } catch {}
    e.dataTransfer!.effectAllowed = "move";
  };

  const onMatchDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
  };

  const onMatchDrop = (qIndex: number, destIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    const src = matchDragRef.current;
    if (!src || src.qIndex !== qIndex || src.mIndex === destIndex) {
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
        const hasAnswers = q.answers && q.answers.length > 0 && q.answers.some(a => a.answer.trim() !== "");
        if (!hasAnswers)
          return `Question ${i + 1} (Short Answer) must have at least one possible correct answer.`;
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
            question_type: q.question_type,
          })
          .select("*")
          .single();

        if (qErr || !qRow) throw qErr || new Error("Failed to insert question.");

        if (q.question_type === "matching") {
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
        } else if (q.question_type === "identification") {
          const answersRows = q.answers
            .filter(a => a.answer.trim() !== "")
            .map((a) => ({
              question_id: qRow.id,
              answer: a.answer,
              is_correct: true,
            }));
          if (answersRows.length > 0) {
            const { error: aErr } = await supabase.from("answers").insert(answersRows);
            if (aErr) throw aErr;
          }
        } else if (q.answers.length > 0) {
          const answersRows = q.answers.map((a) => ({
            question_id: qRow.id,
            answer: a.answer,
            is_correct: a.is_correct,
          }));
          const { error: aErr } = await supabase.from("answers").insert(answersRows);
          if (aErr) throw aErr;
        }
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Quiz</h1>
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

          {questions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No questions yet — click below to add one.</p>
              <button
                type="button"
                onClick={() => addQuestionAfter(0)}
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
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Question {qIndex + 1}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addQuestionAfter(qIndex)}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                      title="Add question below"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select
                    value={(q as any).question_type || "multiple_choice"}
                    onChange={(e) => updateQuestion(qIndex, "question_type" as any, e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True or False</option>
                    <option value="identification">Identification</option>
                    <option value="matching">Matching</option>
                    <option value="checkboxes">Checkboxes (multiple correct)</option>
                  </select>
                </div>

                <div className="mb-6 border p-3 rounded-lg bg-gray-50 border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question {qIndex + 1} Content
                  </label>
                  <MathInput
                    value={q.question}
                    onChange={(val) => updateQuestion(qIndex, "question", val)}
                    placeholder="Type your question here"
                    className="mt-1"
                  />
                  {q.question.trim() && (
                    <div className="mt-2 p-2 bg-white border border-dashed border-indigo-300 rounded-md text-sm">
                      <p className="font-semibold text-indigo-700 mb-1">Preview:</p>
                      <MathPreview value={q.question} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-3 border rounded-lg bg-white shadow-inner">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (sec)</label>
                    <input
                      type="number"
                      min={5}
                      max={600}
                      required
                      value={q.time_limit}
                      onChange={(e) => updateQuestion(qIndex, "time_limit", parseInt(e.target.value || "0", 10))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono px-3 py-2"
                      placeholder="Time Limit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                    <input
                      type="number"
                      min={50}
                      max={10000}
                      step={50}
                      required
                      value={q.points}
                      onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value || "0", 10))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono px-3 py-2"
                      placeholder="Points"
                    />
                  </div>
                </div>

                {q.question_type === "multiple_choice" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Answer Choices (Select One Correct)</h3>
                    {q.answers.map((a, aIndex) => (
                      <div key={aIndex} className="flex items-start gap-3 bg-white p-3 rounded-md border">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Answer {aIndex + 1}</label>
                          <MathInput
                            value={a.answer}
                            onChange={(val) => updateAnswer(qIndex, aIndex, "answer", val)}
                            placeholder="Type your answer here"
                          />
                        </div>
                        <label className="flex flex-col items-center gap-1 text-xs mt-1">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={a.is_correct}
                            onChange={() => setCorrectAnswer(qIndex, aIndex)}
                            className="text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                          />
                          <span>Correct</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                          className="mt-1 text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addAnswerChoice(qIndex)}
                      className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add another choice</span>
                    </button>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Student Preview:</p>
                      <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                        <p className="font-semibold text-gray-900 mb-2">
                            <MathPreview value={q.question} />
                        </p>
                        {q.answers.filter(a => a.answer.trim() !== "").map((a, aIndex) => (
                            <div key={aIndex} className="flex items-center gap-2">
                              <input type="radio" disabled className="text-indigo-600" />
                              <span className="text-gray-800">
                                  <MathPreview value={a.answer || `(Option ${aIndex + 1})`} />
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

                {q.question_type === "checkboxes" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                     <h3 className="font-semibold text-gray-700">Answer Options (Select One or More Correct)</h3>
                    {q.answers.map((a, aIndex) => (
                      <div key={aIndex} className="flex items-start gap-3 bg-white p-3 rounded-md border">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Option {aIndex + 1}</label>
                          <MathInput
                            value={a.answer}
                            onChange={(val) => updateAnswer(qIndex, aIndex, "answer", val)}
                            placeholder="Type your option here"
                          />
                        </div>
                        <label className="flex flex-col items-center gap-1 text-xs mt-1">
                          <input
                            type="checkbox"
                            name={`correct-${qIndex}-${aIndex}`}
                            checked={a.is_correct}
                            onChange={() => toggleCheckboxCorrect(qIndex, aIndex)}
                            className="text-indigo-600 focus:ring-indigo-500 rounded h-5 w-5"
                          />
                          <span>Correct</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                          className="mt-1 text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addAnswerChoice(qIndex)}
                      className="mt-2 flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add another option</span>
                    </button>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Student Preview:</p>
                      <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                         <p className="font-semibold text-gray-900 mb-2">
                            <MathPreview value={q.question} />
                        </p>
                        {q.answers.filter(a => a.answer.trim() !== "").map((a, aIndex) => (
                            <div key={aIndex} className="flex items-center gap-2">
                              <input type="checkbox" disabled className="text-indigo-600 rounded" />
                              <span className="text-gray-800">
                                  <MathPreview value={a.answer || `(Option ${aIndex + 1})`} />
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

                {q.question_type === "true_false" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                     <h3 className="font-semibold text-gray-700">Set Correct Answer</h3>
                    <p className="text-sm text-gray-700">Select the correct answer:</p>
                    {q.answers.slice(0, 2).map((a, aIndex) => (
                      <div key={aIndex} className={`flex items-center gap-3 p-3 rounded-md border ${a.is_correct ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}>
                        <label className="flex items-center gap-3 text-base">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={a.is_correct}
                            onChange={() => setCorrectAnswer(qIndex, aIndex)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span>{a.answer}</span>
                        </label>
                      </div>
                    ))}
                    <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Student Preview:</p>
                        <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                           <p className="font-semibold text-gray-900 mb-2">
                              <MathPreview value={q.question} />
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

                {q.question_type === "identification" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                     <h3 className="font-semibold text-yellow-800">Short Answer Settings</h3>
                    <p className="text-sm font-medium text-gray-700">
                      Set **all** possible correct answer variations (case-insensitive check is applied during scoring):
                    </p>
                    <div className="mt-2 text-sm text-yellow-700 p-2 border-l-4 border-yellow-500 bg-white rounded-md">
                      <p className="font-semibold">Tip:</p>
                      <p>Enter the exact word(s) students should use (e.g., "Jupiter," "jupiter," or "JUPITER" if all are valid). Spaces and casing are ignored in the check.</p>
                    </div>

                    {q.answers.map((a, aIndex) => (
                      <div key={aIndex} className="flex items-center gap-3 bg-white p-3 rounded-md border border-yellow-300">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Variant {aIndex + 1}</label>
                          <MathInput
                            value={a.answer}
                            onChange={(val) => updateAnswer(qIndex, aIndex, "answer", val)}
                            placeholder="e.g., Photosynthesis"
                          />
                        </div>
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
                    <button
                      type="button"
                      onClick={() => addAnswerChoice(qIndex)}
                      className="mt-2 flex items-center gap-1 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add another correct variant</span>
                    </button>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Student Preview:</p>
                      <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                          <p className="font-semibold text-gray-900 mb-2">
                              <MathPreview value={q.question} />
                          </p>
                          <div className="relative">
                            <input type="text" disabled className="w-full border-b border-gray-400 bg-transparent py-1 px-0 focus:outline-none focus:border-indigo-500" placeholder="Type your answer here..." />
                            <span className="absolute right-0 bottom-0 text-xs text-gray-500">(Student Answer)</span>
                          </div>
                      </div>
                    </div>
                  </div>
                )}

                {q.question_type === "matching" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Matching Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 p-3 bg-white rounded-md border">
                        <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Left Column (Items to Match)</h4>
                        {q.answers.map((a, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-md text-xs font-mono flex-shrink-0">{String.fromCharCode(65 + aIndex)}</span>
                            <div className="flex-1">
                               <MathInput
                                 value={a.answer}
                                 onChange={(val) => updateAnswer(qIndex, aIndex, "answer", val)}
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
                      <div className="space-y-3 p-3 bg-white rounded-md border">
                        <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Right Column (Match Options - Draggable)</h4>
                        {(q.matches || []).map((m, mIndex) => (
                          <div
                            key={mIndex}
                            className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition"
                            draggable
                            onDragStart={(e) => onMatchDragStart(qIndex, mIndex, e)}
                            onDragOver={onMatchDragOver}
                            onDrop={(e) => onMatchDrop(qIndex, mIndex, e)}
                          >
                            <div className="w-5 h-5 flex-shrink-0 cursor-move text-gray-400 hover:text-gray-700 flex items-center justify-center">
                              &#x2261;
                            </div>
                            <div className="flex-1">
                              <MathInput
                                value={m}
                                onChange={(val) => updateMatchOption(qIndex, mIndex, val)}
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
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Student Preview:</p>
                      <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                          <p className="font-semibold text-gray-900 mb-2">
                              <MathPreview value={q.question} />
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
                                    <MathPreview value={m || `(Right Option ${mIndex + 1})`} />
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
