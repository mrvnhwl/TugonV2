import React, { useEffect, useRef } from 'react';
import { convertLatexToAscii, createScaffold } from '@/utils/latexToAscii';
import { stripColorCommands } from '../input-system/mathColorComparison';
import { convertLatexToReadableText } from '@/utils/latexToReadableText';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInput: string;
  correctAnswer: string;
}

/**
 * Clean LaTeX string by:
 * 1. Stripping all \textcolor{color}{content} commands
 * 2. Removing color words (red, green, teal, etc.)
 * 3. Removing extra braces and whitespace
 */
function cleanLatexForDisplay(latex: string): string {
  if (!latex) return '';
  
  // Step 1: Strip all color commands
  let cleaned = stripColorCommands(latex);
  
  // Step 2: Remove any remaining color-related keywords
  const colorKeywords = ['red', 'green', 'blue', 'yellow', 'teal', 'orange', 'purple', 'pink', 'gray', 'black'];
  colorKeywords.forEach(color => {
    // Remove standalone color words
    cleaned = cleaned.replace(new RegExp(`\\b${color}\\b`, 'gi'), '');
  });
  
  // Step 3: Remove "textcolor" word if it somehow remains
  cleaned = cleaned.replace(/textcolor/gi, '');
  
  // Step 4: Remove empty braces and extra whitespace
  cleaned = cleaned.replace(/\{\s*\}/g, ''); // Remove empty {}
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  userInput,
  correctAnswer,
}) => {
  const userInputMathRef = useRef<any>(null);
  const correctAnswerMathRef = useRef<any>(null);
  const scaffoldMathRef = useRef<any>(null);

  // Clean inputs before processing
  const cleanedUserInput = cleanLatexForDisplay(userInput);
  const cleanedCorrectAnswer = cleanLatexForDisplay(correctAnswer);

  // Generate ASCII versions for fallback
  const userInputAscii = convertLatexToAscii(cleanedUserInput);
  const correctAnswerAscii = convertLatexToAscii(cleanedCorrectAnswer);
  const scaffoldHint = createScaffold(cleanedCorrectAnswer);

  // NEW: Generate readable text versions (convert LaTeX symbols to words)
  const userInputReadable = convertLatexToReadableText(cleanedUserInput);
  const correctAnswerReadable = convertLatexToReadableText(cleanedCorrectAnswer);
  const scaffoldReadable = convertLatexToReadableText(scaffoldHint);

  // Initialize MathLive read-only fields
  useEffect(() => {
    if (!isOpen) return;

    const loadMathLive = async () => {
      try {
        const { MathfieldElement } = await import('mathlive');

        // User Input MathField
        if (userInputMathRef.current && cleanedUserInput) {
          const mf1 = new MathfieldElement();
          mf1.value = cleanedUserInput;
          mf1.readOnly = true;
          mf1.style.fontSize = '18px';
          mf1.style.padding = '8px';
          mf1.style.border = '1px solid #fecaca'; // red-200
          mf1.style.borderRadius = '6px';
          mf1.style.backgroundColor = '#ffffff';
          
          userInputMathRef.current.innerHTML = '';
          userInputMathRef.current.appendChild(mf1);
        }

        // Correct Answer MathField
        if (correctAnswerMathRef.current && cleanedCorrectAnswer) {
          const mf2 = new MathfieldElement();
          mf2.value = cleanedCorrectAnswer;
          mf2.readOnly = true;
          mf2.style.fontSize = '18px';
          mf2.style.padding = '8px';
          mf2.style.border = '1px solid #bbf7d0'; // green-200
          mf2.style.borderRadius = '6px';
          mf2.style.backgroundColor = '#ffffff';
          
          correctAnswerMathRef.current.innerHTML = '';
          correctAnswerMathRef.current.appendChild(mf2);
        }

        // Scaffold MathField
        if (scaffoldMathRef.current && scaffoldHint) {
          const mf3 = new MathfieldElement();
          mf3.value = scaffoldHint;
          mf3.readOnly = true;
          mf3.style.fontSize = '18px';
          mf3.style.padding = '8px';
          mf3.style.border = '1px solid #99f6e4'; // teal-200
          mf3.style.borderRadius = '6px';
          mf3.style.backgroundColor = '#ffffff';
          
          scaffoldMathRef.current.innerHTML = '';
          scaffoldMathRef.current.appendChild(mf3);
        }
      } catch (error) {
        console.warn('MathLive not available, using ASCII fallback:', error);
      }
    };

    loadMathLive();
  }, [isOpen, cleanedUserInput, cleanedCorrectAnswer, scaffoldHint]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with theme color #327373 */}
        <div className="bg-gradient-to-r from-[#397F85] to-[#327373] px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            💡 Let's Review This Step Together
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Intro Message */}
          <p className="text-gray-700 text-base">
            It looks like you're struggling with this step. Let's break it down:
          </p>

          {/* Section 1: User Input */}
          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
              <span className="mr-2">👉</span>
              Your Input:
            </h3>
            {/* MathLive Rendering */}
            <div ref={userInputMathRef} className="bg-white rounded-md p-3 border border-red-200 mb-2">
              {/* Fallback to ASCII if MathLive fails to load */}
              {userInputAscii || <span className="text-gray-400 italic">Empty</span>}
            </div>
            {/* Readable text version */}
            <div className="text-xs text-gray-600 italic px-2">
              📝 In words: <span className="font-medium">{userInputReadable || 'Empty'}</span>
            </div>
          </div>

          {/* Section 2: Expected Format */}
          <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
              <span className="mr-2">✅</span>
              Expected Format:
            </h3>
            {/* MathLive Rendering */}
            <div ref={correctAnswerMathRef} className="bg-white rounded-md p-3 border border-green-200 mb-2">
              {/* Fallback to ASCII if MathLive fails to load */}
              {correctAnswerAscii}
            </div>
            {/* Readable text version */}
            <div className="text-xs text-gray-600 italic px-2">
              📝 In words: <span className="font-medium">{correctAnswerReadable}</span>
            </div>
          </div>

          {/* Section 3: Scaffold Hint */}
          <div className="bg-teal-50 border-l-4 border-[#327373] rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-[#327373] mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Try This Scaffold:
            </h3>
            {/* MathLive Rendering */}
            <div ref={scaffoldMathRef} className="bg-white rounded-md p-3 border border-teal-200 mb-2">
              {/* Fallback to ASCII if MathLive fails to load */}
              {scaffoldHint}
            </div>
            {/* Readable text version */}
            <div className="text-xs text-gray-600 italic px-2 mb-2">
              📝 In words: <span className="font-medium">{scaffoldReadable}</span>
            </div>
            <p className="text-xs text-[#327373] mt-2 italic">
              Fill in the blank (___) to complete the expression
            </p>
          </div>

          {/* Helpful Tips */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              📚 Tips:
            </h4>
            <ul className="text-sm text-yellow-900 space-y-1 list-disc list-inside">
              <li>Make sure to include all operators (+, -, *, /)</li>
              <li>Check your parentheses and brackets</li>
              <li>Verify your numbers are correct</li>
              <li>Follow the format shown in "Expected Format"</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#327373] hover:bg-[#2a615a] text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Got It! 👍
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
