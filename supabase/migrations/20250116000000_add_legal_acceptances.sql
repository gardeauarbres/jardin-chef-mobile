-- =====================================================
-- LEGAL ACCEPTANCES TABLE
-- Stocke les acceptations des documents légaux
-- =====================================================

-- Create legal_acceptances table
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Documents acceptés
    privacy_policy_accepted BOOLEAN DEFAULT false,
    legal_notice_accepted BOOLEAN DEFAULT false,
    terms_of_service_accepted BOOLEAN DEFAULT false,
    terms_of_sale_accepted BOOLEAN DEFAULT false,
    
    -- Métadonnées
    privacy_policy_version TEXT DEFAULT '1.0',
    legal_notice_version TEXT DEFAULT '1.0',
    terms_of_service_version TEXT DEFAULT '1.0',
    terms_of_sale_version TEXT DEFAULT '1.0',
    
    -- Dates d'acceptation
    privacy_policy_accepted_at TIMESTAMPTZ,
    legal_notice_accepted_at TIMESTAMPTZ,
    terms_of_service_accepted_at TIMESTAMPTZ,
    terms_of_sale_accepted_at TIMESTAMPTZ,
    
    -- Informations de traçabilité
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un seul enregistrement par utilisateur
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (si elles existent)
DROP POLICY IF EXISTS "Users can view their own legal acceptances" ON public.legal_acceptances;
DROP POLICY IF EXISTS "Users can insert their own legal acceptances" ON public.legal_acceptances;
DROP POLICY IF EXISTS "Users can update their own legal acceptances" ON public.legal_acceptances;

-- RLS Policies
CREATE POLICY "Users can view their own legal acceptances"
    ON public.legal_acceptances FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legal acceptances"
    ON public.legal_acceptances FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal acceptances"
    ON public.legal_acceptances FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at
-- SECURITY: Uses SECURITY INVOKER and fixed search_path to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.update_legal_acceptances_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_legal_acceptances_updated_at ON public.legal_acceptances;
CREATE TRIGGER update_legal_acceptances_updated_at
    BEFORE UPDATE ON public.legal_acceptances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_legal_acceptances_updated_at();

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON public.legal_acceptances(user_id);

-- Grant permissions
GRANT ALL ON public.legal_acceptances TO authenticated;
GRANT ALL ON public.legal_acceptances TO service_role;

-- Comment
COMMENT ON TABLE public.legal_acceptances IS 'Store user legal document acceptances for GDPR compliance';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Table legal_acceptances créée avec succès !';
END $$;

