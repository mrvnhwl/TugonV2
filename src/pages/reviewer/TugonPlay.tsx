import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionBox from "../../components/tugon/question-system/QuestionBox";
import CategoryQuestion from "../../components/tugon/question-system/CategoryQuestion";
import { defaultTopics } from "../../components/data/question";
import { getAnswerForQuestion, answersByTopicAndCategory } from "../../components/data/answers";
import AnswerWizard, { Step, WizardStep } from "../../components/tugon/input-system/AnswerWizard";
import HintBubble from "../../components/tugon/hint-system/HintBubble";
import Character from "../../components/tugon/hint-system/Character";
import { Heading, SubHeading, Text, Small } from "../../components/Typography";
import AttemptVisualizer from "../../components/tugon/AttemptVisualizer";
import { UserAttempt } from "../../components/tugon/input-system/UserInput";
import { useProgress } from "../../components/tugon/services/useProgress";
import SuccessModal from "../../components/tugon/successModal"; // Add this import

const FALLBACK_HINT_TEXT = "Try isolating y. Start by substituting x = 2.";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAttempts, setUserAttempts] = useState<UserAttempt[]>([]);
  const idleTimer = useRef<number | null>(null);
  
  // Add progress tracking
  const { recordAttempt, getQuestionProgress, progress } = useProgress();
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  
  // Add success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successStats, setSuccessStats] = useState<{
    attempts: number;
    timeSpent: number;
    isFirstTime: boolean;
  } | null>(null);

  // Extract URL parameters
  const topicId = Number(searchParams.get("topic")) || 1;
  const categoryId = Number(searchParams.get("category")) || 1;
  const questionId = Number(searchParams.get("question")) || 1;
  const legacyQ = Number(searchParams.get("q"));
  const finalCategoryId = legacyQ || categoryId;

  // Get current question progress
  const currentQuestionProgress = getQuestionProgress(topicId, finalCategoryId, questionId);

  // Initialize session start time when question changes
  useEffect(() => {
    setSessionStartTime(Date.now());
    setAttempts(0); // Reset attempts counter for new question
    setIsCorrect(null); // Reset correct state
    console.log(`🎯 Starting question: Topic ${topicId}, Category ${finalCategoryId}, Question ${questionId}`);
    
    // ADD THESE RESETS FOR USER INPUT:
  setUserAttempts([]); // Reset user attempts

    // Log current progress for this question
    if (currentQuestionProgress) {
      console.log('📊 Current question progress:', {
        completed: currentQuestionProgress.isCompleted,
        attempts: currentQuestionProgress.attempts,
        correctAnswers: currentQuestionProgress.correctAnswers,
        timeSpent: Math.round(currentQuestionProgress.timeSpent / 60) + ' minutes'
      });
    } else {
      console.log('📊 No previous progress for this question');
    }
  }, [topicId, finalCategoryId, questionId]);

  // Get the guide_text from question.ts based on current question
  const getGuideText = () => {
    const topic = defaultTopics.find(t => t.id === topicId);
    if (topic) {
      const category = topic.level.find(q => q.category_id === finalCategoryId);
      if (category) {
        const specificQuestion = category.given_question.find(gq => gq.question_id === questionId);
        return specificQuestion?.guide_text || FALLBACK_HINT_TEXT;
      }
    }
    return FALLBACK_HINT_TEXT;
  };

  // Initialize hint with guide_text from current question
  const [hint, setHint] = useState(getGuideText());

  // Update hint when URL parameters change
  useEffect(() => {
    setHint(getGuideText());
  }, [topicId, finalCategoryId, questionId]);

  // Get expected answers using the new structure
  const getExpectedAnswers = () => {
    const topic = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
    if (!topic) return undefined;
    
    const category = topic[finalCategoryId as keyof typeof topic];
    if (!category || !Array.isArray(category)) return undefined;
    
    return category; // Return the entire category array of PredefinedAnswer[]
  };

  const expectedAnswers = getExpectedAnswers();
  const topic = defaultTopics.find((t) => t.id === topicId);
  const topicName = topic?.name || "Question";

  // Get current question's expected answer for validation
  const getCurrentExpectedAnswer = () => {
    return getAnswerForQuestion(topicId, finalCategoryId, questionId);
  };

  const steps: Step[] = [
    { id: "s1", label: "Short answer", placeholder: "Enter a single-line answer" },
    { id: "m1", label: "Explain your steps", placeholder: "Explain in detail", rows: 4 },
    { id: "g1", label: "Graph your function" },
  ];

  const resetIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!isCorrect) {
        // Use dynamic guide text for idle hint as well
        setHint(`Stuck? ${getGuideText()}`);
      }
    }, 20000);
  };

  useEffect(() => {
    resetIdle();
    return () => { if (idleTimer.current) window.clearTimeout(idleTimer.current); };
  }, []);

  // Enhanced attempt handler with progress tracking and success modal
  const handleAttempt = ({ correct }: { correct: boolean }) => {
  const currentTime = Date.now();
  const timeSpent = Math.round((currentTime - sessionStartTime) / 1000); // in seconds
  const sessionAttempts = attempts + 1;
  
  setAttempts(sessionAttempts);
  setIsCorrect(correct);
  
  // Check if this is first time completing this question
  const wasAlreadyCompleted = currentQuestionProgress?.isCompleted || false;
  
  // Record the attempt in progress system
  recordAttempt({
    topicId,
    categoryId: finalCategoryId,
    questionId,
    isCorrect: correct,
    timeSpent,
    score: correct ? 100 : 0
  });

  // Console logging for monitoring
  console.log('🎯 Attempt recorded:', {
    topicId,
    categoryId: finalCategoryId,
    questionId,
    correct,
    timeSpent: timeSpent + 's',
    sessionAttempts
  });

  if (correct) {
    console.log('✅ Question completed successfully!');
    
    // Prepare success modal data
    const modalStats = {
      attempts: sessionAttempts,
      timeSpent,
      isFirstTime: !wasAlreadyCompleted
    };
    
    console.log('🎊 Showing success modal with stats:', modalStats);
    
    // Set modal data and show modal
    setSuccessStats(modalStats);
    setShowSuccessModal(true);
    
    setHint("Great job! 🎉 You solved it correctly.");
    return;
  }
  
  // Progressive hints for wrong answers
  const baseGuideText = getGuideText();
  setHint(() => {
    if (attempts === 0) return `Hint: ${baseGuideText}`;
    if (attempts === 1) return `Try again: ${baseGuideText}`;
    return `Keep trying: ${baseGuideText}`;
  });
  resetIdle();
};

  // Navigation helpers for modal
  const handleNextQuestion = () => {
    // Find next question in sequence
    const topic = defaultTopics.find(t => t.id === topicId);
    if (topic) {
      const category = topic.level.find(c => c.category_id === finalCategoryId);
      if (category) {
        const currentQuestionIndex = category.given_question.findIndex(q => q.question_id === questionId);
        const nextQuestion = category.given_question[currentQuestionIndex + 1];
        
        if (nextQuestion) {
          // Go to next question in same category
          navigate(`/tugonplay?topic=${topicId}&category=${finalCategoryId}&question=${nextQuestion.question_id}`);
        } else {
          // Find next category
          const currentCategoryIndex = topic.level.findIndex(c => c.category_id === finalCategoryId);
          const nextCategory = topic.level[currentCategoryIndex + 1];
          
          if (nextCategory && nextCategory.given_question.length > 0) {
            // Go to first question of next category
            navigate(`/tugonplay?topic=${topicId}&category=${nextCategory.category_id}&question=${nextCategory.given_question[0].question_id}`);
          } else {
            // No more questions, go back to TugonSense
            navigate("/tugonsense");
          }
        }
      }
    }
    setShowSuccessModal(false);
  };

  const handleBackToSense = () => {
    setShowSuccessModal(false);
    navigate("/tugonsense");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Reset session time for potential next attempt
    setSessionStartTime(Date.now());
  };

  const handleSubmit = (finalSteps: WizardStep[]) => {
    console.log("Wizard steps:", finalSteps);
    console.log("Current expected answer:", getCurrentExpectedAnswer());
    // You can replace this with actual submission logic
  };

  const handleIndexChange = (newIndex: number) => {
    // Handle step changes if needed
  };

  const handleAttemptUpdate = (attempts: UserAttempt[]) => {
    setUserAttempts(attempts);
    console.log('🎯 TugonPlay received attempts:', attempts);
  };

  // Progress monitoring component
  const ProgressMonitor = () => {
    if (!currentQuestionProgress) return null;

    return (
      <div className="fixed top-20 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border text-xs z-40">
        <div className="text-gray-600 font-medium mb-1">Progress Monitor</div>
        <div className="space-y-1">
          <div>Attempts: {currentQuestionProgress.attempts}</div>
          <div>Correct: {currentQuestionProgress.correctAnswers}</div>
          <div>Status: {currentQuestionProgress.isCompleted ? '✅ Complete' : '⏳ In Progress'}</div>
          <div>Time: {Math.round(currentQuestionProgress.timeSpent / 60)}m</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Progress Monitor - Development only */}
      <ProgressMonitor />
    
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onNextQuestion={handleNextQuestion}
        onBackToSense={handleBackToSense}
        questionInfo={{
          topicId,
          categoryId: finalCategoryId,
          questionId
        }}
        stats={successStats}
      />

      {/* Navbar - Responsive */}
      <div className="h-16 sm:h-16 bg-violet-600 flex items-center justify-between px-3 sm:px-4 flex-shrink-0">
        <SubHeading className="text-white font-semibold text-sm sm:text-base truncate">
          TugonPlay {currentQuestionProgress?.isCompleted && "✅"}
        </SubHeading>
        <button
          onClick={() => navigate("/tugonsense")}
          className="text-white bg-transparent border-none text-lg sm:text-xl p-1 hover:bg-white/10 rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* MOBILE LAYOUT (sm and below) */}
      <div className="flex-1 overflow-y-auto px-2 py-3 sm:hidden">
        <div className="w-full max-w-full mx-auto">
          {/* Mobile Question Section */}
          <div className="mb-2">
            <CategoryQuestion 
              topicId={topicId}
              categoryId={finalCategoryId}
            />
          </div>
          
          {/* Mobile: QuestionBox with floating Character */}
          <div className="mb-3 relative" id="question-box-container-mobile">
            {/* Question Box - Full width, no flex constraints */}
            <QuestionBox 
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
              title={topicName}
              fallbackText="Question not found."
            />
            
            {/* Character - Floating to the right of QuestionBox */}
            <CharacterPositionedMobile />
          </div>
          
          {/* Mobile: Answer Wizard - Full width */}
          <div className="mb-3" id="answer-wizard-container-mobile">
            <AnswerWizard
               key={`mobile-wizard-${topicId}-${finalCategoryId}-${questionId}`} // ADD THIS KEY
              steps={steps}
              onSubmit={handleSubmit}
              onIndexChange={handleIndexChange}
              expectedAnswers={expectedAnswers}
              onValidationResult={(type) => {
                handleAttempt({ correct: type === "correct" });
              }}
              onAnswerChange={resetIdle}
              onAttemptUpdate={handleAttemptUpdate}
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (sm and above) */}
      <div className="hidden sm:flex flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg mx-auto">
          {/* Desktop Question Section */}
          <div className="mb-3 sm:mb-4">
            <CategoryQuestion 
              topicId={topicId}
              categoryId={finalCategoryId}
            />
          </div>
          
          <div className="mb-4 sm:mb-6">
            <QuestionBox 
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
              title={topicName}
              fallbackText="Question not found."
            />
          </div>
          
          {/* Desktop Answer Wizard */}
          <div className="mb-4 sm:mb-6" id="answer-wizard-container">
            <AnswerWizard
               key={`desktop-wizard-${topicId}-${finalCategoryId}-${questionId}`} 
              steps={steps}
              onSubmit={handleSubmit}
              onIndexChange={handleIndexChange}
              expectedAnswers={expectedAnswers}
              onValidationResult={(type) => {
                handleAttempt({ correct: type === "correct" });
              }}
              onAnswerChange={resetIdle}
              onAttemptUpdate={handleAttemptUpdate}
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
            />
          </div>
        </div>
      </div>

      {/* Attempt Visualizer - Floating Panel */}
      <AttemptVisualizer 
        attempts={userAttempts} 
        className="animate-in slide-in-from-right duration-300"
      />

      {/* Desktop Character - Only shows on desktop */}
      <CharacterPositionedDesktop />
    </div>
  );
}

