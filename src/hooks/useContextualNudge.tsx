import { useMemo } from 'react';
import { useEvents } from './useEvents';
import { useStreak } from './useStreak';
import { useProfile } from './useProfile';
import { Sunrise, Flame, Moon, Scale, Swords, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NudgeType = 'pulse' | 'intervene' | 'debrief' | 'decision' | 'conflict' | 'freeform';
export type NudgePriority = 'primary' | 'secondary' | 'tertiary';

export interface ContextualNudge {
  type: NudgeType;
  priority: NudgePriority;
  headline: string;
  subtext: string;
  placeholder: string;
  processingText: string;
  icon: LucideIcon;
  accentColor: string;
  route: string;
}

export interface ContextualState {
  primaryNudge: ContextualNudge;
  secondaryNudges: ContextualNudge[];
  greeting: string;
  contextMessage: string;
  isReturningUser: boolean;
  daysSinceLastUse: number;
  hasCompletedPulseToday: boolean;
  hasCompletedDebriefToday: boolean;
  streakMessage: string | null;
  timeContext: 'morning' | 'midday' | 'evening' | 'night';
}

// Nudge configurations
const NUDGE_CONFIG: Record<NudgeType, Omit<ContextualNudge, 'priority'>> = {
  pulse: {
    type: 'pulse',
    headline: "Prepare your mind",
    subtext: "What might challenge you today?",
    placeholder: "Tap to speak your challenge",
    processingText: "Building your stance...",
    icon: Sunrise,
    accentColor: "hsl(45 100% 60%)",
    route: '/pulse',
  },
  intervene: {
    type: 'intervene',
    headline: "Recalibrate now",
    subtext: "What triggered you?",
    placeholder: "Tap to release what happened",
    processingText: "Recalibrating...",
    icon: Flame,
    accentColor: "hsl(8 100% 65%)",
    route: '/intervene',
  },
  debrief: {
    type: 'debrief',
    headline: "Reflect on your day",
    subtext: "How did you navigate today?",
    placeholder: "Tap to reflect on your day",
    processingText: "Synthesizing wisdom...",
    icon: Moon,
    accentColor: "hsl(260 80% 65%)",
    route: '/debrief',
  },
  decision: {
    type: 'decision',
    headline: "Clarify a choice",
    subtext: "Facing a tough decision?",
    placeholder: "Describe your dilemma",
    processingText: "Analyzing options...",
    icon: Scale,
    accentColor: "hsl(187 100% 50%)",
    route: '/decision',
  },
  conflict: {
    type: 'conflict',
    headline: "Navigate tension",
    subtext: "Dealing with someone difficult?",
    placeholder: "Describe the situation",
    processingText: "Finding perspective...",
    icon: Swords,
    accentColor: "hsl(30 100% 55%)",
    route: '/conflict',
  },
  freeform: {
    type: 'freeform',
    headline: "What's on your mind?",
    subtext: "Speak freely — I'll find the wisdom you need",
    placeholder: "Tap to speak",
    processingText: "Finding your Stoic truth...",
    icon: Sparkles,
    accentColor: "hsl(166 100% 50%)",
    route: '/',
  },
};

function getTimeContext(hour: number): 'morning' | 'midday' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'midday';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getGreeting(hour: number, displayName: string | null): string {
  const name = displayName ? `, ${displayName}` : '';
  
  if (hour >= 5 && hour < 12) return `Good morning${name}`;
  if (hour >= 12 && hour < 17) return `Good afternoon${name}`;
  if (hour >= 17 && hour < 21) return `Good evening${name}`;
  return `Welcome back${name}`;
}

export function useContextualNudge(): ContextualState {
  const { events } = useEvents();
  const { streak } = useStreak();
  const { profile } = useProfile();

  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const timeContext = getTimeContext(hour);
    
    // Calculate user context
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEvents = events.filter(e => new Date(e.created_at) >= todayStart);
    const hasCompletedPulseToday = todayEvents.some(e => e.tool_name === 'pulse');
    const hasCompletedDebriefToday = todayEvents.some(e => e.tool_name === 'debrief');
    const hasUsedInterveneToday = todayEvents.some(e => e.tool_name === 'intervene');
    
    // Calculate days since last use
    let daysSinceLastUse = 0;
    if (events.length > 0) {
      const lastEvent = new Date(events[0].created_at);
      const diffTime = Math.abs(now.getTime() - lastEvent.getTime());
      daysSinceLastUse = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    const isReturningUser = events.length > 0;
    const isNewUser = events.length === 0;
    
    // Determine greeting and context message
    const greeting = getGreeting(hour, profile?.display_name || null);
    
    let contextMessage = "I'm here when you need me.";
    
    // Smart context messages based on state
    if (isNewUser) {
      contextMessage = "Let's build your first stance.";
    } else if (daysSinceLastUse > 3) {
      contextMessage = "Welcome back. Pick up where you left off.";
    } else if (streak >= 7) {
      contextMessage = `${streak} days of practice. Keep going.`;
    } else if (hasCompletedPulseToday && !hasCompletedDebriefToday && timeContext === 'evening') {
      contextMessage = "You set your intention this morning. How did it go?";
    } else if (hasCompletedPulseToday && hasCompletedDebriefToday) {
      contextMessage = "You've done well today. I'm here if you need me.";
    }
    
    // Streak message
    let streakMessage: string | null = null;
    if (streak >= 3) {
      if (streak === 7) streakMessage = "One week strong. You're building a habit.";
      else if (streak === 14) streakMessage = "Two weeks. This is becoming who you are.";
      else if (streak === 30) streakMessage = "One month. You're a Stoic now.";
      else if (streak >= 3) streakMessage = `${streak} day streak`;
    }
    
    // =========================================
    // DETERMINE PRIMARY NUDGE (The Magic)
    // =========================================
    let primaryType: NudgeType = 'freeform';
    
    if (isNewUser) {
      // New users get the freeform to start
      primaryType = 'freeform';
    } else if (timeContext === 'morning' && !hasCompletedPulseToday) {
      // Morning without Pulse → Pulse
      primaryType = 'pulse';
    } else if (timeContext === 'evening' && !hasCompletedDebriefToday) {
      // Evening without Debrief → Debrief
      primaryType = 'debrief';
    } else if (timeContext === 'night' && !hasCompletedDebriefToday) {
      // Night without Debrief → Debrief
      primaryType = 'debrief';
    } else {
      // Midday or already completed daily rituals → Freeform
      primaryType = 'freeform';
    }
    
    const primaryNudge: ContextualNudge = {
      ...NUDGE_CONFIG[primaryType],
      priority: 'primary',
    };
    
    // =========================================
    // DETERMINE SECONDARY NUDGES
    // Always show Intervene, Decision, Conflict as the three specific situations
    // =========================================
    const secondaryNudges: ContextualNudge[] = [];
    
    // Always include the three specific situations (unless one is primary)
    if (primaryType !== 'intervene') {
      secondaryNudges.push({
        ...NUDGE_CONFIG.intervene,
        priority: 'secondary',
      });
    }
    
    if (primaryType !== 'decision') {
      secondaryNudges.push({
        ...NUDGE_CONFIG.decision,
        priority: 'secondary',
      });
    }
    
    if (primaryType !== 'conflict') {
      secondaryNudges.push({
        ...NUDGE_CONFIG.conflict,
        priority: 'secondary',
      });
    }
    
    return {
      primaryNudge,
      secondaryNudges: secondaryNudges.slice(0, 3), // Always exactly 3: Intervene, Decision, Conflict
      greeting,
      contextMessage,
      isReturningUser,
      daysSinceLastUse,
      hasCompletedPulseToday,
      hasCompletedDebriefToday,
      streakMessage,
      timeContext,
    };
  }, [events, streak, profile]);
}
