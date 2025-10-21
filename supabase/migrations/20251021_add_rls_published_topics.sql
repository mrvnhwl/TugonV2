-- =====================================================
-- Migration: Add Row Level Security to published_topics
-- Purpose: Secure published_topics table with RLS policies
-- Date: 2025-10-21
-- Note: Run this AFTER creating published_topics table
-- =====================================================

-- =====================================================
-- Step 1: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on published_topics table
ALTER TABLE public.published_topics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 2: Drop existing policies (if any)
-- =====================================================

DROP POLICY IF EXISTS "Published topics are viewable by everyone" ON public.published_topics;
DROP POLICY IF EXISTS "Teachers can view all topics" ON public.published_topics;
DROP POLICY IF EXISTS "Creators can view their own topics" ON public.published_topics;
DROP POLICY IF EXISTS "Teachers can insert published topics" ON public.published_topics;
DROP POLICY IF EXISTS "Teachers can update all topics" ON public.published_topics;
DROP POLICY IF EXISTS "Teachers can delete topics" ON public.published_topics;
DROP POLICY IF EXISTS "Creators can update their own unpublished topics" ON public.published_topics;

-- =====================================================
-- Step 3: Create RLS Policies for published_topics
-- =====================================================

-- Policy 1: Anyone can view published topics (including anonymous users)
CREATE POLICY "Published topics are viewable by everyone"
  ON public.published_topics
  FOR SELECT
  USING (status = 'published');

-- Policy 2: Teachers can view all topics (published and unpublished)
CREATE POLICY "Teachers can view all topics"
  ON public.published_topics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 3: Topic creators can view their own topics (any status)
CREATE POLICY "Creators can view their own topics"
  ON public.published_topics
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Policy 4: Only teachers can insert into published_topics (via triggers)
CREATE POLICY "Teachers can insert published topics"
  ON public.published_topics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 5: Only teachers can update published_topics
CREATE POLICY "Teachers can update all topics"
  ON public.published_topics
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

-- Policy 6: Only teachers can delete from published_topics
CREATE POLICY "Teachers can delete topics"
  ON public.published_topics
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
    )
  );

-- Policy 7: Topic creators can update their own unpublished topics
CREATE POLICY "Creators can update their own unpublished topics"
  ON public.published_topics
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() 
    AND status = 'unpublished'
  )
  WITH CHECK (
    created_by = auth.uid() 
    AND status = 'unpublished'
  );

-- =====================================================
-- Step 4: Grant necessary permissions
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on published_topics to all users (RLS will filter results)
GRANT SELECT ON public.published_topics TO anon, authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users (RLS will control access)
GRANT INSERT, UPDATE, DELETE ON public.published_topics TO authenticated;

-- Grant SELECT on views to all users (if views exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'active_published_topics') THEN
    GRANT SELECT ON public.active_published_topics TO anon, authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'recently_unpublished_topics') THEN
    GRANT SELECT ON public.recently_unpublished_topics TO authenticated;
  END IF;
END $$;

-- =====================================================
-- Step 5: Add indexes for RLS performance
-- =====================================================

-- Index on created_by and status for creator-based policies
CREATE INDEX IF NOT EXISTS idx_published_topics_created_by_status 
  ON public.published_topics USING btree (created_by, status) 
  TABLESPACE pg_default;

-- =====================================================
-- Step 6: Add comments for RLS policies
-- =====================================================

COMMENT ON POLICY "Published topics are viewable by everyone" ON public.published_topics IS 
  'Allows anyone (including anonymous users) to view topics with status = published';

COMMENT ON POLICY "Teachers can view all topics" ON public.published_topics IS 
  'Allows teachers to view all topics regardless of status';

COMMENT ON POLICY "Creators can view their own topics" ON public.published_topics IS 
  'Allows topic creators to view their own topics regardless of status';

COMMENT ON POLICY "Teachers can insert published topics" ON public.published_topics IS 
  'Only teachers can insert new published topics (typically via triggers)';

COMMENT ON POLICY "Teachers can update all topics" ON public.published_topics IS 
  'Only teachers can update any topic (publish, unpublish, edit)';

COMMENT ON POLICY "Teachers can delete topics" ON public.published_topics IS 
  'Only teachers can permanently delete topics from published_topics';

COMMENT ON POLICY "Creators can update their own unpublished topics" ON public.published_topics IS 
  'Allows creators to update their own topics only if status is unpublished';

-- =====================================================
-- Step 7: Verify RLS is enabled
-- =====================================================

DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'published_topics' AND relnamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION 'Row Level Security is not enabled on published_topics table';
  ELSE
    RAISE NOTICE 'Row Level Security is successfully enabled on published_topics table';
  END IF;
END $$;

-- =====================================================
-- End of Migration
-- =====================================================
