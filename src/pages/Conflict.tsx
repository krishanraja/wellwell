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
import { Swords, Users, Heart, Eye, Sparkles, RotateCcw } from "lucide-react";

export default function Conflict() {
  const [situation, setSituation] = useState("");
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("conflict");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();

  const handleTranscript = async (text: string) => {
    setSituation(text);
    await trackUsage();
    await analyze({
      tool: "conflict",
      input: text,
      onError: showError,
    });
  };

  const handleReset = () => {
    setSituation("");
    reset();
  };

  if (!response) {
    return (
      <>
        {ErrorModal}
        <Layout>
        <UsageLimitGate toolName="conflict">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="text-center py-2 animate-fade-up shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/10 rounded-full mb-2">
                <Swords className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-coral">Conflict Copilot</span>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-foreground font-display text-base leading-snug mb-1">
                  "Waste no more time arguing about what a good man should be. Be one."
                </p>
                <p className="text-muted-foreground text-xs">
                  — Marcus Aurelius
                </p>
              </div>
            </div>

            {/* Voice input */}
            <div className="flex-1 flex flex-col justify-center min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-lg font-display font-semibold text-foreground mb-1">
                What happened?
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Tell me about the conflict — I'll help you find perspective
              </p>
              
              <VoiceFirstInput
                onTranscript={handleTranscript}
                placeholder="Tap to describe the situation"
                processingText="Finding perspective..."
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
    <StoicCard key="perspective" icon={Users} title="Their Perspective" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.control_map || "Consider what pressures or fears might be driving their behavior."}
      </p>
    </StoicCard>,
    <StoicCard key="role" icon={Heart} title="Your Role" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.virtue_focus || "Focus on what you can control: your response, your boundaries."}
      </p>
    </StoicCard>,
    <StoicCard key="pattern" icon={Eye} title="Deeper Pattern" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response.surprise_or_tension || "This conflict may reveal something about your values."}
      </p>
    </StoicCard>,
    <StoicCard key="forward" icon={Sparkles} title="Path Forward" className="h-full flex flex-col">
      <p className="text-foreground font-medium text-sm flex-1">
        "{response.stance || "Seek first to understand, then to be understood."}"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/10 rounded-full mb-1">
              <Swords className="w-4 h-4 text-coral" />
              <span className="text-sm font-medium text-coral">Perspective Gained</span>
            </div>
            {situation && (
              <p className="text-xs text-muted-foreground mt-1 px-4 line-clamp-1">
                "{situation.slice(0, 50)}{situation.length > 50 ? '...' : ''}"
              </p>
            )}
          </div>
          
          <div className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <CardCarousel className="h-full">{cards}</CardCarousel>
          </div>
          
          <div className="py-4 shrink-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              New Conflict
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
