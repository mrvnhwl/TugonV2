-- =====================================================
-- Migration: Add is_active column to published_topics
-- Purpose: Add boolean flag to control topic visibility
-- Date: 2025-10-21
-- =====================================================

-- Add is_active column if it doesn't exist
ALTER TABLE public.published_topics
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.published_topics.is_active IS 
  'Controls whether the topic is visible in published topics list. False = unpublished but kept in database.';

-- Create index for filtering active topics
CREATE INDEX IF NOT EXISTS idx_published_topics_is_active 
  ON public.published_topics USING btree (is_active) 
  TABLESPACE pg_default
  WHERE (is_active = true);

-- Update existing records to set is_active based on status
UPDATE public.published_topics
SET is_active = (status = 'published')
WHERE is_active IS NULL;

-- =====================================================
-- End of Migration
-- =====================================================
