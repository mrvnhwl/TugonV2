import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

declare global {
  interface Window {
    MathQuill?: any;
    MQ?: any;
    $?: any; // jQuery
  }
}

export interface MathInputProps {
  value?: string;
  onChange?: (latex: string, text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (key: string, event: KeyboardEvent) => boolean | void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export interface MathInputHandle {
  focus: () => void;
  blur: () => void;
  latex: () => string;
  text: () => string;
  clear: () => void;
  setLatex: (latex: string) => void;
}

// Utility function to merge classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const MathInput = forwardRef<MathInputHandle, MathInputProps>(({
  value = '',
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder = 'Type math here...',
  disabled = false,
  className = '',
  autoFocus = false
}, ref) => {
  const mathFieldRef = useRef<HTMLSpanElement>(null);
  const mathFieldInstance = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => mathFieldInstance.current?.focus(),
    blur: () => mathFieldInstance.current?.blur(),
    latex: () => mathFieldInstance.current?.latex() || '',
    text: () => mathFieldInstance.current?.text() || '',
    clear: () => mathFieldInstance.current?.latex(''),
    setLatex: (latex: string) => mathFieldInstance.current?.latex(latex)
  }));

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeMathField = () => {
      if (!mounted || !mathFieldRef.current || !window.MQ) return;

      try {
        console.log('🔧 Initializing MathQuill field...');
        
        const config = {
          autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta lambda mu nu xi rho sigma tau phi chi psi omega',
          autoOperatorNames: 'sin cos tan sec csc cot sinh cosh tanh ln log exp lim inf max min',
          restrictMismatchedBrackets: true,
          supSubsRequireOperand: true,
          charsThatBreakOutOfSupSub: '+-=<>',
          autoSubscriptNumerals: true,
          
          handlers: {
            edit: function(mathField: any) {
              try {
                const latex = mathField.latex();
                const text = mathField.text();
                console.log('📐 Math changed:', { latex, text });
                onChange?.(latex, text);
              } catch (error) {
                console.warn('Error in edit handler:', error);
              }
            },
            
            enter: function(mathField: any) {
              console.log('⏎ Enter pressed');
              onKeyDown?.('Enter', new KeyboardEvent('keydown', { key: 'Enter' }));
            },
            
            upOutOf: function(mathField: any) {
              onKeyDown?.('ArrowUp', new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            },
            
            downOutOf: function(mathField: any) {
              onKeyDown?.('ArrowDown', new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            }
          }
        };

        // Initialize MathQuill field
        mathFieldInstance.current = window.MQ.MathField(mathFieldRef.current, config);
        
        // Set initial value
        if (value) {
          mathFieldInstance.current.latex(value);
        }

        // Add focus/blur event listeners
        if (mathFieldRef.current) {
          mathFieldRef.current.addEventListener('focusin', () => {
            console.log('📐 Math field focused');
            onFocus?.();
          });

          mathFieldRef.current.addEventListener('focusout', () => {
            console.log('📐 Math field blurred');
            onBlur?.();
          });
        }

        // Auto focus if requested
        if (autoFocus) {
          setTimeout(() => {
            mathFieldInstance.current?.focus();
          }, 200);
        }

        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
          console.log('✅ MathQuill field initialized successfully!');
        }

      } catch (error) {
        console.error('❌ Error initializing MathQuill field:', error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    const loadMathQuill = () => {
      if (!mounted) return;
      
      console.log('🔄 Loading MathQuill...');
      
      // Check if MathQuill is already available
      if (window.MQ) {
        console.log('✅ MathQuill already available');
        initializeMathField();
        return;
      }

      // Check if already loading
      const existingScript = document.querySelector('script[src*="mathquill"]');
      if (existingScript) {
        console.log('⏳ MathQuill already loading, waiting...');
        
        const checkInterval = setInterval(() => {
          if (!mounted) {
            clearInterval(checkInterval);
            return;
          }
          
          if (window.MathQuill && window.$) {
            clearInterval(checkInterval);
            window.MQ = window.MathQuill.getInterface(2);
            console.log('✅ MathQuill ready from existing script');
            initializeMathField();
          }
        }, 200);
        
        timeoutId = setTimeout(() => {
          clearInterval(checkInterval);
          if (mounted && !window.MQ) {
            console.error('❌ MathQuill failed to load within timeout');
            setHasError(true);
            setIsLoading(false);
          }
        }, 15000);
        
        return;
      }

      // Load jQuery first, then MathQuill
      console.log('📦 Loading jQuery...');
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
      
      jqueryScript.onload = () => {
        console.log('✅ jQuery loaded, now loading MathQuill...');
        
        const mathquillScript = document.createElement('script');
        mathquillScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js';
        
        mathquillScript.onload = () => {
          if (mounted) {
            // Wait for MathQuill to fully initialize
            setTimeout(() => {
              if (window.MathQuill && window.$) {
                window.MQ = window.MathQuill.getInterface(2);
                console.log('✅ MathQuill loaded from CDN');
                initializeMathField();
              } else {
                console.error('❌ MathQuill object not found after load');
                setHasError(true);
                setIsLoading(false);
              }
            }, 200);
          }
        };
        
        mathquillScript.onerror = (error) => {
          console.error('❌ Failed to load MathQuill script:', error);
          if (mounted) {
            setHasError(true);
            setIsLoading(false);
          }
        };
        
        document.head.appendChild(mathquillScript);
      };
      
      jqueryScript.onerror = (error) => {
        console.error('❌ Failed to load jQuery:', error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      };
      
      document.head.appendChild(jqueryScript);
    };

    // Start loading with slight delay
    setTimeout(loadMathQuill, 100);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (mathFieldInstance.current) {
        try {
          mathFieldInstance.current = null;
        } catch (error) {
          console.warn('Error cleaning up MathQuill:', error);
        }
      }
    };
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (mathFieldInstance.current && isInitialized) {
      const currentLatex = mathFieldInstance.current.latex();
      if (currentLatex !== value) {
        try {
          mathFieldInstance.current.latex(value || '');
        } catch (error) {
          console.warn('Error updating MathQuill value:', error);
        }
      }
    }
  }, [value, isInitialized]);

  // Error fallback - regular input
  if (hasError) {
    console.log('📝 Using fallback input mode');
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value, e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full border-0 bg-transparent focus:ring-0 focus:outline-none py-3 px-3",
          "placeholder-gray-400 text-gray-900",
          disabled && "bg-gray-50 text-gray-500",
          className
        )}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onKeyDown?.('Enter', e.nativeEvent);
          } else if (e.key === 'ArrowUp') {
            onKeyDown?.('ArrowUp', e.nativeEvent);
          } else if (e.key === 'ArrowDown') {
            onKeyDown?.('ArrowDown', e.nativeEvent);
          }
        }}
      />
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* MathQuill field container */}
      <span
        ref={mathFieldRef}
        className={cn(
          "mathquill-field",
          disabled && "opacity-50 pointer-events-none"
        )}
        style={{
          display: 'inline-block',
          minHeight: '40px',
          width: '100%',
          padding: '8px 12px',
          fontSize: '16px',
          lineHeight: '1.5',
          fontFamily: 'inherit',
          border: 'none',
          outline: 'none',
          background: 'transparent'
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded text-sm text-gray-600 z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Loading math editor...</span>
          </div>
        </div>
      )}
      
      {/* Placeholder when empty */}
      {isInitialized && !value && (
        <div 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm"
          style={{ zIndex: 1 }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
});

MathInput.displayName = 'MathInput';
export default MathInput;