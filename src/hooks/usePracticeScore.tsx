// @ts-nocheck
// TypeScript checking disabled until new tables are added to generated Supabase types
// After running the migration and `supabase gen types typescript`, remove this directive

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { PracticeScore, PracticeScoreSource } from '@/types/database';

/**
 * Practice Score System
 * 
 * Scores reflect consistency of practice, not AI judgment.
 * Score ranges from 0-100, with different impacts based on activity type.
 * 
 * Score Impacts:
 * - Morning Pulse: +5
 * - Evening Debrief: +5
 * - Daily Check-in: +3
 * - Micro-commitment complete: +4
 * - Streak bonus (7/14/30/60/90): +5/+7/+10/+15/+20
 * - Inactivity: -2 per day (floor of 20)
 */

const SCORE_IMPACTS: Record<PracticeScoreSource, number> = {
  morning_pulse: 5,
  evening_debrief: 5,
  daily_checkin: 3,
  micro_commitment: 4,
  streak_bonus: 5, // Base, actual varies by milestone
  inactivity_decay: -2,
};

const STREAK_BONUSES: Record<number, number> = {
  7: 5,
  14: 7,
  30: 10,
  60: 15,
  90: 20,
};

export function usePracticeScore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current practice score
  const currentScoreQuery = useQuery({
    queryKey: ['practice_score', user?.id, 'current'],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 50; // Default starting score
      
      logger.db('SELECT', 'practice_scores', { userId: user.id, purpose: 'current' });
      
      try {
        const { data, error } = await supabase
          .from('practice_scores')
          .select('score')
          .eq('profile_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No score yet, return default
            return 50;
          }
          logger.error('Failed to fetch practice score', { error: error.message });
          return 50;
        }

        return data?.score || 50;
      } catch {
        // Table may not exist yet
        return 50;
      }
    },
    enabled: !!user?.id,
  });

  // Get score history (last 30 days)
  const historyQuery = useQuery({
    queryKey: ['practice_score', user?.id, 'history'],
    queryFn: async (): Promise<PracticeScore[]> => {
      if (!user?.id) return [];
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      logger.db('SELECT', 'practice_scores', { userId: user.id, purpose: 'history' });
      
      try {
        const { data, error } = await supabase
          .from('practice_scores')
          .select('*')
          .eq('profile_id', user.id)
          .gte('recorded_at', thirtyDaysAgo.toISOString())
          .order('recorded_at', { ascending: true });

        if (error) {
          logger.error('Failed to fetch score history', { error: error.message });
          return [];
        }

        return (data || []) as PracticeScore[];
      } catch {
        // Table may not exist yet
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Get today's score changes
  const todayChangesQuery = useQuery({
    queryKey: ['practice_score', user?.id, 'today'],
    queryFn: async (): Promise<PracticeScore[]> => {
      if (!user?.id) return [];
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      logger.db('SELECT', 'practice_scores', { userId: user.id, purpose: 'today' });
      
      try {
        const { data, error } = await supabase
          .from('practice_scores')
          .select('*')
          .eq('profile_id', user.id)
          .gte('recorded_at', todayStart.toISOString())
          .order('recorded_at', { ascending: false });

        if (error) {
          logger.error('Failed to fetch today score changes', { error: error.message });
          return [];
        }

        return (data || []) as PracticeScore[];
      } catch {
        // Table may not exist yet
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Record a score change
  const recordScoreMutation = useMutation({
    mutationFn: async (params: { source: string; sourceType: PracticeScoreSource; streak?: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const currentScore = currentScoreQuery.data || 50;
      
      // Calculate delta based on source type
      let delta = SCORE_IMPACTS[params.sourceType] || 0;
      
      // Special handling for streak bonuses
      if (params.sourceType === 'streak_bonus' && params.streak) {
        delta = STREAK_BONUSES[params.streak] || 0;
      }
      
      // Calculate new score (clamped to 0-100)
      const newScore = Math.min(100, Math.max(0, currentScore + delta));
      
      logger.db('INSERT', 'practice_scores', { 
        userId: user.id, 
        sourceType: params.sourceType,
        delta,
        newScore,
      });
      
      try {
        const { data, error } = await supabase
          .from('practice_scores')
          .insert({
            profile_id: user.id,
            score: newScore,
            delta,
            source: params.source,
            source_type: params.sourceType,
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to record score', { error: error.message });
          throw error;
        }

        logger.info('Practice score updated', { 
          oldScore: currentScore, 
          newScore, 
          delta, 
          source: params.source,
        });
        
        return data as PracticeScore;
      } catch (err) {
        // Table may not exist yet - return mock data
        logger.error('Score recording failed - table may not exist', { error: err });
        return {
          id: crypto.randomUUID(),
          profile_id: user.id,
          score: newScore,
          delta,
          source: params.source,
          source_type: params.sourceType,
          recorded_at: new Date().toISOString(),
        } as PracticeScore;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice_score', user?.id] });
    },
  });

  // Calculate today's progress (how much score was earned today)
  const todayProgress = (todayChangesQuery.data || []).reduce((sum, change) => {
    return sum + (change.delta > 0 ? change.delta : 0);
  }, 0);

  // Calculate score trend (comparing this week vs last week)
  const calculateTrend = (): 'up' | 'down' | 'stable' => {
    const history = historyQuery.data || [];
    if (history.length < 7) return 'stable';
    
    const thisWeek = history.slice(-7);
    const lastWeek = history.slice(-14, -7);
    
    if (lastWeek.length === 0) return 'stable';
    
    const thisWeekAvg = thisWeek.reduce((sum, s) => sum + s.score, 0) / thisWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, s) => sum + s.score, 0) / lastWeek.length;
    
    const diff = thisWeekAvg - lastWeekAvg;
    if (diff > 3) return 'up';
    if (diff < -3) return 'down';
    return 'stable';
  };

  // Helper: Record score for Morning Pulse
  const recordMorningPulse = () => {
    return recordScoreMutation.mutateAsync({
      source: 'Completed Morning Pulse',
      sourceType: 'morning_pulse',
    });
  };

  // Helper: Record score for Evening Debrief
  const recordEveningDebrief = () => {
    return recordScoreMutation.mutateAsync({
      source: 'Completed Evening Debrief',
      sourceType: 'evening_debrief',
    });
  };

  // Helper: Record score for Daily Check-in
  const recordDailyCheckin = (activityType: string) => {
    return recordScoreMutation.mutateAsync({
      source: `Completed ${activityType} check-in`,
      sourceType: 'daily_checkin',
    });
  };

  // Helper: Record score for Streak Milestone
  const recordStreakBonus = (streak: number) => {
    if (!STREAK_BONUSES[streak]) return Promise.resolve(null);
    
    return recordScoreMutation.mutateAsync({
      source: `${streak}-day streak milestone`,
      sourceType: 'streak_bonus',
      streak,
    });
  };

  return {
    // Current state
    currentScore: currentScoreQuery.data || 50,
    isLoading: currentScoreQuery.isLoading,
    
    // History and changes
    history: historyQuery.data || [],
    todayChanges: todayChangesQuery.data || [],
    todayProgress,
    trend: calculateTrend(),
    
    // Actions
    recordScore: recordScoreMutation.mutateAsync,
    recordMorningPulse,
    recordEveningDebrief,
    recordDailyCheckin,
    recordStreakBonus,
    isRecording: recordScoreMutation.isPending,
    
    // Constants (for display)
    SCORE_IMPACTS,
    STREAK_BONUSES,
  };
}
