import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { StoicCard, StoicCardContent } from "@/components/wellwell/StoicCard";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { OnboardingTooltip } from "@/components/wellwell/OnboardingTooltip";
import { useNavigate } from "react-router-dom";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useEvents } from "@/hooks/useEvents";
import { useOnboarding } from "@/hooks/useOnboarding";
import { formatRawInputForDisplay } from "@/lib/formatRawInput";
import { 
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  Target,
  Shield,
  Compass,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const { trackUsage } = useUsageLimit("unified");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();
  const { scoresMap, isLoading: virtuesLoading } = useVirtueScores();
  const { events, isLoading: eventsLoading } = useEvents();
  const { currentStep, markSeen, skipAll } = useOnboarding();
  
  const recentInsights = events?.slice(0, 3) || [];
  
  const virtues = {
    courage: scoresMap?.courage?.score ?? 50,
    temperance: scoresMap?.temperance?.score ?? 50,
    justice: scoresMap?.justice?.score ?? 50,
    wisdom: scoresMap?.wisdom?.score ?? 50,
  };

  const handleTranscript = async (text: string) => {
    setInput(text);
    await trackUsage();
    await analyze({
      tool: "unified",
      input: text,
    });
  };

  const handleReset = () => {
    setInput("");
    reset();
  };

  // Show response view
  if (response) {
    const cards = [
      <StoicCard key="control" icon={Target} title="What's Yours" className="h-full flex flex-col">
        <p className="text-muted-foreground text-sm flex-1">
          {response.control_map || "Focus on what you can control: your response, your effort, your composure."}
        </p>
      </StoicCard>,
      <StoicCard key="virtue" icon={Shield} title="Lead With" className="h-full flex flex-col">
        <p className="text-muted-foreground text-sm flex-1">
          {response.virtue_focus || "Lead with clarity and intention."}
        </p>
        {response.virtue_updates?.[0] && (
          <p className="text-foreground font-medium text-sm mt-2">
            Virtue: <span className="text-primary capitalize">{response.virtue_updates[0].virtue}</span>
          </p>
        )}
      </StoicCard>,
      <StoicCard key="stance" icon={Compass} title="Your Stance" className="h-full flex flex-col">
        <p className="text-foreground font-medium text-sm flex-1">
          "{response.stance || "I will enter with clarity and act with intention."}"
        </p>
        {response.action && (
          <div className="mt-2">
            <ActionChip action={response.action} duration="Now" />
          </div>
        )}
      </StoicCard>,
    ];

    return (
      <Layout showGreeting={false}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Compact header */}
          <div className="text-center py-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Insight</span>
            </div>
            {input && (
              <p className="text-xs text-muted-foreground mt-1 px-4 line-clamp-1">
                "{input.slice(0, 60)}{input.length > 60 ? '...' : ''}"
              </p>
            )}
          </div>
          
          {/* Card carousel */}
          <div className="flex-1 min-h-0">
            <CardCarousel className="h-full">{cards}</CardCarousel>
          </div>
          
          {/* Reset button */}
          <div className="py-3 shrink-0">
            <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Ask something else
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Limit to 2 recent insights for compact view
  const displayInsights = recentInsights.slice(0, 2);

  // Default home view with unified input
  return (
    <Layout showGreeting>
      <UsageLimitGate toolName="unified">
        <div className="flex flex-col h-full overflow-hidden gap-3">
          {/* Unified Voice Input - compact */}
          <OnboardingTooltip
            title="Speak your mind"
            description="Tap the microphone and share what's on your mind. I'll find the right Stoic wisdom for you."
            isActive={currentStep === "voiceInput"}
            onDismiss={() => markSeen("voiceInput")}
            onSkipAll={skipAll}
            position="bottom"
          >
            <div className="shrink-0">
              <div className="text-center mb-1">
                <h2 className="text-base font-display font-semibold text-foreground">
                  What's on your mind?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Speak freely — I'll find the wisdom you need
                </p>
              </div>
              
              <VoiceFirstInput
                onTranscript={handleTranscript}
                placeholder="Tap to speak"
                processingText="Finding your Stoic truth..."
                isProcessing={isLoading}
                className="py-3"
              />
            </div>
          </OnboardingTooltip>

          {/* Recent Insights Feed - limited to 2 */}
          <OnboardingTooltip
            title="Your wisdom journey"
            description="Every insight you receive is saved here. Tap to revisit your past reflections."
            isActive={currentStep === "insights"}
            onDismiss={() => markSeen("insights")}
            onSkipAll={skipAll}
            position="top"
          >
            <div className="shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Insights
                </p>
                <button 
                  onClick={() => navigate("/history")} 
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                >
                  See all
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              
              {eventsLoading ? (
                <div className="space-y-1.5">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : displayInsights.length > 0 ? (
                <div className="space-y-1.5">
                  {displayInsights.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => navigate("/history")}
                      className="w-full text-left p-2.5 bg-card/50 border border-border/50 rounded-lg hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                          <Sparkles className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-clamp-1">
                            {formatRawInputForDisplay(event.raw_input)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">
                    Your insights will appear here after your first reflection
                  </p>
                </div>
              )}
            </div>
          </OnboardingTooltip>

          {/* Compact Virtue Balance - pushed to bottom */}
          <OnboardingTooltip
            title="Track your growth"
            description="See how your virtues evolve with each reflection. Tap 'Journey' to view your full progress."
            isActive={currentStep === "virtueBalance"}
            onDismiss={() => markSeen("virtueBalance")}
            onSkipAll={skipAll}
            position="top"
          >
            <div className="shrink-0 mt-auto">
              <StoicCard variant="glass" className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Virtue Balance
                  </p>
                  <button 
                    onClick={() => navigate("/profile")} 
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    Journey
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                
                {virtuesLoading ? (
                  <div className="space-y-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1.5 bg-muted rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <VirtueBar {...virtues} compact />
                )}
              </StoicCard>
            </div>
          </OnboardingTooltip>
        </div>
      </UsageLimitGate>
    </Layout>
  );
}
