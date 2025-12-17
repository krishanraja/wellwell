import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { Button } from "@/components/ui/button";
import { Scale, Brain, Eye, Sparkles, RotateCcw } from "lucide-react";

export default function Decision() {
  const [decision, setDecision] = useState("");
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("decision");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();

  const handleTranscript = async (text: string) => {
    setDecision(text);
    await trackUsage();
    await analyze({
      tool: "decision",
      input: text,
      onError: showError,
    });
  };

  const handleReset = () => {
    setDecision("");
    reset();
  };

  if (!response) {
    return (
      <>
        {ErrorModal}
        <Layout>
        <UsageLimitGate toolName="decision">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="text-center py-2 animate-fade-up shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan/10 rounded-full mb-2">
                <Scale className="w-4 h-4 text-cyan" />
                <span className="text-sm font-medium text-cyan">Decision Engine</span>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-foreground font-display text-base leading-snug mb-1">
                  "The impediment to action advances action."
                </p>
                <p className="text-muted-foreground text-xs">
                  — Marcus Aurelius
                </p>
              </div>
            </div>

            {/* Voice input */}
            <div className="flex-1 flex flex-col justify-center min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-lg font-display font-semibold text-foreground mb-1">
                What decision are you facing?
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Describe your dilemma — I'll help you see clearly
              </p>
              
              <VoiceFirstInput
                onTranscript={handleTranscript}
                placeholder="Tap to describe your decision"
                processingText="Analyzing your choice..."
                isProcessing={isLoading}
              />
            </div>
            
            <div className="h-4 shrink-0" />
          </div>
        </UsageLimitGate>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="control" icon={Brain} title="What's In Your Control" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.control_map || "Your effort, your preparation, your attitude toward either outcome."}
      </p>
    </StoicCard>,
    <StoicCard key="insight" icon={Eye} title="What You Might Be Missing" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.surprise_or_tension || "Often the hardest decisions reveal what we truly value."}
      </p>
    </StoicCard>,
    <StoicCard key="guidance" icon={Sparkles} title="Stoic Guidance" className="h-full flex flex-col">
      <p className="text-foreground font-medium text-sm flex-1">
        "{response.stance || "Choose the path that serves your character, not your comfort."}"
      </p>
      {response.action && (
        <div className="mt-2">
          <ActionChip action={response.action} />
        </div>
      )}
    </StoicCard>,
  ];

  return (
    <>
      {ErrorModal}
      <Layout>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="text-center py-2 animate-fade-up shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan/10 rounded-full mb-1">
              <Scale className="w-4 h-4 text-cyan" />
              <span className="text-sm font-medium text-cyan">Decision Clarity</span>
            </div>
            {decision && (
              <p className="text-xs text-muted-foreground mt-1 px-4 line-clamp-1">
                "{decision.slice(0, 50)}{decision.length > 50 ? '...' : ''}"
              </p>
            )}
          </div>
          
          <div className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <CardCarousel className="h-full">{cards}</CardCarousel>
          </div>
          
          <div className="py-4 shrink-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              New Decision
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
