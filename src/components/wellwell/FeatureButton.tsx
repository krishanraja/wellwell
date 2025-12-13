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
        compact ? "p-3 min-h-[72px]" : "p-4",
        className
      )}
    >
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
          compact ? "w-10 h-10" : "w-12 h-12"
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
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className={cn(
          "font-display font-semibold text-foreground leading-tight",
          compact ? "text-sm" : "text-base"
        )}>
          {label}
        </span>
        {sublabel && (
          <span className={cn(
            "text-muted-foreground leading-tight mt-0.5",
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
        "glass-card p-4 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-glow active:scale-[0.98] min-h-[100px]",
        className
      )}
    >
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
        style={{ 
          backgroundColor: accentColor ? `${accentColor}20` : 'hsl(var(--primary) / 0.1)',
        }}
      >
        <Icon 
          className="w-6 h-6"
          style={{ color: accentColor || 'hsl(var(--primary))' }}
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="font-display font-semibold text-foreground text-sm leading-tight">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}
