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
function isTimeActive(targetMinutes: number | null): boolean {
  if (targetMinutes === null) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = Math.abs(currentMinutes - targetMinutes);
  return diff <= 30; // Within 30 minutes
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
  
  return (
    <div className="flex gap-2 mb-4">
      {/* Morning Pulse Indicator */}
      <button
        onClick={onSetTimeClick}
        className={cn(
          "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all",
          hasCompletedPulseToday 
            ? "bg-primary/5 border-primary/30" 
            : isPulseActive
              ? "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/50 animate-pulse"
              : "bg-muted/30 border-border/50 hover:border-border"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
          hasCompletedPulseToday
            ? "bg-primary/20"
            : isPulseActive
              ? "bg-amber-500/20"
              : "bg-muted/50"
        )}>
          {hasCompletedPulseToday ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Sunrise className={cn(
              "w-3.5 h-3.5",
              isPulseActive ? "text-amber-500" : "text-muted-foreground"
            )} />
          )}
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className={cn(
            "text-xs font-semibold truncate",
            hasCompletedPulseToday 
              ? "text-primary" 
              : isPulseActive
                ? "text-amber-500"
                : "text-foreground"
          )}>
            Morning Pulse
          </span>
          {pulseTimeDisplay ? (
            <span className={cn(
              "text-[10px]",
              isPulseActive ? "text-amber-500/70" : "text-muted-foreground"
            )}>
              {hasCompletedPulseToday ? "Complete" : `at ${pulseTimeDisplay}`}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">Set time</span>
          )}
        </div>
      </button>
      
      {/* Evening Debrief Indicator */}
      <button
        onClick={onSetTimeClick}
        className={cn(
          "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all",
          hasCompletedDebriefToday 
            ? "bg-primary/5 border-primary/30" 
            : isDebriefActive
              ? "bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-purple-500/50 animate-pulse"
              : "bg-muted/30 border-border/50 hover:border-border"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
          hasCompletedDebriefToday
            ? "bg-primary/20"
            : isDebriefActive
              ? "bg-purple-500/20"
              : "bg-muted/50"
        )}>
          {hasCompletedDebriefToday ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Moon className={cn(
              "w-3.5 h-3.5",
              isDebriefActive ? "text-purple-500" : "text-muted-foreground"
            )} />
          )}
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className={cn(
            "text-xs font-semibold truncate",
            hasCompletedDebriefToday 
              ? "text-primary" 
              : isDebriefActive
                ? "text-purple-500"
                : "text-foreground"
          )}>
            Evening Debrief
          </span>
          {debriefTimeDisplay ? (
            <span className={cn(
              "text-[10px]",
              isDebriefActive ? "text-purple-500/70" : "text-muted-foreground"
            )}>
              {hasCompletedDebriefToday ? "Complete" : `at ${debriefTimeDisplay}`}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">Set time</span>
          )}
        </div>
      </button>
    </div>
  );
}

