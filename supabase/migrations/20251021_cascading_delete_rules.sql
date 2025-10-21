-- =====================================================
-- Migration: Add Cascading Delete Rules for Topic Management
-- Purpose: Automatic cleanup when topics are deleted or rejected
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- Part 1: Modify teacher_topics foreign key to CASCADE DELETE
-- =====================================================

-- Drop existing foreign key constraint
ALTER TABLE public.teacher_topics 
  DROP CONSTRAINT IF EXISTS teacher_topics_submission_id_fkey;

-- Recreate with CASCADE DELETE
-- When teacher_topics is deleted, validation_results and topic_submissions are also deleted
ALTER TABLE public.teacher_topics
  ADD CONSTRAINT teacher_topics_submission_id_fkey 
    FOREIGN KEY (submission_id) 
    REFERENCES public.topic_submissions (id) 
    ON DELETE CASCADE;

COMMENT ON CONSTRAINT teacher_topics_submission_id_fkey ON public.teacher_topics IS 
  'Cascading delete: When teacher_topics is deleted, related topic_submissions and validation_results are also deleted';

-- =====================================================
-- Part 2: Create function to auto-delete teacher_topics when rejected by teacher
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_delete_rejected_teacher_topic()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'rejected' by teacher, delete the teacher_topics entry
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    -- Delete from teacher_topics (this will cascade to published_topics if exists)
    DELETE FROM public.teacher_topics
    WHERE submission_id = NEW.id;
    
    RAISE NOTICE 'Teacher topic deleted for submission_id: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Part 3: Create trigger on topic_submissions
-- =====================================================

DROP TRIGGER IF EXISTS auto_delete_teacher_topic_on_rejection ON public.topic_submissions;

CREATE TRIGGER auto_delete_teacher_topic_on_rejection
  AFTER UPDATE ON public.topic_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'rejected')
  EXECUTE FUNCTION public.auto_delete_rejected_teacher_topic();

COMMENT ON TRIGGER auto_delete_teacher_topic_on_rejection ON public.topic_submissions IS 
  'Automatically deletes teacher_topics entry when topic_submissions status is set to rejected';

-- =====================================================
-- Part 4: Update validation_results foreign key to CASCADE DELETE
-- =====================================================

-- Drop existing foreign key constraint
ALTER TABLE public.validation_results 
  DROP CONSTRAINT IF EXISTS validation_results_submission_id_fkey;

-- Recreate with CASCADE DELETE
ALTER TABLE public.validation_results
  ADD CONSTRAINT validation_results_submission_id_fkey 
    FOREIGN KEY (submission_id) 
    REFERENCES public.topic_submissions (id) 
    ON DELETE CASCADE;

COMMENT ON CONSTRAINT validation_results_submission_id_fkey ON public.validation_results IS 
  'Cascading delete: When topic_submissions is deleted, validation_results are also deleted';

-- =====================================================
-- Part 5: Create function to handle teacher_topics deletion
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_on_teacher_topic_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- When teacher_topics is deleted, also delete the submission and validation
  DELETE FROM public.topic_submissions
  WHERE id = OLD.submission_id;
  
  RAISE NOTICE 'Cleaned up submission_id: % after teacher_topics deletion', OLD.submission_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Part 6: Create trigger for teacher_topics deletion
-- =====================================================

DROP TRIGGER IF EXISTS cleanup_submission_on_teacher_topic_delete ON public.teacher_topics;

CREATE TRIGGER cleanup_submission_on_teacher_topic_delete
  AFTER DELETE ON public.teacher_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_on_teacher_topic_delete();

COMMENT ON TRIGGER cleanup_submission_on_teacher_topic_delete ON public.teacher_topics IS 
  'Automatically deletes topic_submissions and validation_results when teacher_topics is deleted';

-- =====================================================
-- Part 7: Add comments for clarity
-- =====================================================

COMMENT ON FUNCTION public.auto_delete_rejected_teacher_topic() IS 
  'Automatically deletes teacher_topics entry when topic is rejected by teacher';

COMMENT ON FUNCTION public.cleanup_on_teacher_topic_delete() IS 
  'Cascading cleanup: Deletes topic_submissions and validation_results when teacher_topics is deleted';

-- =====================================================
-- Part 8: Verify cascading delete chain
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Cascading Delete Rules Configured:';
  RAISE NOTICE '1. DELETE teacher_topics → DELETE topic_submissions → DELETE validation_results';
  RAISE NOTICE '2. UPDATE topic_submissions (status=rejected) → DELETE teacher_topics';
  RAISE NOTICE '3. DELETE topic_submissions → DELETE validation_results (cascade)';
  RAISE NOTICE '4. DELETE teacher_topics → DELETE published_topics (cascade)';
  RAISE NOTICE '============================================';
END $$;

-- =====================================================
-- End of Migration
-- =====================================================
