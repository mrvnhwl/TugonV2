
import './index.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import StudentNavbar from './components/studentNavbar'; // Import StudentNavbar
import TeacherNavbar from './components/teacherNavbar'; // Import TeacherNavbar
import TeacherHome from './pages/teacherHome'; // Import TeacherHome
import StudentHome from './pages/studentHome'; // Import StudentHome
import Quiz from './pages/Quiz';
import CreateQuiz from './pages/CreateQuiz';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacherDashboard'; // Teacher Dashboard
import StudentDashboard from './pages/studentDashboard'; // Student Dashboard
import Challenge from './pages/Challenge';
import Leaderboards from './pages/LeaderBoards';
import Game from './pages/Game';
import TugonSense from './pages/reviewer/TugonSense';

import Operation from './pages/tugonsense/operations';
import Evaluation from './pages/tugonsense/evaluation';
import Radio from './components/Radio';
import FloatingAIButton from './components/FloatingAIButton';

import TugonPlay from './pages/reviewer/TugonPlay';
import HostGame from './pages/HostGame';

// Importing TugonSense challenges pages
import EvaluationDifficultySelector from './pages/tugonsense/Evaluation/evaluationdifficulty';
import EvaluationPhase1 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase1";
import EvaluationPhase2 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase2";
import EvaluationPhase3 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase3";
import EvaluationPhase4 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase4";

import Introductiontopic from './pages/topics/introductiontopic';
import Operationstopic from './pages/topics/operationstopic';
import Evaluationtopic from './pages/topics/evaluationtopic';
import Piecewisetopic from './pages/topics/piecewise';
import Compositiontopic from './pages/topics/compositiontopic';
import Rationaltopic from './pages/topics/rationaltopic';
import Asymptotestopic from './pages/topics/asymptotestopic';
import RationalEquationsInequalities from './pages/topics/rationalinequalitiestopic';
import Inversetopic from './pages/topics/inversetopic';
import Exponentialtopic from './pages/topics/exponentialtopic';
import Logarithmictopic from './pages/topics/logarithmictopic';
import UserTypeSelection from "./pages/UserTypeSelection"; // Import the new component

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  const evaluationRoutes = [
    '/evaluationdifficulty',
    '/eEvaluationPhase1',
    '/eEvaluationPhase2',
    '/eEvaluationPhase3',
    '/eEvaluationPhase4',
  ];

  const teacherRoutes = ['/teacherDashboard', '/create-quiz', '/teacherHome']; 
  const studentRoutes = ['/studentDashboard', '/studentHome']; 

  const isEvaluationRoute = evaluationRoutes.includes(location.pathname);
  const isTeacherRoute = teacherRoutes.includes(location.pathname);
  const isStudentRoute = studentRoutes.includes(location.pathname);

  // 👇 Hide AI button on login
  const hideOnRoutes = ['/login', '/', '/tugon-play', '/tugonSense'];
  const shouldShowAIButton = !hideOnRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {isEvaluationRoute ? (
        <div>
          <main className="min-h-screen bg-gray-50 p-4">
            <Routes>
              <Route path="/evaluationdifficulty" element={<EvaluationDifficultySelector />} />
              <Route path="/eEvaluationPhase1" element={<EvaluationPhase1 />} />
              <Route path="/eEvaluationPhase2" element={<EvaluationPhase2 />} />
              <Route path="/eEvaluationPhase3" element={<EvaluationPhase3 />} />
              <Route path="/eEvaluationPhase4" element={<EvaluationPhase4 />} />
            </Routes>
          </main>
        </div>
      ) : (
        <div>
          {/* ✅ Render the correct navbar */}
          {isTeacherRoute ? (
            <TeacherNavbar />
          ) : isStudentRoute ? (
            <StudentNavbar />
          ) : null}

          <Routes>
            <Route path="/" element={<UserTypeSelection />} /> 
            <Route path="/teacherHome" element={<TeacherHome />} /> 
            <Route path="/studentHome" element={<StudentHome />} /> 
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/create-quiz" element={<CreateQuiz />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/teacherDashboard" element={<TeacherDashboard />} /> 
            <Route path="/studentDashboard" element={<StudentDashboard />} /> 
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/tugonsense" element={<TugonSense />} />
            <Route path="/tugon-play" element={<TugonPlay />} />
            <Route path="/host" element={<HostGame />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/operations" element={<Operation />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/evaluationdifficulty" element={<EvaluationDifficultySelector />} />
            <Route path="/eEvaluationPhase1" element={<EvaluationPhase1 />} />
            <Route path="/eEvaluationPhase2" element={<EvaluationPhase2 />} />
            <Route path="/eEvaluationPhase3" element={<EvaluationPhase3 />} />
            <Route path="/eEvaluationPhase4" element={<EvaluationPhase4 />} />
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
          </Routes>

          {/* ✅ Only show AI button when not on login page */}
          {shouldShowAIButton && (
            <FloatingAIButton onWrongAnswer={(questionId) => console.log('Wrong answer for:', questionId)} />
          )}
        </div>
      )}
    </div>
  );
}


export default App;
