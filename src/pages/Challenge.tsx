import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Quiz {
  id: string;
  title: string;
  description: string;
}

function Challenge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadQuizzes();
  }, [user]);

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setQuizzes(data);
    } catch (err) {
      console.error('Error loading quizzes:', err);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/studentDashboard')}
        className="flex items-center space-x-2 mb-6 text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Available Quizzes */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Challenges</h2>
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <p className="text-gray-500">No challenges available yet.</p>
          ) : (
            quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                    </div>
                    <Link
                      to={`/quiz/${quiz.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Challenge;
