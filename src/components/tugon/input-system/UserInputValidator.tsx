import type { PredefinedAnswer, Step } from "@/components/data/answers";
import { simplify, equal, evaluate, parse } from "mathjs";

export type ValidationResult = {
  isValid: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  nonEmpty: boolean;
  expectedAnswer?: string | string[] | Step[];
};

export type TwoPhaseValidationResult = {
  mathematicallyCorrect: boolean;
  positionallyValid: boolean;
  finalAnswerDetected: boolean;
  isCurrentStepCorrect: boolean;
};

export type FinalAnswerDetectionResult = {
  isFinalAnswer: boolean;
  guidanceMessage?: string;
  nextMissingStep?: Step;
  nextMissingStepIndex?: number;
  nudgeCount?: number;
};
export type CompletionStatus = {
  totalSteps: number;
  completedSteps: number;
  correctSteps: number;
  isComplete: boolean;
  allCorrect: boolean;
  percentage: number;
  finalAnswerDetected: boolean;
  finalAnswerPosition: number;
  stepCorrectness: boolean[];
  consolationProgress: number;    // Progress from attempted but wrong steps
  baseProgress: number;           // Progress from correct steps only
};

export interface InputValidatorProps {
  userInput: string[];
  expectedAnswer?: string | string[] | Step[];
  predefinedAnswers?: PredefinedAnswer[];
  stepIndex: number;
}

export class InputValidator {
  public static sanitizeText = (v: string): string => {
    return (v ?? "").replace(/[\s\n\r]+/g, "").toLowerCase();
  };
  
  public static sanitizeArray = (lines: string[]): string[] => {
    return lines.map(line => InputValidator.sanitizeText(line)).filter(line => line.length > 0);
  };
  
  public static arrayToString = (lines: string[]): string => {
    return lines.join('\n');
  };
   
  public static stringToArray = (answer: string): string[] => {
    return answer.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  };

  public static stepsToStringArray = (steps: Step[]): string[] => {
    return steps.map(step => step.answer);
  };

