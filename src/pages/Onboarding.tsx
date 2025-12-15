import { useState } from "react";
import { LogoFull } from "@/components/wellwell/Header";
import { Button } from "@/components/ui/button";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Heart, Compass, Users, Loader2, Sunrise, Moon, SkipForward, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useEvents } from "@/hooks/useEvents";
import { toast } from "sonner";
import type { Persona } from "@/types/database";
import { logger } from "@/lib/logger";

// Convert hour (0-23) to time string (HH:MM:SS)
const hourToTimeString = (hour: number): string => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
};

// Convert time string to hour (0-23)
const timeStringToHour = (timeString: string | null): number => {
  if (!timeString) return 7; // Default 7 AM
  const [h, m] = timeString.split(':').map(Number);
  return h + m / 60;
};

// Softer, more welcoming challenge options
const situations = [
  { id: "pressure", label: "High-pressure moments", icon: Brain, description: "When stakes feel high" },
  { id: "uncertainty", label: "Unclear decisions", icon: Compass, description: "When the path forward isn't obvious" },
  { id: "conflict", label: "Difficult conversations", icon: Users, description: "When tensions arise" },
  { id: "overwhelm", label: "Too much at once", icon: Heart, description: "When everything feels urgent" },
];

// Better goal options - what would help you (using original IDs for compatibility)
const helpfulThings = [
  { id: "clarity", label: "Clear thinking", description: "See situations more clearly" },
  { id: "calm", label: "Steady composure", description: "Stay grounded under pressure" },
  { id: "decisive", label: "Confident decisions", description: "Choose with conviction" },
  { id: "composure", label: "Better perspective", description: "Keep things in proportion" },
];

