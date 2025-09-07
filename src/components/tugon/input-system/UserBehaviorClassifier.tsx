import { UserAttempt } from './UserInput';

// Update BehaviorType to include new behaviors
export type BehaviorType = 
  | 'normal' 
  | 'struggling' 
  | 'struggling-high' 
  | 'guessing' 
  | 'persistent'
  | 'learning'
  | 'self-correction'   // NEW: Good behavior
  | 'excellent'        // NEW: Good behavior
  | 'repeating'        // NEW: Bad behavior
  | 'inactive';        // NEW: Bad behavior

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
  primaryBehavior: BehaviorType;
  behaviorFlags: BehaviorType[]; // All detected behaviors for this step
  wrongAttempts: number;
  totalTime: number;
  averageAttemptTime: number;
  isStuck: boolean;
  behaviorScores: Record<BehaviorType, number>; // Confidence scores for each behavior
}

export interface UserBehaviorProfile {
  currentBehavior: BehaviorType;
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
  private static readonly THRESHOLDS = {
    // Struggling thresholds
    WRONG_ATTEMPTS_STRUGGLING: 3,
    WRONG_ATTEMPTS_HIGH_STRUGGLING: 5,
    TIME_ON_STEP_STRUGGLING: 60000, // 60 seconds
    
    // Guessing thresholds
    RAPID_SUBMISSION_TIME: 3000, // Reduced from 5s to 3s for clearer distinction
    RAPID_SUBMISSION_COUNT: 3,
    MIN_INPUT_LENGTH_RATIO: 0.3,
    GUESSING_TIME_THRESHOLD: 2000, // Must be quick AND show guessing patterns
    
    // Rushing thresholds
    RUSHING_TIME: 1500, // Reduced from 2s to 1.5s for clearer distinction
    RUSHING_CONSISTENCY_THRESHOLD: 0.8, // 80% of attempts must be quick
    
    // Persistent thresholds
    PERSISTENT_ATTEMPTS: 7,
    PERSISTENT_TIME_MIN: 30000, // Must spend at least 30s to be "persistent" not just "guessing"
  };

  static analyzeUserBehavior(attempts: UserAttempt[]): UserBehaviorProfile {
    if (attempts.length === 0) {
      return this.createEmptyProfile();
    }

    const stepBehaviors = this.analyzeStepBehaviors(attempts);
    const activeTriggers = this.detectBehaviorTriggers(attempts, stepBehaviors);
    const overallStats = this.calculateOverallStats(attempts);
    
    // Determine current primary behavior with better conflict resolution
    const currentBehavior = this.determinePrimaryBehaviorImproved(activeTriggers, stepBehaviors);
    
    return {
      currentBehavior,
      activeTriggers,
      behaviorHistory: [],
      stepBehaviors,
      ...overallStats
    };
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
    const isStuck = !correctAttempt && (wrongAttempts >= 3 || totalTime > this.THRESHOLDS.TIME_ON_STEP_STRUGGLING);

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
      'normal': 0,
      'struggling': 0,
      'struggling-high': 0,
      'guessing': 0,
      'persistent': 0,
      'learning': 0,
      'self-correction': 0,
      'excellent': 0,
      'repeating': 0,
      'inactive': 0
    };

    // STRUGGLING SCORES (based on difficulty indicators)
    if (stats.wrongAttempts >= this.THRESHOLDS.WRONG_ATTEMPTS_HIGH_STRUGGLING) {
      scores['struggling-high'] = 1.0;
      scores['struggling'] = 0.8; // Also somewhat struggling
    } else if (stats.wrongAttempts >= this.THRESHOLDS.WRONG_ATTEMPTS_STRUGGLING) {
      scores['struggling'] = 0.7 + (stats.wrongAttempts - this.THRESHOLDS.WRONG_ATTEMPTS_STRUGGLING) * 0.1;
    }

    // Time-based struggling (only if showing difficulty)
    if (stats.totalTime > this.THRESHOLDS.TIME_ON_STEP_STRUGGLING && stats.isStuck) {
      const timeScore = Math.min(0.8, stats.totalTime / (this.THRESHOLDS.TIME_ON_STEP_STRUGGLING * 2));
      scores['struggling'] = Math.max(scores['struggling'], timeScore);
    }

    // GUESSING SCORES (now includes previous rushing logic)
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

