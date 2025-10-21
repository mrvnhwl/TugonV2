-- =====================================================
-- Migration: Create published_topics table
-- Purpose: Store published topics for public display
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- Step 1: Create published_topics table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.published_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  teacher_topic_id UUID NOT NULL,
  title TEXT NOT NULL,
  about_refined TEXT NOT NULL,
  terms_expounded JSONB NOT NULL,
  video_image_link TEXT NULL,
  status TEXT NOT NULL DEFAULT 'published'::TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  creator_full_name TEXT NULL,
  published_by UUID NOT NULL,
  publisher_full_name TEXT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  unpublished_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Primary Key
  CONSTRAINT published_topics_pkey PRIMARY KEY (id),
  
  -- Unique Constraints (one published topic per submission)
  CONSTRAINT unique_published_topic_per_submission UNIQUE (submission_id),
  
  -- Foreign Keys
  CONSTRAINT published_topics_submission_id_fkey 
    FOREIGN KEY (submission_id) 
    REFERENCES public.topic_submissions (id) 
    ON DELETE CASCADE,
  
  CONSTRAINT published_topics_teacher_topic_id_fkey 
    FOREIGN KEY (teacher_topic_id) 
    REFERENCES public.teacher_topics (id) 
    ON DELETE CASCADE,
  
  CONSTRAINT published_topics_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users (id) 
    ON DELETE SET NULL,
  
  CONSTRAINT published_topics_published_by_fkey 
    FOREIGN KEY (published_by) 
    REFERENCES auth.users (id) 
    ON DELETE SET NULL,
  
  -- Check Constraints
  CONSTRAINT published_topics_status_check CHECK (
    status = ANY (ARRAY['published'::TEXT, 'unpublished'::TEXT])
  ),
  
  CONSTRAINT valid_video_link CHECK (
    (video_image_link IS NULL) OR 
    (video_image_link ~* '^https?://'::TEXT)
  )
) TABLESPACE pg_default;

-- =====================================================
-- Step 2: Create indexes for performance
-- =====================================================

-- Index on submission_id for lookups
CREATE INDEX IF NOT EXISTS idx_published_topics_submission_id 
  ON public.published_topics USING btree (submission_id) 
  TABLESPACE pg_default;

-- Index on teacher_topic_id for reverse lookups
CREATE INDEX IF NOT EXISTS idx_published_topics_teacher_topic_id 
  ON public.published_topics USING btree (teacher_topic_id) 
  TABLESPACE pg_default;

-- Index on status for filtering published vs unpublished
CREATE INDEX IF NOT EXISTS idx_published_topics_status 
  ON public.published_topics USING btree (status) 
  TABLESPACE pg_default;

-- Index on published_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_published_topics_published_at 
  ON public.published_topics USING btree (published_at DESC) 
  TABLESPACE pg_default;

-- Partial index on published topics only (most common query)
CREATE INDEX IF NOT EXISTS idx_published_topics_active 
  ON public.published_topics USING btree (published_at DESC) 
  TABLESPACE pg_default
  WHERE (status = 'published'::TEXT);

-- Index on created_by for author filtering
CREATE INDEX IF NOT EXISTS idx_published_topics_created_by 
  ON public.published_topics USING btree (created_by) 
  TABLESPACE pg_default;

-- Full-text search index on title
CREATE INDEX IF NOT EXISTS idx_published_topics_title_search 
  ON public.published_topics USING gin (to_tsvector('english'::regconfig, title)) 
  TABLESPACE pg_default;

-- Full-text search index on about_refined
CREATE INDEX IF NOT EXISTS idx_published_topics_about_search 
  ON public.published_topics USING gin (to_tsvector('english'::regconfig, about_refined)) 
  TABLESPACE pg_default;

-- =====================================================
-- Step 3: Create trigger for updated_at timestamp
-- =====================================================

CREATE TRIGGER update_published_topics_updated_at
  BEFORE UPDATE ON public.published_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Step 3A: Create function to populate creator names
-- =====================================================

CREATE OR REPLACE FUNCTION public.populate_creator_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Populate creator_full_name from profiles table
  IF NEW.created_by IS NOT NULL THEN
    SELECT full_name INTO NEW.creator_full_name
    FROM public.profiles
    WHERE id = NEW.created_by;
  END IF;
  
  -- Populate publisher_full_name from profiles table
  IF NEW.published_by IS NOT NULL THEN
    SELECT full_name INTO NEW.publisher_full_name
    FROM public.profiles
    WHERE id = NEW.published_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 3B: Create trigger to auto-populate names
-- =====================================================

CREATE TRIGGER auto_populate_creator_names
  BEFORE INSERT OR UPDATE ON public.published_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_creator_names();

-- =====================================================
-- Step 4: Create function to auto-publish topic
-- =====================================================

CREATE OR REPLACE FUNCTION public.publish_topic_to_published_table()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_name TEXT;
  v_publisher_name TEXT;
