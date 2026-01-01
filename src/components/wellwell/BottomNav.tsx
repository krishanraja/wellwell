import { cn } from "@/lib/utils";
import { Home, User, Clock, Sunrise, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useEvents } from "@/hooks/useEvents";
import { useMemo } from "react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: User, label: "Journey", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentStep, markSeen, skipAll } = useOnboarding();
  const { events } = useEvents();
  
  // Calculate today's context for smart indicators
  const contextualIndicator = useMemo(() => {
    const hour = new Date().getHours();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEvents = events.filter(e => new Date(e.created_at) >= todayStart);
    const hasPulseToday = todayEvents.some(e => e.tool_name === 'pulse');
    const hasDebriefToday = todayEvents.some(e => e.tool_name === 'debrief');
    
    // Morning nudge (5am-12pm) - show if Pulse not done
    if (hour >= 5 && hour < 12 && !hasPulseToday) {
      return { type: 'pulse', icon: Sunrise, color: 'hsl(45 100% 60%)' };
    }
    
    // Evening nudge (5pm-11pm) - show if Debrief not done
    if (hour >= 17 && hour < 23 && !hasDebriefToday) {
      return { type: 'debrief', icon: Moon, color: 'hsl(260 80% 65%)' };
    }
    
    return null;
  }, [events]);

  const navContent = (
    <div className="bottom-nav-container">
      <div className="flex items-center justify-around">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isHome = path === "/";
          const showIndicator = isHome && contextualIndicator;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "nav-pill flex flex-col items-center gap-1 min-w-[4.5rem]",
                isActive && "nav-pill-active"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )} />
                {showIndicator && (
                  <div 
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background animate-pulse"
                    style={{ backgroundColor: contextualIndicator.color }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <nav className="bottom-nav">
      <OnboardingTooltip
        title="Navigate your practice"
        description="Home for insights, History for past wisdom, Journey for your growth. Use side tabs for tools and profile."
        isActive={currentStep === "navigation"}
        onDismiss={() => markSeen("navigation")}
        onSkipAll={skipAll}
        position="top"
      >
        {navContent}
      </OnboardingTooltip>
    </nav>
  );
}
