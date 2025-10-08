// src/components/tugon/AttemptVisualizer.tsx
import React, { useState, useMemo } from "react";
import { UserAttempt } from "./input-system/UserInput";
import UserBehaviorClassifier, {
  UserBehaviorProfile,
  BehaviorTrigger,
} from "./input-system/UserBehaviorClassifier";
import color from "@/styles/color";

interface AttemptVisualizerProps {
  attempts: UserAttempt[];
  className?: string;
}

export default function AttemptVisualizer({
  attempts,
  className = "",
}: AttemptVisualizerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"chronological" | "by-step" | "behavior">(
    "by-step"
  );

  // 🧠 BEHAVIOR ANALYSIS
  const behaviorProfile = useMemo(() => {
    return UserBehaviorClassifier.analyzeUserBehavior(attempts);
  }, [attempts]);

  // Group attempts by step
  const attemptsByStep = attempts.reduce((acc, attempt) => {
    const stepKey = attempt.stepIndex;
    if (!acc[stepKey]) acc[stepKey] = [];
    acc[stepKey].push(attempt);
    return acc;
  }, {} as Record<number, UserAttempt[]>);

  const steps = Object.keys(attemptsByStep)
    .map(Number)
    .sort((a, b) => a - b);

  if (!isVisible) return null;

  /** Desktop: bottom-right dock (avoid overlapping header/content) */
  const desktopDockStyle: React.CSSProperties = {
    right: "calc(env(safe-area-inset-right, 0px) + 24px)",
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)", // stay above chat FABs
    maxWidth: "min(380px, calc(100vw - 3rem))",
  };

  /** Mobile: bottom sheet */
  const mobileDockStyle: React.CSSProperties = {
    left: 0,
    right: 0,
    bottom: "env(safe-area-inset-bottom, 0px)",
  };

  return (
    <>
      {/* Desktop — bottom-right panel */}
      <div
        className={`hidden md:block fixed z-[60] ${className}`}
        style={desktopDockStyle}
        aria-live="polite"
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className="text-white px-3 py-2 rounded-t-xl"
            style={{
              background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {viewMode === "by-step"
                    ? "Attempts by Step"
                    : viewMode === "behavior"
                    ? "Behavior Analysis"
                    : "User Attempts"}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {viewMode === "by-step"
                    ? `${steps.length} steps`
                    : viewMode === "behavior"
                    ? `${behaviorProfile.activeTriggers.length} alerts`
                    : `${attempts.length} attempts`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setViewMode(
                      viewMode === "by-step"
                        ? "behavior"
                        : viewMode === "behavior"
                        ? "chronological"
                        : "by-step"
                    )
                  }
                  className="text-white hover:bg-white/10 p-1 rounded text-xs"
                  title="Switch view mode"
                >
                  {viewMode === "by-step" ? "🧠" : viewMode === "behavior" ? "📊" : "📝"}
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

            <BehaviorStatusBar profile={behaviorProfile} />
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="max-h-80 overflow-y-auto">
              {attempts.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm text-center">
                  No attempts yet. Start typing to see attempts here.
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {viewMode === "behavior" ? (
                    <BehaviorAnalysisView profile={behaviorProfile} attempts={attempts} />
                  ) : viewMode === "by-step" ? (
                    steps.map((stepIndex) => (
                      <StepGroup
                        key={stepIndex}
                        stepIndex={stepIndex}
                        attempts={attemptsByStep[stepIndex]}
                        behaviorData={behaviorProfile.stepBehaviors[stepIndex]}
                      />
                    ))
                  ) : (
                    attempts.map((attempt, index) => (
                      <AttemptCard key={attempt.attempt_id} attempt={attempt} index={index} />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsed footer */}
          {isMinimized && attempts.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>
                  {steps.length} steps, {attempts.filter((a) => a.isCorrect).length} correct
                </span>
                <span
                  className={`font-medium ${
                    behaviorProfile.currentBehavior
                      ? UserBehaviorClassifier.getBehaviorColor(behaviorProfile.currentBehavior)
                      : "text-gray-500"
                  }`}
                >
                  {behaviorProfile.currentBehavior?.toUpperCase() || "NO PATTERN"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile — bottom sheet */}
      <div
        className="md:hidden fixed z-[55] bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] rounded-t-2xl"
        style={mobileDockStyle}
        role="dialog"
        aria-label="Attempts panel"
        aria-live="polite"
      >
        {/* Handle / header */}
        <div
          className="px-4 pt-2 pb-2 text-white rounded-t-2xl"
          style={{
            background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
          }}
        >
          <div className="w-10 h-1.5 mx-auto mb-2 rounded-full bg-white/50" aria-hidden />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {viewMode === "by-step" ? "Steps" : viewMode === "behavior" ? "Behavior" : "Attempts"}
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {viewMode === "by-step"
                  ? steps.length
                  : viewMode === "behavior"
                  ? behaviorProfile.activeTriggers.length
                  : attempts.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setViewMode(
                    viewMode === "by-step"
                      ? "behavior"
                      : viewMode === "behavior"
                      ? "chronological"
                      : "by-step"
                  )
                }
                className="text-white hover:bg-white/10 p-1 rounded text-xs"
              >
                {viewMode === "by-step" ? "🧠" : viewMode === "behavior" ? "📊" : "📝"}
              </button>
              <button
                onClick={() => setIsMinimized((v) => !v)}
                className="text-white hover:bg-white/10 p-1 rounded text-sm"
              >
                {isMinimized ? "▼" : "▲"}
              </button>
            </div>
          </div>

          {/* Status line */}
          <div className="text-xs mt-1">
            <span className="text-white/70">Status: </span>
            <span className="text-white font-medium">
              {behaviorProfile.currentBehavior
                ? UserBehaviorClassifier.getBehaviorDescription(behaviorProfile.currentBehavior)
                : "No specific behavior pattern detected"}
            </span>
          </div>
        </div>

        {!isMinimized && (
          <div className="max-h-64 overflow-y-auto bg-gray-50">
            {attempts.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                No attempts yet. Start solving to see progress here.
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {viewMode === "behavior" ? (
                  <MobileBehaviorView profile={behaviorProfile} />
                ) : viewMode === "by-step" ? (
                  steps.map((stepIndex) => (
                    <MobileStepGroup
                      key={stepIndex}
                      stepIndex={stepIndex}
                      attempts={attemptsByStep[stepIndex]}
                      behaviorData={behaviorProfile.stepBehaviors[stepIndex]}
                    />
                  ))
                ) : (
                  attempts.slice(-5).map((attempt, index) => (
                    <MobileAttemptCard key={attempt.attempt_id} attempt={attempt} index={index} />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spacer so bottom sheet won't cover content on mobile */}
      <div className="md:hidden" style={{ height: isMinimized ? 56 : 128 }} />
    </>
  );
}

/* ───────────────────────────── Helper UI ───────────────────────────── */

function BehaviorStatusBar({ profile }: { profile: UserBehaviorProfile }) {
  if (profile.activeTriggers.length === 0) {
    return (
      <div className="text-xs text-white/90">
        ✅ {profile.currentBehavior ? "Behavior detected but no concerns" : "No specific behavior pattern detected"}
      </div>
    );
  }
  const high = profile.activeTriggers.filter((t) => t.severity === "high").length;
  const med = profile.activeTriggers.filter((t) => t.severity === "medium").length;
  return (
    <div className="text-xs space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-white/90">Current Status:</span>
        <span className="text-white font-medium">
          {profile.currentBehavior?.toUpperCase().replace("-", " ") || "NO PATTERN"}
        </span>
      </div>
      {high > 0 && <div className="text-red-100">🚨 {high} high priority alert{high !== 1 ? "s" : ""}</div>}
      {med > 0 && <div className="text-yellow-100">⚠️ {med} concern{med !== 1 ? "s" : ""} detected</div>}
    </div>
  );
}

interface StepGroupProps {
  stepIndex: number;
  attempts: UserAttempt[];
  behaviorData?: any;
}

function StepGroup({ stepIndex, attempts, behaviorData }: StepGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const correctAttempt = attempts.find((a) => a.isCorrect);
  const incorrectAttempts = attempts.filter((a) => !a.isCorrect);

  const calculateAttemptDuration = (attempt: UserAttempt, index: number) => {
    if (index === 0) return attempt.attemptTime - attempt.stepStartTime;
    return attempt.attemptTime - attempts[index - 1].attemptTime;
  };

  const totalTimeOnStep =
    attempts.length > 0 ? attempts[attempts.length - 1].attemptTime - attempts[0].stepStartTime : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`px-3 py-2 cursor-pointer transition-colors ${
          correctAttempt
            ? "bg-green-50 border-b border-green-200"
            : behaviorData?.primaryBehavior === "struggling"
            ? "bg-yellow-50 border-b border-yellow-200"
            : behaviorData?.primaryBehavior === "guessing"
            ? "bg-orange-50 border-b border-orange-200"
            : behaviorData?.primaryBehavior === "repeating"
            ? "bg-amber-50 border-b border-amber-200"
            : behaviorData?.primaryBehavior === "self-correction"
            ? "bg-emerald-50 border-b border-emerald-200"
            : "bg-gray-50 border-b border-gray-200"
        }`}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              Step {stepIndex + 1}: {attempts[0]?.stepLabel || "Unknown"}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                correctAttempt ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {correctAttempt ? "✓ Complete" : `${attempts.length} attempts`}
            </span>
            {behaviorData?.primaryBehavior && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  behaviorData.primaryBehavior === "struggling"
                    ? "bg-yellow-100 text-yellow-700"
                    : behaviorData.primaryBehavior === "guessing"
                    ? "bg-orange-100 text-orange-700"
                    : behaviorData.primaryBehavior === "repeating"
                    ? "bg-amber-100 text-amber-700"
                    : behaviorData.primaryBehavior === "self-correction"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {behaviorData.primaryBehavior === "struggling"
                  ? "⚠️ Struggling"
                  : behaviorData.primaryBehavior === "guessing"
                  ? "🎲 Guessing"
                  : behaviorData.primaryBehavior === "repeating"
                  ? "🔁 Repeating"
                  : behaviorData.primaryBehavior === "self-correction"
                  ? "✨ Self-Correction"
                  : behaviorData.primaryBehavior}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {correctAttempt ? `${correctAttempt.cumulativeProgress.toFixed(1)}%` : "Incomplete"}
            </span>
            <button className="text-gray-400 hover:text-gray-600 text-xs">{isExpanded ? "▲" : "▼"}</button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Total time: {(totalTimeOnStep / 1000).toFixed(1)}s
          {behaviorData?.isStuck && <span className="ml-2 text-red-600">• Stuck</span>}
          {correctAttempt?.timeSpentOnStep && (
            <span className="ml-2">• Completed in: {(correctAttempt.timeSpentOnStep / 1000).toFixed(1)}s</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {behaviorData?.primaryBehavior === "struggling" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <div className="text-xs text-yellow-700">
                <strong>Struggling Detected:</strong> This step has {behaviorData.wrongAttempts} wrong attempts
                {behaviorData.isStuck && " and appears to be stuck"}. Consider providing hints or guidance.
              </div>
            </div>
          )}

          {behaviorData?.primaryBehavior === "guessing" && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2">
              <div className="text-xs text-orange-700">
                <strong>Guessing Detected:</strong> Pattern suggests random/rapid attempts. User may benefit from a
                slower, more thoughtful approach.
              </div>
            </div>
          )}

          {behaviorData?.primaryBehavior === "repeating" && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2">
              <div className="text-xs text-amber-700">
                <strong>Repeating Pattern:</strong> User is repeating the same inputs. May need guidance to try a
                different approach.
              </div>
            </div>
          )}

          {behaviorData?.primaryBehavior === "self-correction" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
              <div className="text-xs text-emerald-700">
                <strong>Learning Progress:</strong> User is learning from mistakes and improving. This is positive
                behavior.
              </div>
            </div>
          )}

          {correctAttempt && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-700">✓ Correct Answer</span>
                <span className="text-xs text-green-600">Attempt #{correctAttempt.attempt_id}</span>
              </div>
              <div className="text-xs font-mono bg-white p-1 rounded border">"{correctAttempt.userInput}"</div>
              {correctAttempt.timeSpentOnStep && (
                <div className="text-xs text-green-600 mt-1">
                  ⏱️ Time: {(correctAttempt.timeSpentOnStep / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          )}

          {incorrectAttempts.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-medium">Previous attempts ({incorrectAttempts.length}):</div>
              {incorrectAttempts.map((attempt, index) => (
                <div key={attempt.attempt_id} className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-red-700">✗ Incorrect</span>
                    <span className="text-xs text-red-600">Attempt #{attempt.attempt_id}</span>
                  </div>
                  <div className="text-xs font-mono bg-white p-1 rounded border">"{attempt.userInput}"</div>
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

function BehaviorAnalysisView({
  profile,
  attempts,
}: {
  profile: UserBehaviorProfile;
  attempts: UserAttempt[];
}) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="text-sm font-medium mb-2">Overall Behavior Analysis</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Current Status:</span>
            <span
              className={`font-medium ${
                profile.currentBehavior
                  ? UserBehaviorClassifier.getBehaviorColor(profile.currentBehavior)
                  : "text-gray-500"
              }`}
            >
              {profile.currentBehavior?.replace("-", " ").toUpperCase() || "NO PATTERN"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span>{(profile.overallAccuracy * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Avg. Time/Attempt:</span>
            <span>{(profile.averageTimePerAttempt / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {profile.activeTriggers.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Active Behavior Alerts</div>
          {profile.activeTriggers.map((trigger, index) => (
            <BehaviorTriggerCard key={index} trigger={trigger} />
          ))}
        </div>
      )}

      {Object.keys(profile.stepBehaviors).length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Step-by-Step Analysis</div>
          {Object.entries(profile.stepBehaviors).map(([stepIndex, stepData]) => (
            <div key={stepIndex} className="bg-white border border-gray-200 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">
                  Step {parseInt(stepIndex) + 1}: {stepData.stepLabel}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    stepData.primaryBehavior === "struggling"
                      ? "bg-yellow-100 text-yellow-700"
                      : stepData.primaryBehavior === "guessing"
                      ? "bg-orange-100 text-orange-700"
                      : stepData.primaryBehavior === "repeating"
                      ? "bg-amber-100 text-amber-700"
                      : stepData.primaryBehavior === "self-correction"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {stepData.primaryBehavior || "no pattern"}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div>Wrong attempts: {stepData.wrongAttempts}</div>
                <div>Time spent: {(stepData.totalTime / 1000).toFixed(1)}s</div>
                {stepData.isStuck && <div className="text-red-600">Status: Stuck</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BehaviorTriggerCard({ trigger }: { trigger: BehaviorTrigger }) {
  return (
    <div
      className={`border rounded p-2 ${
        trigger.severity === "high"
          ? "bg-red-50 border-red-200"
          : trigger.severity === "medium"
          ? "bg-yellow-50 border-yellow-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs font-medium ${
            trigger.severity === "high"
              ? "text-red-700"
              : trigger.severity === "medium"
              ? "text-yellow-700"
              : "text-blue-700"
          }`}
        >
          {trigger.severity === "high" ? "🚨" : trigger.severity === "medium" ? "⚠️" : "ℹ️"}{" "}
          {trigger.type.toUpperCase().replace("-", " ")}
        </span>
        {trigger.stepIndex !== undefined && (
          <span className="text-xs text-gray-500">Step {trigger.stepIndex + 1}</span>
        )}
      </div>
      <div className="text-xs text-gray-600 mb-1">{trigger.description}</div>
      <div className="text-xs text-gray-500">Evidence: {trigger.evidence.join(", ")}</div>
    </div>
  );
}

/* ───────────── Mobile Cards ───────────── */

function MobileStepGroup({ stepIndex, attempts, behaviorData }: StepGroupProps) {
  const correctAttempt = attempts.find((a) => a.isCorrect);
  const totalTimeOnStep =
    attempts.length > 0 ? attempts[attempts.length - 1].attemptTime - attempts[0].stepStartTime : 0;

  return (
    <div
      className={`bg-white border rounded-lg p-2 ${
        correctAttempt
          ? "border-green-300"
          : behaviorData?.primaryBehavior === "struggling"
          ? "border-yellow-300"
          : behaviorData?.primaryBehavior === "guessing"
          ? "border-orange-300"
          : behaviorData?.primaryBehavior === "repeating"
          ? "border-amber-300"
          : behaviorData?.primaryBehavior === "self-correction"
          ? "border-emerald-300"
          : "border-red-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Step {stepIndex + 1}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              correctAttempt ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {correctAttempt ? "✓" : "✗"}
          </span>
          {behaviorData?.primaryBehavior && (
            <span className="text-xs">
              {behaviorData.primaryBehavior === "struggling"
                ? "⚠️"
                : behaviorData.primaryBehavior === "guessing"
                ? "🎲"
                : behaviorData.primaryBehavior === "repeating"
                ? "🔁"
                : behaviorData.primaryBehavior === "self-correction"
                ? "✨"
                : ""}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">
            {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-gray-500">{(totalTimeOnStep / 1000).toFixed(1)}s</div>
        </div>
      </div>

      <div className="mt-1 text-xs text-gray-500 truncate">
        {correctAttempt ? `✓ "${correctAttempt.userInput}"` : `Latest: "${attempts[attempts.length - 1]?.userInput || ""}"`}
      </div>

      {correctAttempt && (
        <div className="text-xs font-medium text-green-600 mt-1">
          {correctAttempt.cumulativeProgress.toFixed(0)}% Progress
        </div>
      )}
      {behaviorData?.isStuck && <div className="text-xs text-red-600 mt-1">Stuck - needs help</div>}
    </div>
  );
}

function MobileBehaviorView({ profile }: { profile: UserBehaviorProfile }) {
  return (
    <div className="space-y-2">
      <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="text-sm font-medium mb-1">Behavior Status</div>
        <div
          className={`text-xs ${
            profile.currentBehavior
              ? UserBehaviorClassifier.getBehaviorColor(profile.currentBehavior)
              : "text-gray-500"
          }`}
        >
          {profile.currentBehavior
            ? UserBehaviorClassifier.getBehaviorDescription(profile.currentBehavior)
            : "No specific behavior pattern detected"}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Accuracy:</span>
            <div className="font-medium">{(profile.overallAccuracy * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-gray-500">Avg Time:</span>
            <div className="font-medium">{(profile.averageTimePerAttempt / 1000).toFixed(1)}s</div>
          </div>
        </div>
      </div>

      {profile.activeTriggers.length > 0 && (
        <div className="space-y-1">
          {profile.activeTriggers.slice(0, 3).map((trigger, index) => (
            <div
              key={index}
              className={`text-xs p-2 rounded ${
                trigger.severity === "high" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {trigger.severity === "high" ? "🚨" : "⚠️"} {trigger.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── Generic Attempt Cards ───────────── */

interface AttemptCardProps {
  attempt: UserAttempt;
  index: number;
}

function AttemptCard({ attempt, index }: AttemptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded((v) => !v)}>
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">#{attempt.attempt_id}</span>
          <span className="text-xs text-gray-600">Step {attempt.stepIndex + 1}</span>
          <span className={`text-xs ${attempt.isCorrect ? "text-green-600" : "text-red-600"}`}>
            {attempt.isCorrect ? "✓" : "✗"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{attempt.cumulativeProgress.toFixed(1)}%</span>
          <button className="text-gray-400 hover:text-gray-600 text-xs">{isExpanded ? "▲" : "▼"}</button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-1 text-xs">
          <div>
            <span className="text-gray-500">Input:</span>
            <div className="font-mono bg-gray-50 p-1 rounded break-all">"{attempt.userInput}"</div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className={`text-xs ${attempt.isCorrect ? "text-green-600" : "text-red-600"} font-medium`}>
              {attempt.isCorrect ? "CORRECT" : "INCORRECT"}
            </span>
            <div className="w-20 bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${attempt.cumulativeProgress}%`,
                  background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileAttemptCard({ attempt }: AttemptCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-xs font-mono font-medium" style={{ background: `${color.aqua}20`, color: color.teal }}>
            #{attempt.attempt_id}
          </span>
          <span className="text-xs text-gray-600">S{attempt.stepIndex + 1}</span>
          <span className={`text-xs font-medium ${attempt.isCorrect ? "text-green-600" : "text-red-600"}`}>
            {attempt.isCorrect ? "✓" : "✗"}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-gray-700">{attempt.cumulativeProgress.toFixed(0)}%</div>
          <div className="w-16 bg-gray-200 rounded-full h-1">
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${attempt.cumulativeProgress}%`, background: `linear-gradient(90deg, ${color.teal}, ${color.aqua})` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-1">
        <div className="text-xs text-gray-500 truncate">
          <span className="text-gray-400">Input:</span> "{attempt.userInput}"
        </div>
        {attempt.timeSpentOnStep && (
          <div className="text-xs text-green-600">⏱️ {(attempt.timeSpentOnStep / 1000).toFixed(1)}s</div>
        )}
      </div>
    </div>
  );
}
