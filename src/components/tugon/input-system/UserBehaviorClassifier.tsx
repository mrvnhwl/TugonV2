import { UserAttempt } from './UserInput';

// Update BehaviorType to remove persistent, learning, excellent, inactive
export type BehaviorType = 

  | 'struggling' 
  | 'guessing' 
  | 'self-correction'   // Keep this one
  | 'repeating';        // Keep this one

export interface BehaviorTrigger {
  type: BehaviorType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  triggeredAt: number;
  evidence: string[];
  stepIndex?: number;
  attemptIds: number[];
}

export interface StepBehaviorAnalysis {
   stepLabel: string;
  primaryBehavior: BehaviorType | null; // Changed to allow null
  behaviorFlags: BehaviorType[];
  wrongAttempts: number;
  totalTime: number;
  averageAttemptTime: number;
  isStuck: boolean;
  behaviorScores: Record<BehaviorType, number>;
}

export interface UserBehaviorProfile {
  currentBehavior: BehaviorType | null; // Changed from BehaviorType to BehaviorType | null
  activeTriggers: BehaviorTrigger[];
  behaviorHistory: BehaviorTrigger[];
  stepBehaviors: Record<number, StepBehaviorAnalysis>;
  overallAccuracy: number;
  averageTimePerAttempt: number;
  totalAttempts: number;
  strugglingSteps: number[];
  guessingPatterns: number;
}

export class UserBehaviorClassifier {
  // Enhanced thresholds based on the plan specifications
  public static readonly THRESHOLDS = {
    // Struggling: ≥5 wrong attempts within 30s on same step (adjusted to reduce conflicts)
    STRUGGLING_WRONG_ATTEMPTS: 5,
    STRUGGLING_TIME_WINDOW: 30000, // 30 seconds
    STRUGGLING_RESET_INACTIVITY: 30000, // Reset after 30s inactivity
    
    // Guessing: ≥3 attempts in 10s AND average token Levenshtein distance ≥3
    GUESSING_ATTEMPTS_COUNT: 3,
    GUESSING_TIME_WINDOW: 10000, // 10 seconds
    GUESSING_TOKEN_DISTANCE_THRESHOLD: 3,
    
    // Repeating: identical token array ≥2 times in a row without progress
    REPEATING_CONSECUTIVE_THRESHOLD: 2,
    
    // Legacy thresholds (keeping for compatibility)
    RAPID_SUBMISSION_TIME: 3500,
    MIN_INPUT_LENGTH_RATIO: 0.3,
    
    // Hint interval thresholds
    HINT_INTERVAL_ATTEMPTS: 3,
    
    // Additional legacy mappings for existing code
    TIME_ON_STEP_STRUGGLING: 30000,         // Maps to STRUGGLING_TIME_WINDOW
    WRONG_ATTEMPTS_STRUGGLING: 5,          // Maps to STRUGGLING_WRONG_ATTEMPTS (updated)
    RUSHING_TIME: 3000,                     // For rushing detection
    RUSHING_CONSISTENCY_THRESHOLD: 0.6,     // 60% rushing consistency
    RAPID_SUBMISSION_COUNT: 3,              // Number of rapid submissions
    GUESSING_TIME_THRESHOLD: 2000,          // 2 seconds average for guessing
    HIGH_ERROR_RATE_THRESHOLD: 0.7,         // 70% error rate threshold
  };

  // Session state tracking for step-based detection
  private static sessionState: {
    stepStates: Record<number, {
      attempts: UserAttempt[];
      strugglingDetected: boolean;
      guessingDetected: boolean;
      repeatingDetected: boolean;
      lastResetTime: number;
    }>;
    sessionStartTime: number;
    totalStrugglingSteps: number;
    escalationTriggered: boolean;
  } = {
    stepStates: {},
    sessionStartTime: Date.now(),
    totalStrugglingSteps: 0,
    escalationTriggered: false
  };

  static analyzeUserBehavior(attempts: UserAttempt[]): UserBehaviorProfile {
    if (attempts.length === 0) {
      return this.createEmptyProfile();
    }

    // Enhanced session-based analysis
    this.updateSessionState(attempts);
    const stepBehaviors = this.analyzeStepBehaviors(attempts);
    const activeTriggers = this.detectEnhancedBehaviorTriggers(attempts, stepBehaviors);
    const overallStats = this.calculateOverallStats(attempts);
    
    // Determine current primary behavior with enhanced detection
    const currentBehavior = this.determinePrimaryBehaviorImproved(activeTriggers, stepBehaviors);
    
    return {
      currentBehavior,
      activeTriggers,
      behaviorHistory: [],
      stepBehaviors,
      ...overallStats
    };
  }

