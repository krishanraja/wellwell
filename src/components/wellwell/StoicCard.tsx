import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties, ElementType } from "react";

interface StoicCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered" | "glass" | "hero";
  style?: CSSProperties;
  icon?: ElementType;
  title?: string;
  glowColor?: string;
}

export function StoicCard({ 
  children, 
  className, 
  variant = "default", 
  style, 
  icon: Icon, 
  title,
  glowColor 
}: StoicCardProps) {
  const baseStyles = "animate-fade-up";
  
  const variantStyles = {
    default: "stoic-card",
    elevated: "stoic-card shadow-elevated",
    bordered: "glass-card-glow",
    glass: "glass-card p-4",
    hero: "hero-card",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{
        ...style,
        ...(glowColor && { 
          boxShadow: `0 0 30px ${glowColor}`,
        }),
      }}
    >
      {(Icon || title) && (
        <div className="flex items-center gap-2 mb-3 relative z-10">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
          {title && (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
          )}
        </div>
      )}
      <div className="relative z-10">{children}</div>
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
      {icon && (
        <div className="p-1.5 rounded-lg bg-primary/10">
          <span className="text-primary">{icon}</span>
        </div>
      )}
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
