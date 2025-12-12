import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface FeatureButtonProps {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
  style?: CSSProperties;
}

export function FeatureButton({ icon: Icon, label, sublabel, onClick, className, compact = false, style }: FeatureButtonProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        "stoic-card hover-lift flex items-center gap-3 w-full text-left transition-all duration-300 hover:border-primary/30 active:scale-[0.98]",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className={cn("rounded-xl bg-primary/10 flex items-center justify-center", compact ? "p-2" : "p-3")}>
        <Icon className={cn("text-primary", compact ? "w-4 h-4" : "w-5 h-5")} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("font-display font-semibold text-foreground block", compact ? "text-sm" : "text-base")}>{label}</span>
        {sublabel && <span className={cn("text-muted-foreground block truncate", compact ? "text-xs" : "text-sm")}>{sublabel}</span>}
      </div>
    </button>
  );
}
