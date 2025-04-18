import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

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

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        time_limit: 30,
        points: 1000,
        answers: Array(4).fill({ answer: "", is_correct: false }),
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateAnswer = (qIndex: number, aIndex: number, field: keyof Answer, value: any) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers[aIndex] = {
      ...newQuestions[qIndex].answers[aIndex],
      [field]: value,
    };
    setQuestions(newQuestions);
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

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
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

        {questions.map((q, qIndex) => (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Question {qIndex + 1}</h2>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <input
              type="text"
              required
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Question"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min="5"
                max="120"
                required
                value={q.time_limit}
                onChange={(e) => updateQuestion(qIndex, "time_limit", parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Time Limit (sec)"
              />
              <input
                type="number"
                min="100"
                max="2000"
                step="100"
                required
                value={q.points}
                onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Points"
              />
            </div>

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
                      const newQuestions = [...questions];
                      newQuestions[qIndex].answers.forEach((ans, i) => {
                        ans.is_correct = i === aIndex;
                      });
                      setQuestions(newQuestions);
                    }}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">Correct</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

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
  );
}

export default CreateQuiz;
