-- =====================================================
-- Migration: Add creator_full_name to topic_submissions and teacher_topics
-- Purpose: Denormalize creator names for better query performance
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- Step 0: Drop existing views that depend on these tables
-- =====================================================

-- Drop views that reference topic_submissions
DROP VIEW IF EXISTS public.submissions_with_creator CASCADE;

-- Drop views that reference teacher_topics
DROP VIEW IF EXISTS public.teacher_topics_with_names CASCADE;
DROP VIEW IF EXISTS public.teacher_topics_pending_approval CASCADE;
DROP VIEW IF EXISTS public.active_published_topics CASCADE;
DROP VIEW IF EXISTS public.recently_unpublished_topics CASCADE;

-- =====================================================
-- Step 1: Add creator_full_name column to topic_submissions
-- =====================================================

ALTER TABLE public.topic_submissions
  ADD COLUMN IF NOT EXISTS creator_full_name TEXT NULL;

-- Add comment
COMMENT ON COLUMN public.topic_submissions.creator_full_name IS 
  'Denormalized full name of the topic creator from profiles table. Auto-populated via trigger.';

-- =====================================================
-- Step 2: Add creator_full_name column to teacher_topics
-- =====================================================

ALTER TABLE public.teacher_topics
  ADD COLUMN IF NOT EXISTS creator_full_name TEXT NULL;

-- Add reviewer_full_name column as well for consistency
ALTER TABLE public.teacher_topics
  ADD COLUMN IF NOT EXISTS reviewer_full_name TEXT NULL;

-- Add comments
COMMENT ON COLUMN public.teacher_topics.creator_full_name IS 
  'Denormalized full name of the topic creator from profiles table. Auto-populated via trigger.';

COMMENT ON COLUMN public.teacher_topics.reviewer_full_name IS 
  'Denormalized full name of the reviewer/teacher from profiles table. Auto-populated via trigger.';

-- =====================================================
-- Step 3: Create function to populate creator name for topic_submissions
-- =====================================================

CREATE OR REPLACE FUNCTION public.populate_topic_submission_creator_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Populate creator_full_name from profiles table
  IF NEW.created_by IS NOT NULL THEN
    SELECT full_name INTO NEW.creator_full_name
    FROM public.profiles
    WHERE id = NEW.created_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 4: Create trigger for topic_submissions
-- =====================================================

DROP TRIGGER IF EXISTS auto_populate_submission_creator_name ON public.topic_submissions;

CREATE TRIGGER auto_populate_submission_creator_name
  BEFORE INSERT OR UPDATE ON public.topic_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_topic_submission_creator_name();

COMMENT ON TRIGGER auto_populate_submission_creator_name ON public.topic_submissions IS 
  'Automatically populates creator_full_name from profiles table on INSERT or UPDATE';

-- =====================================================
-- Step 5: Create function to populate creator/reviewer names for teacher_topics
-- =====================================================

CREATE OR REPLACE FUNCTION public.populate_teacher_topic_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Populate creator_full_name from profiles table
  IF NEW.created_by IS NOT NULL THEN
    SELECT full_name INTO NEW.creator_full_name
    FROM public.profiles
    WHERE id = NEW.created_by;
  END IF;
  
  -- Populate reviewer_full_name from profiles table
  IF NEW.reviewed_by IS NOT NULL THEN
    SELECT full_name INTO NEW.reviewer_full_name
    FROM public.profiles
    WHERE id = NEW.reviewed_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 6: Create trigger for teacher_topics
-- =====================================================

DROP TRIGGER IF EXISTS auto_populate_teacher_topic_names ON public.teacher_topics;

CREATE TRIGGER auto_populate_teacher_topic_names
  BEFORE INSERT OR UPDATE ON public.teacher_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_teacher_topic_names();

COMMENT ON TRIGGER auto_populate_teacher_topic_names ON public.teacher_topics IS 
  'Automatically populates creator_full_name and reviewer_full_name from profiles table on INSERT or UPDATE';

-- =====================================================
-- Step 7: Backfill existing data in topic_submissions
-- =====================================================

UPDATE public.topic_submissions ts
SET creator_full_name = p.full_name
FROM public.profiles p
WHERE ts.created_by = p.id
  AND ts.creator_full_name IS NULL;

-- =====================================================
-- Step 8: Backfill existing data in teacher_topics
-- =====================================================

-- Backfill creator names
UPDATE public.teacher_topics tt
SET creator_full_name = p.full_name
FROM public.profiles p
WHERE tt.created_by = p.id
  AND tt.creator_full_name IS NULL;

