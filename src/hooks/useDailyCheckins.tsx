// @ts-nocheck
// TypeScript checking disabled until new tables are added to generated Supabase types
// After running the migration and `supabase gen types`, remove this directive

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { DailyCheckin, DailyCheckinInsert, ActivityType } from '@/types/database';

// Import unified wisdom data - WISDOM_CARDS is now just for backwards compatibility
// Use useDailyWisdom hook for the main daily quote feature
import { WISDOM_CARDS } from '@/data/dailyWisdom';

// Reflection prompts by time of day
const REFLECTION_PROMPTS = {
  morning: [
    "What's your main focus today?",
    "What's one thing you're looking forward to?",
    "How do you want to show up today?",
    "What challenge might you face today, and how will you handle it?",
  ],
  afternoon: [
    "What's going well so far today?",
    "What's one thing in your control right now?",
    "How are you staying composed?",
  ],
  evening: [
    "What are you grateful for today?",
    "What did you learn about yourself today?",
    "What would you do differently tomorrow?",
  ],
};

// Quick challenge types for type-aware UI rendering
export type QuickChallengeType = 'dichotomy' | 'gratitude' | 'cognitive' | 'action' | 'mindfulness';

// Quick challenges with type for rendering the correct UI
const QUICK_CHALLENGES: Array<{ challenge: string; type: QuickChallengeType }> = [
  { challenge: "Name 3 things completely in your control right now", type: "dichotomy" },
  { challenge: "Take 3 deep breaths and notice how you feel", type: "mindfulness" },
  { challenge: "Think of one person you're grateful for and why", type: "gratitude" },
  { challenge: "Identify one assumption you're making today", type: "cognitive" },
  { challenge: "What's one small win you can achieve in the next hour?", type: "action" },
];

// Micro-commitment templates
const COMMITMENT_PROMPTS = [
  "What's one small thing you'll do today to stay composed?",
  "What will you let go of today?",
  "How will you practice patience today?",
  "What's one kind thing you'll do for yourself?",
];

