import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: "default" | "highlight";
  className?: string;
}

export function FeatureButton({
  icon: Icon,
  title,
  description,
  onClick,
  variant = "default",
  className
}: FeatureButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 text-left group",
        variant === "default" 
          ? "bg-card border border-border hover:border-primary/30 hover:-translate-y-1 hover:shadow-md"
          : "bg-brand-gradient hover:opacity-90 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          variant === "default"
            ? "bg-muted group-hover:bg-primary/10 text-foreground group-hover:text-primary"
            : "bg-primary-foreground/20 text-primary-foreground"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-display font-semibold text-base",
            variant === "default" ? "text-foreground" : "text-primary-foreground"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-sm mt-0.5",
            variant === "default" ? "text-muted-foreground" : "text-primary-foreground/80"
          )}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
