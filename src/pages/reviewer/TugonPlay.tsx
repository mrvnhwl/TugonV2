import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionBox from "../../components/tugon/question-system/QuestionBox";
import CategoryQuestion from "../../components/tugon/question-system/CategoryQuestion";
import { defaultTopics } from "../../components/data/question";
import { getAnswerForQuestion, answersByTopicAndCategory } from "../../components/data/answers"; // Updated import
import AnswerWizard, { Step, WizardStep } from "../../components/tugon/input-system/AnswerWizard";
import HintBubble from "../../components/tugon/hint-system/HintBubble";
import Character from "../../components/tugon/hint-system/Character";
import { SubHeading,Text, Small } from "../../components/Typography";

const FALLBACK_HINT_TEXT = "Try isolating y. Start by substituting x = 2.";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const idleTimer = useRef<number | null>(null);

  // Extract URL parameters
  const topicId = Number(searchParams.get("topic")) || 1;
  const categoryId = Number(searchParams.get("category")) || 1;
  const questionId = Number(searchParams.get("question")) || 1;
  const legacyQ = Number(searchParams.get("q"));
  const finalCategoryId = legacyQ || categoryId;

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

  const handleAttempt = ({ correct }: { correct: boolean }) => {
    setAttempts((n) => n + 1);
    setIsCorrect(correct);
    if (correct) {
      setHint("Great job! 🎉 You solved it correctly.");
      return;
    }
    
    // Progressive hints based on attempts, but still use guide_text as base
    const baseGuideText = getGuideText();
    setHint(() => {
      if (attempts === 0) return `Hint: ${baseGuideText}`;
      if (attempts === 1) return `Try again: ${baseGuideText}`;
      return `Keep trying: ${baseGuideText}`;
    });
    resetIdle();
  };

  const handleSubmit = (finalSteps: WizardStep[]) => {
    console.log("Wizard steps:", finalSteps);
    console.log("Current expected answer:", getCurrentExpectedAnswer());
    alert("Submitted! Check console for steps.");
  };

  const handleIndexChange = (newIndex: number) => {
    // Handle step changes if needed
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      backgroundColor: "white"
    }}>
      {/* Navbar */}
      <div style={{
        height: "52px",
        backgroundColor: "#7c3aed",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        flexShrink: 0
      }}>
        <SubHeading className="text-white font-semibold">TugonPlay</SubHeading>
        <button
          onClick={() => navigate("/tugonsense")}
          style={{ color: "white", background: "none", border: "none", fontSize: "18px" }}
        >
          ✕
        </button>
      </div>

      {/* Content - Takes remaining space */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        margin: 0
      }}>
        <div style={{
          maxWidth: "448px", // max-w-md
          margin: "0 auto",
          padding: 0
        }}>
          {/* Question Section */}
          <div style={{ marginBottom: "16px" }}>
            <CategoryQuestion 
              topicId={topicId}
              categoryId={finalCategoryId}
            />
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <QuestionBox 
              topicId={topicId}
              categoryId={finalCategoryId}
              questionId={questionId}
              title={topicName}
              fallbackText="Question not found."
            />
          </div>
          
          {/* Answer Wizard */}
          <div style={{ marginBottom: "16px" }}>
            <AnswerWizard
              steps={steps}
              onSubmit={handleSubmit}
              onIndexChange={handleIndexChange}
              expectedAnswers={expectedAnswers}
              onValidationResult={(type) => {
                handleAttempt({ correct: type === "correct" });
              }}
              onAnswerChange={resetIdle}
            />
          </div>
          
          {/* Hint */}
          {/*<div>
            <HintBubble message={hint} />
          </div>*/}
        </div>
      </div>

      {/* Character */}
      <div style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 50
      }}>
        <Character name="Tugon" className="w-24 h-24" />
      </div>
    </div>
  );
}