import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Play, BarChart, Trophy, Sparkles,
  ArrowRight, ShieldCheck, Clock, CheckCircle2, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Lottie from "react-lottie";

import createAnimation from "../components/assets/animations/create.json";
import competeAnimation from "../components/assets/animations/comp.json";
import progressAnimation from "../components/assets/animations/progress.json";
import quizAnimation from "../components/assets/animations/quiz.json";
import bookAnimation from "../components/assets/animations/book.json";

import color from "../styles/color";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

type LottieAny = any;

const features = [
  { title: "Interactive Practice", description: "Master concepts through step-by-step problems that adapt to your pace.", icon: BookOpen, animation: createAnimation, link: "/studentDashboard" },
  { title: "Bite-Sized Quizzes", description: "Short, focused challenges that build intuition without the overwhelm.", icon: Play, animation: quizAnimation, link: "/challenge" },
  { title: "Progress You Can See", description: "Track streaks, XP, and goals—stay motivated with visible momentum.", icon: BarChart, animation: progressAnimation, link: "/studentDashboard" },
  { title: "Friendly Competition", description: "Climb leaderboards and challenge friends to sharpen your skills.", icon: Trophy, animation: competeAnimation, link: "/leaderboards" },
];

const topics = [
  { title: "Introduction to Functions", path: "/introductiontopic" },
  { title: "Evaluating Functions", path: "/evaluationtopic" },
  { title: "Piecewise-Defined Functions", path: "/piecewise" },
  { title: "Operations on Functions", path: "/operationstopic" },
  { title: "Composition of Functions", path: "/compositiontopic" },
  { title: "Rational Functions", path: "/rationaltopic" },
  { title: "Vertical, Horizontal and Oblique Asymptotes", path: "/asymptotestopic" },
  { title: "Rational Equations and Inequalities", path: "/rationalinequalitiestopic" },
  { title: "Inverse Functions", path: "/inversetopic" },
  { title: "Exponential Functions", path: "/exponentialtopic" },
  { title: "Logarithmic Functions", path: "/logarithmictopic" },
];

