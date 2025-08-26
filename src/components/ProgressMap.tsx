import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "../data/courses";
import { defaultTopics } from "./data/question";

type Level = {
  id: number; // topic_id
  name: string; // e.g., "Level 1"
  topic: string; // e.g., "Introduction to Functions"
};

type Props = {
  courses?: Course[];
  onActiveChange?: (course: Course) => void;
  onActiveIndexChange?: (index: number) => void;
  // Notify when user starts a stage for a given topic & question
  onStartStage?: (topicId: number, questionId: number) => void;
};

export default function ProgressMap({ courses, onActiveChange, onActiveIndexChange, onStartStage }: Props) {
  // Define levels from question dataset (topics)
  const levels: Level[] = useMemo(
    () =>
      defaultTopics.map((t) => ({
        id: t.id,
        name: `Level ${t.id}`,
        topic: t.name,
      })),
    []
  );

  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  const scrollRaf = useRef<number | null>(null);
  // Track selected stage per topic (questionId 1..3)
  const [selectedStage, setSelectedStage] = useState<Record<number, number>>({});

  useEffect(() => {
    // Observe per level within the ProgressMap scroll container
    const rootEl = containerRef.current; // may be null on first render
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx: number | null = null;
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = parseInt(entry.target.getAttribute("data-index") || "-1", 10);
          if (idx < 0) continue;

          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }

        if (bestIdx !== null && bestIdx !== currentRef.current) {
          setHeaderVisible(false);
          if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
          fadeTimer.current = window.setTimeout(() => {
            currentRef.current = bestIdx!;
            setCurrent(bestIdx!);
            setHeaderVisible(true);
          }, 120);
        }
      },
      {
        root: rootEl ?? null, // use internal container when available, else viewport
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0.2,
      }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, [containerRef.current]);

  // Fallback: compute active index based on scroll position (robust against IO quirks)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      let bestIdx = currentRef.current;
      let bestDist = Number.POSITIVE_INFINITY;
      sectionRefs.current.forEach((node, idx) => {
        if (!node) return;
        const r = node.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const dist = Math.abs(mid - centerY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });
      if (bestIdx !== currentRef.current) {
        setHeaderVisible(false);
        if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
        fadeTimer.current = window.setTimeout(() => {
          currentRef.current = bestIdx;
          setCurrent(bestIdx);
          setHeaderVisible(true);
        }, 100);
      }
    };

    const onScroll = () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = requestAnimationFrame(measure);
    };

    // Run once to sync on mount
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  // Forward page/left-panel wheel scrolls to the internal container so the
  // level indicator updates even when the user scrolls outside the map.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const target = e.target as Node | null;
      // If the wheel event originated inside the container, let native scrolling handle it.
      if (target && container.contains(target)) return;
      // Only mirror when the container is actually visible on screen
      const rect = container.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!visible) return;
      // Otherwise, mirror the scroll into the container (don't prevent default page scroll)
      container.scrollBy({ top: e.deltaY, behavior: "auto" });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Notify parent when the active section changes
  useEffect(() => {
    if (!courses || !onActiveChange) return;
    if (current < 0 || current >= courses.length) return;
    onActiveChange(courses[current]);
  }, [current, courses, onActiveChange]);

  // Notify parent of index changes (independent of courses)
  useEffect(() => {
    if (!onActiveIndexChange) return;
    onActiveIndexChange(current);
  }, [current, onActiveIndexChange]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl ring-1 ring-black/10 shadow-sm p-4 md:p-6">
      <div ref={containerRef} className="h-[60vh] overflow-y-auto no-scrollbar">
      {/* Sticky header that updates with the current level */}
      <div className="sticky top-0 z-10">
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-sm ring-1 ring-black/5 py-3 px-5 text-center">
          <div
            className={[
              "transition-all duration-300",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
            ].join(" ")}
            key={current}
          >
            <span className="uppercase tracking-widest text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-indigo-600">
              {levels[current]?.name}
            </span>
            <div className="mt-1 text-gray-900 text-base md:text-lg font-bold">
              {levels[current]?.topic}
            </div>
            {/* Optional: display stage range for the current level */}
            <div className="mt-0.5 text-xs text-gray-500">
              {(() => {
                const lvl = levels[current];
                if (!lvl) return null;
                const start = (lvl.id - 1) * 3 + 1;
                const end = start + 2;
                return <span>Stages {start} - {end}</span>;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Level sections (inside scroll area) */}
      <div className="mt-4">
        <div className="flex flex-col gap-16">
          {levels.map((lvl, i) => {
            const isActive = i === current;
            const stageStart = (lvl.id - 1) * 3 + 1;
            return (
              <div
  key={lvl.name}
  data-index={i}
  ref={(el) => { if (el) sectionRefs.current[i] = el; }}
  className="min-h-full flex flex-col items-center justify-center"
>
                {/* Optional level label inside section */}
                <div className="mb-6 text-xs uppercase tracking-wide text-gray-400">
                  {lvl.name}
                </div>

                {/* Single topic node per level */}
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={[
                      "relative rounded-full flex items-center justify-center bg-white",
                      isActive ? "w-28 h-28" : "w-24 h-24",
                      isActive
                        ? "shadow-[0_0_0_8px_rgba(99,102,241,0.15)] ring-2 ring-indigo-400/70"
                        : "shadow-sm ring-1 ring-black/5",
                    ].join(" ")}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400/20" />
                    )}
                    <div className={isActive ? "w-16 h-16 rounded-full bg-green-500" : "w-12 h-12 rounded-full bg-gray-200"} />
                  </div>
                  <div className="text-sm text-gray-700 select-none text-center max-w-xs">
                    {lvl.topic}
                  </div>
                  {/* Small stage badges under each topic (Stages are sequential but grouped by topic) */}
                  <div className="flex items-center gap-2 mt-1" aria-label="Stages for this topic">
                    {[1, 2, 3].map((qid) => {
                      const stageNumber = stageStart + (qid - 1);
                      const isSelected = (selectedStage[lvl.id] ?? 1) === qid;
                      return (
                        <button
                          key={qid}
                          type="button"
                          onClick={() => setSelectedStage((s) => ({ ...s, [lvl.id]: qid }))}
                          aria-pressed={isSelected}
                          className={[
                            "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] ring-1 transition",
                            isSelected
                              ? "bg-indigo-600 text-white ring-indigo-500"
                              : "bg-gray-100 text-gray-700 ring-black/5 hover:bg-gray-200",
                          ].join(" ")}
                          title={`Stage ${stageNumber}`}
                        >
                          Stage {stageNumber}
                        </button>
                      );
                    })}
                  </div>
                  {isActive && (
                    <button
                      className="mt-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-8 py-2.5 shadow hover:bg-indigo-500 transition"
                      onClick={() => onStartStage?.(lvl.id, selectedStage[lvl.id] ?? 1)}
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
