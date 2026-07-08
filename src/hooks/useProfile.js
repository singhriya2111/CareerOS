import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function useProfile() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        if (error.code === '42P01' || error.message.includes('relation "user_profiles" does not exist')) {
          console.warn("user_profiles table does not exist yet. Please run the SQL migration.");
        } else {
          throw error;
        }
      }

      if (data && data.theme) {
        setTheme(data.theme);
      }

      return data || {
        user_id: user.id,
        display_name: user.email.split('@')[0],
        dsa_target: 0,
        job_target: 0,
        default_tab: 'Dashboard',
        theme: 'dark'
      };
    },
    enabled: !!user,
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: async (updates) => {
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([{ user_id: user.id, ...updates }], { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data.theme) {
        setTheme(data.theme);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}
