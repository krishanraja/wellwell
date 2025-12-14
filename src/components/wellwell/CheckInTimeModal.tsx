import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Sunrise, Moon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Common time presets for quick selection
const morningPresets = [
  { label: "6:00 AM", value: "06:00:00" },
  { label: "7:00 AM", value: "07:00:00" },
  { label: "7:30 AM", value: "07:30:00" },
  { label: "8:00 AM", value: "08:00:00" },
  { label: "9:00 AM", value: "09:00:00" },
];

const eveningPresets = [
  { label: "6:00 PM", value: "18:00:00" },
  { label: "7:00 PM", value: "19:00:00" },
  { label: "8:00 PM", value: "20:00:00" },
  { label: "9:00 PM", value: "21:00:00" },
  { label: "10:00 PM", value: "22:00:00" },
];

export function CheckInTimeModal({ open, onOpenChange }: CheckInTimeModalProps) {
  const { profile, updateProfile, isUpdating } = useProfile();
  
  const [morningTime, setMorningTime] = useState<string | null>(null);
  const [eveningTime, setEveningTime] = useState<string | null>(null);
  
  // Initialize from profile
  useEffect(() => {
    if (profile) {
      setMorningTime(profile.morning_pulse_time || null);
      setEveningTime(profile.evening_debrief_time || null);
    }
  }, [profile]);
  
  const handleSave = async () => {
    try {
      await updateProfile({
        morning_pulse_time: morningTime,
        evening_debrief_time: eveningTime,
      });
      toast.success("Check-in times saved!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save times");
    }
  };
  
  const handleSkip = () => {
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            Set Your Daily Rituals
          </DialogTitle>
          <DialogDescription className="text-center">
            When do you have a few minutes to check in?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Morning Pulse */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sunrise className="w-4 h-4 text-amber-500" />
              </div>
              <span className="font-medium text-foreground">Morning Pulse</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {morningPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setMorningTime(morningTime === preset.value ? null : preset.value)}
                  className={cn(
                    "px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                    morningTime === preset.value
                      ? "border-amber-500 bg-amber-500/10 text-amber-600"
                      : "border-border bg-card/50 text-muted-foreground hover:border-amber-500/50"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Evening Debrief */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Moon className="w-4 h-4 text-purple-500" />
              </div>
              <span className="font-medium text-foreground">Evening Debrief</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {eveningPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setEveningTime(eveningTime === preset.value ? null : preset.value)}
                  className={cn(
                    "px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                    eveningTime === preset.value
                      ? "border-purple-500 bg-purple-500/10 text-purple-600"
                      : "border-border bg-card/50 text-muted-foreground hover:border-purple-500/50"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button 
            variant="brand" 
            onClick={handleSave}
            disabled={isUpdating || (!morningTime && !eveningTime)}
            className="flex-1"
          >
            {isUpdating ? "Saving..." : "Save"}
            {!isUpdating && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

