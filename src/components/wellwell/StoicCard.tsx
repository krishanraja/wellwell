import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties, ElementType } from "react";

interface StoicCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered";
  style?: CSSProperties;
  icon?: ElementType;
  title?: string;
}

export function StoicCard({ children, className, variant = "default", style, icon: Icon, title }: StoicCardProps) {
  return (
    <div
      className={cn(
        "stoic-card animate-fade-up",
        variant === "elevated" && "shadow-md",
        variant === "bordered" && "gradient-border",
        className
      )}
      style={style}
    >
      {(Icon || title) && (
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {title && <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>}
        </div>
      )}
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
