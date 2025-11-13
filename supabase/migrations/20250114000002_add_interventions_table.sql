-- Create interventions table for scheduling site visits and work sessions
CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  employee_ids UUID[], -- Array of employee IDs assigned to this intervention
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIMESTAMP WITH TIME ZONE, -- When to send reminder (default: 24h before)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for interventions.site_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sites') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'interventions_site_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'interventions'
    ) THEN
      ALTER TABLE public.interventions ADD CONSTRAINT interventions_site_id_fkey 
      FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interventions_site_id ON public.interventions(site_id);
CREATE INDEX IF NOT EXISTS idx_interventions_user_id ON public.interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_start_time ON public.interventions(start_time);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON public.interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_date_range ON public.interventions USING GIST (tstzrange(start_time, end_time));

-- Enable RLS on interventions
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own interventions" ON public.interventions;
DROP POLICY IF EXISTS "Users can create their own interventions" ON public.interventions;
DROP POLICY IF EXISTS "Users can update their own interventions" ON public.interventions;
DROP POLICY IF EXISTS "Users can delete their own interventions" ON public.interventions;

CREATE POLICY "Users can view their own interventions" 
ON public.interventions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interventions" 
ON public.interventions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interventions" 
ON public.interventions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interventions" 
ON public.interventions FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_interventions_updated_at ON public.interventions;
CREATE TRIGGER update_interventions_updated_at
    BEFORE UPDATE ON public.interventions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