  public static isStepArray = (arr: any[]): arr is Step[] => {
    return arr.length > 0 && 
           typeof arr[0] === 'object' && 
           arr[0] !== null && 
           'label' in arr[0] && 
           'answer' in arr[0];
  };
 // REPLACE the existing validateStepWithTwoPhase (lines 68-127) with this updated version:
public static validateStepWithTwoPhase = (
  userInput: string,
  expectedAnswer: string,
  stepLabel: string,
  currentStepIndex: number,
  allExpectedSteps: Step[]
): TwoPhaseValidationResult => {
  
  // Phase 1: Mathematical equivalence check with final answer detection
  const mathematicallyCorrect = InputValidator.validateStepByType(
    userInput.trim(), 
    expectedAnswer.trim(),
    stepLabel,
    allExpectedSteps,
    currentStepIndex
  );
  
  // Initialize result
  let positionallyValid = mathematicallyCorrect;
  let finalAnswerDetected = false;
  let isCurrentStepCorrect = mathematicallyCorrect;
  
  // Check if user input matches the final answer (last step) mathematically
  if (allExpectedSteps.length > 0) {
    const finalStep = allExpectedSteps[allExpectedSteps.length - 1];
    const finalStepIndex = allExpectedSteps.length - 1;
    
    // Check if user input is mathematically equivalent to final answer
    const isFinalAnswerMathematically = InputValidator.isMathematicallyEquivalentRobust(
      userInput.trim(),
      finalStep.answer.trim()
    );
    
    if (isFinalAnswerMathematically) {
      finalAnswerDetected = true;
      
      // If user is in the final step, this is correct
      if (currentStepIndex === finalStepIndex) {
        isCurrentStepCorrect = true;
        positionallyValid = true;
      } else {
        // Final answer in non-final position - the validateStepByType already handled this
        // So if mathematicallyCorrect is false, it was rejected by final answer detection
        isCurrentStepCorrect = mathematicallyCorrect;
        positionallyValid = mathematicallyCorrect;
      }
    } else if (mathematicallyCorrect) {
      // Not final answer but correct for current step
      isCurrentStepCorrect = true;
      positionallyValid = true;
    } else {
      // Not correct at all
      isCurrentStepCorrect = false;
      positionallyValid = false;
    }
  }
  
  return { 
    mathematicallyCorrect, 
    positionallyValid, 
    finalAnswerDetected,
    isCurrentStepCorrect
  };
};
public static validateStepByType = (
  userInput: string,
  expectedAnswer: string,
  stepLabel: string,
  allExpectedSteps?: Step[],
  currentStepIndex?: number
): boolean => {
  const cleanUser = userInput.trim();
  const cleanExpected = expectedAnswer.trim();
  
  // For text labels, use text comparison
  if (stepLabel === "text") {
    const normalizedUser = cleanUser.toLowerCase();
    const normalizedExpected = cleanExpected.toLowerCase();
    
    if (normalizedUser === normalizedExpected) return true;
    
    // Check for common text variations
    const textVariations: { [key: string]: string[] } = {
      'yes': ['yes', 'y', 'true', 'correct', 'passes'],
      'no': ['no', 'n', 'false', 'incorrect', 'fails', 'does not pass'],
      'function': ['function', 'is a function', 'is function'],
      'not a function': ['not a function', 'not function', 'is not a function'],
    };
    
    for (const [, variations] of Object.entries(textVariations)) {
      if (variations.includes(normalizedExpected) && variations.includes(normalizedUser)) {
        return true;
      }
    }
    
    return false;
  }
  
  // For all mathematical steps (substitution, simplification, final, math), use mathematical equivalence
  const isMathematicallyCorrect = InputValidator.isMathematicallyEquivalentRobust(cleanUser, cleanExpected);
  
  // Final Answer Detection System - Check if user is trying to jump to final answer
  if (isMathematicallyCorrect && allExpectedSteps && currentStepIndex !== undefined) {
    const finalStepIndex = allExpectedSteps.length - 1;
    
    // Only perform final answer detection if we're NOT in the final step
    if (currentStepIndex < finalStepIndex) {
      const finalStep = allExpectedSteps[finalStepIndex];
      
      // String-to-string comparison with the final answer
      const userNormalized = cleanUser.toLowerCase().replace(/\s+/g, '');
      const finalAnswerNormalized = finalStep.answer.toLowerCase().replace(/\s+/g, '');
      
      // Detect if user input matches final answer exactly (string comparison)
      if (userNormalized === finalAnswerNormalized) {
        console.log(`🚨 FINAL ANSWER DETECTION - String Match:`);
        console.log(`   User input: "${cleanUser}" (normalized: "${userNormalized}")`);
        console.log(`   Final answer: "${finalStep.answer}" (normalized: "${finalAnswerNormalized}")`);
        console.log(`   Current step: ${currentStepIndex + 1}/${allExpectedSteps.length} (${stepLabel})`);
        console.log(`   Action: Rejecting early final answer`);
        
        // Return false to indicate this is not valid for the current step
        return false;
      }
      
      // Also check mathematical equivalence to final answer
      const matchesFinalAnswerMathematically = InputValidator.isMathematicallyEquivalentRobust(
        cleanUser, 
        finalStep.answer
      );
      
      if (matchesFinalAnswerMathematically && !isMathematicallyCorrect) {
        console.log(`🚨 FINAL ANSWER DETECTION - Mathematical Match:`);
        console.log(`   User input: "${cleanUser}"`);
        console.log(`   Final answer: "${finalStep.answer}"`);
        console.log(`   Current step: ${currentStepIndex + 1}/${allExpectedSteps.length} (${stepLabel})`);
        console.log(`   Action: Rejecting early final answer (math equivalent but not current step)`);
        
        return false;
      }
    }
  }
  
  return isMathematicallyCorrect;
};

public static isAnswerComplete = (
  currentLines: string[], 
  expectedSteps: Step[]
): boolean => {
  if (!expectedSteps || expectedSteps.length === 0) return false;
  
  const nonEmptyLines = currentLines.filter(line => line.trim().length > 0);
  
  if (nonEmptyLines.length < expectedSteps.length) return false;
  
  // Check each step with two-phase validation
  for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
    const userLine = nonEmptyLines[i];
    const expectedStep = expectedSteps[i];
    
    const validation = InputValidator.validateStepWithTwoPhase(
      userLine,
      expectedStep.answer,
      expectedStep.label,
      i,
      expectedSteps
    );
    
    if (!validation.isCurrentStepCorrect) {
      return false;
    }
  }
  
