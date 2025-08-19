type Props = {
  title?: string;
  description?: string;
  lessons?: number;
  exercises?: number;
};

export default function CourseCard({
  title = "Mathematical Thinking",
  description = "Learn to wield important tools in number sense and computation.",
  lessons = 44,
  exercises = 602,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 md:p-8">
      <div className="flex items-start gap-5">
        <div className="h-16 w-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl select-none">
          📘
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">👁️ {lessons} Lessons</span>
            <span className="inline-flex items-center gap-1">🧩 {exercises} Exercises</span>
          </div>
        </div>
      </div>
    </div>
  );
}
