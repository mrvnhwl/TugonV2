import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionBox from "../../components/tugon/QuestionBox";
import HintBubble from "../../components/tugon/HintBubble";
import Character from "../../components/tugon/Character";
import TugonPlayNav from "../../components/tugon/TugonPlayNav";
import AnswerWizard, { Step } from "../../components/tugon/AnswerWizard";

export default function TugonPlay() {
  const navigate = useNavigate();
  const steps: Step[] = [
    { id: "s1", type: "single", label: "Short answer", placeholder: "Enter a single-line answer" },
    { id: "m1", type: "multi", label: "Explain your steps", placeholder: "Explain in detail", rows: 4 },
    { id: "g1", type: "graph", label: "Graph your function" },
    { id: "c1", type: "mcq", label: "Choose the best form", options: ["A", "B", "C", "D"], multiple: false },
  ];
  // coin indicator placeholder
  const [coins] = useState<number>(0);
  const handleSubmit = (answers: Record<string, any>) => {
    console.log("Answers:", answers);
    alert("Submitted! Check console for answers.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
  <TugonPlayNav coins={coins} onExit={() => navigate("/tugonsense")} />

      <div className="mx-auto max-w-6xl p-6">

        <div className="mt-6 rounded-2xl bg-gray-200 p-6 sm:p-8 md:p-10">
          {/* question */}
          <QuestionBox title="Question Box / Problem Direction" />

          {/* middle row */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            <div className="md:col-span-2">
        <AnswerWizard steps={steps} onSubmit={handleSubmit} />
            </div>
            <div className="flex items-start gap-4 justify-center md:justify-end">
              <HintBubble>
                <div className="text-2xl leading-tight">
                  DIRECTION
                  <br />/ HINT
                </div>
              </HintBubble>
              <Character />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
