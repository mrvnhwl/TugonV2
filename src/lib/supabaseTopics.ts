import { supabase } from './supabase';

export interface SupabaseTopic {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface Course {
  id: number;
  title: string;
  description: string;
}

/**
 * Fetch all topics from Supabase
 */
export async function fetchTopics(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('tugonsense_topics')
    .select('id, name, description')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }

  // Transform Supabase data to match the Course interface
  return (data || []).map(topic => ({
    id: topic.id,
    title: topic.name,
    description: topic.description || 'No description available',
  }));
}

/**
 * Fetch a single topic by ID
 */
export async function fetchTopicById(topicId: number): Promise<Course | null> {
  const { data, error } = await supabase
    .from('tugonsense_topics')
    .select('id, name, description')
    .eq('id', topicId)
    .single();

  if (error) {
    console.error('Error fetching topic:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.name,
    description: data.description || 'No description available',
  };
}

/**
 * Hook to use topics data with React
 */
export function useTopics() {
  const [topics, setTopics] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { topics, loading, error };
}

// Import React for the hook
import React from 'react';
