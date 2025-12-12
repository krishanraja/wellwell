import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { VirtueScore, Virtue } from '@/types/database';

export function useVirtueScores() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const scoresQuery = useQuery({
    queryKey: ['virtue_scores', user?.id],
    queryFn: async (): Promise<VirtueScore[]> => {
      if (!user?.id) return [];
      
      logger.db('SELECT', 'virtue_scores', { userId: user.id });
      
      // Get the most recent score for each virtue
      const { data, error } = await supabase
        .from('virtue_scores')
        .select('*')
        .eq('profile_id', user.id)
        .order('recorded_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch virtue scores', { error: error.message });
        throw error;
      }

      // Get the latest score for each virtue
      const latestByVirtue = new Map<Virtue, VirtueScore>();
      for (const score of data || []) {
        const virtue = score.virtue as Virtue;
        if (!latestByVirtue.has(virtue)) {
          latestByVirtue.set(virtue, {
            ...score,
            virtue,
          } as VirtueScore);
        }
      }

      logger.debug('Virtue scores fetched', { count: latestByVirtue.size });
      return Array.from(latestByVirtue.values());
    },
    enabled: !!user?.id,
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ virtue, delta }: { virtue: Virtue; delta: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('INSERT', 'virtue_scores', { userId: user.id, virtue, delta });
      
      // Get current score
      const currentScores = scoresQuery.data || [];
      const currentScore = currentScores.find(s => s.virtue === virtue);
      const newScore = Math.max(0, Math.min(100, (currentScore?.score || 50) + delta));

      const { data, error } = await supabase
        .from('virtue_scores')
        .insert({
          profile_id: user.id,
          virtue,
          score: newScore,
          delta,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to update virtue score', { error: error.message });
        throw error;
      }

      logger.info('Virtue score updated', { virtue, delta, newScore });
      return data as VirtueScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtue_scores', user?.id] });
    },
  });

  // Get scores as a map for easy access
  const scoresMap = (scoresQuery.data || []).reduce((acc, score) => {
    acc[score.virtue] = score;
    return acc;
  }, {} as Record<Virtue, VirtueScore>);

  return {
    scores: scoresQuery.data || [],
    scoresMap,
    isLoading: scoresQuery.isLoading,
    error: scoresQuery.error,
    updateScore: updateScoreMutation.mutateAsync,
    isUpdating: updateScoreMutation.isPending,
  };
}
