import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('analytics_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (error) {
        console.error("useAnalytics error:", error);
      }
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });
}

export const incrementAnalytics = async (userId, type, amount = 1, dateOverride = null) => {
  if (!userId) return;
  const dateStr = dateOverride || new Date().toISOString().split('T')[0];
  
  const { data: existing, error: fetchError } = await supabase
    .from('analytics_log')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching analytics", fetchError);
    return;
  }

  const payload = {
    user_id: userId,
    date: dateStr,
    dsa_solves: Math.max(0, (existing?.dsa_solves || 0) + (type === 'dsa' ? amount : 0)),
    jobs_applied: Math.max(0, (existing?.jobs_applied || 0) + (type === 'job' ? amount : 0)),
    targets_completed: Math.max(0, (existing?.targets_completed || 0) + (type === 'target' ? amount : 0))
  };

  if (existing) {
    const { error: updateError } = await supabase.from('analytics_log').update(payload).eq('id', existing.id);
    if (updateError) console.error("Update error:", updateError);
  } else {
    const { error: insertError } = await supabase.from('analytics_log').insert([payload]);
    if (insertError) console.error("Insert error:", insertError);
  }
};
