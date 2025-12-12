import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

export function useStreak() {
  const { user } = useAuth();

  const streakQuery = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      
      logger.db('SELECT', 'usage_tracking', { userId: user.id, purpose: 'streak' });
      
      // Get all usage records for the user, ordered by date
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('used_at')
        .eq('profile_id', user.id)
        .order('used_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch usage for streak', { error: error.message });
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Calculate streak by checking consecutive days
      const uniqueDays = new Set<string>();
      data.forEach(record => {
        const date = new Date(record.used_at).toISOString().split('T')[0];
        uniqueDays.add(date);
      });

      const sortedDays = Array.from(uniqueDays).sort().reverse();
      
      // Check if today or yesterday has activity (streak is still active)
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDays[0] !== today && sortedDays[0] !== yesterday) {
        // Streak is broken
        return 0;
      }

      // Count consecutive days
      let streak = 0;
      let checkDate = new Date(sortedDays[0]);
      
      for (const day of sortedDays) {
        const dayDate = new Date(day);
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - streak);
        
        if (dayDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          streak++;
        } else {
          break;
        }
      }

      logger.debug('Streak calculated', { streak, totalDays: uniqueDays.size });
      return streak;
    },
    enabled: !!user?.id,
  });

  return {
    streak: streakQuery.data || 0,
    isLoading: streakQuery.isLoading,
  };
}
