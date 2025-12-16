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

      // If profile is missing, try to recover it
      if (!data) {
        logger.warn('Profile missing for user, attempting recovery', { userId: user.id });
        
        try {
          // Add timeout to recovery to prevent hanging (5 seconds)
          // Use Promise.race to timeout if recovery takes too long
          const recoveryWithTimeout = Promise.race([
            supabase.rpc('ensure_profile_exists'),
            new Promise<{ error: { message: string } }>((resolve) => {
              setTimeout(() => {
                resolve({ error: { message: 'Recovery timeout after 5 seconds' } });
              }, 5000);
            }),
          ]);
          
          const recoveryResult = await recoveryWithTimeout;
          
          // Check for errors (either from RPC call or timeout)
          if (recoveryResult.error) {
            const errorMsg = recoveryResult.error.message || 'Unknown error';
            // Check if function doesn't exist (common after project migration)
            if (errorMsg.includes('function') && (errorMsg.includes('does not exist') || errorMsg.includes('not found'))) {
              logger.error('Profile recovery function missing - migrations may not be run', { 
                error: errorMsg,
                hint: 'Run migration: 20251216131409_add_profile_recovery.sql in Supabase SQL Editor'
              });
            } else if (errorMsg.includes('timeout')) {
              logger.warn('Profile recovery timed out - continuing without recovery');
            } else {
              logger.error('Profile recovery failed', { error: errorMsg });
            }
            // Don't throw - allow user to continue, they can retry later
            endTimer();
            return null;
          }
          
          logger.info('Profile recovery successful, refetching profile');
          
          // Retry fetching profile after recovery
          const { data: recoveredData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          if (retryError) {
            logger.error('Failed to fetch profile after recovery', { error: retryError.message });
            endTimer();
            return null;
          }
          
          if (recoveredData) {
            endTimer();
            logger.info('Profile recovered successfully');
            return {
              ...recoveredData,
              persona: recoveredData.persona as Persona | null,
              challenges: recoveredData.challenges || [],
              goals: recoveredData.goals || [],
              morning_pulse_time: recoveredData.morning_pulse_time || null,
              evening_debrief_time: recoveredData.evening_debrief_time || null,
            } as Profile;
          }
        } catch (recoveryErr) {
          logger.error('Profile recovery exception', { 
            error: recoveryErr instanceof Error ? recoveryErr.message : 'Unknown error' 
          });
          endTimer();
          return null;
        }
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
    retry: 1, // Retry once if profile is missing (will trigger recovery)
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
