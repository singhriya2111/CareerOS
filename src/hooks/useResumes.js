import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useResumes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['resumes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddResume() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ file, name, type }) => {
      // 1. Upload file to Supabase Storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // 3. Save metadata to resumes table
      const { data, error: dbError } = await supabase
        .from('resumes')
        .insert([{
          user_id: user.id,
          name,
          type,
          file_url: publicUrl,
          last_updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }])
        .select()
        .single();
        
      if (dbError) throw dbError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes', user?.id] }),
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (resume) => {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resume.id)
        .eq('user_id', user.id);
        
      if (dbError) throw dbError;

      // 2. Try to delete from storage (extract filepath from URL)
      try {
        const urlParts = resume.file_url.split('/resumes/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('resumes').remove([filePath]);
        }
      } catch (err) {
        console.error("Failed to delete file from storage, but removed from DB", err);
      }

      return resume.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resumes', user?.id] }),
  });
}