  return true;
};


public static getCompletionStatus = (
  currentLines: string[],
  expectedSteps: Step[],
  lineValidationStates: Map<number, TwoPhaseValidationResult | null>,
  validationTriggers: Map<number, 'enter' | null>
): CompletionStatus => {
  if (!expectedSteps || expectedSteps.length === 0) {
    return {
      totalSteps: 1,
      completedSteps: currentLines.filter(line => line.trim().length > 0).length,
      correctSteps: 0,
      isComplete: false,
      allCorrect: false,
      percentage: 0,
      finalAnswerDetected: false,
      finalAnswerPosition: -1,
      stepCorrectness: [],
      consolationProgress: 0,  // ADD this missing property
      baseProgress: 0          // ADD this missing property
    };
  }

  const nonEmptyLines = currentLines.filter(line => line.trim().length > 0);
  const totalSteps = expectedSteps.length;
  let correctSteps = 0;
  const stepCorrectness: boolean[] = [];
  
  // Track final answer detection
  let finalAnswerDetected = false;
  let finalAnswerPosition = -1;
  const finalStepIndex = totalSteps - 1;

  // Use validated states instead of real-time validation
  for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
    // Only count as correct if it has been validated (Enter pressed)
    const validatedResult = lineValidationStates.get(i);
    const isValidated = validationTriggers.get(i) === 'enter';
    
    if (validatedResult && isValidated && validatedResult.isCurrentStepCorrect) {
      stepCorrectness[i] = true;
      correctSteps++;
      
      // Check for final answer detection from validated results
      if (validatedResult.finalAnswerDetected && i > 0) {
        finalAnswerDetected = true;
        finalAnswerPosition = i;
      }
    } else {
      stepCorrectness[i] = false;
    }
  }

  const isComplete = nonEmptyLines.length >= totalSteps;
  const allCorrect = correctSteps === totalSteps && isComplete;
  
  // Percentage calculation based on VALIDATED steps only
