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
  <TugonSenseNavbar coins={coins} onCoinClick={() => navigate("/tugonsense")} centerActiveIndex={activeIndex} />

      <div className="mx-auto max-w-6xl p-6">

        <div className="mt-6 rounded-2xl bg-gray-200 p-6 sm:p-8 md:p-10">
          {/* question */}
          <QuestionBox title={topic?.name ?? "Question"}>
            <p className="text-base text-foreground">{sampleQuestion}</p>
          </QuestionBox>

          {/* middle row */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            <div className="md:col-span-2">
              <AnswerWizard
                steps={steps}
                onSubmit={handleSubmit}
                onIndexChange={setActiveIndex}
                expectedAnswers={expectedAnswers}
                onAnswerChange={(i, v) => {
                  // Only track current step's answer for validation bubble
                  if (i === activeIndex) setCurrentAnswer(v);
                }}
              />
            </div>
            <div className="flex h-full flex-col items-stretch justify-between gap-4">
              {/* Hint bubble */}
              <div className="flex-1 flex items-center justify-center">
                <HintBubble
                  userInput={currentAnswer}
                  expectedAnswer={expectedAnswers?.[activeIndex]?.answer ?? ""}
                  type={expectedAnswers?.[activeIndex]?.type ?? "single"}
                  stepIndex={activeIndex}
                />
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
