import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SiteMaterial {
  id: string;
  user_id: string;
  site_id: string;
  material_id: string;
  quantity: number;
  date_used: string;
  notes?: string;
  created_at: string;
  materials?: {
    id: string;
    name: string;
    unit: string;
    unit_price: number;
    category: string;
  };
}

export interface CreateSiteMaterialInput {
  site_id: string;
  material_id: string;
  quantity: number;
  date_used: string;
  notes?: string;
}

// Hook pour récupérer les matériaux d'un chantier
export const useSiteMaterials = (siteId?: string) => {
  return useQuery({
    queryKey: ['site-materials', siteId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      if (!siteId) return [];

      const { data, error } = await supabase
        .from('site_materials')
        .select(`
          *,
          materials (
            id,
            name,
            unit,
            unit_price,
            category
          )
        `)
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .order('date_used', { ascending: false });

      if (error) throw error;
      return data as SiteMaterial[];
    },
    enabled: !!siteId,
  });
};

// Hook pour créer un lien matériau-chantier
export const useAddSiteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSiteMaterialInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Vérifier que le matériau existe et a assez de stock
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .select('quantity, name, unit')
        .eq('id', input.material_id)
        .single();

      if (materialError) throw materialError;

      if (material.quantity < input.quantity) {
        throw new Error(
          `Stock insuffisant ! Disponible: ${material.quantity} ${material.unit}, demandé: ${input.quantity} ${material.unit}`
        );
      }

      // Créer le lien (les triggers SQL s'occupent du reste)
      const { data, error } = await supabase
        .from('site_materials')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-materials', variables.site_id] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material-movements'] });
      toast.success('Matériau ajouté au chantier');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });
};

// Hook pour supprimer un lien matériau-chantier (remet le stock à jour automatiquement)
export const useRemoveSiteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, __, context: any) => {
      queryClient.invalidateQueries({ queryKey: ['site-materials'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material-movements'] });
      toast.success('Matériau retiré (stock restauré)');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });
};

// Hook pour obtenir le total des coûts matériaux d'un chantier
export const useSiteMaterialsCost = (siteId?: string) => {
  return useQuery({
    queryKey: ['site-materials-cost', siteId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      if (!siteId) return 0;

      const { data, error } = await supabase
        .from('site_materials')
        .select(`
          quantity,
          materials (
            unit_price
          )
        `)
        .eq('site_id', siteId)
        .eq('user_id', user.id);

      if (error) throw error;

      const total = data.reduce((sum, item) => {
        const unitPrice = item.materials?.unit_price || 0;
        return sum + (item.quantity * unitPrice);
      }, 0);

      return total;
    },
    enabled: !!siteId,
  });
};

