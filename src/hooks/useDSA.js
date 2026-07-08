import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { incrementAnalytics } from './useAnalytics';

export function useDSA() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dsa', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('dsa_problems').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddDSA() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (newProblem) => {
      const { data, error } = await supabase.from('dsa_problems').insert([{ ...newProblem, user_id: user.id }]).select().single();
      if (error) throw error;
      
      if (newProblem.status === 'Solved') {
        await incrementAnalytics(user.id, 'dsa', 1);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', user?.id] });
    },
  });
}

export function useUpdateDSA() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('dsa_problems').update(updates).eq('id', id).eq('user_id', user.id).select().single();
      if (error) throw error;
      
      if (updates.status === 'Solved') {
        await incrementAnalytics(user.id, 'dsa', 1);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', user?.id] });
    },
  });
}

export function useDeleteDSA() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('dsa_problems').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dsa', user?.id] }),
  });
}
