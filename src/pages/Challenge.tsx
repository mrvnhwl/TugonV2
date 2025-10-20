import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Clock,
  Flame,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty?: Difficulty | null;
  estimated_minutes?: number | null;
  created_at?: string | null;
  publish_to?: string[] | null;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string | null;
  score: number | null;
  created_at: string | null;
}

interface UserProgress {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number | null;
  completed_at: string | null;
  duration_seconds?: number | null;
}

/* ---------- UI bits ---------- */
function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: { bg: `${color.mist}1a`, border: `${color.mist}55`, text: color.steel },
    success: { bg: "#10b9811a", border: "#10b98155", text: "#047857" },
    warning: { bg: "#f59e0b1a", border: "#f59e0b55", text: "#92400e" },
    danger:  { bg: "#ef44441a", border: "#ef444455", text: "#991b1b" },
  }[tone];

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ background: tones.bg, borderColor: tones.border, color: tones.text }}
    >
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 border animate-pulse"
      style={{ borderColor: `${color.mist}55`, background: "#fff" }}
    >
      <div className="h-5 w-1/2 rounded mb-3" style={{ background: `${color.mist}33` }} />
      <div className="h-4 w-4/5 rounded mb-2" style={{ background: `${color.mist}22` }} />
      <div className="h-4 w-3/5 rounded mb-5" style={{ background: `${color.mist}22` }} />
      <div className="flex justify-between items-center">
        <div className="h-6 w-32 rounded" style={{ background: `${color.mist}22` }} />
        <div className="h-9 w-28 rounded" style={{ background: `${color.mist}33` }} />
      </div>
    </div>
  );
}

