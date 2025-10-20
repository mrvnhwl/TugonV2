-- ==========================================
-- FIX FOREIGN KEY CONSTRAINTS IN PROGRESS TABLES
-- ==========================================
-- Problem: Progress tables reference bigserial PKs instead of logical IDs
-- Solution: Change to reference composite keys (topic_id, category_id)

-- ==========================================
-- STEP 1: Fix tugonsense_user_category_progress
-- ==========================================

-- Drop existing foreign key constraint
ALTER TABLE tugonsense_user_category_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_category_progress_category_id_fkey;

-- Change category_id column type from BIGINT to INTEGER
ALTER TABLE tugonsense_user_category_progress
  ALTER COLUMN category_id TYPE INTEGER;

-- Add composite foreign key constraint
ALTER TABLE tugonsense_user_category_progress
  ADD CONSTRAINT tugonsense_user_category_progress_topic_category_fkey
  FOREIGN KEY (topic_id, category_id) 
  REFERENCES tugonsense_categories(topic_id, category_id)
  ON DELETE CASCADE;

-- ==========================================
-- STEP 2: Fix tugonsense_user_question_progress
-- ==========================================

-- Drop existing foreign key constraints
ALTER TABLE tugonsense_user_question_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_question_progress_category_id_fkey;

ALTER TABLE tugonsense_user_question_progress
  DROP CONSTRAINT IF EXISTS tugonsense_user_question_progress_question_id_fkey;

-- Change column types from BIGINT to INTEGER
ALTER TABLE tugonsense_user_question_progress
  ALTER COLUMN category_id TYPE INTEGER;

ALTER TABLE tugonsense_user_question_progress
  ALTER COLUMN question_id TYPE INTEGER;

-- Add composite foreign key for question reference
-- Assumes tugonsense_questions has UNIQUE(topic_id, category_id, question_id)
ALTER TABLE tugonsense_user_question_progress
  ADD CONSTRAINT tugonsense_user_question_progress_question_fkey
  FOREIGN KEY (topic_id, category_id, question_id) 
  REFERENCES tugonsense_questions(topic_id, category_id, question_id)
  ON DELETE CASCADE;

-- ==========================================
-- STEP 3: Verify Constraints
-- ==========================================

-- Migration complete! 
-- Verify foreign keys by running this query:
-- SELECT constraint_name, table_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name LIKE 'tugonsense_user%' 
-- ORDER BY table_name, constraint_name;

SELECT 'Migration completed successfully!' as status;
