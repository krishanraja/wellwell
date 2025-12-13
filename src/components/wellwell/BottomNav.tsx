import { cn } from "@/lib/utils";
import { Home, User, Clock, LayoutGrid, Sunrise, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useEvents } from "@/hooks/useEvents";
import { useMemo } from "react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: User, label: "Journey", path: "/profile" },
  { icon: LayoutGrid, label: "More", path: "/more" },
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
    <div 
      className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        const showIndicator = path === '/' && contextualIndicator && !isActive;
        
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "nav-pill relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all duration-300",
              isActive && "nav-pill-active"
            )}
          >
            {/* Contextual nudge indicator */}
            {showIndicator && (
              <span 
                className="absolute -top-0.5 right-2.5 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: contextualIndicator.color }}
              />
            )}
            
            <Icon className={cn(
              "w-5 h-5 shrink-0 transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-[10px] font-medium leading-none transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 nav-glass z-50">
      <OnboardingTooltip
        title="Navigate your practice"
        description="Home for insights, History for past wisdom, Journey for your growth, More for extra tools."
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
