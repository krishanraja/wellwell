import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { IntensitySlider } from "@/components/wellwell/IntensitySlider";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { Flame, ArrowRight, RefreshCw, Target, Shield, RotateCcw, Loader2 } from "lucide-react";

export default function Intervene() {
  const [trigger, setTrigger] = useState("");
  const [intensity, setIntensity] = useState(5);
  const { trackUsage } = useUsageLimit("intervene");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();

  const handleSubmit = async () => {
    if (trigger.trim()) {
      await trackUsage();
      await analyze({
        tool: "intervene",
        input: JSON.stringify({ trigger, intensity }),
      });
    }
  };

  const handleReset = () => {
    setTrigger("");
    setIntensity(5);
    reset();
  };

  if (!response) {
    return (
      <Layout>
        <UsageLimitGate toolName="intervene">
          <div className="flex-1 flex flex-col">
            <div className="text-center py-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral/10 rounded-full mb-3">
                <Flame className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-coral">Intervene</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">What triggered you?</h1>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6 py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <MicroInput 
                placeholder="e.g., An email that made me furious" 
                value={trigger} 
                onChange={(e) => setTrigger(e.target.value)} 
              />
              <div>
                <p className="text-sm text-muted-foreground mb-3">Intensity: <span className="text-foreground font-medium">{intensity}/10</span></p>
                <IntensitySlider value={intensity} onChange={setIntensity} />
              </div>
            </div>
            <div className="py-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <Button 
                variant="brand" 
                size="lg" 
                className="w-full" 
                onClick={handleSubmit} 
                disabled={!trigger.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recalibrating...
                  </>
                ) : (
                  <>
                    Recalibrate
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
            <span className="text-sm font-medium text-coral">Recalibrating</span>
          </div>
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
