import React from 'react';
import { convertLatexToAscii, createScaffold } from '@/utils/latexToAscii';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInput: string;
  correctAnswer: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  userInput,
  correctAnswer,
}) => {
  if (!isOpen) return null;

  const userInputAscii = convertLatexToAscii(userInput);
  const correctAnswerAscii = convertLatexToAscii(correctAnswer);
  const scaffoldHint = createScaffold(correctAnswer);

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
            <div className="bg-white rounded-md p-3 font-mono text-base text-gray-800 border border-red-200">
              {userInputAscii || <span className="text-gray-400 italic">Empty</span>}
            </div>
          </div>

          {/* Section 2: Expected Format */}
          <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
              <span className="mr-2">✅</span>
              Expected Format:
            </h3>
            <div className="bg-white rounded-md p-3 font-mono text-base text-gray-800 border border-green-200">
              {correctAnswerAscii}
            </div>
          </div>

          {/* Section 3: Scaffold Hint */}
          <div className="bg-teal-50 border-l-4 border-[#327373] rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-[#327373] mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Try This Scaffold:
            </h3>
            <div className="bg-white rounded-md p-3 font-mono text-base text-gray-800 border border-teal-200">
              {scaffoldHint}
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
