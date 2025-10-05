import { useEffect } from 'react';

interface QuestionSuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number; // milliseconds, default 3000
}

export default function QuestionSuccessNotification({ 
  isOpen, 
  onClose,
  autoCloseDelay = 3000 
}: QuestionSuccessNotificationProps) {
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoCloseDelay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Notification Card */}
      <div 
        className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-8 mx-4 max-w-md transform animate-in zoom-in-95 duration-300 pointer-events-auto"
        onClick={onClose}
      >
        {/* Success Icon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Message */}
          <h2 className="text-3xl font-black text-white mb-2">
            HOORAY! 🎉
          </h2>
          <p className="text-xl font-bold text-white/90">
            YOU GOT IT RIGHT!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-linear"
              style={{
                animation: `shrink ${autoCloseDelay}ms linear forwards`,
              }}
            />
          </div>
          <p className="text-center text-white/70 text-xs mt-2">
            Moving to next question...
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
