import { cn } from "@/lib/utils";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const intensityLabels = [
  "Mild friction",
  "Noticeable tension",
  "Reactive moment",
  "Emotional spike",
  "Losing composure"
];

export function IntensitySlider({ value, onChange, className }: IntensitySliderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Intensity
        </span>
        <span className="text-sm font-display font-semibold text-foreground">
          {value}/5
        </span>
      </div>
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 h-12 rounded-xl transition-all duration-300 border-2",
              level <= value
                ? "bg-brand-gradient border-transparent"
                : "bg-muted border-transparent hover:border-primary/30"
            )}
            aria-label={`Intensity ${level}: ${intensityLabels[level - 1]}`}
          />
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        {intensityLabels[value - 1]}
      </p>
    </div>
  );
}
