import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

interface YesterdayContext {
  challenge: string | null;
  tool: string | null;
  timestamp: string | null;
}

interface TodayMorningContext {
  challenge: string | null;
  stance: string | null;
  timestamp: string | null;
}

interface CrossSessionMemory {
  yesterday: YesterdayContext;
  todayMorning: TodayMorningContext;
  isLoading: boolean;
}

export function useCrossSessionMemory(): CrossSessionMemory {
  const { user } = useAuth();

  const yesterdayQuery = useQuery({
    queryKey: ['cross-session', 'yesterday', user?.id],
    queryFn: async (): Promise<YesterdayContext> => {
      if (!user?.id) return { challenge: null, tool: null, timestamp: null };
      
      logger.db('SELECT', 'events', { userId: user.id, purpose: 'yesterday-context' });
      
      // Get yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('events')
        .select('raw_input, tool_name, created_at')
        .eq('profile_id', user.id)
        .gte('created_at', yesterday.toISOString())
        .lte('created_at', yesterdayEnd.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        logger.error('Failed to fetch yesterday context', { error: error.message });
        return { challenge: null, tool: null, timestamp: null };
      }

      if (data && data.length > 0) {
        return {
          challenge: data[0].raw_input,
          tool: data[0].tool_name,
          timestamp: data[0].created_at,
        };
      }

      return { challenge: null, tool: null, timestamp: null };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const todayMorningQuery = useQuery({
    queryKey: ['cross-session', 'today-morning', user?.id],
    queryFn: async (): Promise<TodayMorningContext> => {
      if (!user?.id) return { challenge: null, stance: null, timestamp: null };
      
      logger.db('SELECT', 'events', { userId: user.id, purpose: 'today-morning-context' });
      
      // Get today's morning (before noon)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const noon = new Date(today);
      noon.setHours(12, 0, 0, 0);

      const { data, error } = await supabase
        .from('events')
        .select('raw_input, created_at, structured_values')
        .eq('profile_id', user.id)
        .eq('tool_name', 'pulse')
        .gte('created_at', today.toISOString())
        .lte('created_at', noon.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        logger.error('Failed to fetch today morning context', { error: error.message });
        return { challenge: null, stance: null, timestamp: null };
      }

      if (data && data.length > 0) {
        const structuredValues = data[0].structured_values as Record<string, unknown> | null;
        return {
          challenge: data[0].raw_input,
          stance: (structuredValues?.stance as string) || null,
          timestamp: data[0].created_at,
        };
      }

      return { challenge: null, stance: null, timestamp: null };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    yesterday: yesterdayQuery.data || { challenge: null, tool: null, timestamp: null },
    todayMorning: todayMorningQuery.data || { challenge: null, stance: null, timestamp: null },
    isLoading: yesterdayQuery.isLoading || todayMorningQuery.isLoading,
  };
}
