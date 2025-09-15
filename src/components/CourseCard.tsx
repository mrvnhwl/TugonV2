import { TopicProgress } from "./tugon/services/progressServices";

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
  
  // Safe progress calculation with proper fallbacks
  const isTopicCompleted = progress?.isCompleted || false;
  const completionPercentage = Math.round(progress?.completionPercentage || 0);
  const correctAnswers = progress?.correctAnswers || 0;
  const totalQuestions = progress?.totalQuestions || exercises;
  
  // Calculate time spent more safely (in minutes)
  const timeSpent = progress && progress.categoryProgress ? 
    Math.round(progress.categoryProgress.reduce((sum, cat) => 
      sum + (cat.questionProgress || []).reduce((qSum, q) => qSum + (q.timeSpent || 0), 0), 0) / 60) : 0;

  // Calculate category/stage progress safely
  const completedStages = progress ? 
    progress.categoryProgress.filter(cat => cat.isCompleted).length : 0;
  const totalStages = progress ? progress.categoryProgress.length : 0;
  
  // Get appropriate emoji/icon based on completion
  const getTopicIcon = () => {
    if (isTopicCompleted) return "🏆"; // Trophy for completed
    if (completionPercentage > 75) return "🔥"; // Fire for almost done
    if (completionPercentage > 50) return "⚡"; // Lightning for halfway
    if (completionPercentage > 0) return "📖"; // Open book for started
    return "📘"; // Closed book for not started
  };

  const getCompletionColor = () => {
    if (isTopicCompleted) return "text-green-600";
    if (completionPercentage > 75) return "text-purple-600";
    if (completionPercentage > 50) return "text-blue-600";
    if (completionPercentage > 0) return "text-orange-600";
    return "text-gray-500";
  };

  const getBackgroundColor = () => {
    if (isTopicCompleted) return "bg-green-50 ring-1 ring-green-200";
    if (completionPercentage > 75) return "bg-purple-50 ring-1 ring-purple-200";
    if (completionPercentage > 50) return "bg-blue-50 ring-1 ring-blue-200";
    if (completionPercentage > 0) return "bg-orange-50 ring-1 ring-orange-200";
    return "bg-gray-50 ring-1 ring-gray-200";
  };

  const getProgressBarColor = () => {
    if (isTopicCompleted) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (completionPercentage > 75) return 'bg-gradient-to-r from-purple-500 to-violet-500';
    if (completionPercentage > 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (completionPercentage > 0) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gray-300';
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-5">
        {/* Dynamic Topic Icon */}
        <div className={`h-16 w-16 rounded-xl ${getBackgroundColor()} flex items-center justify-center text-2xl select-none relative transition-all duration-300`}>
          <span className="text-2xl">{getTopicIcon()}</span>
          {isTopicCompleted && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
              {title}
            </h2>
            {isTopicCompleted && (
              <span className="text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full shadow-sm">
                Complete
              </span>
            )}
            {completionPercentage === 0 && (
              <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                Not Started
              </span>
            )}
          </div>
          
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
          
          {/* Always show progress bar, even for 0% */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-medium">Topic Progress</span>
              <span className={`${getCompletionColor()} font-bold`}>
                {completionPercentage}%
                {completionPercentage === 0 && " (Not Started)"}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ease-out rounded-full ${getProgressBarColor()} ${
                  completionPercentage > 0 ? 'shadow-sm' : ''
                }`}
                style={{ 
                  width: `${Math.max(completionPercentage, 0)}%`,
                  minWidth: completionPercentage > 0 && completionPercentage < 2 ? '2%' : '0%' // Show tiny progress for very small percentages
                }}
              >
                {completionPercentage > 0 && (
                  <div className="h-full bg-white/20 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>
          
        

          {/* Achievement Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            {isTopicCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full shadow-sm">
                🏆 Topic Master
              </span>
            )}
            
            {completedStages > 0 && !isTopicCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shadow-sm">
                ⭐ {completedStages} Stage{completedStages > 1 ? 's' : ''} Complete
              </span>
            )}
            
            {correctAnswers > 0 && !isTopicCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full shadow-sm">
                📝 {correctAnswers} Question{correctAnswers > 1 ? 's' : ''} Solved
              </span>
            )}
            
            {overallStats?.streak && overallStats.streak > 1 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full shadow-sm animate-pulse">
                🔥 {overallStats.streak} Day Streak
              </span>
            )}
            
            {completionPercentage === 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                🚀 Ready to Start 
              </span>
            )}
          </div>

          {/* UPDATED: Topic-Specific Progress Summary (instead of overall stats) */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2 font-medium">Topic Progress Summary</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Topic Completion Percentage */}
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className={`text-lg font-bold ${
                  completionPercentage > 0 ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {completionPercentage}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Complete</div>
              </div>

              {/* Questions Solved in This Topic */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className={`text-lg font-bold ${
                  correctAnswers > 0 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {correctAnswers}
                </div>
                <div className="text-xs text-gray-500 mt-1">Solved</div>
              </div>

              {/* Stages Completed in This Topic */}
              <div className="bg-purple-50 rounded-lg p-3">
                <div className={`text-lg font-bold ${
                  completedStages > 0 ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {completedStages}<span className="text-sm text-gray-500">/{totalStages}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Stages</div>
              </div>
            </div>
            
            {/* Additional details for this specific topic */}
            <div className="mt-3 text-center">
              {completionPercentage === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  🎯 Start your first question to begin tracking progress
                </p>
              ) : completionPercentage === 100 ? (
                <p className="text-xs text-green-600 font-medium">
                  🎉 Congratulations! You've mastered this topic!
                </p>
              ) : (
                <p className="text-xs text-gray-600">
                  📈 {totalQuestions - correctAnswers} questions remaining in this topic
                </p>
              )}
            </div>

            {/* Time spent on this topic */}
            {timeSpent > 0 && (
              <div className="mt-2 text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  ⏱️ {timeSpent} minutes spent on this topic
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}