const personas = [
  { id: "strategist", label: "Strategist", tagline: "Keep me sharp", description: "Direct, analytical guidance" },
  { id: "monk", label: "Monk", tagline: "Keep me steady", description: "Calm, reflective wisdom" },
  { id: "commander", label: "Commander", tagline: "Keep me decisive", description: "Action-oriented clarity" },
  { id: "friend", label: "Friend", tagline: "Keep me grounded", description: "Supportive, understanding" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, isUpdating } = useProfile();
  const { createEvent } = useEvents();
  const [step, setStep] = useState(0);
  const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
  const [selectedHelpful, setSelectedHelpful] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState("");
  const [baselineMoment, setBaselineMoment] = useState("");
  
  // Time sliders: [morningHour, eveningHour] where hour is 0-23
  const [morningHour, setMorningHour] = useState([7]); // Default 7 AM
  const [eveningHour, setEveningHour] = useState([20]); // Default 8 PM
  
  const [isSaving, setIsSaving] = useState(false);

  const toggleSituation = (id: string) => {
    setSelectedSituations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleHelpful = (id: string) => {
    setSelectedHelpful((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      logger.info("Saving onboarding data", {
        situations: selectedSituations,
        helpful: selectedHelpful,
        persona: selectedPersona,
        hasBaselineMoment: !!baselineMoment,
        morningTime: hourToTimeString(morningHour[0]),
        eveningTime: hourToTimeString(eveningHour[0]),
      });

      // Convert slider values to time strings
      const morningTime = hourToTimeString(morningHour[0]);
      const eveningTime = hourToTimeString(eveningHour[0]);

      // Save profile data
      await updateProfile({
        challenges: selectedSituations, // Keep same field name for backward compatibility
        goals: selectedHelpful, // Keep same field name
        persona: selectedPersona || undefined,
        baseline_moment: baselineMoment.trim() || undefined,
        morning_pulse_time: morningTime,
        evening_debrief_time: eveningTime,
      });

      // Create an initial event with the baseline moment if provided
      if (baselineMoment.trim()) {
        await createEvent({
          tool_name: "onboarding",
          raw_input: baselineMoment,
          question_key: "baseline_moment",
          structured_values: {
            challenges: selectedSituations,
            goals: selectedHelpful,
            persona: selectedPersona,
          },
        });
      }

      logger.info("Onboarding completed successfully");
      toast.success("Welcome to WellWell!");
      navigate("/");
    } catch (error) {
      logger.error("Failed to save onboarding data", { error });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatHour = (hour: number): string => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        // Welcome screen - explain what WellWell is
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-safe">
            <div className="mb-8 animate-fade-up">
              <LogoFull className="h-24 mb-6 mx-auto" />
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                Welcome to WellWell
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                A personal guide for thinking clearly under pressure. 
                Get practical wisdom in seconds, not minutes.
              </p>
            </div>
            <Button variant="brand" size="lg" onClick={() => setStep(1)} className="w-full max-w-xs">
              Get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 1:
        // Softer question: When do you need support?
        return (
          <div className="flex-1 flex flex-col min-h-0 pb-safe">
            <div className="mb-6 animate-fade-up">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                When do you need support?
              </h2>
              <p className="text-sm text-muted-foreground">
                Select any that resonate (optional)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto -mx-4 px-4">
              <div className="grid grid-cols-2 gap-3 content-start">
                {situations.map(({ id, label, icon: Icon, description }) => (
                  <button
                    key={id}
                    onClick={() => toggleSituation(id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      selectedSituations.includes(id)
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 mb-2",
                      selectedSituations.includes(id) ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-medium text-sm text-foreground block mb-1">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 2:
        // Better question: What would help you most?
        return (
          <div className="flex-1 flex flex-col min-h-0 pb-safe">
            <div className="mb-6 animate-fade-up">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What would help you most?
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose what matters to you (optional)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto -mx-4 px-4">
              <div className="flex flex-wrap gap-3 content-start">
                {helpfulThings.map(({ id, label, description }) => (
                  <button
                    key={id}
                    onClick={() => toggleHelpful(id)}
                    className={cn(
                      "px-5 py-3 rounded-full border-2 transition-all duration-300 font-medium text-sm",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      selectedHelpful.includes(id)
                        ? "border-primary bg-primary/10 text-foreground shadow-lg"
                        : "border-border text-muted-foreground hover:border-primary/30 bg-card"
                    )}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs font-normal text-muted-foreground mt-0.5">{description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={() => setStep(3)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        // Persona selection
        return (
          <div className="flex-1 flex flex-col min-h-0 pb-safe">
            <div className="mb-6 animate-fade-up">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Choose your guide
              </h2>
              <p className="text-sm text-muted-foreground">
                Same wisdom, different tone (optional)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto -mx-4 px-4">
              <div className="grid grid-cols-2 gap-3 content-start">
                {personas.map(({ id, label, tagline, description }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPersona(id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      selectedPersona === id
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <span className="font-display font-semibold text-base text-foreground block mb-1">{label}</span>
                    <span className="text-xs text-primary font-medium block mb-2">{tagline}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={() => setStep(4)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 4:
        // Time selection with sliders
        return (
          <div className="flex-1 flex flex-col min-h-0 pb-safe">
            <div className="mb-6 animate-fade-up">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                When can you check in?
              </h2>
              <p className="text-sm text-muted-foreground">
                Set daily reminder times (optional - you can skip this)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
              {/* Morning Pulse */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Sunrise className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">Morning Pulse</span>
                    <span className="text-xs text-muted-foreground">Start your day with clarity</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={morningHour}
                      onValueChange={setMorningHour}
                      min={5}
                      max={11}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-display font-bold text-foreground">
                      {formatHour(morningHour[0])}
                    </span>
                  </div>
                </div>
              </div>

              {/* Evening Debrief */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Moon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">Evening Debrief</span>
                    <span className="text-xs text-muted-foreground">Reflect on your day</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={eveningHour}
                      onValueChange={setEveningHour}
                      min={17}
                      max={23}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-display font-bold text-foreground">
                      {formatHour(eveningHour[0])}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => setStep(5)}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button
                variant="brand"
                size="lg"
                className="flex-1"
                onClick={() => setStep(5)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 5:
        // Final step - optional sharing
        return (
          <div className="flex-1 flex flex-col min-h-0 pb-safe">
            <div className="mb-6 animate-fade-up">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Anything on your mind?
              </h2>
              <p className="text-sm text-muted-foreground">
                Share something you're thinking about, or skip to get started
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 flex items-start pt-4">
                <MicroInput
                  placeholder="What's on your mind today?"
                  value={baselineMoment}
                  onChange={(e) => setBaselineMoment(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={handleComplete}
                disabled={isSaving || isUpdating}
              >
                {isSaving || isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </>
                )}
              </Button>
              <Button
                variant="brand"
                size="lg"
                className="flex-1"
                onClick={handleComplete}
                disabled={isSaving || isUpdating}
              >
                {isSaving || isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Get started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="viewport-container bg-background">
      {/* Background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />

      <div className="relative flex-1 flex flex-col min-h-0 max-w-lg mx-auto w-full px-6 py-6 safe-area-top overflow-hidden">
        {/* Progress indicator */}
        {step > 0 && step < 6 && (
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-300",
                  i <= step ? "bg-brand-gradient" : "bg-muted"
                )}
              />
            ))}
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  );
}