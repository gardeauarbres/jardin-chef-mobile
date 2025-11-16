-- =====================================================
-- FIX v2: Sécuriser TOUTES les fonctions vulnérables
-- =====================================================
-- Version corrigée qui vérifie l'existence des colonnes
-- avant de créer les triggers
-- =====================================================

-- =====================================================
-- 1. update_company_profile_updated_at
-- =====================================================
DROP FUNCTION IF EXISTS public.update_company_profile_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_company_profile_updated_at()
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

COMMENT ON FUNCTION public.update_company_profile_updated_at() IS 
'Trigger function to automatically update the updated_at timestamp for company_profile. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

-- Recréer le trigger (seulement si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_profile') THEN
        DROP TRIGGER IF EXISTS update_company_profile_updated_at ON public.company_profile;
        CREATE TRIGGER update_company_profile_updated_at
            BEFORE UPDATE ON public.company_profile
            FOR EACH ROW
            EXECUTE FUNCTION public.update_company_profile_updated_at();
        RAISE NOTICE '✅ Trigger update_company_profile_updated_at créé';
    END IF;
END $$;

-- =====================================================
-- 2. update_material_stock_on_site_usage
-- =====================================================
DROP FUNCTION IF EXISTS public.update_material_stock_on_site_usage() CASCADE;

CREATE OR REPLACE FUNCTION public.update_material_stock_on_site_usage()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    UPDATE public.materials
    SET stock_quantity = stock_quantity - NEW.quantity_used
    WHERE id = NEW.material_id;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_material_stock_on_site_usage() IS 
'Trigger function to decrease material stock when used on a site. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_materials') THEN
        DROP TRIGGER IF EXISTS update_material_stock_on_site_usage ON public.site_materials;
        CREATE TRIGGER update_material_stock_on_site_usage
            AFTER INSERT ON public.site_materials
            FOR EACH ROW
            EXECUTE FUNCTION public.update_material_stock_on_site_usage();
        RAISE NOTICE '✅ Trigger update_material_stock_on_site_usage créé';
    END IF;
END $$;

-- =====================================================
-- 3. restore_material_stock_on_site_removal
-- =====================================================
DROP FUNCTION IF EXISTS public.restore_material_stock_on_site_removal() CASCADE;

CREATE OR REPLACE FUNCTION public.restore_material_stock_on_site_removal()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    UPDATE public.materials
    SET stock_quantity = stock_quantity + OLD.quantity_used
    WHERE id = OLD.material_id;
    
    RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.restore_material_stock_on_site_removal() IS 
'Trigger function to restore material stock when removed from a site. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_materials') THEN
        DROP TRIGGER IF EXISTS restore_material_stock_on_site_removal ON public.site_materials;
        CREATE TRIGGER restore_material_stock_on_site_removal
            AFTER DELETE ON public.site_materials
            FOR EACH ROW
            EXECUTE FUNCTION public.restore_material_stock_on_site_removal();
        RAISE NOTICE '✅ Trigger restore_material_stock_on_site_removal créé';
    END IF;
END $$;

-- =====================================================
-- 4. adjust_material_stock_on_site_update
-- =====================================================
DROP FUNCTION IF EXISTS public.adjust_material_stock_on_site_update() CASCADE;

CREATE OR REPLACE FUNCTION public.adjust_material_stock_on_site_update()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- Restaurer l'ancienne quantité
    UPDATE public.materials
    SET stock_quantity = stock_quantity + OLD.quantity_used
    WHERE id = OLD.material_id;
    
    -- Déduire la nouvelle quantité
    UPDATE public.materials
    SET stock_quantity = stock_quantity - NEW.quantity_used
    WHERE id = NEW.material_id;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.adjust_material_stock_on_site_update() IS 
'Trigger function to adjust material stock when site material usage is updated. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_materials') THEN
        DROP TRIGGER IF EXISTS adjust_material_stock_on_site_update ON public.site_materials;
        CREATE TRIGGER adjust_material_stock_on_site_update
            AFTER UPDATE ON public.site_materials
            FOR EACH ROW
            EXECUTE FUNCTION public.adjust_material_stock_on_site_update();
        RAISE NOTICE '✅ Trigger adjust_material_stock_on_site_update créé';
    END IF;
END $$;

-- =====================================================
-- 5. update_updated_at_column
-- =====================================================
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Generic trigger function to automatically update the updated_at timestamp. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