// UTC yyyy-mm-dd (matches daily_challenge_runs.run_date)
const todayUTC = () => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function StudentHome() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const userId = user?.id ?? "";

  // join-by-code UI state
  const [code, setCode] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [mySectionName, setMySectionName] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joinErr, setJoinErr] = useState<string | null>(null);

  // KPI state (from daily_challenge_runs + leaderboard)
  const [streak, setStreak] = useState<number>(0);       // from daily_challenge_runs.streak (today)
  const [xpToday, setXpToday] = useState<number>(0);     // from daily_challenge_runs.score (today)
  const [rankPercent, setRankPercent] = useState<string>("—");
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const lottieOptions = (animationData: LottieAny) => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  });

  // -------- membership (safer: limit(1)) --------
  const loadMembership = useCallback(async () => {
    if (!email && !userId) return;
    const { data } = await supabase
      .from("section_students")
      .select("section_id, sections(name)")
      .or(`student_email.eq.${email},student_id.eq.${userId}`)
      .limit(1);
    if (data && data.length) {
      setMySectionName((data as any)[0]?.sections?.name ?? null);
    } else {
      setMySectionName(null);
    }
  }, [email, userId]);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  // -------- load KPIs from daily_challenge_runs + leaderboard --------
  useEffect(() => {
    const loadStats = async () => {
      if (!userId && !email) return;
      setLoadingStats(true);

      // A) Daily Challenge metrics (today)
      const { data: todayRun } = await supabase
        .from("daily_challenge_runs")
        .select("score, streak")
        .eq("user_id", userId)
        .eq("run_date", todayUTC())
        .maybeSingle();

      setXpToday(todayRun?.score ?? 0);
      setStreak(todayRun?.streak ?? 0);

      // B) Rank percentile on latest quiz (unchanged logic)
      const { data: latestQuizList } = await supabase
        .from("quizzes")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      const latestQuizId = latestQuizList?.[0]?.id as string | undefined;

      if (latestQuizId) {
        const { data: lb } = await supabase.rpc("get_highest_scores_for_quiz", {
          quizid: latestQuizId,
        });

        if (Array.isArray(lb) && lb.length) {
          const sorted = [...lb].sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
          const n = sorted.length;
          const idx = sorted.findIndex(
            (row: any) => row.user_id === userId || row.user_email === email
          );
          if (idx >= 0) {
            const rank = idx + 1;
            const percentile = Math.max(1, Math.round((1 - (rank - 1) / n) * 100));
            setRankPercent(`Top ${percentile}%`);
          } else {
            setRankPercent("—");
          }
        } else {
          setRankPercent("—");
        }
      } else {
        setRankPercent("—");
      }

      setLoadingStats(false);
    };

    loadStats();
  }, [userId, email]);

  // -------- join handler --------
  const handleJoin = async () => {
    setJoinErr(null);
    setJoinMsg(null);

    if (!email || !userId) {
      setJoinErr("Please sign in first.");
      return;
    }

    const cleaned = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(cleaned)) {
      setJoinErr("Enter a valid 6-character code.");
      return;
    }

    setLoadingJoin(true);
    try {
      const { data: section, error: sErr } = await supabase
        .from("sections")
        .select("id, name, join_code, expires_at")
        .eq("join_code", cleaned)
        .limit(1);

      const sec = section?.[0];
      if (sErr) throw sErr;
      if (!sec) {
        setJoinErr("No section found for that code.");
        return;
      }

      // Check if section has expired
      if (sec.expires_at) {
        const expiryDate = new Date(sec.expires_at);
        const now = new Date();
        if (expiryDate <= now) {
          setJoinErr("This section code has expired.");
          return;
        }
      }

      const { error: iErr } = await supabase.from("section_students").insert({
        section_id: sec.id,
        student_email: email,
        student_id: userId,
      });

      if (iErr) {
        if ((iErr as any)?.code === "23505") {
          setJoinErr("You’re already in a section.");
        } else {
          setJoinErr(iErr.message ?? "Could not join section.");
        }
        return;
      }

      await loadMembership();
      setJoinMsg(`Joined section: ${sec.name}`);
      setCode("");
    } catch (e: any) {
      setJoinErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}05)` }}
    >
      {/* decorative bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 40% at 50% -10%, ${color.aqua}33, transparent 60%), radial-gradient(40% 30% at 80% 10%, ${color.teal}22, transparent 60%)`,
        }}
      />

      <header className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
          <div className="flex flex-col-reverse items-center gap-10 md:grid md:grid-cols-2 md:items-center">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur"
                style={{ background: "#fff", border: `1px solid ${color.mist}`, color: color.teal }}
              >
                <Sparkles className="h-4 w-4" />
                Built for Grade 11 General Mathematics
              </span>

              <h1
                className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
                style={{ color: color.deep }}
              >
                Learn by doing—<span style={{ color: color.teal }}>every day.</span>
              </h1>
              <p
                className="mt-4 text-base sm:text-lg md:max-w-xl"
                style={{ color: color.steel }}
              >
                Tugon turns tough topics into friendly, interactive challenges. Build
                intuition, keep a streak, and see your progress grow.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <Link
                  to="/studentDashboard"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold shadow-md transition"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  Start learning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/studentDashboard"
                  className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold transition"
                  style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                >
                  Browse topics
                </Link>
              </div>

              {/* Join Section */}
              <div
                className="mt-6 rounded-2xl p-4 sm:p-5 shadow-md ring-1"
                style={{ background: "#fff", borderColor: `${color.mist}55` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: color.deep }}>
                      {mySectionName ? "Your Section" : "Join your class section"}
                    </h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: color.steel }}>
                      {mySectionName ? (
                        <>
                          You’re in{" "}
                          <span className="font-medium" style={{ color: color.deep }}>
                            {mySectionName}
                          </span>
                          .
                        </>
                      ) : (
                        "Ask your teacher for a 6-character code and enter it here."
                      )}
                    </p>
                  </div>

                  {!mySectionName && (
                    <div className="flex w-full sm:w-auto gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength={6}
                        placeholder="enter code"
                        className="flex-1 sm:w-40 rounded-lg border px-3 py-2 text-sm tracking-widest text-center"
                        style={{
                          borderColor: color.mist,
                          background: "#fff",
                          color: color.deep,
                          letterSpacing: "0.15em",
                        }}
                      />
                      <button
                        onClick={handleJoin}
                        disabled={loadingJoin}
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-60"
                        style={{ background: color.teal, color: "#fff" }}
                      >
                        {loadingJoin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
                      </button>
                    </div>
                  )}
                </div>

                {(joinMsg || joinErr) && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    {joinMsg && (
                      <>
                        <CheckCircle2 className="h-4 w-4" style={{ color: "#059669" }} />
                        <span style={{ color: "#065f46" }}>{joinMsg}</span>
                      </>
                    )}
                    {joinErr && <span style={{ color: "#b91c1c" }}>{joinErr}</span>}
                  </div>
                )}
              </div>

              {/* Trust bullets */}
              <ul className="mt-6 flex flex-col sm:flex-row gap-3 text-sm" style={{ color: color.steel }}>
                <li className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" style={{ color: "#059669" }} /> No ads, just learning
                </li>
                <li className="flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5" style={{ color: color.teal }} /> Progress saved securely
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" style={{ color: color.aqua }} /> 5–10 minutes a day
                </li>
              </ul>
            </motion.div>

            {/* Right column visual (live KPIs from daily_challenge_runs) */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full"
            >
              <div
                className="mx-auto max-w-md md:max-w-none rounded-3xl p-4 shadow-xl ring-1 backdrop-blur"
                style={{ background: "#fff", borderColor: `${color.mist}55` }}
              >
                <div className="rounded-2xl overflow-hidden">
                  <Lottie options={lottieOptions(bookAnimation)} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-xs" style={{ color: color.steel }}>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    Daily Streak:{" "}
                    <span className="font-semibold" style={{ color: color.deep }}>
                      {loadingStats ? "…" : streak}
                    </span>
                  </div>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    XP Today:{" "}
                    <span className="font-semibold" style={{ color: color.deep }}>
                      {loadingStats ? "…" : xpToday}
                    </span>
                  </div>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    Rank:{" "}
                    <span className="font-semibold" style={{ color: color.deep }}>
                      {loadingStats ? "…" : rankPercent}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ---------------- Main sections ---------------- */}
      <main className="flex-grow">
        {/* Topics */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: color.deep }}>
            Popular Topics
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link
                key={t.path}
                to={t.path}
                className="rounded-full border px-4 py-2 text-sm transition"
                style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
              >
                {t.title}
              </Link>
            ))}
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
                className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 transition"
                style={{ borderColor: `${color.mist}33` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                  <div className="col-span-2 p-6 sm:p-8">
                    <div className="inline-flex items-center justify-center rounded-xl p-3" style={{ background: `${color.teal}22` }}>
                      <feature.icon className="h-6 w-6" style={{ color: color.teal }} />
                    </div>
                    <h3 className="mt-4 text-lg sm:text-xl font-semibold" style={{ color: color.deep }}>
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: color.steel }}>
                      {feature.description}
                    </p>
                    <Link to={feature.link} className="mt-4 inline-flex items-center font-medium hover:underline" style={{ color: color.teal }}>
                      {/* link affordance */}
                    </Link>
                  </div>
                  <div className="sm:border-l bg-gradient-to-b p-4 sm:p-6" style={{ borderColor: `${color.mist}33`, background: `${color.mist}11` }}>
                    <div className="rounded-2xl overflow-hidden">
                      <Lottie options={lottieOptions(feature.animation)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div
            className="rounded-3xl px-6 sm:px-10 py-10 sm:py-12 text-white shadow-lg"
            style={{ background: `linear-gradient(to right, ${color.teal}, ${color.aqua})` }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold">Learn smarter</h3>
                <p className="mt-2 max-w-md text-white/90">
                  Short lessons, interactive questions, instant feedback. No fluff—just understanding.
                </p>
              </div>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-5 w-5 text-white" /> Personalized practice and hints
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-5 w-5 text-white" /> Streaks and goals keep you on track
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-5 w-5 text-white" /> Built for SHS Gen Math
                </li>
              </ul>
              <div className="flex md:justify-end">
                <Link
                  to="/studentDashboard"
                  className="inline-flex items-center rounded-xl bg-white px-5 py-3 font-semibold shadow-md transition"
                  style={{ color: color.teal }}
                >
                  Continue your journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-12 sm:my-16">
          <div className="rounded-3xl border bg-white p-6 sm:p-10 shadow-sm" style={{ borderColor: color.mist }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold" style={{ color: color.deep }}>
                  Make today Day 1 of your streak.
                </h3>
                <p className="mt-2" style={{ color: color.steel }}>
                  5–10 minutes is all it takes. Learn a little—every day.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/studentDashboard"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold shadow-md transition"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  Get started
                </Link>
                <Link
                  to="/studentDashboard"
                  className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold transition"
                  style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                >
                  View syllabus
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default StudentHome;
