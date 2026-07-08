import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { incrementAnalytics } from './useAnalytics';

export function useJobs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newJob) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...newJob, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      await incrementAnalytics(user.id, 'job', 1);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', user?.id] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id] });
    },
  });
}
