/*
  # Add Game Sessions Support

  This migration adds support for real-time game sessions where multiple students can join and play together.

  1. New Tables
    - game_sessions
      - Stores active game sessions
      - Tracks session status and timing
    - game_participants
      - Tracks players in each game session
      - Records individual scores and progress

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id),
  host_id uuid REFERENCES auth.users(id),
  status text CHECK (status IN ('waiting', 'in_progress', 'completed')) DEFAULT 'waiting',
  current_question_index integer DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create game_participants table
CREATE TABLE IF NOT EXISTS game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  score integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Policies for game_sessions
CREATE POLICY "Anyone can view game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Policies for game_participants
CREATE POLICY "Anyone can view game participants"
  ON game_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join games"
  ON game_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their scores"
  ON game_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);