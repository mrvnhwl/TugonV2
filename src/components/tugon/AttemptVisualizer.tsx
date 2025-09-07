import React, { useState } from 'react';
import { UserAttempt } from './input-system/UserInput';

interface AttemptVisualizerProps {
  attempts: UserAttempt[];
  className?: string;
}

export default function AttemptVisualizer({ attempts, className = "" }: AttemptVisualizerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [viewMode, setViewMode] = useState<'chronological' | 'by-step'>('by-step');

  // Group attempts by step
  const attemptsByStep = attempts.reduce((acc, attempt) => {
    const stepKey = attempt.stepIndex;
    if (!acc[stepKey]) {
      acc[stepKey] = [];
    }
    acc[stepKey].push(attempt);
    return acc;
  }, {} as Record<number, UserAttempt[]>);

  // Get unique steps and sort them
  const steps = Object.keys(attemptsByStep).map(Number).sort((a, b) => a - b);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop Version - Floating Panel */}
      <div className={`hidden md:block fixed top-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md ${className}`}>
        {/* Header */}
        <div className="bg-violet-600 text-white px-3 py-2 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {viewMode === 'by-step' ? 'Attempts by Step' : 'User Attempts'}
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {viewMode === 'by-step' ? `${steps.length} steps` : `${attempts.length} attempts`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'by-step' ? 'chronological' : 'by-step')}
              className="text-white hover:bg-white/10 p-1 rounded text-xs"
              title={`Switch to ${viewMode === 'by-step' ? 'chronological' : 'step-by-step'} view`}
            >
              {viewMode === 'by-step' ? '📊' : '📝'}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/10 p-1 rounded text-xs"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? "▲" : "▼"}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/10 p-1 rounded text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="max-h-80 overflow-y-auto">
            {attempts.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                No attempts yet. Start typing to see attempts here.
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {viewMode === 'by-step' ? (
                  // Step-by-step view
                  steps.map(stepIndex => (
                    <StepGroup 
                      key={stepIndex}
                      stepIndex={stepIndex}
                      attempts={attemptsByStep[stepIndex]}
                    />
                  ))
                ) : (
                  // Chronological view
                  attempts.map((attempt, index) => (
                    <AttemptCard key={attempt.attempt_id} attempt={attempt} index={index} />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Minimized View */}
        {isMinimized && attempts.length > 0 && (
          <div className="px-3 py-2 text-xs text-gray-600">
            {viewMode === 'by-step' ? (
              <span>
                {steps.length} steps, {attempts.filter(a => a.isCorrect).length} correct
              </span>
            ) : (
              <span>
                Latest: Step {attempts[attempts.length - 1].stepIndex + 1} - 
                <span className={attempts[attempts.length - 1].isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {attempts[attempts.length - 1].isCorrect ? ' ✓' : ' ✗'}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile Version - Attached to Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-300 shadow-sm">
        {/* Mobile Header - Always visible */}
        <div className="bg-violet-600 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {viewMode === 'by-step' ? 'Steps' : 'Attempts'}
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {viewMode === 'by-step' ? steps.length : attempts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Show latest attempt status if any */}
            {attempts.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span>Step {attempts[attempts.length - 1].stepIndex + 1}</span>
                <span className={attempts[attempts.length - 1].isCorrect ? 'text-green-300' : 'text-red-300'}>
                  {attempts[attempts.length - 1].isCorrect ? '✓' : '✗'}
                </span>
                <span className="text-white/70">
                  {attempts[attempts.length - 1].cumulativeProgress.toFixed(0)}%
                </span>
              </div>
            )}
            <button
              onClick={() => setViewMode(viewMode === 'by-step' ? 'chronological' : 'by-step')}
              className="text-white hover:bg-white/10 p-1 rounded text-xs"
              title={`Switch to ${viewMode === 'by-step' ? 'chronological' : 'step'} view`}
            >
              {viewMode === 'by-step' ? '📝' : '📊'}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/10 p-1 rounded text-sm"
              title={isMinimized ? "Show Details" : "Hide Details"}
            >
              {isMinimized ? "▼" : "▲"}
            </button>
          </div>
        </div>

        {/* Mobile Content - Collapsible */}
        {!isMinimized && (
          <div className="max-h-64 overflow-y-auto bg-gray-50">
            {attempts.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                No attempts yet. Start solving to see attempts here.
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {viewMode === 'by-step' ? (
                  // Mobile step view
                  steps.map(stepIndex => (
                    <MobileStepGroup 
                      key={stepIndex}
                      stepIndex={stepIndex}
                      attempts={attemptsByStep[stepIndex]}
                    />
                  ))
                ) : (
                  // Mobile chronological view
                  <>
                    {attempts.slice(-5).map((attempt, index) => (
                      <MobileAttemptCard 
                        key={attempt.attempt_id} 
                        attempt={attempt} 
                        index={index} 
                      />
                    ))}
                    {attempts.length > 5 && (
                      <div className="text-center py-2">
                        <span className="text-xs text-gray-500">
                          Showing last 5 of {attempts.length} attempts
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Spacer - Pushes content down when panel is open */}
      <div className={`md:hidden transition-all duration-300 ${!isMinimized ? 'h-16' : 'h-12'}`} />
    </>
  );
}

interface AttemptCardProps {
  attempt: UserAttempt;
  index: number;
}

interface StepGroupProps {
  stepIndex: number;
  attempts: UserAttempt[];
}

// Desktop StepGroup Component
function StepGroup({ stepIndex, attempts }: StepGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const correctAttempt = attempts.find(a => a.isCorrect);
  const incorrectAttempts = attempts.filter(a => !a.isCorrect);

  // Calculate timing data
  const calculateAttemptDuration = (attempt: UserAttempt, index: number) => {
    if (index === 0) {
      return attempt.attemptTime - attempt.stepStartTime;
    }
    return attempt.attemptTime - attempts[index - 1].attemptTime;
  };

  const totalTimeOnStep = attempts.length > 0 
    ? attempts[attempts.length - 1].attemptTime - attempts[0].stepStartTime
    : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Step Header */}
      <div 
        className={`px-3 py-2 cursor-pointer transition-colors ${
          correctAttempt 
            ? 'bg-green-50 border-b border-green-200' 
            : 'bg-gray-50 border-b border-gray-200'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              Step {stepIndex + 1}: {attempts[0]?.stepLabel || 'Unknown'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              correctAttempt 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {correctAttempt ? '✓ Complete' : `${attempts.length} attempts`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {correctAttempt ? `${correctAttempt.cumulativeProgress.toFixed(1)}%` : 'Incomplete'}
            </span>
            <button className="text-gray-400 hover:text-gray-600 text-xs">
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
        
        {/* Show timing summary */}
        <div className="text-xs text-gray-500 mt-1">
          Total time: {(totalTimeOnStep / 1000).toFixed(1)}s
          {correctAttempt?.timeSpentOnStep && (
            <span className="ml-2">
              • Completed in: {(correctAttempt.timeSpentOnStep / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* Step Content */}
      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Correct Attempt (if any) */}
          {correctAttempt && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-700">✓ Correct Answer</span>
                <span className="text-xs text-green-600">
                  Attempt #{correctAttempt.attempt_id}
                </span>
              </div>
              <div className="text-xs font-mono bg-white p-1 rounded border">
                "{correctAttempt.userInput}"
              </div>
              {correctAttempt.timeSpentOnStep && (
                <div className="text-xs text-green-600 mt-1">
                  ⏱️ Time: {(correctAttempt.timeSpentOnStep / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          )}

          {/* Incorrect Attempts */}
          {incorrectAttempts.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-medium">
                Previous attempts ({incorrectAttempts.length}):
              </div>
              {incorrectAttempts.map((attempt, index) => (
                <div key={attempt.attempt_id} className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-red-700">✗ Incorrect</span>
                    <span className="text-xs text-red-600">
                      Attempt #{attempt.attempt_id}
                    </span>
                  </div>
                  <div className="text-xs font-mono bg-white p-1 rounded border">
                    "{attempt.userInput}"
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ⏱️ Duration: {(calculateAttemptDuration(attempt, index) / 1000).toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile StepGroup Component - More compact
function MobileStepGroup({ stepIndex, attempts }: StepGroupProps) {
  const correctAttempt = attempts.find(a => a.isCorrect);
  const totalTimeOnStep = attempts.length > 0 
    ? attempts[attempts.length - 1].attemptTime - attempts[0].stepStartTime
    : 0;

  return (
    <div className={`bg-white border rounded-lg p-2 ${
      correctAttempt ? 'border-green-300' : 'border-red-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Step {stepIndex + 1}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            correctAttempt 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {correctAttempt ? '✓' : '✗'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">
            {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            {(totalTimeOnStep / 1000).toFixed(1)}s
          </div>
        </div>
      </div>
      
      <div className="mt-1 text-xs text-gray-500 truncate">
        {correctAttempt 
          ? `✓ "${correctAttempt.userInput}"` 
          : `Latest: "${attempts[attempts.length - 1]?.userInput || ''}"`
        }
      </div>
      
      {correctAttempt && (
        <div className="text-xs font-medium text-green-600 mt-1">
          {correctAttempt.cumulativeProgress.toFixed(0)}% Progress
        </div>
      )}
    </div>
  );
}

// Desktop AttemptCard (unchanged)
function AttemptCard({ attempt, index }: AttemptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
      {/* Attempt Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
            #{attempt.attempt_id}
          </span>
          <span className="text-xs text-gray-600">
            Step {attempt.stepIndex + 1}
          </span>
          <span className={`text-xs ${attempt.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {attempt.isCorrect ? '✓' : '✗'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {attempt.cumulativeProgress.toFixed(1)}%
          </span>
          <button className="text-gray-400 hover:text-gray-600 text-xs">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-2 space-y-1 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Step:</span>
              <div className="font-mono bg-gray-50 p-1 rounded text-violet-600">
                {attempt.stepLabel}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Progress:</span>
              <div className="font-mono bg-gray-50 p-1 rounded">
                {attempt.cumulativeProgress.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">Input:</span>
            <div className="font-mono bg-gray-50 p-1 rounded break-all">
              "{attempt.userInput}"
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">Expected:</span>
            <div className="font-mono bg-gray-50 p-1 rounded break-all">
              "{attempt.expectedAnswer}"
            </div>
          </div>

          {/* Timing Information */}
          <div>
            <span className="text-gray-500">Timing:</span>
            <div className="bg-blue-50 p-2 rounded space-y-1">
              <div className="flex justify-between">
                <span>Attempt time:</span>
                <span className="font-mono">
                  {new Date(attempt.attemptTime).toLocaleTimeString()}
                </span>
              </div>
              {attempt.timeSpentOnStep && (
                <div className="flex justify-between text-green-700">
                  <span>Step completed in:</span>
                  <span className="font-mono font-medium">
                    {(attempt.timeSpentOnStep / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className={`text-xs ${attempt.isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {attempt.isCorrect ? 'CORRECT' : 'INCORRECT'}
            </span>
            <div className="w-20 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-violet-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${attempt.cumulativeProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile-optimized AttemptCard - Compact version
function MobileAttemptCard({ attempt, index }: AttemptCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Basic info */}
        <div className="flex items-center gap-2">
          <span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded text-xs font-mono font-medium">
            #{attempt.attempt_id}
          </span>
          <span className="text-xs text-gray-600">
            S{attempt.stepIndex + 1}
          </span>
          <span className={`text-xs font-medium ${attempt.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {attempt.isCorrect ? '✓' : '✗'}
          </span>
        </div>

        {/* Right side - Progress */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-medium text-gray-700">
              {attempt.cumulativeProgress.toFixed(0)}%
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-1">
              <div 
                className="bg-violet-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${attempt.cumulativeProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input preview - truncated */}
      <div className="mt-1">
        <div className="text-xs text-gray-500 truncate">
          <span className="text-gray-400">Input:</span> "{attempt.userInput}"
        </div>
        {attempt.timeSpentOnStep && (
          <div className="text-xs text-green-600">
            ⏱️ {(attempt.timeSpentOnStep / 1000).toFixed(1)}s
          </div>
        )}
      </div>
    </div>
  );
}