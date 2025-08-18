import { useState } from "react";
import TugonSenseNavbar from "../../components/TugonSenseNavbar";
import CourseCard from "../../components/CourseCard";
import ProgressMap from "../../components/ProgressMap";
import { courses } from "../../data/courses";

export default function TugonSense() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCourse = courses[Math.min(Math.max(activeIndex, 0), courses.length - 1)];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <TugonSenseNavbar />
      </div>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Dynamic CourseCard */}
            <section className="lg:col-span-5">
              <CourseCard
                title={activeCourse.title}
                description={activeCourse.description}
                lessons={activeCourse.lessons}
                exercises={activeCourse.exercises}
              />
            </section>

            {/* Right: ProgressMap with callback */}
            <aside className="lg:col-span-7">
              <ProgressMap
                courses={courses}
                onActiveChange={() => {/* kept for backward compatibility; index drives state */}}
                onActiveIndexChange={setActiveIndex}
              />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
