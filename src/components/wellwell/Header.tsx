import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import wellwellLogo from "@/assets/wellwell-logo.png";
import wellwellIcon from "@/assets/wellwell-icon.png";
import { User, Flame, Sunrise, Sun, Moon, LogOut, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
      
      <Drawer>
        <DrawerTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl"
          >
            <User className="w-5 h-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="rounded-t-3xl border-0 bg-transparent pb-safe">
          {/* Glass container with gradient border */}
          <div className="relative mx-3 mb-4 overflow-hidden rounded-3xl">
            {/* Gradient border effect */}
            <div 
              className="absolute inset-0 rounded-3xl p-[1.5px]"
              style={{ background: 'linear-gradient(135deg, hsl(90 100% 79%) 0%, hsl(187 100% 60%) 100%)' }}
            >
              <div className="h-full w-full rounded-3xl bg-background" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 glass-card rounded-3xl">
              {/* Profile Header */}
              <div className="px-5 pt-6 pb-5">
                <div className="flex items-center gap-4">
                  {/* Avatar with gradient ring */}
                  <div className="relative">
                    <div 
                      className="absolute -inset-1 rounded-full opacity-60"
                      style={{ background: 'linear-gradient(135deg, hsl(90 100% 79%) 0%, hsl(187 100% 60%) 100%)' }}
                    />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                      <User className="h-7 w-7 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-lg truncate">
                      {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  {/* Streak badge */}
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral/10">
                      <Flame className="w-4 h-4 text-coral" />
                      <span className="text-sm font-semibold text-coral">{streak}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Divider */}
              <div className="mx-5 h-px bg-border" />
              
              {/* Menu Items */}
              <div className="p-2">
                <DrawerClose asChild>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 hover:bg-secondary/80 active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua/10">
                      <User className="h-5 w-5 text-aqua" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">Profile</span>
                      <p className="text-xs text-muted-foreground">View and edit your profile</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                  </button>
                </DrawerClose>
                
                <DrawerClose asChild>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 hover:bg-secondary/80 active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10">
                      <Settings className="h-5 w-5 text-purple" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">Settings</span>
                      <p className="text-xs text-muted-foreground">Preferences & notifications</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                  </button>
                </DrawerClose>
              </div>
              
              {/* Divider */}
              <div className="mx-5 h-px bg-border" />
              
              {/* Sign Out */}
              <div className="p-2 pb-4">
                <DrawerClose asChild>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 hover:bg-destructive/10 active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                      <LogOut className="h-5 w-5 text-destructive" />
                    </div>
                    <span className="font-medium text-destructive">Sign out</span>
                  </button>
                </DrawerClose>
              </div>
            </div>
          </div>
          
          {/* Cancel button */}
          <div className="mx-3 mb-4">
            <DrawerClose asChild>
              <button className="w-full py-4 rounded-2xl bg-secondary/80 font-medium text-foreground transition-all duration-200 hover:bg-secondary active:scale-[0.98]">
                Cancel
              </button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
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
