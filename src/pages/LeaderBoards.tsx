
import React, { useEffect, useState } from 'react';
import { Trophy, Loader2, Medal } from 'lucide-react';
import StudentNavbar from '../components/studentNavbar';
import { supabase } from '../lib/supabase';

interface Quiz {
  id: string;
  title: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_email: string;
  score: number;
}

function Leaderboards() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      loadLeaderboard(selectedQuiz);
    }
  }, [selectedQuiz]);

  const loadQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setQuizzes(data);
      if (data.length > 0) setSelectedQuiz(data[0].id);
    }
    setLoading(false);
  };

  const loadLeaderboard = async (quizId: string) => {
    setLoading(true);
    // Get only the highest score per user for this quiz
    const { data, error } = await supabase.rpc('get_highest_scores_for_quiz', { quizid: quizId });
    if (!error && data) {
      setLeaderboard(data);
    } else {
      setLeaderboard([]);
    }
    setLoading(false);
  };

  return (
    <>
      <StudentNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
        </div>

        <div className="mb-6">
          <label htmlFor="quiz-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Quiz:
          </label>
          <select
            id="quiz-select"
            className="border border-gray-300 rounded px-3 py-2"
            value={selectedQuiz}
            onChange={e => setSelectedQuiz(e.target.value)}
          >
            {quizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-gray-500 text-center">No scores yet for this quiz.</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Show medal for top 3 */}
                  {index === 0 && <Medal className="h-5 w-5 text-yellow-500" />}
                  {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                  <span className="font-medium text-gray-900">
                    {index + 1}. {entry.user_email.split('@')[0]}
                  </span>
                </div>
                <span className="text-indigo-600 font-semibold">{entry.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default Leaderboards;
