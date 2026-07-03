import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useLinks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddLink() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (newLink) => {
      const { data, error } = await supabase.from('links').insert([{ ...newLink, user_id: user.id }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links', user?.id] }),
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links', user?.id] }),
  });
}
