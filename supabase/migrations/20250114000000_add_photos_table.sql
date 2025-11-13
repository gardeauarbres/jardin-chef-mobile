-- Create photos table for site photos (before/after)
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('before', 'after', 'progress', 'other')),
  description TEXT,
  file_name TEXT,
  file_size INTEGER, -- Size in bytes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for photos.site_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sites') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'photos_site_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'photos'
    ) THEN
      ALTER TABLE public.photos ADD CONSTRAINT photos_site_id_fkey 
      FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_photos_site_id ON public.photos(site_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON public.photos(type);

-- Enable RLS on photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can create their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.photos;

CREATE POLICY "Users can view their own photos" 
ON public.photos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photos" 
ON public.photos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
ON public.photos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.photos FOR DELETE 
USING (auth.uid() = user_id);