-- Backfill reviewer names
UPDATE public.teacher_topics tt
SET reviewer_full_name = p.full_name
FROM public.profiles p
WHERE tt.reviewed_by = p.id
  AND tt.reviewer_full_name IS NULL;

-- =====================================================
-- Step 9: Create indexes for name searches (optional but recommended)
-- =====================================================

-- Index for searching by creator name in topic_submissions
CREATE INDEX IF NOT EXISTS idx_topic_submissions_creator_name 
  ON public.topic_submissions USING btree (creator_full_name) 
  TABLESPACE pg_default;

-- Index for searching by creator name in teacher_topics
CREATE INDEX IF NOT EXISTS idx_teacher_topics_creator_name 
  ON public.teacher_topics USING btree (creator_full_name) 
  TABLESPACE pg_default;

-- Index for searching by reviewer name in teacher_topics
CREATE INDEX IF NOT EXISTS idx_teacher_topics_reviewer_name 
  ON public.teacher_topics USING btree (reviewer_full_name) 
  TABLESPACE pg_default;

-- =====================================================
-- Step 10: Create function to sync names when profile is updated
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_creator_names_on_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if full_name changed
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    
    -- Update topic_submissions
    UPDATE public.topic_submissions
    SET creator_full_name = NEW.full_name
    WHERE created_by = NEW.id;
    
    -- Update teacher_topics (as creator)
    UPDATE public.teacher_topics
    SET creator_full_name = NEW.full_name
    WHERE created_by = NEW.id;
    
    -- Update teacher_topics (as reviewer)
    UPDATE public.teacher_topics
    SET reviewer_full_name = NEW.full_name
    WHERE reviewed_by = NEW.id;
    
    -- Update published_topics (if table exists)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'published_topics') THEN
      UPDATE public.published_topics
      SET creator_full_name = NEW.full_name
      WHERE created_by = NEW.id;
      
      UPDATE public.published_topics
      SET publisher_full_name = NEW.full_name
      WHERE published_by = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 11: Create trigger on profiles table
-- =====================================================

DROP TRIGGER IF EXISTS sync_names_on_profile_change ON public.profiles;

CREATE TRIGGER sync_names_on_profile_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_creator_names_on_profile_update();

COMMENT ON TRIGGER sync_names_on_profile_change ON public.profiles IS 
  'Automatically syncs creator/reviewer names across all tables when profile.full_name is updated';

-- =====================================================
-- Step 12: Create helper views for common queries
-- =====================================================

-- View: All submissions with creator names (already denormalized)
CREATE OR REPLACE VIEW public.submissions_with_creator AS
SELECT 
  ts.*
FROM public.topic_submissions ts
ORDER BY ts.created_at DESC;

-- View: All teacher topics with creator and reviewer names (already denormalized)
CREATE OR REPLACE VIEW public.teacher_topics_with_names AS
SELECT 
  tt.*
FROM public.teacher_topics tt
ORDER BY tt.created_at DESC;

COMMENT ON VIEW public.submissions_with_creator IS 
  'All topic submissions with creator names already included (no JOIN needed)';

COMMENT ON VIEW public.teacher_topics_with_names IS 
  'All teacher topics with creator and reviewer names already included (no JOIN needed)';

-- =====================================================
-- Step 13: Recreate dependent views (if they existed)
-- =====================================================

-- Recreate teacher_topics_pending_approval view (commonly used)
CREATE OR REPLACE VIEW public.teacher_topics_pending_approval AS
SELECT 
  tt.*
FROM public.teacher_topics tt
WHERE tt.status = 'pending_approval'
ORDER BY tt.created_at DESC;

COMMENT ON VIEW public.teacher_topics_pending_approval IS 
  'Teacher topics awaiting approval with creator and reviewer names included';

-- Recreate active_published_topics view (only if published_topics table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'published_topics') THEN
    CREATE OR REPLACE VIEW public.active_published_topics AS
    SELECT 
      pt.*
    FROM public.published_topics pt
    WHERE pt.status = 'published'
    ORDER BY pt.published_at DESC;
  END IF;
END $$;

-- Recreate recently_unpublished_topics view (only if published_topics table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'published_topics') THEN
    CREATE OR REPLACE VIEW public.recently_unpublished_topics AS
    SELECT 
      pt.*
    FROM public.published_topics pt
    WHERE pt.status = 'unpublished'
    ORDER BY pt.unpublished_at DESC;
  END IF;
END $$;

-- =====================================================
-- End of Migration
-- =====================================================
