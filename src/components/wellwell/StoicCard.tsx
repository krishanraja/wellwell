import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StoicCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered";
}

export function StoicCard({ children, className, variant = "default" }: StoicCardProps) {
  return (
    <div
      className={cn(
        "stoic-card animate-fade-up",
        variant === "elevated" && "shadow-md",
        variant === "bordered" && "gradient-border",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StoicCardHeaderProps {
  label: string;
  icon?: ReactNode;
}

export function StoicCardHeader({ label, icon }: StoicCardHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-primary">{icon}</span>}
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

interface StoicCardContentProps {
  children: ReactNode;
  className?: string;
}

export function StoicCardContent({ children, className }: StoicCardContentProps) {
  return (
    <div className={cn("text-foreground leading-relaxed", className)}>
      {children}
    </div>
  );
}