    // PERSISTENT SCORES (many attempts but taking time - showing effort)
    if (stepAttempts.length >= this.THRESHOLDS.PERSISTENT_ATTEMPTS && 
        stats.totalTime >= this.THRESHOLDS.PERSISTENT_TIME_MIN) {
      // High attempt count with reasonable time = persistence, not guessing
      const persistenceScore = Math.min(1.0, stepAttempts.length / (this.THRESHOLDS.PERSISTENT_ATTEMPTS * 2));
      scores['persistent'] = persistenceScore;
    }

    // NORMAL SCORE (default when no strong patterns detected)
    const maxOtherScore = Math.max(...Object.entries(scores)
      .filter(([key]) => key !== 'normal' && key !== 'learning')
      .map(([_, score]) => score));
    
    scores['normal'] = Math.max(0, 1.0 - maxOtherScore * 1.2);

    // NEW BEHAVIOR DETECTION

    // SELF-CORRECTION: User makes wrong attempts, then corrects after hint or thinking
    const selfCorrectionScore = this.detectSelfCorrection(stepAttempts);
    scores['self-correction'] = selfCorrectionScore;

    // EXCELLENT: User solves correctly on first try
    const excellentScore = this.detectExcellentPerformance(stepAttempts);
    scores['excellent'] = excellentScore;

    // REPEATING: User repeats exact same input multiple times
    const repeatingScore = this.detectRepeatingBehavior(stepAttempts);
    scores['repeating'] = repeatingScore;

 

    // Resolve conflicts by reducing overlapping scores
    this.resolveScoreConflicts(scores);

