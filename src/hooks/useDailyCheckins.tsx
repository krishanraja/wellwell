import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';
import type { DailyCheckin, DailyCheckinInsert, ActivityType } from '@/types/database';

// Stoic wisdom cards for rotation
const WISDOM_CARDS = [
  { quote: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { quote: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { quote: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { quote: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { quote: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { quote: "If it is not right, do not do it. If it is not true, do not say it.", author: "Marcus Aurelius" },
  { quote: "How long are you going to wait before you demand the best for yourself?", author: "Epictetus" },
  { quote: "The key is to keep company only with people who uplift you.", author: "Epictetus" },
  { quote: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { quote: "No man is free who is not master of himself.", author: "Epictetus" },
  { quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { quote: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
];

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

// Quick challenges
const QUICK_CHALLENGES = [
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

  // Get today's check-ins
  const todayQuery = useQuery({
    queryKey: ['daily_checkins', user?.id, 'today'],
    queryFn: async (): Promise<DailyCheckin[]> => {
      if (!user?.id) return [];
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      logger.db('SELECT', 'daily_checkins', { userId: user.id, purpose: 'today' });
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('profile_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch today checkins', { error: error.message });
        return [];
      }

      return (data || []) as DailyCheckin[];
    },
    enabled: !!user?.id,
  });

  // Get recent check-ins (last 7 days)
  const recentQuery = useQuery({
    queryKey: ['daily_checkins', user?.id, 'recent'],
    queryFn: async (): Promise<DailyCheckin[]> => {
      if (!user?.id) return [];
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      logger.db('SELECT', 'daily_checkins', { userId: user.id, purpose: 'recent' });
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('profile_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch recent checkins', { error: error.message });
        return [];
      }

      return (data || []) as DailyCheckin[];
    },
    enabled: !!user?.id,
  });

  // Create a new check-in
  const createCheckinMutation = useMutation({
    mutationFn: async (checkin: DailyCheckinInsert) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      logger.db('INSERT', 'daily_checkins', { userId: user.id, type: checkin.activity_type });
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          ...checkin,
          profile_id: user.id,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create checkin', { error: error.message });
        throw error;
      }

      // Update profile's total checkins and last activity
      await supabase
        .from('profiles')
        .update({ 
          total_checkins: (await supabase.from('daily_checkins').select('id', { count: 'exact' }).eq('profile_id', user.id)).count || 0,
          last_welcome_activity: checkin.activity_type,
        })
        .eq('id', user.id);

      logger.info('Checkin created', { checkinId: data.id, type: checkin.activity_type });
      return data as DailyCheckin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_checkins', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
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
      color: 'hsl(260 80% 65%)',
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

