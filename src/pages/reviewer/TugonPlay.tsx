import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionBox from "../../components/tugon/question-system/QuestionBox";
import CategoryQuestion from "../../components/tugon/question-system/CategoryQuestion";
import { defaultTopics } from "../../components/data/questions/index";
import { getAnswerForQuestion, answersByTopicAndCategory } from "../../components/data/answers/index";
import AnswerWizard, { Step, WizardStep } from "../../components/tugon/input-system/AnswerWizard";
import HintBubble from "../../components/tugon/hint-system/HintBubble";
import Character from "../../components/tugon/hint-system/Character";
import QuestionTemplate from '../../components/tugon/template/QuestionTemplate.tsx';
import { Heading, SubHeading, Text, Small } from "../../components/Typography";
import AttemptVisualizer from "../../components/tugon/AttemptVisualizer";
import Feedback from "../../components/tugon/hint-system/feedback";
import { UserAttempt } from "../../components/tugon/input-system/UserInput";
import { useProgress } from "../../components/tugon/services/useProgress";
import { progressService } from "../../components/tugon/services/progressServices";
import QuestionSuccessNotification from "../../components/tugon/QuestionSuccessNotification";
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Add success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQuickNotification, setShowQuickNotification] = useState(false);
  const [categoryStats, setCategoryStats] = useState<{
    categoryCompleted: boolean;
    totalQuestions: number;
    questionsDetails: Array<{
      questionId: number;
      attempts: number;
      timeSpent: number;
      colorCodedHintsUsed: number;
      shortHintMessagesUsed: number;
    }>;
    totalTimeSpent: number;
    totalAttempts: number;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  // Extract URL parameters
  const topicId = Number(searchParams.get("topic")) || 1;
  const categoryId = Number(searchParams.get("category")) || 1;
  const questionId = Number(searchParams.get("question")) || 1;
  const legacyQ = Number(searchParams.get("q"));
  const finalCategoryId = legacyQ || categoryId;

  // Get current question progress
  const currentQuestionProgress = getQuestionProgress(topicId, finalCategoryId, questionId);
  // For MathLive re-rendering

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
  const expectedAnswers = useMemo(() => {
  const topic = answersByTopicAndCategory[topicId as keyof typeof answersByTopicAndCategory];
  if (!topic) return undefined;
  
  const category = topic[finalCategoryId as keyof typeof topic];
  if (!category || !Array.isArray(category)) return undefined;
  
  // FIXED: Find the specific question by questionId and return it as array
  const specificAnswer = category.find(answer => answer.questionId === questionId);
  return specificAnswer ? [specificAnswer] : undefined;
}, [topicId, finalCategoryId, questionId]); // ← Add proper dependencies



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
  
  // Record the attempt in progress system (TODO: Add hint tracking later)
  recordAttempt({
    topicId,
    categoryId: finalCategoryId,
    questionId,
    isCorrect: correct,
    timeSpent,
    score: correct ? 100 : 0,
    // TODO: Track actual hints used from UI
    colorCodedHintsUsed: 0,
    shortHintMessagesUsed: 0
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
    
    // Check if category is completed
    const isCategoryComplete = progressService.isCategoryCompleted(topicId, finalCategoryId);
    
    console.log('🔍 Checking category completion:', {
      topicId,
      categoryId: finalCategoryId,
      isComplete: isCategoryComplete
    });
    
    if (isCategoryComplete) {
      // Category completed - show full modal with all question details
      console.log('🎊 CATEGORY COMPLETED! Showing full success modal');
      
      const questionDetails = progressService.getCategoryQuestionDetails(topicId, finalCategoryId);
      const totalTime = questionDetails.reduce((sum: number, q: any) => sum + q.timeSpent, 0);
      const totalAttempts = questionDetails.reduce((sum: number, q: any) => sum + q.attempts, 0);
      
      const stats = {
        categoryCompleted: true,
        totalQuestions: questionDetails.length,
        questionsDetails: questionDetails.map(q => ({
          questionId: q.questionId,
          attempts: q.attempts,
          timeSpent: q.timeSpent,
          colorCodedHintsUsed: q.colorCodedHintsUsed || 0,
          shortHintMessagesUsed: q.shortHintMessagesUsed || 0,
        })),
        totalTimeSpent: totalTime,
        totalAttempts
      };
      
      console.log('📊 Category stats:', stats);
      
      setCategoryStats(stats);
      setShowSuccessModal(true);
    } else {
      // Question completed but category not done - show quick notification
      console.log('✨ Question correct! Showing quick notification and moving to next...');
      setShowQuickNotification(true);
      
      // Auto-navigate to next question after notification
      setTimeout(() => {
        handleNextQuestion();
      }, 3000);
    }
    
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
    setCurrentStepIndex(newIndex); 
    // Handle step changes if needed
  };
  //for feedback
  useEffect(() => {
  setSessionStartTime(Date.now());
  setAttempts(0);
  setIsCorrect(null);
  setUserAttempts([]);
  setCurrentStepIndex(0); // ← ADD THIS LINE
  
  console.log(`🎯 Starting question: Topic ${topicId}, Category ${finalCategoryId}, Question ${questionId}`);
  
  // ... rest of the useEffect
}, [topicId, finalCategoryId, questionId]);
  const handleAttemptUpdate = (attempts: UserAttempt[]) => {
    setUserAttempts(attempts);
    console.log('🎯 TugonPlay received attempts:', attempts);
  };

  // Progress monitoring component
  const ProgressMonitor = () => {
    if (!currentQuestionProgress) return null;

    {/* Progress Monitor Content 
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
    );*/}
  };

  return (
  <div className="h-screen flex flex-col overflow-hidden bg-white">
    {/* Progress Monitor - Development only */}
    <ProgressMonitor />
  
    {/* Quick Success Notification - Shows for individual question completion */}
    <QuestionSuccessNotification
      isOpen={showQuickNotification}
      onClose={() => setShowQuickNotification(false)}
      autoCloseDelay={3000}
    />
  
    {/* Success Modal - Shows only when category is completed */}
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
      categoryStats={categoryStats}
    />

    {/* MOBILE LAYOUT (sm and below) */}
    <div className="flex-1 overflow-y-auto sm:hidden">
      {/* Mobile: Navbar + CategoryQuestion Combined */}
      <div className="bg-gradient-to-r from-[#397F85] to-[#327373]">
        {/* Navbar */}
        <div className="h-16 flex items-center justify-between px-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <SubHeading className="text-white font-bold text-lg">
              TugonPlay {currentQuestionProgress?.isCompleted && "✅"}
            </SubHeading>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span>Q{questionId}</span>
              <div className="w-1 h-4 bg-white/30 rounded-full"></div>
              <span>Topic {topicId}</span>
            </div>
            
            <button
              onClick={() => navigate("/tugonsense")}
              className="text-white bg-white/10 hover:bg-white/20 border-none text-xl p-2 rounded-lg transition-all duration-200 hover:scale-105"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* CategoryQuestion - Integrated with navbar background - WIDER */}
        <div className="px-2 pb-6">
          <CategoryQuestion 
            topicId={topicId}
            categoryId={finalCategoryId}
            questionId={questionId}
          />
        </div>
      </div>
      
      {/* Mobile: QuestionTemplate with margin - LESS WIDE, MORE HEIGHT */}
      <div className="px-8 py-8 min-h-[60vh]">
        <QuestionTemplate
          key={`mobile-template-${topicId}-${finalCategoryId}-${questionId}`}
          topicId={topicId}
          categoryId={finalCategoryId}
          questionId={questionId}
          expectedAnswers={expectedAnswers}
          onValidationResult={(type, currentStep) => {
            console.log(`📱 Mobile onValidationResult callback:`, { type, currentStep });
            // Only trigger handleAttempt when all steps are complete (correct or all incorrect)
            if (type === "correct") {
              console.log(`✅ All steps completed correctly!`);
              handleAttempt({ correct: true });
            } else if (type === "partial") {
              console.log(`⏳ Step ${currentStep} correct, but more steps needed`);
              // Don't call handleAttempt yet - waiting for all steps
            } else {
              console.log(`❌ Step ${currentStep} incorrect`);
              // Optionally handle wrong answers here if needed
            }
          }}
          onSubmit={handleSubmit}
          onIndexChange={handleIndexChange}
          onAnswerChange={resetIdle}
          onAttemptUpdate={handleAttemptUpdate}
        />
      </div>
    </div>

    {/* DESKTOP LAYOUT (sm and above) */}
    <div className="hidden sm:flex sm:flex-col sm:h-screen">
      {/* Desktop: Navbar + CategoryQuestion Combined - Upper Section */}
      <div className="bg-gradient-to-r from-[#397F85] to-[#327373] flex-shrink-0">
        {/* Navbar */}
        <div className="h-16 flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <SubHeading className="text-white font-bold text-lg">
              TugonPlay {currentQuestionProgress?.isCompleted && "✅"}
            </SubHeading>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span>Q{questionId}</span>
              <div className="w-1 h-4 bg-white/30 rounded-full"></div>
              <span>Topic {topicId}</span>
            </div>
            
            <button
              onClick={() => navigate("/tugonsense")}
              className="text-white bg-white/10 hover:bg-white/20 border-none text-xl p-2 rounded-lg transition-all duration-200 hover:scale-105"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* CategoryQuestion - Expanded upper section - WIDER */}
        <div className="px-4 py-8 min-h-[240px] flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <CategoryQuestion 
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
            />
          </div>
        </div>
      </div>
       {/* Feedback Container - Between sections */}
      
  
      {/* Desktop: QuestionTemplate - Middle Section - LESS WIDE, MORE HEIGHT */}
      <div className="flex-1 bg-gray-50 overflow-y-auto min-h-[50vh]">
        <div className="container mx-auto px-12 py-10">
          <div className="max-w-2xl mx-auto">
            <QuestionTemplate
              key={`desktop-template-${topicId}-${finalCategoryId}-${questionId}`}
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
              expectedAnswers={expectedAnswers}
              onValidationResult={(type, currentStep) => {
                console.log(`🖥️ Desktop onValidationResult callback:`, { type, currentStep });
                // Only trigger handleAttempt when all steps are complete (correct or all incorrect)
                if (type === "correct") {
                  console.log(`✅ All steps completed correctly!`);
                  handleAttempt({ correct: true });
                } else if (type === "partial") {
                  console.log(`⏳ Step ${currentStep} correct, but more steps needed`);
                  // Don't call handleAttempt yet - waiting for all steps
                } else {
                  console.log(`❌ Step ${currentStep} incorrect`);
                  // Optionally handle wrong answers here if needed
                }
              }}
              onSubmit={handleSubmit}
              onIndexChange={handleIndexChange}
              onAnswerChange={resetIdle}
              onAttemptUpdate={handleAttemptUpdate}
            />
          </div>
   
      
        </div>
      </div>
    </div>
       
    {/* Attempt Visualizer - Floating Panel 
    <AttemptVisualizer 
      attempts={userAttempts} 
      className="animate-in slide-in-from-right duration-300"
    />*/}

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
      
    </div>
  );
}