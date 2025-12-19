import { useMemo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Sunrise, Moon } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface RitualTimeIndicatorProps {
  hasCompletedPulseToday: boolean;
  hasCompletedDebriefToday: boolean;
  onSetTimeClick?: () => void;
}

// Parse time string (HH:MM:SS or HH:MM) to minutes from midnight
function parseTimeToMinutes(timeString: string | null): number | null {
  if (!timeString) return null;
  const parts = timeString.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

// Format time for display (e.g., "7:30 AM")
function formatTimeForDisplay(timeString: string | null): string {
  if (!timeString) return "";
  const parts = timeString.split(':');
  if (parts.length < 2) return "";
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return "";
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Check if current time is within range of target time (within 30 min before or after)
// Handles circular time wrapping around midnight (e.g., 23:45 to 00:15 is 30 minutes, not 23.5 hours)
function isTimeActive(targetMinutes: number | null): boolean {
  if (targetMinutes === null) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Calculate the absolute difference
  const diff = Math.abs(currentMinutes - targetMinutes);
  
  // If difference is more than 12 hours (720 minutes), we need to wrap around midnight
  // The actual difference is the shorter path: either diff or (1440 - diff)
  const minutesInDay = 24 * 60; // 1440 minutes
  const wrappedDiff = diff > minutesInDay / 2 ? minutesInDay - diff : diff;
  
  return wrappedDiff <= 30; // Within 30 minutes
}

export function RitualTimeIndicator({ 
  hasCompletedPulseToday, 
  hasCompletedDebriefToday,
  onSetTimeClick 
}: RitualTimeIndicatorProps) {
  const { profile } = useProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute to check for active rituals
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const pulseTimeMinutes = useMemo(
    () => parseTimeToMinutes(profile?.morning_pulse_time || null),
    [profile?.morning_pulse_time]
  );
  
  const debriefTimeMinutes = useMemo(
    () => parseTimeToMinutes(profile?.evening_debrief_time || null),
    [profile?.evening_debrief_time]
  );
  
  const pulseTimeDisplay = formatTimeForDisplay(profile?.morning_pulse_time || null);
  const debriefTimeDisplay = formatTimeForDisplay(profile?.evening_debrief_time || null);
  
  const isPulseActive = !hasCompletedPulseToday && isTimeActive(pulseTimeMinutes);
  const isDebriefActive = !hasCompletedDebriefToday && isTimeActive(debriefTimeMinutes);
  
  const hasAnyTimes = pulseTimeMinutes !== null || debriefTimeMinutes !== null;
  
  // Compact inline chip style
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {/* Morning Pulse Chip */}
      <button
        onClick={onSetTimeClick}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          hasCompletedPulseToday 
            ? "bg-primary/10 text-primary" 
            : isPulseActive
              ? "bg-amber-500/10 text-amber-600 animate-pulse"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
        )}
      >
        {hasCompletedPulseToday ? (
          <Check className="w-3 h-3" />
        ) : (
          <Sunrise className="w-3 h-3" />
        )}
        <span>
          {hasCompletedPulseToday 
            ? "Pulse ✓" 
            : pulseTimeDisplay 
              ? `Pulse ${pulseTimeDisplay}` 
              : "Pulse"
          }
        </span>
      </button>

      <span className="text-muted-foreground/30">•</span>
      
      {/* Evening Debrief Chip */}
      <button
        onClick={onSetTimeClick}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          hasCompletedDebriefToday 
            ? "bg-primary/10 text-primary" 
            : isDebriefActive
              ? "bg-purple-500/10 text-purple-600 animate-pulse"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
        )}
      >
        {hasCompletedDebriefToday ? (
          <Check className="w-3 h-3" />
        ) : (
          <Moon className="w-3 h-3" />
        )}
        <span>
          {hasCompletedDebriefToday 
            ? "Debrief ✓" 
            : debriefTimeDisplay 
              ? `Debrief ${debriefTimeDisplay}` 
              : "Debrief"
          }
        </span>
      </button>
    </div>
  );
}

