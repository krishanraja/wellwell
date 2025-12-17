import { useState, useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { CheckInTimeModal } from "@/components/wellwell/CheckInTimeModal";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useCrossSessionMemory } from "@/hooks/useCrossSessionMemory";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { getPersonalizedStance } from "@/data/dailyStances";
import { Sunrise, Target, Shield, Compass, RotateCcw, Quote, X } from "lucide-react";

export default function Pulse() {
  const [challenge, setChallenge] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("pulse");
  const { analyze, isLoading, response, reset, cancel } = useStoicAnalyzer();
  const { yesterday } = useCrossSessionMemory();
  const { profile } = useProfile();
  const { scoresMap } = useVirtueScores();

  // Show time modal if user doesn't have morning pulse time set
  useEffect(() => {
    if (profile && !profile.morning_pulse_time && !showTimeModal) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowTimeModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile, showTimeModal]);

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
    // Fix #4: Move usage tracking AFTER AI success
    const result = await analyze({
      tool: "pulse",
      input: text,
      onError: showError,
    });
    
    // Only track usage if analysis succeeded
    if (result) {
      try {
        await trackUsage();
      } catch (err) {
        // Usage tracking failure shouldn't block the user
        console.warn("Failed to track usage", err);
      }
    }
  };

  const handleReset = () => {
    setChallenge("");
    reset();
  };

  if (!response) {
    return (
      <>
        {ErrorModal}
        <Layout>
        <UsageLimitGate toolName="pulse">
          <CheckInTimeModal 
            open={showTimeModal} 
            onOpenChange={setShowTimeModal}
          />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Compact header with wisdom */}
            <div className="text-center py-2 animate-fade-up shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-2">
                <Sunrise className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Morning Pulse</span>
              </div>
              
              {/* Today's wisdom - more compact */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Quote className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Today's Stance</span>
                </div>
                <p className="text-foreground font-display text-base leading-snug">
                  "{personalizedStance.stance}"
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                  {personalizedStance.virtue}
                </span>
              </div>
            </div>

            {/* Yesterday's context if available - compact */}
            {yesterday.challenge && (
              <div className="px-3 py-2 bg-muted/30 rounded-lg mb-2 animate-fade-up shrink-0" style={{ animationDelay: "50ms" }}>
                <p className="text-xs text-muted-foreground mb-0.5">Yesterday:</p>
                <p className="text-sm text-foreground/80 line-clamp-2">{yesterday.challenge}</p>
              </div>
            )}

            {/* Voice-first input - centered in remaining space */}
            <div className="flex-1 flex flex-col justify-center min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-center text-lg font-display font-semibold text-foreground mb-1">
                What might challenge you today?
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Speak freely — I'll find the Stoic wisdom within
              </p>
              
              <div className="relative">
                <VoiceFirstInput
                  onTranscript={handleTranscript}
                  placeholder="Tap to speak your challenge"
                  processingText="Finding your Stoic stance..."
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
      <p className="text-foreground font-medium text-sm flex-1">
        "{response.stance || "I will enter with clarity and listen with intention."}"
      </p>
      {response.action && (
        <div className="mt-2">
          <ActionChip action={response.action} duration="3s" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-1">
              <Sunrise className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Stance</span>
            </div>
            {challenge && (
              <p className="text-xs text-muted-foreground mt-1 px-4 line-clamp-1">
                "{challenge.slice(0, 50)}{challenge.length > 50 ? '...' : ''}"
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
              New Challenge
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
}
