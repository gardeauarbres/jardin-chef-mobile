import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Hook générique pour les requêtes Supabase avec cache optimisé
export function useSupabaseQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error: any) {
        // Si c'est une erreur 404 ou table n'existe pas, retourner un tableau vide pour les tableaux
        if (error?.code === 'PGRST116' || error?.status === 404 || error?.message?.includes('does not exist')) {
          console.warn('Table does not exist or 404 error:', error);
          // Retourner un tableau vide par défaut si T est un tableau
          return [] as unknown as T;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      // Ne pas réessayer si c'est une erreur 404 (table n'existe pas)
      if (error?.code === 'PGRST116' || error?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
    ...options,
  });
}

// Hook pour les mutations avec invalidation automatique du cache
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: string[][],
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutationFn,
    onSuccess: () => {
      // Invalider les caches concernés pour rafraîchir les données
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    ...options,
  });
}

// Hook pour récupérer les clients avec cache
export function useClients() {
  const { user } = useAuth();

  return useSupabaseQuery(
    ['clients', user?.id || ''],
    async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user,
    }
  );
}

// Hook pour récupérer les devis avec cache
export function useQuotes() {
  const { user } = useAuth();

  return useSupabaseQuery(
    ['quotes', user?.id || ''],
    async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            first_name,
            last_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user,
    }
  );
}

// Hook pour récupérer les sites avec cache
export function useSites() {
  const { user } = useAuth();

  return useSupabaseQuery(
    ['sites', user?.id || ''],
    async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          clients (
            first_name,
            last_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Si la table n'existe pas ou erreur 404, retourner un tableau vide
      if (error) {
        // Vérifier différents codes d'erreur possibles
        const is404Error = error.code === 'PGRST116' || 
                          error.status === 404 || 
                          error.message?.includes('does not exist') ||
                          error.message?.includes('relation') && error.message?.includes('does not exist');
        
        if (is404Error) {
          console.warn('Table sites does not exist or 404 error:', error.message);
          return [];
        }
        throw error;
      }
      return data || [];
    },
    {
      enabled: !!user,
    }
  );
}

// Hook pour récupérer les paiements avec cache
export function usePayments() {
  const { user } = useAuth();

  return useSupabaseQuery(
    ['payments', user?.id || ''],
    async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          sites (
            title
          ),
          clients (
            first_name,
            last_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Si la table n'existe pas ou erreur 404, retourner un tableau vide
      if (error) {
        // Vérifier différents codes d'erreur possibles
        const is404Error = error.code === 'PGRST116' || 
                          error.status === 404 || 
                          error.message?.includes('does not exist') ||
                          error.message?.includes('relation') && error.message?.includes('does not exist');
        
        if (is404Error) {
          console.warn('Table payments does not exist or 404 error:', error.message);
          return [];
        }
        throw error;
      }
      return data || [];
    },
    {
      enabled: !!user,
    }
  );
}

// Hook pour récupérer les employés avec cache
export function useEmployees() {
  const { user } = useAuth();

  return useSupabaseQuery(
    ['employees', user?.id || ''],
    async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user,
    }
  );
}

// Hook pour récupérer les feuilles de temps avec cache
export function useTimesheets() {
  const { user } = useAuth();

  return useSupabaseQuery(
    ['timesheets', user?.id || ''],
    async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!user,
    }
  );
}

