import { cn } from "@/lib/utils";

interface VirtueBarProps {
  virtues: {
    courage: number;
    temperance: number;
    justice: number;
    wisdom: number;
  };
  className?: string;
}

const virtueConfig = [
  { key: "courage", label: "Courage", color: "bg-coral" },
  { key: "temperance", label: "Temperance", color: "bg-aqua" },
  { key: "justice", label: "Justice", color: "bg-mint" },
  { key: "wisdom", label: "Wisdom", color: "bg-primary" },
] as const;

export function VirtueBar({ virtues, className }: VirtueBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {virtueConfig.map(({ key, label, color }) => (
        <div key={key} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <span className="text-xs font-display font-semibold text-foreground">
              {virtues[key]}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("virtue-segment", color)}
              style={{ width: `${virtues[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VirtueBarCompact({ virtues, className }: VirtueBarProps) {
  return (
    <div className={cn("flex gap-1 h-2", className)}>
      {virtueConfig.map(({ key, color }) => (
        <div
          key={key}
          className={cn("virtue-segment flex-1", color)}
          style={{ opacity: virtues[key] / 100 }}
          title={`${key}: ${virtues[key]}%`}
        />
      ))}
    </div>
  );
}