  // Enhanced session state management
  private static updateSessionState(attempts: UserAttempt[]): void {
    const now = Date.now();
    
    // Group attempts by step for enhanced analysis
    const stepGroups = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.stepIndex]) {
        acc[attempt.stepIndex] = [];
      }
      acc[attempt.stepIndex].push(attempt);
      return acc;
    }, {} as Record<number, UserAttempt[]>);

    // Update session state for each step
    Object.entries(stepGroups).forEach(([stepIndexStr, stepAttempts]) => {
      const stepIndex = parseInt(stepIndexStr);
      
      if (!this.sessionState.stepStates[stepIndex]) {
        this.sessionState.stepStates[stepIndex] = {
          attempts: [],
          strugglingDetected: false,
          guessingDetected: false,
          repeatingDetected: false,
          lastResetTime: now
        };
      }
      
      const stepState = this.sessionState.stepStates[stepIndex];
      stepState.attempts = stepAttempts;
      
      // Reset detection states if step was completed correctly or after inactivity
      const lastAttempt = stepAttempts[stepAttempts.length - 1];
      const timeSinceLastAttempt = now - lastAttempt.attemptTime;
      
      if (lastAttempt.isCorrect || timeSinceLastAttempt > this.THRESHOLDS.STRUGGLING_RESET_INACTIVITY) {
        stepState.strugglingDetected = false;
        stepState.guessingDetected = false;
        stepState.repeatingDetected = false;
        stepState.lastResetTime = now;
      }
    });
  }

  // Enhanced behavior trigger detection based on the plan
  private static detectEnhancedBehaviorTriggers(
    attempts: UserAttempt[], 
    stepBehaviors: Record<number, StepBehaviorAnalysis>
  ): BehaviorTrigger[] {
    const triggers: BehaviorTrigger[] = [];
    const now = Date.now();

    Object.entries(stepBehaviors).forEach(([stepIndexStr, behavior]) => {
      const stepIndex = parseInt(stepIndexStr);
      const stepAttempts = attempts.filter(a => a.stepIndex === stepIndex);
      
      if (stepAttempts.length === 0) return;

      // Enhanced struggling detection: ≥10 wrong attempts within 30s on same step
      if (this.detectEnhancedStruggling(stepAttempts)) {
        triggers.push({
          type: 'struggling',
          severity: 'high',
          description: `≥${this.THRESHOLDS.STRUGGLING_WRONG_ATTEMPTS} wrong attempts within 30s on step ${stepIndex + 1}`,
          triggeredAt: now,
          evidence: [`${behavior.wrongAttempts} wrong attempts`, `${behavior.totalTime}ms total time`],
          stepIndex,
          attemptIds: stepAttempts.map(a => a.attempt_id)
        });
      }

      // Enhanced guessing detection: ≥3 attempts in 10s AND token distance ≥3
      if (this.detectEnhancedGuessing(stepAttempts)) {
        triggers.push({
          type: 'guessing',
          severity: 'medium',
          description: `≥${this.THRESHOLDS.GUESSING_ATTEMPTS_COUNT} attempts in 10s with high token variance`,
          triggeredAt: now,
          evidence: this.getGuessingEvidence(stepAttempts),
          stepIndex,
          attemptIds: stepAttempts.map(a => a.attempt_id)
        });
      }

      // Enhanced repeating detection: identical tokens ≥2 times in a row
      if (this.detectEnhancedRepeating(stepAttempts)) {
        triggers.push({
          type: 'repeating',
          severity: 'low',
          description: `Identical input repeated ≥${this.THRESHOLDS.REPEATING_CONSECUTIVE_THRESHOLD} times`,
          triggeredAt: now,
          evidence: this.getRepeatingEvidence(stepAttempts),
          stepIndex,
          attemptIds: stepAttempts.map(a => a.attempt_id)
        });
      }
    });

    return triggers;
  }

  private static analyzeStepBehaviors(attempts: UserAttempt[]): Record<number, StepBehaviorAnalysis> {
    const stepGroups = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.stepIndex]) {
        acc[attempt.stepIndex] = [];
      }
      acc[attempt.stepIndex].push(attempt);
      return acc;
    }, {} as Record<number, UserAttempt[]>);

    const stepBehaviors: Record<number, StepBehaviorAnalysis> = {};

    Object.entries(stepGroups).forEach(([stepIndexStr, stepAttempts]) => {
      const stepIndex = parseInt(stepIndexStr);
      const analysis = this.analyzeStepBehaviorDetailed(stepAttempts);
      stepBehaviors[stepIndex] = analysis;
    });

    return stepBehaviors;
  }

  private static analyzeStepBehaviorDetailed(stepAttempts: UserAttempt[]): StepBehaviorAnalysis {
    const wrongAttempts = stepAttempts.filter(a => !a.isCorrect).length;
    const correctAttempt = stepAttempts.find(a => a.isCorrect);
    
    const totalTime = stepAttempts.length > 0 
      ? stepAttempts[stepAttempts.length - 1].attemptTime - stepAttempts[0].stepStartTime
      : 0;
    
    const averageAttemptTime = this.calculateAverageAttemptTime(stepAttempts);
    const isStuck = !correctAttempt && (wrongAttempts >= this.THRESHOLDS.STRUGGLING_WRONG_ATTEMPTS || totalTime > this.THRESHOLDS.TIME_ON_STEP_STRUGGLING);

    // Calculate behavior scores to avoid overlaps
    const behaviorScores = this.calculateBehaviorScores(stepAttempts, {
      wrongAttempts,
      totalTime,
      averageAttemptTime,
      isStuck
    });

    // Determine primary behavior and all flags
    const primaryBehavior = this.selectPrimaryBehaviorFromScores(behaviorScores);
    const behaviorFlags = this.getBehaviorFlags(behaviorScores);

    return {
      stepLabel: stepAttempts[0]?.stepLabel || 'Unknown',
      primaryBehavior,
      behaviorFlags,
      wrongAttempts,
      totalTime,
      averageAttemptTime,
      isStuck,
      behaviorScores
    };
  }