const calculatePercentage = (): { total: number; base: number; consolation: number } => {
  if (totalSteps === 0) return { total: 0, base: 0, consolation: 0 };
  
  const perStep = 100 / totalSteps; // 33.33% for 3-step problem
  let baseProgress = 0;
  let consolationProgress = 0;
  
  // Loop through all steps to calculate progress
  for (let i = 0; i < totalSteps; i++) {
    const validatedResult = lineValidationStates.get(i);
    const isValidated = validationTriggers.get(i) === 'enter';
    const userInput = currentLines[i] || '';
    const expectedStep = expectedSteps[i];
    
    if (isValidated && expectedStep) {
      if (stepCorrectness[i]) {
        // CORRECT STEP: Full credit
        baseProgress += perStep;
      } else if (userInput.trim().length > 0) {
        // WRONG BUT ATTEMPTED STEP: Check for consolation credit eligibility
        const expectedLength = expectedStep.answer.trim().length;
        const userLength = userInput.trim().length;
        
        // NEW CONDITION: No consolation if user exceeds expected length by more than 3 characters
        const excessCharacters = userLength - expectedLength;
        
        if (excessCharacters > 3) {
          // User typed way too much - no consolation progress
          console.log(`🚫 No consolation progress for Step ${i + 1}:`);
          console.log(`   User input length: ${userLength} characters`);
          console.log(`   Expected length: ${expectedLength} characters`);
          console.log(`   Excess characters: ${excessCharacters} (max allowed: 3)`);
          console.log(`   Action: Skipping consolation progress for excessive input`);
          
          // Continue to next step without adding any consolation
          continue;
        }
        
        if (expectedLength > 0 && userLength > 0) {
          // Consolation = (step weight ÷ expected length ÷ 2) × user length (capped at expected length)
          const consolationPerChar = (perStep / expectedLength) / 2;
          // Cap user length to expected length to prevent bonus for excess typing
          const cappedUserLength = Math.min(userLength, expectedLength);
          const stepConsolation = cappedUserLength * consolationPerChar;
          consolationProgress += stepConsolation;
          
          console.log(`💡 Consolation progress awarded for Step ${i + 1}:`);
          console.log(`   User input: "${userInput.trim()}" (${userLength} chars)`);
          console.log(`   Expected: "${expectedStep.answer}" (${expectedLength} chars)`);
          console.log(`   Excess: ${excessCharacters} chars (within limit)`);
          console.log(`   Consolation: ${stepConsolation.toFixed(2)}%`);
        }
      }
    }
  }
  
  const totalProgress = baseProgress + consolationProgress;
  
  return {
    total: Math.round(totalProgress * 100) / 100,
    base: Math.round(baseProgress * 100) / 100,
    consolation: Math.round(consolationProgress * 100) / 100
  };
};

  const progressData = calculatePercentage();

  return {
    totalSteps,
    completedSteps: nonEmptyLines.length,
    correctSteps,
    isComplete,
    allCorrect,
    percentage: progressData.total,        // Total progress including consolation
    stepCorrectness,
    finalAnswerDetected,
    finalAnswerPosition,
    // ADD new fields:
    consolationProgress: progressData.consolation,
    baseProgress: progressData.base
 };
};
  // Keep the robust mathematical equivalence method
  public static isMathematicallyEquivalentRobust = (userExpression: string, expectedExpression: string): boolean => {
    try {
      if (userExpression.trim() === expectedExpression.trim()) {
        return true;
      }

      try {
        const userResult = evaluate(userExpression);
        const expectedResult = evaluate(expectedExpression);
        
        if (typeof userResult === 'number' && typeof expectedResult === 'number') {
          const areEqual = Math.abs(userResult - expectedResult) < 1e-10;
          console.log(`Numerical comparison: "${userExpression}" (${userResult}) vs "${expectedExpression}" (${expectedResult}) = ${areEqual}`);
          return areEqual;
        }
        
        const areEqual = String(userResult) === String(expectedResult);
        console.log(`String result comparison: "${userExpression}" (${userResult}) vs "${expectedExpression}" (${expectedResult}) = ${areEqual}`);
        return areEqual;
      } catch (evalError) {
        try {
          const userSimplified = simplify(userExpression).toString();
          const expectedSimplified = simplify(expectedExpression).toString();
          
          const areEqual = userSimplified === expectedSimplified;
          console.log(`Simplification comparison: "${userExpression}" → "${userSimplified}" vs "${expectedExpression}" → "${expectedSimplified}" = ${areEqual}`);
          return areEqual;
        } catch (simplifyError) {
          try {
            const userParsed = parse(userExpression).toString();
            const expectedParsed = parse(expectedExpression).toString();
            
            const areEqual = userParsed === expectedParsed;
            console.log(`Parse comparison: "${userExpression}" → "${userParsed}" vs "${expectedExpression}" → "${expectedParsed}" = ${areEqual}`);
            return areEqual;
          } catch (parseError) {
            console.log(`All Math.js methods failed for "${userExpression}" vs "${expectedExpression}"`);
            return false;
          }
        }
      }
    } catch (error) {
      console.log(`Math.js completely failed for "${userExpression}" vs "${expectedExpression}", using string comparison`);
      const sanitizedUser = InputValidator.sanitizeText(userExpression);
      const sanitizedExpected = InputValidator.sanitizeText(expectedExpression);
      return sanitizedUser === sanitizedExpected;
    }
  };

  // SINGLE IMPLEMENTATION: Smart step validation that prevents cross-step contamination
  public static isStepCorrectSmart = (
    userInput: string, 
    expectedAnswer: string, 
    stepLabel: string,
    allExpectedSteps?: Step[]
  ): boolean => {
    const userTrimmed = userInput.trim();
    const expectedTrimmed = expectedAnswer.trim();
    
    // 1. Exact string match first (case-insensitive)
    if (userTrimmed.toLowerCase() === expectedTrimmed.toLowerCase()) {
      return true;
    }
    
    // 2. Use mathematical equivalence (this preserves the good functionality)
    const isMathEquivalent = InputValidator.isMathematicallyEquivalentRobust(userTrimmed, expectedTrimmed);
    
    if (!isMathEquivalent) {
      return false; // Not equivalent at all
    }
    
    // 3. If mathematically equivalent, check for cross-step contamination
    if (isMathEquivalent && allExpectedSteps) {
      const currentStepAnswer = expectedTrimmed;
      
      for (const step of allExpectedSteps) {
        // Skip the current step we're validating
        if (step.answer === currentStepAnswer) continue;
        
        // Check if user input matches a DIFFERENT step's answer
        const matchesOtherStep = InputValidator.isMathematicallyEquivalentRobust(
          userTrimmed, 
          step.answer
        );
        
        if (matchesOtherStep) {
          console.log(`🚫 Cross-step contamination detected:`);
          console.log(`   User input: "${userTrimmed}"`);
          console.log(`   Expected for current step (${stepLabel}): "${expectedTrimmed}"`);
          console.log(`   But also matches step (${step.label}): "${step.answer}"`);
          
          // SMART DECISION: Prevent wrong-position answers
          if (step.label === "final" && stepLabel !== "final") {
            console.log(`   ❌ Rejecting: Final answer in wrong step position`);
            return false;
          }
          
          if (stepLabel === "final" && step.label !== "final") {
            console.log(`   ❌ Rejecting: Intermediate step in final position`);
            return false;
          }
          
          // For other cross-contamination, also reject
          console.log(`   ❌ Rejecting: Step order confusion`);
          return false;
        }
      }
    }
    
    return isMathEquivalent;
  };

  // SINGLE IMPLEMENTATION: Final answer detection
  public static detectFinalAnswerJump(
    userCurrentLine: string,
    currentLineIndex: number,
    expectedSteps: Step[],
    allUserInput: string[]
  ): FinalAnswerDetectionResult {
    
    if (!userCurrentLine?.trim() || !expectedSteps || expectedSteps.length === 0) {
      return { isFinalAnswer: false };
    }

    const finalStep = expectedSteps[expectedSteps.length - 1];
    
    const matchesFinalAnswer = InputValidator.isStepCorrectSmart(
      userCurrentLine.trim(), 
      finalStep.answer,
      finalStep.label,
      expectedSteps
    );

    if (!matchesFinalAnswer) {
      return { isFinalAnswer: false };
    }
    
    const isAtFinalPosition = currentLineIndex === expectedSteps.length - 1;
    if (isAtFinalPosition) {
      return { isFinalAnswer: false };
    }

    const firstMissingStep = InputValidator.findFirstMissingStep(allUserInput, expectedSteps);
    
    if (firstMissingStep) {
      const stepTypeMessage = InputValidator.getStepTypeMessage(firstMissingStep.step.label);
      
      return {
        isFinalAnswer: true,
        guidanceMessage: `✅ Your final answer is correct! But please show your ${stepTypeMessage} first.`,
        nextMissingStep: firstMissingStep.step,
        nextMissingStepIndex: firstMissingStep.stepIndex
      };
    }

    return { isFinalAnswer: false };
  }

  // SINGLE IMPLEMENTATION: Find missing step
  public static findFirstMissingStep(
    allUserInput: string[], 
    expectedSteps: Step[]
  ): { step: Step; stepIndex: number } | null {
    
    for (let i = 0; i < expectedSteps.length; i++) {
      const userLine = allUserInput[i];
      
      if (!userLine || !userLine.trim()) {
        return {
          step: expectedSteps[i],
          stepIndex: i
        };
      }
      
      const matchesExpectedStep = InputValidator.isStepCorrectSmart(
        userLine.trim(),
        expectedSteps[i].answer,
        expectedSteps[i].label,
        expectedSteps
      );
      
      if (!matchesExpectedStep) {
        return {
          step: expectedSteps[i],
          stepIndex: i
        };
      }
    }
    
    return null;
  }

  public static getStepTypeMessage(label: string): string {
    const messages = {
      "substitution": "substitution step (replace the variable with the given value)",
      "simplification": "simplification step (show your calculation work)", 
      "final": "final answer",
      "math": "mathematical work",
      "text": "explanation"
    };
    
    return messages[label as keyof typeof messages] || "work";
  }

  // SINGLE IMPLEMENTATION: Line validation with final answer detection
  public static validateLineWithFinalAnswerDetection(
    userCurrentLine: string,
    currentLineIndex: number,
    allUserInput: string[],
    expectedSteps: Step[]
  ): {
    isValid: boolean;
    finalAnswerDetection: FinalAnswerDetectionResult;
    normalValidation?: boolean;
  } {
    
    const finalAnswerDetection = InputValidator.detectFinalAnswerJump(
      userCurrentLine,
      currentLineIndex, 
      expectedSteps,
      allUserInput
    );
    
    if (finalAnswerDetection.isFinalAnswer) {
      return {
        isValid: false,
        finalAnswerDetection,
        normalValidation: false
      };
    }
    
    const expectedCurrentStep = expectedSteps[currentLineIndex];
    if (!expectedCurrentStep) {
      return {
        isValid: false,
        finalAnswerDetection,
        normalValidation: false
      };
    }
    
    const normalValidation = InputValidator.isStepCorrectSmart(
      userCurrentLine,
      expectedCurrentStep.answer,
      expectedCurrentStep.label,
      expectedSteps
    );
    
    return {
      isValid: normalValidation,
      finalAnswerDetection,
      normalValidation
    };
  }

  // SINGLE IMPLEMENTATION: Smart array validation
 
  public static validateAnswerArraySmart(
    userLines: string[],
    expectedSteps: Step[],
    stepIndex: number
  ): boolean {
    console.log("=== SMART MATHEMATICAL VALIDATION ===");
    console.log("User Lines:", userLines);
    console.log("Expected Steps:", expectedSteps);
    
    if (userLines.length !== expectedSteps.length) {
      console.log("Length mismatch:", userLines.length, "vs", expectedSteps.length);
      return false;
    }
    
    for (let i = 0; i < userLines.length; i++) {
      const userLine = userLines[i].trim();
      const expectedStep = expectedSteps[i];
      
      const isCorrect = InputValidator.isStepCorrectSmart(
        userLine,
        expectedStep.answer,
        expectedStep.label,
        expectedSteps
      );
      
      if (!isCorrect) {
        console.log(`Step ${i + 1} (${expectedStep.label}) mismatch:`, 
          `"${userLine}" !== "${expectedStep.answer}"`);
        return false;
      } else {
        console.log(`Step ${i + 1} (${expectedStep.label}) matched smartly!`);
      }
    }

    console.log("✅ All steps match with smart validation!");
    return true;
  }

  // Keep the regular array validation for backward compatibility
  /*public static validateAnswerArray(
    userLines: string[] | undefined,
    expectedLines: string[] | undefined,
    stepIndex: number
  ): boolean {
    if (!userLines || !expectedLines) return false;
    
    const nonEmptyUser = userLines.filter(line => line.trim().length > 0);
    const nonEmptyExpected = expectedLines.filter(line => line.trim().length > 0);
    
    console.log("=== REGULAR MATHEMATICAL VALIDATION ===");
    console.log("User Array (filtered):", nonEmptyUser);
    console.log("Expected Array (filtered):", nonEmptyExpected);
    
    if (nonEmptyUser.length !== nonEmptyExpected.length) {
      console.log("Length mismatch:", nonEmptyUser.length, "vs", nonEmptyExpected.length);
      return false;
    }
    
    for (let i = 0; i < nonEmptyUser.length; i++) {
      const userLine = nonEmptyUser[i].trim();
      const expectedLine = nonEmptyExpected[i].trim();
      
      const isMathEqual = InputValidator.isMathematicallyEquivalentRobust(userLine, expectedLine);
      
      if (!isMathEqual) {
        const sanitizedUser = InputValidator.sanitizeText(userLine);
        const sanitizedExpected = InputValidator.sanitizeText(expectedLine);
        
        if (sanitizedUser !== sanitizedExpected) {
          console.log(`Line ${i + 1} mismatch (both math and string):`, 
            `"${userLine}" !== "${expectedLine}"`);
          return false;
        } else {
          console.log(`Line ${i + 1} matched via string sanitization`);
        }
      } else {
        console.log(`Line ${i + 1} matched via mathematical equivalence`);
      }
    }

    console.log("✅ All lines match!");
    return true;
  } */

  // SINGLE IMPLEMENTATION: Main validate answer method
  public static validateAnswer = (
  answerLines: string[] | undefined,
  expectedAnswer: string | string[] | Step[] | undefined,
  stepIndex: number
): boolean => {
  if (!answerLines) return false;
  
  const nonEmptyUserLines = answerLines.filter(line => line.trim().length > 0);
  if (nonEmptyUserLines.length === 0) return false;

  if (!expectedAnswer) {
    return nonEmptyUserLines.length > 0;
  }

  // Handle Step[] expected answer with NEW step-aware validation
  if (Array.isArray(expectedAnswer) && InputValidator.isStepArray(expectedAnswer)) {
    const expectedSteps = expectedAnswer;
    
    // Don't require all steps to be complete - validate what's available
    for (let i = 0; i < Math.min(nonEmptyUserLines.length, expectedSteps.length); i++) {
      const userLine = nonEmptyUserLines[i];
      const expectedStep = expectedSteps[i];
      
      // Use the NEW step-aware validation
      const validation = InputValidator.validateStepWithTwoPhase(
        userLine,
        expectedStep.answer,
        expectedStep.label,
        i,
        expectedSteps
      );
      
      if (!validation.isCurrentStepCorrect) {
        console.log(`Step ${i + 1} (${expectedStep.label}) validation failed:`, 
          `"${userLine}" for expected "${expectedStep.answer}"`);
        return false;
      } else {
        console.log(`Step ${i + 1} (${expectedStep.label}) validated successfully!`);
      }
    }
    
    return true; // All entered steps are valid
  }

  // REMOVED: Fallback calls that were causing conflicts
  // These were calling old validation methods that conflict with your new system
  
  // For non-Step array cases, use basic mathematical equivalence
  if (Array.isArray(expectedAnswer)) {
    // Simple array comparison for backward compatibility
    return nonEmptyUserLines.length === expectedAnswer.length &&
           nonEmptyUserLines.every((line, i) => 
             InputValidator.isMathematicallyEquivalentRobust(line, expectedAnswer[i])
           );
  }
  
  // Single string comparison
  return InputValidator.isMathematicallyEquivalentRobust(
    nonEmptyUserLines.join(''), 
    expectedAnswer
  );
};

  // Keep other utility methods
  public static evaluateMathExpression = (expression: string): any => {
    try {
      return evaluate(expression);
    } catch (error) {
      console.log(`Cannot evaluate expression: "${expression}"`);
      return null;
    }
  };

  public static simplifyMathExpression = (expression: string): string => {
    try {
      const simplified = simplify(expression);
      return simplified.toString();
    } catch (error) {
      console.log(`Cannot simplify expression: "${expression}"`);
      return expression;
    }
  };

  public static getValidationResult(
    userInput: string[],
    expectedAnswer?: string | string[] | Step[],
    stepIndex: number = 0,
    correctnessState: boolean | null = null
  ): ValidationResult {
    const isValid = InputValidator.validateAnswer(userInput, expectedAnswer, stepIndex);
    const nonEmpty = userInput.some(line => line.trim().length > 0);
    const isCorrect = correctnessState === true;
    const isWrong = nonEmpty && !isValid && !isCorrect;

    return {
      isValid,
      isCorrect,
      isWrong,
      nonEmpty,
      expectedAnswer
    };
  }

  public static validateAllSteps(
    allUserInputs: string[][],
    predefinedAnswers: PredefinedAnswer[]
  ): { correct: boolean[]; allCorrect: boolean } {
    const len = Math.min(predefinedAnswers.length, allUserInputs.length);
    const correctnessArr: boolean[] = [];
    
    for (let i = 0; i < len; i++) {
      const userInput = allUserInputs[i];
      const expectedSteps = predefinedAnswers[i]?.steps;
      correctnessArr.push(InputValidator.validateAnswer(userInput, expectedSteps, i));
    }
    
    const allCorrect = correctnessArr.length > 0 && correctnessArr.every(Boolean);
    
    return { correct: correctnessArr, allCorrect };
  }

  public static logValidation(
    userInput: string[],
    expectedAnswer?: string | string[] | Step[],
    stepIndex: number = 0
  ): void {
    console.clear();
    console.log("=== MATHEMATICAL INPUT VALIDATION ===");
    console.log("Step Index:", stepIndex);
    console.log("User Input Array:", userInput);
    console.log("Individual lines:", userInput.map((line, index) => `Line ${index + 1}: "${line}"`));
    
    if (Array.isArray(expectedAnswer)) {
      if (InputValidator.isStepArray(expectedAnswer)) {
        const steps = expectedAnswer;
        console.log("Expected Answer Steps:", steps);
        const expectedStrings = InputValidator.stepsToStringArray(steps);
        console.log("Expected Answer Array (from steps):", expectedStrings);
      } else {
        console.log("Expected Answer Array (Original):", expectedAnswer);
      }
    } else {
      console.log("Expected Answer (String):", expectedAnswer || "Not provided");
    }
    
    console.log("Is Valid (Mathematical):", InputValidator.validateAnswer(userInput, expectedAnswer, stepIndex));
    console.log("==========================================");
  }
}

export function useInputValidator(
  userInput: string[],
  expectedAnswer?: string | string[] | Step[],
  stepIndex: number = 0,
  correctnessState: boolean | null = null
) {
  const validationResult = InputValidator.getValidationResult(
    userInput,
    expectedAnswer,
    stepIndex,
    correctnessState
  );

  const validateAndLog = () => {
    InputValidator.logValidation(userInput, expectedAnswer, stepIndex);
    return validationResult;
  };

  return {
    ...validationResult,
    validateAndLog,
    sanitizedUserInput: InputValidator.sanitizeArray(userInput),
    sanitizedExpected: Array.isArray(expectedAnswer) 
      ? (InputValidator.isStepArray(expectedAnswer)
          ? InputValidator.sanitizeArray(InputValidator.stepsToStringArray(expectedAnswer))
          : InputValidator.sanitizeArray(expectedAnswer))
      : expectedAnswer ? InputValidator.sanitizeArray(InputValidator.stringToArray(expectedAnswer)) : undefined
  };
}

export default InputValidator;