-- Baseline Schema for Tugonsense Platform
-- This file consolidates all tables, relations, and RLS policies.

-- ==========================================
-- 1. User & Organization Management
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.section_students (
  section_id uuid REFERENCES public.sections(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (section_id, student_id)
);

-- ==========================================
-- 2. TugonSense Content Hierarchy
-- ==========================================

CREATE TABLE IF NOT EXISTS public.tugonsense_topics (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.tugonsense_categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id bigint REFERENCES public.tugonsense_topics(id) ON DELETE CASCADE,
  category_id int NOT NULL,
  title text NOT NULL,
  category_question text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (topic_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.tugonsense_questions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id bigint REFERENCES public.tugonsense_topics(id) ON DELETE CASCADE,
  category_id int NOT NULL,
  question_id int NOT NULL,
  category_text text,
  question_text text NOT NULL,
  question_type text CHECK (question_type IN ('step-by-step', 'direct', 'multiple-choice')) DEFAULT 'step-by-step',
  guide_text text,
  answer_type text CHECK (answer_type IN ('multiLine', 'singleLine')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (topic_id, category_id, question_id),
  FOREIGN KEY (topic_id, category_id) REFERENCES public.tugonsense_categories(topic_id, category_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tugonsense_answer_steps (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id bigint NOT NULL,
  category_id int NOT NULL,
  question_id int NOT NULL,
  step_order int NOT NULL,
  label text,
  answer_variants jsonb NOT NULL DEFAULT '[]',
  placeholder text,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (topic_id, category_id, question_id) REFERENCES public.tugonsense_questions(topic_id, category_id, question_id) ON DELETE CASCADE,
  UNIQUE (topic_id, category_id, question_id, step_order)
);

-- ==========================================
-- 3. User Progress Tracking
-- ==========================================

CREATE TABLE IF NOT EXISTS public.tugonsense_user_topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id bigint REFERENCES public.tugonsense_topics(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completion_percentage numeric DEFAULT 0,
  correct_answers int DEFAULT 0,
  total_questions int DEFAULT 0,
  first_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.tugonsense_user_category_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id bigint NOT NULL,
  category_id int NOT NULL,
  is_completed boolean DEFAULT false,
  completion_percentage numeric DEFAULT 0,
  correct_answers int DEFAULT 0,
  total_questions int DEFAULT 0,
  current_question_index int DEFAULT 0,
  attempts int DEFAULT 0,
  success_modal_shown boolean DEFAULT false,
  ever_completed boolean DEFAULT false,
  first_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, topic_id, category_id),
  FOREIGN KEY (topic_id, category_id) REFERENCES public.tugonsense_categories(topic_id, category_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tugonsense_user_question_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id bigint NOT NULL,
  category_id int NOT NULL,
  question_id int NOT NULL,
  is_completed boolean DEFAULT false,
  attempts int DEFAULT 0,
  correct_answers int DEFAULT 0,
  time_spent int DEFAULT 0,
  best_score int,
  color_coded_hints_used int DEFAULT 0,
  short_hint_messages_used int DEFAULT 0,
  current_session_attempts int DEFAULT 0,
  latest_attempt jsonb,
  fastest_attempt jsonb,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, topic_id, category_id, question_id),
  FOREIGN KEY (topic_id, category_id, question_id) REFERENCES public.tugonsense_questions(topic_id, category_id, question_id) ON DELETE CASCADE
);

-- ==========================================
-- 4. Real-time Game Sessions
-- ==========================================

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id bigint REFERENCES public.tugonsense_topics(id) ON DELETE CASCADE,
  host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text CHECK (status IN ('waiting', 'in_progress', 'completed')) DEFAULT 'waiting',
  current_question_index int DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score int DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (session_id, user_id)
);

-- ==========================================
-- 5. Content Submission & Approval Pipeline
-- ==========================================

CREATE TABLE IF NOT EXISTS public.topic_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_full_name text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.topic_submissions(id) ON DELETE CASCADE,
  result_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.topic_submissions(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id),
  reviewed_by uuid REFERENCES public.profiles(id),
  creator_full_name text,
  reviewer_full_name text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.published_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES public.profiles(id),
  published_by uuid REFERENCES public.profiles(id),
  creator_full_name text,
  publisher_full_name text,
  status text DEFAULT 'active',
  is_active boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  unpublished_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 6. Other Features
-- ==========================================

CREATE TABLE IF NOT EXISTS public.matching_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id bigint,
  response_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_challenge_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_date date DEFAULT current_date,
  score int DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (user_id, challenge_date)
);

CREATE TABLE IF NOT EXISTS public.daily_challenge_mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id bigint,
  mistake_count int DEFAULT 1,
  last_occurred_at timestamptz DEFAULT now()
);

-- ==========================================
-- 7. Indices for Performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_topic ON public.tugonsense_categories(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.tugonsense_questions(topic_id, category_id);
CREATE INDEX IF NOT EXISTS idx_answer_steps_question ON public.tugonsense_answer_steps(topic_id, category_id, question_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user ON public.tugonsense_user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cat_progress_user ON public.tugonsense_user_category_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ques_progress_user ON public.tugonsense_user_question_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_topic ON public.game_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_session ON public.game_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_creator ON public.topic_submissions(created_by);

-- ==========================================
-- 8. Row Level Security (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_answer_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_user_category_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tugonsense_user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_mistakes ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies for TugonSense content (Viewable by authenticated users)
CREATE POLICY "Topics are viewable by authenticated users" ON public.tugonsense_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories are viewable by authenticated users" ON public.tugonsense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Questions are viewable by authenticated users" ON public.tugonsense_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Answer steps are viewable by authenticated users" ON public.tugonsense_answer_steps FOR SELECT TO authenticated USING (true);

-- Policies for User Progress (Private to the user)
CREATE POLICY "Users can view own topic progress" ON public.tugonsense_user_topic_progress FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own category progress" ON public.tugonsense_user_category_progress FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own question progress" ON public.tugonsense_user_question_progress FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Policies for Game Sessions
CREATE POLICY "Game sessions are viewable by authenticated users" ON public.game_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create game sessions" ON public.game_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own game sessions" ON public.game_sessions FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Game participants are viewable by authenticated users" ON public.game_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join games" ON public.game_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game score" ON public.game_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies for Submission Pipeline
CREATE POLICY "Users can create topic submissions" ON public.topic_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view own submissions" ON public.topic_submissions FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Teachers can view all submissions" ON public.topic_submissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
