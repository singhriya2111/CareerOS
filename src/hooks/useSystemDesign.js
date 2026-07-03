import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useSystemDesign() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['system_design', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('system_design_topics').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddSystemDesign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (newTopic) => {
      const { data, error } = await supabase.from('system_design_topics').insert([{ ...newTopic, user_id: user.id }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system_design', user?.id] }),
  });
}

export function useUpdateSystemDesign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase.from('system_design_topics').update(updates).eq('id', id).eq('user_id', user.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system_design', user?.id] }),
  });
}

export function useDeleteSystemDesign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('system_design_topics').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system_design', user?.id] }),
  });
}
