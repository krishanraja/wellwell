import { useState } from "react";
import { LogoFull } from "@/components/wellwell/Header";
import { Button } from "@/components/ui/button";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Heart, Compass, Users, Loader2, Sunrise, Moon, SkipForward, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useEvents } from "@/hooks/useEvents";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
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
  const { profile, isLoading: isProfileLoading, error: profileError, updateProfile, isUpdating } = useProfile();
  const { createEvent } = useEvents();
  const { showError, ErrorModal } = useErrorModal();
  const [step, setStep] = useState(0);
  const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
  const [selectedHelpful, setSelectedHelpful] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState("");
  const [baselineMoment, setBaselineMoment] = useState("");
  
  // Time sliders: [morningHour, eveningHour] where hour is 0-23
  const [morningHour, setMorningHour] = useState([7]); // Default 7 AM
  const [eveningHour, setEveningHour] = useState([20]); // Default 8 PM
  
  const [isSaving, setIsSaving] = useState(false);

  // Show loading state while profile is being fetched/recovered
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile cannot be loaded or recovered
  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Unable to load profile</h2>
          <p className="text-muted-foreground mb-4">
            There was an error setting up your profile. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

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
      // Ensure profile exists before updating
      if (!profile) {
        logger.warn("Profile missing during onboarding completion, this should not happen");
        showError("Profile not found. Please refresh the page and try again.", "Setup Error");
        setIsSaving(false);
        return;
      }

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
      navigate("/");
    } catch (error) {
      logger.error("Failed to save onboarding data", { error });
      showError("Something went wrong. Please try again.", "Error Saving");
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
            <div className="mb-8 animate-fade-up text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                When do you need support?
              </h2>
              <p className="text-sm text-muted-foreground">
                Select any that resonate (optional)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <div className="w-full max-w-md grid grid-cols-2 gap-4">
                {situations.map(({ id, label, icon: Icon, description }) => (
                  <button
                    key={id}
                    onClick={() => toggleSituation(id)}
                    className={cn(
                      "p-5 rounded-xl border-2 transition-all duration-300 text-left h-full",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      selectedSituations.includes(id)
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6 mb-3",
                      selectedSituations.includes(id) ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-semibold text-base text-foreground block mb-1.5">{label}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
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
            <div className="mb-8 animate-fade-up text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What would help you most?
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose what matters to you (optional)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto flex items-center justify-center">
              <div className="w-full max-w-md grid grid-cols-2 gap-4">
                {helpfulThings.map(({ id, label, description }) => (
                  <button
                    key={id}
                    onClick={() => toggleHelpful(id)}
                    className={cn(
                      "p-5 rounded-xl border-2 transition-all duration-300 text-center h-full",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      selectedHelpful.includes(id)
                        ? "border-primary bg-primary/10 text-foreground shadow-lg"
                        : "border-border text-muted-foreground hover:border-primary/30 bg-card"
                    )}
                  >
                    <div className="font-semibold text-base mb-1.5">{label}</div>
                    <div className="text-xs font-normal text-muted-foreground leading-relaxed">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
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
        // Final step - optional sharing with engaging prompt
        return (
          <div className="flex-1 flex flex-col min-h-0 pb-safe">
            <div className="mb-8 animate-fade-up text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What's one thing you'd like clarity on right now?
              </h2>
              <p className="text-sm text-muted-foreground">
                Share a decision, situation, or challenge you're facing — or skip to get started
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-0">
              <VoiceFirstInput
                onTranscript={(text) => setBaselineMoment(text)}
                onComplete={() => {
                  if (baselineMoment.trim()) {
                    handleComplete();
                  }
                }}
                placeholder="Tap to speak or type your challenge"
                processingText="Processing..."
                className="w-full max-w-md mx-auto"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-border flex gap-3">
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
                disabled={isSaving || isUpdating || !baselineMoment.trim()}
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
    <>
      {ErrorModal}
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
    </>
  );
}