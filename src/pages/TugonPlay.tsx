import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionBox from "../components/tugon/QuestionBox";
import HintBubble from "../components/tugon/HintBubble";
import Character from "../components/tugon/Character";
import NavControls from "../components/tugon/NavControls";
import TugonPlayNav from "../components/tugon/TugonPlayNav";
import LayeredInputBox from "../components/tugon/LayeredInputBox";

export default function TugonPlay() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const total = 4; // number of steps
  // coin indicator placeholder
  const [coins] = useState<number>(0);
  const layers = Array.from({ length: total }).map((_, i) => `Layer ${i + 1}`);
  const [flipIn, setFlipIn] = useState(true);
  const isAnimatingRef = useRef(false);
  const DURATION = 300; // ms, keep in sync with CSS duration

  const animateToIndex = (next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    if (clamped === index || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    // flip out
    setFlipIn(false);
    setTimeout(() => {
      // change content while hidden
      setIndex(clamped);
      // flip in
      setFlipIn(true);
      setTimeout(() => {
        isAnimatingRef.current = false;
      }, DURATION);
    }, Math.max(1, Math.floor(DURATION / 2)));
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
              <div className="[perspective:1000px]">
                <div
                  className={"transform transition-all duration-300 origin-left"}
                  style={{
                    transform: flipIn ? "rotateY(0deg)" : "rotateY(90deg)",
                    opacity: flipIn ? 1 : 0,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <LayeredInputBox
                    layers={layers}
                    currentIndex={index}
                    onIndexChange={setIndex}
                    onSubmit={(values) => console.log("Layered submit:", values)}
                    showControls={false}
                    animation="fade"
                  />
                </div>
              </div>
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
              onPrev={() => animateToIndex(index - 1)}
              onNext={() => animateToIndex(index + 1)}
              onCheck={() => alert("Check pressed")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
