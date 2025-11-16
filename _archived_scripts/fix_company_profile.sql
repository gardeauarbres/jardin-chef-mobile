-- =====================================================
-- FIX: Créer la table company_profile si elle n'existe pas
-- =====================================================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Company information
    company_name TEXT NOT NULL DEFAULT '',
    siret TEXT,
    tva_number TEXT,
    is_auto_entrepreneur BOOLEAN DEFAULT false,
    
    -- Address
    address TEXT,
    address_complement TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'France',
    
    -- Contact information
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Owner information
    first_name TEXT,
    last_name TEXT,
    
    -- Branding
    logo_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (si elles existent)
DROP POLICY IF EXISTS "Users can view their own company profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can insert their own company profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can delete their own company profile" ON public.company_profile;

-- RLS Policies
CREATE POLICY "Users can view their own company profile"
    ON public.company_profile FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company profile"
    ON public.company_profile FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile"
    ON public.company_profile FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company profile"
    ON public.company_profile FOR DELETE
    USING (auth.uid() = user_id);

-- Function for updated_at
CREATE OR REPLACE FUNCTION public.update_company_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (avec DROP avant CREATE)
DROP TRIGGER IF EXISTS update_company_profile_updated_at ON public.company_profile;
CREATE TRIGGER update_company_profile_updated_at
    BEFORE UPDATE ON public.company_profile
    FOR EACH ROW
    EXECUTE FUNCTION public.update_company_profile_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_company_profile_user_id ON public.company_profile(user_id);

-- Grant permissions
GRANT ALL ON public.company_profile TO authenticated;
GRANT ALL ON public.company_profile TO service_role;

-- Comment
COMMENT ON TABLE public.company_profile IS 'Store company profile information for document generation';

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Table company_profile créée avec succès !';
END $$;

-- Vérifier la structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'company_profile'
ORDER BY ordinal_position;

