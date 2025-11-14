import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  siret?: string;
  tva_number?: string;
  is_auto_entrepreneur: boolean;
  address?: string;
  address_complement?: string;
  postal_code?: string;
  city?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  first_name?: string;
  last_name?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export type CompanyProfileInput = Omit<CompanyProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Fetch company profile
export const useCompanyProfile = () => {
  return useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('company_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return data as CompanyProfile | null;
    },
  });
};

// Create or update company profile
export const useUpsertCompanyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: CompanyProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('company_profile')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('company_profile')
          .update(profile)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('company_profile')
          .insert([{ ...profile, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Profil d\'entreprise enregistré avec succès');
    },
    onError: (error: Error) => {
      console.error('Error upserting company profile:', error);
      toast.error('Erreur lors de l\'enregistrement du profil');
    },
  });
};

// Delete company profile
export const useDeleteCompanyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('company_profile')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Profil d\'entreprise supprimé');
    },
    onError: (error: Error) => {
      console.error('Error deleting company profile:', error);
      toast.error('Erreur lors de la suppression du profil');
    },
  });
};

