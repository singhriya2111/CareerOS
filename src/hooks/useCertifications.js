import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useCertifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['certifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('certifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddCertification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (newCert) => {
      const { data, error } = await supabase.from('certifications').insert([{ ...newCert, user_id: user.id }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certifications', user?.id] }),
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('certifications').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certifications', user?.id] }),
  });
}
