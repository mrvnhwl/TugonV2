// src/pages/reviewer/TugonSense.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../components/CourseCard";
import ProgressMap from "../../components/ProgressMap";
import { courses } from "../../components/data/questions/index";
import { useProgress } from "../../components/tugon/services/useProgress";
import color from "@/styles/color";

/** Tugon logo (gradient badge + white “T”) – uses the main palette */
function TugonLogo({ size = 32 }: { size?: number }) {
  const id = "tugonGrad";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Tugon logo">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color.teal} />
          <stop offset="100%" stopColor={color.aqua} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id})`} />
      <rect x="7" y="9" width="18" height="4" rx="2" fill="#fff" />
      <rect x="14" y="13" width="4" height="12" rx="2" fill="#fff" />
    </svg>
  );
}

export default function TugonSense() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const { getTopicProgress, getStatistics } = useProgress();

  const clampedIndex = Math.min(Math.max(activeIndex, 0), courses.length - 1);
  const activeCourse = courses[clampedIndex];

  const activeTopicProgress = getTopicProgress(activeCourse.id);
  const stats = getStatistics();

  // Compact status tile (avoid repeating big topic title from CourseCard)
  const topicStatus = useMemo(() => {
    const pct = Math.round(activeTopicProgress?.completionPercentage ?? 0);
    if (!activeTopicProgress || pct === 0) return { label: "Not started", chip: "🟢", pct: 0 };
    if (pct >= 100 || activeTopicProgress.isCompleted) return { label: "Completed", chip: "🏆", pct: 100 };
    return { label: "In progress", chip: "⚡", pct };
  }, [activeTopicProgress]);

  return (
    <div className="min-h-screen w-full bg-white">
      {/* HERO (teal → aqua) */}
      <div
        className="relative w-full"
        style={{ background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pb-16">
          {/* Title row with inline Tugon logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TugonLogo size={36} />
              <h1 className="text-white font-extrabold tracking-tight text-2xl sm:text-3xl">
                TugonSense
              </h1>
            </div>

            <button
              onClick={() => navigate("/")}
              className="hidden sm:inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl border border-white/20 transition"
            >
              Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </button>
          </div>

          {/* Compact hero tiles */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <HeroTile
              label="Topic Status"
              value={`${topicStatus.chip} ${topicStatus.label}`}
              sub={`${topicStatus.pct}%`}
            />
            <HeroTile
              label="Overall Completion"
              value={`${Math.round(stats.overallCompletionPercentage || 0)}%`}
              sub="Across all topics"
            />
            <HeroTile label="Streak" value={`${stats.streak || 0} days`} sub="Keep it going!" />
          </div>
        </div>

        {/* Smooth white cap to the main content */}
        <div className="absolute inset-x-0 bottom-0 h-8 sm:h-10 bg-white rounded-t-[2rem]" />
      </div>

      {/* MAIN CONTENT */}
      <main className="relative -mt-6 sm:-mt-8 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* CourseCard (desktop only) – shows big topic title here, not in the hero */}
            <section className="hidden lg:block lg:col-span-5">
              <div className="w-full rounded-3xl border border-gray-100 bg-white shadow-[0_12px_30px_rgba(39,77,96,0.08)]">
                <CourseCard
                  title={activeCourse.title}
                  description={activeCourse.description}
                  topicId={activeCourse.id}
                  progress={activeTopicProgress}
                  overallStats={stats}
                />
              </div>
            </section>

            {/* Progress Map – logic/props unchanged */}
            <section className="lg:col-span-7">
              <div className="w-full rounded-3xl border border-gray-100 bg-white shadow-[0_12px_30px_rgba(39,77,96,0.08)]">
                <div className="rounded-2xl p-4">
                  <ProgressMap
                    courses={courses}
                    onActiveChange={() => {}}
                    onActiveIndexChange={setActiveIndex}
                    onStartStage={(topicId, categoryId, questionId) => {
                      navigate(`/tugonplay?topic=${topicId}&category=${categoryId}&question=${questionId}`);
                    }}
                    /* Mobile-merge props (no connection changes) */
                    title={activeCourse.title}
                    description={activeCourse.description}
                    topicId={activeCourse.id}
                    progress={activeTopicProgress}
                    overallStats={stats}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Frosted tile used in the hero */
function HeroTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 border border-white/25 shadow-lg backdrop-blur-sm"
      style={{ background: "rgba(255,255,255,0.18)", color: "white" }}
    >
      <div className="text-[12px] opacity-90">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tracking-tight line-clamp-1">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] opacity-85">{sub}</div> : null}
    </div>
  );
}