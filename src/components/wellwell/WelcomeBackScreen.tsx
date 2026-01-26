import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useEvents } from "@/hooks/useEvents";
import { useDailyCheckins } from "@/hooks/useDailyCheckins";
import { useDailyWisdom } from "@/hooks/useDailyWisdom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { Flame, Sunrise, Moon, X } from "lucide-react";
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
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { streak, isLoading: streakLoading } = useStreak();
  const { events, isLoading: eventsLoading } = useEvents();
  const { period, greeting } = useTimeOfDay();
  const navigate = useNavigate();
  const { 
    todayCheckins, 
    createCheckin, 
    isCreating,
    isLoading: checkinsLoading,
    REFLECTION_PROMPTS, 
    QUICK_CHALLENGES, 
    COMMITMENT_PROMPTS,
  } = useDailyCheckins();
  
  // Use unified daily wisdom for consistent quotes across the app
  const { 
    todaysQuote: dailyWisdom,
    refreshQuote,
    saveQuote,
    isSaved: isWisdomSaved,
  } = useDailyWisdom();
  
  const [phase, setPhase] = useState<'loading' | 'activity' | 'complete'>('loading');
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null);
  const [activityComplete, setActivityComplete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<{ challenge: string; type: 'dichotomy' | 'gratitude' | 'cognitive' | 'action' | 'mindfulness' } | null>(null);
  // Transition lock to prevent multiple simultaneous transitions (fixes glitching)
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Track if activity was already selected to prevent re-selection on re-render
  const [activitySelected, setActivitySelected] = useState(false);
  // Track if we're actively saving to prevent premature transitions
  const [isSaving, setIsSaving] = useState(false);
  // Store the prompt when activity is selected to ensure consistency
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  // Ref to track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true);
  
  // CRITICAL FIX: Wait for BOTH loading to complete AND profile to exist
  // Previously only checked if loading was done, not if profile was successfully loaded
  const isLoading = profileLoading || streakLoading || eventsLoading || checkinsLoading;
  const isProfileReady = !profileLoading && !!profile?.id;
  const isFullyReady = !isLoading && isProfileReady;
  
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

  // Get random prompt based on activity type - memoized to prevent regeneration
  const generatePrompt = useCallback((type: ActivityType): string => {
    switch (type) {
      case 'reflection_prompt':
        const prompts = REFLECTION_PROMPTS[timePeriod] || REFLECTION_PROMPTS.morning;
        return prompts[Math.floor(Math.random() * prompts.length)];
      case 'quick_challenge':
        // Use the stored challenge if available, otherwise pick a random one
        if (selectedChallenge) {
          return selectedChallenge.challenge;
        }
        return QUICK_CHALLENGES[Math.floor(Math.random() * QUICK_CHALLENGES.length)].challenge;
      case 'micro_commitment':
        return COMMITMENT_PROMPTS[Math.floor(Math.random() * COMMITMENT_PROMPTS.length)];
      case 'wisdom_card':
        return dailyWisdom.quote;
      default:
        return '';
    }
  }, [timePeriod, selectedChallenge, dailyWisdom.quote, REFLECTION_PROMPTS, QUICK_CHALLENGES, COMMITMENT_PROMPTS]);
  
  // Use stored prompt for saving (ensures consistency between display and save)
  const getActivityPrompt = useCallback((type: ActivityType): string => {
    // Use the stored prompt if available (set when activity was selected)
    if (currentPrompt) {
      return currentPrompt;
    }
    // Fallback to generating a new one (shouldn't happen in normal flow)
    return generatePrompt(type);
  }, [currentPrompt, generatePrompt]);

  // Handle activity completion with proper error handling and retry logic
  const handleActivityComplete = async (type: ActivityType, responseData: Record<string, unknown>) => {
    // Prevent multiple simultaneous transitions
    if (isTransitioning || isSaving) {
      console.warn('Already transitioning or saving, ignoring duplicate completion');
      return;
    }
    
    // CRITICAL: Check profile is ready BEFORE starting save
    // This was a major bug - we were checking profile.id but profile might not be loaded yet
    if (!isProfileReady || !profile?.id) {
      console.error('Cannot save checkin: profile not ready', { 
        isProfileReady, 
        profileId: profile?.id,
        profileLoading 
      });
      setSaveError('Profile not loaded. Please wait a moment and try again.');
      return; // Don't transition - let user retry
    }
    
    // Also verify user is authenticated
    if (!user?.id) {
      console.error('Cannot save checkin: user not authenticated');
      setSaveError('Not authenticated. Please sign in again.');
      return;
    }
    
    setIsTransitioning(true);
    setIsSaving(true);
    setActivityComplete(true);
    setSaveError(null);
    
    let saveSucceeded = false;
    let lastError: string | null = null;
    
    // Get the prompt to save (use stored prompt for consistency)
    const promptToSave = getActivityPrompt(type);
    
    console.log('Starting check-in save:', { 
      type, 
      profileId: profile.id, 
      prompt: promptToSave.substring(0, 50) + '...',
      responseData 
    });
    
    // Retry logic: attempt up to 3 times for transient failures
    for (let attempt = 1; attempt <= 3; attempt++) {
      // Check if component is still mounted before each attempt
      if (!isMountedRef.current) {
        console.warn('Component unmounted during save, aborting');
        return;
      }
      
      try {
        const result = await createCheckin({
          profile_id: profile.id,
          activity_type: type,
          prompt: promptToSave,
          response_data: responseData,
          completed: true,
          score_impact: getScoreImpact(type),
        });
        
        console.log('Check-in saved successfully:', { checkinId: result?.id, type });
        saveSucceeded = true;
        break; // Success - exit retry loop
      } catch (error) {
        console.error(`Failed to save checkin (attempt ${attempt}/3):`, error);
        
        // Parse error for user-friendly message
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();
          if (errorMsg.includes('not authenticated') || errorMsg.includes('jwt')) {
            lastError = 'Session expired. Please sign in again.';
          } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
            lastError = 'Network error. Please check your connection.';
          } else if (errorMsg.includes('permission') || errorMsg.includes('policy')) {
            lastError = 'Permission denied. Please try signing out and back in.';
          } else {
            lastError = error.message || 'Unable to save check-in. Please try again.';
          }
          console.error('Error details:', error.message, error.stack);
        } else {
          lastError = 'Unable to save check-in. Please try again.';
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }
    }
    
    // Check if still mounted before updating state
    if (!isMountedRef.current) {
      console.warn('Component unmounted after save, not updating state');
      return;
    }
    
    setIsSaving(false);
    
    // Set error state if all retries failed
    if (!saveSucceeded && lastError) {
      setSaveError(lastError);
      console.error('All save attempts failed:', lastError);
      // DON'T transition on error - let user see the error and potentially retry
      // Reset transitioning state so they can try again
      setIsTransitioning(false);
      setActivityComplete(false);
      return;
    }
    
    // Only transition to complete phase AFTER successful save
    // Use a small delay for visual feedback
    setTimeout(() => {
      if (isMountedRef.current) {
        setPhase('complete');
      }
    }, 300);
  };

  // Handle skip with transition lock
  const handleSkip = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
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
  // IMPORTANT: Navigate FIRST, then complete to avoid race condition
  // where onComplete triggers unmount before navigate executes
  const handleQuickAction = (route: string) => {
    // Navigate first to ensure route change happens
    navigate(route);
    // Then mark welcome as complete (will be picked up by Home.tsx)
    // Use microtask to ensure navigation has been initiated
    queueMicrotask(() => {
      onComplete();
    });
  };

  // Refresh wisdom card - uses unified daily wisdom hook
  const handleRefreshWisdom = () => {
    refreshQuote();
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

  // Track component mount state for async operations
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Select activity only once when FULLY ready (loading done AND profile exists)
  // CRITICAL FIX: Wait for isFullyReady, not just isLoading
  useEffect(() => {
    // Don't proceed if still loading or already selected
    if (!isFullyReady || activitySelected) return;
    
    // Double-check profile exists before proceeding
    if (!profile?.id) {
      console.warn('Activity selection blocked: profile not available yet');
      return;
    }
    
    // Select activity and show it
    const activity = selectActivity();
    setCurrentActivity(activity);
    setActivitySelected(true);
    
    // If quick_challenge, pre-select a challenge with its type
    let challenge = null;
    if (activity === 'quick_challenge') {
      challenge = QUICK_CHALLENGES[Math.floor(Math.random() * QUICK_CHALLENGES.length)];
      setSelectedChallenge(challenge);
    }
    
    // Generate and store the prompt NOW so it's consistent between display and save
    // This fixes the bug where a different prompt could be saved than displayed
    let prompt = '';
    switch (activity) {
      case 'reflection_prompt':
        const prompts = REFLECTION_PROMPTS[timePeriod] || REFLECTION_PROMPTS.morning;
        prompt = prompts[Math.floor(Math.random() * prompts.length)];
        break;
      case 'quick_challenge':
        prompt = challenge?.challenge || '';
        break;
      case 'micro_commitment':
        prompt = COMMITMENT_PROMPTS[Math.floor(Math.random() * COMMITMENT_PROMPTS.length)];
        break;
      case 'wisdom_card':
        prompt = dailyWisdom.quote;
        break;
      default:
        prompt = '';
    }
    setCurrentPrompt(prompt);
    
    console.log('Activity selected:', { activity, prompt: prompt.substring(0, 50) + '...', profileId: profile.id });
    
    setPhase('activity');
  }, [isFullyReady, activitySelected, profile?.id, timePeriod, dailyWisdom.quote, REFLECTION_PROMPTS, QUICK_CHALLENGES, COMMITMENT_PROMPTS]);

  // Handle completion phase - single transition point (no nested timeouts)
  useEffect(() => {
    if (phase === 'complete') {
      // Small delay for exit animation, then complete
      const timer = setTimeout(() => {
        onComplete();
      }, 200);
      
      // Cleanup on unmount to prevent memory leaks
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  // Loading state - CRITICAL: Wait for profile to be fully ready, not just loading to finish
  // This prevents the "profile not loaded" error when user submits quickly
  if (!isFullyReady || phase === 'loading') {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background gap-3"
      >
        <motion.img 
          src={wellwellIcon} 
          alt="WellWell" 
          className="w-16 h-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        {/* Show helpful message if profile is taking too long */}
        {!profileLoading && !profile?.id && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-sm text-muted-foreground text-center px-4"
          >
            Setting up your profile...
          </motion.p>
        )}
      </div>
    );
  }

  // Activity phase - show the selected mini-activity
  if (phase === 'activity' && currentActivity) {
    // Use unified daily wisdom from the hook
    const currentWisdom = { quote: dailyWisdom.quote, author: dailyWisdom.author };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-background"
        style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}
      >
        {/* Header with welcome context */}
        <div className="shrink-0 p-4 border-b border-white/5">
          {/* Top row: Logo, greeting, and close button */}
          <div className="flex items-center justify-between mb-3">
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
          
          {/* Context: What this is and why */}
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
              Quick Check-In
            </p>
            <p className="text-sm text-muted-foreground">
              Let's ease back in with a quick reflection. Takes ~30 seconds.
            </p>
          </div>
        </div>

        {/* Error feedback toast */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="shrink-0 mx-4 mt-2"
            >
              <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm px-4 py-2 rounded-xl text-center">
                {saveError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Activity content - reduced padding for mobile viewport fit */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AnimatePresence mode="wait">
            {currentActivity === 'reflection_prompt' && currentPrompt && (
              <ReflectionPrompt
                prompt={currentPrompt}
                onSubmit={(text) => handleActivityComplete('reflection_prompt', { text, wordCount: text.split(/\s+/).length })}
                onSkip={handleSkip}
                isSubmitting={isCreating || isSaving}
              />
            )}

            {currentActivity === 'quick_challenge' && selectedChallenge && (
              <QuickChallenge
                challenge={selectedChallenge.challenge}
                challengeType={selectedChallenge.type}
                onComplete={(response) => handleActivityComplete('quick_challenge', response)}
                onSkip={handleSkip}
                isSubmitting={isCreating || isSaving}
              />
            )}

            {currentActivity === 'wisdom_card' && (
              <WisdomCard
                quote={currentWisdom.quote}
                author={currentWisdom.author}
                onComplete={(response) => handleActivityComplete('wisdom_card', response)}
                onSkip={handleSkip}
                onRefresh={handleRefreshWisdom}
                onSave={saveQuote}
                isSavedInitial={isWisdomSaved}
              />
            )}

            {currentActivity === 'energy_checkin' && (
              <EnergyCheckin
                onComplete={(response) => handleActivityComplete('energy_checkin', response)}
                onSkip={handleSkip}
                isSubmitting={isCreating || isSaving}
              />
            )}

            {currentActivity === 'micro_commitment' && currentPrompt && (
              <MicroCommitment
                prompt={currentPrompt}
                onComplete={(response) => handleActivityComplete('micro_commitment', response)}
                onSkip={handleSkip}
                isSubmitting={isCreating || isSaving}
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

        {/* Quick actions at bottom - only Pulse and Debrief (Freeform removed - navigates to current page) */}
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
              onClick={() => handleQuickAction('/debrief')}
              className="flex-1 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Moon className="w-4 h-4 text-coral" />
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
