import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { Profile, ProfileUpdate, Persona } from '@/types/database';

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;
      
      logger.db('SELECT', 'profiles', { userId: user.id });
      const endTimer = logger.startTimer('fetchProfile');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Failed to fetch profile', { error: error.message });
        throw error;
      }

      endTimer();
      logger.debug('Profile fetched', { hasProfile: !!data });
      
      // Cast the data to match our Profile type
      if (data) {
        return {
          ...data,
          persona: data.persona as Persona | null,
          challenges: data.challenges || [],
          goals: data.goals || [],
          morning_pulse_time: data.morning_pulse_time || null,
          evening_debrief_time: data.evening_debrief_time || null,
        } as Profile;
      }
      
      return null;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('UPDATE', 'profiles', { userId: user.id, updates });
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update profile', { error: error.message });
        throw error;
      }

      logger.info('Profile updated successfully');
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
