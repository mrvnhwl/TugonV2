import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import color from '../../styles/color';

type FeedbackStatus = 'correct' | 'incorrect';

interface FeedbackPanelProps {
  status: FeedbackStatus | null;
  hint?: string;
  onClose: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ status, hint, onClose }) => {
  if (!status) return null;

  const isCorrect = status === 'correct';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className={`fixed bottom-0 left-0 right-0 z-50 p-6 ${
          isCorrect ? 'bg-[#58cc02] text-white' : 'bg-[#ff4b4b] text-white'
        } border-t-8 ${isCorrect ? 'border-[#46a302]' : 'border-[#d33c3c]'}`}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner ${isCorrect ? 'bg-white/20' : 'bg-white/20'}`}>
              {isCorrect ? '🎉' : '❌'}
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-black tracking-tight">
                {isCorrect ? 'Amazing!' : 'Not quite right'}
              </div>
              {!isCorrect && hint && (
                <div className="text-lg opacity-90 font-medium leading-tight">
                  {hint}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className={`px-10 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg border-b-4 ${
              isCorrect
                ? 'bg-white text-[#58cc02] border-gray-200 hover:bg-gray-100'
                : 'bg-white text-[#ff4b4b] border-gray-200 hover:bg-gray-100'
            }`}
          >
            {isCorrect ? 'Continue' : 'Got it'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackPanel;
