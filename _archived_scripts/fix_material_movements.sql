-- =====================================================
-- FIX: Ajouter user_id à material_movements
-- =====================================================

-- Ajouter la colonne user_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'material_movements' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.material_movements 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Remplir user_id pour les enregistrements existants
        -- (en utilisant le user_id du matériau associé)
        UPDATE public.material_movements
        SET user_id = materials.user_id
        FROM public.materials
        WHERE material_movements.material_id = materials.id
        AND material_movements.user_id IS NULL;
        
        -- Rendre la colonne NOT NULL après avoir rempli les données
        ALTER TABLE public.material_movements 
        ALTER COLUMN user_id SET NOT NULL;
        
        -- Créer un index pour les performances
        CREATE INDEX IF NOT EXISTS idx_material_movements_user_id 
        ON public.material_movements(user_id);
        
        RAISE NOTICE 'Colonne user_id ajoutée à material_movements avec succès';
    ELSE
        RAISE NOTICE 'La colonne user_id existe déjà dans material_movements';
    END IF;
END $$;

-- Vérifier que tout est bon
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'material_movements'
ORDER BY ordinal_position;

