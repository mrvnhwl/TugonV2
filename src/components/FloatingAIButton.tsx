declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    0: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    0: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
  }

  type SpeechRecognitionConstructor = new () => SpeechRecognition;
  type SpeechRecognition = {
    lang: string;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: Event) => void;
  };
}

export {}; // Ensure this file is treated as a module


import React, { useEffect, useRef, useState } from "react";

const apiKey = "AIzaSyAj2V_O5fndQJWcAJ5SbMZQyfcfOJ1YBUQ"; // 🔐 Inline API key

export const askTugonAI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );
    const result = await response.json();
    return (
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from TugonAI."
    );
  } catch (error) {
    console.error("TugonAI API error:", error);
    return "Something went wrong while talking to TugonAI.";
  }
};

interface FloatingAIButtonProps {
  onWrongAnswer?: (questionId: string) => void;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onWrongAnswer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const FAQs: { [question: string]: string } = {
    "what is general mathematics": "General Mathematics is a subject that includes a wide range of foundational math topics such as algebra, functions, sequences and series, consumer math, and logic. It's designed to build problem-solving skills and prepare students for real-life mathematical applications.",
    "who built this website": "This website was built by Researchers: John Raven Aquino, Mervin Howell Gundaya, John Lester Malonzo, Manuell Terenz Cruz, Meann Saguid.",
    "what is this website for": "This website helps students understand and review key concepts in General Mathematics.",
    "how can i use this chatbot": "Just type a math-related question, and TugonAI will try to help you with a clear explanation!",
    "who should use this tool": "High school students, educators, or anyone who wants to brush up on General Mathematics concepts.",
    "can i use this for my math homework": "Yes, you can! But it's best used as a study aid, try to understand the steps, not just the answer.",
    "is this website free to use": "Yes, it's completely free!",
    "who do i contact for support or feedback": "You can contact the developer or educational team listed in the site's footer.",
    "special thanks": "Special thanks to our teachers, contributors, and every student who makes learning meaningful.",
  };

  const findFAQAnswer = (question: string): string | null => {
    const normalized = question.toLowerCase().trim();
    return FAQs[normalized] || null;
  };

  const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Define the recognition object if SpeechRecognition exists
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const handleVoiceInput = () => {
  if (!recognition) {
    setChatHistory((prev) => [
      ...prev,
      { sender: "tugonAI", text: "❌ Voice input is not supported in your browser." },
    ]);
    return;
  }

  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    setChatHistory((prev) => [
      ...prev,
      {
        sender: "tugonAI",
        text: "🎙️ Listening... please speak clearly.",
      },
    ]);
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    setUserInput(transcript);
  };

  recognition.onerror = (event: Event) => {
    setChatHistory((prev) => [
      ...prev,
      {
        sender: "tugonAI",
        text:
          "❌ Voice input error: " +
          ((event as SpeechRecognitionEvent & { error?: string }).error === "not-allowed"
            ? "Microphone access was denied."
            : "Something went wrong."),
      },
    ]);
  };

