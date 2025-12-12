import { useState } from "react";
import { LogoFull, LogoIcon } from "@/components/wellwell/Header";
import { Button } from "@/components/ui/button";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Heart, Compass, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const challenges = [
  { id: "conflict", label: "Conflict", icon: Users },
  { id: "pressure", label: "Pressure", icon: Brain },
  { id: "uncertainty", label: "Uncertainty", icon: Compass },
  { id: "overwhelm", label: "Overwhelm", icon: Heart },
];

const goals = [
  { id: "calm", label: "Calmness" },
  { id: "clarity", label: "Clarity" },
  { id: "composure", label: "Composure" },
  { id: "decisiveness", label: "Decisiveness" },
];

const personas = [
  { id: "strategist", label: "Strategist", tagline: "Keep me sharp", description: "Clean logic, direct structure" },
  { id: "monk", label: "Monk", tagline: "Keep me steady", description: "Slower, more spacious pacing" },
  { id: "commander", label: "Commander", tagline: "Keep me decisive", description: "Clipped directives, no cushioning" },
  { id: "friend", label: "Friend", tagline: "Keep me grounded", description: "Warm, practical tone" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState("");
  const [baselineMoment, setBaselineMoment] = useState("");

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

  const handleComplete = () => {
    // In real app, would save to state/backend
    navigate("/");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-up">
            <LogoIcon className="h-16 mb-8" />
            <LogoFull className="h-10 mb-6" />
            <p className="text-muted-foreground text-lg max-w-xs leading-relaxed mb-12">
              Think clearly under pressure. Seconds, not minutes. No journaling. No quotes.
            </p>
            <Button variant="brand" size="xl" onClick={() => setStep(1)}>
              Begin
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What throws you off?
              </h2>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {challenges.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleChallenge(id)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all duration-300 text-left",
                    selectedChallenges.includes(id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mb-2",
                    selectedChallenges.includes(id) ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              size="lg"
              className="w-full"
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
          <div className="space-y-8 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What do you want more of?
              </h2>
              <p className="text-muted-foreground">Select your goals</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {goals.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleGoal(id)}
                  className={cn(
                    "px-5 py-2.5 rounded-full border-2 transition-all duration-300 font-medium",
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
              className="w-full"
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
          <div className="space-y-8 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Choose your guide
              </h2>
              <p className="text-muted-foreground">Same logic, different tone</p>
            </div>

            <div className="space-y-3">
              {personas.map(({ id, label, tagline, description }) => (
                <button
                  key={id}
                  onClick={() => setSelectedPersona(id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left",
                    selectedPersona === id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-semibold text-foreground">{label}</span>
                    <span className="text-sm text-primary font-medium">{tagline}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>

            <Button
              variant="brand"
              size="lg"
              className="w-full"
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
          <div className="space-y-8 animate-fade-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                One thing on your mind
              </h2>
              <p className="text-muted-foreground">
                Let's see how WellWell helps you think clearer.
              </p>
            </div>

            <MicroInput
              placeholder="What's been weighing on you lately?"
              value={baselineMoment}
              onChange={(e) => setBaselineMoment(e.target.value)}
            />

            <Button
              variant="brand"
              size="lg"
              className="w-full"
              onClick={handleComplete}
              disabled={!baselineMoment.trim()}
            >
              Show me clarity
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background glow */}
      <div className="fixed inset-0 bg-glow pointer-events-none" />

      <div className="relative flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-8">
        {/* Progress */}
        {step > 0 && step < 5 && (
          <div className="flex gap-2 mb-8">
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
