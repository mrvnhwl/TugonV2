import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../components/CourseCard";
import ProgressMap from "../../components/ProgressMap";
import { courses } from "../../components/data/question";
import StudentNavbar from "@/components/studentNavbar";
import { useProgress } from "../../components/tugon/services/useProgress";

export default function TugonSense() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const { getTopicProgress, getStatistics } = useProgress();
  
  const activeCourse = courses[Math.min(Math.max(activeIndex, 0), courses.length - 1)];
  
  // Get progress data for active course
  const activeTopicProgress = getTopicProgress(activeCourse.id);
  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <StudentNavbar />
      </div>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Mobile-first responsive grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Course Card Section - Hidden on mobile, visible on desktop */}
            <section className="hidden lg:block lg:order-1 lg:col-span-5">
              <div className="w-full">
                <CourseCard
                  title={activeCourse.title}
                  description={activeCourse.description}
                  // Pass progress data
                  topicId={activeCourse.id}
                  progress={activeTopicProgress}
                  overallStats={stats}
                />
              </div>
            </section>
            
            {/* Progress Map Section - Full width on mobile, takes remaining space on desktop */}
            <section className="order-1 lg:order-2 lg:col-span-7">
              <div className="w-full">
                <ProgressMap
                  courses={courses}
                  onActiveChange={() => {}} // You can implement if needed
                  onActiveIndexChange={setActiveIndex}
                  onStartStage={(topicId, categoryId, questionId) => {
                    navigate(`/tugonplay?topic=${topicId}&category=${categoryId}&question=${questionId}`);
                  }}
                  // Pass CourseCard props for mobile merge
                  title={activeCourse.title}
                  description={activeCourse.description}
                  
                  topicId={activeCourse.id}
                  progress={activeTopicProgress}
                  overallStats={stats}
                />
              </div>
            </section>
            
          </div>
        </div>
      </main>
    </div>
  );
}