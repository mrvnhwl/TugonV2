import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Timer, CheckCircle, XCircle, X, Volume2, Square } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { MathJax } from "better-react-mathjax";
import color from "../styles/color";

// 🔊 Audio assets
import bgmSrc from "../components/assets/sound/BGM 5.mp3";
import sfxCorrectSrc from "../components/assets/sound/Correct 4.mp3";
import sfxWrongSrc from "../components/assets/sound/wrong.mp3";
import sfxFinishSrc from "../components/assets/sound/Finish.mp3";

interface QuizType {
  id: string;
  title: string;
}

interface Question {
  id: string;
  question: string;
  time_limit: number;
  points: number;
  question_type: "multiplechoice" | "trueorfalse" | "paragraph" | "checkboxes" | "matching";
  matches?: string[];
}

interface Answer {
  id: string;
  answer: string;
  is_correct: boolean;
  side?: "left" | "right";
  match_index?: number | null;
}

type AnswerRecord = {
  selectedAnswerId: string;
  isCorrect: boolean;
  awarded: number;
};

// Helper: Standard Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper to auto-wrap math expressions for MathJax
const wrapMath = (str: string | undefined | null) => {
  if (!str) return "";
  if (/\\\(|\\\[/.test(str)) return str;
  return str.replace(/([a-zA-Z0-9\\]+(\^|_)?(\{[^}]+\})?)/g, (m) => {
    if (/\\|(\^|_)/.test(m)) return `\\(${m}\\)`;
    return m;
  });
};

/** Convert LaTeX/MathJax-ish content into speech-friendly text */
const toSpeakable = (s: string | null | undefined) => {
  if (!s) return "";
  let t = s;
  t = t.replace(/\\\(|\\\)|\\\[|\\\]/g, " ");
  t = t.replace(/\$\$[^$]*\$\$/g, " ");
  t = t.replace(/\$[^$]*\$/g, " ");
  t = t
    .replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, "$1 over $2")
    .replace(/\\times/g, " times ")
    .replace(/\\cdot/g, " dot ")
    .replace(/\\div/g, " divided by ")
    .replace(/\\sqrt\{([^}]*)\}/g, " square root of $1")
    .replace(/\\pi/g, " pi ")
    .replace(/\\pm/g, " plus or minus ")
    .replace(/\\leq/g, " less than or equal to ")
    .replace(/\\geq/g, " greater than or equal to ")
    .replace(/\\neq/g, " not equal to ")
    .replace(/\\left|\\right/g, "");
  t = t.replace(/\\([a-zA-Z]+)/g, "$1 ");
  t = t.replace(/\^(\{[^}]*\}|[^\s^_]+)/g, (_m, p1) => ` to the power of ${String(p1).replace(/[{}]/g, "")} `);
  t = t.replace(/_(\{[^}]*\}|[^\s^_]+)/g, (_m, p1) => ` sub ${String(p1).replace(/[{}]/g, "")} `);
  t = t.replace(/[{}]/g, " ").replace(/\s+/g, " ").trim();
  return t;
};

/* ---------------------------
   Confirm Leave Modal
---------------------------- */
function ConfirmLeaveModal({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur bg-black/30" />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl ring-1"
        style={{ background: "#fff", borderColor: `${color.mist}` }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: color.mist }}
        >
          <h3 className="font-bold text-lg" style={{ color: color.deep }}>
            Leave this quiz?
          </h3>
          <button onClick={onStay} className="p-1 rounded hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 text-sm" style={{ color: color.steel }}>
          Are you sure you want to leave? <strong>You can only attempt once.</strong>
        </div>

        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button
            onClick={onStay}
            className="rounded-xl px-4 py-2 font-semibold border"
            style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
          >
            Stay
          </button>
          <button
            onClick={onLeave}
            className="rounded-xl px-4 py-2 font-semibold"
            style={{ background: color.teal, color: "#fff" }}
          >
            Leave quiz
          </button>
        </div>
      </div>
    </div>
  );
}


