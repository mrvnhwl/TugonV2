// src/pages/CreateSession.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface Topic {
  id: string;
  name: string;
  description: string;
}

function CreateSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTopics();
  }, [user]);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase.from('tugonsense_topics').select('id, name, description');
      if (error) throw error;
      if (data) setTopics(data);
    } catch (err) {
      console.error('Error fetching topics:', err);
      toast.error('Failed to load topics');
    }
  };

  const createSession = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          host_id: user?.id,
          topic_id: selectedTopic,
          status: 'waiting'
        })
        .select()
        .single();

      if (error || !data) throw error;
      await navigator.clipboard.writeText(data.id);
      toast.success('Session created & code copied!');
      navigate(`/game/${data.id}`);
    } catch (err) {
      console.error('Error creating session:', err);
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Game Session</h1>
      <div className="space-y-4">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        >
          <option value="">Select a Topic</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
        <button
          onClick={createSession}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </div>
    </div>
  );
}
removeEventListener
export default CreateSession;
