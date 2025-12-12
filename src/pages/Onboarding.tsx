import { useState } from "react";
import { LogoFull } from "@/components/wellwell/Header";
import { Button } from "@/components/ui/button";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Heart, Compass, Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useEvents } from "@/hooks/useEvents";
import { toast } from "sonner";
import type { Persona } from "@/types/database";
import { logger } from "@/lib/logger";

const challenges = [
  { id: "conflict", label: "Conflict", icon: Users },
  { id: "pressure", label: "Pressure", icon: Brain },
  { id: "uncertainty", label: "Uncertainty", icon: Compass },
  { id: "overwhelm", label: "Overwhelm", icon: Heart },
];

const goals = [
  { id: "calm", label: "Calm" },
  { id: "clarity", label: "Clarity" },
  { id: "composure", label: "Composure" },
  { id: "decisive", label: "Decisive" },
];

const personas = [
  { id: "strategist", label: "Strategist", tagline: "Keep me sharp" },
  { id: "monk", label: "Monk", tagline: "Keep me steady" },
  { id: "commander", label: "Commander", tagline: "Keep me decisive" },
  { id: "friend", label: "Friend", tagline: "Keep me grounded" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, isUpdating } = useProfile();
  const { createEvent } = useEvents();
  const [step, setStep] = useState(0);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState("");
  const [baselineMoment, setBaselineMoment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleChallenge = (id: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      logger.info("Saving onboarding data", {
        challenges: selectedChallenges,
        goals: selectedGoals,
        persona: selectedPersona,
        hasBaselineMoment: !!baselineMoment,
      });

      // Save profile data
      await updateProfile({
        challenges: selectedChallenges,
        goals: selectedGoals,
        persona: selectedPersona as Persona,
        baseline_moment: baselineMoment,
      });

      // Create an initial event with the baseline moment
      await createEvent({
        tool_name: "onboarding",
        raw_input: baselineMoment,
        question_key: "baseline_moment",
        structured_values: {
          challenges: selectedChallenges,
          goals: selectedGoals,
          persona: selectedPersona,
        },
      });

      logger.info("Onboarding completed successfully");
      toast.success("Welcome to WellWell!");
      navigate("/");
    } catch (error) {
      logger.error("Failed to save onboarding data", { error });
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up min-h-0">
            <LogoFull className="h-28 mb-6" />
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed mb-8">
              Think clearly under pressure. Seconds, not minutes.
            </p>
            <Button variant="brand" size="lg" onClick={() => setStep(1)}>
              Begin
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-up">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                What throws you off?
              </h2>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1 content-start min-h-0 overflow-y-auto">
              {challenges.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleChallenge(id)}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all duration-300 text-left",
                    selectedChallenges.includes(id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 mb-1",
                    selectedChallenges.includes(id) ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium text-sm text-foreground">{label}</span>
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              size="lg"
              className="w-full mt-auto pt-4 shrink-0"
              onClick={() => setStep(2)}
              disabled={selectedChallenges.length === 0}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-up">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                What do you want more of?
              </h2>
              <p className="text-sm text-muted-foreground">Select your goals</p>
            </div>

            <div className="flex flex-wrap gap-2 flex-1 content-start min-h-0 overflow-y-auto">
              {goals.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleGoal(id)}
                  className={cn(
                    "px-4 py-2 rounded-full border-2 transition-all duration-300 font-medium text-sm",
                    selectedGoals.includes(id)
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              size="lg"
              className="w-full mt-auto pt-4 shrink-0"
              onClick={() => setStep(3)}
              disabled={selectedGoals.length === 0}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-up">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Choose your guide
              </h2>
              <p className="text-sm text-muted-foreground">Same logic, different tone</p>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1 content-start min-h-0 overflow-y-auto">
              {personas.map(({ id, label, tagline }) => (
                <button
                  key={id}
                  onClick={() => setSelectedPersona(id)}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all duration-300 text-left",
                    selectedPersona === id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="font-display font-semibold text-sm text-foreground block">{label}</span>
                  <span className="text-xs text-primary">{tagline}</span>
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              size="lg"
              className="w-full mt-auto pt-4 shrink-0"
              onClick={() => setStep(4)}
              disabled={!selectedPersona}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-up">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                One thing on your mind
              </h2>
              <p className="text-sm text-muted-foreground">
                Let's see how WellWell helps.
              </p>
            </div>

            <div className="flex-1 flex items-center min-h-0">
              <MicroInput
                placeholder="What's weighing on you?"
                value={baselineMoment}
                onChange={(e) => setBaselineMoment(e.target.value)}
              />
            </div>

            <Button
              variant="brand"
              size="lg"
              className="w-full mt-auto pt-4 shrink-0"
              onClick={handleComplete}
              disabled={!baselineMoment.trim() || isSaving || isUpdating}
            >
              {isSaving || isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Show me clarity
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
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

      <div className="relative flex-1 flex flex-col min-h-0 max-w-lg mx-auto w-full px-6 py-4 safe-area-top safe-area-bottom overflow-hidden">
        {/* Progress */}
        {step > 0 && step < 5 && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all duration-300",
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