/* ---------- Confirm-on-start modal ---------- */
function ConfirmStartModal({
  open,
  quizTitle,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  quizTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal
          role="dialog"
        >
          <div className="absolute inset-0 backdrop-blur bg-black/30" />
          <motion.div
            className="relative w-full max-w-md rounded-2xl shadow-2xl"
            initial={{ scale: 0.95, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            style={{ background: "#fff", border: `1px solid ${color.mist}` }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: color.mist }}>
              <h3 className="font-bold text-lg" style={{ color: color.deep }}>
                Are you sure you want to enter this quiz?
              </h3>
              <button onClick={onCancel} className="p-1 rounded hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4 text-sm" style={{ color: color.steel }}>
              <div className="font-semibold mb-1" style={{ color: color.deep }}>
                {quizTitle}
              </div>
              You can only attempt this challenge <strong>once</strong>. Starting now will consume your only attempt.
            </div>

            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="rounded-xl px-4 py-2 font-semibold border"
                style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-xl px-4 py-2 font-semibold"
                style={{ background: color.teal, color: "#fff", opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? "Starting…" : "Yes, start quiz"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Challenge() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [authChecked, setAuthChecked] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptsAll, setAttemptsAll] = useState<QuizAttempt[]>([]);
  const [myAttemptedMap, setMyAttemptedMap] = useState<Record<string, boolean>>({});
  const [progressRows, setProgressRows] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"" | Difficulty>("");
  const [sortBy, setSortBy] = useState<"new" | "popular" | "time" | "best">("new");

  // Start-confirm modal state
  const [startOpen, setStartOpen] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState<Quiz | null>(null);

  // ✅ On mount, confirm session once and subscribe to changes
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login", { replace: true });
        return;
      }
      setAuthChecked(true);
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) navigate("/login", { replace: true });
      });
      unsub = () => listener.subscription.unsubscribe();
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [navigate]);

  // After auth confirmed, load page data
  useEffect(() => {
    if (!authChecked) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  const loadAll = async () => {
    try {
      setLoading(true);
      // 1) Load quizzes (include publish_to)
      const { data: quizzesData, error: quizzesErr } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (quizzesErr) throw quizzesErr;
      const qz = (quizzesData as Quiz[]) ?? [];

      // --- determine student's section ids via section_students table ---
      // section_students has rows { student_id, section_id }
      let studentSectionIds: string[] = [];
      if (user) {
        try {
          const { data: ssRows, error: ssErr } = await supabase
            .from("section_students")
            .select("section_id")
            .eq("student_id", user.id);
          if (ssErr) throw ssErr;
          for (const r of (ssRows ?? []) as any[]) {
            if (r.section_id) studentSectionIds.push(r.section_id);
          }
          studentSectionIds = Array.from(new Set(studentSectionIds.filter(Boolean)));
        } catch (e) {
          console.warn("Failed to fetch section_students:", e);
          studentSectionIds = [];
        }
      }

      // --- filter quizzes: ONLY include quizzes that explicitly list section ids and match the student's section(s) ---
      // Do NOT show quizzes where publish_to is null/empty. Normalize both sides to strings to avoid type mismatches.
      const studentSectionIdsStr = studentSectionIds.map((s) => String(s));
      const normalizePublishTo = (pub: any): string[] => {
        if (!pub) return [];
        if (Array.isArray(pub)) return pub.map((x) => String(x));
        if (typeof pub === "string") {
          // maybe a JSON array string like '["id1","id2"]' or comma-separated
          try {
            const parsed = JSON.parse(pub);
            if (Array.isArray(parsed)) return parsed.map((x) => String(x));
          } catch {}
          // fallback: comma separated
          return pub.split(",").map((x) => x.trim()).filter(Boolean).map((x) => String(x));
        }
        // other types
        return [String(pub)];
      };

      const filteredQz = qz.filter((qq) => {
        if (!user) return false; // require login
        if (!studentSectionIdsStr.length) return false; // no sections -> nothing
        const pubs = normalizePublishTo(qq.publish_to);
        if (!pubs.length) return false;
        return pubs.some((p) => studentSectionIdsStr.includes(p));
      });

      setQuizzes(filteredQz);

      // if no quizzes after filtering, clear dependent state and return early
      if (filteredQz.length === 0) {
        setAttemptsAll([]);
        setMyAttemptedMap({});
        setProgressRows([]);
        return;
      }

      // use filtered list for subsequent queries
      const quizIds = filteredQz.map((q) => q.id);

      // 2) Attempts (ALL)
      const { data: aAll, error: aAllErr } = await supabase
        .from("quiz_attempts")
        .select("id, quiz_id, user_id, score, created_at")
        .in("quiz_id", quizIds);

      if (aAllErr) throw aAllErr;
      setAttemptsAll((aAll as QuizAttempt[]) ?? []);

      // 3) My attempts (gate)
      if (user) {
        const { data: aMine, error: aMineErr } = await supabase
          .from("quiz_attempts")
          .select("quiz_id")
          .eq("user_id", user.id)
          .in("quiz_id", quizIds);

        if (aMineErr) throw aMineErr;
        const map: Record<string, boolean> = {};
        for (const row of (aMine ?? []) as { quiz_id: string }[]) {
          map[row.quiz_id] = true;
        }
        setMyAttemptedMap(map);
      } else {
        setMyAttemptedMap({});
      }

      // 4) Progress (all users)
      const { data: pData, error: pErr } = await supabase
        .from("user_progress")
        .select("*")
        .in("quiz_id", quizIds);

      if (pErr) throw pErr;
      setProgressRows((pData as UserProgress[]) ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  // --- insert attempt on Start (only if none exists) ---
  async function logAttemptOnce(quizId: string, userId: string) {
    // Add UNIQUE(quiz_id, user_id) in DB to enforce on the server too.
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({ quiz_id: quizId, user_id: userId, score: null })
      .select()
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        return { alreadyAttempted: true as const, attempt: null };
      }
      throw error;
    }
    return { alreadyAttempted: false as const, attempt: data as QuizAttempt };
  }

  // Open confirm modal instead of instant start
  const openStartConfirm = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
    quiz: Quiz
  ) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (myAttemptedMap[quiz.id]) {
      toast.info("You’ve already attempted this challenge.");
      return;
    }
    setPendingQuiz(quiz);
    setStartOpen(true);
  };

  // Confirm from modal → create attempt → navigate
  const confirmStart = async () => {
    if (!pendingQuiz || !user) return;
    try {
      setStartBusy(true);
      const res = await logAttemptOnce(pendingQuiz.id, user.id);

      if (res.alreadyAttempted) {
        setMyAttemptedMap((m) => ({ ...m, [pendingQuiz.id]: true }));
        toast.info("You’ve already attempted this challenge.");
        setStartOpen(false);
        setStartBusy(false);
        return;
      }

      // Optimistic UI updates
      if (res.attempt) {
        setAttemptsAll((prev) => [...prev, res.attempt!]);
        setMyAttemptedMap((m) => ({ ...m, [pendingQuiz.id]: true }));
      }

      setStartOpen(false);
      setStartBusy(false);
      navigate(`/quiz/${pendingQuiz.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t start the quiz");
      setStartBusy(false);
    }
  };

  // Derived maps
  const attemptsCountByQuiz = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of attemptsAll) {
      map[row.quiz_id] = (map[row.quiz_id] ?? 0) + 1;
    }
    return map;
  }, [attemptsAll]);

  const bestScoreByQuizGlobal = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of progressRows) {
      const s = row.score ?? 0;
      if (s > (map[row.quiz_id] ?? 0)) map[row.quiz_id] = s;
    }
    return map;
  }, [progressRows]);

  const bestScoreByQuizForUser = useMemo(() => {
    const map: Record<string, number> = {};
    if (!user) return map;
    for (const row of progressRows) {
      if (row.user_id !== user.id) continue;
      const s = row.score ?? 0;
      if (s > (map[row.quiz_id] ?? 0)) map[row.quiz_id] = s;
    }
    return map;
  }, [progressRows, user]);

  // Average duration (minutes) if you later add `duration_seconds` in user_progress
  const avgMinutesByQuiz = useMemo(() => {
    const map: Record<string, number> = {};
    const accum: Record<string, { sum: number; n: number }> = {};
    for (const row of progressRows) {
      const hasDuration = Object.prototype.hasOwnProperty.call(row, "duration_seconds");
      const dur = (row as any).duration_seconds as number | null | undefined;
      if (hasDuration && typeof dur === "number" && isFinite(dur) && dur > 0) {
        const a = (accum[row.quiz_id] ??= { sum: 0, n: 0 });
        a.sum += dur;
        a.n += 1;
      }
    }
    for (const quiz_id of Object.keys(accum)) {
      const { sum, n } = accum[quiz_id];
      map[quiz_id] = Math.round(sum / n / 60);
    }
    return map;
  }, [progressRows]);

  // Top-bar stats
  const topBar = useMemo(() => {
    const maxYourScore = Math.max(0, ...Object.values(bestScoreByQuizForUser));

    const perQuizMinutes = quizzes.map((q) => {
      return (
        avgMinutesByQuiz[q.id] ??
        (typeof q.estimated_minutes === "number" ? q.estimated_minutes : 15)
      );
    });
    const avgTimeAll =
      perQuizMinutes.length > 0
        ? Math.round(perQuizMinutes.reduce((a, b) => a + b, 0) / perQuizMinutes.length)
        : 15;

    return { maxYourScore, avgTimeAll };
  }, [bestScoreByQuizForUser, avgMinutesByQuiz, quizzes]);

  // Filtering / sorting
  const filtered = useMemo(() => {
    let list = [...quizzes];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (x) =>
          x.title?.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q)
      );
    }
    if (difficulty) {
      list = list.filter((x) => (x.difficulty ?? "Beginner") === difficulty);
    }

    switch (sortBy) {
      case "popular":
        list.sort(
          (a, b) =>
            (attemptsCountByQuiz[b.id] ?? 0) - (attemptsCountByQuiz[a.id] ?? 0)
        );
        break;
      case "time":
        list.sort((a, b) => {
          const aMin =
            avgMinutesByQuiz[a.id] ??
            (typeof a.estimated_minutes === "number" ? a.estimated_minutes : 999);
          const bMin =
            avgMinutesByQuiz[b.id] ??
            (typeof b.estimated_minutes === "number" ? b.estimated_minutes : 999);
          return aMin - bMin;
        });
        break;
      case "best":
        list.sort(
          (a, b) =>
            (bestScoreByQuizGlobal[b.id] ?? 0) - (bestScoreByQuizGlobal[a.id] ?? 0)
        );
        break;
      default: // "new"
        list.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
    }
    return list;
  }, [
    quizzes,
    query,
    difficulty,
    sortBy,
    attemptsCountByQuiz,
    avgMinutesByQuiz,
    bestScoreByQuizGlobal,
  ]);

  const difficultyTone = (d?: Difficulty | null) =>
    d === "Advanced" ? "danger" : d === "Intermediate" ? "warning" : "success";

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      {/* Distinct Hero */}
      <header
        className="relative"
        style={{
          background: `linear-gradient(135deg, ${color.ocean} 0%, ${color.teal} 55%, ${color.aqua} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/studentDashboard")}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:text-white transition focus:outline-none"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="rounded-2xl p-5" style={{ background: "#ffffff14", border: `1px solid #ffffff22` }}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5" />
                <h3 className="font-semibold">Active Challenges</h3>
              </div>
              <p className="text-2xl font-extrabold">{quizzes.length}</p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "#ffffff14", border: `1px solid #ffffff22` }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <h3 className="font-semibold">Avg. Time</h3>
              </div>
              <p className="text-2xl font-extrabold">{topBar.avgTimeAll} mins</p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "#ffffff14", border: `1px solid #ffffff22` }}>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5" />
                <h3 className="font-semibold">Best Score (You)</h3>
              </div>
              <p className="text-2xl font-extrabold">
                {topBar.maxYourScore}
              </p>
            </div>
          </div>
        </div>
        {/* wave divider */}
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden>
          <path
            d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </header>

      {/* Sticky Controls */}
      <div
        className="sticky top-0 z-40"
        style={{ background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* Search */}
            <div
              className="relative flex items-center gap-2 rounded-xl px-3 py-2 border flex-1"
              style={{ borderColor: `${color.mist}66`, background: "#fff" }}
            >
              <Search className="h-4 w-4" style={{ color: color.steel }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search challenges..."
                className="w-full outline-none text-sm"
                style={{ color: color.deep, WebkitAppearance: "none" as any }}
              />
            </div>

            {/* Difficulty */}
            <div
              className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 border"
              style={{ borderColor: `${color.mist}66`, background: "#fff" }}
            >
              <SlidersHorizontal className="h-4 w-4" style={{ color: color.steel }} />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
                className="text-sm outline-none bg-transparent pr-6"
                style={{ color: color.deep, WebkitAppearance: "menulist" as any }}
              >
                <option value="">All levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Sort */}
            <div
              className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 border"
              style={{ borderColor: `${color.mist}66`, background: "#fff" }}
            >
              <Target className="h-4 w-4" style={{ color: color.steel }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm outline-none bg-transparent pr-6"
                style={{ color: color.deep, WebkitAppearance: "menulist" as any }}
              >
                <option value="new">Newest</option>
                <option value="popular">Most Attempted</option>
                <option value="time">Shortest Time</option>
                <option value="best">Highest Best Score</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold" style={{ color: color.deep }}>
              No challenges match your filters
            </p>
            <p className="text-sm mt-1" style={{ color: color.steel }}>
              Try adjusting your search or difficulty level.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setQuery("");
                  setDifficulty("");
                  setSortBy("new");
                }}
                className="px-4 py-2 rounded-lg font-semibold transition focus:outline-none"
                style={{
                  background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                  color: "#fff",
                }}
              >
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {filtered.map((quiz) => {
              const d = (quiz.difficulty ?? "Beginner") as Difficulty;
              const tone =
                d === "Advanced" ? "danger" : d === "Intermediate" ? "warning" : "success";

              const attemptsCount = attemptsCountByQuiz[quiz.id] ?? 0;
              const globalBest = bestScoreByQuizGlobal[quiz.id] ?? 0;
              const yourBest = bestScoreByQuizForUser[quiz.id] ?? 0;

              const minutes =
                avgMinutesByQuiz[quiz.id] ??
                (typeof quiz.estimated_minutes === "number" ? quiz.estimated_minutes : 15);

              const alreadyAttempted = !!myAttemptedMap[quiz.id];

              return (
                <motion.div
                  key={quiz.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                >
                  <div
                    className="group rounded-2xl p-5 border h-full flex flex-col"
                    style={{
                      borderColor: `${color.mist}55`,
                      background: "#fff",
                      boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                      transition: "transform 180ms ease, box-shadow 180ms ease",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-snug" style={{ color: color.deep }}>
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Chip tone={tone}>{d}</Chip>
                        {alreadyAttempted && <Chip tone="neutral">Attempted</Chip>}
                      </div>
                    </div>

                    <p className="text-sm mt-2 line-clamp-3" style={{ color: color.steel }}>
                      {quiz.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1.5" style={{ color: color.steel }}>
                        <Clock className="h-4 w-4" /> ~{minutes} mins
                      </span>
                      <span className="inline-flex items-center gap-1.5" style={{ color: color.steel }}>
                        <Flame className="h-4 w-4" /> {attemptsCount} attempts
                      </span>
                      <span className="inline-flex items-center gap-1.5" style={{ color: color.steel }}>
                        <Trophy className="h-4 w-4" /> Best: {globalBest}
                      </span>
                      <span className="inline-flex items-center gap-1.5" style={{ color: color.steel }}>
                        <Trophy className="h-4 w-4" /> Your best: {yourBest}
                      </span>
                    </div>

                    <div className="mt-4 flex-1" />

                    <div className="mt-4 flex justify-between items-center">
                      {/* progress bar shows your best */}
                      <div className="h-1.5 rounded-full w-1/2" style={{ background: `${color.mist}33` }} aria-hidden>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, yourBest))}%`,
                            background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                          }}
                        />
                      </div>

                      {/* Start button now opens confirm modal */}
                      <Link
                        to={alreadyAttempted ? "#" : `/quiz/${quiz.id}`}
                        onClick={(e) =>
                          alreadyAttempted
                            ? (e.preventDefault(), toast.info("You can only attempt this challenge once."))
                            : openStartConfirm(e, quiz)
                        }
                        aria-disabled={alreadyAttempted}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition focus:outline-none ${
                          alreadyAttempted ? "pointer-events-none opacity-60" : ""
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                          color: "#fff",
                        }}
                      >
                        <Play className="h-4 w-4" />
                        {alreadyAttempted ? "Attempted" : "Start"}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Confirm-on-start modal */}
      <ConfirmStartModal
        open={startOpen}
        quizTitle={pendingQuiz?.title}
        onCancel={() => setStartOpen(false)}
        onConfirm={confirmStart}
        loading={startBusy}
      />
    </div>
  );
}
