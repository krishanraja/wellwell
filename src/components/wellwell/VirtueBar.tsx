import { cn } from "@/lib/utils";
import { Flame, Droplets, Scale, Lightbulb } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface VirtueBarProps {
  courage: number;
  temperance: number;
  justice: number;
  wisdom: number;
  className?: string;
  compact?: boolean;
  showIcons?: boolean;
}

interface VirtueConfig {
  color: string;
  gradient: string;
  icon: LucideIcon;
  label: string;
}

const virtueConfig: Record<string, VirtueConfig> = {
  courage: {
    color: "hsl(var(--coral))",
    gradient: "linear-gradient(90deg, hsl(8 100% 65%) 0%, hsl(8 100% 75%) 100%)",
    icon: Flame,
    label: "Courage",
  },
  temperance: {
    color: "hsl(var(--mint))",
    gradient: "linear-gradient(90deg, hsl(90 80% 65%) 0%, hsl(90 100% 79%) 100%)",
    icon: Droplets,
    label: "Temperance",
  },
  justice: {
    color: "hsl(var(--primary))",
    gradient: "linear-gradient(90deg, hsl(187 100% 42%) 0%, hsl(187 100% 60%) 100%)",
    icon: Scale,
    label: "Justice",
  },
  wisdom: {
    color: "hsl(var(--gold))",
    gradient: "linear-gradient(90deg, hsl(45 80% 50%) 0%, hsl(45 100% 60%) 100%)",
    icon: Lightbulb,
    label: "Wisdom",
  },
};

export function VirtueBar({ 
  courage, 
  temperance, 
  justice, 
  wisdom, 
  className, 
  compact = false,
  showIcons = false 
}: VirtueBarProps) {
  const virtues = { courage, temperance, justice, wisdom };
  
  return (
    <div className={cn("space-y-3", compact && "space-y-2", className)}>
      {(Object.keys(virtues) as Array<keyof typeof virtues>).map((key) => {
        const config = virtueConfig[key];
        const VirtueIcon = config.icon;
        const value = virtues[key];
        
        return (
          <div key={key} className={cn("flex items-center gap-3", compact && "gap-2")}>
            {showIcons && (
              <div 
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <VirtueIcon 
                  className="w-3.5 h-3.5" 
                  style={{ color: config.color }}
                />
              </div>
            )}
            <span className={cn(
              "text-muted-foreground capitalize flex-shrink-0 font-medium",
              compact ? "text-xs w-20" : "text-sm w-24"
            )}>
              {config.label}
            </span>
            <div className={cn(
              "flex-1 rounded-full overflow-hidden bg-muted/50 relative",
              compact ? "h-2" : "h-2.5"
            )}>
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${value}%`,
                  background: config.gradient,
                  boxShadow: `0 0 12px ${config.color}60`,
                }}
              />
            </div>
            <span className={cn(
              "text-foreground font-semibold text-right tabular-nums",
              compact ? "text-xs w-8" : "text-sm w-10"
            )}>
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function VirtueBarCompact({ 
  courage, 
  temperance, 
  justice, 
  wisdom, 
  className 
}: Omit<VirtueBarProps, "compact" | "showIcons">) {
  const total = courage + temperance + justice + wisdom;
  const segments = [
    { key: "courage", value: courage, config: virtueConfig.courage },
    { key: "temperance", value: temperance, config: virtueConfig.temperance },
    { key: "justice", value: justice, config: virtueConfig.justice },
    { key: "wisdom", value: wisdom, config: virtueConfig.wisdom },
  ];
  
  return (
    <div className={cn("flex h-2 rounded-full overflow-hidden bg-muted/30", className)}>
      {segments.map(({ key, value, config }) => (
        <div 
          key={key} 
          className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          style={{ 
            width: `${(value / total) * 100}%`,
            background: config.gradient,
          }} 
        />
      ))}
    </div>
  );
}

// Circular virtue display for hero sections
export function VirtueCircle({
  virtue,
  value,
  size = "md",
  className,
}: {
  virtue: keyof typeof virtueConfig;
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = virtueConfig[virtue];
  const VirtueIcon = config.icon;
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };
  
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={config.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${config.color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <VirtueIcon 
          className={iconSizes[size]}
          style={{ color: config.color }}
        />
      </div>
    </div>
  );
}
