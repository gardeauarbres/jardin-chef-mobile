-- Script pour configurer les politiques Storage pour les photos
-- Ce script doit être exécuté APRÈS avoir créé le bucket "photos" dans Supabase Storage

-- Vérifier que la table photos existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('before', 'after', 'progress', 'other')),
  description TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
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

-- Activer RLS sur la table photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Supprimer et recréer les politiques pour la table photos
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

-- Créer les index si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_photos_site_id ON public.photos(site_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON public.photos(type);

-- ============================================
-- POLITIQUES STORAGE (pour le bucket "photos")
-- ============================================
-- IMPORTANT: Ces politiques nécessitent que le bucket "photos" existe déjà dans Storage

-- Supprimer les anciennes politiques Storage si elles existent
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Photos are publicly readable" ON storage.objects;

-- Politique 1: Les utilisateurs authentifiés peuvent uploader leurs propres photos
-- Le chemin doit être: site-photos/{user_id}/{site_id}/{filename}
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = 'site-photos' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique 2: Les utilisateurs authentifiés peuvent voir leurs propres photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos' AND
  (
    (storage.foldername(name))[1] = 'site-photos' AND
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Politique 3: Les utilisateurs authentifiés peuvent supprimer leurs propres photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (
    (storage.foldername(name))[1] = 'site-photos' AND
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Politique 4: Les photos sont publiquement accessibles en lecture (pour l'affichage)
CREATE POLICY "Photos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