export function useDailyCheckins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get today's check-ins (UTC-consistent)
  const todayQuery = useQuery({
    queryKey: ['daily_checkins', user?.id, 'today'],
    queryFn: async (): Promise<DailyCheckin[]> => {
      if (!user?.id) return [];
      
      // Use UTC midnight for consistent timezone handling
      const now = new Date();
      const todayStart = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
      ));
      
      logger.db('SELECT', 'daily_checkins', { userId: user.id, purpose: 'today', since: todayStart.toISOString() });
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('profile_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch today checkins', { error: error.message, code: error.code });
        return [];
      }

      logger.debug('Today checkins fetched', { count: data?.length || 0 });
      return (data || []) as DailyCheckin[];
    },
    enabled: !!user?.id,
    // Refetch more frequently to ensure fresh data
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get recent check-ins (last 7 days, UTC-consistent)
  const recentQuery = useQuery({
    queryKey: ['daily_checkins', user?.id, 'recent'],
    queryFn: async (): Promise<DailyCheckin[]> => {
      if (!user?.id) return [];
      
      // Use UTC for consistent timezone handling
      const now = new Date();
      const weekAgo = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
        0, 0, 0, 0
      ));
      
      logger.db('SELECT', 'daily_checkins', { userId: user.id, purpose: 'recent', since: weekAgo.toISOString() });
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('profile_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch recent checkins', { error: error.message, code: error.code });
        return [];
      }

      logger.debug('Recent checkins fetched', { count: data?.length || 0 });
      return (data || []) as DailyCheckin[];
    },
    enabled: !!user?.id,
    // Refetch more frequently to ensure fresh data
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create a new check-in with comprehensive error handling
  const createCheckinMutation = useMutation({
    mutationFn: async (checkin: DailyCheckinInsert) => {
      // Validate authentication
      if (!user?.id) {
        const error = new Error('Not authenticated - please sign in again');
        logger.error('Check-in failed: not authenticated');
        throw error;
      }
      
      // Validate required fields
      if (!checkin.activity_type) {
        const error = new Error('Invalid check-in: missing activity type');
        logger.error('Check-in failed: missing activity_type');
        throw error;
      }
      
      logger.db('INSERT', 'daily_checkins', { 
        userId: user.id, 
        type: checkin.activity_type,
        hasPrompt: !!checkin.prompt,
        hasResponse: !!checkin.response_data
      });
      
      try {
        const { data, error } = await supabase
          .from('daily_checkins')
          .insert({
            ...checkin,
            profile_id: user.id,
          })
          .select()
          .single();

        if (error) {
          // Parse Supabase error for better user feedback
          logger.error('Failed to create checkin', { 
            error: error.message, 
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          
          // Create user-friendly error messages based on error type
          if (error.code === '42501' || error.message?.includes('permission')) {
            throw new Error('Permission denied - your session may have expired');
          } else if (error.code === '23503' || error.message?.includes('foreign key')) {
            throw new Error('Profile not found - please try signing out and back in');
          } else if (error.code === '23505' || error.message?.includes('duplicate')) {
            throw new Error('This check-in was already saved');
          } else if (error.message?.includes('JWT') || error.message?.includes('token')) {
            throw new Error('Session expired - please sign in again');
          } else {
            throw new Error(error.message || 'Failed to save check-in');
          }
        }

        if (!data) {
          throw new Error('No data returned from save operation');
        }

        // Update profile's updated_at timestamp (non-blocking, don't fail if this fails)
        try {
          await supabase
            .from('profiles')
            .update({ 
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (profileUpdateError) {
          // Log but don't fail - the check-in was saved successfully
          logger.warn('Failed to update profile timestamp', { 
            error: profileUpdateError instanceof Error ? profileUpdateError.message : 'Unknown' 
          });
        }

        logger.info('Checkin created successfully', { 
          checkinId: data.id, 
          type: checkin.activity_type,
          userId: user.id
        });
        return data as DailyCheckin;
      } catch (err) {
        // Re-throw if already a proper Error
        if (err instanceof Error) {
          throw err;
        }
        // Wrap unknown errors
        logger.error('Unexpected error creating checkin', { error: String(err) });
        throw new Error('An unexpected error occurred while saving your check-in');
      }
    },
    onSuccess: (data) => {
      logger.debug('Check-in mutation succeeded, invalidating queries', { checkinId: data?.id });
      queryClient.invalidateQueries({ queryKey: ['daily_checkins', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      logger.error('Check-in mutation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });

  // Get next activity to show based on time, last activity, etc.
  const getNextActivity = (): { type: ActivityType; config: ActivityConfig } => {
    const hour = new Date().getHours();
    const todayCheckins = todayQuery.data || [];
    const completedTypes = new Set(todayCheckins.map(c => c.activity_type));
    
    // Determine time period
    const period = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : 'evening';
    
    // Priority order based on time and what's not done yet
    const activityPriority: ActivityType[] = period === 'morning'
      ? ['reflection_prompt', 'energy_checkin', 'micro_commitment', 'wisdom_card', 'quick_challenge']
      : period === 'afternoon'
      ? ['quick_challenge', 'wisdom_card', 'reflection_prompt', 'energy_checkin']
      : ['reflection_prompt', 'wisdom_card', 'energy_checkin', 'pattern_insight'];
    
    // Find first activity not done today
    for (const activityType of activityPriority) {
      if (!completedTypes.has(activityType)) {
        return { type: activityType, config: getActivityConfig(activityType, period) };
      }
    }
    
    // Default to wisdom card if all done
    return { type: 'wisdom_card', config: getActivityConfig('wisdom_card', period) };
  };

  return {
    todayCheckins: todayQuery.data || [],
    recentCheckins: recentQuery.data || [],
    isLoading: todayQuery.isLoading,
    createCheckin: createCheckinMutation.mutateAsync,
    isCreating: createCheckinMutation.isPending,
    getNextActivity,
    WISDOM_CARDS,
    REFLECTION_PROMPTS,
    QUICK_CHALLENGES,
    COMMITMENT_PROMPTS,
  };
}

// Activity configuration generator
interface ActivityConfig {
  type: ActivityType;
  title: string;
  prompt: string;
  icon: string;
  color: string;
  scoreImpact: number;
}

function getActivityConfig(type: ActivityType, period: 'morning' | 'afternoon' | 'evening'): ActivityConfig {
  const prompts = REFLECTION_PROMPTS[period];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  const randomWisdom = WISDOM_CARDS[Math.floor(Math.random() * WISDOM_CARDS.length)];
  const randomChallenge = QUICK_CHALLENGES[Math.floor(Math.random() * QUICK_CHALLENGES.length)];
  const randomCommitment = COMMITMENT_PROMPTS[Math.floor(Math.random() * COMMITMENT_PROMPTS.length)];

  const configs: Record<ActivityType, ActivityConfig> = {
    reflection_prompt: {
      type: 'reflection_prompt',
      title: 'Quick Reflection',
      prompt: randomPrompt,
      icon: 'MessageSquare',
      color: 'hsl(45 100% 60%)',
      scoreImpact: 3,
    },
    quick_challenge: {
      type: 'quick_challenge',
      title: 'Quick Challenge',
      prompt: randomChallenge.challenge,
      icon: 'Target',
      color: 'hsl(187 100% 50%)',
      scoreImpact: 3,
    },
    wisdom_card: {
      type: 'wisdom_card',
      title: 'Daily Wisdom',
      prompt: `"${randomWisdom.quote}" — ${randomWisdom.author}`,
      icon: 'Sparkles',
      color: 'hsl(45 100% 60%)', // gold (knowledge/enlightenment) - brand compliant
      scoreImpact: 2,
    },
    energy_checkin: {
      type: 'energy_checkin',
      title: 'Energy Check',
      prompt: 'How are you feeling right now?',
      icon: 'Activity',
      color: 'hsl(166 100% 50%)',
      scoreImpact: 3,
    },
    micro_commitment: {
      type: 'micro_commitment',
      title: 'Micro-Commitment',
      prompt: randomCommitment,
      icon: 'CheckCircle',
      color: 'hsl(142 70% 45%)',
      scoreImpact: 4,
    },
    pattern_insight: {
      type: 'pattern_insight',
      title: 'Your Pattern',
      prompt: 'Based on your recent activity, here\'s an insight...',
      icon: 'TrendingUp',
      color: 'hsl(200 80% 55%)',
      scoreImpact: 2,
    },
    streak_celebration: {
      type: 'streak_celebration',
      title: 'Streak Milestone!',
      prompt: 'Celebrate your consistency!',
      icon: 'Flame',
      color: 'hsl(8 100% 65%)',
      scoreImpact: 5,
    },
  };

  return configs[type];
}
