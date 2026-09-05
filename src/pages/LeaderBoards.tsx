import React, { useEffect, useMemo, useRef, useState } from "react";
import { Trophy, Loader2, ArrowLeft, Users, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";
import Lottie from "lottie-react";

import trophyAnim from "../components/assets/animations/Trophy.json";
import winnerAnim from "../components/assets/animations/Winner.json";
import winner1Anim from "../components/assets/animations/Winner (1).json";

// 🔊 Achievement SFX when user is in Overall Top 10
import achievementSfxSrc from "../components/assets/sound/Achievement.mp3";

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

type SchoolKey = "ALL" | "UE" | "BNHS" | "OTHERS";

/** Show only the part before '@' (no domain). */
const baseName = (input: string): string => {
  if (!input) return "";
  if (input.includes("@")) return input.split("@")[0];
  return input;
};

/** Partially mask a string with asterisks, keeping a few edge characters visible. */
const maskPrivate = (s: string): string => {
  const str = s ?? "";
  const n = str.length;
  if (n === 0) return "";
  if (n === 1) return "*";
  if (n === 2) return str[0] + "*";
  if (n === 3) return str[0] + "*" + str[2];

  // n >= 4
  if (n <= 6) {
    // keep first 2, last 1
    const keepStart = 2;
    const keepEnd = 1;
    const stars = Math.max(1, n - keepStart - keepEnd);
    return str.slice(0, keepStart) + "*".repeat(stars) + str.slice(n - keepEnd);
  }
  // n > 6, keep first 2 and last 2
  const keepStart = 2;
  const keepEnd = 2;
  const stars = Math.max(1, n - keepStart - keepEnd);
  return str.slice(0, keepStart) + "*".repeat(stars) + str.slice(n - keepEnd);
};

/** Convenient helper: take email or id, derive base label, then mask. */
const maskedLabel = (emailOrId?: string | null): string => {
  if (!emailOrId) return "";
  return maskPrivate(baseName(emailOrId));
};

/** Map email → school bucket */
const schoolFromEmail = (email?: string | null): SchoolKey => {
  if (!email) return "OTHERS";
  const low = email.toLowerCase();
  if (low.endsWith("@ue.edu.ph")) return "UE";
  if (low.endsWith("@bnhs.com")) return "BNHS";
  return "OTHERS";
};

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

/** Simple popup modal */
function CongratsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl ring-1 p-5"
        style={{ background: "#fff", borderColor: `${color.mist}` }}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-black/5"
          aria-label="Close"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div
            className="mx-auto mb-3 h-14 w-14 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`, color: "#fff" }}
          >
            🏆
          </div>
          <h3 className="text-lg font-extrabold" style={{ color: color.deep }}>
            Congratulations!
          </h3>
          <p className="mt-1 text-sm" style={{ color: color.steel }}>
            You are in the <strong>overall top 10</strong>.
          </p>
          <button
            onClick={onClose}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-semibold"
            style={{
              background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            }}
          >
            Nice!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboards() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Store the raw per-quiz boards (unsliced) so we can filter by school and slice after.
  const [perQuizBoardsRaw, setPerQuizBoardsRaw] = useState<PerQuizBoards>({});
  const [selectedSchool, setSelectedSchool] = useState<SchoolKey>("ALL");

  // 🔊 Achievement SFX (plays once if user appears in Overall Top 10)
  const achievementRef = useRef<HTMLAudioElement | null>(null);
  const [playedAchievement, setPlayedAchievement] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  // Init achievement audio
  useEffect(() => {
    const a = new Audio(achievementSfxSrc);
    a.preload = "auto";
    a.volume = 0.9;
    achievementRef.current = a;
    return () => {
      achievementRef.current = null;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: qz, error: qErr } = await supabase
          .from("quizzes")
          .select("id, title")
          .order("created_at", { ascending: false });

        if (qErr) throw qErr;
        const quizzesList = (qz ?? []) as Quiz[];
        setQuizzes(quizzesList);

        if (quizzesList.length === 0) {
          setPerQuizBoardsRaw({});
          setLoading(false);
          return;
        }

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

        const perQuizRaw: PerQuizBoards = {};
        for (const r of results) perQuizRaw[r.quizId] = r.rows as LeaderboardEntry[];
        setPerQuizBoardsRaw(perQuizRaw);
      } catch (err) {
        console.error("Failed to load leaderboards:", err);
        setPerQuizBoardsRaw({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ========= Helpers =========
  const isMe = (entry: { user_id?: string | null; user_email?: string | null }) => {
    if (!user) return false;
    const byId = entry.user_id && user.id && entry.user_id === user.id;
    const byEmail =
      entry.user_email &&
      user.email &&
      entry.user_email.toLowerCase() === user.email.toLowerCase();
    return Boolean(byId || byEmail);
  };

  // Filter helpers
  const matchesSchool = (entry: LeaderboardEntry) => {
    if (selectedSchool === "ALL") return true;
    return schoolFromEmail(entry.user_email) === selectedSchool;
  };

  // Per-quiz boards after applying school filter (then slice to Top 10)
  const perQuizBoards: PerQuizBoards = useMemo(() => {
    const out: PerQuizBoards = {};
    for (const [quizId, rows] of Object.entries(perQuizBoardsRaw)) {
      out[quizId] = rows.filter(matchesSchool).slice(0, 10);
    }
    return out;
  }, [perQuizBoardsRaw, selectedSchool]);

  // Overall leaderboard: sum each user's best-for-quiz across ALL quizzes (using filtered rows).
  const overallBoard = useMemo<LeaderboardEntry[]>(() => {
    const byUser: Record<string, LeaderboardEntry> = {};
    for (const rows of Object.values(perQuizBoardsRaw)) {
      for (const row of rows) {
        if (!matchesSchool(row)) continue;
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
    return Object.values(byUser)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 10);
  }, [perQuizBoardsRaw, selectedSchool]);

  // 🔊 Only trigger if I'm in the OVERALL Top 10 (NOT per-topic).
  useEffect(() => {
    if (playedAchievement || !user || loading) return;
    const inOverall = overallBoard.some(isMe);
    if (inOverall) {
      try {
        achievementRef.current?.play();
      } catch (e) {
        console.warn("Achievement sound play failed:", e);
      }
      setPlayedAchievement(true);
      setShowCongrats(true);
    }
  }, [overallBoard, user, loading, playedAchievement]);

  const gradient = `linear-gradient(135deg, ${color.ocean} 0%, ${color.teal} 55%, ${color.aqua} 100%)`;
  const cardBorder = `${color.mist}66`;
  const ink = color.deep;
  const sub = color.steel;

  // Badge component for "ME"
  const MeBadge = () => (
    <span
      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ background: `${color.teal}`, color: "#fff", letterSpacing: 0.6 }}
    >
      ME
    </span>
  );

  // Name renderer with highlight if me
  const NameCell = ({ entry }: { entry: LeaderboardEntry }) => {
    const mine = isMe(entry);
    return (
      <span
        className="font-medium"
        style={{
          color: mine ? color.teal : ink,
        }}
      >
        {maskedLabel(entry.user_email ?? entry.user_id)}
        {mine && <MeBadge />}
      </span>
    );
  };

  // Card ring highlight if includes me (for podium only)
  const includesMe = (entry?: LeaderboardEntry) => (entry ? isMe(entry) : false);

  return (
    <>
      {/* Ensure dropdown options (popup) are readable even with a translucent trigger */}
      <style>{`
        select.school-filter option {
          color: #111;
          background: #fff;
        }
      `}</style>

      {/* Congrats popup */}
      <CongratsModal open={showCongrats} onClose={() => setShowCongrats(false)} />

      <header className="relative" style={{ background: gradient }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:text-white transition focus:outline-none"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* School Filter Dropdown — translucent/glassy like before, but readable */}
            <div
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border bg-white/10 backdrop-blur"
              style={{
                borderColor: "#ffffff44",
                zIndex: 50, // keep the menu above the header
              }}
            >
              <span className="text-sm text-white/90">Filter by school:</span>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value as SchoolKey)}
                className="school-filter text-sm outline-none text-white bg-transparent cursor-pointer"
                style={{
                  WebkitAppearance: "menulist" as any,
                  MozAppearance: "menulist",
                  appearance: "menulist",
                  border: "none",
                  padding: "4px 6px",
                  borderRadius: 8,
                }}
              >
                <option className="text-gray-900" value="ALL">All Schools</option>
                <option className="text-gray-900" value="UE">University of the East</option>
                <option className="text-gray-900" value="BNHS">BNHS</option>
                <option className="text-gray-900" value="OTHERS">Others</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            <h1 className="text-3xl font-extrabold tracking-tight">Leaderboards</h1>
          </div>

          <p className="mt-2 text-white/90 max-w-2xl">
            Overall ranking adds your best score from each challenge. Use the school filter to view rankings by organization.
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
                  {selectedSchool === "ALL"
                    ? "Overall · Top 10"
                    : `${
                        selectedSchool === "UE"
                          ? "University of the East"
                          : selectedSchool === "BNHS"
                          ? "BNHS"
                          : "Others"
                      } · Top 10`}
                </span>
              </div>

              {overallBoard.length === 0 ? (
                <p className="text-center" style={{ color: sub }}>
                  No scores yet.
                </p>
              ) : (
                <>
                  {/* Podium */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 items-end">
                    {overallBoard[0] && (
                      <div
                        className="order-1 sm:order-2 rounded-2xl px-8 pt-8 pb-9 text-center ring-2 flex flex-col items-center -translate-y-0 sm:-translate-y-4"
                        style={{
                          background: `linear-gradient(135deg, ${color.teal}12, #ffffff)`,
                          borderColor: includesMe(overallBoard[0]) ? color.teal : color.teal,
                          boxShadow: `0 18px 44px ${color.teal}33`,
                          minHeight: 290,
                          outline: includesMe(overallBoard[0]) ? `3px solid ${color.teal}` : undefined,
                        }}
                      >
                        <PodiumLottie place={1} size={170} />
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
                          1st Place
                        </div>
                        <div className="text-2xl font-extrabold leading-tight" style={{ color: includesMe(overallBoard[0]) ? color.teal : ink }}>
                          {maskedLabel(overallBoard[0].user_email ?? overallBoard[0].user_id)}
                          {isMe(overallBoard[0]) && <MeBadge />}
                        </div>
                        <div className="mt-2 text-xl font-extrabold" style={{ color: color.teal }}>
                          {overallBoard[0].score} pts
                        </div>
                      </div>
                    )}

                    {overallBoard[1] && (
                      <div
                        className="order-2 sm:order-1 rounded-2xl px-5 pt-5 pb-6 text-center ring-1 flex flex-col items-center sm:translate-y-6"
                        style={{
                          background: `linear-gradient(135deg, #ffffff, ${color.mist}11)`,
                          borderColor: includesMe(overallBoard[1]) ? color.teal : cardBorder,
                          minHeight: 220,
                          outline: includesMe(overallBoard[1]) ? `2px solid ${color.teal}` : undefined,
                        }}
                      >
                        <PodiumLottie place={2} size={96} />
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
                          2nd Place
                        </div>
                        <div className="text-lg font-bold leading-tight" style={{ color: includesMe(overallBoard[1]) ? color.teal : ink }}>
                          {maskedLabel(overallBoard[1].user_email ?? overallBoard[1].user_id)}
                          {isMe(overallBoard[1]) && <MeBadge />}
                        </div>
                        <div className="mt-1 font-semibold" style={{ color: color.teal }}>
                          {overallBoard[1].score} pts
                        </div>
                      </div>
                    )}

                    {overallBoard[2] && (
                      <div
                        className="order-3 sm:order-3 rounded-2xl px-5 pt-5 pb-6 text-center ring-1 flex flex-col items-center sm:translate-y-6"
                        style={{
                          background: `linear-gradient(135deg, #ffffff, ${color.mist}11)`,
                          borderColor: includesMe(overallBoard[2]) ? color.teal : cardBorder,
                          minHeight: 220,
                          outline: includesMe(overallBoard[2]) ? `2px solid ${color.teal}` : undefined,
                        }}
                      >
                        <PodiumLottie place={3} size={92} />
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
                          3rd Place
                        </div>
                        <div className="text-lg font-bold leading-tight" style={{ color: includesMe(overallBoard[2]) ? color.teal : ink }}>
                          {maskedLabel(overallBoard[2].user_email ?? overallBoard[2].user_id)}
                          {isMe(overallBoard[2]) && <MeBadge />}
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
                    const mine = isMe(entry);
                    return (
                      <div
                        key={`${entry.user_id}-${rank}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl ring-1 bg-white mb-2"
                        style={{
                          borderColor: mine ? color.teal : cardBorder,
                          outline: mine ? `2px solid ${color.teal}` : undefined,
                          boxShadow: mine ? `0 8px 22px ${color.teal}22` : undefined,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex items-center justify-center h-7 w-7 text-xs font-bold rounded-full"
                            style={{ background: mine ? color.teal : `${color.mist}55`, color: mine ? "#fff" : "#111" }}
                          >
                            {rank}
                          </span>
                          <NameCell entry={entry} />
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
                        {selectedSchool !== "ALL" &&
                          ` · ${
                            selectedSchool === "UE"
                              ? "University of the East"
                              : selectedSchool === "BNHS"
                              ? "BNHS"
                              : "Others"
                          }`}
                      </p>
                    </div>

                    {rows.length === 0 ? (
                      <p className="text-sm" style={{ color: sub }}>
                        No scores yet for this challenge.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {rows.map((entry, index) => {
                          const mine = isMe(entry);
                          return (
                            <li
                              key={`${q.id}-${entry.user_id}-${index}`}
                              className="flex items-center justify-between px-3 py-2 rounded-lg ring-1 bg-white"
                              style={{
                                borderColor: mine ? color.teal : cardBorder,
                                outline: mine ? `2px solid ${color.teal}` : undefined,
                                boxShadow: mine ? `0 6px 16px ${color.teal}22` : undefined,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-full"
                                  style={{ background: mine ? color.teal : `${color.mist}55`, color: mine ? "#fff" : "#111" }}
                                >
                                  {index + 1}
                                </span>
                                <NameCell entry={entry} />
                              </div>
                              <span className="font-semibold" style={{ color: color.teal }}>
                                {entry.score} pts
                              </span>
                            </li>
                          );
                        })}
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
