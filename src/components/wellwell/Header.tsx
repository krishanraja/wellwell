import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import wellwellIcon from "@/assets/wellwell-icon.png";
import wellwellLogo from "@/assets/wellwell-logo.png";
import { Flame, Sunrise, Sun, Moon } from "lucide-react";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";

interface HeaderProps {
  showLogo?: boolean;
  showGreeting?: boolean;
  className?: string;
}

export function Header({ showLogo = true, showGreeting = false, className }: HeaderProps) {
  const navigate = useNavigate();
  const timeTheme = useTimeOfDay();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { streak } = useStreak();
  
  const TimeIcon = timeTheme.icon === "sunrise" ? Sunrise : timeTheme.icon === "sun" ? Sun : Moon;
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Stoic";

  const handleLogoClick = () => {
    navigate("/");
  };
  
  return (
    <header className={cn(
      "flex items-center justify-center py-3 px-1 shrink-0",
      className
    )}>
      {showGreeting ? (
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-xl"
            style={{ backgroundColor: `${timeTheme.accent}20` }}
          >
            <TimeIcon 
              className="w-4 h-4" 
              style={{ color: timeTheme.accent }}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{timeTheme.greeting}</p>
            <p className="text-sm font-display font-semibold text-foreground">{displayName}</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-coral/10">
              <Flame className="w-3.5 h-3.5 text-coral" />
              <span className="text-xs font-semibold text-coral">{streak}</span>
            </div>
          )}
        </div>
      ) : showLogo ? (
        <button
          onClick={handleLogoClick}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg transition-transform active:scale-95"
          aria-label="Go to Home"
        >
          <img 
            src={wellwellIcon} 
            alt="WellWell" 
            className="h-8 w-auto"
          />
        </button>
      ) : null}
    </header>
  );
}

export const LogoFull = forwardRef<HTMLImageElement, { className?: string }>(
  ({ className }, ref) => (
    <img 
      ref={ref}
      src={wellwellLogo} 
      alt="WellWell" 
      className={cn("h-8 w-auto", className)}
    />
  )
);

LogoFull.displayName = "LogoFull";
