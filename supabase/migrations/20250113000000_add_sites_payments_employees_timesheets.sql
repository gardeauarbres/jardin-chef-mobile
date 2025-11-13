-- Create sites table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints only if the referenced tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'sites_client_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'sites'
    ) THEN
      ALTER TABLE public.sites ADD CONSTRAINT sites_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'sites_quote_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'sites'
    ) THEN
      ALTER TABLE public.sites ADD CONSTRAINT sites_quote_id_fkey 
      FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Enable RLS on sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Sites policies
CREATE POLICY "Users can view their own sites" 
ON public.sites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sites" 
ON public.sites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" 
ON public.sites FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" 
ON public.sites FOR DELETE 
USING (auth.uid() = user_id);

-- Create employees table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Users can view their own employees" 
ON public.employees FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own employees" 
ON public.employees FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees" 
ON public.employees FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees" 
ON public.employees FOR DELETE 
USING (auth.uid() = user_id);

-- Create timesheets table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  hours NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('due', 'paid')),
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for employees
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'timesheets_employee_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'timesheets'
    ) THEN
      ALTER TABLE public.timesheets ADD CONSTRAINT timesheets_employee_id_fkey 
      FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Enable RLS on timesheets
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Timesheets policies
CREATE POLICY "Users can view their own timesheets" 
ON public.timesheets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timesheets" 
ON public.timesheets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timesheets" 
ON public.timesheets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timesheets" 
ON public.timesheets FOR DELETE 
USING (auth.uid() = user_id);

-- Create payments table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL,
  client_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'progress', 'final')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints only if the referenced tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sites') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payments_site_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'payments'
    ) THEN
      ALTER TABLE public.payments ADD CONSTRAINT payments_site_id_fkey 
      FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payments_client_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'payments'
    ) THEN
      ALTER TABLE public.payments ADD CONSTRAINT payments_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments" 
ON public.payments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
ON public.payments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" 
ON public.payments FOR DELETE 
USING (auth.uid() = user_id);

