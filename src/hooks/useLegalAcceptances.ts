import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LegalAcceptance {
  id: string;
  user_id: string;
  privacy_policy_accepted: boolean;
  legal_notice_accepted: boolean;
  terms_of_service_accepted: boolean;
  terms_of_sale_accepted: boolean;
  privacy_policy_version: string;
  legal_notice_version: string;
  terms_of_service_version: string;
  terms_of_sale_version: string;
  privacy_policy_accepted_at?: string;
  legal_notice_accepted_at?: string;
  terms_of_service_accepted_at?: string;
  terms_of_sale_accepted_at?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface AcceptLegalInput {
  privacy_policy?: boolean;
  legal_notice?: boolean;
  terms_of_service?: boolean;
  terms_of_sale?: boolean;
}

// Hook pour récupérer les acceptations de l'utilisateur
export const useLegalAcceptances = () => {
  return useQuery({
    queryKey: ['legal-acceptances'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('legal_acceptances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = pas de résultats (normal pour un nouvel utilisateur)
        throw error;
      }

      return data as LegalAcceptance | null;
    },
  });
};

// Hook pour accepter les documents légaux
export const useAcceptLegal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AcceptLegalInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const now = new Date().toISOString();
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');
      const userAgent = navigator.userAgent;

      // Préparer les données d'acceptation
      const acceptanceData: any = {
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      if (input.privacy_policy !== undefined) {
        acceptanceData.privacy_policy_accepted = input.privacy_policy;
        acceptanceData.privacy_policy_accepted_at = input.privacy_policy ? now : null;
        acceptanceData.privacy_policy_version = '1.0';
      }

      if (input.legal_notice !== undefined) {
        acceptanceData.legal_notice_accepted = input.legal_notice;
        acceptanceData.legal_notice_accepted_at = input.legal_notice ? now : null;
        acceptanceData.legal_notice_version = '1.0';
      }

      if (input.terms_of_service !== undefined) {
        acceptanceData.terms_of_service_accepted = input.terms_of_service;
        acceptanceData.terms_of_service_accepted_at = input.terms_of_service ? now : null;
        acceptanceData.terms_of_service_version = '1.0';
      }

      if (input.terms_of_sale !== undefined) {
        acceptanceData.terms_of_sale_accepted = input.terms_of_sale;
        acceptanceData.terms_of_sale_accepted_at = input.terms_of_sale ? now : null;
        acceptanceData.terms_of_sale_version = '1.0';
      }

      // Vérifier si l'utilisateur a déjà un enregistrement
      const { data: existing } = await supabase
        .from('legal_acceptances')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Mettre à jour
        const { data, error } = await supabase
          .from('legal_acceptances')
          .update(acceptanceData)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Créer
        const { data, error } = await supabase
          .from('legal_acceptances')
          .insert([acceptanceData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-acceptances'] });
    },
    onError: (error: Error) => {
      console.error('Erreur lors de l\'acceptation:', error);
      toast.error('Erreur lors de la sauvegarde');
    },
  });
};

// Fonction helper pour vérifier si tous les documents sont acceptés
export const hasAcceptedAllLegal = (acceptance: LegalAcceptance | null | undefined): boolean => {
  if (!acceptance) return false;
  
  return (
    acceptance.privacy_policy_accepted &&
    acceptance.legal_notice_accepted &&
    acceptance.terms_of_service_accepted
    // terms_of_sale est optionnel
  );
};