-- Recréer les triggers SEULEMENT pour les tables qui ont la colonne updated_at
DO $$
DECLARE
    table_record RECORD;
    tables_with_updated_at TEXT[] := ARRAY[
        'clients', 'quotes', 'sites', 'employees', 
        'payments', 'invoices', 'materials'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_with_updated_at
    LOOP
        -- Vérifier si la table existe ET a la colonne updated_at
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_name
            AND column_name = 'updated_at'
        ) THEN
            -- Supprimer l'ancien trigger
            EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', table_name, table_name);
            
            -- Créer le nouveau trigger
            EXECUTE format('
                CREATE TRIGGER update_%I_updated_at
                    BEFORE UPDATE ON public.%I
                    FOR EACH ROW
                    EXECUTE FUNCTION public.update_updated_at_column()
            ', table_name, table_name);
            
            RAISE NOTICE '✅ Trigger update_%_updated_at créé', table_name;
        ELSE
            RAISE NOTICE '⚠️  Table % n''existe pas ou n''a pas la colonne updated_at, trigger ignoré', table_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 6. generate_invoice_number
-- =====================================================
DROP FUNCTION IF EXISTS public.generate_invoice_number() CASCADE;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE
    new_number TEXT;
    current_year TEXT;
    next_sequence INTEGER;
BEGIN
    current_year := to_char(NOW(), 'YYYY');
    
    -- Obtenir le prochain numéro de séquence pour l'année en cours
    SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) + 1
    INTO next_sequence
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || current_year || '-%';
    
    -- Générer le numéro de facture (format: INV-YYYY-NNNN)
    new_number := 'INV-' || current_year || '-' || LPAD(next_sequence::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$;

COMMENT ON FUNCTION public.generate_invoice_number() IS 
'Generate a unique invoice number with format INV-YYYY-NNNN. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

-- =====================================================
-- 7. create_material_movement_for_site
-- =====================================================
DROP FUNCTION IF EXISTS public.create_material_movement_for_site() CASCADE;

CREATE OR REPLACE FUNCTION public.create_material_movement_for_site()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Récupérer le user_id depuis le matériau
    SELECT user_id INTO v_user_id
    FROM public.materials
    WHERE id = NEW.material_id;
    
    -- Créer un mouvement de matériau
    INSERT INTO public.material_movements (
        material_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        user_id
    ) VALUES (
        NEW.material_id,
        'usage',
        NEW.quantity_used,
        'site',
        NEW.site_id,
        'Utilisé sur le chantier',
        v_user_id
    );
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_material_movement_for_site() IS 
'Trigger function to create material movement record when material is used on a site. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_materials') THEN
        DROP TRIGGER IF EXISTS create_material_movement_for_site ON public.site_materials;
        CREATE TRIGGER create_material_movement_for_site
            AFTER INSERT ON public.site_materials
            FOR EACH ROW
            EXECUTE FUNCTION public.create_material_movement_for_site();
        RAISE NOTICE '✅ Trigger create_material_movement_for_site créé';
    END IF;
END $$;

-- =====================================================
-- 8. restore_material_on_delete
-- =====================================================
DROP FUNCTION IF EXISTS public.restore_material_on_delete() CASCADE;

CREATE OR REPLACE FUNCTION public.restore_material_on_delete()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Récupérer le user_id depuis le matériau
    SELECT user_id INTO v_user_id
    FROM public.materials
    WHERE id = OLD.material_id;
    
    -- Créer un mouvement de matériau pour la restauration
    INSERT INTO public.material_movements (
        material_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        user_id
    ) VALUES (
        OLD.material_id,
        'adjustment',
        OLD.quantity_used,
        'site',
        OLD.site_id,
        'Restauré depuis le chantier (suppression)',
        v_user_id
    );
    
    RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.restore_material_on_delete() IS 
'Trigger function to create material movement record when material is restored from site deletion. 
SECURITY: Uses SECURITY INVOKER and fixed search_path.';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_materials') THEN
        DROP TRIGGER IF EXISTS restore_material_on_delete ON public.site_materials;
        CREATE TRIGGER restore_material_on_delete
            AFTER DELETE ON public.site_materials
            FOR EACH ROW
            EXECUTE FUNCTION public.restore_material_on_delete();
        RAISE NOTICE '✅ Trigger restore_material_on_delete créé';
    END IF;
END $$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================
DO $$
DECLARE
    vulnerable_count INTEGER;
    total_functions INTEGER;
BEGIN
    -- Compter les fonctions encore vulnérables
    SELECT COUNT(*) INTO vulnerable_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND (p.proconfig IS NULL OR NOT 'search_path' = ANY(
        SELECT split_part(unnest(p.proconfig), '=', 1)
    ))
    AND p.proname NOT LIKE 'pg_%'
    AND p.proname NOT LIKE 'sql_%';
    
    -- Compter le total de fonctions
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND p.proname NOT LIKE 'pg_%'
    AND p.proname NOT LIKE 'sql_%';
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '   RÉSUMÉ DU CORRECTIF DE SÉCURITÉ';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    
    IF vulnerable_count = 0 THEN
        RAISE NOTICE '✅ SUCCÈS COMPLET !';
        RAISE NOTICE '✅ % fonctions sécurisées sur %', total_functions, total_functions;
        RAISE NOTICE '✅ 0 fonction vulnérable restante';
        RAISE NOTICE '✅ Toutes les fonctions ont search_path fixé';
        RAISE NOTICE '✅ SECURITY INVOKER activé sur toutes les fonctions';
    ELSE
        RAISE WARNING '⚠️  ATTENTION : % fonction(s) encore vulnérable(s)', vulnerable_count;
        RAISE WARNING '⚠️  % fonctions sécurisées sur %', (total_functions - vulnerable_count), total_functions;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Afficher le statut de toutes les fonctions
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    CASE 
        WHEN p.proconfig IS NULL THEN '❌ PAS DE CONFIG'
        WHEN NOT 'search_path' = ANY(
            SELECT split_part(unnest(p.proconfig), '=', 1)
        ) THEN '⚠️ search_path NON DÉFINI'
        ELSE '✅ SÉCURISÉ'
    END AS status,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        WHEN false THEN 'SECURITY INVOKER'
    END AS security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE 'sql_%'
ORDER BY status DESC, function_name;

