export interface BehaviorAnalysis {
  type: 'sign-error' | 'magnitude-error' | 'repetition' | 'guessing' | 'close-attempt' | 'random' | 'default';
  userInput: string;
  correctAnswer: string;
  attemptHistory?: string[];
}

export class BehaviorAnalyzer {
  
  // Detect if user has wrong sign but correct magnitude
  static detectSignError(userInput: string, correctAnswer: string): boolean {
    const userNum = parseFloat(userInput);
    const correctNum = parseFloat(correctAnswer);
    
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    
    return Math.abs(userNum) === Math.abs(correctNum) && userNum !== correctNum;
  }
  
  // Detect if user's answer is close in magnitude
  static detectCloseAttempt(userInput: string, correctAnswer: string): boolean {
    const userNum = parseFloat(userInput);
    const correctNum = parseFloat(correctAnswer);
    
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    if (correctNum === 0) return false;
    
    const percentDiff = Math.abs((userNum - correctNum) / correctNum) * 100;
    return percentDiff <= 20; // Within 20% of correct answer
  }
  
  // Detect if user is repeating same wrong answer
  static detectRepetition(userInput: string, attemptHistory: string[]): boolean {
    if (attemptHistory.length < 2) return false;
    
    const occurrences = attemptHistory.filter(attempt => attempt === userInput).length;
    return occurrences >= 2;
  }
  
  // Detect if user is making wildly different guesses
  static detectGuessing(attemptHistory: string[], correctAnswer: string): boolean {
    if (attemptHistory.length < 3) return false;
    
    const correctNum = parseFloat(correctAnswer);
    if (isNaN(correctNum)) return false;
    
    const attempts = attemptHistory.map(a => parseFloat(a)).filter(n => !isNaN(n));
    if (attempts.length < 3) return false;
    
    // Check if attempts are widely scattered (high variance relative to correct answer)
    const diffs = attempts.map(a => Math.abs(a - correctNum));
    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    const variance = diffs.reduce((sum, d) => sum + Math.pow(d - avgDiff, 2), 0) / diffs.length;
    
    // High variance indicates random guessing
    return variance > Math.pow(Math.abs(correctNum) * 0.5, 2);
  }
  
  // Detect if answer is off by order of magnitude
  static detectMagnitudeError(userInput: string, correctAnswer: string): boolean {
    const userNum = parseFloat(userInput);
    const correctNum = parseFloat(correctAnswer);
    
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    if (correctNum === 0) return false;
    
    const ratio = Math.abs(userNum / correctNum);
    // Off by 10x, 100x, etc.
    return (ratio >= 10 && ratio < 100) || (ratio <= 0.1 && ratio > 0.01);
  }
  
  // Main analysis function
  static analyze(userInput: string, correctAnswer: string, attemptHistory: string[]): BehaviorAnalysis {
    let type: BehaviorAnalysis['type'] = 'default';
    
    // Priority order matters - check most specific patterns first
    if (this.detectSignError(userInput, correctAnswer)) {
      type = 'sign-error';
    } else if (this.detectRepetition(userInput, attemptHistory)) {
      type = 'repetition';
    } else if (this.detectCloseAttempt(userInput, correctAnswer)) {
      type = 'close-attempt';
    } else if (this.detectMagnitudeError(userInput, correctAnswer)) {
      type = 'magnitude-error';
    } else if (this.detectGuessing(attemptHistory, correctAnswer)) {
      type = 'guessing';
    } else if (attemptHistory.length >= 2) {
      type = 'random';
    }
    
    return {
      type,
      userInput,
      correctAnswer,
      attemptHistory
    };
  }
}