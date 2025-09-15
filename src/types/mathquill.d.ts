declare module 'mathquill' {
  interface MathFieldConfig {
    autoCommands?: string;
    autoOperatorNames?: string;
    restrictMismatchedBrackets?: boolean;
    sumStartsWithNEquals?: boolean;
    supSubsRequireOperand?: boolean;
    charsThatBreakOutOfSupSub?: string;
    autoSubscriptNumerals?: boolean;
    handlers?: {
      edit?: (mathField: MathFieldAPI) => void;
      upOutOf?: (mathField: MathFieldAPI) => void;
      downOutOf?: (mathField: MathFieldAPI) => void;
      moveOutOf?: (dir: number, mathField: MathFieldAPI) => void;
      deleteOutOf?: (dir: number, mathField: MathFieldAPI) => void;
      selectOutOf?: (dir: number, mathField: MathFieldAPI) => void;
      enter?: (mathField: MathFieldAPI) => void;
    };
  }

  interface MathFieldAPI {
    revert(): HTMLElement;
    reflow(): void;
    el(): HTMLElement;
    latex(): string;
    latex(latexString: string): MathFieldAPI;
    text(): string;
    focus(): MathFieldAPI;
    blur(): MathFieldAPI;
    write(latex: string): MathFieldAPI;
    cmd(latexString: string): MathFieldAPI;
    select(): MathFieldAPI;
    clearSelection(): MathFieldAPI;
    moveToLeftEnd(): MathFieldAPI;
    moveToRightEnd(): MathFieldAPI;
    keystroke(keysString: string): MathFieldAPI;
    typedText(text: string): MathFieldAPI;
  }

  interface MathQuillAPI {
    MathField(element: HTMLElement, config?: MathFieldConfig): MathFieldAPI;
    StaticMath(element: HTMLElement): void;
  }

  export function getInterface(version: number): MathQuillAPI;
}

declare global {
  interface Window {
    MathQuill?: any;
    MQ?: any;
  }
}

export {};