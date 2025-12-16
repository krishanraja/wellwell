import { useState, useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { CheckInTimeModal } from "@/components/wellwell/CheckInTimeModal";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useCrossSessionMemory } from "@/hooks/useCrossSessionMemory";
import { useProfile } from "@/hooks/useProfile";
import { Moon, TrendingUp, TrendingDown, Minus, Target, RotateCcw, Sunrise, Sparkles, X } from "lucide-react";

export default function Debrief() {
  const [reflection, setReflection] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("debrief");
  const { analyze, isLoading, response, reset, cancel } = useStoicAnalyzer();
  const { scoresMap } = useVirtueScores();
  const { todayMorning } = useCrossSessionMemory();
  const { profile } = useProfile();

  // Show time modal if user doesn't have evening debrief time set
  useEffect(() => {
    if (profile && !profile.evening_debrief_time && !showTimeModal) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowTimeModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile, showTimeModal]);

  const handleTranscript = async (text: string) => {
    setReflection(text);
    // Fix #4: Move usage tracking AFTER AI success
    const result = await analyze({
      tool: "debrief",
      input: JSON.stringify({
        controlled: text, // AI will parse and extract
        escaped: "",
        tomorrow: "",
        freeform: true, // Flag for AI to process as freeform
      }),
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
    setReflection("");
    reset();
  };

  // Get real virtue deltas from AI response or fallback to empty
  const virtueDeltas = response?.virtue_updates?.reduce((acc, update) => {
    acc[update.virtue as keyof typeof acc] = update.delta;
    return acc;
  }, { courage: 0, temperance: 0, justice: 0, wisdom: 0 }) || { courage: 0, temperance: 0, justice: 0, wisdom: 0 };

  // Get current virtue scores
  const currentVirtues = {
    courage: scoresMap.courage?.score || 50,
    temperance: scoresMap.temperance?.score || 50,
    justice: scoresMap.justice?.score || 50,
    wisdom: scoresMap.wisdom?.score || 50,
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-3 h-3 text-primary" />;
    if (delta < 0) return <TrendingDown className="w-3 h-3 text-coral" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  if (!response) {
    return (
      <>
        {ErrorModal}
        <Layout>
        <UsageLimitGate toolName="debrief">
          <CheckInTimeModal 
            open={showTimeModal} 
            onOpenChange={setShowTimeModal}
          />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Compact evening header */}
            <div className="text-center py-2 animate-fade-up shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cinder/10 rounded-full mb-2">
                <Moon className="w-4 h-4 text-cinder" />
                <span className="text-sm font-medium text-cinder">Evening Debrief</span>
              </div>
              
              {/* Evening wisdom - compact */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="text-foreground font-display text-base leading-snug mb-1">
                  "At day's end, review: Where did you act with virtue?"
                </p>
                <p className="text-muted-foreground text-xs">
                  — Marcus Aurelius
                </p>
              </div>
            </div>

            {/* Morning context if available - compact */}
            {todayMorning.challenge && (
              <div className="px-3 py-2 bg-muted/30 rounded-lg mb-2 animate-fade-up shrink-0" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                  <Sunrise className="w-3 h-3" />
                  <span>This morning you anticipated:</span>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">{todayMorning.challenge}</p>
                {todayMorning.stance && (
                  <p className="text-xs text-primary mt-0.5 line-clamp-1">Stance: "{todayMorning.stance}"</p>
                )}
              </div>
            )}

            {/* Voice-first input - centered in remaining space */}
            <div className="flex-1 flex flex-col justify-center min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-lg font-display font-semibold text-foreground mb-1">
                Reflect on your day
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-4">
                What did you control? What escaped you?
              </p>
              
              <div className="relative">
                <VoiceFirstInput
                  onTranscript={handleTranscript}
                  placeholder="Tap to reflect on your day"
                  processingText="Synthesizing your day..."
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
    );
  }

  const cards = [
    <StoicCard key="summary" icon={Moon} title="Day Summary" className="h-full flex flex-col">
      <p className="text-muted-foreground text-sm flex-1">
        {response?.summary || "You navigated today's challenges with awareness."}
      </p>
    </StoicCard>,
    <StoicCard key="virtues" icon={Target} title="Virtue Movement" className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {Object.entries(virtueDeltas).map(([virtue, delta]) => (
          <div key={virtue} className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded-lg">
            {getDeltaIcon(delta)}
            <span className="text-xs capitalize text-foreground">{virtue}</span>
            <span className={`text-xs ml-auto ${delta > 0 ? "text-primary" : delta < 0 ? "text-coral" : "text-muted-foreground"}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </div>
        ))}
      </div>
      <VirtueBar {...currentVirtues} compact />
    </StoicCard>,
    <StoicCard key="tomorrow" icon={Target} title="Tomorrow's Focus" className="h-full flex flex-col">
      <p className="text-foreground font-medium text-sm flex-1">
        "{response?.stance || "Carry today's lessons into tomorrow."}"
      </p>
      {response?.action && (
        <p className="text-xs text-primary mt-2">{response.action}</p>
      )}
    </StoicCard>,
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Compact header */}
        <div className="text-center py-2 animate-fade-up shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-1">
            <Moon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Debrief Complete</span>
          </div>
        </div>
        
        {/* Card carousel - takes remaining space */}
        <div className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <CardCarousel className="h-full">{cards}</CardCarousel>
        </div>
        
        {/* Reset button with proper bottom spacing */}
        <div className="py-4 shrink-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            New Debrief
          </Button>
        </div>
      </div>
    </Layout>
    </>
  );
}
