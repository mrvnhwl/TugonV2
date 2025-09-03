import React, { useEffect, useMemo, useState } from "react";
import { Trophy, Loader2, Medal, ArrowLeft } from "lucide-react";
import StudentNavbar from "../components/studentNavbar";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Quiz {
  id: string;
  title: string;
}

interface LeaderboardEntry {
  id?: string;           // not returned by RPC, kept optional
  user_id: string;
  user_email: string | null;
  score: number;
}

export default function Leaderboards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const myUserId = user?.id ?? null;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load quizzes once
  useEffect(() => {
    const loadQuizzes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setQuizzes(data);
        if (data.length > 0) setSelectedQuiz((prev) => prev || data[0].id);
      }
      setLoading(false);
    };

    loadQuizzes();
  }, []);

  // Load leaderboard when quiz changes
  useEffect(() => {
    const loadLeaderboard = async (quizId: string) => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_highest_scores_for_quiz", {
        quizid: quizId,
      });

      if (!error && Array.isArray(data)) {
        // Sort by score desc (RPC already distinct-on highest, but we sort to be sure)
        const sorted = [...data].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setLeaderboard(sorted as LeaderboardEntry[]);
      } else {
        setLeaderboard([]);
      }
      setLoading(false);
    };

    if (selectedQuiz) loadLeaderboard(selectedQuiz);
  }, [selectedQuiz]);

  // Top 10 view
  const topTen = useMemo(() => leaderboard.slice(0, 10), [leaderboard]);

  // Find current student's rank if not in top 10
  const myIndex = useMemo(
    () => (myUserId ? leaderboard.findIndex((r) => r.user_id === myUserId) : -1),
    [leaderboard, myUserId]
  );
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myRow = myIndex >= 0 ? leaderboard[myIndex] : null;
  const myAlias = (email?: string | null) =>
    email ? email.split("@")[0] : myUserId?.slice(0, 8) ?? "You";

  return (
    <>
      <StudentNavbar />
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-indigo-100/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg ring-1 ring-gray-100 p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
            </div>

            <div className="mb-6">
              <label
                htmlFor="quiz-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Quiz
              </label>
              <select
                id="quiz-select"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
              >
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
              </div>
            ) : topTen.length === 0 ? (
              <p className="text-gray-500 text-center">No scores yet for this quiz.</p>
            ) : (
              <>
                {/* Top 10 rows */}
                <div className="space-y-3">
                  {topTen.map((entry, index) => (
                    <div
                      key={`${entry.user_id}-${index}`}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Medals for top 3 */}
                        {index === 0 && (
                          <Medal className="h-5 w-5 text-yellow-500" />
                        )}
                        {index === 1 && (
                          <Medal className="h-5 w-5 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Medal className="h-5 w-5 text-amber-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {index + 1}.{" "}
                          {entry.user_email
                            ? entry.user_email.split("@")[0]
                            : entry.user_id.slice(0, 8)}
                        </span>
                      </div>
                      <span className="text-indigo-700 font-semibold">
                        {entry.score} pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Your rank (shown only if not in top 10 and logged in) */}
                {myUserId && myRank && myRank > 10 && myRow && (
                  <>
                    <div className="my-4 text-center text-gray-400">…</div>
                    <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/50">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">
                          Your rank: {myRank}. {myAlias(myRow.user_email)}
                        </div>
                        <div className="text-indigo-700 font-semibold">
                          {myRow.score} pts
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Keep going! Only{" "}
                        <span className="font-semibold">
                          {myRank - 10}
                        </span>{" "}
                        spot(s) from the top 10.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