    return scores;
  }

  private static resolveScoreConflicts(scores: Record<BehaviorType, number>): void {
    // Rule 1: Struggling-high and struggling are mutually exclusive
      if (scores['struggling-high'] > 0.5) {
    scores['struggling'] = Math.min(scores['struggling'], 0.3);
  }

  // Rule 2: If guessing score is higher than struggling, let guessing take priority
  if (scores['guessing'] > scores['struggling']) {
    scores['struggling'] *= 0.5;
  }

  // Rule 3: Persistent and guessing conflict - persistence implies thoughtful attempts
  if (scores['persistent'] > 0.5) {
    scores['guessing'] *= 0.2; // Very low guessing if being persistent
  }

  // NEW CONFLICT RULES

  // Rule 4: Excellent and any struggling behavior conflict
  if (scores['excellent'] > 0.5) {
    scores['struggling'] *= 0.1;
    scores['struggling-high'] *= 0.1;
    scores['guessing'] *= 0.3;
  }

  // Rule 5: Self-correction and excellent conflict (can't be both)
  if (scores['self-correction'] > 0.5 && scores['excellent'] > 0.5) {
    if (scores['self-correction'] > scores['excellent']) {
      scores['excellent'] *= 0.2;
    } else {
      scores['self-correction'] *= 0.2;
    }
  }

  // Rule 6: Inactive behavior overrides most others except struggling-high
  if (scores['inactive'] > 0.6) {
    scores['normal'] *= 0.1;
    scores['excellent'] *= 0.1;
    scores['self-correction'] *= 0.2;
    scores['guessing'] *= 0.3;
  }

  // Rule 7: Repeating and guessing can coexist but reduce normal
  if (scores['repeating'] > 0.5) {
    scores['normal'] *= 0.3;
    scores['excellent'] *= 0.1;
  }
  }

  private static selectPrimaryBehaviorFromScores(scores: Record<BehaviorType, number>): BehaviorType {
    // Find the behavior with the highest score above a threshold
    const entries = Object.entries(scores) as [BehaviorType, number][];
    const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
    
    const topBehavior = sortedEntries[0];
    
    // Only return non-normal behavior if score is significant
    if (topBehavior[1] > 0.5 && topBehavior[0] !== 'normal') {
      return topBehavior[0];
    }
    
    return 'normal';
  }

  private static getBehaviorFlags(scores: Record<BehaviorType, number>): BehaviorType[] {
    return Object.entries(scores)
      .filter(([behavior, score]) => score > 0.3 && behavior !== 'normal')
      .map(([behavior]) => behavior as BehaviorType);
  }

  private static detectBehaviorTriggers(
    attempts: UserAttempt[], 
    stepBehaviors: Record<number, StepBehaviorAnalysis>
  ): BehaviorTrigger[] {
    const triggers: BehaviorTrigger[] = [];
    const now = Date.now();

    // Create triggers based on step behavior analysis
    Object.entries(stepBehaviors).forEach(([stepIndexStr, stepData]) => {
      const stepIndex = parseInt(stepIndexStr);
      const stepAttempts = attempts.filter(a => a.stepIndex === stepIndex);
      
      // Only create trigger for primary behavior if it's significant
      if (stepData.primaryBehavior !== 'normal' && stepData.behaviorScores[stepData.primaryBehavior] > 0.6) {
        triggers.push({
          type: stepData.primaryBehavior,
          severity: this.getSeverityFromScore(stepData.behaviorScores[stepData.primaryBehavior]),
          description: this.generateTriggerDescription(stepData.primaryBehavior, stepData),
          triggeredAt: now,
          evidence: this.generateEvidence(stepData.primaryBehavior, stepData),
          stepIndex,
          attemptIds: stepAttempts.map(a => a.attempt_id)
        });
      }

      // Add additional triggers for secondary behaviors if they're strong enough
      stepData.behaviorFlags.forEach(behavior => {
        if (behavior !== stepData.primaryBehavior && stepData.behaviorScores[behavior] > 0.7) {
          triggers.push({
            type: behavior,
            severity: 'medium',
            description: `Secondary ${behavior} behavior detected on ${stepData.stepLabel}`,
            triggeredAt: now,
            evidence: this.generateEvidence(behavior, stepData),
            stepIndex,
            attemptIds: stepAttempts.map(a => a.attempt_id)
          });
        }
      });
    });

    return triggers;
  }

  private static getSeverityFromScore(score: number): 'low' | 'medium' | 'high' {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  private static generateTriggerDescription(behavior: BehaviorType, stepData: StepBehaviorAnalysis): string {
    const descriptions: Record<BehaviorType, string> = {
      'struggling-high': `High struggling: ${stepData.wrongAttempts} wrong attempts on ${stepData.stepLabel}`,
      'struggling': `Struggling with ${stepData.stepLabel}: ${stepData.wrongAttempts} attempts`,
      'guessing': `Guessing behavior on ${stepData.stepLabel}: rapid random attempts`,
    
      'persistent': `Persistent effort on ${stepData.stepLabel}: ${stepData.wrongAttempts + 1} attempts over ${(stepData.totalTime/1000).toFixed(1)}s`,
      'normal': `Normal progress on ${stepData.stepLabel}`,
      'learning': `Learning pattern on ${stepData.stepLabel}`,
      'self-correction': `Self-correction on ${stepData.stepLabel}: improved after initial attempts`,
      'excellent': `Excellent performance on ${stepData.stepLabel}: correct on first try`,
      'repeating': `Repeating behavior on ${stepData.stepLabel}: same input multiple times`,
      'inactive': `Inactive behavior on ${stepData.stepLabel}: idle timeout triggered`
    };
    
    return descriptions[behavior] || `${behavior} behavior on ${stepData.stepLabel}`;
  }

  private static generateEvidence(behavior: BehaviorType, stepData: StepBehaviorAnalysis): string[] {
    const evidence: string[] = [];
    
    switch (behavior) {
      case 'struggling-high':
      case 'struggling':
        evidence.push(`${stepData.wrongAttempts} wrong attempts`);
        evidence.push(`${(stepData.totalTime / 1000).toFixed(1)}s spent on step`);
        if (stepData.isStuck) evidence.push('Still stuck on step');
        break;
        
      case 'guessing':
        evidence.push(`Quick attempts: avg ${stepData.averageAttemptTime.toFixed(0)}ms`);
        evidence.push(`Score: ${(stepData.behaviorScores.guessing * 100).toFixed(0)}% confidence`);
        break;
        
      case 'persistent':
        evidence.push(`${stepData.wrongAttempts + 1} total attempts`);
        evidence.push(`${(stepData.totalTime / 1000).toFixed(1)}s of sustained effort`);
        break;
        
      case 'self-correction':
        evidence.push(`Eventually corrected after ${stepData.wrongAttempts} wrong attempts`);
        evidence.push(`Showed improvement pattern`);
        break;
        
      case 'excellent':
        evidence.push(`Solved correctly on first attempt`);
        evidence.push(`Quick and accurate response`);
        break;
        
      case 'repeating':
        evidence.push(`Repeated same input multiple times`);
        evidence.push(`Showing repetitive pattern`);
        break;
        
      case 'inactive':
        evidence.push(`Idle timeout triggered`);
        evidence.push(`No activity for extended period`);
        break;
    }
    
    return evidence;
  }

  private static determinePrimaryBehaviorImproved(
    triggers: BehaviorTrigger[], 
    stepBehaviors: Record<number, StepBehaviorAnalysis>
  ): BehaviorType {
    if (triggers.length === 0) return 'normal';
    
    // Weight recent steps more heavily
    const recentSteps = Object.values(stepBehaviors).slice(-3);
    const behaviorCounts: Record<BehaviorType, number> = {
        'normal': 0,
        'struggling': 0,
        'struggling-high': 0,
        'guessing': 0,
        'persistent': 0,
        'learning': 0,
        'self-correction': 0,
        'excellent': 0,
        'repeating': 0,
        'inactive': 0
    };
    
    // Count behaviors from recent steps with higher weight
    recentSteps.forEach((step, index) => {
      const weight = index === recentSteps.length - 1 ? 2 : 1; // Latest step gets double weight
      behaviorCounts[step.primaryBehavior] += weight;
    });
    
    // Find the most common recent behavior
    const mostCommonBehavior = Object.entries(behaviorCounts)
      .filter(([behavior]) => behavior !== 'normal')
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostCommonBehavior && mostCommonBehavior[1] > 0 
      ? mostCommonBehavior[0] as BehaviorType 
      : 'normal';
  }

  // Helper methods (keeping existing implementations but with improved thresholds)
  private static detectStepGuessing(stepAttempts: UserAttempt[]): boolean {
    const rapidAttempts = this.findRapidAttempts(stepAttempts);
    const randomInputs = this.findRandomInputs(stepAttempts);
    const sequentialPattern = this.detectSequentialPattern(stepAttempts);
    const avgTime = this.calculateAverageAttemptTime(stepAttempts);
    
    // Stricter guessing detection - needs BOTH speed AND randomness
    return avgTime < this.THRESHOLDS.GUESSING_TIME_THRESHOLD && (
      (rapidAttempts.length >= this.THRESHOLDS.RAPID_SUBMISSION_COUNT && randomInputs.length >= 2) ||
      sequentialPattern
    );
  }

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

  private static calculateAverageAttemptTime(attempts: UserAttempt[]): number {
    if (attempts.length <= 1) return 0;
    
    let totalTime = 0;
    for (let i = 1; i < attempts.length; i++) {
      totalTime += attempts[i].attemptTime - attempts[i - 1].attemptTime;
    }
    
    return totalTime / (attempts.length - 1);
  }

  private static calculateOverallStats(attempts: UserAttempt[]) {
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const overallAccuracy = attempts.length > 0 ? correctAttempts / attempts.length : 0;
    const averageTimePerAttempt = this.calculateAverageAttemptTime(attempts);
    
    const strugglingSteps = Object.entries(this.analyzeStepBehaviors(attempts))
      .filter(([_, stepData]) => 
        stepData.primaryBehavior === 'struggling' || 
        stepData.primaryBehavior === 'struggling-high')
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
      currentBehavior: 'normal',
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
  static getBehaviorDescription(behavior: BehaviorType): string {
    const descriptions: Record<BehaviorType, string> = {
      'normal': 'Working steadily through the problem',
      'struggling': 'Having difficulty with current step',
      'struggling-high': 'Experiencing significant difficulty',
      'guessing': 'Making rapid, seemingly random attempts',
   
      'persistent': 'Making many attempts but showing determination',
      'learning': 'Showing improvement over time',
      'self-correction': 'Learning from mistakes and improving',
      'excellent': 'Performing exceptionally well',
      'repeating': 'Repeating the same attempts',
      'inactive': 'Showing inactivity or disengagement'
    };
    
    return descriptions[behavior] || 'Unknown behavior pattern';
  }

  static getBehaviorColor(behavior: BehaviorType): string {
    const colors: Record<BehaviorType, string> = {
      'normal': 'text-green-600',
      'struggling': 'text-yellow-600',
      'struggling-high': 'text-red-600',
      'guessing': 'text-orange-600',
      'persistent': 'text-purple-600',
      'learning': 'text-emerald-600',
      'self-correction': 'text-emerald-600',
      'excellent': 'text-green-600',
      'repeating': 'text-amber-600',
      'inactive': 'text-gray-600'
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

  private static detectExcellentPerformance(stepAttempts: UserAttempt[]): number {
    if (stepAttempts.length === 0) return 0;
    
    // Perfect: Correct on first try
    if (stepAttempts.length === 1 && stepAttempts[0].isCorrect) {
      return 1.0;
    }
    
    // Very good: Correct on first or second try with reasonable time
    if (stepAttempts.length <= 2 && stepAttempts[stepAttempts.length - 1].isCorrect) {
      const totalTime = stepAttempts[stepAttempts.length - 1].attemptTime - stepAttempts[0].stepStartTime;
      if (totalTime < 30000) { // Under 30 seconds
        return stepAttempts.length === 1 ? 1.0 : 0.8;
      }
    }
    
    return 0;
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