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

  // Default home view with unified input
  return (
    <Layout showGreeting className="gap-4">
      <UsageLimitGate toolName="unified">
        {/* Unified Voice Input */}
        <OnboardingTooltip
          title="Speak your mind"
          description="Tap the microphone and share what's on your mind. I'll find the right Stoic wisdom for you."
          isActive={currentStep === "voiceInput"}
          onDismiss={() => markSeen("voiceInput")}
          onSkipAll={skipAll}
          position="bottom"
        >
          <div className="shrink-0">
            <div className="text-center mb-2">
              <h2 className="text-lg font-display font-semibold text-foreground">
                What's on your mind?
              </h2>
              <p className="text-sm text-muted-foreground">
                Speak freely — I'll find the wisdom you need
              </p>
            </div>
            
            <VoiceFirstInput
              onTranscript={handleTranscript}
              placeholder="Tap to speak"
              processingText="Finding your Stoic truth..."
              isProcessing={isLoading}
              className="py-4"
            />
          </div>
        </OnboardingTooltip>

        {/* Recent Insights Feed */}
        <OnboardingTooltip
          title="Your wisdom journey"
          description="Every insight you receive is saved here. Tap to revisit your past reflections."
          isActive={currentStep === "insights"}
          onDismiss={() => markSeen("insights")}
          onSkipAll={skipAll}
          position="top"
        >
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Recent Insights
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
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentInsights.length > 0 ? (
              <div className="space-y-2">
                {recentInsights.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate("/history")}
                    className="w-full text-left p-3 bg-card/50 border border-border/50 rounded-xl hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">
                          {formatRawInputForDisplay(event.raw_input)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.created_at), "MMM d, h:mm a")}
                          </span>
                          <span className="text-xs text-primary capitalize">
                            {event.tool_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">
                  Your insights will appear here after your first reflection
                </p>
              </div>
            )}
          </div>
        </OnboardingTooltip>

        {/* Compact Virtue Balance */}
        <OnboardingTooltip
          title="Track your growth"
          description="See how your virtues evolve with each reflection. Tap 'Journey' to view your full progress."
          isActive={currentStep === "virtueBalance"}
          onDismiss={() => markSeen("virtueBalance")}
          onSkipAll={skipAll}
          position="top"
        >
          <div className="shrink-0 mt-auto">
            <StoicCard variant="glass" className="p-4">
              <div className="flex items-center justify-between mb-3">
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
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-2 bg-muted rounded-full animate-pulse" />
                  ))}
                </div>
              ) : (
                <VirtueBar {...virtues} compact />
              )}
            </StoicCard>
          </div>
        </OnboardingTooltip>
      </UsageLimitGate>
    </Layout>
  );
}
