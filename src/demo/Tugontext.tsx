import { useState } from "react";
import { useRive } from "@rive-app/react-canvas";

export default function TugonText() {
  const [input, setInput] = useState("");

  const { rive, RiveComponent } = useRive({
    src: "/tugon_text.riv",
    artboard: "DynamicText",
    autoplay: true,
    onLoad: () => {
      try {
        // ✅ Initialize with multiline
        rive?.setTextRunValue("GreetingRun", "Welcome to Tugon!\nType below 👇");
        rive?.drawFrame();
        rive?.startRendering();
        console.log("✅ GreetingRun initialized (onLoad)");
      } catch (err) {
        console.error("⚠️ Failed to set GreetingRun (onLoad):", err);
      }
    },
  });

  const handleUpdate = () => {
    if (!rive) return;

    try {
      // ✅ If user presses Enter in textarea, \n will create a new line
      rive.setTextRunValue("GreetingRun", input || "This is dynamic! 🎉");
      rive.drawFrame();
      rive.startRendering();

      console.log("🔄 Updated GreetingRun to:", input || "This is dynamic! 🎉");
    } catch (err) {
      console.error("⚠️ Failed to update GreetingRun:", err);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <RiveComponent className="w-full h-64 border rounded shadow" />
      <textarea
        className="w-full h-24 p-2 border rounded resize-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type here and use Enter for new lines..."
      />
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
      >
        Change Text
      </button>
    </div>
  );
}
