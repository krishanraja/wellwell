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

// Reusable menu item component for consistent styling
interface MenuItemProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

function MenuItem({ icon: Icon, iconColor, iconBg, label, description, onClick, variant = 'default' }: MenuItemProps) {
  const isDestructive = variant === 'destructive';
  
  return (
    <DrawerClose asChild>
      <button 
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left",
          "transition-all duration-200 active:scale-[0.98]",
          isDestructive 
            ? "hover:bg-destructive/10" 
            : "hover:bg-secondary/80"
        )}
      >
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn(
            "font-medium block",
            isDestructive ? "text-destructive" : "text-foreground"
          )}>
            {label}
          </span>
          {description && (
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>
        {!isDestructive && (
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
        )}
      </button>
    </DrawerClose>
  );
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
      "flex items-center justify-between py-3 px-1 shrink-0",
      className
    )}>
      {/* Left side - empty spacer for layout balance */}
      <div className="w-10" />
      
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
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl h-10 w-10"
          >
            <User className="w-5 h-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="rounded-t-3xl border-0 bg-transparent">
          {/* Drag handle indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          
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
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-4">
                  {/* Avatar with gradient ring */}
                  <div className="relative shrink-0">
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
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral/10 shrink-0">
                      <Flame className="w-4 h-4 text-coral" />
                      <span className="text-sm font-semibold text-coral">{streak}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Divider */}
              <div className="mx-5 h-px bg-border/50" />
              
              {/* Menu Items */}
              <div className="p-2">
                <MenuItem
                  icon={User}
                  iconColor="hsl(187 100% 60%)"
                  iconBg="hsl(187 100% 60% / 0.1)"
                  label="Profile"
                  description="View and edit your profile"
                  onClick={() => navigate('/profile')}
                />
                
                <MenuItem
                  icon={Settings}
                  iconColor="hsl(260 80% 65%)"
                  iconBg="hsl(260 80% 65% / 0.1)"
                  label="Settings"
                  description="Preferences & notifications"
                  onClick={() => navigate('/settings')}
                />
              </div>
              
              {/* Divider */}
              <div className="mx-5 h-px bg-border/50" />
              
              {/* Sign Out */}
              <div className="p-2 pb-3">
                <MenuItem
                  icon={LogOut}
                  iconColor="hsl(0 72% 51%)"
                  iconBg="hsl(0 72% 51% / 0.1)"
                  label="Sign out"
                  onClick={handleSignOut}
                  variant="destructive"
                />
              </div>
            </div>
          </div>
          
          {/* Cancel button */}
          <div className="mx-3 mb-4 pb-safe">
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
