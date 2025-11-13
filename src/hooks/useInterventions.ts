import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Intervention {
  id: string;
  user_id: string;
  site_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  employee_ids: string[] | null;
  reminder_sent: boolean;
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterventionWithSite extends Intervention {
  site?: {
    id: string;
    title: string;
    client_id: string;
    clients?: {
      first_name: string;
      last_name: string;
    };
  };
}

export function useInterventions(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery<InterventionWithSite[]>({
    queryKey: ['interventions', user?.id, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('interventions')
        .select(`
          *,
          sites (
            id,
            title,
            client_id,
            clients (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      // Filtrer par date si fourni
      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('end_time', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        // Si la table n'existe pas encore, retourner un tableau vide
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Table interventions does not exist yet. Run the migration first.');
          return [];
        }
        throw error;
      }

      return (data || []) as InterventionWithSite[];
    },
    enabled: !!user,
    staleTime: 30000, // 30 secondes
  });
}

export function useInterventionMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      siteId,
      title,
      description,
      startTime,
      endTime,
      status,
      employeeIds,
      reminderTime,
    }: {
      id?: string;
      siteId: string;
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      status?: Intervention['status'];
      employeeIds?: string[];
      reminderTime?: Date;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const interventionData = {
        user_id: user.id,
        site_id: siteId,
        title,
        description: description || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: status || 'scheduled',
        employee_ids: employeeIds || null,
        reminder_time: reminderTime?.toISOString() || null,
      };

      if (id) {
        // Update
        const { data, error } = await supabase
          .from('interventions')
          .update(interventionData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data as Intervention;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('interventions')
          .insert(interventionData)
          .select()
          .single();

        if (error) throw error;
        return data as Intervention;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    },
  });
}

export function useInterventionDelete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interventionId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', interventionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return interventionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    },
  });
}

