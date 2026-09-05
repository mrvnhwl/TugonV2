// components/MathProblem.tsx
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableAnswer } from "./DraggableAnswer";

interface MathProblemProps {
  question: string;
  answers: string[];
  correctAnswer: string;
}

export function MathProblem({ question, answers, correctAnswer }: MathProblemProps) {
  const [items, setItems] = useState(answers);
  const [feedback, setFeedback] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateFeedback = (topAnswer: string) => {
    if (topAnswer === correctAnswer) {
      return "✅ Correct! Well done! Your logical reasoning is on point! Keep practicing to sharpen your skills.";
    }
    if (items.includes(correctAnswer)) {
      return "⚠️ Almost there! Try breaking the problem down into smaller steps. Look at the patterns.";
    }
    return "❌ Incorrect. Consider revisiting the core concept of this question.";
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.indexOf(active.id);
        const newIndex = prevItems.indexOf(over?.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
    setFeedback(generateFeedback(items[0]));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow p-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">{question}</h2>
        {feedback && (
          <div
            className={`p-3 rounded ${
              feedback.includes("✅")
                ? "bg-green-100 text-green-700"
                : feedback.includes("⚠️")
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback}
          </div>
        )}
      </div>

      <div className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((answer) => (
                <DraggableAnswer key={answer} id={answer} answer={answer} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
