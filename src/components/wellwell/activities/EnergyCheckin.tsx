import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Zap, ArrowRight, Smile, Meh, Frown, Battery, BatteryLow, BatteryFull, BatteryMedium } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnergyCheckinProps {
  onComplete: (response: { mood: number; energy: number; clarity: number }) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

const moodOptions = [
  { value: 1, icon: Frown, label: "Struggling", color: "text-red-400" },
  { value: 2, icon: Frown, label: "Low", color: "text-orange-400" },
  { value: 3, icon: Meh, label: "Okay", color: "text-yellow-400" },
  { value: 4, icon: Smile, label: "Good", color: "text-lime-400" },
  { value: 5, icon: Smile, label: "Great", color: "text-green-400" },
];

const energyOptions = [
  { value: 1, icon: BatteryLow, label: "Drained", color: "text-red-400" },
  { value: 2, icon: BatteryLow, label: "Low", color: "text-orange-400" },
  { value: 3, icon: BatteryMedium, label: "Moderate", color: "text-yellow-400" },
  { value: 4, icon: BatteryMedium, label: "Good", color: "text-lime-400" },
  { value: 5, icon: BatteryFull, label: "High", color: "text-green-400" },
];

const clarityOptions = [
  { value: 1, label: "Foggy", color: "bg-red-400" },
  { value: 2, label: "Hazy", color: "bg-orange-400" },
  { value: 3, label: "Okay", color: "bg-yellow-400" },
  { value: 4, label: "Clear", color: "bg-lime-400" },
  { value: 5, label: "Sharp", color: "bg-green-400" },
];

export function EnergyCheckin({ onComplete, onSkip, isSubmitting }: EnergyCheckinProps) {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [clarity, setClarity] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleMoodSelect = (value: number) => {
    setMood(value);
    setTimeout(() => setCurrentStep(1), 300);
  };

  const handleEnergySelect = (value: number) => {
    setEnergy(value);
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleClaritySelect = (value: number) => {
    setClarity(value);
  };

  const handleComplete = () => {
    if (mood !== null && energy !== null && clarity !== null) {
      onComplete({ mood, energy, clarity });
    }
  };

  const isComplete = mood !== null && energy !== null && clarity !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-5"
    >
      {/* Icon */}
      <motion.div 
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20">
          <Activity className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2 
        className="text-xl font-display font-semibold text-center text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        How are you feeling right now?
      </motion.h2>

      {/* Step 1: Mood */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: currentStep >= 0 ? 1 : 0.3, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2 mb-3">
          <Smile className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Mood</span>
        </div>
        <div className="flex justify-between gap-2">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleMoodSelect(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                mood === option.value 
                  ? "bg-white/15 ring-2 ring-primary scale-105" 
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              <option.icon className={cn("w-6 h-6", option.color)} />
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Step 2: Energy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: currentStep >= 1 ? 1 : 0.3, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn("space-y-2", currentStep < 1 && "pointer-events-none")}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Energy</span>
        </div>
        <div className="flex justify-between gap-2">
          {energyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleEnergySelect(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                energy === option.value 
                  ? "bg-white/15 ring-2 ring-primary scale-105" 
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              <option.icon className={cn("w-6 h-6", option.color)} />
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Step 3: Mental Clarity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: currentStep >= 2 ? 1 : 0.3, y: 0 }}
        transition={{ delay: 0.5 }}
        className={cn("space-y-2", currentStep < 2 && "pointer-events-none")}
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Mental Clarity</span>
        </div>
        <div className="flex justify-between gap-2">
          {clarityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleClaritySelect(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                clarity === option.value 
                  ? "bg-white/15 ring-2 ring-primary scale-105" 
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full", option.color)} />
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3 mt-2"
      >
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleComplete}
          disabled={!isComplete || isSubmitting}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            isComplete 
              ? "bg-gradient-to-r from-primary to-teal-400 text-black hover:shadow-lg hover:shadow-primary/20" 
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

