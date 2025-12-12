import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ActionChipProps {
  action: string;
  onComplete?: () => void;
  className?: string;
}

export function ActionChip({ action, onComplete, className }: ActionChipProps) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    onComplete?.();
  };

  return (
    <button
      onClick={handleComplete}
      disabled={completed}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
        completed
          ? "bg-primary/10 border border-primary/20"
          : "bg-card border border-border hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.99]",
        className
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
          completed
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Check className={cn("w-4 h-4", completed ? "opacity-100" : "opacity-40")} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn(
          "text-sm font-medium transition-colors duration-300",
          completed ? "text-muted-foreground line-through" : "text-foreground"
        )}>
          {action}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {completed ? "Completed" : "Tap when done"}
        </p>
      </div>
    </button>
  );
}
