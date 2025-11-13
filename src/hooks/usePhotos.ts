import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Photo {
  id: string;
  user_id: string;
  site_id: string;
  url: string;
  type: 'before' | 'after' | 'progress' | 'other';
  description: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

export function usePhotos(siteId?: string) {
  const { user } = useAuth();

  return useQuery<Photo[]>({
    queryKey: ['photos', siteId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;

      if (error) {
        // Si la table n'existe pas encore, retourner un tableau vide
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Table photos does not exist yet. Run the migration first.');
          return [];
        }
        throw error;
      }

      return (data || []) as Photo[];
    },
    enabled: !!user,
    staleTime: 30000, // 30 secondes
  });
}

export function usePhotoUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siteId,
      file,
      type,
      description,
    }: {
      siteId: string;
      file: File;
      type: 'before' | 'after' | 'progress' | 'other';
      description?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Compresser l'image si nécessaire (max 2MB)
      const compressedFile = await compressImage(file, 2000000); // 2MB max

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${siteId}/${Date.now()}.${fileExt}`;
      const filePath = `site-photos/${fileName}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Si le bucket n'existe pas, créer une erreur explicite
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Le bucket de stockage "photos" n\'existe pas. Veuillez le créer dans Supabase Storage.');
        }
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Enregistrer dans la base de données
      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          site_id: siteId,
          url: publicUrl,
          type,
          description: description || null,
          file_name: file.name,
          file_size: compressedFile.size,
        })
        .select()
        .single();

      if (dbError) {
        // Supprimer le fichier uploadé en cas d'erreur DB
        await supabase.storage.from('photos').remove([filePath]);
        throw dbError;
      }

      return photoData as Photo;
    },
    onSuccess: (data) => {
      // Invalider les caches pour rafraîchir les listes
      queryClient.invalidateQueries({ queryKey: ['photos', data.site_id] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function usePhotoDelete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Récupérer la photo pour obtenir l'URL
      const { data: photo, error: fetchError } = await supabase
        .from('photos')
        .select('*')
        .eq('id', photoId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!photo) throw new Error('Photo not found');

      // Extraire le chemin du fichier depuis l'URL
      const url = new URL(photo.url);
      const filePath = url.pathname.split('/storage/v1/object/public/photos/')[1];

      // Supprimer de la base de données
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // Supprimer le fichier du storage
      if (filePath) {
        await supabase.storage.from('photos').remove([filePath]);
      }

      return photo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['photos', data.site_id] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

// Fonction pour compresser les images
async function compressImage(file: File, maxSizeBytes: number): Promise<File> {
  // Si le fichier est déjà assez petit, le retourner tel quel
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculer les nouvelles dimensions pour garder le ratio
        const maxDimension = 1920; // Max width ou height
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en blob avec qualité progressive
        let quality = 0.9;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Si toujours trop gros, réduire la qualité
              if (blob.size > maxSizeBytes && quality > 0.5) {
                quality -= 0.1;
                canvas.toBlob(
                  (smallerBlob) => {
                    if (smallerBlob) {
                      const compressedFile = new File([smallerBlob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                      });
                      resolve(compressedFile);
                    } else {
                      resolve(file);
                    }
                  },
                  'image/jpeg',
                  quality
                );
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}

