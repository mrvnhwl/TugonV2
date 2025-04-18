// src/pages/GameRoom.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Users, Loader2 } from 'lucide-react';

interface Participant {
  user_id: string;
}

interface SessionData {
  id: string;
  status: string;
  quiz: {
    title: string;
  };
  participants: Participant[];
}

function GameRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSession();
    const subscription = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_participants' }, () => {
        fetchSession();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, sessionId]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(
          `
          id,
          status,
          quiz:quizzes ( title ),
          participants:game_participants ( user_id )
        `
        )
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);
      if (error) throw error;
      navigate(`/play/${sessionId}`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">{session.quiz.title}</h1>
      <p className="mb-6">Waiting for players to join...</p>
      <div className="space-y-2">
        {session.participants.map((p) => (
          <div key={p.user_id} className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{p.user_id}</span>
          </div>
        ))}
      </div>
      {user?.id === session.participants[0]?.user_id && ( // Host controls
        <button
          onClick={startGame}
          className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Start Game
        </button>
      )}
    </div>
  );
}

export default GameRoom;
