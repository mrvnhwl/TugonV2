import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionBox from "../../components/tugon/question-system/QuestionBox";
import CategoryQuestion from "../../components/tugon/question-system/CategoryQuestion";
import { defaultTopics } from "../../components/data/question";
import { questionAnswersByStage } from "../../components/data/answers";
import AnswerWizard, { Step, WizardStep } from "../../components/tugon/input-system/AnswerWizard";
import HintBubble from "../../components/tugon/hint-system/HintBubble";
import Character from "../../components/tugon/hint-system/Character";

const DEFAULT_HINT_TEXT = "Try isolating y. Start by substituting x = 2.";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hint, setHint] = useState(DEFAULT_HINT_TEXT);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const idleTimer = useRef<number | null>(null);

  const steps: Step[] = [
    { id: "s1", label: "Short answer", placeholder: "Enter a single-line answer" },
    { id: "m1", label: "Explain your steps", placeholder: "Explain in detail", rows: 4 },
    { id: "g1", label: "Graph your function" },
  ];

  const resetIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!isCorrect) setHint("Stuck? Compute 4×2 first, then add 3.");
    }, 20000);
  };

  useEffect(() => {
    resetIdle();
    return () => { if (idleTimer.current) window.clearTimeout(idleTimer.current); };
  }, []);

  const handleAttempt = ({ correct }: { correct: boolean }) => {
    setAttempts((n) => n + 1);
    setIsCorrect(correct);
    if (correct) {
      setHint("Great job! 🎉 You isolated y correctly.");
      return;
    }
    // Wrong attempt → graduated hints
    setHint(() => {
      if (attempts === 0) return "Try substituting x = 2 first.";
      if (attempts === 1) return "Add 3 to both sides to isolate y.";
      return "Compute 4x when x = 2, then solve for y.";
    });
    resetIdle();
  };

  // Extract URL parameters and calculate IDs
  const topicId = Number(searchParams.get("topic")) || 1;
  const categoryId = Number(searchParams.get("category")) || 1;
  const questionId = Number(searchParams.get("question")) || 1;
  
  // Legacy support - if using old "q" parameter, map it to categoryId
  const legacyQ = Number(searchParams.get("q"));
  const finalCategoryId = legacyQ || categoryId;

  // Calculate stage index for expected answers (keeping backward compatibility)
  const stageIndex = topicId && finalCategoryId ? (topicId - 1) * 3 + finalCategoryId : undefined;
  const expectedAnswers = stageIndex ? questionAnswersByStage[stageIndex as keyof typeof questionAnswersByStage] : undefined;

  // Get topic name for display
  const topic = defaultTopics.find((t) => t.id === topicId);
  const topicName = topic?.name || "Question";

  const handleSubmit = (finalSteps: WizardStep[]) => {
    console.log("Wizard steps:", finalSteps);
    alert("Submitted! Check console for steps.");
  };

  const handleIndexChange = (newIndex: number) => {
    // Handle step changes if needed
    console.log("Step changed to:", newIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <nav className="fixed top-0 w-full z-50 px-2 sm:px-4 h-14 bg-purple-600 shadow-md">
        <div className="h-full flex items-center justify-between">
          <div className="text-white font-semibold text-sm sm:text-base">TugonPlay</div>
          <button
            aria-label="Exit TugonPlay"
            className="text-white/90 hover:text-white font-semibold tracking-wide px-2 sm:px-4 py-2 text-sm sm:text-base"
            onClick={() => navigate("/tugonsense")}
          >
            ✕
          </button>
        </div>
      </nav>

      {/* Stage wrapper - Mobile-first responsive (Brilliant.org style) */}
      <main className="mx-auto pt-16 w-full h-auto px-4 
                       md:w-[960px] md:h-[640px] 
                       bg-white rounded-none md:rounded-2xl 
                       shadow-none md:shadow-sm 
                       flex flex-col relative">
        
        {/* Content column - Shared width for all components */}
        <section className="w-full max-w-[560px] mx-auto mt-4 sm:mt-6 md:mt-10 flex flex-col gap-4 sm:gap-6">
          
          {/* Question Section - Centered layout like first image */}
          <div className="flex flex-col items-center text-center space-y-3">
            {/* CategoryQuestion - Centered above QuestionBox */}
            <CategoryQuestion 
              topicId={topicId}
              categoryId={finalCategoryId}
              className="w-full responsive-category-text"
            />
            
            {/* QuestionBox - Main question display, centered */}
            <QuestionBox 
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
              title={topicName}
              fallbackText="Question not found. Please check the URL parameters."
              className="w-full"
            />
          </div>
          
          {/* AnswerWizard */}
          <AnswerWizard
            steps={steps}
            onSubmit={handleSubmit}
            onIndexChange={handleIndexChange}
            expectedAnswers={expectedAnswers}
            onValidationResult={(type) => {
              // Handle validation results and update hint
              const correct = type === "correct";
              handleAttempt({ correct });
            }}
            onAnswerChange={() => {
              // Reset idle timer when user types
              resetIdle();
            }}
          />
          
          {/* HintBubble */}
          <HintBubble message={hint} />
          
        </section>

      </main>

      {/* Character in lower right corner - responsive positioning */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 md:bottom-8 md:right-8">
        <Character 
          name="Tugon"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 shadow-lg hover:shadow-xl transition-shadow"
        />
      </div>
    </div>
  );
}