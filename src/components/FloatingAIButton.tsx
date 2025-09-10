import { useRive } from '@rive-app/react-canvas';

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
import { useNavigate } from "react-router-dom"; // soft navigation
import color from "../styles/color";

// ⚠️ your existing key + API call kept intact
const apiKey = "AIzaSyAj2V_O5fndQJWcAJ5SbMZQyfcfOJ1YBUQ";

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
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response from TugonAI.";
  } catch (error) {
    console.error("TugonAI API error:", error);
    return "Something went wrong while talking to TugonAI.";
  }
};

interface FloatingAIButtonProps {
  onWrongAnswer?: (questionId: string) => void;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onWrongAnswer }) => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const { rive, RiveComponent } = useRive({
    src: "/tugon.riv",
    stateMachines: "State Machine 1",
    autoplay: false,
  });

  useEffect(() => {
    if (rive) rive.play();
  }, [rive]);

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

  // Voice input (unchanged logic)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const handleVoiceInput = () => {
    if (!recognition) {
      setChatHistory((prev) => [...prev, { sender: "tugonAI", text: "❌ Voice input is not supported in your browser." }]);
      return;
    }

    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setChatHistory((prev) => [...prev, { sender: "tugonAI", text: "🎙️ Listening... please speak clearly." }]);
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

  // ✅ Expanded navigation routes: includes Leaderboards and synonyms
  const NAVIGATION_ROUTES: Record<string, string> = {
    // Core / landing
    home: "/",
    main: "/",
    start: "/",
    landing: "/",

    // Student dashboard
    dashboard: "/studentDashboard",
    "student dashboard": "/studentDashboard",
    student: "/studentDashboard",
    "user dashboard": "/studentDashboard",

    // AI tutor
    tugon: "/tugonSense",
    tugonsense: "/tugonSense",
    "ai tutor": "/tugonSense",
    sense: "/tugonSense",
    "tugon sense": "/tugonSense",

    // Challenges / quizzes
    challenge: "/challenge",
    challenges: "/challenge",
    quiz: "/challenge",
    quizzes: "/challenge",
    "take quiz": "/challenge",
    "practice quiz": "/challenge",
    "quiz section": "/challenge",

    // 🚀 Leaderboards (added + synonyms)
    leaderboard: "/leaderboards",
    leaderboards: "/leaderboards",
    rankings: "/leaderboards",
    ranking: "/leaderboards",
    scoreboard: "/leaderboards",
    scores: "/leaderboards",
    "top players": "/leaderboards",

    // Profile / settings (if present in your router)
    profile: "/profile",
    account: "/profile",
    settings: "/settings",

    // Info / support
    help: "/help",
    support: "/help",
    contact: "/contact",
    about: "/about",

    // Topics
    introduction: "/introductiontopic",
    "introduction to functions": "/introductiontopic",
    intro: "/introductiontopic",
    "functions intro": "/introductiontopic",

    operations: "/operationstopic",
    "operations on functions": "/operationstopic",
    "function operations": "/operationstopic",
    "apply operations": "/operationstopic",

    evaluation: "/evaluationtopic",
    "evaluate functions": "/evaluationtopic",
    "function evaluation": "/evaluationtopic",

    composition: "/compositiontopic",
    "composition of functions": "/compositiontopic",
    "composite functions": "/compositiontopic",
    "function composition": "/compositiontopic",

    rational: "/rationaltopic",
    "rational functions": "/rationaltopic",
    "rational expressions": "/rationaltopic",

    asymptotes: "/asymptotestopic",
    "vertical asymptotes": "/asymptotestopic",
    "horizontal asymptotes": "/asymptotestopic",
    "oblique asymptotes": "/asymptotestopic",
    "graph asymptotes": "/asymptotestopic",

    solving: "/rationalinequalitiestopic",
    "solve rational equations": "/rationalinequalitiestopic",
    "rational inequalities": "/rationalinequalitiestopic",
    "solving rational": "/rationalinequalitiestopic",

    inverse: "/inversetopic",
    "inverse functions": "/inversetopic",
    "inverse of function": "/inversetopic",

    exponential: "/exponentialandlogtopic",
    logarithmic: "/exponentialandlogtopic",
    "exponential functions": "/exponentialandlogtopic",
    "logarithmic functions": "/exponentialandlogtopic",

    "problem solving": "/problemsolvingfunctopic",
    "function word problems": "/problemsolvingfunctopic",
    "word problems": "/problemsolvingfunctopic",

    graphs: "/graphstopic",
    "graphing functions": "/graphstopic",
    "function graphs": "/graphstopic",
    "graphs of functions": "/graphstopic",

    // Extras (only if defined in your router)
    modules: "/modules",
    topics: "/topics",
    resources: "/resources",
    notes: "/notes",
    calculator: "/calculator",
    formula: "/formula",
    "formula sheet": "/formula",
    references: "/references",
  };

  const sendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    const normalizedInput = trimmedInput.toLowerCase();

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

    const hasNavigationIntent = navigationIntentPhrases.some((p) => normalizedInput.includes(p));
    const matchedRoute = Object.keys(NAVIGATION_ROUTES).find((keyword) => normalizedInput.includes(keyword));

    // Soft navigation (prevents logout)
    if (matchedRoute && hasNavigationIntent) {
      const path = NAVIGATION_ROUTES[matchedRoute];
      setChatHistory((prev) => [
        ...prev,
        { sender: "user", text: trimmedInput },
        { sender: "tugonAI", text: `🔀 Navigating you to the ${matchedRoute} page.` },
      ]);
      setUserInput("");
      setIsLoading(false);
      navigate(path);
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
            background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
            border: "none",
            padding: 0,
            cursor: "pointer",
            zIndex: 1000,
            width: 64,
            height: 64,
            borderRadius: "50%",
            boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
            transition: "transform .18s ease, box-shadow .18s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Open TugonAI"
        >
          <RiveComponent
            style={{ width: 40, height: 40, display: "block", margin: "12px auto" }}
            onMouseEnter={() => rive && rive.pause()}
            onMouseLeave={() => rive && rive.play()}
          />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "380px",
            height: "560px",
            backgroundColor: "#fff",
            border: `1px solid ${color.mist}55`,
            borderRadius: "20px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${color.ocean}, ${color.teal})`,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#ffffff22",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🤖
              </div>
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>TugonAI</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>General Mathematics Helper</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "#ffffff33",
                border: "none",
                borderRadius: "10px",
                padding: "6px 10px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                transition: "background .18s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff44")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff33")}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* FAQ Buttons */}
          <div
            style={{
              padding: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              height: "38%",
              overflowY: "auto",
              borderBottom: `1px solid ${color.mist}55`,
              background: `${color.mist}11`,
            }}
          >
            {Object.keys(FAQs).map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChatHistory((prev) => [...prev, { sender: "user", text: q }]);
                  const answer = findFAQAnswer(q);
                  if (answer) {
                    setChatHistory((prev) => [...prev, { sender: "tugonAI", text: answer }]);
                  }
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "12.5px",
                  backgroundColor: "#fff",
                  color: color.teal,
                  border: `1px solid ${color.teal}`,
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all .18s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = color.teal;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.color = color.teal;
                }}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>

          {/* Chat Content */}
          <div
            ref={chatRef}
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              fontSize: "14px",
              background: "#fff",
            }}
          >
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 12px",
                    borderRadius: msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    background:
                      msg.sender === "user"
                        ? `linear-gradient(135deg, ${color.teal}, ${color.aqua})`
                        : `${color.mist}22`,
                    color: msg.sender === "user" ? "#fff" : color.deep,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    border: msg.sender === "user" ? "none" : `1px solid ${color.mist}55`,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <strong style={{ fontSize: 11, opacity: 0.85 }}>{msg.sender === "user" ? "You" : "TugonAI"}</strong>
                  <div style={{ marginTop: 4 }}>{msg.text}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ color: color.steel, fontStyle: "italic", fontSize: 13 }}>
                TugonAI is typing…
              </div>
            )}
          </div>

          {/* Input Row */}
          <div
            style={{
              display: "flex",
              borderTop: `1px solid ${color.mist}55`,
              background: "#fafafa",
              padding: "8px",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask something..."
              style={{
                flex: 1,
                border: `1px solid ${color.mist}`,
                background: "#fff",
                padding: "10px 12px",
                fontSize: "14px",
                outline: "none",
                borderRadius: "12px",
                color: color.deep,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04) inset",
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={handleVoiceInput}
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "#fff",
                color: color.teal,
                border: `1px solid ${color.teal}66`,
                fontSize: 18,
                cursor: "pointer",
                transition: "all .18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${color.teal}`;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = color.teal;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = color.teal;
                e.currentTarget.style.borderColor = `${color.teal}66`;
              }}
              title="Speak your question"
              aria-label="Voice input"
            >
              🎤
            </button>

            <button
              onClick={sendMessage}
              style={{
                width: 42,
                height: 38,
                borderRadius: "10px",
                border: "none",
                background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                transition: "transform .12s ease",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              aria-label="Send message"
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
