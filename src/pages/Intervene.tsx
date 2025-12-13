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
import { Flame, RefreshCw, Target, Shield, RotateCcw, Wind } from "lucide-react";

export default function Intervene() {
  const [trigger, setTrigger] = useState("");
  const { trackUsage } = useUsageLimit("intervene");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();

  const handleTranscript = async (text: string) => {
    setTrigger(text);
    await trackUsage();
    // Infer intensity from language (AI will assess)
    await analyze({
      tool: "intervene",
      input: JSON.stringify({ trigger: text, intensity: 7 }), // Default intensity, AI refines
    });
  };

  const handleReset = () => {
    setTrigger("");
    reset();
  };

  if (!response) {
    return (
      <Layout>
        <UsageLimitGate toolName="intervene">
          <div className="flex-1 flex flex-col">
            {/* Calming presence first */}
            <div className="text-center py-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral/10 rounded-full mb-4">
                <Flame className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-coral">Intervene</span>
              </div>
              
              {/* Grounding wisdom - value first */}
              <div className="mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <Wind className="w-5 h-5 text-cyan" />
                </div>
                <p className="text-foreground font-display text-lg leading-relaxed mb-2">
                  "Between stimulus and response, there is a space."
                </p>
                <p className="text-muted-foreground text-sm">
                  In that space is your power to choose your response.
                </p>
              </div>
            </div>

            {/* Voice-first input */}
            <div className="flex-1 flex flex-col justify-center animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-xl font-display font-semibold text-foreground mb-2">
                What triggered you?
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Let it out — I'll help you recalibrate
              </p>
              
              <VoiceFirstInput
                onTranscript={handleTranscript}
                placeholder="Tap to speak what happened"
                processingText="Recalibrating..."
                isProcessing={isLoading}
              />
            </div>
          </div>
        </UsageLimitGate>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="rewrite" icon={RefreshCw} title="Rewrite" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">Reframe:</span> {response.summary || "Their words reveal their stress, not your worth."}
      </p>
    </StoicCard>,
    <StoicCard key="control" icon={Target} title="Control" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm">
        {response.control_map || "Focus on your response, not their reaction."}
      </p>
    </StoicCard>,
    <StoicCard key="virtue" icon={Shield} title="Virtue Call" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.virtue_focus || "Temperance: respond with measure."}
      </p>
      {response.action && (
        <div className="mt-3">
          <ActionChip action={response.action} duration="10m" />
        </div>
      )}
    </StoicCard>,
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center py-3 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral/10 rounded-full mb-2">
            <Flame className="w-4 h-4 text-coral" />
            <span className="text-sm font-medium text-coral">Recalibrated</span>
          </div>
          {trigger && (
            <p className="text-sm text-muted-foreground mt-2 px-4">
              "{trigger.slice(0, 60)}{trigger.length > 60 ? '...' : ''}"
            </p>
          )}
        </div>
        <CardCarousel className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>{cards}</CardCarousel>
        <div className="py-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            New Trigger
          </Button>
        </div>
      </div>
    </Layout>
  );
}
