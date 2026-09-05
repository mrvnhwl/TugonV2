import "./index.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";
import { Toaster } from "react-hot-toast";

import StudentNavbar from "./components/studentNavbar";
import TeacherNavbar from "./components/teacherNavbar";
import TeacherHome from "./pages/teacherHome";
import StudentHome from "./pages/studentHome";
import Quiz from "./pages/Quiz";
import CreateQuiz from "./pages/CreateQuiz";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/teacherDashboard";
import StudentDashboard from "./pages/studentDashboard";
import Challenge from "./pages/Challenge";
import Leaderboards from "./pages/LeaderBoards";
import Game from "./pages/Game";
import TugonSense from "./pages/reviewer/TugonSense";
import TugonPlay from "./pages/reviewer/TugonPlay";
import Operation from "./pages/tugonsense/operations";
import Evaluation from "./pages/tugonsense/evaluation";
import Radio from "./components/Radio";
import FloatingAIButton from "./components/FloatingAIButton";
import ManageSections from "./pages/ManageSections";

import HostGame from "./pages/HostGame";

// TugonSense challenges
import EvaluationDifficultySelector from "./pages/tugonsense/Evaluation/evaluationdifficulty";
import EvaluationPhase1 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase1";
import EvaluationPhase2 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase2";
import EvaluationPhase3 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase3";
import EvaluationPhase4 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase4";

// Built-in topic pages
import Introductiontopic from "./pages/topics/introductiontopic";
import Operationstopic from "./pages/topics/operationstopic";
import Evaluationtopic from "./pages/topics/evaluationtopic";
import Piecewisetopic from "./pages/topics/piecewise";
import Compositiontopic from "./pages/topics/compositiontopic";
import Rationaltopic from "./pages/topics/rationaltopic";
import Asymptotestopic from "./pages/topics/asymptotestopic";
import RationalEquationsInequalities from "./pages/topics/rationalinequalitiestopic";
import Inversetopic from "./pages/topics/inversetopic";
import Exponentialtopic from "./pages/topics/exponentialtopic";
import Logarithmictopic from "./pages/topics/logarithmictopic";

// NEW: topics CRUD flow
import ManageTopics from "./pages/ManageTopics";
import TopicView from "./pages/TopicView";
import EditTopic from "./pages/EditTopic";

import StudentTopics from "./pages/StudentTopics";
import StudentTopicView from "./pages/StudentTopicView";

// Role selection
import UserTypeSelection from "./pages/UserTypeSelection";

// Edit quiz page
import EditQuiz from "./pages/EditQuiz";

// Student Progress page
import StudentProgress from "./pages/StudentProgress";

// Daily Challenge page
import DailyChallengeGame from "./pages/DailyChallengeGame";

// New: TugonsenseProblems
import TopicSelector  from "./pages/tugonsenseproblem/TopicSelector";

// NEW: Topic Creation & Management
import TugonTopics from "./pages/topic_creation/tugon_topics";
import TopicPresenter from "./pages/topic_creation/topic_presenter";
import TopicCreationSelection from "./pages/topic_creation/topic_creation_selection";

