import React from 'react';
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
import JoinGame from './pages/JoinGame';
import HostGame from './pages/HostGame';
import Game from './pages/Game';
import TugonSense from './pages/TugonSense';

import Operation from './pages/tugonsense/operations';
import Evaluation from './pages/tugonsense/evaluation';
import Radio from './components/Radio';
import FloatingAIButton from './components/FloatingAIButton';

// Importing TugonSense challenges pages
import EvaluationDifficultySelector from './pages/tugonsense/Evaluation/evaluationdifficulty';
import EvaluationPhase1 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase1";
import EvaluationPhase2 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase2";
import EvaluationPhase3 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase3";
import EvaluationPhase4 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase4";

// aEvaluation (Average Evaluation Phases)
import AEvaluationPhase1 from "./pages/tugonsense/Evaluation/aEvaluation/aEvaluationPhase1";
import AEvaluationPhase2 from "./pages/tugonsense/Evaluation/aEvaluation/aEvaluationPhase2";
import AEvaluationPhase3 from "./pages/tugonsense/Evaluation/aEvaluation/aEvaluationPhase3";
import AEvaluationPhase4 from "./pages/tugonsense/Evaluation/aEvaluation/aEvaluationPhase4";

// hEvaluation (Hard Evaluation Phases)
import HEvaluationPhase1 from "./pages/tugonsense/Evaluation/hEvaluation/hEvaluationPhase1";
import HEvaluationPhase2 from "./pages/tugonsense/Evaluation/hEvaluation/hEvaluationPhase2";
import HEvaluationPhase3 from "./pages/tugonsense/Evaluation/hEvaluation/hEvaluationPhase3";
import HEvaluationPhase4 from "./pages/tugonsense/Evaluation/hEvaluation/hEvaluationPhase4";

import Introductiontopic from './pages/topics/introductiontopic';
import Operationstopic from './pages/topics/operationstopic';
import Evaluationtopic from './pages/topics/evaluationtopic';
import InteractiveGraph from './pages/topics/graphs';
import Compositiontopic from './pages/topics/compositiontopic';
import Rationaltopic from './pages/topics/rationaltopic';
import Asymptotestopic from './pages/topics/asymptotestopic';
import RationalEquationsInequalities from './pages/topics/rationalinequalitiestopic';
import Inversetopic from './pages/topics/inversetopic';
import ExponentialLogarithmictopic from './pages/topics/exponentialandlogtopic';
import FunctionProblemSolvingtopic from './pages/topics/problemsolvingfunctopic';
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
    '/aEvaluationPhase1',
    '/aEvaluationPhase2',
    '/aEvaluationPhase3',
    '/aEvaluationPhase4',
    '/hEvaluationPhase1',
    '/hEvaluationPhase2',
    '/hEvaluationPhase3',
    '/hEvaluationPhase4',
  ];

  const teacherRoutes = ['/teacherDashboard', '/create-quiz', '/teacherHome']; // Routes specific to teachers
  const studentRoutes = ['/studentDashboard', '/studentHome']; // Routes specific to students
  const isEvaluationRoute = evaluationRoutes.includes(location.pathname);
  const isTeacherRoute = teacherRoutes.includes(location.pathname);
  const isStudentRoute = studentRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {isEvaluationRoute ? (
        // Apply Evaluation-specific layout
        <div>

          <main className="min-h-screen bg-gray-50 p-4">
            <Routes>
              <Route path="/evaluationdifficulty" element={<EvaluationDifficultySelector />} />
              <Route path="/eEvaluationPhase1" element={<EvaluationPhase1 />} />
              <Route path="/eEvaluationPhase2" element={<EvaluationPhase2 />} />
              <Route path="/eEvaluationPhase3" element={<EvaluationPhase3 />} />
              <Route path="/eEvaluationPhase4" element={<EvaluationPhase4 />} />

              {/* Average Evaluation Phases */}
              <Route path="/aEvaluationPhase1" element={<AEvaluationPhase1 />} />
              <Route path="/aEvaluationPhase2" element={<AEvaluationPhase2 />} />
              <Route path="/aEvaluationPhase3" element={<AEvaluationPhase3 />} />
              <Route path="/aEvaluationPhase4" element={<AEvaluationPhase4 />} />

              {/* Hard Evaluation Phases */}
                <Route path="/hEvaluationPhase1" element={<HEvaluationPhase1 />} />
                <Route path="/hEvaluationPhase2" element={<HEvaluationPhase2 />} />
                <Route path="/hEvaluationPhase3" element={<HEvaluationPhase3 />} />
                <Route path="/hEvaluationPhase4" element={<HEvaluationPhase4 />} />
                
            </Routes>
          </main>
        </div>
      ) : (
        // Apply global layout
        <div>
          {/* Render the appropriate navbar */}
          {isTeacherRoute ? (
            <TeacherNavbar />
          ) : isStudentRoute ? (
            <StudentNavbar />
          ) : null}

          <Routes>
            <Route path="/" element={<UserTypeSelection />} /> {/* Default route */}
            <Route path="/teacherHome" element={<TeacherHome />} /> {/* Teacher Home page */}
            <Route path="/studentHome" element={<StudentHome />} /> {/* Student Home page */}
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/create-quiz" element={<CreateQuiz />} /> {/* Create Quiz route */}
            <Route path="/login" element={<Login />} />
            <Route path="/teacherDashboard" element={<TeacherDashboard />} /> {/* Teacher Dashboard */}
            <Route path="/studentDashboard" element={<StudentDashboard />} /> {/* Student Dashboard */}
            <Route path="/join" element={<JoinGame />} />
            <Route path="/tugonsense" element={<TugonSense />} />
            <Route path="/host" element={<HostGame />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/operations" element={<Operation />} />
            <Route path="/evaluation" element={<Evaluation />} />

            {/* TugonSense quizzes */}
            <Route path="/evaluationdifficulty" element={<EvaluationDifficultySelector />} />
            <Route path="/eEvaluationPhase1" element={<EvaluationPhase1 />} />
            <Route path="/eEvaluationPhase2" element={<EvaluationPhase2 />} />
            <Route path="/eEvaluationPhase3" element={<EvaluationPhase3 />} />
            <Route path="/eEvaluationPhase4" element={<EvaluationPhase4 />} />
            <Route path="/introductiontopic" element={<Introductiontopic />} />
            <Route path="/operationstopic" element={<Operationstopic />} />
            <Route path="/evaluationtopic" element={<Evaluationtopic />} />
            <Route path="/graphs" element={<InteractiveGraph />} />
            <Route path="/compositiontopic" element={<Compositiontopic />} />
            <Route path="/rationaltopic" element={<Rationaltopic />} />
            <Route path="/Radio" element={<Radio />} />
            <Route path="/asymptotestopic" element={<Asymptotestopic />} />
            <Route path="/rationalinequalitiestopic" element={<RationalEquationsInequalities />} />
            <Route path="/inversetopic" element={<Inversetopic />} />
            <Route path="/exponentialandlogtopic" element={<ExponentialLogarithmictopic />} />
            <Route path="/problemsolvingfunctopic" element={<FunctionProblemSolvingtopic />} />
          </Routes>
          <FloatingAIButton onWrongAnswer={(questionId) => console.log('Wrong answer for:', questionId)} />
        </div>
      )}
    </div>
  );
}

export default App;