private static calculateBehaviorScores(
  stepAttempts: UserAttempt[], 
  stats: { wrongAttempts: number; totalTime: number; averageAttemptTime: number; isStuck: boolean }
): Record<BehaviorType, number> {
  const scores: Record<BehaviorType, number> = {
    'struggling': 0,
    'guessing': 0,
    'self-correction': 0,
    'repeating': 0
  };

    // STRUGGLING SCORES
    if (stats.wrongAttempts >= this.THRESHOLDS.WRONG_ATTEMPTS_STRUGGLING) {
      scores['struggling'] = 0.7 + (stats.wrongAttempts - this.THRESHOLDS.WRONG_ATTEMPTS_STRUGGLING) * 0.1;
      scores['struggling'] = Math.min(1.0, scores['struggling']); // Cap at 1.0
    }

    // Time-based struggling (only if showing difficulty)
    if (stats.totalTime > this.THRESHOLDS.TIME_ON_STEP_STRUGGLING && stats.isStuck) {
      const timeScore = Math.min(0.8, stats.totalTime / (this.THRESHOLDS.TIME_ON_STEP_STRUGGLING * 2));
      scores['struggling'] = Math.max(scores['struggling'], timeScore);
    }

    // GUESSING SCORES (includes previous rushing logic)
    const rapidAttempts = this.findRapidAttempts(stepAttempts);
    const randomInputs = this.findRandomInputs(stepAttempts);
    const hasSequentialPattern = this.detectSequentialPattern(stepAttempts);

    let guessingScore = 0;

    // Score for rapid attempts (previously rushing)
    const quickAttempts = stepAttempts.filter((_, i) => {
      if (i === 0) return false;
      const timeDiff = stepAttempts[i].attemptTime - stepAttempts[i-1].attemptTime;
      return timeDiff < this.THRESHOLDS.RUSHING_TIME;
    });
    const rushingRatio = quickAttempts.length / Math.max(1, (stepAttempts.length - 1));
    if (rushingRatio >= this.THRESHOLDS.RUSHING_CONSISTENCY_THRESHOLD) {
      guessingScore += 0.5;
    }

    // Score for rapid submissions and random/sequential inputs
    if (rapidAttempts.length >= this.THRESHOLDS.RAPID_SUBMISSION_COUNT) {
      guessingScore += 0.4;
    }
    if (randomInputs.length >= 2) {
      guessingScore += 0.4;
    }
    if (hasSequentialPattern) {
      guessingScore += 0.5;
    }

    scores['guessing'] = Math.min(1.0, guessingScore);

    // SELF-CORRECTION: User makes wrong attempts, then corrects after thinking
    const selfCorrectionScore = this.detectSelfCorrection(stepAttempts);
    scores['self-correction'] = selfCorrectionScore;

    // REPEATING: User repeats exact same input multiple times
    const repeatingScore = this.detectRepeatingBehavior(stepAttempts);
    scores['repeating'] = repeatingScore;

    // NORMAL SCORE: Only if no other significant behaviors detected
    // Note: Normal behavior detection logic can be added here if needed
    // const maxOtherScore = Math.max(
    //   scores['struggling'],
    //   scores['guessing'], 
    //   scores['self-correction'],
    //   scores['repeating']
    // );
    
    // Only assign normal if no other behavior is strong enough

    // Resolve conflicts by reducing overlapping scores
    this.resolveScoreConflicts(scores);

    return scores;
  }

  private static resolveScoreConflicts(scores: Record<BehaviorType, number>): void {
    // Rule 1: If guessing score is higher than struggling, let guessing take priority
    if (scores['guessing'] > scores['struggling']) {
      scores['struggling'] *= 0.5;
    }

    // Rule 2: Self-correction conflicts with other behaviors (they learned)
    if (scores['self-correction'] > 0.5) {
      scores['struggling'] *= 0.3;
      scores['guessing'] *= 0.2;
    }

    // Rule 3: Repeating and guessing can coexist but reduce normal
    if (scores['repeating'] > 0.5) {
      scores['self-correction'] *= 0.3;
    }
  }

  private static selectPrimaryBehaviorFromScores(scores: Record<BehaviorType, number>): BehaviorType | null {
  const entries = Object.entries(scores) as [BehaviorType, number][];
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
  
  const topBehavior = sortedEntries[0];
  
  // Return behavior only if score is significant, otherwise null
  return topBehavior && topBehavior[1] > 0.5 ? topBehavior[0] : null;
}

 private static getBehaviorFlags(scores: Record<BehaviorType, number>): BehaviorType[] {
  return Object.entries(scores)
    .filter(([_behavior, score]) => score > 0.3)  // FIXED: Remove "&& behavior !== 'normal'"
    .map(([behavior]) => behavior as BehaviorType);
}

  // Legacy methods - preserved for reference but not used in enhanced system
  /*
  private static detectBehaviorTriggers(
    attempts: UserAttempt[], 
    stepBehaviors: Record<number, StepBehaviorAnalysis>
  ): BehaviorTrigger[] {
    // Legacy behavior trigger detection logic
    // This is replaced by the new enhanced detection system
    return [];
  }

  private static getSeverityFromScore(score: number): 'low' | 'medium' | 'high' {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  private static generateTriggerDescription(behavior: BehaviorType, stepData: StepBehaviorAnalysis): string {
    // Legacy trigger description generation
    return `Legacy ${behavior} behavior on ${stepData.stepLabel}`;
  }

  private static generateEvidence(behavior: BehaviorType, stepData: StepBehaviorAnalysis): string[] {
    // Legacy evidence generation
    return [`Legacy evidence for ${behavior}`];
  }

  private static determinePrimaryBehaviorImproved(
    triggers: BehaviorTrigger[], 
    stepBehaviors: Record<number, StepBehaviorAnalysis>
  ): BehaviorType | null {
    // Legacy primary behavior determination
    return null;
  }
  */

  // Helper methods still used by legacy scoring system
  private static findRapidAttempts(stepAttempts: UserAttempt[]): UserAttempt[] {
    return stepAttempts.filter((attempt, index) => {
      if (index === 0) return false;
      const timeDiff = attempt.attemptTime - stepAttempts[index - 1].attemptTime;
      return timeDiff < this.THRESHOLDS.RAPID_SUBMISSION_TIME;
    });
  }

  private static findRandomInputs(stepAttempts: UserAttempt[]): UserAttempt[] {
    return stepAttempts.filter(attempt => {
      const expectedLength = attempt.expectedAnswer.length;
      const inputLength = attempt.userInput.length;
      
      if (inputLength < expectedLength * this.THRESHOLDS.MIN_INPUT_LENGTH_RATIO) {
        return true;
      }
      
      if (this.isObviouslyRandom(attempt.userInput)) {
        return true;
      }
      
      return false;
    });
  }

  private static detectSequentialPattern(stepAttempts: UserAttempt[]): boolean {
    if (stepAttempts.length < 3) return false;
    
    const inputs = stepAttempts.map(a => a.userInput.trim()).filter(input => input.length > 0);
    let sequentialCount = 0;
    
    for (let i = 0; i < inputs.length - 2; i++) {
      const num1 = parseInt(inputs[i]);
      const num2 = parseInt(inputs[i + 1]);
      const num3 = parseInt(inputs[i + 2]);
      
      if (!isNaN(num1) && !isNaN(num2) && !isNaN(num3)) {
        if (num2 === num1 + 1 && num3 === num2 + 1) {
          sequentialCount++;
        }
      }
    }
    
    return sequentialCount >= 1; // Even one sequential pattern is significant
  }

  private static isObviouslyRandom(input: string): boolean {
    if (/(.)\1{2,}/.test(input)) return true;
    if (/[qwertyuiop]{3,}|[asdfghjkl]{3,}|[zxcvbnm]{3,}/.test(input.toLowerCase())) return true;
    return false;
  }

  private static determinePrimaryBehaviorImproved(
    triggers: BehaviorTrigger[], 
    stepBehaviors: Record<number, StepBehaviorAnalysis>
  ): BehaviorType | null {
    if (triggers.length === 0) return null;
    
    // Weight recent steps more heavily
    const recentSteps = Object.values(stepBehaviors).slice(-3);
    const behaviorCounts: Record<BehaviorType, number> = {
      'struggling': 0,
      'guessing': 0,
      'self-correction': 0,
      'repeating': 0
    };
    
    // Count behaviors from recent steps with higher weight
    recentSteps.forEach((step, index) => {
      const weight = index === recentSteps.length - 1 ? 2 : 1; // Latest step gets double weight
      if (step.primaryBehavior) {
        behaviorCounts[step.primaryBehavior] += weight;
      }
    });
    
    // Find the most common recent behavior
    const mostCommonBehavior = Object.entries(behaviorCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostCommonBehavior && mostCommonBehavior[1] > 0 
      ? mostCommonBehavior[0] as BehaviorType 
      : null;
  }

  private static calculateAverageAttemptTime(attempts: UserAttempt[]): number {
    if (attempts.length <= 1) return 0;
    
    let totalTime = 0;
    for (let i = 1; i < attempts.length; i++) {
      totalTime += attempts[i].attemptTime - attempts[i - 1].attemptTime;
    }
    
    return totalTime / (attempts.length - 1);
  }

  // Enhanced behavior detection methods based on the plan

  // Struggling: ≥3 wrong attempts within 30s on same step
  private static detectEnhancedStruggling(stepAttempts: UserAttempt[]): boolean {
    if (stepAttempts.length < this.THRESHOLDS.STRUGGLING_WRONG_ATTEMPTS) return false;
    
    const wrongAttempts = stepAttempts.filter(a => !a.isCorrect);
    if (wrongAttempts.length < this.THRESHOLDS.STRUGGLING_WRONG_ATTEMPTS) return false;
    
    // Check if these wrong attempts occurred within the time window
    const recentWrongAttempts = wrongAttempts.slice(-this.THRESHOLDS.STRUGGLING_WRONG_ATTEMPTS);
    const timeSpan = recentWrongAttempts[recentWrongAttempts.length - 1].attemptTime - 
                    recentWrongAttempts[0].attemptTime;
    
    return timeSpan <= this.THRESHOLDS.STRUGGLING_TIME_WINDOW;
  }

  // Guessing: ≥3 attempts in 10s AND average token Levenshtein distance ≥3
  private static detectEnhancedGuessing(stepAttempts: UserAttempt[]): boolean {
    if (stepAttempts.length < this.THRESHOLDS.GUESSING_ATTEMPTS_COUNT) return false;
    
    // Check recent attempts within time window
    const now = Date.now();
    const recentAttempts = stepAttempts.filter(
      a => (now - a.attemptTime) <= this.THRESHOLDS.GUESSING_TIME_WINDOW
    );
    
    if (recentAttempts.length < this.THRESHOLDS.GUESSING_ATTEMPTS_COUNT) return false;
    
    // Calculate token distance between consecutive attempts
    let totalDistance = 0;
    let comparisons = 0;
    
    for (let i = 1; i < recentAttempts.length; i++) {
      const prevTokens = recentAttempts[i - 1].tokens;
      const currTokens = recentAttempts[i].tokens;
      const distance = this.calculateTokenLevenshteinDistance(prevTokens, currTokens);
      totalDistance += distance;
      comparisons++;
    }
    
    const avgDistance = comparisons > 0 ? totalDistance / comparisons : 0;
    return avgDistance >= this.THRESHOLDS.GUESSING_TOKEN_DISTANCE_THRESHOLD;
  }

  // Repeating: identical token array ≥2 times in a row without progress
  private static detectEnhancedRepeating(stepAttempts: UserAttempt[]): boolean {
    if (stepAttempts.length < this.THRESHOLDS.REPEATING_CONSECUTIVE_THRESHOLD) return false;
    
    // Check for consecutive identical token arrays
    for (let i = 1; i < stepAttempts.length; i++) {
      const prevTokens = JSON.stringify(stepAttempts[i - 1].tokens);
      const currTokens = JSON.stringify(stepAttempts[i].tokens);
      
      if (prevTokens === currTokens && prevTokens !== '[]') {
        // Found consecutive identical attempts
        let consecutiveCount = 2; // Current and previous
        
        // Check for more consecutive attempts
        for (let j = i + 1; j < stepAttempts.length; j++) {
          const nextTokens = JSON.stringify(stepAttempts[j].tokens);
          if (nextTokens === currTokens) {
            consecutiveCount++;
          } else {
            break;
          }
        }
        
        if (consecutiveCount >= this.THRESHOLDS.REPEATING_CONSECUTIVE_THRESHOLD) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Token-based Levenshtein distance calculation
  private static calculateTokenLevenshteinDistance(tokens1: string[], tokens2: string[]): number {
    const matrix = Array(tokens1.length + 1).fill(null).map(() => Array(tokens2.length + 1).fill(null));
    
    for (let i = 0; i <= tokens1.length; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= tokens2.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= tokens1.length; i++) {
      for (let j = 1; j <= tokens2.length; j++) {
        if (tokens1[i - 1] === tokens2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,     // deletion
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j - 1] + 1  // substitution
          );
        }
      }
    }
    
    return matrix[tokens1.length][tokens2.length];
  }

  // Evidence generation for debugging and user feedback
  private static getGuessingEvidence(stepAttempts: UserAttempt[]): string[] {
    const evidence: string[] = [];
    const recentAttempts = stepAttempts.slice(-this.THRESHOLDS.GUESSING_ATTEMPTS_COUNT);
    
    evidence.push(`${recentAttempts.length} rapid attempts`);
    
    if (recentAttempts.length > 1) {
      const timeSpan = recentAttempts[recentAttempts.length - 1].attemptTime - recentAttempts[0].attemptTime;
      evidence.push(`${timeSpan}ms time span`);
      
      let totalDistance = 0;
      let comparisons = 0;
      
      for (let i = 1; i < recentAttempts.length; i++) {
        const distance = this.calculateTokenLevenshteinDistance(
          recentAttempts[i - 1].tokens,
          recentAttempts[i].tokens
        );
        totalDistance += distance;
        comparisons++;
      }
      
      const avgDistance = comparisons > 0 ? (totalDistance / comparisons).toFixed(1) : '0';
      evidence.push(`Average token distance: ${avgDistance}`);
    }
    
    return evidence;
  }

  private static getRepeatingEvidence(stepAttempts: UserAttempt[]): string[] {
    const evidence: string[] = [];
    
    // Find the repeated token pattern
    for (let i = 1; i < stepAttempts.length; i++) {
      const prevTokens = JSON.stringify(stepAttempts[i - 1].tokens);
      const currTokens = JSON.stringify(stepAttempts[i].tokens);
      
      if (prevTokens === currTokens && prevTokens !== '[]') {
        const tokenArray = stepAttempts[i].tokens;
        evidence.push(`Repeated input: "${tokenArray.join(' ')}"`);
        
        let consecutiveCount = 2;
        for (let j = i + 1; j < stepAttempts.length; j++) {
          const nextTokens = JSON.stringify(stepAttempts[j].tokens);
          if (nextTokens === currTokens) {
            consecutiveCount++;
          } else {
            break;
          }
        }
        
        evidence.push(`${consecutiveCount} consecutive identical attempts`);
        break;
      }
    }
    
    return evidence;
  }

  private static calculateOverallStats(attempts: UserAttempt[]) {
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const overallAccuracy = attempts.length > 0 ? correctAttempts / attempts.length : 0;
    const averageTimePerAttempt = this.calculateAverageAttemptTime(attempts);
    
    const strugglingSteps = Object.entries(this.analyzeStepBehaviors(attempts))
      .filter(([_, stepData]) => stepData.primaryBehavior === 'struggling')
      .map(([stepIndex]) => parseInt(stepIndex));
    
    const guessingPatterns = attempts.filter(a => this.isObviouslyRandom(a.userInput)).length;
    
    return {
      overallAccuracy,
      averageTimePerAttempt,
      totalAttempts: attempts.length,
      strugglingSteps,
      guessingPatterns
    };
  }

 private static createEmptyProfile(): UserBehaviorProfile {
  return {
    currentBehavior: null, // Changed from 'normal' to null
    activeTriggers: [],
    behaviorHistory: [],
    stepBehaviors: {},
    overallAccuracy: 0,
    averageTimePerAttempt: 0,
    totalAttempts: 0,
    strugglingSteps: [],
    guessingPatterns: 0
  };
}


  // Public utility methods
  static getBehaviorDescription(behavior: BehaviorType | null): string {
  if (!behavior) return 'No specific behavior pattern detected';
  
  const descriptions: Record<BehaviorType, string> = {
    'struggling': 'Having difficulty with current step',
    'guessing': 'Making rapid, seemingly random attempts',
    'self-correction': 'Learning from mistakes and improving',
    'repeating': 'Repeating the same attempts'
  };
  
  return descriptions[behavior] || 'Unknown behavior pattern';
}

  static getBehaviorColor(behavior: BehaviorType | null): string {
  if (!behavior) return 'text-gray-500';
  
  const colors: Record<BehaviorType, string> = {
    'struggling': 'text-yellow-600',
    'guessing': 'text-orange-600',
    'self-correction': 'text-emerald-600',
    'repeating': 'text-amber-600'
  };
  
  return colors[behavior] || 'text-gray-600';
}

  private static detectSelfCorrection(stepAttempts: UserAttempt[]): number {
    if (stepAttempts.length < 2) return 0;
    
    // Look for pattern: wrong attempt(s) followed by correct attempt
    const hasWrongAttempts = stepAttempts.some(a => !a.isCorrect);
    const lastAttemptCorrect = stepAttempts[stepAttempts.length - 1]?.isCorrect;
    
    if (!hasWrongAttempts || !lastAttemptCorrect) return 0;
    
    // Check if there's a time gap indicating reflection/thinking
    let reflectionGap = 0;
    for (let i = 1; i < stepAttempts.length; i++) {
      const timeDiff = stepAttempts[i].attemptTime - stepAttempts[i-1].attemptTime;
      if (timeDiff > 5000) { // 5+ seconds indicates thinking
        reflectionGap++;
      }
    }
    
    // Score higher if there are wrong attempts but user eventually corrects
    const wrongCount = stepAttempts.filter(a => !a.isCorrect).length;
    const baseScore = Math.min(0.8, wrongCount * 0.3);
    const reflectionBonus = Math.min(0.3, reflectionGap * 0.15);
    
    return Math.min(1.0, baseScore + reflectionBonus);
  }

  private static detectRepeatingBehavior(stepAttempts: UserAttempt[]): number {
    if (stepAttempts.length < 3) return 0;
    
    const inputCounts = new Map<string, number>();
    let totalRepeats = 0;
    
    stepAttempts.forEach(attempt => {
      const input = attempt.userInput.trim().toLowerCase();
      if (input) {
        const count = inputCounts.get(input) || 0;
        inputCounts.set(input, count + 1);
        if (count >= 1) { // Already seen this input
          totalRepeats++;
        }
      }
    });
    
    // Check for consecutive identical inputs (stronger indicator)
    let consecutiveRepeats = 0;
    for (let i = 1; i < stepAttempts.length; i++) {
      const current = stepAttempts[i].userInput.trim().toLowerCase();
      const previous = stepAttempts[i-1].userInput.trim().toLowerCase();
      if (current === previous && current) {
        consecutiveRepeats++;
      }
    }
    
    const repeatRatio = totalRepeats / stepAttempts.length;
    const consecutiveBonus = consecutiveRepeats > 0 ? 0.4 : 0;
    
    return Math.min(1.0, repeatRatio * 0.8 + consecutiveBonus);
  }
}

export default UserBehaviorClassifier;