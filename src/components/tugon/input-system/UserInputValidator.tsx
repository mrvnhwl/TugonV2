import type { PredefinedAnswer, Step } from "@/components/data/answers";
import { simplify, equal, evaluate, parse } from "mathjs";

export type ValidationResult = {
  isValid: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  nonEmpty: boolean;
  expectedAnswer?: string | string[] | Step[]; // Updated to include Step[]
};

export interface InputValidatorProps {
  userInput: string[];
  expectedAnswer?: string | string[] | Step[]; // Updated to include Step[]
  predefinedAnswers?: PredefinedAnswer[];
  stepIndex: number;
}

export class InputValidator {
  public static sanitizeText = (v: string): string => {
    return (v ?? "").replace(/[\s\n\r]+/g, "").toLowerCase();
  };

  // Sanitize an entire array of lines
  public static sanitizeArray = (lines: string[]): string[] => {
    return lines.map(line => InputValidator.sanitizeText(line)).filter(line => line.length > 0);
  };

  public static arrayToString = (lines: string[]): string => {
    return lines.join('\n');
  };

  // Convert string answer to array (for backward compatibility)
  public static stringToArray = (answer: string): string[] => {
    return answer.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  };

  // New: Convert Step[] to string[] for validation
  public static stepsToStringArray = (steps: Step[]): string[] => {
    return steps.map(step => step.answer);
  };

  // New: Type guard to check if array contains Step objects
  public static isStepArray = (arr: any[]): arr is Step[] => {
    return arr.length > 0 && 
           typeof arr[0] === 'object' && 
           arr[0] !== null && 
           'label' in arr[0] && 
           'answer' in arr[0];
  };

  // Fixed: Mathematical equivalence checker using Math.js with proper type handling
  public static isMathematicallyEquivalent = (userExpression: string, expectedExpression: string): boolean => {
    try {
      // First try direct string comparison (for non-mathematical content)
      if (userExpression.trim() === expectedExpression.trim()) {
        return true;
      }

      // Method 1: Try evaluating both expressions and comparing results
      try {
        const userResult = evaluate(userExpression);
        const expectedResult = evaluate(expectedExpression);
        
        // Use Math.js equal function on evaluated results and handle return type properly
        const equalResult = equal(userResult, expectedResult);
        
        // Convert Math.js result to boolean (handle MathCollection case)
        const areEqual = typeof equalResult === 'boolean' ? equalResult : Boolean(equalResult);
        
        console.log(`Evaluation comparison: "${userExpression}" (${userResult}) vs "${expectedExpression}" (${expectedResult}) = ${areEqual}`);
        return areEqual;
      } catch (evalError) {
        // Method 2: Try simplifying and comparing string representations
        try {
          const userSimplified = simplify(userExpression).toString();
          const expectedSimplified = simplify(expectedExpression).toString();
          
          const areEqual = userSimplified === expectedSimplified;
          console.log(`Simplification comparison: "${userExpression}" → "${userSimplified}" vs "${expectedExpression}" → "${expectedSimplified}" = ${areEqual}`);
          return areEqual;
        } catch (simplifyError) {
          // Method 3: Parse and compare node structures (fallback)
          try {
            const userParsed = parse(userExpression);
            const expectedParsed = parse(expectedExpression);
            
            // Compare string representations of parsed nodes
            const areEqual = userParsed.toString() === expectedParsed.toString();
            console.log(`Parse comparison: "${userExpression}" → "${userParsed.toString()}" vs "${expectedExpression}" → "${expectedParsed.toString()}" = ${areEqual}`);
            return areEqual;
          } catch (parseError) {
            console.log(`All Math.js methods failed for "${userExpression}" vs "${expectedExpression}"`);
            return false;
          }
        }
      }
      
    } catch (error) {
      // If all Math.js methods fail, fall back to sanitized string comparison
      console.log(`Math.js completely failed for "${userExpression}" vs "${expectedExpression}", using string comparison`);
      const sanitizedUser = InputValidator.sanitizeText(userExpression);
      const sanitizedExpected = InputValidator.sanitizeText(expectedExpression);
      return sanitizedUser === sanitizedExpected;
    }
  };

