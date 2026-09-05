import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Play, Clock, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface Topic {
  id: string;
  name: string;
  description: string;
}

function HostGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sessionCode, setSessionCode] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTopics();
  }, [user]);

  const loadTopics = async () => {
    try {
      const { data } = await supabase
        .from('tugonsense_topics')
        .select('id, name, description')
        .order('id', { ascending: true });

      if (data) {
        setTopics(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading topics:', error);
      setLoading(false);
    }
  };

  const startSession = async () => {
    if (!selectedTopic) return;
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          topic_id: selectedTopic,
          host_id: user?.id,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSessionCode(data.id);
        navigator.clipboard.writeText(data.id);
        toast.success('Session Created & Code Copied!');
        navigate(`/game/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Host a Game</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Choose a topic...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTopic && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900">
                {topics.find((t) => t.id === selectedTopic)?.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {topics.find((t) => t.id === selectedTopic)?.description}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>30s per question</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>Multiplayer (Host Only Supported)</span>
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={!selectedTopic}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md text-white transition-colors ${
                selectedTopic
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Play className="h-5 w-5" />
              <span>Start Game</span>
            </button>
          </div>

          {sessionCode && (
            <div className="mt-6 bg-green-100 text-green-800 p-3 rounded flex items-center justify-between">
              <span>Session Code: {sessionCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sessionCode);
                  toast.success('Code copied!');
                }}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostGame;