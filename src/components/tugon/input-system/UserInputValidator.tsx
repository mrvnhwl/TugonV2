import type { PredefinedAnswer, Step } from "@/components/data/answers/types";
import { convertLatexToAsciiMath } from "mathlive";
import {
  tokenizeMathString,
  generateTokenFeedback,
  type TokenFeedback,
} from "./tokenUtils";

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
  consolationProgress: number;
  baseProgress: number;
};

export class InputValidator {
  // ---------- Normalization helpers ----------
  private static stripInvisible = (s: string) =>
    s.replace(/[\u00A0\u1680\u180E\u2000-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g, "");

  private static normalizeOperators = (s: string) =>
    s
      .replace(/−/g, "-") // unicode minus -> hyphen
      .replace(/·|×|\\cdot|\\times/g, "*")
      .replace(/÷|\\div/g, "/");

  /**
   * Make two expressions equivalent even with cosmetic differences:
   * - remove spaces/newlines
   * - normalize minus/multiply/divide
   * - turn implied multiplication `2(4)` into `2*4` (and `)(` into `)*(`)
   * - lower-case
   */
  public static normalizeExpression = (s: string): string => {
    if (!s) return "";
    const t = InputValidator.normalizeOperators(InputValidator.stripInvisible(s))
      .replace(/"/g, "")
      .replace(/\s+/g, "")
      .replace(/\)\(/g, ")*(") // )(
      .replace(/(\d|\))\(/g, "$1*(") // 2(, )(  -> implied mult
      .replace(/\)(\d|\()/g, ")*$1") // )2 or )( -> )*2, )*(
      .toLowerCase();
    return t;
  };

  // ---------- MathLive-aware sanitization ----------
  public static sanitizeTextMathLive = (v: string): string => {
    if (!v) return "";
    const pre = InputValidator.normalizeOperators(InputValidator.stripInvisible(v)).replace(/"/g, "");
    const hasLatex = /\\|{|}|\^|_/.test(pre);

    if (hasLatex) {
      try {
        const ascii = convertLatexToAsciiMath(pre);
        return InputValidator.normalizeExpression(ascii);
      } catch {
        return InputValidator.cleanLatexFallback(pre);
      }
    }
    return InputValidator.normalizeExpression(pre);
  };

  public static cleanLatexFallback = (latexString: string): string =>
    InputValidator.normalizeExpression(
      latexString
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
        .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
        .replace(/\^{([^}]+)}/g, "^($1)")
        .replace(/_{([^}]+)}/g, "_($1)")
        .replace(/\\left\(|\\right\)/g, "")
        .replace(/\\left\[|\\right\]/g, "")
        .replace(/[{}\\]/g, "")
    );

  public static sanitizeArray = (lines: string[]): string[] =>
    lines.map((line) => InputValidator.sanitizeTextMathLive(line)).filter((x) => x.length > 0);

  // Extract raw value from MathField
  public static extractMathFieldValue = (mathFieldElement: any): string => {
    if (!mathFieldElement) return "";
    try {
      const latexValue = mathFieldElement.getValue?.() || mathFieldElement.value || "";
      const cleanedLatex = InputValidator.stripInvisible(latexValue).replace(/"/g, "");
      return InputValidator.sanitizeTextMathLive(cleanedLatex);
    } catch {
      return "";
    }
  };

  public static arrayToString = (lines: string[]): string => lines.join("\n");
  public static stringToArray = (answer: string): string[] =>
    answer.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  public static stepsToStringArray = (steps: Step[]): string[] => steps.map((s) => s.answer);
  public static isStepArray = (arr: any[]): arr is Step[] =>
    arr.length > 0 && typeof arr[0] === "object" && arr[0] !== null && "label" in arr[0] && "answer" in arr[0];

  // ---------- CORE validation (tolerant) ----------
  public static validateStepSimple = (
    userInput: string,
    expectedAnswer: string,
    stepLabel: string,
    currentStepIndex: number,
    allExpectedSteps: Step[]
  ): SimpleValidationResult => {
    const cleanUser = InputValidator.sanitizeTextMathLive(userInput.trim());
    const cleanExpected = InputValidator.sanitizeTextMathLive(expectedAnswer.trim());

    // Wordle-style token feedback (UI aid)
    const userTokens = tokenizeMathString(userInput.trim());
    const expectedTokens = tokenizeMathString(expectedAnswer.trim());
    const tokenFeedback = generateTokenFeedback(userTokens, expectedTokens);

    // tolerant compare (implied multiplication, spaces, unicode)
    let isCorrect = cleanUser === cleanExpected;

    // If still false, try a looser normalization pass (remove parentheses that don't change structure)
    if (!isCorrect) {
      const looser = (s: string) => s.replace(/[()]/g, "");
      isCorrect = looser(cleanUser) === looser(cleanExpected);
    }

    // detect "final answer typed too early"
    let finalAnswerDetected = false;
    if (allExpectedSteps.length > 0) {
      const finalStep = allExpectedSteps[allExpectedSteps.length - 1];
      const finalStepIndex = allExpectedSteps.length - 1;
      const cleanFinal = InputValidator.sanitizeTextMathLive(finalStep.answer);
      if (cleanUser === cleanFinal && currentStepIndex < finalStepIndex) {
        finalAnswerDetected = true;
        isCorrect = false;
      }
    }

    return { isCorrect, finalAnswerDetected, tokenFeedback };
  };

  public static isAnswerComplete = (currentLines: string[], expectedSteps: Step[]): boolean => {
    if (!expectedSteps || expectedSteps.length === 0) return false;
    const nonEmptyLines = currentLines.filter((line) => line.trim().length > 0);
    if (nonEmptyLines.length < expectedSteps.length) return false;

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
      if (!validation.isCorrect) return false;
    }
    return true;
  };

  public static getCompletionStatus = (
    currentLines: string[],
    expectedSteps: Step[],
    lineValidationStates: Map<number, SimpleValidationResult | null>,
    validationTriggers: Map<number, "enter" | null>
  ): CompletionStatus => {
    if (!expectedSteps || expectedSteps.length === 0) {
      return {
        totalSteps: 1,
        completedSteps: currentLines.filter((line) => line.trim().length > 0).length,
        correctSteps: 0,
        isComplete: false,
        allCorrect: false,
        percentage: 0,
        finalAnswerDetected: false,
        finalAnswerPosition: -1,
        stepCorrectness: [],
        consolationProgress: 0,
        baseProgress: 0,
      };
    }

    const nonEmptyLines = currentLines.filter((line) => line.trim().length > 0);
    const totalSteps = expectedSteps.length;
    let correctSteps = 0;
    const stepCorrectness: boolean[] = [];

    let finalAnswerDetected = false;
    let finalAnswerPosition = -1;

    for (let i = 0; i < Math.min(nonEmptyLines.length, expectedSteps.length); i++) {
      const validated = lineValidationStates.get(i);
      const isValidated = validationTriggers.get(i) === "enter";

      if (validated && isValidated && validated.isCorrect) {
        stepCorrectness[i] = true;
        correctSteps++;
        if (validated.finalAnswerDetected && i > 0) {
          finalAnswerDetected = true;
          finalAnswerPosition = i;
        }
      } else {
        stepCorrectness[i] = false;
      }
    }

    const isComplete = nonEmptyLines.length >= totalSteps;
    const allCorrect = correctSteps === totalSteps && isComplete;

    const calc = () => {
      if (totalSteps === 0) return { total: 0, base: 0, consolation: 0 };
      const perStep = 100 / totalSteps;
      let baseProgress = 0;
      let consolationProgress = 0;

      for (let i = 0; i < totalSteps; i++) {
        const validated = lineValidationStates.get(i);
        const isValidated = validationTriggers.get(i) === "enter";
        const userInput = currentLines[i] || "";
        const expectedStep = expectedSteps[i];

        if (isValidated && expectedStep) {
          if (stepCorrectness[i]) {
            baseProgress += perStep;
          } else if (userInput.trim().length > 0) {
            const expectedLength = expectedStep.answer.trim().length;
            const userLength = userInput.trim().length;
            const excess = userLength - expectedLength;

            if (excess <= 3 && expectedLength > 0 && userLength > 0) {
              const consolationPerChar = perStep / expectedLength / 2;
              const capped = Math.min(userLength, expectedLength);
              consolationProgress += capped * consolationPerChar;
            }
          }
        }
      }
      const total = baseProgress + consolationProgress;
      return {
        total: Math.round(total * 100) / 100,
        base: Math.round(baseProgress * 100) / 100,
        consolation: Math.round(consolationProgress * 100) / 100,
      };
    };

    const p = calc();

    return {
      totalSteps,
      completedSteps: nonEmptyLines.length,
      correctSteps,
      isComplete,
      allCorrect,
      percentage: p.total,
      stepCorrectness,
      finalAnswerDetected,
      finalAnswerPosition,
      consolationProgress: p.consolation,
      baseProgress: p.base,
    };
  };

  public static isStringEquivalent = (userExpression: string, expectedExpression: string): boolean => {
    const cleanUser = InputValidator.sanitizeTextMathLive(userExpression);
    const cleanExpected = InputValidator.sanitizeTextMathLive(expectedExpression);
    if (cleanUser === cleanExpected) return true;

    // looser pass (remove parentheses)
    const looser = (s: string) => s.replace(/[()]/g, "");
    return looser(cleanUser) === looser(cleanExpected);
  };

  public static validateAnswer = (
    answerLines: string[] | undefined,
    expectedAnswer: string | string[] | Step[] | undefined
  ): boolean => {
    if (!answerLines) return false;
    const nonEmpty = answerLines.filter((l) => l.trim().length > 0);
    if (nonEmpty.length === 0) return false;

    if (!expectedAnswer) return nonEmpty.length > 0;

    if (Array.isArray(expectedAnswer) && InputValidator.isStepArray(expectedAnswer)) {
      const steps = expectedAnswer;
      for (let i = 0; i < Math.min(nonEmpty.length, steps.length); i++) {
        const userLine = nonEmpty[i];
        const step = steps[i];
        const v = InputValidator.validateStepSimple(userLine, step.answer, step.label, i, steps);
        if (!v.isCorrect) return false;
      }
      return true;
    }

    if (Array.isArray(expectedAnswer)) {
      return (
        nonEmpty.length === expectedAnswer.length &&
        nonEmpty.every((line, i) => InputValidator.isStringEquivalent(line, expectedAnswer[i]))
      );
    }

    return InputValidator.isStringEquivalent(nonEmpty.join(""), expectedAnswer);
  };

  public static getValidationResult(
    userInput: string[],
    expectedAnswer?: string | string[] | Step[],
    stepIndex: number = 0,
    correctnessState: boolean | null = null
  ): ValidationResult {
    const isValid = InputValidator.validateAnswer(userInput, expectedAnswer);
    const nonEmpty = userInput.some((line) => line.trim().length > 0);
    const isCorrect = correctnessState === true;
    const isWrong = nonEmpty && !isValid && !isCorrect;

    return {
      isValid,
      isCorrect,
      isWrong,
      nonEmpty,
      expectedAnswer,
    };
  }
}

export default InputValidator;