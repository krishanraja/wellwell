import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
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
import { Sunrise, ArrowRight, Target, Shield, Compass, RotateCcw, Loader2, History } from "lucide-react";

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

  const handleSubmit = async () => {
    if (challenge.trim()) {
      await trackUsage();
      await analyze({
        tool: "pulse",
        input: challenge,
      });
    }
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
            <div className="text-center py-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                <Sunrise className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Morning Pulse</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">What might challenge you today?</h1>
            </div>

            {/* Yesterday's context - Cross-session memory */}
            {yesterday.challenge && (
              <div className="px-4 py-3 bg-muted/50 rounded-xl mb-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <History className="w-3 h-3" />
                  <span>Yesterday you worked on:</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{yesterday.challenge}</p>
              </div>
            )}

            <div className="flex-1 flex flex-col py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <MicroInput 
                placeholder="e.g., A difficult conversation" 
                value={challenge} 
                onChange={(e) => setChallenge(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSubmit()} 
              />
            </div>
            <div className="text-center py-2 animate-fade-up" style={{ animationDelay: "150ms" }}>
              <p className="text-xs text-muted-foreground">
                Today: <span className="text-foreground">"{personalizedStance.stance}"</span>
              </p>
              <p className="text-xs text-primary/70 mt-1 capitalize">
                Focus: {personalizedStance.virtue}
              </p>
            </div>
            <div className="py-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <Button 
                variant="brand" 
                size="lg" 
                className="w-full" 
                onClick={handleSubmit} 
                disabled={!challenge.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get My Stance
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
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
