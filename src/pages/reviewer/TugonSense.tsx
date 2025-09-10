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
  const { getTopicProgress, getStatistics } = useProgress(); // Add progress hook
  
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
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Progress Map Section */}
           
            
            {/* Course Card Section */}
            <section className="lg:col-span-5">
              <CourseCard
                title={activeCourse.title}
                description={activeCourse.description}
                lessons={activeCourse.lessons}
                exercises={activeCourse.exercises}
                // Pass progress data
                topicId={activeCourse.id}
                progress={activeTopicProgress}
                overallStats={stats}
              />
            </section>
             <section className="lg:col-span-7">
              <ProgressMap
                courses={courses}
                onActiveChange={() => {}} // You can implement if needed
                onActiveIndexChange={setActiveIndex}
                onStartStage={(topicId, categoryId, questionId) => {
                  navigate(`/tugonplay?topic=${topicId}&category=${categoryId}&question=${questionId}`);
                }}
              />
            </section>
            
          </div>
        </div>
      </main>
    </div>
  );
}