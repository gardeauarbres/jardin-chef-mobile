-- =====================================================
-- FIX: Sécuriser la fonction update_legal_acceptances_updated_at
-- =====================================================
-- Ce script corrige le problème de sécurité lié au search_path
-- non fixé dans la fonction de trigger.
-- =====================================================

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.update_legal_acceptances_updated_at() CASCADE;

-- Recréer la fonction avec search_path fixé et SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.update_legal_acceptances_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER  -- S'exécute avec les privilèges de l'appelant (plus sûr)
SET search_path = public, pg_catalog  -- Fixe le search_path pour éviter les injections
AS $$
BEGIN
    -- Mise à jour du timestamp avec NOW() (pg_catalog.now())
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Commenter la fonction pour la documentation
COMMENT ON FUNCTION public.update_legal_acceptances_updated_at() IS 
'Trigger function to automatically update the updated_at timestamp. 
Uses SECURITY INVOKER and fixed search_path for security.';

-- Recréer le trigger
DROP TRIGGER IF EXISTS update_legal_acceptances_updated_at ON public.legal_acceptances;

CREATE TRIGGER update_legal_acceptances_updated_at
    BEFORE UPDATE ON public.legal_acceptances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_legal_acceptances_updated_at();

-- Vérifier que la fonction est bien créée
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'update_legal_acceptances_updated_at'
    ) THEN
        RAISE NOTICE '✅ Fonction update_legal_acceptances_updated_at sécurisée avec succès !';
        RAISE NOTICE '✅ search_path fixé à: public, pg_catalog';
        RAISE NOTICE '✅ SECURITY INVOKER activé';
    ELSE
        RAISE EXCEPTION '❌ Erreur: La fonction n''a pas été créée correctement';
    END IF;
END $$;

-- Afficher les détails de la fonction pour vérification
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END AS volatility,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        WHEN false THEN 'SECURITY INVOKER'
    END AS security_type,
    p.proconfig AS config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_legal_acceptances_updated_at';

