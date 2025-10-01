import type { PredefinedAnswer, Step } from "@/components/data/answers/types";
import { convertLatexToAsciiMath } from 'mathlive';
import { tokenizeMathString, generateTokenFeedback, isTokenFeedbackComplete, type TokenFeedback } from './tokenUtils';

export type ValidationResult = {
  isValid: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  nonEmpty: boolean;
  expectedAnswer?: string | string[] | Step[];
};

export type SimpleValidationResult = {
  isCorrect: boolean;
  finalAnswerDetected: boolean;
  tokenFeedback?: TokenFeedback[];
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
  // NEW: MathLive-aware text sanitization with enhanced whitespace cleaning
  public static sanitizeTextMathLive = (v: string): string => {
    if (!v) return "";
    
    // Clean invisible Unicode characters and quotes first (same as tokenizer)
    const invisibleRegex = /[\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g;
    const preCleanedValue = v.replace(invisibleRegex, '').replace(/"/g, '');
    
    // Check if input contains LaTeX syntax
    const hasLatex = preCleanedValue.includes('\\') || preCleanedValue.includes('{') || preCleanedValue.includes('}') || preCleanedValue.includes('^') || preCleanedValue.includes('_');
    
    if (hasLatex) {
      try {
        // Convert LaTeX to readable ASCII math notation
        const asciiMath = convertLatexToAsciiMath(preCleanedValue);
        console.log(`🔄 MathLive LaTeX conversion: "${preCleanedValue}" → "${asciiMath}"`);
        return asciiMath.replace(/[\s\n\r]+/g, "").toLowerCase();
      } catch (error) {
        console.log(`⚠️ MathLive conversion failed for "${preCleanedValue}", using fallback`);
        // Fallback to basic LaTeX cleaning
        return InputValidator.cleanLatexFallback(preCleanedValue);
      }
    }
    
    // Regular text sanitization with enhanced whitespace cleaning
    return (preCleanedValue ?? "").replace(/[\s\n\r]+/g, "").toLowerCase();
  };

  // NEW: Fallback LaTeX cleaning for when MathLive conversion fails
  public static cleanLatexFallback = (latexString: string): string => {
    // Clean invisible Unicode characters and quotes first
    const invisibleRegex = /[\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g;
    
    return latexString
      .replace(invisibleRegex, '')                           // Remove invisible characters
      .replace(/"/g, '')                                     // Remove quotes
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // \frac{a}{b} → (a)/(b)
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')             // \sqrt{x} → sqrt(x)
      .replace(/\\cdot/g, '*')                                // \cdot → *
      .replace(/\\times/g, '*')                               // \times → *
      .replace(/\\div/g, '/')                                 // \div → /
      .replace(/\^{([^}]+)}/g, '^($1)')                      // ^{n} → ^(n)
      .replace(/_{([^}]+)}/g, '_($1)')                       // _{n} → _(n)
      .replace(/\\left\(|\\right\)/g, '')                    // Remove \left( \right)
      .replace(/\\left\[|\\right\]/g, '')                    // Remove \left[ \right]
      .replace(/\{|\}/g, '')                                 // Remove remaining braces
      .replace(/\\/g, '')                                    // Remove remaining backslashes
      .replace(/[\s\n\r]+/g, "")                            // Remove whitespace
      .toLowerCase();
  };
  
 public static sanitizeArray = (lines: string[]): string[] => {
    return lines.map(line => InputValidator.sanitizeTextMathLive(line)).filter(line => line.length > 0);
  };
    // NEW: Extract raw value from MathField with enhanced whitespace cleaning
  public static extractMathFieldValue = (mathFieldElement: any): string => {
    if (!mathFieldElement) return "";
    
    try {
      // Get the LaTeX representation
      const latexValue = mathFieldElement.getValue?.() || mathFieldElement.value || "";
      console.log(`📊 MathField raw LaTeX: "${latexValue}"`);
      
      // Clean invisible Unicode characters and quotes first (same as tokenizer)
      const invisibleRegex = /[\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g;
      const cleanedLatex = latexValue.replace(invisibleRegex, '').replace(/"/g, '');
      
      // Convert to readable format using sanitization
      const readable = InputValidator.sanitizeTextMathLive(cleanedLatex);
      console.log(`📊 MathField converted: "${latexValue}" → "${readable}"`);
      
      return readable;
    } catch (error) {
      console.log(`❌ Failed to extract MathField value:`, error);
      return "";
    }
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
 // REPLACE with simple validation + token feedback:
public static validateStepSimple = (
  userInput: string,
  expectedAnswer: string,
  stepLabel: string,
  currentStepIndex: number,
  allExpectedSteps: Step[]
): SimpleValidationResult => {
  
  // Clean inputs with MathLive awareness (keep this part!)
  const cleanUser = InputValidator.sanitizeTextMathLive(userInput.trim());
  const cleanExpected = InputValidator.sanitizeTextMathLive(expectedAnswer.trim());
  
  console.log(`🎯 Simple validation:`, {
    stepLabel,
    originalUser: userInput.trim(),
    cleanedUser: cleanUser,
    originalExpected: expectedAnswer.trim(),
    cleanedExpected: cleanExpected
  });
  
  // Generate token feedback for Wordle-style overlay
  const userTokens = tokenizeMathString(userInput.trim());
  const expectedTokens = tokenizeMathString(expectedAnswer.trim());
  const tokenFeedback = generateTokenFeedback(userTokens, expectedTokens);
  
  console.log(`🎯 Token feedback:`, {
    userTokens,
    expectedTokens,
    feedback: tokenFeedback
  });
  
  // Simple string comparison (REPLACE complex math)
  const isCorrect = cleanUser === cleanExpected;
  
  // Simple final answer detection (REPLACE complex logic)
  let finalAnswerDetected = false;
  if (allExpectedSteps.length > 0) {
    const finalStep = allExpectedSteps[allExpectedSteps.length - 1];
    const finalStepIndex = allExpectedSteps.length - 1;
    const cleanFinalAnswer = InputValidator.sanitizeTextMathLive(finalStep.answer);
    
    // Check if user input matches final answer but not in final position
    if (cleanUser === cleanFinalAnswer && currentStepIndex < finalStepIndex) {
      finalAnswerDetected = true;
    }
  }
  
  return { 
    isCorrect: isCorrect && !finalAnswerDetected, // Reject if final answer in wrong position
    finalAnswerDetected,
    tokenFeedback
  };
};
public static isAnswerComplete = (
  currentLines: string[], 
  expectedSteps: Step[]
): boolean => {
  if (!expectedSteps || expectedSteps.length === 0) return false;
  
  const nonEmptyLines = currentLines.filter(line => line.trim().length > 0);
  
  if (nonEmptyLines.length < expectedSteps.length) return false;
  
  // Check each step with simple validation
  for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
    const userLine = nonEmptyLines[i];
    const expectedStep = expectedSteps[i];
    
    const validation = InputValidator.validateStepSimple(
      userLine,
      expectedStep.answer,
      expectedStep.label,
      i,
      expectedSteps
    );
    
    if (!validation.isCorrect) {
      return false;
    }
  }
  
  return true;
};


public static getCompletionStatus = (
  currentLines: string[],
  expectedSteps: Step[],
  lineValidationStates: Map<number, SimpleValidationResult | null>,
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
  

  // Use validated states instead of real-time validation
  for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
    // Only count as correct if it has been validated (Enter pressed)
    const validatedResult = lineValidationStates.get(i);
    const isValidated = validationTriggers.get(i) === 'enter';
    
    if (validatedResult && isValidated && validatedResult.isCorrect) {
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
  // REPLACE with simple string comparison:
public static isStringEquivalent = (userExpression: string, expectedExpression: string): boolean => {
  // Clean inputs with MathLive awareness (keep this part!)
  const cleanUser = InputValidator.sanitizeTextMathLive(userExpression);
  const cleanExpected = InputValidator.sanitizeTextMathLive(expectedExpression);
  
  console.log(`🔍 Simple string comparison:`, {
    originalUser: userExpression,
    cleanedUser: cleanUser,
    originalExpected: expectedExpression,
    cleanedExpected: cleanExpected
  });

  // Simple string comparison only
  return cleanUser === cleanExpected;
};


  // SINGLE IMPLEMENTATION: Main validate answer method
  public static validateAnswer = (
  answerLines: string[] | undefined,
  expectedAnswer: string | string[] | Step[] | undefined
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
      
      // Use simple validation
      const validation = InputValidator.validateStepSimple(
        userLine,
        expectedStep.answer,
        expectedStep.label,
        i,
        expectedSteps
      );
      
      if (!validation.isCorrect) {
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
             InputValidator.isStringEquivalent(line, expectedAnswer[i])
           );
  }
  
  // Single string comparison
  return InputValidator.isStringEquivalent(
    nonEmptyUserLines.join(''), 
    expectedAnswer
  );
};

  // Removed complex mathematical evaluation methods - using simple string comparison instead

  public static getValidationResult(
    userInput: string[],
    expectedAnswer?: string | string[] | Step[],
    stepIndex: number = 0,
    correctnessState: boolean | null = null
  ): ValidationResult {
    const isValid = InputValidator.validateAnswer(userInput, expectedAnswer);
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
      correctnessArr.push(InputValidator.validateAnswer(userInput, expectedSteps));
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
    
    console.log("Is Valid (Mathematical):", InputValidator.validateAnswer(userInput, expectedAnswer));
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