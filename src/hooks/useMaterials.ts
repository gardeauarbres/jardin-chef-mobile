import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Material {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: 'plant' | 'tool' | 'product' | 'equipment' | 'other';
  quantity: number;
  unit: string;
  min_quantity: number;
  unit_price: number;
  supplier?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialMovement {
  id: string;
  user_id: string;
  material_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  site_id?: string;
  created_at: string;
  materials?: Material;
  sites?: {
    name: string;
  };
}

export interface CreateMaterialInput {
  name: string;
  description?: string;
  category: Material['category'];
  quantity: number;
  unit: string;
  min_quantity: number;
  unit_price: number;
  supplier?: string;
  location?: string;
}

export interface UpdateMaterialInput extends Partial<CreateMaterialInput> {
  id: string;
}

export interface CreateMovementInput {
  material_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  site_id?: string;
}

// Hook pour récupérer tous les matériaux
export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Material[];
    },
  });
};

// Hook pour récupérer un matériau spécifique
export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Material;
    },
    enabled: !!id,
  });
};

// Hook pour récupérer les mouvements de stock
export const useMaterialMovements = (materialId?: string) => {
  return useQuery({
    queryKey: ['material-movements', materialId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      let query = supabase
        .from('material_movements')
        .select(`
          *,
          materials (
            name,
            unit
          ),
          sites (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (materialId) {
        query = query.eq('material_id', materialId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MaterialMovement[];
    },
  });
};

// Hook pour créer un matériau
export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMaterialInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('materials')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Matériau créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création : ${error.message}`);
    },
  });
};

// Hook pour mettre à jour un matériau
export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateMaterialInput) => {
      const { data, error } = await supabase
        .from('materials')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Matériau mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });
};

// Hook pour supprimer un matériau
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Matériau supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    },
  });
};

// Hook pour créer un mouvement de stock
export const useCreateMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMovementInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Récupérer le matériau actuel
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .select('quantity')
        .eq('id', input.material_id)
        .single();

      if (materialError) throw materialError;

      // Calculer la nouvelle quantité
      let newQuantity = material.quantity;
      if (input.type === 'in') {
        newQuantity += input.quantity;
      } else if (input.type === 'out') {
        newQuantity -= input.quantity;
      } else if (input.type === 'adjustment') {
        newQuantity = input.quantity;
      }

      // Mettre à jour la quantité du matériau
      const { error: updateError } = await supabase
        .from('materials')
        .update({ quantity: newQuantity })
        .eq('id', input.material_id);

      if (updateError) throw updateError;

      // Créer le mouvement
      const { data, error } = await supabase
        .from('material_movements')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material-movements'] });
      toast.success('Mouvement de stock enregistré');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });
};

