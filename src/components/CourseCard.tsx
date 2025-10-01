import { TopicProgress } from "./tugon/services/progressServices";
import color from "@/styles/color";

type OverallStats = {
  totalTopics: number;
  completedTopics: number;
  totalQuestions: number;
  completedQuestions: number;
  overallCompletionPercentage: number;
  streak: number;
  totalTimeSpent: number;
};

type Props = {
  title?: string;
  description?: string;
  lessons?: number;
  exercises?: number;
  topicId?: number;
  progress?: TopicProgress;
  overallStats?: OverallStats;
};

export default function CourseCard({
  title = "Mathematical Thinking",
  description = "Learn to wield important tools in number sense and computation.",
  lessons = 44,
  exercises = 602,
  topicId,
  progress,
  overallStats,
}: Props) {
  const isTopicCompleted = progress?.isCompleted || false;
  const completionPercentage = Math.round(progress?.completionPercentage || 0);
  const correctAnswers = progress?.correctAnswers || 0;
  const totalQuestions = progress?.totalQuestions || exercises;

  const timeSpent =
    progress && progress.categoryProgress
      ? Math.round(
          progress.categoryProgress.reduce(
            (sum, cat) =>
              sum +
              (cat.questionProgress || []).reduce(
                (qSum, q) => qSum + (q.timeSpent || 0),
                0
              ),
            0
          ) / 60
        )
      : 0;

  const completedStages = progress
    ? progress.categoryProgress.filter((cat) => cat.isCompleted).length
    : 0;
  const totalStages = progress ? progress.categoryProgress.length : 0;

  // Palette helpers
  const chipBg =
    completionPercentage === 0
      ? "#E9EEF2"
      : isTopicCompleted
      ? "#DCFCE7"
      : `${color.mist}22`;
  const chipFg =
    completionPercentage === 0
      ? "#475569"
      : isTopicCompleted
      ? "#166534"
      : color.steel;

  const progressBg = "#E6EDF3";
  const progressFill = `linear-gradient(90deg, ${color.teal}, ${color.aqua})`;

  return (
    <div
      className="rounded-3xl p-6 md:p-8"
      style={{
        background: "white",
        border: "1px solid #E6EDF3",
        boxShadow: `0 12px 28px ${color.mist}22, inset 0 1px 0 #ffffff`,
      }}
    >
      <div className="flex items-start gap-5">
        {/* Leading glyph */}
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: `${color.aqua}12`,
            border: `1px solid ${color.aqua}3a`,
            color: color.teal,
          }}
        >
          <span className="text-xl">📘</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight"
              style={{ color: color.deep }}
            >
              {title}
            </h2>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: chipBg, color: chipFg }}
            >
              {completionPercentage === 0
                ? "Not Started"
                : isTopicCompleted
                ? "Complete"
                : "In Progress"}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Topic Progress</span>
              <span className="font-bold">
                {completionPercentage}%{" "}
                {completionPercentage === 0 && "(Not Started)"}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: progressBg }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(completionPercentage, 0)}%`,
                  background: completionPercentage > 0 ? progressFill : "#CBD5E1",
                }}
              />
            </div>
          </div>

          {/* Badges row */}
          <div className="mt-3 flex flex-wrap gap-2">
            {isTopicCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" }}>
                🏆 Topic Master
              </span>
            )}
            {completedStages > 0 && !isTopicCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${color.aqua}12`, color: color.teal, border: `1px solid ${color.aqua}3a` }}>
                ⭐ {completedStages} Stage{completedStages > 1 ? "s" : ""} Complete
              </span>
            )}
            {correctAnswers > 0 && !isTopicCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#EEF2FF", color: "#3730A3", border: "1px solid #C7D2FE" }}>
                📝 {correctAnswers} Solved
              </span>
            )}
            {completionPercentage === 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" }}>
                🚀 Ready to Start
              </span>
            )}
          </div>

          {/* Topic Summary */}
          <div className="mt-5 pt-5 border-t" style={{ borderColor: "#EEF3F6" }}>
            <div className="text-xs text-gray-500 mb-2 font-medium">
              Topic Progress Summary
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Tile
                value={`${completionPercentage}%`}
                label="Complete"
                tint={`${color.aqua}12`}
                fg={color.teal}
              />
              <Tile
                value={correctAnswers}
                label="Solved"
                tint="#ECFDF5"
                fg="#047857"
              />
              <Tile
                value={
                  <>
                    {completedStages}
                    <span className="text-[10px] text-gray-500">
                      /{totalStages}
                    </span>
                  </>
                }
                label="Stages"
                tint="#F5F3FF"
                fg="#6D28D9"
              />
            </div>

            {/* Remaining / time */}
            <div className="mt-3 text-center">
              {completionPercentage === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  🎯 Start your first question to begin tracking progress
                </p>
              ) : completionPercentage === 100 ? (
                <p className="text-xs" style={{ color: color.teal }}>
                  🎉 Congratulations! You've mastered this topic!
                </p>
              ) : (
                <p className="text-xs text-gray-600">
                  📈 {totalQuestions - correctAnswers} questions remaining in
                  this topic
                </p>
              )}
            </div>

            {timeSpent > 0 && (
              <div className="mt-2 text-center">
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                  style={{
                    background: `${color.mist}15`,
                    color: color.steel,
                    border: `1px solid ${color.mist}40`,
                  }}
                >
                  ⏱️ {timeSpent} minutes spent on this topic
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  value,
  label,
  tint,
  fg,
}: {
  value: React.ReactNode;
  label: string;
  tint: string;
  fg: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: tint, color: fg, border: "1px solid #E6EDF3" }}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
