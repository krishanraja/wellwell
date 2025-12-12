import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

interface VirtueDataPoint {
  date: string;
  courage: number;
  temperance: number;
  justice: number;
  wisdom: number;
}

export function useVirtueHistory(days: number = 30) {
  const { user } = useAuth();

  const historyQuery = useQuery({
    queryKey: ['virtue_history', user?.id, days],
    queryFn: async (): Promise<VirtueDataPoint[]> => {
      if (!user?.id) return [];
      
      logger.db('SELECT', 'virtue_scores', { userId: user.id, purpose: 'history', days });
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('virtue_scores')
        .select('virtue, score, recorded_at')
        .eq('profile_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) {
        logger.error('Failed to fetch virtue history', { error: error.message });
        return [];
      }

      // Group by date and aggregate
      const byDate: Record<string, Record<string, number>> = {};
      
      data?.forEach(record => {
        const date = new Date(record.recorded_at).toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { courage: 50, temperance: 50, justice: 50, wisdom: 50 };
        }
        byDate[date][record.virtue] = record.score;
      });

      // Fill in missing dates with previous values
      const result: VirtueDataPoint[] = [];
      let lastValues = { courage: 50, temperance: 50, justice: 50, wisdom: 50 };
      
      for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
        if (byDate[dateStr]) {
          lastValues = { ...lastValues, ...byDate[dateStr] };
        }
        
        result.push({
          date: dateStr,
          ...lastValues,
        });
      }

      logger.debug('Virtue history fetched', { dataPoints: result.length });
      return result;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
  };
}