  // Alternative: More robust mathematical comparison without using equal() directly
  public static isMathematicallyEquivalentRobust = (userExpression: string, expectedExpression: string): boolean => {
    try {
      // First try direct string comparison
      if (userExpression.trim() === expectedExpression.trim()) {
        return true;
      }

      // Method 1: Numerical comparison (for expressions that evaluate to numbers)
      try {
        const userResult = evaluate(userExpression);
        const expectedResult = evaluate(expectedExpression);
        
        // Direct numerical comparison for numbers
        if (typeof userResult === 'number' && typeof expectedResult === 'number') {
          const areEqual = Math.abs(userResult - expectedResult) < 1e-10; // Handle floating point precision
          console.log(`Numerical comparison: "${userExpression}" (${userResult}) vs "${expectedExpression}" (${expectedResult}) = ${areEqual}`);
          return areEqual;
        }
        
        // String comparison for other types
        const areEqual = String(userResult) === String(expectedResult);
        console.log(`String result comparison: "${userExpression}" (${userResult}) vs "${expectedExpression}" (${expectedResult}) = ${areEqual}`);
        return areEqual;
      } catch (evalError) {
        // Method 2: Simplification comparison
        try {
          const userSimplified = simplify(userExpression).toString();
          const expectedSimplified = simplify(expectedExpression).toString();
          
          const areEqual = userSimplified === expectedSimplified;
          console.log(`Simplification comparison: "${userExpression}" → "${userSimplified}" vs "${expectedExpression}" → "${expectedSimplified}" = ${areEqual}`);
          return areEqual;
        } catch (simplifyError) {
          // Method 3: Parse comparison
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
      // Fallback to sanitized string comparison
      console.log(`Math.js completely failed for "${userExpression}" vs "${expectedExpression}", using string comparison`);
      const sanitizedUser = InputValidator.sanitizeText(userExpression);
      const sanitizedExpected = InputValidator.sanitizeText(expectedExpression);
      return sanitizedUser === sanitizedExpected;
    }
  };

  // Enhanced: Line-by-line array comparison with mathematical equivalence
  public static validateAnswerArray(
    userLines: string[] | undefined,
    expectedLines: string[] | undefined,
    stepIndex: number
  ): boolean {
    if (!userLines || !expectedLines) return false;
    
    // Remove empty lines from both arrays
    const nonEmptyUser = userLines.filter(line => line.trim().length > 0);
    const nonEmptyExpected = expectedLines.filter(line => line.trim().length > 0);
    
    console.log("=== MATHEMATICAL VALIDATION ===");
    console.log("User Array (filtered):", nonEmptyUser);
    console.log("Expected Array (filtered):", nonEmptyExpected);
    
    // Check if arrays have same length
    if (nonEmptyUser.length !== nonEmptyExpected.length) {
      console.log("Length mismatch:", nonEmptyUser.length, "vs", nonEmptyExpected.length);
      return false;
    }
    
    // Line-by-line mathematical equivalence comparison
    for (let i = 0; i < nonEmptyUser.length; i++) {
      const userLine = nonEmptyUser[i].trim();
      const expectedLine = nonEmptyExpected[i].trim();
      
      // Use the robust mathematical equivalence method
      const isMathEqual = InputValidator.isMathematicallyEquivalentRobust(userLine, expectedLine);
      
      if (!isMathEqual) {
        // Fallback to sanitized string comparison
        const sanitizedUser = InputValidator.sanitizeText(userLine);
        const sanitizedExpected = InputValidator.sanitizeText(expectedLine);
        
        if (sanitizedUser !== sanitizedExpected) {
          console.log(`Line ${i + 1} mismatch (both math and string):`, 
            `"${userLine}" !== "${expectedLine}"`);
          console.log(`Sanitized: "${sanitizedUser}" !== "${sanitizedExpected}"`);
          return false;
        } else {
          console.log(`Line ${i + 1} matched via string sanitization`);
        }
      } else {
        console.log(`Line ${i + 1} matched via mathematical equivalence`);
      }
    }

    console.log("✅ All lines match (mathematically or textually)!");
    return true;
  }

  // Enhanced: Mathematical evaluation helper
  public static evaluateMathExpression = (expression: string): any => {
    try {
      return evaluate(expression);
    } catch (error) {
      console.log(`Cannot evaluate expression: "${expression}"`);
      return null;
    }
  };

  // Enhanced: Simplify mathematical expressions
  public static simplifyMathExpression = (expression: string): string => {
    try {
      const simplified = simplify(expression);
      return simplified.toString();
    } catch (error) {
      console.log(`Cannot simplify expression: "${expression}"`);
      return expression;
    }
  };

  // Updated: Support string, array, and Step[] expected answers
  public static validateAnswer(
    answerLines: string[] | undefined,
    expectedAnswer: string | string[] | Step[] | undefined,
    stepIndex: number
  ): boolean {
    if (!answerLines) return false;
    
    // Remove empty lines from user input
    const nonEmptyUserLines = answerLines.filter(line => line.trim().length > 0);
    if (nonEmptyUserLines.length === 0) return false;

    if (!expectedAnswer) {
      // Fallback: if no expected is defined, consider non-empty as valid
      return nonEmptyUserLines.length > 0;
    }

    // Handle Step[] expected answer (new format) - FIXED with type guard
    if (Array.isArray(expectedAnswer) && InputValidator.isStepArray(expectedAnswer)) {
      const expectedStrings = InputValidator.stepsToStringArray(expectedAnswer);
      return InputValidator.validateAnswerArray(nonEmptyUserLines, expectedStrings, stepIndex);
    }

    // Handle string[] expected answer 
    if (Array.isArray(expectedAnswer)) {
      return InputValidator.validateAnswerArray(nonEmptyUserLines, expectedAnswer, stepIndex);
    }
    
    // Handle string expected answer (backward compatibility)
    const expectedAsArray = InputValidator.stringToArray(expectedAnswer);
    return InputValidator.validateAnswerArray(nonEmptyUserLines, expectedAsArray, stepIndex);
  }

  public static getValidationResult(
    userInput: string[],
    expectedAnswer?: string | string[] | Step[],
    stepIndex: number = 0,
    correctnessState: boolean | null = null
  ): ValidationResult {
    const joinedAnswer = InputValidator.arrayToString(userInput);
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

  // Fixed: Updated to use new PredefinedAnswer structure with steps
  public static validateAllSteps(
    allUserInputs: string[][],
    predefinedAnswers: PredefinedAnswer[]
  ): { correct: boolean[]; allCorrect: boolean } {
    const len = Math.min(predefinedAnswers.length, allUserInputs.length);
    const correctnessArr: boolean[] = [];
    
    for (let i = 0; i < len; i++) {
      const userInput = allUserInputs[i];
      const expectedSteps = predefinedAnswers[i]?.steps; // Use steps instead of answer
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
    
    // Show mathematical simplification attempts
    console.log("User Input Simplified:", userInput.map(line => {
      const simplified = InputValidator.simplifyMathExpression(line);
      return `"${line}" → "${simplified}"`;
    }));
    
    // Handle Step[], string[], and string expected answers - FIXED with type guard
    if (Array.isArray(expectedAnswer)) {
      if (InputValidator.isStepArray(expectedAnswer)) {
        // Handle Step[] format
        const steps = expectedAnswer;
        console.log("Expected Answer Steps:", steps);
        const expectedStrings = InputValidator.stepsToStringArray(steps);
        console.log("Expected Answer Array (from steps):", expectedStrings);
        console.log("Expected Answer Simplified:", expectedStrings.map(line => {
          const simplified = InputValidator.simplifyMathExpression(line);
          return `"${line}" → "${simplified}"`;
        }));
      } else {
        // Handle string[] format
        console.log("Expected Answer Array (Original):", expectedAnswer);
        console.log("Expected Answer Simplified:", expectedAnswer.map(line => {
          const simplified = InputValidator.simplifyMathExpression(line);
          return `"${line}" → "${simplified}"`;
        }));
      }
    } else {
      // Handle string format
      console.log("Expected Answer (String):", expectedAnswer || "Not provided");
      if (expectedAnswer) {
        const expectedAsArray = InputValidator.stringToArray(expectedAnswer);
        console.log("Expected as Array (Original):", expectedAsArray);
        console.log("Expected Simplified:", expectedAsArray.map(line => {
          const simplified = InputValidator.simplifyMathExpression(line);
          return `"${line}" → "${simplified}"`;
        }));
      }
    }
    
    console.log("Is Valid (Mathematical):", InputValidator.validateAnswer(userInput, expectedAnswer, stepIndex));
    console.log("==========================================");
  }
}

// Hook version for easier React component usage
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