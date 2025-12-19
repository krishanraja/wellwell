import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { Flame, RefreshCw, Target, Shield, RotateCcw, Wind, X } from "lucide-react";

export default function Intervene() {
  const [trigger, setTrigger] = useState("");
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("intervene");
  const { analyze, isLoading, response, reset, cancel } = useStoicAnalyzer();

  const handleTranscript = async (text: string) => {
    setTrigger(text);
    // Fix #4: Move usage tracking AFTER AI success
    const result = await analyze({
      tool: "intervene",
      input: JSON.stringify({ trigger: text, intensity: 7 }), // Default intensity, AI refines
      onError: showError,
    });
    
    // Only track usage if analysis succeeded
    if (result) {
      try {
        await trackUsage();
      } catch (err) {
        console.warn("Failed to track usage", err);
      }
    }
  };

  const handleReset = () => {
    setTrigger("");
    reset();
  };

  if (!response) {
    return (
      <>
        {ErrorModal}
        <Layout>
        <UsageLimitGate toolName="intervene">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Compact calming header */}
            <div className="text-center py-2 animate-fade-up shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/10 rounded-full mb-2">
                <Flame className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-coral">Intervene</span>
              </div>
              
              {/* Grounding wisdom - compact */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Wind className="w-4 h-4 text-cyan" />
                </div>
                <p className="text-foreground font-display text-base leading-snug mb-1">
                  "Between stimulus and response, there is a space."
                </p>
                <p className="text-muted-foreground text-xs">
                  In that space is your power to choose your response.
                </p>
              </div>
            </div>

            {/* Voice-first input - centered in remaining space */}
            <div className="flex-1 flex flex-col justify-center min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-lg font-display font-semibold text-foreground mb-1">
                What triggered you?
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Let it out — I'll help you recalibrate
              </p>
              
              <div className="relative">
                <VoiceFirstInput
                  onTranscript={handleTranscript}
                  onError={showError}
                  placeholder="Tap to speak what happened"
                  processingText="Recalibrating..."
                  isProcessing={isLoading}
                />
                {/* Cancel button during processing (Fix #1) */}
                {isLoading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancel}
                    className="absolute top-2 right-2 z-10"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            
            {/* Bottom spacer for nav clearance */}
            <div className="h-4 shrink-0" />
          </div>
        </UsageLimitGate>
      </Layout>
    </>
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
        <div className="mt-2">
          <ActionChip action={response.action} duration="10m" />
        </div>
      )}
    </StoicCard>,
  ];

  return (
    <>
      {ErrorModal}
      <Layout>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Compact header */}
          <div className="text-center py-2 animate-fade-up shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/10 rounded-full mb-1">
              <Flame className="w-4 h-4 text-coral" />
              <span className="text-sm font-medium text-coral">Recalibrated</span>
            </div>
            {trigger && (
              <p className="text-xs text-muted-foreground mt-1 px-4 line-clamp-1">
                "{trigger.slice(0, 50)}{trigger.length > 50 ? '...' : ''}"
              </p>
            )}
          </div>
          
          {/* Card carousel - takes remaining space */}
          <div className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <CardCarousel className="h-full">{cards}</CardCarousel>
          </div>
          
          {/* Reset button with proper bottom spacing */}
          <div className="py-4 shrink-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              New Trigger
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
