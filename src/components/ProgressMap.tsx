import { useEffect, useMemo, useRef, useState } from "react";
import type { Course } from "../data/courses";

type Level = {
  name: string; // e.g., "Level 1"
  topic: string; // e.g., "Introduction to Functions"
};

type Props = {
  courses?: Course[];
  onActiveChange?: (course: Course) => void;
  onActiveIndexChange?: (index: number) => void;
};

export default function ProgressMap({ courses, onActiveChange, onActiveIndexChange }: Props) {
  // Define levels and their topics
  const levels: Level[] = useMemo(
    () => [
      { name: "Level 1", topic: "Introduction to Functions" },
      { name: "Level 2", topic: "Evaluating Functions" },
      { name: "Level 3", topic: "Piecewise-Defined Functions" },
      { name: "Level 4", topic: "Operations on Functions" },
      { name: "Level 5", topic: "Composition of Functions" },
      { name: "Level 6", topic: "Rational Functions" },
      { name: "Level 7", topic: "Graphing Rational Functions" },
      { name: "Level 8", topic: "Rational Equations and Inequalities" },
      { name: "Level 9", topic: "Inverse Functions" },
      { name: "Level 10", topic: "Exponential Functions" },
      { name: "Level 11", topic: "Logarithmic Functions" },
    ],
    []
  );

  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    // Observe per level; update when a section meaningfully enters the center band
    // IntersectionObserver options
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
    root: containerRef.current,
    rootMargin: "-30% 0px -60% 0px", // earlier trigger within the container
    threshold: 0.2,
  }
);


    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
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
              {levels[current].name}
            </span>
            <div className="mt-1 text-gray-900 text-base md:text-lg font-bold">
              {levels[current].topic}
            </div>
          </div>
        </div>
      </div>

      {/* Level sections (inside scroll area) */}
      <div className="mt-4">
        <div className="flex flex-col gap-16">
          {levels.map((lvl, i) => {
            const isActive = i === current;
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
                  {isActive && (
                    <button className="mt-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-8 py-2.5 shadow hover:bg-indigo-500 transition">
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
