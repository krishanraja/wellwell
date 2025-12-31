import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { Flame, Sunrise, Sun, Moon, ArrowRight, Sparkles, Target, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
  
  const isLoading = profileLoading || streakLoading || eventsLoading;
  const isReturningUser = events.length > 0;
  const needsReOnboarding = daysSinceLastUse >= 21; // 3+ weeks
  const isWeeklyReturn = daysSinceLastUse >= 7 && daysSinceLastUse < 21;

  // Personalized greeting
  const displayName = profile?.display_name;
  const personalGreeting = displayName 
    ? `${greeting}, ${displayName}` 
    : greeting;

  // Determine primary action based on time of day
  const getPrimaryAction = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { route: '/pulse', label: 'Morning Pulse', description: 'Set your stance for today', icon: Sunrise, color: 'hsl(45 100% 60%)' };
    } else if (hour >= 17 && hour < 22) {
      return { route: '/debrief', label: 'Evening Debrief', description: 'Reflect on your day', icon: Moon, color: 'hsl(260 80% 65%)' };
    } else {
      return { route: '/', label: 'Freeform Input', description: 'Ask anything, get clarity', icon: Sparkles, color: 'hsl(166 100% 50%)' };
    }
  };

  const primaryAction = getPrimaryAction();

  // Context-aware message
  const getContextMessage = () => {
    // Special messages for long-returning users
    if (needsReOnboarding) {
      if (daysSinceLastUse >= 30) {
        return "It's been a while. Let's reconnect with clarity.";
      }
      return "Welcome back. Here's what you can do.";
    }
    
    if (isWeeklyReturn) {
      return "Good to see you again. Pick up where you left off.";
    }
    
    const hour = new Date().getHours();
    
    // Check today's activity
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEvents = (events || []).filter(e => new Date(e.created_at) >= todayStart);
    const hasPulseToday = todayEvents.some(e => e.tool_name === 'pulse');
    const hasDebriefToday = todayEvents.some(e => e.tool_name === 'debrief');
    
    // Streak-based messages
    if (streak >= 30) {
      return "A month of practice. You're a Stoic now.";
    }
    if (streak >= 14) {
      return "Two weeks strong. This is who you are.";
    }
    if (streak >= 7) {
      return "One week of growth. Keep building.";
    }
    
    // Time-based messages
    if (hour >= 5 && hour < 12) {
      if (hasPulseToday) {
        return "You've set your stance. Stay composed.";
      }
      return "Let's prepare your mind for today.";
    }
    if (hour >= 12 && hour < 17) {
      if (hasPulseToday) {
        return "Your stance is set. I'm here if you need me.";
      }
      return "How can I help you stay composed?";
    }
    if (hour >= 17 && hour < 21) {
      if (hasDebriefToday) {
        return "Day complete. Rest well.";
      }
      if (hasPulseToday) {
        return "Time to reflect on your day.";
      }
      return "How did today challenge you?";
    }
    
    // Night
    return "Take a moment before rest.";
  };
  
  const handleContinue = () => {
    onComplete();
  };
  
  const handleQuickAction = (route: string) => {
    onComplete();
    navigate(route);
  };

  // Get time-appropriate icon
  const TimeIcon = period === 'morning' ? Sunrise : period === 'afternoon' ? Sun : Moon;

  useEffect(() => {
    // Wait for data to load
    if (isLoading) return;
    
    // For interactive-first approach, show immediately (no delays)
    setPhase('ready');
  }, [isLoading]);

  // Show minimal loader while fetching
  if (isLoading) {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'hsl(220 25% 8%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          style={{ width: 64, height: 64, opacity: 0.5 }}
        />
      </div>
    );
  }

  // For 3+ week users: Interactive-first layout (buttons first)
  if (needsReOnboarding && phase === 'ready') {
    const PrimaryIcon = primaryAction.icon;
    const secondaryActions = [
      { route: '/pulse', label: 'Morning Pulse', description: 'Set your stance', icon: Sunrise, color: 'hsl(45 100% 60%)' },
      { route: '/', label: 'Freeform Input', description: 'Ask anything', icon: Sparkles, color: 'hsl(166 100% 50%)' },
      { route: '/debrief', label: 'Evening Debrief', description: 'Reflect on your day', icon: Moon, color: 'hsl(260 80% 65%)' },
    ].filter(action => action.route !== primaryAction.route);

    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(220 25% 6%) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        {/* Minimal greeting at top */}
        <div style={{ position: 'absolute', top: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'hsl(210 40% 98%)', marginBottom: 4 }}>
            {personalGreeting}
          </h1>
          {daysSinceLastUse > 0 && (
            <p style={{ fontSize: '12px', color: 'hsl(215 20% 55%)' }}>
              Last used {daysSinceLastUse} {daysSinceLastUse === 1 ? 'day' : 'days'} ago
            </p>
          )}
        </div>

        {/* Primary Action Button - Large and Prominent */}
        <div style={{ width: '100%', maxWidth: 360, marginTop: 80 }}>
          <Button
            onClick={() => handleQuickAction(primaryAction.route)}
            className="w-full h-auto py-6 gap-4"
            style={{
              backgroundColor: primaryAction.color,
              color: 'hsl(220 25% 8%)',
              border: 'none',
              fontSize: '18px',
              fontWeight: 600,
              boxShadow: `0 8px 24px ${primaryAction.color}40`,
            }}
          >
            <PrimaryIcon className="w-6 h-6" />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div>{primaryAction.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 400, opacity: 0.8 }}>
                {primaryAction.description}
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Secondary Actions - Smaller */}
        <div style={{ width: '100%', maxWidth: 360, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {secondaryActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={action.route}
                variant="outline"
                onClick={() => handleQuickAction(action.route)}
                className="w-full justify-start gap-3 h-auto py-3"
                style={{
                  backgroundColor: 'hsl(220 25% 12%)',
                  borderColor: 'hsl(215 20% 25%)',
                  color: 'hsl(210 40% 95%)',
                }}
              >
                <ActionIcon className="w-4 h-4" style={{ color: action.color }} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{action.label}</div>
                  <div style={{ fontSize: '12px', color: 'hsl(215 20% 65%)' }}>{action.description}</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            );
          })}
        </div>

        {/* Skip option at bottom */}
        <Button
          variant="ghost"
          onClick={handleContinue}
          className="mt-8"
          style={{
            color: 'hsl(215 20% 55%)',
            fontSize: '14px',
          }}
        >
          Continue to Home
        </Button>
      </div>
    );
  }

  // For weekly returns: Simplified tap-to-continue
  if (isWeeklyReturn && phase === 'ready') {
    return (
      <div 
        onClick={handleContinue}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(220 25% 6%) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          cursor: 'pointer',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'hsl(210 40% 98%)', marginBottom: 8, textAlign: 'center' }}>
          {personalGreeting}
        </h1>
        <p style={{ fontSize: '16px', color: 'hsl(215 20% 65%)', textAlign: 'center', maxWidth: 280, marginBottom: 32 }}>
          {getContextMessage()}
        </p>
        <p style={{ fontSize: '14px', color: 'hsl(215 20% 55%)', textAlign: 'center', animation: 'pulse 2s ease-in-out infinite' }}>
          Tap anywhere to continue
        </p>
      </div>
    );
  }

  // For daily users: Original simplified flow
  return (
    <div 
      onClick={phase === 'ready' ? handleContinue : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(220 25% 6%) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        cursor: phase === 'ready' ? 'pointer' : 'default',
      }}
    >
      {/* Icon with ring */}
      <div 
        style={{
          position: 'relative',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          opacity: phase === 'ready' ? 1 : 0,
          transform: phase === 'ready' ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(166 100% 50% / 0.3), hsl(187 100% 50% / 0.3))',
            filter: 'blur(12px)',
          }}
        />
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          style={{
            width: 72,
            height: 72,
            position: 'relative',
            zIndex: 10,
          }}
        />
      </div>

      {/* Greeting */}
      <h1 
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'hsl(210 40% 98%)',
          textAlign: 'center',
          marginBottom: 8,
          opacity: phase === 'ready' ? 1 : 0,
          transform: phase === 'ready' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
        }}
      >
        {personalGreeting}
      </h1>

      {/* Context message */}
      <p 
        style={{
          fontSize: '16px',
          color: 'hsl(215 20% 65%)',
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.5,
          opacity: phase === 'ready' ? 1 : 0,
          transform: phase === 'ready' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms',
        }}
      >
        {getContextMessage()}
      </p>

      {/* Streak badge */}
      {streak >= 2 && phase === 'ready' && (
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 24,
            padding: '8px 16px',
            background: 'hsl(8 100% 65% / 0.15)',
            borderRadius: 20,
            opacity: phase === 'ready' ? 1 : 0,
            transform: phase === 'ready' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 400ms ease-out 200ms, transform 400ms ease-out 200ms',
          }}
        >
          <Flame style={{ width: 16, height: 16, color: 'hsl(8 100% 65%)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(8 100% 75%)' }}>
            {streak} day streak
          </span>
        </div>
      )}

      {/* Tap to continue hint */}
      {phase === 'ready' && (
        <p
          style={{
            fontSize: '14px',
            color: 'hsl(215 20% 55%)',
            textAlign: 'center',
            marginTop: 24,
            opacity: 1,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          Tap anywhere to continue
        </p>
      )}
    </div>
  );
};

export default WelcomeBackScreen;
