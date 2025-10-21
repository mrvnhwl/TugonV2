-- =====================================================
-- Migration: Add/Update Row Level Security for All Topic Tables
-- Purpose: Fix RLS policies for topic_submissions, validation_results, teacher_topics
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- TOPIC_SUBMISSIONS RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.topic_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.topic_submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON public.topic_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.topic_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.topic_submissions;
DROP POLICY IF EXISTS "Users can delete their own submissions" ON public.topic_submissions;
DROP POLICY IF EXISTS "System can update submissions" ON public.topic_submissions;

-- Policy 1: Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON public.topic_submissions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Policy 2: Teachers can view all submissions
CREATE POLICY "Teachers can view all submissions"
  ON public.topic_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 3: Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
  ON public.topic_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy 4: Users can update their own pending submissions
CREATE POLICY "Users can update their own submissions"
  ON public.topic_submissions
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy 5: Users can delete their own pending submissions
CREATE POLICY "Users can delete their own submissions"
  ON public.topic_submissions
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'pending');

-- Policy 6: System/API can update any submission (for AI validation)
CREATE POLICY "System can update submissions"
  ON public.topic_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VALIDATION_RESULTS RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view validation of their submissions" ON public.validation_results;
DROP POLICY IF EXISTS "Teachers can view all validations" ON public.validation_results;
DROP POLICY IF EXISTS "System can insert validations" ON public.validation_results;
DROP POLICY IF EXISTS "System can update validations" ON public.validation_results;

-- Policy 1: Users can view validation results of their own submissions
CREATE POLICY "Users can view validation of their submissions"
  ON public.validation_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.topic_submissions
      WHERE topic_submissions.id = validation_results.submission_id
        AND topic_submissions.created_by = auth.uid()
    )
  );

-- Policy 2: Teachers can view all validation results
CREATE POLICY "Teachers can view all validations"
  ON public.validation_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 3: Authenticated users can insert validations (for API/system)
CREATE POLICY "System can insert validations"
  ON public.validation_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 4: System can update validations
CREATE POLICY "System can update validations"
  ON public.validation_results
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TEACHER_TOPICS RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.teacher_topics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view topics of their submissions" ON public.teacher_topics;
DROP POLICY IF EXISTS "Teachers can view all topics" ON public.teacher_topics;
DROP POLICY IF EXISTS "Teachers can insert topics" ON public.teacher_topics;
DROP POLICY IF EXISTS "Teachers can update topics" ON public.teacher_topics;
DROP POLICY IF EXISTS "Teachers can delete topics" ON public.teacher_topics;
DROP POLICY IF EXISTS "Creators can view their topics" ON public.teacher_topics;
DROP POLICY IF EXISTS "System can insert topics" ON public.teacher_topics;
DROP POLICY IF EXISTS "System can update topics" ON public.teacher_topics;

-- Policy 1: Users can view teacher_topics related to their own submissions
CREATE POLICY "Users can view topics of their submissions"
  ON public.teacher_topics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.topic_submissions
      WHERE topic_submissions.id = teacher_topics.submission_id
        AND topic_submissions.created_by = auth.uid()
    )
  );

-- Policy 2: Teachers can view all teacher_topics
CREATE POLICY "Teachers can view all topics"
  ON public.teacher_topics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 3: Topic creators can view their own topics
CREATE POLICY "Creators can view their topics"
  ON public.teacher_topics
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Policy 4: Authenticated users can insert (for API/system)
CREATE POLICY "System can insert topics"
  ON public.teacher_topics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 5: Teachers can update teacher_topics
CREATE POLICY "Teachers can update topics"
  ON public.teacher_topics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 6: System can update topics (for triggers and API)
CREATE POLICY "System can update topics"
  ON public.teacher_topics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 7: Teachers can delete topics
CREATE POLICY "Teachers can delete topics"
  ON public.teacher_topics
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.validation_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_topics TO authenticated;

-- =====================================================
-- Add Policy Comments
-- =====================================================

-- topic_submissions comments
COMMENT ON POLICY "Users can view their own submissions" ON public.topic_submissions IS 
  'Users can only view submissions they created';

COMMENT ON POLICY "Teachers can view all submissions" ON public.topic_submissions IS 
  'Teachers have full visibility of all submissions';

COMMENT ON POLICY "System can update submissions" ON public.topic_submissions IS 
  'Allows API and triggers to update submission status during validation';

-- validation_results comments
COMMENT ON POLICY "Users can view validation of their submissions" ON public.validation_results IS 
  'Users can view validation results for their own submissions';

COMMENT ON POLICY "Teachers can view all validations" ON public.validation_results IS 
  'Teachers can view all validation results';

COMMENT ON POLICY "System can insert validations" ON public.validation_results IS 
  'Allows API to insert validation results from AI';

-- teacher_topics comments
COMMENT ON POLICY "Users can view topics of their submissions" ON public.teacher_topics IS 
  'Users can view teacher_topics created from their submissions';

COMMENT ON POLICY "Teachers can view all topics" ON public.teacher_topics IS 
  'Teachers have full visibility of all topics';

COMMENT ON POLICY "Teachers can update topics" ON public.teacher_topics IS 
  'Teachers can edit and publish topics';

COMMENT ON POLICY "System can update topics" ON public.teacher_topics IS 
  'Allows triggers and API to update topics automatically';

-- =====================================================
-- Verify RLS is enabled
-- =====================================================

DO $$
DECLARE
  v_table_name TEXT;
  v_rls_enabled BOOLEAN;
BEGIN
  FOR v_table_name IN 
    SELECT unnest(ARRAY['topic_submissions', 'validation_results', 'teacher_topics'])
  LOOP
    SELECT relrowsecurity INTO v_rls_enabled
    FROM pg_class
    WHERE relname = v_table_name
      AND relnamespace = 'public'::regnamespace;
    
    IF v_rls_enabled THEN
      RAISE NOTICE '✅ RLS enabled on: %', v_table_name;
    ELSE
      RAISE WARNING '❌ RLS NOT enabled on: %', v_table_name;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- End of Migration
-- =====================================================
