import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherNavbar from "../../components/teacherNavbar";
import Footer from "../../components/Footer";
import color from "../../styles/color";

function TopicCreationSelection() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleUploadClick = () => {
    navigate("/manage-topics");
  };

  const handleGenerateClick = () => {
    navigate("/tugon-topics");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5" }}>
      <TeacherNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="text-5xl font-bold mb-4"
              style={{ color: color.steel }}
            >
              Topic Creation
            </h1>
            <p className="text-lg" style={{ color: color.steel }}>
              Choose how you want to create your educational topic
            </p>
          </div>

          {/* Button Container */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Topic Button */}
            <button
              onClick={handleUploadClick}
              onMouseEnter={() => setHoveredButton("upload")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              style={{
                background: "#fff",
                border: `2px solid ${color.teal}`,
                padding: "3rem 2rem",
                minHeight: "280px",
              }}
            >
              {/* Icon Circle */}
              <div className="relative mb-6 flex justify-center">
                <div
                  className="rounded-full p-6 transition-all duration-300"
                  style={{
                    background: hoveredButton === "upload" ? `${color.teal}30` : `${color.teal}15`,
                    transform: hoveredButton === "upload" ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <svg
                    className="w-12 h-12 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ 
                      color: color.teal,
                      transform: hoveredButton === "upload" ? "translateY(-4px)" : "translateY(0)",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div className="relative">
                <h2
                  className="text-3xl font-bold mb-3 transition-colors duration-300"
                  style={{ color: hoveredButton === "upload" ? color.teal : "#1e293b" }}
                >
                  Upload Topic
                </h2>
                <p
                  className="text-base transition-colors duration-300"
                  style={{ color: hoveredButton === "upload" ? color.steel : "#64748b" }}
                >
                  Upload your own pre-prepared topic materials and content
                </p>
              </div>
            </button>

            {/* Generate Topic Button */}
            <button
              onClick={handleGenerateClick}
              onMouseEnter={() => setHoveredButton("generate")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              style={{
                background: "#fff",
                border: `2px solid ${color.teal}`,
                padding: "3rem 2rem",
                minHeight: "280px",
              }}
            >
              {/* Icon Circle */}
              <div className="relative mb-6 flex justify-center">
                <div
                  className="rounded-full p-6 transition-all duration-300"
                  style={{
                    background: hoveredButton === "generate" ? `${color.teal}30` : `${color.teal}15`,
                    transform: hoveredButton === "generate" ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <svg
                    className="w-12 h-12 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ 
                      color: color.teal,
                      transform: hoveredButton === "generate" ? "rotate(15deg)" : "rotate(0deg)",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div className="relative">
                <h2
                  className="text-3xl font-bold mb-3 transition-colors duration-300"
                  style={{ color: hoveredButton === "generate" ? color.teal : "#1e293b" }}
                >
                  Generate Topic
                </h2>
                <p
                  className="text-base transition-colors duration-300"
                  style={{ color: hoveredButton === "generate" ? color.steel : "#64748b" }}
                >
                  Use AI to automatically generate and refine topic content
                </p>
              </div>
            </button>
          </div>

        
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TopicCreationSelection;
