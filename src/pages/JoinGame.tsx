import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Play, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface GameSession {
  id: string;
  quiz: {
    id: string;
    title: string;
    description: string;
  };
  host: {
    email: string;
  };
  status: 'waiting' | 'in_progress' | 'completed';
  participants: {
    user_id: string;
  }[];
}

function JoinGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadSessions();
    const unsubscribe = subscribeToSessions();
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadSessions = async () => {
    try {
      const { data } = await supabase
        .from('game_sessions')
        .select(`
          id,
          quiz:quizzes (
            id,
            title,
            description
          ),
          host:host_id (
            email
          ),
          status,
          participants:game_participants (
            user_id
          )
        `)
        .eq('status', 'waiting');

      if (data) {
        setSessions(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setLoading(false);
    }
  };

  const subscribeToSessions = () => {
    const subscription = supabase
      .channel('game_sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions' },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const joinSession = async (sessionId: string) => {
    try {
      setJoining(true);
      const { error } = await supabase.from('game_participants').insert({
        session_id: sessionId,
        user_id: user?.id
      });
      if (error) throw error;
      toast.success('Joined the game!');
      navigate(`/game/${sessionId}`);
    } catch (err) {
      console.error('Error joining session:', err);
      toast.error('Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const handleCodeJoin = async () => {
    setError('');
    if (!code.trim()) {
      setError('Please enter a valid session code');
      return;
    }
    setJoining(true);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('id', code)
        .eq('status', 'waiting')
        .single();

      if (error || !data) {
        setError('Invalid or expired session code');
        toast.error('Invalid session code');
        setJoining(false);
        return;
      }

      const { error: joinError } = await supabase.from('game_participants').insert({
        session_id: code,
        user_id: user?.id
      });

      if (joinError) throw joinError;
      toast.success('Joined the game!');
      navigate(`/game/${code}`);
    } catch (err) {
      console.error('Error joining by code:', err);
      toast.error('Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Join by Code</h1>
        <div className="space-y-3">
          <input
            type="text"
            value={code}
            ref={inputRef}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter session code"
            className="w-full border border-gray-300 p-2 rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleCodeJoin}
            disabled={joining}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {joining ? 'Joining...' : 'Join Session'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Game Sessions</h1>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Wait for someone to start a new game session.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.quiz.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {session.quiz.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {session.participants.length} players joined
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => joinSession(session.id)}
                    disabled={joining}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>{joining ? 'Joining...' : 'Join'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinGame;
