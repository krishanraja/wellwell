import { cn } from "@/lib/utils";

interface VirtueBarProps {
  courage: number;
  temperance: number;
  justice: number;
  wisdom: number;
  className?: string;
  compact?: boolean;
}

const virtueColors = { courage: "bg-coral", temperance: "bg-mint", justice: "bg-primary", wisdom: "bg-sand" };

export function VirtueBar({ courage, temperance, justice, wisdom, className, compact = false }: VirtueBarProps) {
  const virtues = { courage, temperance, justice, wisdom };
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5", className)}>
      {(Object.keys(virtues) as Array<keyof typeof virtues>).map((key) => (
        <div key={key} className={cn("flex items-center gap-2", compact && "gap-1.5")}>
          <span className={cn("text-muted-foreground capitalize flex-shrink-0", compact ? "text-xs w-16" : "text-sm w-20")}>{compact ? key.slice(0, 4) : key}</span>
          <div className={cn("flex-1 bg-muted rounded-full overflow-hidden", compact ? "h-1.5" : "h-2")}>
            <div className={cn("virtue-segment", virtueColors[key])} style={{ width: `${virtues[key]}%` }} />
          </div>
          <span className={cn("text-foreground font-medium text-right", compact ? "text-xs w-6" : "text-sm w-8")}>{virtues[key]}</span>
        </div>
      ))}
    </div>
  );
}

export function VirtueBarCompact({ courage, temperance, justice, wisdom, className }: Omit<VirtueBarProps, "compact">) {
  const total = courage + temperance + justice + wisdom;
  const segments = [
    { key: "courage", value: courage, color: virtueColors.courage },
    { key: "temperance", value: temperance, color: virtueColors.temperance },
    { key: "justice", value: justice, color: virtueColors.justice },
    { key: "wisdom", value: wisdom, color: virtueColors.wisdom },
  ];
  return (
    <div className={cn("flex h-1.5 rounded-full overflow-hidden bg-muted", className)}>
      {segments.map(({ key, value, color }) => (
        <div key={key} className={cn("transition-all duration-500", color)} style={{ width: `${(value / total) * 100}%` }} />
      ))}
    </div>
  );
}
