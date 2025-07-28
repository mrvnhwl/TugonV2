// src/pages/CreateSession.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface Quiz {
  id: string;
  title: string;
  description: string;
}

function CreateSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase.from('quizzes').select('id, title, description');
      if (error) throw error;
      if (data) setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      toast.error('Failed to load quizzes');
    }
  };

  const createSession = async () => {
    if (!selectedQuiz) {
      toast.error('Please select a quiz');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          host_id: user?.id,
          quiz_id: selectedQuiz,
          status: 'waiting'
        })
        .select()
        .single();

      if (error || !data) throw error;
      await navigator.clipboard.writeText(data.id);
      toast.success('Session created & code copied!');
      navigate(`/game/${data.id}`);
    } catch (err) {
      console.error('Error creating session:', err);
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Game Session</h1>
      <div className="space-y-4">
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        >
          <option value="">Select a Quiz</option>
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title}
            </option>
          ))}
        </select>
        <button
          onClick={createSession}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </div>
    </div>
  );
}
removeEventListener
export default CreateSession;