const mathJaxConfig = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
  },
  options: {
    skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
  },
};

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  const evaluationRoutes = [
    "/evaluationdifficulty",
    "/eEvaluationPhase1",
    "/eEvaluationPhase2",
    "/eEvaluationPhase3",
    "/eEvaluationPhase4",
  ];

  const teacherPrefixes = [
    "/teacherDashboard",
    "/create-quiz",
    "/teacherHome",
    "/edit-quiz",
    "/quiz/",
    "/manage-sections",
    "/student-progress",
    "/manage-topics",
    "/topicselector",
    "/tugon-topics",
  ];

  const studentPrefixes = ["/", "/studentDashboard", "/studentHome"];

  const isEvaluationRoute = evaluationRoutes.includes(path);
  const isTeacherRoute = teacherPrefixes.some((p) => path.startsWith(p));
  const isStudentRoute = studentPrefixes.some((p) => path === p);

  const hideOnRoutes = [
    "/login",
    "/",
    "/userTypeSelection",
    "/tugon-play",
    "/tugonplay",
    "/tugonSense",
    "/tugonsense",
  ];
  const hideOnPrefixes = ["/edit-quiz"];
  const shouldShowAIButton =
    !hideOnRoutes.includes(path) && !hideOnPrefixes.some((p) => path.startsWith(p));

  return (
    <div className="min-h-screen">
      {isEvaluationRoute ? (
        <main className="min-h-screen bg-gray-50 p-4">
          <Routes>
            <Route path="/evaluationdifficulty" element={<EvaluationDifficultySelector />} />
            <Route path="/eEvaluationPhase1" element={<EvaluationPhase1 />} />
            <Route path="/eEvaluationPhase2" element={<EvaluationPhase2 />} />
            <Route path="/eEvaluationPhase3" element={<EvaluationPhase3 />} />
            <Route path="/eEvaluationPhase4" element={<EvaluationPhase4 />} />
          </Routes>
        </main>
      ) : (
        <div>
          {isTeacherRoute ? <TeacherNavbar /> : isStudentRoute ? <StudentNavbar /> : null}

          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/userTypeSelection" element={<UserTypeSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/teacherHome" element={<TeacherHome />} />
            <Route path="/teacherDashboard" element={<TeacherDashboard />} />
            <Route path="/create-quiz" element={<CreateQuiz />} />
            <Route path="/edit-quiz/:id" element={<EditQuiz />} />
            <Route path="/quiz/:id/edit" element={<EditQuiz />} />
            <Route path="/topicselector" element={<TopicSelector />} />
            <Route path="/topic-creation-selection" element={<TopicCreationSelection />} />
            <Route path="/tugon-topics" element={<TugonTopics />} />
            <Route path="/topic-presenter/:topicId" element={<TopicPresenter />} />
            <Route path="/student-progress" element={<StudentProgress />} />
            <Route path="/manage-topics" element={<ManageTopics />} />
            <Route path="/manage-sections" element={<ManageSections />} />
            <Route path="/topic/:slug" element={<TopicView />} />
            <Route path="/topic/:slug/edit" element={<EditTopic />} />
            <Route path="/studentHome" element={<StudentHome />} />
            <Route path="/studentDashboard" element={<StudentDashboard />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/tugonsense" element={<TugonSense />} />
            <Route path="/tugonplay" element={<TugonPlay />} />
            <Route path="/host" element={<HostGame />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/operations" element={<Operation />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/introductiontopic" element={<Introductiontopic />} />
            <Route path="/operationstopic" element={<Operationstopic />} />
            <Route path="/evaluationtopic" element={<Evaluationtopic />} />
            <Route path="/compositiontopic" element={<Compositiontopic />} />
            <Route path="/rationaltopic" element={<Rationaltopic />} />
            <Route path="/piecewise" element={<Piecewisetopic />} />
            <Route path="/Radio" element={<Radio />} />
            <Route path="/asymptotestopic" element={<Asymptotestopic />} />
            <Route path="/rationalinequalitiestopic" element={<RationalEquationsInequalities />} />
            <Route path="/inversetopic" element={<Inversetopic />} />
            <Route path="/exponentialtopic" element={<Exponentialtopic />} />
            <Route path="/logarithmictopic" element={<Logarithmictopic />} />
            <Route path="/daily-challenge" element={<DailyChallengeGame />} />
            <Route path="/student/topics" element={<StudentTopics />} />
            <Route path="/student/topics/:slug" element={<StudentTopicView />} />
          </Routes>

          {shouldShowAIButton && (
            <FloatingAIButton
              onWrongAnswer={(questionId) => console.log("Wrong answer for:", questionId)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <MathJaxContext config={mathJaxConfig}>
      <Router>
        <Toaster position="bottom-right" />
        <AppContent />
      </Router>
    </MathJaxContext>
  );
}

export default App;
