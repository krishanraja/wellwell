import { useEffect, useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useEvents } from "@/hooks/useEvents";
import { useDailyCheckins } from "@/hooks/useDailyCheckins";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { Flame, Sunrise, Sun, Moon, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@/types/database";

// Activity components
import { 
  ReflectionPrompt, 
  QuickChallenge, 
  WisdomCard, 
  EnergyCheckin, 
  MicroCommitment, 
  PatternInsight, 
  StreakCelebration 
} from "@/components/wellwell/activities";

interface WelcomeBackScreenProps {
  onComplete: () => void;
  daysSinceLastUse?: number;
}

const WelcomeBackScreen = ({ onComplete, daysSinceLastUse = 0 }: WelcomeBackScreenProps) => {
  const { profile, isLoading: profileLoading } = useProfile();
  const { streak, isLoading: streakLoading } = useStreak();
  const { events, isLoading: eventsLoading } = useEvents();
  const { period, greeting } = useTimeOfDay();
  const navigate = useNavigate();
  const { 
    todayCheckins, 
    createCheckin, 
    isCreating,
    WISDOM_CARDS, 
    REFLECTION_PROMPTS, 
    QUICK_CHALLENGES, 
    COMMITMENT_PROMPTS,
  } = useDailyCheckins();
  
  const [phase, setPhase] = useState<'loading' | 'activity' | 'complete'>('loading');
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null);
  const [activityComplete, setActivityComplete] = useState(false);
  const [wisdomIndex, setWisdomIndex] = useState(0);
  
  const isLoading = profileLoading || streakLoading || eventsLoading;
  const needsReOnboarding = daysSinceLastUse >= 21; // 3+ weeks
  const isWeeklyReturn = daysSinceLastUse >= 7 && daysSinceLastUse < 21;

  // Personalized greeting
  const displayName = profile?.display_name;
  const personalGreeting = displayName 
    ? `${greeting}, ${displayName}` 
    : greeting;

  // Determine time period for prompts
  const timePeriod = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  }, []);

  // Check for streak milestones
  const streakMilestone = useMemo(() => {
    const milestones = [90, 60, 30, 14, 7];
    return milestones.find(m => streak === m) || null;
  }, [streak]);

  // Select which activity to show
  const selectActivity = (): ActivityType => {
    // Check which activities have been completed today
    const completedTypes = new Set(todayCheckins.map(c => c.activity_type));
    
    // If streak milestone, always celebrate first
    if (streakMilestone && !completedTypes.has('streak_celebration')) {
      return 'streak_celebration';
    }

    // Long-returning users get energy check-in or pattern insight
    if (needsReOnboarding) {
      if (!completedTypes.has('energy_checkin')) return 'energy_checkin';
      if (!completedTypes.has('pattern_insight')) return 'pattern_insight';
      if (!completedTypes.has('micro_commitment')) return 'micro_commitment';
    }

    // Time-based activity selection
    const activities: ActivityType[] = timePeriod === 'morning'
      ? ['reflection_prompt', 'energy_checkin', 'micro_commitment', 'wisdom_card']
      : timePeriod === 'afternoon'
      ? ['quick_challenge', 'wisdom_card', 'reflection_prompt']
      : ['reflection_prompt', 'wisdom_card', 'energy_checkin'];

    // Find first activity not completed today
    for (const activity of activities) {
      if (!completedTypes.has(activity)) {
        return activity;
      }
    }

    // All done? Show wisdom card (always fresh)
    return 'wisdom_card';
  };

  // Get random prompt based on activity type
  const getActivityPrompt = (type: ActivityType): string => {
    switch (type) {
      case 'reflection_prompt':
        const prompts = REFLECTION_PROMPTS[timePeriod] || REFLECTION_PROMPTS.morning;
        return prompts[Math.floor(Math.random() * prompts.length)];
      case 'quick_challenge':
        return QUICK_CHALLENGES[Math.floor(Math.random() * QUICK_CHALLENGES.length)].challenge;
      case 'micro_commitment':
        return COMMITMENT_PROMPTS[Math.floor(Math.random() * COMMITMENT_PROMPTS.length)];
      case 'wisdom_card':
        return WISDOM_CARDS[wisdomIndex].quote;
      default:
        return '';
    }
  };

  // Handle activity completion
  const handleActivityComplete = async (type: ActivityType, responseData: Record<string, unknown>) => {
    setActivityComplete(true);
    
    try {
      await createCheckin({
        profile_id: profile?.id || '',
        activity_type: type,
        prompt: getActivityPrompt(type),
        response_data: responseData,
        completed: true,
        score_impact: getScoreImpact(type),
      });
    } catch (error) {
      console.error('Failed to save checkin:', error);
    }
    
    // Brief celebration before transitioning
    setTimeout(() => {
      setPhase('complete');
    }, 500);
  };

  // Handle skip
  const handleSkip = () => {
    setPhase('complete');
  };

  // Get score impact for activity
  const getScoreImpact = (type: ActivityType): number => {
    const impacts: Record<ActivityType, number> = {
      reflection_prompt: 3,
      quick_challenge: 3,
      wisdom_card: 2,
      energy_checkin: 3,
      micro_commitment: 4,
      pattern_insight: 2,
      streak_celebration: 5,
    };
    return impacts[type] || 2;
  };

  // Handle direct action navigation
  const handleQuickAction = (route: string) => {
    onComplete();
    navigate(route);
  };

  // Refresh wisdom card
  const handleRefreshWisdom = () => {
    setWisdomIndex((prev) => (prev + 1) % WISDOM_CARDS.length);
  };

  // Generate pattern insight based on user data
  const getPatternInsight = () => {
    // Default pattern if no data
    const basePattern = {
      type: 'growth' as const,
      title: 'Starting Fresh',
      description: 'Every new beginning is a chance to practice wisdom. Let\'s build your path together.',
      suggestion: 'Try completing your first Morning Pulse to set the tone for your day.',
    };

    if (!events || events.length === 0) return basePattern;

    // Analyze user's patterns
    const eventsByTool = events.reduce((acc, e) => {
      acc[e.tool_name] = (acc[e.tool_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTool = Object.entries(eventsByTool).sort((a, b) => b[1] - a[1])[0];

    if (mostUsedTool) {
      const toolPatterns: Record<string, { title: string; description: string; type: 'positive' | 'neutral' | 'growth' }> = {
        pulse: {
          type: 'positive',
          title: 'Morning Mindset Builder',
          description: 'You\'re most active with Morning Pulse. This shows you value intentional starts.',
        },
        debrief: {
          type: 'positive',
          title: 'Evening Reflector',
          description: 'You favor Evening Debriefs. Reflection is how we learn and grow.',
        },
        intervene: {
          type: 'growth',
          title: 'Active Problem Solver',
          description: 'You use Intervene often. You face challenges head-on—a Stoic quality.',
        },
      };

      const pattern = toolPatterns[mostUsedTool[0]] || basePattern;
      return {
        ...pattern,
        dataPoints: [`${mostUsedTool[1]} ${mostUsedTool[0]} sessions`],
        suggestion: daysSinceLastUse > 7 
          ? 'Pick up where you left off with consistency.' 
          : 'Keep this momentum going!',
      };
    }

    return basePattern;
  };

  useEffect(() => {
    if (isLoading) return;
    
    // Random wisdom index on mount
    setWisdomIndex(Math.floor(Math.random() * WISDOM_CARDS.length));
    
    // Select activity and show it
    const activity = selectActivity();
    setCurrentActivity(activity);
    setPhase('activity');
  }, [isLoading]);

  // Handle completion phase
  useEffect(() => {
    if (phase === 'complete') {
      setTimeout(() => {
        onComplete();
      }, 200);
    }
  }, [phase, onComplete]);

  // Loading state
  if (isLoading || phase === 'loading') {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      >
        <motion.img 
          src={wellwellIcon} 
          alt="WellWell" 
          className="w-16 h-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    );
  }

  // Activity phase - show the selected mini-activity
  if (phase === 'activity' && currentActivity) {
    const currentWisdom = WISDOM_CARDS[wisdomIndex];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-background"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src={wellwellIcon} alt="" className="w-8 h-8" />
            <div>
              <p className="text-sm font-medium text-foreground">{personalGreeting}</p>
              {daysSinceLastUse > 0 && (
                <p className="text-xs text-muted-foreground">
                  {daysSinceLastUse === 1 ? 'Yesterday' : `${daysSinceLastUse} days ago`}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={handleSkip}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak badge if applicable */}
        {streak >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 flex justify-center py-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">{streak} day streak</span>
            </div>
          </motion.div>
        )}

        {/* Activity content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {currentActivity === 'reflection_prompt' && (
              <ReflectionPrompt
                prompt={getActivityPrompt('reflection_prompt')}
                onSubmit={(text) => handleActivityComplete('reflection_prompt', { text, wordCount: text.split(/\s+/).length })}
                onSkip={handleSkip}
                isSubmitting={isCreating}
              />
            )}

            {currentActivity === 'quick_challenge' && (
              <QuickChallenge
                challenge={getActivityPrompt('quick_challenge')}
                onComplete={(response) => handleActivityComplete('quick_challenge', response)}
                onSkip={handleSkip}
                isSubmitting={isCreating}
              />
            )}

            {currentActivity === 'wisdom_card' && (
              <WisdomCard
                quote={currentWisdom.quote}
                author={currentWisdom.author}
                onComplete={(response) => handleActivityComplete('wisdom_card', response)}
                onSkip={handleSkip}
                onRefresh={handleRefreshWisdom}
              />
            )}

            {currentActivity === 'energy_checkin' && (
              <EnergyCheckin
                onComplete={(response) => handleActivityComplete('energy_checkin', response)}
                onSkip={handleSkip}
                isSubmitting={isCreating}
              />
            )}

            {currentActivity === 'micro_commitment' && (
              <MicroCommitment
                prompt={getActivityPrompt('micro_commitment')}
                onComplete={(response) => handleActivityComplete('micro_commitment', response)}
                onSkip={handleSkip}
                isSubmitting={isCreating}
              />
            )}

            {currentActivity === 'pattern_insight' && (
              <PatternInsight
                pattern={getPatternInsight()}
                onComplete={(response) => handleActivityComplete('pattern_insight', response)}
                onSkip={handleSkip}
              />
            )}

            {currentActivity === 'streak_celebration' && streakMilestone && (
              <StreakCelebration
                streakDays={streak}
                milestone={streakMilestone}
                onComplete={(response) => handleActivityComplete('streak_celebration', response)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Quick actions at bottom */}
        <div className="shrink-0 p-4 border-t border-white/5">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('/pulse')}
              className="flex-1 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Sunrise className="w-4 h-4 text-amber-400" />
              <span className="text-xs">Pulse</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickAction('/')}
              className="flex-1 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs">Freeform</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickAction('/debrief')}
              className="flex-1 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-xs">Debrief</span>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback / transition
  return null;
};

export default WelcomeBackScreen;
