import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionBox, { defaultTopics } from "../../components/tugon/QuestionBox";
import TugonSenseNavbar from "../../components/TugonSenseNavbar";
import AnswerWizard, { Step, WizardStep } from "../../components/tugon/AnswerWizard";
import HintBubble from "../../components/tugon/HintBubble";
import Character from "../../components/tugon/Character";

export default function TugonPlay() {
  const navigate = useNavigate();
  const steps: Step[] = [
    { id: "s1", label: "Short answer", placeholder: "Enter a single-line answer" },
    { id: "m1", label: "Explain your steps", placeholder: "Explain in detail", rows: 4 },
    { id: "g1", label: "Graph your function" },
  ];
  // coin indicator placeholder
  const [coins] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const sampleQuestion = defaultTopics[0]?.questions[0]?.text ?? "Placeholder: A sample question";
  const handleSubmit = (finalSteps: WizardStep[]) => {
    console.log("Wizard steps:", finalSteps);
    alert("Submitted! Check console for steps.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
  <TugonSenseNavbar coins={coins} onCoinClick={() => navigate("/tugonsense")} centerActiveIndex={activeIndex} />

      <div className="mx-auto max-w-6xl p-6">

        <div className="mt-6 rounded-2xl bg-gray-200 p-6 sm:p-8 md:p-10">
          {/* question */}
          <QuestionBox title="Sample Question">
            <p className="text-base text-foreground">{sampleQuestion}</p>
          </QuestionBox>

          {/* middle row */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            <div className="md:col-span-2">
              <AnswerWizard steps={steps} onSubmit={handleSubmit} onIndexChange={setActiveIndex} />
            </div>
            <div className="flex h-full flex-col items-stretch justify-between gap-4">
              {/* Hint bubble */}
              <div className="flex-1 flex items-center justify-center">
                <HintBubble>
                  <div className="text-2xl leading-tight">
                    DIRECTION
                    <br />/ HINT
                  </div>
                </HintBubble>
              </div>
              {/* Character below */}
              <div className="flex items-center justify-center">
                <Character />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