function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [matchesByQuestion, setMatchesByQuestion] = useState<Record<string, string[]>>({});
  const [checkboxSelections, setCheckboxSelections] = useState<Record<string, Set<string>>>({});
  const [matchingSelections, setMatchingSelections] = useState<Record<string, number[]>>({});
  const [shuffledMatchOptions, setShuffledMatchOptions] = useState<
    { answer: string; originalIndex: number }[]
  >([]);

  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answerLog, setAnswerLog] = useState<Record<string, AnswerRecord>>({});
  const [paragraphAnswer, setParagraphAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const returnTo = (location.state as any)?.returnTo || "/challenge";

  const [leaveOpen, setLeaveOpen] = useState(false);
  const guardEnabled = !showResult;
  const backAttemptRef = useRef(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[] | null>(null);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxCorrectRef = useRef<HTMLAudioElement | null>(null);
  sfxCorrectRef.current = new Audio(sfxCorrectSrc); // Initialize here
  const sfxWrongRef = useRef<HTMLAudioElement | null>(null);
  sfxWrongRef.current = new Audio(sfxWrongSrc); // Initialize here
  const sfxFinishRef = useRef<HTMLAudioElement | null>(null);
  sfxFinishRef.current = new Audio(sfxFinishSrc); // Initialize here


  // Hide navbar while in quiz
  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  // Preload voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
    };
    loadVoices();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Initialize Audio Elements and STRICT autoplay for BGM
  useEffect(() => {
    const bgm = new Audio(bgmSrc);
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = 0.25;
    bgmRef.current = bgm;

    if (sfxCorrectRef.current) { sfxCorrectRef.current.volume = 0.8; sfxCorrectRef.current.preload = "auto"; }
    if (sfxWrongRef.current) { sfxWrongRef.current.volume = 0.8; sfxWrongRef.current.preload = "auto"; }
    if (sfxFinishRef.current) { sfxFinishRef.current.volume = 0.9; sfxFinishRef.current.preload = "auto"; }

    bgm.play().catch((err) => {
      console.warn("BGM autoplay was blocked by the browser:", err);
    });

    return () => {
      try {
        bgm.pause();
      } catch {}
      bgmRef.current = null;
      // SFX refs are persistent, no need to null them out here if they are initialized once.
    };
  }, []);

  const playCorrectSfx = () => {
    const s = sfxCorrectRef.current;
    if (!s) return;
    try {
      s.currentTime = 0;
      s.play();
    } catch {}
  };

  const playWrongSfx = () => {
    const s = sfxWrongRef.current;
    if (!s) return;
    try {
      s.currentTime = 0;
      s.play();
    } catch {}
  };

  const playFinishSfx = () => {
    const s = sfxFinishRef.current;
    if (!s) return;
    try {
      s.currentTime = 0;
      s.play();
    } catch {}
  };

  const stopBgm = () => {
    try {
      bgmRef.current?.pause();
    } catch {}
  };

  const stopSpeaking = () => {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setIsSpeaking(false);
  };

  // Builds the speech string WITHOUT "Question N of M"
  const buildSpeechForCurrent = () => {
    if (!currentQuestion) return "";
    const qText = toSpeakable(currentQuestion.question);
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const choiceText = answers.map((a, i) => {
      const label = alpha[i] || `${i + 1}`;
      return `${label}) ${toSpeakable(a.answer)}`;
    });
    return `Question: ${qText}. Choices: ${choiceText.join(". ")}.`;
  };

  const pickStudentFriendlyVoice = (voices: SpeechSynthesisVoice[]) => {
    const preferredNames = [
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Aria Online (Natural) - English (US)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Ava Online (Natural) - English (United States)",
      "Google US English",
      "Google UK English Female",
      "Google UK English Male",
      "Samantha",
      "Victoria",
    ];
    const byName =
      voices.find((v) => preferredNames.includes(v.name)) ||
      voices.find((v) => /en(-|_| )PH/i.test(v.lang)) ||
      voices.find((v) => /en(-|_| )US/i.test(v.lang)) ||
      voices.find((v) => /en(-|_| )GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang));
    return byName || voices[0];
  };

  const speakCurrent = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Read Aloud is not supported in this browser.");
      return;
    }
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = buildSpeechForCurrent();
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    const voices = voicesRef.current || window.speechSynthesis.getVoices();
    const chosen = pickStudentFriendlyVoice(voices);
    if (chosen) {
      utter.voice = chosen;
      utter.lang = chosen.lang || "en-US";
    } else {
      utter.lang = "en-US";
    }
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.volume = 1.0;

    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  // Stop speech & music if unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopBgm();
    };
  }, []);

  // Load quiz + questions
  const loadQuizContent = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const { data: quizData, error: quizError } = await supabase.from("quizzes").select("*").eq("id", id).single();

      if (quizError) throw quizError;
      setQuiz(quizData as QuizType);

      const { data: questionsData, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", id)
        .order("created_at");

      if (qErr) throw qErr;

      if (questionsData && questionsData.length > 0) {
        const qs = (questionsData as Question[]).map((q) => ({
          ...q,
          points: Math.round(Number(q.points) || 0),
        }));

        setQuestions(qs);
        setCurrentQuestion(qs[0]);
        setQuestionIndex(0);
        setAnswerLog({});


      } else {
        setQuestions([]);
        setCurrentQuestion(null);
      }
    } catch (e) {
      console.error("Error loading quiz:", e);
      toast.error("Failed to load quiz.");
    }
  };

  useEffect(() => {
    loadQuizContent();
  }, [id, user, navigate]); // Depend on id, user, navigate


  // Load answers when the current question changes and sync isAnswered from log
  useEffect(() => {
    const loadAnswers = async (questionId: string) => {
      try {
        const { data: answersData, error } = await supabase
          .from("answers")
          .select("*")
          .eq("question_id", questionId);

        if (error) throw error;

        const allAnswers = (answersData as any[]) || [];

        const leftItems = allAnswers.filter((a) => a.side === "left");
        const rightItems = allAnswers.filter((a) => a.side === "right");

        setAnswers(leftItems);

        setMatchesByQuestion((prev) => ({
          ...prev,
          [questionId]: rightItems.map((r) => r.answer),
        }));

        const q = currentQuestion;
        const qId = q?.id;
        const qType = qTypeOf(q);

        if (q && qId && qType === "matching") {
          const indexedMatches = rightItems.map((r, originalIndex) => ({
            answer: r.answer,
            originalIndex: originalIndex,
          }));

          setShuffledMatchOptions(shuffleArray(indexedMatches));

          const leftCount = leftItems.length || 0;
          setMatchingSelections((prev) => ({
            ...prev,
            [qId]: Array(leftCount).fill(-1),
          }));
        } else {
          setMatchingSelections((prev) => {
            if (prev[qId as string]) {
              const copy = { ...prev };
              delete copy[qId as string];
              return copy;
            }
            return prev;
          });
          setShuffledMatchOptions([]);

          if (qType === "checkboxes" && qId) {
            setCheckboxSelections((prev) => ({
              ...prev,
              [qId]: new Set<string>(),
            }));
          } else {
            setCheckboxSelections((prev) => {
              if (prev[qId as string]) {
                const copy = { ...prev };
                delete copy[qId as string];
                return copy;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.error("Error loading answers:", e);
        toast.error("Failed to load answers.");
      }
    };

    if (currentQuestion) {
      const start = currentQuestion.time_limit || 30;
      setTimeLeft(start);
      setIsAnswered(!!answerLog[currentQuestion.id]);
      stopSpeaking();
      loadAnswers(currentQuestion.id);
      setParagraphAnswer("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, answerLog]);


  // Countdown
  useEffect(() => {
    if (!isAnswered && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (!isAnswered && timeLeft === 0) {
      setIsAnswered(true);
    }
  }, [timeLeft, isAnswered]);

  const totalPoints = useMemo(
    () => (questions?.length ? questions.reduce((s, q) => s + (q.points || 0), 0) : 0),
    [questions]
  );

  const progressPct = useMemo(
    () => (questions.length ? Math.round(((questionIndex + 1) / questions.length) * 100) : 0),
    [questionIndex, questions.length]
  );

  /** Derived, idempotent score from answerLog */
  const score = useMemo(
    () => Object.values(answerLog).reduce((sum, r) => sum + (r.awarded || 0), 0),
    [answerLog]
  );

  /** Derived correct count from answerLog */
  const correctCount = useMemo(
    () => Object.values(answerLog).reduce((sum, r) => sum + (r.isCorrect ? 1 : 0), 0),
    [answerLog]
  );

  // helpers to normalize question_type strings (support variants like "multiple_choice")
  const qTypeOf = (q?: Question | null) =>
    (q?.question_type || "").toString().toLowerCase().replace(/[_\s-]/g, "");

  // checkbox handlers (student)
  const toggleCheckboxSelection = (qId: string, answerId: string) => {
    setCheckboxSelections((prev) => {
      const set = new Set(prev[qId] ? Array.from(prev[qId]) : []);
      if (set.has(answerId)) set.delete(answerId);
      else set.add(answerId);
      return { ...prev, [qId]: set };
    });
  };

  const submitCheckboxAnswer = () => {
    if (!currentQuestion) return;
    if (isAnswered) return;

    const qId = currentQuestion.id;
    const selected = Array.from(checkboxSelections[qId] || []);

    if (selected.length === 0) {
      toast.error("Please select at least one option.");
      return;
    }

    const correctIds = answers.filter((a) => a.is_correct).map((a) => String(a.id));
    const selectedIds = selected.map(String);

    const equal =
      correctIds.length === selectedIds.length &&
      correctIds.sort().join(",") === selectedIds.sort().join(",");

    const base = currentQuestion.points || 0;

    if (equal) {
      playCorrectSfx();
    } else {
      playWrongSfx();
    }

    setAnswerLog((prev) => ({
      ...prev,
      [qId]: {
        selectedAnswerId: JSON.stringify(selectedIds),
        isCorrect: equal,
        awarded: equal ? base : 0,
      },
    }));

    setIsAnswered(true);
    toast.success("Answer submitted.");
  };


  // matching handlers (student)
  const setMatchingChoice = (qId: string, leftIndex: number, rightIndex: number) => {
    setMatchingSelections((prev) => {
      const arr = prev[qId] ? [...prev[qId]] : [];
      arr[leftIndex] = rightIndex;
      return { ...prev, [qId]: arr };
    });
  };

  const submitMatchingAnswer = async () => {
    if (!currentQuestion || !user) return;
    if (isAnswered) return;

    const qId = currentQuestion.id;
    const mapping = matchingSelections[qId] || [];

    if (mapping.some((m) => m === -1)) {
      toast.error("Please match all left items before submitting.");
      return;
    }

    if (timeLeft <= 0) {
      toast.error("Time's up! No points awarded.");
      setIsAnswered(true);
      setAnswerLog((prev) => ({
        ...prev,
        [qId]: { selectedAnswerId: JSON.stringify(mapping), isCorrect: false, awarded: 0 },
      }));
      return;
    }

    try {
      await supabase.from("matching_responses").insert({
        user_id: user.id,
        quiz_id: id,
        question_id: qId,
        mapping,
      });
    } catch (e) {
      console.error("Failed to save matching response:", e);
      toast.error("Failed to submit answer. Please try again.");
      return;
    }

    const leftItems = answers.filter((a) => a.side === "left");
    const correctMapping = leftItems.map((a) => a.match_index ?? -1);

    let correctCount = 0;
    for (let i = 0; i < correctMapping.length; i++) {
      if (mapping[i] === correctMapping[i]) correctCount++;
    }

    const total = leftItems.length;
    const percentCorrect = total > 0 ? correctCount / total : 0;
    const base = currentQuestion.points || 0;
    const awarded =
      percentCorrect === 1 ? base : Math.round(base * percentCorrect);


    if (percentCorrect === 1) playCorrectSfx();
    else playWrongSfx();

    setAnswerLog((prev) => ({
      ...prev,
      [qId]: {
        selectedAnswerId: JSON.stringify(mapping),
        isCorrect: percentCorrect === 1,
        awarded,
      },
    }));

    setIsAnswered(true);
    toast.success(
      percentCorrect === 1
        ? `Perfect! Full ${base} points 🎯`
        : `Partial credit: ${awarded} / ${base} points`
    );
  };


  const handleAnswer = (answer: Answer) => {
    if (!currentQuestion) return;

    if (answerLog[currentQuestion.id]) {
      setIsAnswered(true);
      return;
    }

    setIsAnswered(true);

    const base = currentQuestion.points || 0;

    if (answer.is_correct) {
      const awarded = base;
      playCorrectSfx();

      setAnswerLog((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedAnswerId: answer.id,
          isCorrect: true,
          awarded,
        },
      }));
    } else {
      playWrongSfx();

      setAnswerLog((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedAnswerId: answer.id,
          isCorrect: false,
          awarded: 0,
        },
      }));
    }
  };


  const submitParagraphAnswer = async () => {
    if (!currentQuestion || !user) return;
    if (isAnswered) return;

    const text = paragraphAnswer.trim();
    if (!text) {
      toast.error("Please enter your answer.");
      return;
    }

    setIsAnswered(true);

    try {
      const { data: inserted, error } = await supabase
        .from("paragraph_responses")
        .insert({
          user_id: user.id,
          quiz_id: id,
          question_id: currentQuestion.id,
          answer_text: text,
        })
        .select()
        .single();

      if (error) throw error;

      const selectedId = inserted?.id ? String(inserted.id) : "paragraph_response";

      setAnswerLog((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedAnswerId: selectedId,
          isCorrect: false,
          awarded: 0,
        },
      }));

      toast.success("Answer submitted.");
    } catch (e) {
      console.error("Failed to save paragraph response:", e);
      toast.error("Failed to submit answer. Please try again.");
      setIsAnswered(false);
    }
  };

  const nextQuestion = () => {
    if (!questions.length) return;
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (!questions.length) return;
    if (questionIndex > 0) {
      const prevIndex = questionIndex - 1;
      setQuestionIndex(prevIndex);
      setCurrentQuestion(questions[prevIndex]);
    }
  };

  const finishQuiz = async () => {
    try {
      await supabase.from("user_progress").insert({
        user_id: user?.id,
        quiz_id: id,
        score,
        user_email: user?.email,
      });
    } catch (e) {
      console.error("Error saving progress:", e);
      toast.error("Failed to save progress.");
    }

    playFinishSfx();
    stopBgm();

    setShowResult(true);
  };

  const handleRetryQuiz = () => {
    setShowResult(false);
    setQuestionIndex(0);
    setAnswerLog({});
    setParagraphAnswer("");
    setCheckboxSelections({});
    setMatchingSelections({});
    setIsAnswered(false);
    setCurrentQuestion(questions[0]); // Reset to the first question
    toast.info("Quiz has been reset. Good luck!");
    
    // Ensure BGM restarts if it was stopped for the finish sfx
    try {
      bgmRef.current?.play().catch((err) => console.warn("BGM autoplay was blocked on retry:", err));
    } catch {}
  };


  // Native browser confirm on refresh/close or hard navigation
  useEffect(() => {
    if (!guardEnabled) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [guardEnabled]);

  // Intercept browser Back with a modal using a history pushState loop
  useEffect(() => {
    if (!guardEnabled) return;
    const push = () => window.history.pushState({ qguard: true }, "", window.location.href);
    push();
    const onPop = (_ev: PopStateEvent) => {
      if (!guardEnabled) return;
      backAttemptRef.current = true;
      setLeaveOpen(true);
      push();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [guardEnabled]);

  const handleStay = () => {
    backAttemptRef.current = false;
    setLeaveOpen(false);
  };

  const handleLeave = () => {
    setLeaveOpen(false);
    stopBgm();
    if (backAttemptRef.current) {
      backAttemptRef.current = false;
      navigate(returnTo, { replace: true });
    } else {
      navigate(returnTo, { replace: true });
    }
  };

  if (!quiz || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: color.teal }}
        />
      </div>
    );
  }

  const headerGradient = `linear-gradient(135deg, ${color.ocean} 0%, ${color.teal} 55%, ${color.aqua} 100%)`;
  const cardBorder = `${color.mist}66`;

  // Get awarded points for display
  const awardedPoints = answerLog[currentQuestion.id]?.awarded;
  
  // Define a safe, simple red color for failed attempts
  const failColor = "#dc2626"; // Tailwind CSS red-600

  // Helper to check if it's a selection-based question (MC, T/F, Checkboxes)
  const isSelectionType = ["multiplechoice", "trueorfalse", "checkboxes"].includes(qTypeOf(currentQuestion));

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(${color.mist}11, #fff)` }}>
      {/* Header */}
      <header
        className="relative"
        style={{ background: headerGradient, boxShadow: "0 10px 26px rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white text-center">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
            <MathJax dynamic inline>{wrapMath(quiz?.title || "")}</MathJax>
          </h1>
          
          {/* Timer and Total Score (Side-by-Side) */}
          <div className="flex justify-center items-center gap-4 mt-3">
              {/* Timer */}
              <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                  style={{ background: "#ffffff22", border: "1px solid #ffffff33" }}
              >
                  <Timer className="h-4 w-4" />
                  <span>{timeLeft}s</span>
              </div>
              
              {/* TOTAL SCORE Indicator */}
              <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold"
                  style={{ background: "#ffffff44", border: "1px solid #ffffff33" }}
              >
                  <span className="text-xs">SCORE:</span>
                  <span className="text-lg">{score.toLocaleString()}</span>
              </div>
          </div>

          {/* Read Aloud */}
          <div className="mt-3">
            <button
              onClick={speakCurrent}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold border transition"
              style={{
                background: "#ffffff22",
                borderColor: "#ffffff33",
                color: "white",
              }}
              aria-label={isSpeaking ? "Stop reading" : "Read question and answers"}
              title={isSpeaking ? "Stop" : "Read Aloud"}
            >
              {isSpeaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isSpeaking ? "Stop" : "Read Aloud"}
            </button>
          </div>

          {/* Progress (visual only) */}
          <div className="mt-3 text-xs opacity-90">
            Question {questionIndex + 1} of {questions.length} 
            {/* Points Display */}
            <span className="ml-2 font-bold">({currentQuestion.points} Points)</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full overflow-hidden" style={{ background: "#ffffff2f" }}>
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${progressPct}%`,
                background: "#fff",
                boxShadow: "0 2px 10px rgba(255,255,255,.45)",
                transition: "width .25s ease",
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl ring-1 p-6 sm:p-7" style={{ borderColor: cardBorder }}>
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold" style={{ color: color.deep }}>
              <MathJax dynamic inline>{wrapMath(currentQuestion.question)}</MathJax>
            </h2>
          </div>

          {/* Answers */}
          {currentQuestion.question_type === "paragraph" ? (
            <div className="mt-4">
              <textarea
                value={paragraphAnswer}
                onChange={(e) => setParagraphAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isAnswered}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none text-gray-800 resize-none min-h-[120px]"
              />
              {!isAnswered && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={submitParagraphAnswer}
                    className="px-6 py-2 rounded-lg text-white font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                    }}
                  >
                    Submit Answer
                  </button>
                  <div className="text-sm text-gray-500">This answer will be saved and marked later.</div>
                </div>
              )}
              {isAnswered && (
                <div className="mt-3 text-sm text-green-600">Answer submitted — waiting for grading.</div>
              )}
            </div>
          ) : (
            (() => {
              const qType = qTypeOf(currentQuestion);

              // CHECKBOXES
              if (qType === "checkboxes") {
                const qId = currentQuestion.id;
                const sel = checkboxSelections[qId] || new Set<string>();
                return (
                  <div className="col-span-1 md:col-span-2">
                    {/* Enforced 2-column for checkboxes as requested */}
                    <div className="grid gap-3 grid-cols-2"> 
                      {answers.map((ans) => (
                        <label
                          key={ans.id}
                          className="p-3 rounded-full border flex items-center gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <input
                            type="checkbox"
                            disabled={isAnswered}
                            checked={sel.has(ans.id)}
                            onChange={() => toggleCheckboxSelection(qId, ans.id)}
                            className="h-4 w-4"
                          />
                          <span className="flex-grow">
                            <MathJax dynamic inline>{wrapMath(ans.answer)}</MathJax>
                          </span>
                        </label>
                      ))}
                      {!isAnswered && (
                        <div className="col-span-2 flex gap-2 mt-3 justify-end">
                          <button
                            type="button"
                            onClick={submitCheckboxAnswer}
                            className="px-4 py-2 rounded-lg text-white"
                            style={{
                              background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                            }}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // MATCHING
              if (qType === "matching") {
                const qId = currentQuestion.id;
                const lefts = answers;
                const mapping = matchingSelections[qId] || Array(lefts.length).fill(-1);
                const shuffledOptions = shuffledMatchOptions;

                return (
                  <div className="col-span-1 md:col-span-2">
                    <div className="font-semibold mb-3">Match the following</div>

                    <div className="grid grid-cols-2 gap-4">
                      {lefts.map((leftItem, leftIndex) => (
                        <div key={leftIndex} className="flex items-center gap-4">
                          <div className="flex-1 p-3 rounded-lg border text-sm text-gray-700 bg-gray-50">
                            <MathJax dynamic inline>
                              {wrapMath(leftItem.answer)}
                            </MathJax>
                          </div>
                          <div className="flex-1">
                            <select
                              className="w-full p-2.5 rounded-lg border-2 border-gray-200 focus:border-teal-500 text-sm disabled:bg-gray-100"
                              value={mapping[leftIndex]}
                              onChange={(e) =>
                                setMatchingChoice(
                                  qId,
                                  leftIndex,
                                  Number(e.target.value)
                                )
                              }
                              disabled={isAnswered}
                            >
                              <option value={-1} disabled>
                                Select Match
                              </option>
                              {shuffledOptions.map((matchData, shuffledIndex) => (
                                <option
                                  key={shuffledIndex}
                                  value={matchData.originalIndex}
                                >
                                  <MathJax dynamic inline>
                                    {wrapMath(matchData.answer)}
                                  </MathJax>
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isAnswered && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <button
                          type="button"
                          onClick={submitMatchingAnswer}
                          className="px-4 py-2 rounded-lg text-white"
                          style={{
                            background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              // MULTIPLE CHOICE / TRUE OR FALSE (Default: simple select)
              // Enforced 2-column for all MC/T-F
              return (
                <div className="grid gap-3 grid-cols-2">
                  {answers.map((ans, idx) => {
                    const alpha = ["A", "B", "C", "D", "E", "F"][idx] || `${idx + 1}`;
                    const answered = answerLog[currentQuestion.id];
                    const isSelected = answered?.selectedAnswerId === ans.id;
                    const isCorrect = ans.is_correct;

                    let bgColor = isSelected ? color.mist : "bg-gray-50";
                    let borderColor = isSelected ? color.teal : "border-gray-200";

                    if (isAnswered) {
                      if (isCorrect) {
                        bgColor = "#d1fae5"; // green-100
                        borderColor = "#34d399"; // green-400
                      } else if (isSelected && !isCorrect) {
                        bgColor = "#fee2e2"; // red-100
                        borderColor = "#f87171"; // red-400
                      }
                    }
                    
                    // The main button is the answer choice
                    return (
                      <button
                        key={ans.id}
                        onClick={() => handleAnswer(ans)}
                        disabled={isAnswered}
                        // Simplified classes for correct grid rendering
                        className={`p-3 rounded-full border flex items-center gap-3 transition-all text-left ${bgColor}`}
                        style={{ borderColor, cursor: isAnswered ? "default" : "pointer" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            background: isAnswered && isCorrect ? color.teal : isSelected ? color.teal : color.mist,
                            color: isAnswered && isCorrect ? "white" : isSelected ? "white" : color.steel,
                            border: `1px solid ${isAnswered && isCorrect ? color.teal : isSelected ? color.teal : color.mist}`,
                          }}
                        >
                          {alpha}
                        </div>
                        <span className="flex-grow text-sm" style={{ color: color.deep }}>
                          <MathJax dynamic inline>{wrapMath(ans.answer)}</MathJax>
                        </span>
                        {isAnswered && (
                          <div className="shrink-0">
                            {isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : isSelected ? (
                              <XCircle className="h-6 w-6 text-red-500" />
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })())}
          

          {/* 🎯 Score Indicator (Simplified to just "Score: 1,000") */}
          {isAnswered && qTypeOf(currentQuestion) !== "paragraph" && (
              <div className="mt-6 p-4 rounded-xl border text-center font-bold text-lg"
                   style={{
                      borderColor: awardedPoints > 0 ? color.teal : failColor,
                      background: awardedPoints > 0 ? `${color.teal}10` : `${failColor}10`,
                      color: awardedPoints > 0 ? color.teal : failColor,
                   }}>
                  <span className="flex items-center justify-center gap-2">
                      {awardedPoints > 0 ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <XCircle className="h-6 w-6" />
                      )}
                      <span className="text-xl">Score: {awardedPoints?.toLocaleString() || 0}</span>
                  </span>
              </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevQuestion}
            disabled={questionIndex === 0 || !isAnswered}
            className="px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            style={{
              background: "#fff",
              color: color.deep,
              border: `1px solid ${color.mist}`,
            }}
          >
            Previous
          </button>
          {isAnswered && (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 rounded-lg text-white font-semibold"
              style={{
                background: `linear-gradient(135deg, ${color.ocean}, ${color.teal})`,
              }}
            >
              {questionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </button>
          )}
        </div>
      </main>

      {/* Results Modal */}
      {showResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur bg-black/30" />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl ring-1 text-center p-8"
            style={{ background: "#fff", borderColor: `${color.mist}` }}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="font-extrabold text-3xl mb-4" style={{ color: color.teal }}>
              Quiz Complete! 🏆
            </h3>
            <p className="text-lg mb-6 font-bold" style={{ color: color.deep }}>
              {/* FIX: Removed ** Markdown asterisks from "Total Score" */}
              You obtained a Total Score of <span style={{ color: color.teal }}>{score.toLocaleString()}</span> out of {totalPoints.toLocaleString()} possible points.
            </p>
            <p className="text-md mb-8" style={{ color: color.steel }}>
              You got {correctCount} out of {questions.length} questions correct.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate(returnTo, { replace: true })}
                    className="rounded-xl px-6 py-3 font-bold text-lg"
                    style={{ background: color.teal, color: "#fff", boxShadow: "0 8px 20px rgba(0,190,170,0.3)" }}
                >
                    Back to Challenges
                </button>
                <button
                    onClick={handleRetryQuiz}
                    className="rounded-xl px-6 py-3 font-bold text-lg border-2"
                    style={{ background: "white", color: color.teal, borderColor: color.teal, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                >
                    Retry Quiz
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      <ConfirmLeaveModal
        open={leaveOpen}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    </div>
  );
}

export default Quiz;