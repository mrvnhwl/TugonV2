import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, Users, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface GameSession {
  id: string;
  quiz_id: string;
  host_id: string;
  status: 'waiting' | 'in_progress' | 'completed';
  current_question_index: number;
}

interface Participant {
  id: string;
  user_id: string;
  score: number;
  user: {
    email: string;
  };
}

interface Question {
  id: string;
  question: string;
  time_limit: number;
  points: number;
}

interface Answer {
  id: string;
  answer: string;
  is_correct: boolean;
}

function Game() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isHost, setIsHost] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadGameSession();
    subscribeToGameChanges();
  }, [id, user]);

  const loadGameSession = async () => {
    try {
      // Load session details
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionData) {
        setSession(sessionData);
        setIsHost(sessionData.host_id === user?.id);

        // Load participants
        const { data: participantsData } = await supabase
          .from('game_participants')
          .select('*, user:users(email)')
          .eq('session_id', id)
          .order('score', { ascending: false });

        if (participantsData) {
          setParticipants(participantsData);
        }

        // Load current question if game is in progress
        if (sessionData.status === 'in_progress') {
          loadQuestion(sessionData.current_question_index);
        }
      }
    } catch (error) {
      console.error('Error loading game session:', error);
    }
  };

  const subscribeToGameChanges = () => {
    const subscription = supabase
      .channel('game_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_sessions',
        filter: `id=eq.${id}`
      }, (payload) => {
        if (payload.new) {
          setSession(payload.new as GameSession);
          if (payload.new.status === 'in_progress') {
            loadQuestion(payload.new.current_question_index);
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_participants',
        filter: `session_id=eq.${id}`
      }, () => {
        loadGameSession();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadQuestion = async (index: number) => {
    try {
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', session?.quiz_id)
        .order('created_at');

      if (questionsData && questionsData[index]) {
        const question = questionsData[index];
        setCurrentQuestion(question);
        setTimeLeft(question.time_limit);
        setSelectedAnswer(null);
        setShowResults(false);

        const { data: answersData } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', question.id);

        if (answersData) {
          setAnswers(answersData);
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
  };

  const startGame = async () => {
    if (!isHost) return;

    try {
      await supabase
        .from('game_sessions')
        .update({
          status: 'in_progress',
          current_question_index: 0,
          started_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleAnswer = async (answer: Answer) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer.id);
    setShowResults(true);

    if (answer.is_correct) {
      const timeBonus = Math.floor((timeLeft / currentQuestion.time_limit) * currentQuestion.points);
      try {
        await supabase
          .from('game_participants')
          .update({
            score: participants.find(p => p.user_id === user?.id)?.score + timeBonus
          })
          .eq('session_id', id)
          .eq('user_id', user?.id);
      } catch (error) {
        console.error('Error updating score:', error);
      }
    }
  };

  const nextQuestion = async () => {
    if (!isHost || !session) return;

    const nextIndex = session.current_question_index + 1;
    try {
      const { data: questionsCount } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('quiz_id', session.quiz_id);

      if (nextIndex >= (questionsCount ?? 0)) {
        await supabase
          .from('game_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        await supabase
          .from('game_sessions')
          .update({
            current_question_index: nextIndex
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error advancing question:', error);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && session?.status === 'in_progress' && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResults) {
      setShowResults(true);
    }
  }, [timeLeft, session?.status, showResults]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (session.status === 'completed') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Game Complete!</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Standings</h2>
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-gray-900">#{index + 1}</span>
                  <span className="text-lg text-gray-700">{participant.user.email}</span>
                </div>
                <span className="text-xl font-semibold text-indigo-600">
                  {participant.score} pts
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {session.status === 'waiting' ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Waiting for Players</h1>
            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-8">
              <Users className="h-5 w-5" />
              <span>{participants.length} players joined</span>
            </div>

            <div className="space-y-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-gray-50 rounded-lg p-4 text-gray-700"
                >
                  {participant.user.email}
                </div>
              ))}
            </div>

            {isHost && (
              <button
                onClick={startGame}
                disabled={participants.length < 1}
                className={`mt-8 px-6 py-3 rounded-md text-white transition-colors ${
                  participants.length < 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Start Game
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <Timer className="h-5 w-5 text-indigo-600" />
                <span className="text-lg font-semibold">{timeLeft}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-gray-500">{participants.length} players</span>
              </div>
            </div>

            {currentQuestion && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {answers.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswer(answer)}
                      disabled={!!selectedAnswer}
                      className={`p-4 rounded-lg text-left transition-all ${
                        showResults
                          ? answer.is_correct
                            ? 'bg-green-100 border-green-500'
                            : selectedAnswer === answer.id
                            ? 'bg-red-100 border-red-500'
                            : 'bg-gray-100'
                          : 'bg-gray-100 hover:bg-indigo-100'
                      } border-2 ${
                        selectedAnswer === answer.id ? 'border-indigo-500' : 'border-transparent'
                      }`}
                    >
                      {answer.answer}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <span className="text-gray-700">{participant.user.email}</span>
                    <span className="font-semibold text-indigo-600">
                      {participant.score} pts
                    </span>
                  </div>
                ))}
              </div>

              {isHost && showResults && (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;