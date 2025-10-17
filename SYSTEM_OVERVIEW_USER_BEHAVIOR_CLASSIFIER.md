    # UserBehaviorClassifier: Complete System Overview

    ## Overview
    The `UserBehaviorClassifier` is an intelligent system that analyzes student behavior patterns during problem-solving to provide adaptive feedback and hints. It monitors user attempts in real-time and classifies behavior into distinct categories to enable personalized learning support.

    ---

    ## Table of Contents
    1. [Architecture](#architecture)
    2. [Behavior Types](#behavior-types)
    3. [Detection Algorithms](#detection-algorithms)
    4. [Scoring System](#scoring-system)
    5. [Integration Flow](#integration-flow)
    6. [Thresholds & Configuration](#thresholds--configuration)
    7. [Data Structures](#data-structures)
    8. [Usage Examples](#usage-examples)

    ---

    ## Architecture

    ### Component Structure

    ```
    ┌─────────────────────────────────────────────────────────┐
    │            UserBehaviorClassifier (Static)              │
    │                                                         │
    │  ┌───────────────────────────────────────────────────┐ │
    │  │         analyzeUserBehavior()                     │ │
    │  │         (Main Entry Point)                        │ │
    │  └───────────────┬───────────────────────────────────┘ │
    │                  │                                      │
    │                  ▼                                      │
    │  ┌───────────────────────────────────────────────────┐ │
    │  │  Step 1: updateSessionState()                     │ │
    │  │  - Track attempts per step                        │ │
    │  │  - Manage detection flags                         │ │
    │  │  - Reset on success/inactivity                    │ │
    │  └───────────────┬───────────────────────────────────┘ │
    │                  │                                      │
    │                  ▼                                      │
    │  ┌───────────────────────────────────────────────────┐ │
    │  │  Step 2: analyzeStepBehaviors()                   │ │
    │  │  - Group attempts by step                         │ │
    │  │  - Calculate behavior scores                      │ │
    │  │  - Determine primary behavior                     │ │
    │  └───────────────┬───────────────────────────────────┘ │
    │                  │                                      │
    │                  ▼                                      │
    │  ┌───────────────────────────────────────────────────┐ │
    │  │  Step 3: detectEnhancedBehaviorTriggers()        │ │
    │  │  - Check struggling conditions                    │ │
    │  │  - Check guessing patterns                        │ │
    │  │  - Check repeating behavior                       │ │
    │  └───────────────┬───────────────────────────────────┘ │
    │                  │                                      │
    │                  ▼                                      │
    │  ┌───────────────────────────────────────────────────┐ │
    │  │  Step 4: determinePrimaryBehaviorImproved()      │ │
    │  │  - Weight recent behaviors                        │ │
    │  │  - Select dominant pattern                        │ │
    │  └───────────────┬───────────────────────────────────┘ │
    │                  │                                      │
    │                  ▼                                      │
    │  ┌───────────────────────────────────────────────────┐ │
    │  │  Return: UserBehaviorProfile                      │ │
    │  │  - Current behavior type                          │ │
    │  │  - Active triggers                                │ │
    │  │  - Step-by-step analysis                          │ │
    │  │  - Overall statistics                             │ │
    │  └───────────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────────────┘
    ```

    ---

    ## Behavior Types

    ### 1. **Struggling** 🟡
    **Definition**: Student is having significant difficulty with a specific step

    **Indicators**:
    - ≥5 wrong attempts on the same step
    - All attempts occur within 30 seconds
    - Time spent exceeds 30 seconds without progress

    **Example**:
    ```
    Step 1: "simplify"
    Attempts:
    1. "2x + 3" (wrong) - 0:05
    2. "x + 5" (wrong) - 0:10
    3. "3x + 2" (wrong) - 0:15
    4. "2x + 1" (wrong) - 0:20
    5. "x + 3" (wrong) - 0:25
    → Struggling detected at 0:25
    ```

    **Trigger Conditions**:
    ```typescript
    if (wrongAttempts >= 5 && timeSpan <= 30000ms) {
    return 'struggling';
    }
    ```

    ---

    ### 2. **Guessing** 🟠
    **Definition**: Student is making rapid, random attempts without clear strategy

    **Indicators**:
    - ≥3 attempts within 10 seconds
    - High variation between attempts (token distance ≥3)
    - Sequential pattern (1, 2, 3...) or keyboard mashing
    - Obviously random inputs (qwerty, aaaaa, etc.)

    **Example**:
    ```
    Step 2: "evaluate"
    Attempts:
    1. "5" (wrong) - 0:00
    2. "10" (wrong) - 0:03
    3. "15" (wrong) - 0:06
    Token distances: [5→10]=5, [10→15]=5
    Average distance = 5 (≥3)
    → Guessing detected
    ```

    **Trigger Conditions**:
    ```typescript
    if (attempts >= 3 &&
        timeSpan <= 10000ms &&
        avgTokenDistance >= 3) {
    return 'guessing';
    }
    ```

    **Token Distance Calculation**:
    Uses Levenshtein distance on tokenized arrays:
    - `["2x", "+", "3"]` vs `["x", "+", "5"]` = distance of 2
    - `["5"]` vs `["x^2", "+", "3x"]` = distance of 3

    ---

    ### 3. **Self-Correction** 🟢
    **Definition**: Student makes mistakes but learns and corrects them

    **Indicators**:
    - Initial wrong attempts followed by correct answer
    - Time gaps (5+ seconds) indicating reflection
    - Progressive improvement in attempts

    **Example**:
    ```
    Step 3: "final"
    Attempts:
    1. "x^2 + 2x" (wrong) - 0:00
    2. "x^2 + 3" (wrong) - 0:05
    3. [6 second pause - thinking]
    4. "x^2 + 3x - 5" (correct) - 0:11
    → Self-correction detected
    ```

    **Scoring**:
    ```typescript
    baseScore = min(0.8, wrongCount × 0.3)
    reflectionBonus = min(0.3, reflectionGaps × 0.15)
    selfCorrectionScore = min(1.0, baseScore + reflectionBonus)
    ```

    ---

    ### 4. **Repeating** 🟤
    **Definition**: Student repeatedly submits identical or nearly identical answers

    **Indicators**:
    - Identical input submitted ≥2 times consecutively
    - No variation in token array
    - Same mistake repeated without modification

    **Example**:
    ```
    Step 1: "choose"
    Attempts:
    1. "x + 5" (wrong) - 0:00
    2. "x + 5" (wrong) - 0:03  ← Same as #1
    3. "x + 5" (wrong) - 0:06  ← Same as #1
    → Repeating detected
    ```

    **Detection**:
    ```typescript
    if (JSON.stringify(tokens[i]) === JSON.stringify(tokens[i-1]) &&
        consecutiveCount >= 2) {
    return 'repeating';
    }
    ```

    ---

    ## Detection Algorithms

    ### Struggling Detection

    ```typescript
    detectEnhancedStruggling(stepAttempts: UserAttempt[]): boolean {
    // Step 1: Check minimum attempt count
    if (stepAttempts.length < 5) return false;

    // Step 2: Filter wrong attempts
    const wrongAttempts = stepAttempts.filter(a => !a.isCorrect);
    if (wrongAttempts.length < 5) return false;

    // Step 3: Check time window
    const recent5 = wrongAttempts.slice(-5);
    const timeSpan = recent5[4].attemptTime - recent5[0].attemptTime;

    // Step 4: Evaluate
    return timeSpan <= 30000; // 30 seconds
    }
    ```

    **Visual Flow**:
    ```
    Wrong Attempts: [❌, ❌, ❌, ❌, ❌]
    Time:           [0s, 5s, 10s, 20s, 25s]
    Time Span:      25s - 0s = 25s ≤ 30s ✓
    Result:         STRUGGLING DETECTED
    ```

    ---

    ### Guessing Detection

    ```typescript
    detectEnhancedGuessing(stepAttempts: UserAttempt[]): boolean {
    // Step 1: Check minimum attempts
    if (stepAttempts.length < 3) return false;

    // Step 2: Filter recent attempts (within 10s)
    const now = Date.now();
    const recentAttempts = stepAttempts.filter(
        a => (now - a.attemptTime) <= 10000
    );

    if (recentAttempts.length < 3) return false;

    // Step 3: Calculate token distance
    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 1; i < recentAttempts.length; i++) {
        const distance = calculateTokenLevenshteinDistance(
        recentAttempts[i-1].tokens,
        recentAttempts[i].tokens
        );
        totalDistance += distance;
        comparisons++;
    }

    const avgDistance = totalDistance / comparisons;

    // Step 4: Evaluate
    return avgDistance >= 3;
    }
    ```

    **Token Distance Example**:
    ```
    Attempt 1: ["x^2", "+", "3x"]     (tokens)
    Attempt 2: ["5"]                  (tokens)
    Distance:  3 operations (delete x^2, delete +, replace 3x with 5)

    Attempt 2: ["5"]                  (tokens)
    Attempt 3: ["10"]                 (tokens)
    Distance:  1 operation (replace 5 with 10)

    Average Distance: (3 + 1) / 2 = 2 < 3 ✗ (not guessing)

    But if:
    Attempt 1: ["x", "+", "2"]
    Attempt 2: ["a", "b", "c"]
    Distance:  3 (replace all)
    Attempt 2: ["a", "b", "c"]
    Attempt 3: ["1", "2", "3"]
    Distance:  3 (replace all)
    Average: (3 + 3) / 2 = 3 ≥ 3 ✓ (guessing detected)
    ```

    ---

    ### Repeating Detection

    ```typescript
    detectEnhancedRepeating(stepAttempts: UserAttempt[]): boolean {
    // Step 1: Check minimum attempts
    if (stepAttempts.length < 2) return false;

    // Step 2: Check consecutive identical tokens
    for (let i = 1; i < stepAttempts.length; i++) {
        const prevTokens = JSON.stringify(stepAttempts[i-1].tokens);
        const currTokens = JSON.stringify(stepAttempts[i].tokens);

        if (prevTokens === currTokens && prevTokens !== '[]') {
        let consecutiveCount = 2; // Current + previous

        // Step 3: Count consecutive repeats
        for (let j = i+1; j < stepAttempts.length; j++) {
            const nextTokens = JSON.stringify(stepAttempts[j].tokens);
            if (nextTokens === currTokens) {
            consecutiveCount++;
            } else {
            break;
            }
        }

        // Step 4: Evaluate
        if (consecutiveCount >= 2) return true;
        }
    }

    return false;
    }
    ```

    ---

    ## Scoring System

    ### Multi-Dimensional Scoring

    Each behavior type gets a score from 0.0 to 1.0 based on evidence strength.

    ```typescript
    interface BehaviorScores {
    'struggling': number;   // 0.0 - 1.0
    'guessing': number;     // 0.0 - 1.0
    'self-correction': number; // 0.0 - 1.0
    'repeating': number;    // 0.0 - 1.0
    }
    ```

    ### Scoring Logic

    #### 1. Struggling Score
    ```typescript
    struggleScore = 0;

    // Base score from wrong attempts
    if (wrongAttempts >= 5) {
    struggleScore = 0.7 + (wrongAttempts - 5) × 0.1;
    struggleScore = min(1.0, struggleScore);
    }

    // Time-based component
    if (totalTime > 30000 && isStuck) {
    timeScore = min(0.8, totalTime / 60000);
    struggleScore = max(struggleScore, timeScore);
    }
    ```

    **Example**:
    - 7 wrong attempts: 0.7 + (7-5)×0.1 = 0.9
    - 10 wrong attempts: 0.7 + (10-5)×0.1 = 1.0 (capped)

    #### 2. Guessing Score
    ```typescript
    guessingScore = 0;

    // Rapid attempts (previously "rushing")
    quickAttempts = attempts.filter(timeDiff < 3000);
    rushingRatio = quickAttempts / (totalAttempts - 1);
    if (rushingRatio >= 0.6) {
    guessingScore += 0.5;
    }

    // Random patterns
    if (rapidAttempts >= 3) guessingScore += 0.4;
    if (randomInputs >= 2) guessingScore += 0.4;
    if (sequentialPattern) guessingScore += 0.5;

    guessingScore = min(1.0, guessingScore);
    ```

    #### 3. Self-Correction Score
    ```typescript
    selfCorrectionScore = 0;

    if (hasWrongAttempts && lastAttemptCorrect) {
    baseScore = min(0.8, wrongCount × 0.3);

    // Bonus for reflection time
    reflectionGaps = count(timeDiff > 5000);
    reflectionBonus = min(0.3, reflectionGaps × 0.15);

    selfCorrectionScore = min(1.0, baseScore + reflectionBonus);
    }
    ```

    #### 4. Repeating Score
    ```typescript
    repeatingScore = 0;

    // Count total repeats
    repeatRatio = totalRepeats / totalAttempts;

    // Bonus for consecutive repeats
    consecutiveBonus = consecutiveRepeats > 0 ? 0.4 : 0;

    repeatingScore = min(1.0, repeatRatio × 0.8 + consecutiveBonus);
    ```

    ---

    ### Score Conflict Resolution

    When multiple behaviors are detected, conflicts are resolved:

    ```typescript
    resolveScoreConflicts(scores) {
    // Rule 1: Guessing takes priority over struggling
    if (scores.guessing > scores.struggling) {
        scores.struggling *= 0.5;
    }

    // Rule 2: Self-correction reduces other behaviors
    if (scores.selfCorrection > 0.5) {
        scores.struggling *= 0.3;
        scores.guessing *= 0.2;
    }

    // Rule 3: Repeating reduces self-correction
    if (scores.repeating > 0.5) {
        scores.selfCorrection *= 0.3;
    }
    }
    ```

    **Example Scenario**:
    ```
    Before Conflict Resolution:
    - struggling: 0.8
    - guessing: 0.9
    - selfCorrection: 0.2
    - repeating: 0.1

    After Resolution:
    - struggling: 0.4 (reduced by guessing rule)
    - guessing: 0.9 (unchanged)
    - selfCorrection: 0.2 (unchanged)
    - repeating: 0.1 (unchanged)

    Primary Behavior: guessing (highest score)
    ```

    ---

    ### Primary Behavior Selection

    ```typescript
    selectPrimaryBehaviorFromScores(scores): BehaviorType | null {
    // Sort behaviors by score (highest first)
    const sorted = Object.entries(scores)
        .sort((a, b) => b[1] - a[1]);

    const [topBehavior, topScore] = sorted[0];

    // Only return if score is significant
    return topScore > 0.5 ? topBehavior : null;
    }
    ```

    **Threshold**: Behavior must score > 0.5 to be considered primary

    ---

    ## Integration Flow

    ### Usage in UserInput Component

    ```
    User Makes Attempt
            ↓
    ┌────────────────────────┐
    │  recordUserAttempt()   │
    │  - Capture input       │
    │  - Tokenize            │
    │  - Timestamp           │
    │  - Store in array      │
    └───────────┬────────────┘
                │
                ▼
    ┌────────────────────────────────────┐
    │  analyzeBehaviorAndUpdateHints()   │
    │  (Triggered after each attempt)    │
    └───────────┬────────────────────────┘
                │
                ▼
    ┌────────────────────────────────────────────────┐
    │  UserBehaviorClassifier.analyzeUserBehavior()  │
    │  Input: UserAttempt[]                          │
    │  Output: UserBehaviorProfile                   │
    └───────────┬────────────────────────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │  setBehaviorProfile()        │
    │  - Update component state    │
    │  - Store behavior type       │
    └───────────┬──────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │  Conditional Hint System     │
    │  - Check attemptsSinceLastHint│
    │  - Show hint every 3 attempts │
    │  - Use behavior-specific hints│
    └──────────────────────────────┘
    ```

    ### Hint Generation Integration

    ```typescript
    // In showHintMessage()
    const behaviorProfile = BehaviorAnalyzer.analyzeBehavior(
    userInput,
    correctAnswer,
    attemptHistory,
    lineValidationStates
    );

    const behaviorType = behaviorProfile?.type || 'default';

    // Pass to HintGeneratorService
    const hint = hintService.generateHint({
    behaviorType,      // 'struggling', 'guessing', etc.
    wrongPart,         // Specific wrong token
    stepLabel,         // Current step
    userInput,         // What user typed
    correctAnswer      // Expected answer
    });
    ```

    ---

    ## Thresholds & Configuration

    ### Configurable Constants

    ```typescript
    public static readonly THRESHOLDS = {
    // Struggling Detection
    STRUGGLING_WRONG_ATTEMPTS: 5,        // Minimum wrong attempts
    STRUGGLING_TIME_WINDOW: 30000,       // 30 seconds
    STRUGGLING_RESET_INACTIVITY: 30000,  // Reset after 30s idle

    // Guessing Detection
    GUESSING_ATTEMPTS_COUNT: 3,          // Minimum attempts
    GUESSING_TIME_WINDOW: 10000,         // 10 seconds
    GUESSING_TOKEN_DISTANCE_THRESHOLD: 3, // Min avg distance

    // Repeating Detection
    REPEATING_CONSECUTIVE_THRESHOLD: 2,  // Consecutive repeats

    // Legacy
    RAPID_SUBMISSION_TIME: 3500,         // Fast typing threshold
    MIN_INPUT_LENGTH_RATIO: 0.3,         // Input vs expected ratio
    HINT_INTERVAL_ATTEMPTS: 3,           // Attempts between hints
    RUSHING_TIME: 3000,                  // Rushing threshold
    RUSHING_CONSISTENCY_THRESHOLD: 0.6,  // 60% rushing rate
    GUESSING_TIME_THRESHOLD: 2000,       // 2 seconds
    HIGH_ERROR_RATE_THRESHOLD: 0.7       // 70% error rate
    };
    ```

    ### Tuning Guidelines

    | Threshold | Effect of Increasing | Effect of Decreasing |
    |-----------|---------------------|---------------------|
    | `STRUGGLING_WRONG_ATTEMPTS` | Fewer false positives | Earlier detection |
    | `STRUGGLING_TIME_WINDOW` | Longer observation period | Faster detection |
    | `GUESSING_ATTEMPTS_COUNT` | More data for analysis | Earlier detection |
    | `GUESSING_TOKEN_DISTANCE` | Only very random attempts | More sensitive |
    | `REPEATING_CONSECUTIVE_THRESHOLD` | Only persistent repeating | Catch occasional repeats |

    ---

    ## Data Structures

    ### UserAttempt
    ```typescript
    type UserAttempt = {
    attempt_id: number;              // Unique ID
    stepIndex: number;               // Which step (0-based)
    stepLabel: string;               // e.g., "choose", "evaluate"
    userInput: string;               // Raw user input
    sanitizedInput: string;          // Cleaned input
    tokens: string[];                // Tokenized: ["x^2", "+", "3x"]
    isCorrect: boolean;              // Validation result
    expectedAnswer: string;          // Expected answer
    sanitizedExpectedAnswer: string; // Cleaned expected
    expectedTokens: string[];        // Tokenized expected
    cumulativeProgress: number;      // Overall progress %
    stepStartTime: number;           // When step started (ms)
    attemptTime: number;             // When attempt made (ms)
    timeSpentOnStep?: number;        // Duration if completed
    };
    ```

    ### BehaviorTrigger
    ```typescript
    interface BehaviorTrigger {
    type: BehaviorType;              // Which behavior detected
    severity: 'low' | 'medium' | 'high'; // How severe
    description: string;             // Human-readable description
    triggeredAt: number;             // Timestamp (ms)
    evidence: string[];              // Supporting data
    stepIndex?: number;              // Which step
    attemptIds: number[];            // Affected attempt IDs
    }
    ```

    **Example**:
    ```typescript
    {
    type: 'struggling',
    severity: 'high',
    description: '≥5 wrong attempts within 30s on step 2',
    triggeredAt: 1729012345678,
    evidence: [
        '7 wrong attempts',
        '25000ms total time'
    ],
    stepIndex: 1,
    attemptIds: [15, 16, 17, 18, 19, 20, 21]
    }
    ```

    ### StepBehaviorAnalysis
    ```typescript
    interface StepBehaviorAnalysis {
    stepLabel: string;               // "choose", "evaluate", etc.
    primaryBehavior: BehaviorType | null; // Dominant behavior
    behaviorFlags: BehaviorType[];   // All detected behaviors
    wrongAttempts: number;           // Count of wrong attempts
    totalTime: number;               // Time spent (ms)
    averageAttemptTime: number;      // Avg time between attempts
    isStuck: boolean;                // Currently stuck?
    behaviorScores: Record<BehaviorType, number>; // All scores
    }
    ```

    ### UserBehaviorProfile
    ```typescript
    interface UserBehaviorProfile {
    currentBehavior: BehaviorType | null;    // Current primary
    activeTriggers: BehaviorTrigger[];       // Current triggers
    behaviorHistory: BehaviorTrigger[];      // Historical triggers
    stepBehaviors: Record<number, StepBehaviorAnalysis>; // Per-step
    overallAccuracy: number;                 // Success rate
    averageTimePerAttempt: number;           // Avg attempt time
    totalAttempts: number;                   // Total attempts
    strugglingSteps: number[];               // Which steps
    guessingPatterns: number;                // Random input count
    }
    ```

    ---

    ## Usage Examples

    ### Example 1: Detecting Struggling

    ```typescript
    // Student attempts
    const attempts: UserAttempt[] = [
    { stepIndex: 0, userInput: "x+2", isCorrect: false, attemptTime: 1000, ... },
    { stepIndex: 0, userInput: "x+3", isCorrect: false, attemptTime: 6000, ... },
    { stepIndex: 0, userInput: "2x+1", isCorrect: false, attemptTime: 12000, ... },
    { stepIndex: 0, userInput: "x+4", isCorrect: false, attemptTime: 18000, ... },
    { stepIndex: 0, userInput: "3x+2", isCorrect: false, attemptTime: 24000, ... },
    ];

    const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);

    console.log(profile.currentBehavior); // 'struggling'
    console.log(profile.activeTriggers[0].description);
    // '≥5 wrong attempts within 30s on step 1'
    ```

    ### Example 2: Detecting Guessing

    ```typescript
    const attempts: UserAttempt[] = [
    {
        stepIndex: 1,
        userInput: "5",
        tokens: ["5"],
        isCorrect: false,
        attemptTime: 1000,
        ...
    },
    {
        stepIndex: 1,
        userInput: "10",
        tokens: ["10"],
        isCorrect: false,
        attemptTime: 4000,
        ...
    },
    {
        stepIndex: 1,
        userInput: "abc",
        tokens: ["a", "b", "c"],
        isCorrect: false,
        attemptTime: 7000,
        ...
    },
    ];

    const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);

    console.log(profile.currentBehavior); // 'guessing'
    console.log(profile.guessingPatterns); // 1 (random input detected)
    ```

    ### Example 3: Detecting Self-Correction

    ```typescript
    const attempts: UserAttempt[] = [
    { stepIndex: 2, userInput: "x^2+2x", isCorrect: false, attemptTime: 1000, ... },
    { stepIndex: 2, userInput: "x^2+3", isCorrect: false, attemptTime: 5000, ... },
    // 6-second pause (user thinking)
    { stepIndex: 2, userInput: "x^2+3x-5", isCorrect: true, attemptTime: 11000, ... },
    ];

    const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);

    console.log(profile.currentBehavior); // 'self-correction'
    console.log(profile.stepBehaviors[2].behaviorScores['self-correction']); // ~0.7
    ```

    ### Example 4: Multi-Step Analysis

    ```typescript
    const attempts: UserAttempt[] = [
    // Step 0: Success after few tries
    { stepIndex: 0, isCorrect: false, attemptTime: 1000, ... },
    { stepIndex: 0, isCorrect: true, attemptTime: 8000, ... },

    // Step 1: Struggling
    { stepIndex: 1, isCorrect: false, attemptTime: 10000, ... },
    { stepIndex: 1, isCorrect: false, attemptTime: 15000, ... },
    { stepIndex: 1, isCorrect: false, attemptTime: 20000, ... },
    { stepIndex: 1, isCorrect: false, attemptTime: 25000, ... },
    { stepIndex: 1, isCorrect: false, attemptTime: 30000, ... },

    // Step 2: Guessing
    { stepIndex: 2, tokens: ["1"], isCorrect: false, attemptTime: 35000, ... },
    { stepIndex: 2, tokens: ["2"], isCorrect: false, attemptTime: 38000, ... },
    { stepIndex: 2, tokens: ["3"], isCorrect: false, attemptTime: 41000, ... },
    ];

    const profile = UserBehaviorClassifier.analyzeUserBehavior(attempts);

    console.log(profile.stepBehaviors);
    // {
    //   0: { primaryBehavior: 'self-correction', wrongAttempts: 1, ... },
    //   1: { primaryBehavior: 'struggling', wrongAttempts: 5, ... },
    //   2: { primaryBehavior: 'guessing', wrongAttempts: 3, ... }
    // }

    console.log(profile.currentBehavior); // 'guessing' (most recent)
    console.log(profile.strugglingSteps); // [1]
    ```

    ---

    ## State Management

    ### Session State Tracking

    ```typescript
    private static sessionState = {
    stepStates: {
        // Per-step tracking
        0: {
        attempts: [...],
        strugglingDetected: false,
        guessingDetected: false,
        repeatingDetected: false,
        lastResetTime: 1729012345678
        },
        1: { ... },
        2: { ... }
    },
    sessionStartTime: 1729012340000,
    totalStrugglingSteps: 1,
    escalationTriggered: false
    };
    ```

    ### State Reset Conditions

    ```typescript
    // Reset detection states when:
    1. User answers correctly (isCorrect === true)
    2. Inactivity timeout (30 seconds since last attempt)
    3. New question loaded

    if (lastAttempt.isCorrect ||
        timeSinceLastAttempt > 30000) {
    stepState.strugglingDetected = false;
    stepState.guessingDetected = false;
    stepState.repeatingDetected = false;
    stepState.lastResetTime = now;
    }
    ```

    ---

    ## Summary Flow

    ```
    ┌─────────────────────────────────────────────────────────┐
    │               COMPLETE BEHAVIOR ANALYSIS                │
    └─────────────────────────────────────────────────────────┘

    User Makes Attempt
            ↓
    ┌───────────────────┐
    │ Record Attempt    │
    │ - Input           │
    │ - Tokens          │
    │ - Timestamp       │
    │ - Correctness     │
    └────────┬──────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Update Session State             │
    │ - Add to step attempts           │
    │ - Check reset conditions         │
    └────────┬─────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Analyze Step Behaviors           │
    │ FOR each step:                   │
    │   - Calculate behavior scores    │
    │   - Resolve conflicts            │
    │   - Select primary behavior      │
    └────────┬─────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Detect Behavior Triggers         │
    │ Check conditions:                │
    │   ✓ Struggling (≥5 wrong/30s)   │
    │   ✓ Guessing (≥3 rapid/distance)│
    │   ✓ Repeating (≥2 consecutive)  │
    └────────┬─────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Determine Primary Behavior       │
    │ - Weight recent steps (2x)       │
    │ - Count behavior occurrences     │
    │ - Select most common             │
    └────────┬─────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Return UserBehaviorProfile       │
    │ {                                │
    │   currentBehavior: 'struggling', │
    │   activeTriggers: [...],         │
    │   stepBehaviors: {...},          │
    │   overallAccuracy: 0.45,         │
    │   averageTimePerAttempt: 5000,   │
    │   totalAttempts: 12,             │
    │   strugglingSteps: [1, 2],       │
    │   guessingPatterns: 2            │
    │ }                                │
    └──────────────────────────────────┘
    ```

    ---

    ## Key Takeaways

    ### For Developers

    1. **Behavior Detection is Multi-Criteria**
    - Uses time windows, attempt counts, token analysis
    - Multiple signals combined for accuracy
    - Conflict resolution prevents overlapping classifications

    2. **Scoring System Provides Confidence**
    - Scores range 0.0-1.0
    - Threshold > 0.5 for primary behavior
    - Multiple behaviors can be active simultaneously

    3. **Session State Management**
    - Persistent tracking across attempts
    - Automatic reset on success or inactivity
    - Prevents stale behavior detection

    4. **Token-Based Analysis**
    - Levenshtein distance for variation measurement
    - Detects random vs. thoughtful changes
    - Identifies repeating patterns

    5. **Integration Points**
    - Called after each user attempt
    - Feeds into hint generation system
    - Influences feedback strategy

    ### For System Behavior

    1. **Adaptive Hints**
    - Struggling → Encouraging, step-by-step hints
    - Guessing → Slow down, think carefully hints
    - Repeating → Try different approach hints
    - Self-correction → Positive reinforcement

    2. **Progressive Support**
    - Light hints initially
    - Escalate based on behavior severity
    - Modal feedback after persistent struggles

    3. **Data-Driven Decisions**
    - Quantitative thresholds, not subjective
    - Tunable parameters for different contexts
    - Evidence-based trigger activation

    ---

    ## Related Documentation

    - `UserInput.tsx` - Integration with input component
    - `BehaviorAnalyzer.tsx` - Real-time analysis wrapper
    - `HintGeneratorService.ts` - Behavior-based hint generation
    - `IMPLEMENTATION_AI_BEHAVIOR_TEMPLATES.md` - Template system
    - `PROCESS_FLOW_USER_INPUT_AND_VALIDATOR.md` - Complete input flow

    ---

    ## Revision History

    | Date | Version | Changes |
    |------|---------|---------|
    | 2025-10-15 | 1.0 | Initial comprehensive documentation |
