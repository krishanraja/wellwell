import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Debrief() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    tested: "",
    controlled: "",
    repeats: "",
  });

  const questions = [
    { key: "tested", label: "What tested you?", placeholder: "What situation challenged you today?" },
    { key: "controlled", label: "What did you control well?", placeholder: "Where did you act with clarity?" },
    { key: "repeats", label: "What repeats tomorrow?", placeholder: "Any patterns carrying forward?" },
  ];

  const currentQuestion = questions[step];
  const isComplete = step >= questions.length;

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  // Mock virtue deltas
  const virtueDeltas = {
    courage: { value: 72, delta: 3 },
    temperance: { value: 85, delta: -2 },
    justice: { value: 68, delta: 0 },
    wisdom: { value: 79, delta: 5 },
  };

  const virtues = {
    courage: 72,
    temperance: 85,
    justice: 68,
    wisdom: 79,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Evening Debrief
          </h1>
          <p className="text-muted-foreground">
            Remove emotional residue. Close the day with clarity.
          </p>
        </div>

        {!isComplete ? (
          <>
            {/* Progress */}
            <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-brand-gradient" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <MicroInput
                label={currentQuestion.label}
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.key as keyof typeof answers]}
                onChange={(e) =>
                  setAnswers({ ...answers, [currentQuestion.key]: e.target.value })
                }
              />
            </div>

            {/* Next */}
            <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={handleNext}
              >
                {step < questions.length - 1 ? "Continue" : "Complete"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 stagger-children">
            {/* Summary */}
            <StoicCard>
              <StoicCardHeader label="Day Summary" />
              <StoicCardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You faced challenges with awareness. Your composure held where it mattered most.
                </p>
                <p className="text-foreground font-medium">
                  "Clearer now."
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Virtue Deltas */}
            <StoicCard>
              <StoicCardHeader label="Virtue Movement" />
              <StoicCardContent>
                <div className="space-y-3">
                  {Object.entries(virtueDeltas).map(([virtue, { value, delta }]) => (
                    <div key={virtue} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-foreground">{virtue}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-semibold">{value}%</span>
                        {delta !== 0 && (
                          <span
                            className={`flex items-center text-xs font-medium ${
                              delta > 0 ? "text-mint" : "text-coral"
                            }`}
                          >
                            {delta > 0 ? (
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-0.5" />
                            )}
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        )}
                        {delta === 0 && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Minus className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </StoicCardContent>
            </StoicCard>

            {/* Virtue Bars */}
            <StoicCard>
              <StoicCardHeader label="Current Balance" />
              <StoicCardContent>
                <VirtueBar virtues={virtues} />
              </StoicCardContent>
            </StoicCard>

            {/* Tomorrow Focus */}
            <StoicCard variant="bordered">
              <StoicCardHeader label="Tomorrow's Focus" />
              <StoicCardContent>
                <p className="text-lg font-display font-semibold text-foreground">
                  Practice pausing before you respond in conflict.
                </p>
              </StoicCardContent>
            </StoicCard>
          </div>
        )}
      </div>
    </Layout>
  );
}
