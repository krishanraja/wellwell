import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useCrossSessionMemory } from "@/hooks/useCrossSessionMemory";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { getPersonalizedStance } from "@/data/dailyStances";
import { Sunrise, Target, Shield, Compass, RotateCcw, Quote } from "lucide-react";

export default function Pulse() {
  const [challenge, setChallenge] = useState("");
  const { trackUsage } = useUsageLimit("pulse");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();
  const { yesterday } = useCrossSessionMemory();
  const { profile } = useProfile();
  const { scoresMap } = useVirtueScores();

  // Get personalized stance based on user context
  const lowestVirtue = Object.entries(scoresMap).length > 0
    ? Object.entries(scoresMap).reduce((a, b) => (a[1]?.score || 50) < (b[1]?.score || 50) ? a : b)
    : null;
  
  const personalizedStance = getPersonalizedStance({
    challenges: profile?.challenges || [],
    lowestVirtue: lowestVirtue?.[0],
    lowestVirtueScore: lowestVirtue?.[1]?.score,
  });

  const handleTranscript = async (text: string) => {
    setChallenge(text);
    await trackUsage();
    await analyze({
      tool: "pulse",
      input: text,
    });
  };

  const handleReset = () => {
    setChallenge("");
    reset();
  };

  if (!response) {
    return (
      <Layout>
        <UsageLimitGate toolName="pulse">
          <div className="flex-1 flex flex-col">
            {/* Value First: Show wisdom immediately */}
            <div className="text-center py-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <Sunrise className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Morning Pulse</span>
              </div>
              
              {/* Today's wisdom - value upfront */}
              <div className="mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Quote className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Today's Stance</span>
                </div>
                <p className="text-foreground font-display text-lg leading-relaxed">
                  "{personalizedStance.stance}"
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                  {personalizedStance.virtue}
                </span>
              </div>
            </div>

            {/* Yesterday's context if available */}
            {yesterday.challenge && (
              <div className="px-4 py-3 bg-muted/30 rounded-xl mb-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
                <p className="text-xs text-muted-foreground mb-1">Yesterday:</p>
                <p className="text-sm text-foreground/80">{yesterday.challenge}</p>
              </div>
            )}

            {/* Voice-first input */}
            <div className="flex-1 flex flex-col justify-center animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-xl font-display font-semibold text-foreground mb-2">
                What might challenge you today?
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Speak freely — I'll find the Stoic wisdom within
              </p>
              
              <VoiceFirstInput
                onTranscript={handleTranscript}
                placeholder="Tap to speak your challenge"
                processingText="Finding your Stoic stance..."
                isProcessing={isLoading}
              />
            </div>
          </div>
        </UsageLimitGate>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="control" icon={Target} title="Control" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.control_map || "Focus on what you can control: your preparation, your response, your composure."}
      </p>
    </StoicCard>,
    <StoicCard key="virtue" icon={Shield} title="Virtue" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.virtue_focus || "Lead with courage and wisdom."}
      </p>
      {response.virtue_updates?.[0] && (
        <p className="text-foreground font-medium text-sm mt-2">
          Lead with: <span className="text-primary capitalize">{response.virtue_updates[0].virtue}</span>
        </p>
      )}
    </StoicCard>,
    <StoicCard key="stance" icon={Compass} title="Your Stance" className="h-full flex flex-col">
      <p className="text-foreground font-medium text-base flex-1">
        "{response.stance || "I will enter with clarity and listen with intention."}"
      </p>
      {response.action && (
        <div className="mt-3">
          <ActionChip action={response.action} duration="3s" />
        </div>
      )}
    </StoicCard>,
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center py-3 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-2">
            <Sunrise className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Stance</span>
          </div>
          {challenge && (
            <p className="text-sm text-muted-foreground mt-2 px-4">
              "{challenge.slice(0, 60)}{challenge.length > 60 ? '...' : ''}"
            </p>
          )}
        </div>
        <CardCarousel className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>{cards}</CardCarousel>
        <div className="py-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            New Challenge
          </Button>
        </div>
      </div>
    </Layout>
  );
}
