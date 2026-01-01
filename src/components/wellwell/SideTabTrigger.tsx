import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SideTabTriggerProps {
  side: "left" | "right";
  icon: LucideIcon;
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
  label?: string;
}

export function SideTabTrigger({
  side,
  icon: Icon,
  onClick,
  isOpen = false,
  className,
  label,
}: SideTabTriggerProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label || `Open ${side} panel`}
      className={cn(
        // Base positioning and shape
        "fixed top-1/2 -translate-y-1/2 z-40",
        "flex items-center justify-center",
        "w-10 h-20",
        // Side-specific positioning and rounding
        side === "left" && "left-0 rounded-r-2xl",
        side === "right" && "right-0 rounded-l-2xl",
        // Mint gradient background
        "bg-gradient-to-b from-[hsl(90_100%_79%)] to-[hsl(187_100%_60%)]",
        // Shadow and glow
        "shadow-lg",
        // Pulse animation when not open
        !isOpen && "animate-side-tab-pulse",
        // Transition for smooth state changes
        "transition-all duration-300 ease-out",
        // Hover effects
        "hover:w-12 hover:shadow-xl",
        "active:scale-95",
        // When open, subtle indication
        isOpen && "opacity-60 w-8",
        className
      )}
      style={{
        boxShadow: isOpen 
          ? "0 4px 12px hsl(187 100% 60% / 0.2)" 
          : "0 4px 20px hsl(187 100% 60% / 0.4), 0 0 30px hsl(90 100% 79% / 0.3)",
      }}
    >
      <Icon 
        className={cn(
          "w-5 h-5 text-[hsl(165_20%_5%)]",
          "transition-transform duration-300",
          isOpen && "scale-90"
        )} 
      />
    </button>
  );
}

