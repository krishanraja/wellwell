import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useEvents } from "@/hooks/useEvents";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { Flame, Sunrise, Sun, Moon } from "lucide-react";

interface WelcomeBackScreenProps {
  onComplete: () => void;
}

const WelcomeBackScreen = ({ onComplete }: WelcomeBackScreenProps) => {
  const { profile, isLoading: profileLoading } = useProfile();
  const { streak, isLoading: streakLoading } = useStreak();
  const { events, isLoading: eventsLoading } = useEvents();
  const { period, greeting } = useTimeOfDay();
  
  const [phase, setPhase] = useState<'loading' | 'enter' | 'message' | 'exit'>('loading');
  
  const isLoading = profileLoading || streakLoading || eventsLoading;
  const isReturningUser = events.length > 0;

  // Personalized greeting
  const displayName = profile?.display_name;
  const personalGreeting = displayName 
    ? `${greeting}, ${displayName}` 
    : greeting;

  // Context-aware message
  const getContextMessage = () => {
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

  // Get time-appropriate icon
  const TimeIcon = period === 'morning' ? Sunrise : period === 'afternoon' ? Sun : Moon;

  useEffect(() => {
    // Wait for data to load
    if (isLoading) return;
    
    // Start animation sequence
    setPhase('enter');
    
    const messageTimer = setTimeout(() => setPhase('message'), 400);
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    const completeTimer = setTimeout(onComplete, 2700);
    
    return () => {
      clearTimeout(messageTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [isLoading, onComplete]);

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
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 500ms ease-out',
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
          opacity: phase === 'message' || phase === 'exit' ? 1 : 0,
          transform: phase === 'message' || phase === 'exit' ? 'translateY(0)' : 'translateY(8px)',
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
          opacity: phase === 'message' || phase === 'exit' ? 1 : 0,
          transform: phase === 'message' || phase === 'exit' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms',
        }}
      >
        {getContextMessage()}
      </p>

      {/* Streak badge */}
      {streak >= 2 && (
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 24,
            padding: '8px 16px',
            background: 'hsl(8 100% 65% / 0.15)',
            borderRadius: 20,
            opacity: phase === 'message' || phase === 'exit' ? 1 : 0,
            transform: phase === 'message' || phase === 'exit' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 400ms ease-out 200ms, transform 400ms ease-out 200ms',
          }}
        >
          <Flame style={{ width: 16, height: 16, color: 'hsl(8 100% 65%)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(8 100% 75%)' }}>
            {streak} day streak
          </span>
        </div>
      )}
    </div>
  );
};

export default WelcomeBackScreen;