BEGIN
  -- Only publish if status changed to 'published' and is_active is true
  IF NEW.status = 'published' AND NEW.is_active = true AND 
     (OLD.status IS NULL OR OLD.status != 'published' OR OLD.is_active = false) THEN
    
    -- Fetch creator full name from profiles
    SELECT full_name INTO v_creator_name
    FROM public.profiles
    WHERE id = NEW.created_by;
    
    -- Fetch publisher full name from profiles
    SELECT full_name INTO v_publisher_name
    FROM public.profiles
    WHERE id = NEW.reviewed_by;
    
    -- Insert or update in published_topics
    INSERT INTO public.published_topics (
      submission_id,
      teacher_topic_id,
      title,
      about_refined,
      terms_expounded,
      video_image_link,
      status,
      view_count,
      created_by,
      creator_full_name,
      published_by,
      publisher_full_name,
      published_at
    ) VALUES (
      NEW.submission_id,
      NEW.id,
      NEW.title,
      NEW.about_refined,
      NEW.terms_expounded,
      NEW.video_image_link,
      'published',
      NEW.view_count,
      NEW.created_by,
      v_creator_name,
      NEW.reviewed_by,
      v_publisher_name,
      NOW()
    )
    ON CONFLICT (submission_id) 
    DO UPDATE SET
      teacher_topic_id = EXCLUDED.teacher_topic_id,
      title = EXCLUDED.title,
      about_refined = EXCLUDED.about_refined,
      terms_expounded = EXCLUDED.terms_expounded,
      video_image_link = EXCLUDED.video_image_link,
      status = 'published',
      published_by = EXCLUDED.published_by,
      publisher_full_name = EXCLUDED.publisher_full_name,
      published_at = NOW(),
      unpublished_at = NULL,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 5: Create trigger to auto-publish on approval
-- =====================================================

CREATE TRIGGER auto_publish_topic_on_approval
  AFTER INSERT OR UPDATE ON public.teacher_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.publish_topic_to_published_table();

-- =====================================================
-- Step 6: Create function to unpublish topic
-- =====================================================

CREATE OR REPLACE FUNCTION public.unpublish_topic()
RETURNS TRIGGER AS $$
BEGIN
  -- If status in published_topics changed to 'unpublished'
  IF NEW.status = 'unpublished' AND OLD.status = 'published' THEN
    
    -- Update teacher_topics status to 'unpublished'
    UPDATE public.teacher_topics
    SET 
      status = 'unpublished',
      is_active = false,
      updated_at = NOW()
    WHERE id = NEW.teacher_topic_id;
    
    -- Set unpublished_at timestamp
    NEW.unpublished_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 7: Create trigger for unpublishing
-- =====================================================

CREATE TRIGGER handle_unpublish_topic
  BEFORE UPDATE ON public.published_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.unpublish_topic();

-- =====================================================
-- Step 8: Update teacher_topics status constraint
-- =====================================================

-- Drop old constraint
ALTER TABLE public.teacher_topics 
  DROP CONSTRAINT IF EXISTS teacher_topics_status_check;

-- Add new constraint with 'unpublished' status
ALTER TABLE public.teacher_topics 
  ADD CONSTRAINT teacher_topics_status_check CHECK (
    status = ANY (
      ARRAY[
        'draft'::TEXT,
        'pending_approval'::TEXT,
        'published'::TEXT,
        'unpublished'::TEXT
      ]
    )
  );

-- =====================================================
-- Step 9: Create helpful views
-- =====================================================

-- View for active published topics (most common query)
CREATE OR REPLACE VIEW public.active_published_topics AS
SELECT 
  pt.*
FROM public.published_topics pt
WHERE pt.status = 'published'
ORDER BY pt.published_at DESC;

-- View for recently unpublished topics
CREATE OR REPLACE VIEW public.recently_unpublished_topics AS
SELECT 
  pt.*
FROM public.published_topics pt
WHERE pt.status = 'unpublished'
ORDER BY pt.unpublished_at DESC;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE public.published_topics IS 
  'Stores published topics visible to all users. Topics are automatically added when approved in teacher_topics.';

COMMENT ON COLUMN public.published_topics.submission_id IS 
  'References the original topic submission';

COMMENT ON COLUMN public.published_topics.teacher_topic_id IS 
  'References the teacher_topics entry (source of refined content)';

COMMENT ON COLUMN public.published_topics.status IS 
  'published = visible to users, unpublished = hidden from users';

COMMENT ON COLUMN public.published_topics.view_count IS 
  'Number of times this topic has been viewed by students';

COMMENT ON COLUMN public.published_topics.creator_full_name IS 
  'Denormalized full name of the topic creator from profiles table. Auto-populated via trigger.';

COMMENT ON COLUMN public.published_topics.publisher_full_name IS 
  'Denormalized full name of the teacher who published the topic from profiles table. Auto-populated via trigger.';

COMMENT ON TRIGGER auto_publish_topic_on_approval ON public.teacher_topics IS 
  'Automatically copies approved topics to published_topics table';

COMMENT ON TRIGGER handle_unpublish_topic ON public.published_topics IS 
  'Updates teacher_topics status when topic is unpublished';

COMMENT ON TRIGGER auto_populate_creator_names ON public.published_topics IS 
  'Automatically populates creator_full_name and publisher_full_name from profiles table';

-- =====================================================
-- Step 10: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on published_topics table
ALTER TABLE public.published_topics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 11: Create RLS Policies for published_topics
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
-- Step 12: Grant necessary permissions
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on published_topics to all users (RLS will filter results)
GRANT SELECT ON public.published_topics TO anon, authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users (RLS will control access)
GRANT INSERT, UPDATE, DELETE ON public.published_topics TO authenticated;

-- Grant SELECT on views to all users
GRANT SELECT ON public.active_published_topics TO anon, authenticated;
GRANT SELECT ON public.recently_unpublished_topics TO authenticated;

-- =====================================================
-- Step 13: Add indexes for RLS performance
-- =====================================================

-- Index on created_by for creator-based policies
CREATE INDEX IF NOT EXISTS idx_published_topics_created_by_status 
  ON public.published_topics USING btree (created_by, status) 
  TABLESPACE pg_default;

-- =====================================================
-- Comments for RLS policies
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
-- End of Migration
-- =====================================================
