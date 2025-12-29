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
  
  const [phase, setPhase] = useState<'loading' | 'enter' | 'message' | 'onboarding' | 'ready'>('loading');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const isLoading = profileLoading || streakLoading || eventsLoading;
  const isReturningUser = events.length > 0;
  const needsReOnboarding = daysSinceLastUse >= 21; // 3+ weeks
  const isWeeklyReturn = daysSinceLastUse >= 7 && daysSinceLastUse < 21;

  // Personalized greeting
  const displayName = profile?.display_name;
  const personalGreeting = displayName 
    ? `${greeting}, ${displayName}` 
    : greeting;

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
    const todayEvents = events.filter(e => new Date(e.created_at) >= todayStart);
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
    
    // Start animation sequence
    setPhase('enter');
    
    const messageTimer = setTimeout(() => {
      setPhase('message');
      // For 3+ week users, show onboarding after message
      if (needsReOnboarding) {
        setTimeout(() => {
          setPhase('onboarding');
          setShowOnboarding(true);
        }, 1500);
      } else {
        // For others, show ready state (tap to continue)
        setTimeout(() => setPhase('ready'), 1500);
      }
    }, 400);
    
    return () => {
      clearTimeout(messageTimer);
    };
  }, [isLoading, needsReOnboarding]);

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

  return (
    <div 
      onClick={phase === 'ready' && !needsReOnboarding ? handleContinue : undefined}
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
        opacity: 1,
        transition: 'opacity 500ms ease-out',
        cursor: phase === 'ready' && !needsReOnboarding ? 'pointer' : 'default',
      }}
    >
      {/* Subtle glow */}
      <div 
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, hsl(166 100% 50% / 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      
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
          opacity: phase !== 'loading' ? 1 : 0,
          transform: phase !== 'loading' ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
        }}
      >
        {/* Glow ring */}
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
          opacity: phase !== 'loading' ? 1 : 0,
          transform: phase !== 'loading' ? 'translateY(0)' : 'translateY(8px)',
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
          opacity: phase !== 'loading' ? 1 : 0,
          transform: phase !== 'loading' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms',
        }}
      >
        {getContextMessage()}
      </p>

      {/* Streak badge */}
      {streak >= 2 && phase !== 'onboarding' && (
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 24,
            padding: '8px 16px',
            background: 'hsl(8 100% 65% / 0.15)',
            borderRadius: 20,
            opacity: phase !== 'loading' && phase !== 'onboarding' ? 1 : 0,
            transform: phase !== 'loading' && phase !== 'onboarding' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 400ms ease-out 200ms, transform 400ms ease-out 200ms',
          }}
        >
          <Flame style={{ width: 16, height: 16, color: 'hsl(8 100% 65%)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(8 100% 75%)' }}>
            {streak} day streak
          </span>
        </div>
      )}

      {/* Mini Onboarding for 3+ week users */}
      {showOnboarding && phase === 'onboarding' && (
        <div
          style={{
            marginTop: 32,
            width: '100%',
            maxWidth: 320,
            opacity: showOnboarding ? 1 : 0,
            transform: showOnboarding ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
          }}
        >
          <p 
            style={{
              fontSize: '14px',
              color: 'hsl(215 20% 75%)',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Here's what you can do:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button
              variant="outline"
              onClick={() => handleQuickAction('/pulse')}
              className="w-full justify-start gap-3 h-auto py-3"
              style={{
                backgroundColor: 'hsl(220 25% 12%)',
                borderColor: 'hsl(215 20% 25%)',
                color: 'hsl(210 40% 95%)',
              }}
            >
              <Sunrise className="w-5 h-5" style={{ color: 'hsl(45 100% 60%)' }} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Morning Pulse</div>
                <div style={{ fontSize: '12px', color: 'hsl(215 20% 65%)' }}>Set your stance for today</div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuickAction('/')}
              className="w-full justify-start gap-3 h-auto py-3"
              style={{
                backgroundColor: 'hsl(220 25% 12%)',
                borderColor: 'hsl(215 20% 25%)',
                color: 'hsl(210 40% 95%)',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(166 100% 50%)' }} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Freeform Input</div>
                <div style={{ fontSize: '12px', color: 'hsl(215 20% 65%)' }}>Ask anything, get clarity</div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuickAction('/debrief')}
              className="w-full justify-start gap-3 h-auto py-3"
              style={{
                backgroundColor: 'hsl(220 25% 12%)',
                borderColor: 'hsl(215 20% 25%)',
                color: 'hsl(210 40% 95%)',
              }}
            >
              <Moon className="w-5 h-5" style={{ color: 'hsl(260 80% 65%)' }} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Evening Debrief</div>
                <div style={{ fontSize: '12px', color: 'hsl(215 20% 65%)' }}>Reflect on your day</div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tap to continue hint for non-onboarding users */}
      {phase === 'ready' && !needsReOnboarding && (
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

      {/* Continue button for onboarding users */}
      {phase === 'onboarding' && (
        <Button
          variant="outline"
          onClick={handleContinue}
          className="mt-6"
          style={{
            backgroundColor: 'hsl(220 25% 12%)',
            borderColor: 'hsl(215 20% 25%)',
            color: 'hsl(210 40% 95%)',
          }}
        >
          Continue to Home
        </Button>
      )}
    </div>
  );
};

export default WelcomeBackScreen;
