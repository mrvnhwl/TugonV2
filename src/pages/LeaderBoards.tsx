import React, { useEffect, useMemo, useState } from "react";
import { Trophy, Loader2, ArrowLeft, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";
import Lottie from "lottie-react";

// Local Lottie animations
import trophyAnim from "../components/assets/animations/Trophy.json";
import winnerAnim from "../components/assets/animations/Winner.json";
import winner1Anim from "../components/assets/animations/Winner (1).json";

interface Quiz {
  id: string;
  title: string;
}

interface LeaderboardRow {
  user_id: string;
  user_email: string | null;
  score: number | null;
}

interface LeaderboardEntry {
  user_id: string;
  user_email: string | null;
  score: number;
}

type PerQuizBoards = Record<string, LeaderboardEntry[]>;

// Mask usernames
const maskName = (input: string): string => {
  if (!input) return "";
  const base = input.includes("@") ? input.split("@")[0] : input;
  const visible = Math.min(4, Math.floor(Math.random() * 3) + 2);
  const maskedPart = "*".repeat(Math.max(1, base.length - visible));
  return base.slice(0, visible) + maskedPart;
};

// Podium Lottie (1 -> Trophy, 2 -> Winner.json, 3 -> Winner (1).json)
function PodiumLottie({
  place,
  size = 96,
  className = "",
}: {
  place: 1 | 2 | 3;
  size?: number;
  className?: string;
}) {
  let animationData: any = trophyAnim;
  if (place === 2) animationData = winnerAnim;
  if (place === 3) animationData = winner1Anim;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
}

export default function Leaderboards() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallBoard, setOverallBoard] = useState<LeaderboardEntry[]>([]);
  const [perQuizBoards, setPerQuizBoards] = useState<PerQuizBoards>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Fetch quizzes
        const { data: qz, error: qErr } = await supabase
          .from("quizzes")
          .select("id, title")
          .order("created_at", { ascending: false });

        if (qErr) throw qErr;
        const quizzesList = (qz ?? []) as Quiz[];
        setQuizzes(quizzesList);

        if (quizzesList.length === 0) {
          setPerQuizBoards({});
          setOverallBoard([]);
          setLoading(false);
          return;
        }

        // Fetch per-quiz highest scores per user
        const results = await Promise.all(
          quizzesList.map(async (quiz) => {
            const { data, error } = await supabase.rpc("get_highest_scores_for_quiz", {
              quizid: quiz.id,
            });
            if (error || !Array.isArray(data)) {
              return { quizId: quiz.id, rows: [] as LeaderboardRow[] };
            }
            const normalized = (data as LeaderboardRow[]).map((r) => ({
              user_id: r.user_id,
              user_email: r.user_email ?? null,
              score: r.score ?? 0,
            }));
            normalized.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
            return { quizId: quiz.id, rows: normalized };
          })
        );

        // Per-quiz top10
        const perQuiz: PerQuizBoards = {};
        for (const r of results) perQuiz[r.quizId] = r.rows.slice(0, 10) as LeaderboardEntry[];
        setPerQuizBoards(perQuiz);

        // Overall = sum of best-per-quiz for each user
        const byUser: Record<string, LeaderboardEntry> = {};
        for (const r of results) {
          for (const row of r.rows) {
            const uid = row.user_id;
            if (!uid) continue;
            const s = row.score ?? 0;
            if (!byUser[uid]) {
              byUser[uid] = { user_id: uid, user_email: row.user_email, score: s };
            } else {
              byUser[uid].score += s;
            }
          }
        }
        const overall = Object.values(byUser)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, 10);
        setOverallBoard(overall);
      } catch (err) {
        console.error("Failed to load leaderboards:", err);
        setOverallBoard([]);
        setPerQuizBoards({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Palette
  const gradient = `linear-gradient(135deg, ${color.ocean} 0%, ${color.teal} 55%, ${color.aqua} 100%)`;
  const cardBorder = `${color.mist}66`;
  const ink = color.deep;
  const sub = color.steel;

  return (
    <>
      {/* Hero */}
      <header className="relative" style={{ background: gradient }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:text-white transition focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="mt-4 flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            <h1 className="text-3xl font-extrabold tracking-tight">Leaderboards</h1>
          </div>

          <p className="mt-2 text-white/90 max-w-2xl">
            Overall ranking adds your best score from each challenge. Push your personal bests to climb the board!
          </p>
        </div>

        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path
            d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin h-10 w-10" style={{ color: color.teal }} />
          </div>
        ) : (
          <>
            {/* ===== Overall Leaderboard (Podium) ===== */}
            <section
              className="rounded-3xl p-6 shadow-xl ring-1 mb-10"
              style={{
                background: "#fff",
                borderColor: cardBorder,
                boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6" style={{ color: color.teal }} />
                  <h2 className="text-2xl font-extrabold" style={{ color: ink }}>
                    Overall Leaderboard
                  </h2>
                </div>
                <span className="text-sm" style={{ color: sub }}>
                  Overall · Top 10
                </span>
              </div>

              {overallBoard.length === 0 ? (
                <p className="text-center" style={{ color: sub }}>
                  No scores yet.
                </p>
              ) : (
                <>
                  {/* Podium (2,1,3) with true height stagger */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 items-end">
                    {/* 2nd — silver tone, smaller, lower */}
                    {overallBoard[1] && (
                      <div
                        className="rounded-2xl px-5 pt-5 pb-6 text-center ring-1 flex flex-col items-center translate-y-6"
                        style={{
                          background: `linear-gradient(135deg, #ffffff, ${color.mist}11)`,
                          borderColor: cardBorder,
                          minHeight: 220,
                        }}
                      >
                        <PodiumLottie place={2} size={96} />
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
                          2nd Place
                        </div>
                        <div className="text-lg font-bold leading-tight" style={{ color: ink }}>
                          {maskName(overallBoard[1].user_email ?? overallBoard[1].user_id)}
                        </div>
                        <div className="mt-1 font-semibold" style={{ color: color.teal }}>
                          {overallBoard[1].score} pts
                        </div>
                      </div>
                    )}

                    {/* 1st — big, lifted, teal accent */}
                    {overallBoard[0] && (
                      <div
                        className="rounded-2xl px-8 pt-8 pb-9 text-center ring-1 flex flex-col items-center -translate-y-4"
                        style={{
                          background: `linear-gradient(135deg, ${color.teal}12, #ffffff)`,
                          borderColor: color.teal,
                          boxShadow: `0 18px 44px ${color.teal}33`,
                          minHeight: 290,
                        }}
                      >
                        <PodiumLottie place={1} size={170} />
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
                          1st Place
                        </div>
                        <div className="text-2xl font-extrabold leading-tight" style={{ color: ink }}>
                          {maskName(overallBoard[0].user_email ?? overallBoard[0].user_id)}
                        </div>
                        <div className="mt-2 text-xl font-extrabold" style={{ color: color.teal }}>
                          {overallBoard[0].score} pts
                        </div>
                      </div>
                    )}

                    {/* 3rd — bronze tone, smaller, lower */}
                    {overallBoard[2] && (
                      <div
                        className="rounded-2xl px-5 pt-5 pb-6 text-center ring-1 flex flex-col items-center translate-y-6"
                        style={{
                          background: `linear-gradient(135deg, #ffffff, ${color.mist}11)`,
                          borderColor: cardBorder,
                          minHeight: 220,
                        }}
                      >
                        <PodiumLottie place={3} size={92} />
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
                          3rd Place
                        </div>
                        <div className="text-lg font-bold leading-tight" style={{ color: ink }}>
                          {maskName(overallBoard[2].user_email ?? overallBoard[2].user_id)}
                        </div>
                        <div className="mt-1 font-semibold" style={{ color: color.teal }}>
                          {overallBoard[2].score} pts
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4–10 list */}
                  {overallBoard.slice(3).map((entry, idx) => {
                    const rank = idx + 4;
                    return (
                      <div
                        key={`${entry.user_id}-${rank}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl ring-1 bg-white mb-2"
                        style={{ borderColor: cardBorder }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex items-center justify-center h-7 w-7 text-xs font-bold rounded-full"
                            style={{ background: `${color.mist}55`, color: ink }}
                          >
                            {rank}
                          </span>
                          <span className="font-medium" style={{ color: ink }}>
                            {maskName(entry.user_email ?? entry.user_id)}
                          </span>
                        </div>
                        <span className="font-semibold" style={{ color: color.teal }}>
                          {entry.score} pts
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </section>

            {/* ===== Per-challenge Leaderboards ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map((q) => {
                const rows = perQuizBoards[q.id] ?? [];
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl p-5 shadow-xl ring-1"
                    style={{
                      background: "#fff",
                      borderColor: cardBorder,
                      boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold leading-snug" style={{ color: ink }}>
                        {q.title}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: sub }}>
                        Highest score · Top 10
                      </p>
                    </div>

                    {rows.length === 0 ? (
                      <p className="text-sm" style={{ color: sub }}>
                        No scores yet for this challenge.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {rows.map((entry, index) => (
                          <li
                            key={`${q.id}-${entry.user_id}-${index}`}
                            className="flex items-center justify-between px-3 py-2 rounded-lg ring-1 bg-white"
                            style={{ borderColor: cardBorder }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-full"
                                style={{ background: `${color.mist}55`, color: ink }}
                              >
                                {index + 1}
                              </span>
                              <span className="font-medium" style={{ color: ink }}>
                                {maskName(entry.user_email ?? entry.user_id)}
                              </span>
                            </div>
                            <span className="font-semibold" style={{ color: color.teal }}>
                              {entry.score} pts
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
    </>
  );
}
