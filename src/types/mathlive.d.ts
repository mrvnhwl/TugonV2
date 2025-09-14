declare namespace JSX {
  interface IntrinsicElements {
    'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      ref?: React.Ref<any>;
      
      // Core MathLive properties
      value?: string;
      placeholder?: string;
      disabled?: boolean;
      readonly?: boolean;
      
      // Virtual keyboard properties (FIXED)
      'virtual-keyboard-mode'?: 'auto' | 'manual' | 'onfocus' | 'off';
      'virtual-keyboard-policy'?: 'auto' | 'manual' | 'sandboxed';
      
      // Smart features (FIXED - should be boolean only)
      'smart-fence'?: boolean;
      'smart-superscript'?: boolean;
      'smart-mode'?: boolean;
      'remove-extraneous-parentheses'?: boolean;
      
      // Input handling
      'input-mode'?: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url';
      'letter-shape-style'?: 'auto' | 'tex' | 'french' | 'iso' | 'upright';
      
      // Math notation
      'math-mode-space'?: string;
      'inline-shortcut-timeout'?: number;
      
      // Event handlers
      onInput?: (e: any) => void;
      onFocus?: (e: any) => void;
      onBlur?: (e: any) => void;
      onKeyDown?: (e: any) => void;
      onClick?: (e: any) => void;
      onChange?: (e: any) => void;
      
      // Additional MathLive events
      onSelectionChange?: (e: any) => void;
      onModeChange?: (e: any) => void;
      onReadAloudStatus?: (e: any) => void;
      
      // Style and layout
      style?: React.CSSProperties;
      className?: string;
      
      // Accessibility
      'aria-label'?: string;
      'aria-describedby'?: string;
      role?: string;
      tabIndex?: number;
    };
  }
}

// Additional MathLive type declarations
declare global {
  interface Window {
    MathfieldElement: any;
    MathLive: any;
  }
}