// Mobile Character positioning (only for mobile)
function CharacterPositionedMobile() {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 640); // below sm breakpoint
      
      if (screenWidth < 640) {
        // Target the actual QuestionBox element, not just the container
        const questionBoxElement = document.querySelector('#question-box-container-mobile .bg-white, #question-box-container-mobile .border, #question-box-container-mobile > div');
        
        if (questionBoxElement) {
          const rect = questionBoxElement.getBoundingClientRect();
          
          setPosition({
            top: `${rect.top + 35}px`, // Position near the top of QuestionBox
            left: `${rect.right - 60}px` // Move more to the left - overlap by 40px instead of 20px
          });
        }
      }
    };

    // Update position initially and on resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    // Use a slight delay to ensure QuestionBox is rendered
    const timer = setTimeout(updatePosition, 100);

    // Clean up
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timer);
    };
  }, []);

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <div 
      className="fixed z-50 transition-all duration-300 sm:hidden"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Character 
        name="Tugon" 
        className="w-12 h-12 drop-shadow-lg"
      />
    </div>
  );
}

// Desktop Character positioning (only for sm and above)
function CharacterPositionedDesktop() {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const screenWidth = window.innerWidth;
      setIsDesktop(screenWidth >= 640); // sm breakpoint
      
      if (screenWidth >= 640) {
        const container = document.getElementById('answer-wizard-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          
          setPosition({
            top: `${rect.top + rect.height / 2}px`,
            left: `${rect.right + 16}px`
          });
        }
      }
    };

    // Update position initially and on resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    // Clean up
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  // Only render on desktop
  if (!isDesktop) return null;

  return (
    <div 
      className="fixed z-50 transform -translate-y-1/2 transition-all duration-300"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Character 
        name="Tugon" 
        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
      />
    </div>
  );
}