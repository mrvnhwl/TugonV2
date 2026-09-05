import React, { useEffect, useRef } from 'react';
import 'mathlive';

// Define the math-field element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': any;
    }
  }
}

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  placeholder = "Enter math...",
  className = ""
}) => {
  const mfRef = useRef<any>(null);

  useEffect(() => {
    if (mfRef.current) {
      // Set initial value if it differs from current
      if (mfRef.current.value !== value) {
        mfRef.current.value = value;
      }
    }
  }, [value]);

  const handleInput = (e: any) => {
    onChange(e.target.value);
  };

  const openKeyboard = () => {
    if (mfRef.current) {
      // MathLive's built-in method to show the virtual keyboard
      mfRef.current.showVirtualKeyboard();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <math-field
          ref={mfRef}
          onInput={handleInput}
          placeholder={placeholder}
          className="w-full border rounded-md p-2 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[45px] bg-white"
        />
        <button
          type="button"
          onClick={openKeyboard}
          className="absolute right-2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
          title="Open Math Pad"
        >
          <span className="text-lg">⌨️</span>
        </button>
      </div>
    </div>
  );
};
