import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { logger } from '@/lib/logger';

// Daily limits for free tier - give users real value before asking to upgrade
const FREE_TIER_LIMITS: Record<string, number> = {
  pulse: 3,
  intervene: 3,
  debrief: 3,
  decision: 3,
  conflict: 3,
  unified: 3, // Unified input on Home page
};

// Pro tier has unlimited usage
const PRO_TIER_LIMIT = Infinity;

export function useUsageLimit(toolName: string) {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const queryClient = useQueryClient();

  // Get today's start timestamp
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const usageQuery = useQuery({
    queryKey: ['usage', user?.id, toolName, todayStart.toISOString()],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      
      logger.db('SELECT', 'usage_tracking', { userId: user.id, toolName, since: todayStart.toISOString() });
      
      const { count, error } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('tool_name', toolName)
        .gte('used_at', todayStart.toISOString());

      if (error) {
        logger.error('Failed to fetch usage count', { error: error.message });
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  const trackUsageMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('INSERT', 'usage_tracking', { userId: user.id, toolName });
      
      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          profile_id: user.id,
          tool_name: toolName,
        });

      if (error) {
        logger.error('Failed to track usage', { error: error.message });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage', user?.id, toolName] });
    },
  });

  const dailyLimit = isPro ? PRO_TIER_LIMIT : (FREE_TIER_LIMITS[toolName] || 1);
  const usedToday = usageQuery.data || 0;
  const canUse = usedToday < dailyLimit;
  const remainingUses = Math.max(0, dailyLimit - usedToday);

  return {
    usedToday,
    dailyLimit,
    canUse,
    remainingUses,
    isLoading: usageQuery.isLoading,
    trackUsage: trackUsageMutation.mutateAsync,
    isTracking: trackUsageMutation.isPending,
  };
}
