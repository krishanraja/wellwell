import { cn } from "@/lib/utils";
import { Home, User, Clock, LayoutGrid } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { useOnboarding } from "@/hooks/useOnboarding";

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

  const navContent = (
    <div 
      className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "nav-pill flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all duration-300",
              isActive && "nav-pill-active"
            )}
          >
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
