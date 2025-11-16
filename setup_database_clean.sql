-- =====================================================
-- JARDIN CHEF - SETUP COMPLET (AVEC NETTOYAGE)
-- Ce script supprime les anciennes policies et les recrée
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRATION 1: Materials Inventory
-- =====================================================

-- Create materials table
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_quantity NUMERIC(10,2) DEFAULT 0,
  unit_price NUMERIC(10,2) DEFAULT 0,
  supplier TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create material_movements table
CREATE TABLE IF NOT EXISTS public.material_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC(10,2) NOT NULL,
  reason TEXT,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_movements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for materials (si elles existent)
DROP POLICY IF EXISTS "Users can view their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can insert their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.materials;

-- RLS Policies for materials
CREATE POLICY "Users can view their own materials"
  ON public.materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials"
  ON public.materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
  ON public.materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
  ON public.materials FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing policies for material_movements (si elles existent)
DROP POLICY IF EXISTS "Users can view their own material movements" ON public.material_movements;
DROP POLICY IF EXISTS "Users can insert their own material movements" ON public.material_movements;

-- RLS Policies for material_movements (avec user_id direct)
CREATE POLICY "Users can view their own material movements"
  ON public.material_movements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own material movements"
  ON public.material_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_material_movements_user_id ON public.material_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_material_id ON public.material_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_site_id ON public.material_movements(site_id);

-- =====================================================
-- MIGRATION 2: Site Materials
-- =====================================================

-- Create site_materials table
CREATE TABLE IF NOT EXISTS public.site_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  used_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for site_materials (si elles existent)
DROP POLICY IF EXISTS "Users can view their own site materials" ON public.site_materials;
DROP POLICY IF EXISTS "Users can insert their own site materials" ON public.site_materials;
DROP POLICY IF EXISTS "Users can update their own site materials" ON public.site_materials;
DROP POLICY IF EXISTS "Users can delete their own site materials" ON public.site_materials;

-- RLS Policies
CREATE POLICY "Users can view their own site materials"
  ON public.site_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own site materials"
  ON public.site_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own site materials"
  ON public.site_materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own site materials"
  ON public.site_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_materials_site_id ON public.site_materials(site_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_material_id ON public.site_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_site_materials_user_id ON public.site_materials(user_id);

-- Function to automatically deduct stock when site materials are added
CREATE OR REPLACE FUNCTION update_material_stock_on_site_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.materials
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.material_id;
  
  INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
  VALUES (NEW.material_id, 'out', NEW.quantity, 'Utilisé sur chantier', NEW.site_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore stock when site materials are removed
CREATE OR REPLACE FUNCTION restore_material_stock_on_site_removal()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.materials
  SET quantity = quantity + OLD.quantity
  WHERE id = OLD.material_id;
  
  INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
  VALUES (OLD.material_id, 'in', OLD.quantity, 'Retour de chantier', OLD.site_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to adjust stock when site materials quantity changes
CREATE OR REPLACE FUNCTION adjust_material_stock_on_site_update()
RETURNS TRIGGER AS $$
DECLARE
  quantity_diff NUMERIC(10,2);
BEGIN
  quantity_diff := NEW.quantity - OLD.quantity;
  
  UPDATE public.materials
  SET quantity = quantity - quantity_diff
  WHERE id = NEW.material_id;
  
  IF quantity_diff > 0 THEN
    INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
    VALUES (NEW.material_id, 'out', quantity_diff, 'Ajustement chantier', NEW.site_id);
  ELSIF quantity_diff < 0 THEN
    INSERT INTO public.material_movements (material_id, type, quantity, reason, site_id)
    VALUES (NEW.material_id, 'in', ABS(quantity_diff), 'Ajustement chantier', NEW.site_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (avec DROP avant CREATE)
DROP TRIGGER IF EXISTS trigger_update_stock_on_site_usage ON public.site_materials;
CREATE TRIGGER trigger_update_stock_on_site_usage
  AFTER INSERT ON public.site_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_material_stock_on_site_usage();

DROP TRIGGER IF EXISTS trigger_restore_stock_on_site_removal ON public.site_materials;
CREATE TRIGGER trigger_restore_stock_on_site_removal
  AFTER DELETE ON public.site_materials
  FOR EACH ROW
  EXECUTE FUNCTION restore_material_stock_on_site_removal();

DROP TRIGGER IF EXISTS trigger_adjust_stock_on_site_update ON public.site_materials;
CREATE TRIGGER trigger_adjust_stock_on_site_update
  AFTER UPDATE OF quantity ON public.site_materials
  FOR EACH ROW
  WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
  EXECUTE FUNCTION adjust_material_stock_on_site_update();

-- =====================================================
-- MIGRATION 3: Company Profile
-- =====================================================

-- Create company_profile table
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    siret TEXT,
    tva_number TEXT,
    is_auto_entrepreneur BOOLEAN DEFAULT false,
    address TEXT,
    address_complement TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'France',
    email TEXT,
    phone TEXT,
    website TEXT,
    first_name TEXT,
    last_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for company_profile (si elles existent)
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

-- =====================================================
-- FIN - TOUT EST PRÊT !
-- =====================================================

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Setup terminé ! Tables créées : materials, material_movements, site_materials, company_profile';
END $$;

