import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import CreateQuiz from './pages/CreateQuiz';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JoinGame from './pages/JoinGame';
import HostGame from './pages/HostGame';
import Game from './pages/Game';
import TugonSense from './pages/TugonSense';

import Operation from './pages/tugonsense/operations';
import Evaluation from './pages/tugonsense/evaluation';
import Radio from './components/Radio';
import FloatingAIButton from './components/FloatingAIButton';

// Importing Tugonsense challenges pages
// Evaluation
import EvaluationDifficultySelector from './pages/tugonsense/Evaluation/evaluationdifficulty';
import EvaluationPhase1 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase1";
import EvaluationPhase2 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase2";
import EvaluationPhase3 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase3";
import EvaluationPhase4 from "./pages/tugonsense/Evaluation/eEvaluation/eEvaluationPhase4";

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

  const isEvaluationRoute = evaluationRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {isEvaluationRoute ? (
        // Apply Evaluation-specific layout
        <div>
          <header className="bg-indigo-600 text-white py-4 text-center">
            <h1 className="text-2xl font-bold">TUGON SENSE</h1>
            <p className="text-sm">Test your knowledge in multiple phases</p>
          </header>
          <main className="min-h-screen bg-gray-50 p-4">
            <Routes>
              <Route path="/evaluationdifficulty" element={<EvaluationDifficultySelector />} />
              <Route path="/eEvaluationPhase1" element={<EvaluationPhase1 />} />
              <Route path="/eEvaluationPhase2" element={<EvaluationPhase2 />} />
              <Route path="/eEvaluationPhase3" element={<EvaluationPhase3 />} />
              <Route path="/eEvaluationPhase4" element={<EvaluationPhase4 />} />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white py-4 text-center">
            <p className="text-sm">© 2025 Tugon Prototype. All rights reserved.</p>
          </footer>
        </div>
      ) : (
        // Apply global layout
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/create" element={<CreateQuiz />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/join" element={<JoinGame />} />
            <Route path="/tugonsense" element={<TugonSense />} />
            <Route path="/host" element={<HostGame />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/operations" element={<Operation />} />
            <Route path="/evaluation" element={<Evaluation />} />

            {/* TugonSense quizzes */}
            {/* Evaluation */}
            <Route path="difficulty" element={<EvaluationDifficultySelector />} />
            <Route path="phase1" element={<EvaluationPhase1 />} />
            <Route path="phase2" element={<EvaluationPhase2 />} />
            <Route path="phase3" element={<EvaluationPhase3 />} />
            <Route path="phase4" element={<EvaluationPhase4 />} />
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
