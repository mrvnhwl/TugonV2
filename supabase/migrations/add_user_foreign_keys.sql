-- ==========================================
-- ADD USER FOREIGN KEY CONSTRAINTS
-- ==========================================
-- Problem: user_id columns don't reference auth.users
-- Solution: Add foreign key constraints to Supabase auth.users

-- Note: Supabase auth.users table uses UUID for id
-- All user_id columns must be UUID type

-- ==========================================
-- STEP 1: Verify user_id column types
-- ==========================================

-- Check current types (should be UUID, not TEXT or BIGINT)
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN (
  'tugonsense_user_topic_progress',
  'tugonsense_user_category_progress',
  'tugonsense_user_question_progress'
)
AND column_name = 'user_id';

-- ==========================================
-- STEP 2: Add foreign key to auth.users
-- ==========================================

-- For tugonsense_user_topic_progress
ALTER TABLE tugonsense_user_topic_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_topic_progress_user_id_fkey;

ALTER TABLE tugonsense_user_topic_progress
  ADD CONSTRAINT tugonsense_user_topic_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- For tugonsense_user_category_progress
ALTER TABLE tugonsense_user_category_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_category_progress_user_id_fkey;

ALTER TABLE tugonsense_user_category_progress
  ADD CONSTRAINT tugonsense_user_category_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- For tugonsense_user_question_progress
ALTER TABLE tugonsense_user_question_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_question_progress_user_id_fkey;

ALTER TABLE tugonsense_user_question_progress
  ADD CONSTRAINT tugonsense_user_question_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- ==========================================
-- STEP 3: Update RLS Policies
-- ==========================================

-- Ensure RLS is enabled
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

-- Create new policies for tugonsense_user_topic_progress
CREATE POLICY "Users can view own topic progress"
  ON tugonsense_user_topic_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic progress"
  ON tugonsense_user_topic_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic progress"
  ON tugonsense_user_topic_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own topic progress"
  ON tugonsense_user_topic_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new policies for tugonsense_user_category_progress
CREATE POLICY "Users can view own category progress"
  ON tugonsense_user_category_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category progress"
  ON tugonsense_user_category_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category progress"
  ON tugonsense_user_category_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own category progress"
  ON tugonsense_user_category_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new policies for tugonsense_user_question_progress
CREATE POLICY "Users can view own question progress"
  ON tugonsense_user_question_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question progress"
  ON tugonsense_user_question_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own question progress"
  ON tugonsense_user_question_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own question progress"
  ON tugonsense_user_question_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==========================================
-- STEP 4: Verify Foreign Keys
-- ==========================================

-- Check that foreign keys were created
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'tugonsense_user%'
  AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;

-- ==========================================
-- STEP 5: Verify RLS Policies
-- ==========================================

-- Check that RLS policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename LIKE 'tugonsense_user%'
ORDER BY tablename, policyname;

-- ==========================================
-- STEP 6: Test Queries (OPTIONAL)
-- ==========================================

-- Test that a user can only see their own progress
-- Replace 'your-user-id' with actual UUID from auth.users
/*
-- Get current user's ID (run as authenticated user)
SELECT auth.uid() as my_user_id;

-- Test SELECT (should only return current user's data)
SELECT * FROM tugonsense_user_question_progress
WHERE user_id = auth.uid();

-- Test INSERT (should succeed for own user_id)
INSERT INTO tugonsense_user_question_progress (
  user_id, topic_id, category_id, question_id,
  attempts, is_correct, latest_attempt, fastest_attempt
) VALUES (
  auth.uid(), 1, 1, 1,
  1, true, 
  '{"timestamp": "2025-10-20T12:00:00Z", "timeSpent": 30, "attempts": 1, "colorHintsUsed": 0, "shortHintsUsed": 0}'::jsonb,
  '{"timestamp": "2025-10-20T12:00:00Z", "timeSpent": 30, "attempts": 1, "colorHintsUsed": 0, "shortHintsUsed": 0}'::jsonb
);

-- Test that user CANNOT insert for different user_id (should fail)
INSERT INTO tugonsense_user_question_progress (
  user_id, topic_id, category_id, question_id,
  attempts, is_correct, latest_attempt, fastest_attempt
) VALUES (
  '00000000-0000-0000-0000-000000000000', 1, 1, 1,
  1, true, '{}', '{}'
);
-- This should fail with: "new row violates row-level security policy"
*/

SELECT 'User foreign keys and RLS policies configured successfully!' as status;