  recognition.start();
};
  
  


  const NAVIGATION_ROUTES: Record<string, string> = {
  // Core pages
  "home": "/",
  "main": "/",
  "start": "/",
  "landing": "/",

  "dashboard": "/studentDashboard",
  "student dashboard": "/studentDashboard",
  "student": "/studentDashboard",
  "user dashboard": "/studentDashboard",

  "tugon": "/tugonsense",
  "tugonsense": "/tugonsense",
  "ai tutor": "/tugonsense",
  "sense": "/tugonsense",
  "tugon sense": "/tugonsense",

  "quiz": "/quizzes",
  "quizzes": "/quizzes",
  "take quiz": "/quizzes",
  "practice quiz": "/quizzes",
  "quiz section": "/quizzes",

  // Topics with corrected paths
  "introduction": "/introductiontopic",
  "introduction to functions": "/introductiontopic",
  "intro": "/introductiontopic",
  "functions intro": "/introductiontopic",

  "operations": "/operationstopic",
  "operations on functions": "/operationstopic",
  "function operations": "/operationstopic",
  "apply operations": "/operationstopic",

  "evaluation": "/evaluationtopic",
  "evaluate functions": "/evaluationtopic",
  "function evaluation": "/evaluationtopic",

  "composition": "/compositiontopic",
  "composition of functions": "/compositiontopic",
  "composite functions": "/compositiontopic",
  "function composition": "/compositiontopic",

  "rational": "/rationaltopic",
  "rational functions": "/rationaltopic",
  "rational expressions": "/rationaltopic",

  "asymptotes": "/asymptotestopic",
  "vertical asymptotes": "/asymptotestopic",
  "horizontal asymptotes": "/asymptotestopic",
  "oblique asymptotes": "/asymptotestopic",
  "graph asymptotes": "/asymptotestopic",

  "solving": "/rationalinequalitiestopic",
  "solve rational equations": "/rationalinequalitiestopic",
  "rational inequalities": "/rationalinequalitiestopic",
  "solving rational": "/rationalinequalitiestopic",

  "inverse": "/inversetopic",
  "inverse functions": "/inversetopic",
  "inverse of function": "/inversetopic",

  "exponential": "/exponentialandlogtopic",
  "logarithmic": "/exponentialandlogtopic",
  "exponential functions": "/exponentialandlogtopic",
  "logarithmic functions": "/exponentialandlogtopic",

  "problem solving": "/problemsolvingfunctopic",
  "function word problems": "/problemsolvingfunctopic",
  "word problems": "/problemsolvingfunctopic",

  "graphs": "/graphstopic",
  "graphing functions": "/graphs",
  "function graphs": "/graphs",
  "graphs of functions": "/graphs",
};


    const sendMessage = async () => {
  const trimmedInput = userInput.trim();
  if (!trimmedInput) return;

  const normalizedInput = trimmedInput.toLowerCase();

  //Define trigger phrases that imply intent to navigate
  const navigationIntentPhrases = [
    "go to",
    "navigate to",
    "take me to",
    "open",
    "where is",
    "show me",
    "bring me to",
    "redirect to",
    "navigate me to",
    
  ];

  //Check if input contains a navigation phrase
  const hasNavigationIntent = navigationIntentPhrases.some((phrase) =>
    normalizedInput.includes(phrase)
  );

  // 🔍 Try to match a navigation keyword
  const matchedRoute = Object.keys(NAVIGATION_ROUTES).find((keyword) =>
    normalizedInput.includes(keyword)
  );

  //Only navigate if user clearly intends to
  if (matchedRoute && hasNavigationIntent) {
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: trimmedInput },
      { sender: "tugonAI", text: `🔀 Navigating you to the ${matchedRoute} page.` },
    ]);
    setUserInput("");
    setIsLoading(false);
    setTimeout(() => {
      window.location.href = NAVIGATION_ROUTES[matchedRoute];
    }, 1500);
    return;
  }

  setChatHistory((prev) => [...prev, { sender: "user", text: trimmedInput }]);
  setUserInput("");
  setIsLoading(true);

  const faqAnswer = findFAQAnswer(trimmedInput);
  if (faqAnswer) {
    setChatHistory((prev) => [...prev, { sender: "tugonAI", text: faqAnswer }]);
    setIsLoading(false);
    return;
  }

    const systemPrompt = `
If you are asked what this project is about or who you are, answer: "TugonAI is designed as an educational assistant specialized in General Mathematics."

Only answer questions related to math topics such as algebra, functions, interest, sequences, etc.

If a question is not math-related, respond with: "I can only help with General Mathematics questions."

If a question is unclear, respond with: "Hmm, I didn’t quite catch that. Could you please rephrase or be more specific with your question? I’m here to help!"

Keep your answers clear, factual, student-friendly and 1 sentence only.

If the user asks why Tugon is the name or what is the meaning of Tugon, answer: "The name Tugonsense comes from the core function of the AI itself. The Tugon AI is designed to identify errors in a student’s step-by-step answers, hence the term 'sense' in the name. It 'senses' or detects mistakes in reasoning or computation as students work through problems."

If the user inputs inappropriate or offensive content, respond with: "Avoid using inappropriate or offensive language."

If the user asks "Who is John Raven Aquino ?", answer: Raven is the leader and developer of Tugon.

If the user asks "Who is Mervin Howell Gundaya?", answer: Howell is the lead programmer and the team’s coding wizard.

If the user asks "Who is John Lester Malonzo?", answer: Malonzo is the second-in-command and a key programmer.

If the user asks "Who is Meann Saguid?", answer: Mean is the team’s sharp-eyed document analyst, the mind behind the paper.

If the user asks "Who is Manuell Terenz Cruz?", answer: Manuel is a driven researcher and document lead.

If a user asks where to find something on the website (e.g., 'Where is the interest page?'), respond with: “🔀 Navigating you to the [name] page.” and the system will redirect them automatically.

If it's not a known page, respond with: “Hmm, I couldn’t find that page. Try using keywords like ‘interest’, ‘quizzes’, or ‘profile’.”
`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${trimmedInput}`;
    const reply = await askTugonAI(fullPrompt);
    setChatHistory((prev) => [...prev, { sender: "tugonAI", text: reply }]);
    setIsLoading(false);
  };


  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <>
      {!isOpen && (
        <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <img
          src="src/components/assets/images/brain.png"
          alt="Chat Icon"
          style={{
            width: "84px",
            height: "64px",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
      </button>
      
      )}

      {isOpen && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "400px",
      height: "600px",
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
    }}
  >
    {/* Close Button */}
    <button
      onClick={() => setIsOpen(false)}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "#f44336", // Red for close button
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      ✕
    </button>

    {/* FAQ Buttons Section */}
    <div
      style={{
        padding: "12px",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        height: "40%",
        overflowY: "auto",
        borderBottom: "1px solid #eee",
      }}
    >
      {Object.keys(FAQs).map((q, idx) => (
        <button
          key={idx}
          onClick={() => {
            setChatHistory((prev) => [...prev, { sender: "user", text: q }]);
            const answer = findFAQAnswer(q);
            if (answer) {
              setChatHistory((prev) => [
                ...prev,
                { sender: "tugonAI", text: answer },
              ]);
            }
          }}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            backgroundColor: "#fff",
            color: "#6200ee",
            border: "1px solid #6200ee",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          {q.charAt(0).toUpperCase() + q.slice(1)}
        </button>
      ))}
    </div>

    {/* Chat Content Section */}
    <div
      ref={chatRef}
      style={{
        flex: 1,
        padding: "12px",
        overflowY: "auto",
        fontSize: "15px",
      }}
    >
      {chatHistory.map((msg, i) => (
        <div
          key={i}
          style={{
            marginBottom: "12px",
            display: "flex",
            flexDirection: msg.sender === "user" ? "row-reverse" : "row",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <div
            style={{
              maxWidth: "70%",
              padding: "10px",
              borderRadius: "12px",
              backgroundColor: msg.sender === "user" ? "#e1f5fe" : "#f5f5f5",
              color: "#000",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <strong>{msg.sender === "user" ? "You" : "TugonAI"}:</strong> {msg.text}
          </div>
        </div>
      ))}
      {isLoading && (
        <div
          style={{
            marginBottom: "12px",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          <strong>TugonAI:</strong> <em>Typing...</em>
        </div>
      )}
    </div>

    {/* Input Section */}
    <div style={{ display: "flex", borderTop: "1px solid #eee" }}>
  <input
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    placeholder="Ask something..."
    style={{
      flex: 1,
      border: "none",
      padding: "12px",
      fontSize: "15px",
      outline: "none",
    }}
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />

  {/* 🎤 Voice Button */}
  <button
    onClick={handleVoiceInput}
    style={{
      padding: "0 16px",
      backgroundColor: "#ffffff",
      color: "#6200ee",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
    }}
    title="Speak your question"
  >
    🎤
  </button>

  {/* ➤ Send Button */}
  <button
    onClick={sendMessage}
    style={{
      padding: "12px 20px",
      backgroundColor: "#6200ee",
      color: "#fff",
      border: "none",
      fontWeight: "bold",
      fontSize: "15px",
      cursor: "pointer",
    }}
  >
    ➤
  </button>
</div>
  </div>
)}

    </>
  );
};

export default FloatingAIButton;
