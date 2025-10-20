-- ==========================================
-- ADD USER FOREIGN KEY CONSTRAINTS
-- ==========================================

-- Add foreign keys to auth.users
ALTER TABLE tugonsense_user_topic_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_topic_progress_user_id_fkey;

ALTER TABLE tugonsense_user_topic_progress
  ADD CONSTRAINT tugonsense_user_topic_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE tugonsense_user_category_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_category_progress_user_id_fkey;

ALTER TABLE tugonsense_user_category_progress
  ADD CONSTRAINT tugonsense_user_category_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE tugonsense_user_question_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_question_progress_user_id_fkey;

ALTER TABLE tugonsense_user_question_progress
  ADD CONSTRAINT tugonsense_user_question_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE tugonsense_user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tugonsense_user_category_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tugonsense_user_question_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own topic progress" ON tugonsense_user_topic_progress;
DROP POLICY IF EXISTS "Users can insert own topic progress" ON tugonsense_user_topic_progress;
DROP POLICY IF EXISTS "Users can update own topic progress" ON tugonsense_user_topic_progress;
DROP POLICY IF EXISTS "Users can delete own topic progress" ON tugonsense_user_topic_progress;

DROP POLICY IF EXISTS "Users can view own category progress" ON tugonsense_user_category_progress;
DROP POLICY IF EXISTS "Users can insert own category progress" ON tugonsense_user_category_progress;
DROP POLICY IF EXISTS "Users can update own category progress" ON tugonsense_user_category_progress;
DROP POLICY IF EXISTS "Users can delete own category progress" ON tugonsense_user_category_progress;

DROP POLICY IF EXISTS "Users can view own question progress" ON tugonsense_user_question_progress;
DROP POLICY IF EXISTS "Users can insert own question progress" ON tugonsense_user_question_progress;
DROP POLICY IF EXISTS "Users can update own question progress" ON tugonsense_user_question_progress;
DROP POLICY IF EXISTS "Users can delete own question progress" ON tugonsense_user_question_progress;

-- Create policies for tugonsense_user_topic_progress
CREATE POLICY "Users can view own topic progress"
  ON tugonsense_user_topic_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic progress"
  ON tugonsense_user_topic_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic progress"
  ON tugonsense_user_topic_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own topic progress"
  ON tugonsense_user_topic_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for tugonsense_user_category_progress
CREATE POLICY "Users can view own category progress"
  ON tugonsense_user_category_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category progress"
  ON tugonsense_user_category_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category progress"
  ON tugonsense_user_category_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own category progress"
  ON tugonsense_user_category_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for tugonsense_user_question_progress
CREATE POLICY "Users can view own question progress"
  ON tugonsense_user_question_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question progress"
  ON tugonsense_user_question_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own question progress"
  ON tugonsense_user_question_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own question progress"
  ON tugonsense_user_question_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
