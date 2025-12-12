import { cn } from "@/lib/utils";
import { Home, Sun, Zap, Moon, LayoutGrid } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Sun, label: "Pulse", path: "/pulse" },
  { icon: Zap, label: "Intervene", path: "/intervene" },
  { icon: Moon, label: "Debrief", path: "/debrief" },
  { icon: LayoutGrid, label: "More", path: "/more" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 nav-glass z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "nav-pill flex flex-col items-center gap-1 min-w-[60px] transition-all duration-300",
                isActive && "nav-pill-active"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
