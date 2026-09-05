import { useProgress } from './services/useProgress';

export default function ProgressStats() {
  const { getStatistics } = useProgress();
  const stats = getStatistics();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {Math.round(stats.overallCompletionPercentage)}%
          </div>
          <div className="text-sm text-gray-600">Overall</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.completedQuestions}
          </div>
          <div className="text-sm text-gray-600">Questions Done</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.streak}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(stats.totalTimeSpent / 60)}m
          </div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </div>
      </div>
    </div>
  );
}