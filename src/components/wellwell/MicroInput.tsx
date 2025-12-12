import { cn } from "@/lib/utils";
import { forwardRef, useState, useCallback } from "react";
import { VoiceInput } from "./VoiceInput";

interface MicroInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  showVoice?: boolean;
}

export const MicroInput = forwardRef<HTMLTextAreaElement, MicroInputProps>(
  ({ className, label, showVoice = true, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState("");
    
    const currentValue = value !== undefined ? value : internalValue;
    
    const handleVoiceTranscript = useCallback((text: string) => {
      const newValue = currentValue + (currentValue ? " " : "") + text;
      
      if (onChange) {
        // Create a synthetic event
        const syntheticEvent = {
          target: { value: newValue },
          currentTarget: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      } else {
        setInternalValue(newValue);
      }
    }, [currentValue, onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      } else {
        setInternalValue(e.target.value);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            className={cn(
              "w-full bg-transparent border-b-2 border-border focus:border-primary outline-none transition-colors duration-200 py-3 text-foreground placeholder:text-muted-foreground resize-none min-h-[60px] text-base leading-relaxed",
              showVoice && "pr-14",
              className
            )}
            {...props}
          />
          {showVoice && (
            <div className="absolute right-0 bottom-2">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                disabled={props.disabled}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MicroInput.displayName = "MicroInput";
