import { ReactNode, useEffect, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onDismiss: () => void;
  onSkipAll?: () => void;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function OnboardingTooltip({
  children,
  title,
  description,
  isActive,
  onDismiss,
  onSkipAll,
  position = "bottom",
  className,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Fade in after mount for smoother appearance
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-primary/90",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-primary/90",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-primary/90",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-primary/90",
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      
      {isActive && (
        <div
          className={cn(
            "absolute z-50 w-64 transition-all duration-300",
            positionClasses[position],
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}
        >
          {/* Tooltip card */}
          <div className="bg-primary/95 backdrop-blur-sm rounded-xl p-3 shadow-lg shadow-primary/20">
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-primary-foreground">
                {title}
              </h4>
              <button
                onClick={onDismiss}
                className="p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-primary-foreground/80" />
              </button>
            </div>
            
            <p className="text-xs text-primary-foreground/80 leading-relaxed mb-2">
              {description}
            </p>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              {onSkipAll && (
                <button
                  onClick={onSkipAll}
                  className="text-[10px] text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors"
                >
                  Skip all tips
                </button>
              )}
              <button
                onClick={onDismiss}
                className="flex items-center gap-0.5 text-xs font-medium text-primary-foreground hover:text-primary-foreground/90 transition-colors ml-auto"
              >
                Got it
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-0 h-0 border-[6px]",
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}
