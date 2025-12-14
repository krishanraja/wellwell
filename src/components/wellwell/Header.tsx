import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import wellwellLogo from "@/assets/wellwell-logo.png";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { User, Flame, Sunrise, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showLogo?: boolean;
  showGreeting?: boolean;
  className?: string;
}

export function Header({ showLogo = true, showGreeting = false, className }: HeaderProps) {
  const navigate = useNavigate();
  const timeTheme = useTimeOfDay();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { streak } = useStreak();
  
  const TimeIcon = timeTheme.icon === "sunrise" ? Sunrise : timeTheme.icon === "sun" ? Sun : Moon;
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Stoic";

  const handleSignOut = async () => {
    await signOut();
    navigate("/landing");
  };
  
  return (
    <header className={cn(
      "flex items-center justify-between py-3 px-1",
      className
    )}>
      {/* Left side - empty spacer for layout balance */}
      <div className="w-10" />
      
      {showGreeting ? (
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-lg"
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
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          className="h-8 w-auto"
        />
      ) : null}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl"
          >
            <User className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export const LogoFull = forwardRef<HTMLImageElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <img 
        ref={ref}
        src={wellwellLogo} 
        alt="WellWell" 
        className={cn("h-10 w-auto", className)}
      />
    );
  }
);

LogoFull.displayName = "LogoFull";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img 
      src={wellwellIcon} 
      alt="WellWell" 
      className={cn("h-10 w-auto", className)}
    />
  );
}
