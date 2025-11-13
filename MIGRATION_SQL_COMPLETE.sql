-- Migration complète qui crée toutes les tables nécessaires
-- Cette migration peut être exécutée même si certaines tables existent déjà

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view their own clients" 
ON public.clients FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
ON public.clients FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clients FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON public.clients FOR DELETE 
USING (auth.uid() = user_id);

-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  deposit_percentage NUMERIC,
  deposit_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for quotes.client_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'quotes_client_id_fkey' 
    AND table_schema = 'public' 
    AND table_name = 'quotes'
  ) THEN
    ALTER TABLE public.quotes ADD CONSTRAINT quotes_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can create their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete their own quotes" ON public.quotes;

CREATE POLICY "Users can view their own quotes" 
ON public.quotes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotes" 
ON public.quotes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" 
ON public.quotes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes" 
ON public.quotes FOR DELETE 
USING (auth.uid() = user_id);

-- Create sites table if it doesn't exist
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

-- Add foreign key constraints for sites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sites_client_id_fkey' 
    AND table_schema = 'public' 
    AND table_name = 'sites'
  ) THEN
    ALTER TABLE public.sites ADD CONSTRAINT sites_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sites_quote_id_fkey' 
    AND table_schema = 'public' 
    AND table_name = 'sites'
  ) THEN
    ALTER TABLE public.sites ADD CONSTRAINT sites_quote_id_fkey 
    FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can create their own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON public.sites;

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

-- Create employees table if it doesn't exist
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

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can create their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees;

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

-- Create timesheets table if it doesn't exist
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

-- Add foreign key constraint for timesheets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'timesheets_employee_id_fkey' 
    AND table_schema = 'public' 
    AND table_name = 'timesheets'
  ) THEN
    ALTER TABLE public.timesheets ADD CONSTRAINT timesheets_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on timesheets
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Users can create their own timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Users can update their own timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Users can delete their own timesheets" ON public.timesheets;

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

-- Create payments table if it doesn't exist
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

-- Add foreign key constraints for payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_site_id_fkey' 
    AND table_schema = 'public' 
    AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_site_id_fkey 
    FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_client_id_fkey' 
    AND table_schema = 'public' 
    AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

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

