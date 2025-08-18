import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionBox from "../components/tugon/QuestionBox";
import AnswerBox from "../components/tugon/AnswerBox";
import HintBubble from "../components/tugon/HintBubble";
import Character from "../components/tugon/Character";
import NavControls from "../components/tugon/NavControls";
import TugonPlayNav from "../components/tugon/TugonPlayNav";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const total = 4; // number of steps
  // coin indicator placeholder
  const [coins] = useState<number>(0);

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
              <AnswerBox>Answer Box</AnswerBox>
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

          {/* controls */}
          <div className="mt-8">
            <NavControls
              total={total}
              index={index}
              onPrev={() => setIndex((i) => Math.max(0, i - 1))}
              onNext={() => setIndex((i) => Math.min(total - 1, i + 1))}
              onCheck={() => alert("Check pressed")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
