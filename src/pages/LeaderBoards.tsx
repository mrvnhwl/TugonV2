import React, { useEffect, useState } from 'react';
import { Trophy, Loader2, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  email: string;
  score: number;
}

function Leaderboards() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Example: assumes you have a "scores" table with user_id, score, and relation to users
      const { data, error } = await supabase
        .from('scores')
        .select(
          `
          score,
          users:user_id (
            id,
            email
          )
        `
        )
        .order('score', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setLeaderboard(
          data.map((entry: any) => ({
            user_id: entry.users.id,
            email: entry.users.email,
            score: entry.score,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-center">No scores yet. Be the first to play!</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Show medal for top 3 */}
                  {index === 0 && <Medal className="h-5 w-5 text-yellow-500" />}
                  {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                  <span className="font-medium text-gray-900">
                    {index + 1}. {entry.email}
                  </span>
                </div>
                <span className="text-indigo-600 font-semibold">{entry.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboards;
