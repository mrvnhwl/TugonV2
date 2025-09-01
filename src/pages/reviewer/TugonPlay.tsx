import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuestionBox from "../../components/tugon/QuestionBox";
import { defaultTopics } from "../../components/data/question";
import { questionAnswersByStage } from "../../components/data/answers";
import TugonSenseNavbar from "../../components/TugonSenseNavbar";
import AnswerWizard, { Step, WizardStep } from "../../components/tugon/AnswerWizard";
import HintBubble from "../../components/tugon/HintBubble";
import Character from "../../components/tugon/Character";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const steps: Step[] = [
    { id: "s1", label: "Short answer", placeholder: "Enter a single-line answer" },
    { id: "m1", label: "Explain your steps", placeholder: "Explain in detail", rows: 4 },
    { id: "g1", label: "Graph your function" },
  ];
  // coin indicator placeholder
  const [coins] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [inputLockedUntil, setInputLockedUntil] = useState<number>(0);
  const [spamSignal, setSpamSignal] = useState<number>(0);
  const [showSidePanel, setShowSidePanel] = useState(false); // Control side panel visibility
  const topicId = Number(searchParams.get("topic"));
  const qId = Number(searchParams.get("q"));
  const topic = defaultTopics.find((t) => t.id === topicId);
  const question = topic?.questions.find((q) => q.id === qId);
  // Compute 1-based global stage across topics (3 questions per topic)
  const stageIndex = topicId && qId ? (topicId - 1) * 3 + qId : undefined;
  const expectedAnswers = stageIndex ? questionAnswersByStage[stageIndex as keyof typeof questionAnswersByStage] : undefined;

  // Immediate logs so you always see them when TugonPlay renders
  {
    const exportName = stageIndex ? `Question${stageIndex}Answers` : undefined;
    // eslint-disable-next-line no-console
    console.log("[TugonPlay] params:", { topicId, qId, stageIndex, exportName });
    if (expectedAnswers && exportName) {
      // eslint-disable-next-line no-console
      console.log("[TugonPlay] using:", exportName);
      // eslint-disable-next-line no-console
      console.table(expectedAnswers);
      const snippet = `export const ${exportName}: PredefinedAnswer[] = [\n${expectedAnswers
        .map((a) => `  { type: \"${a.type}\", answer: \"${a.answer}\" },`)
        .join("\n")}\n];`;
      // eslint-disable-next-line no-console
      console.log(snippet);
      // Expose for quick inspection in DevTools
      (window as any).__TUGON_EXPECTED_ANSWERS__ = { name: exportName, data: expectedAnswers };
    }
  }

  // Logs to inspect which answers array is being used
  useEffect(() => {
    console.group("[TugonPlay] Expected Answers Selection");
    console.log("topicId:", topicId, "qId:", qId, "stageIndex:", stageIndex);
    if (expectedAnswers) {
      const exportName = `Question${stageIndex}Answers`;
      console.log("Using per-question array:", exportName);
      console.table(expectedAnswers);
      // Code-like snippet for easy verification
      const snippet = `export const ${exportName}: PredefinedAnswer[] = [\n${expectedAnswers
        .map((a) => `  { type: "${a.type}", answer: "${a.answer}" },`)
        .join("\n")}\n];`;
      console.log(snippet);
    } else {
      console.warn("No per-question answers found for this route; AnswerWizard will fall back to global predefinedAnswers.");
    }
    console.groupEnd();
  }, [topicId, qId, stageIndex, expectedAnswers]);
  const sampleQuestion =
    question?.text ?? defaultTopics[0]?.questions[0]?.text ?? "Placeholder: A sample question";
  const handleSubmit = (finalSteps: WizardStep[]) => {
    console.log("Wizard steps:", finalSteps);
    alert("Submitted! Check console for steps.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar with Back Button */}
      <nav className="w-full bg-white shadow py-4 px-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition-colors"
        >
          ← Back
        </button>
      </nav>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mt-6 rounded-2xl bg-gray-200 p-6 sm:p-8 md:p-10">
          {/* Dynamic layout based on side panel visibility */}
          <div className={`grid gap-6 ${showSidePanel ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
            
            {/* Left Column: Question and AnswerWizard */}
            <div className={`space-y-6 ${showSidePanel ? 'lg:col-span-2' : 'max-w-4xl mx-auto'}`}>
              {/* Question Box - Upper Left */}
              <div className="w-full">
                <QuestionBox title={topic?.name ?? "Question"}>
                  <p className="text-base text-foreground">{sampleQuestion}</p>
                </QuestionBox>
              </div>

              {/* AnswerWizard - Below Question */}
              <div className="w-full">
                <AnswerWizard
                  steps={steps}
                  onSubmit={handleSubmit}
                  onIndexChange={setActiveIndex}
                  expectedAnswers={expectedAnswers}
                  onAnswerChange={(i, v) => {
                    // Only track current step's answer for validation bubble
                    if (i === activeIndex) setCurrentAnswer(v);
                  }}
                  inputDisabled={Date.now() < inputLockedUntil}
                  onSpamDetected={() => setSpamSignal(Date.now())}
                />
              </div>
            </div>
            
            {/* Right Column: HintBubble Side Panel - Show when toggled */}
            {showSidePanel && (
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <HintBubble
                    userInput={currentAnswer}
                    expectedAnswer={expectedAnswers?.[activeIndex]?.answer ?? ""}
                    type={expectedAnswers?.[activeIndex]?.type ?? "single"}
                    stepIndex={activeIndex}
                    onRequestInputLock={(ms) => {
                      const until = Date.now() + (typeof ms === "number" ? ms : 10000);
                      setInputLockedUntil(until);
                      // Unlock after the specified duration
                      window.setTimeout(() => setInputLockedUntil(0), until - Date.now());
                    }}
                    spamSignal={spamSignal}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Character in lower right corner - always visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <Character 
          name="Tugon"
          className="w-20 h-20"
          onClick={() => setShowSidePanel(!showSidePanel)}
        />
      </div>
    </div>
  );
}
