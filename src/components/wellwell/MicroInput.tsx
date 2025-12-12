import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MicroInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const MicroInput = forwardRef<HTMLTextAreaElement, MicroInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-transparent border-b-2 border-border focus:border-primary outline-none transition-colors duration-200 py-3 text-foreground placeholder:text-muted-foreground resize-none min-h-[60px] text-base leading-relaxed",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

MicroInput.displayName = "MicroInput";
