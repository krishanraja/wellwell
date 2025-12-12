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
  accentColor?: string;
  variant?: "default" | "glass" | "solid";
}

export function FeatureButton({ 
  icon: Icon, 
  label, 
  sublabel, 
  onClick, 
  className, 
  compact = false, 
  style,
  accentColor,
  variant = "default"
}: FeatureButtonProps) {
  const variantStyles = {
    default: "glass-card hover:shadow-glow",
    glass: "glass-card-glow",
    solid: "bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/15",
  };

  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        "flex items-center gap-3 w-full text-left transition-all duration-300 active:scale-[0.98]",
        variantStyles[variant],
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center transition-all duration-300",
          compact ? "p-2.5" : "p-3"
        )}
        style={{ 
          backgroundColor: accentColor ? `${accentColor}20` : 'hsl(var(--primary) / 0.1)',
        }}
      >
        <Icon 
          className={cn(compact ? "w-5 h-5" : "w-6 h-6")}
          style={{ color: accentColor || 'hsl(var(--primary))' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn(
          "font-display font-semibold text-foreground block",
          compact ? "text-sm" : "text-base"
        )}>
          {label}
        </span>
        {sublabel && (
          <span className={cn(
            "text-muted-foreground block",
            compact ? "text-xs" : "text-sm"
          )}>
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}

// Compact card variant for grids
export function FeatureCard({
  icon: Icon,
  label,
  sublabel,
  onClick,
  className,
  accentColor,
}: {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  className?: string;
  accentColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card p-4 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-glow active:scale-[0.98]",
        className
      )}
    >
      <div 
        className="p-3 rounded-2xl transition-all duration-300"
        style={{ 
          backgroundColor: accentColor ? `${accentColor}20` : 'hsl(var(--primary) / 0.1)',
        }}
      >
        <Icon 
          className="w-6 h-6"
          style={{ color: accentColor || 'hsl(var(--primary))' }}
        />
      </div>
      <div>
        <span className="font-display font-semibold text-foreground block text-sm">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-muted-foreground mt-0.5 block">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}
