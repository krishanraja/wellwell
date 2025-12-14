import { useState, useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { StoicCard, StoicCardContent } from "@/components/wellwell/StoicCard";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { HorizontalScroll } from "@/components/wellwell/HorizontalScroll";
import WelcomeBackScreen from "@/components/wellwell/WelcomeBackScreen";
import { useNavigate } from "react-router-dom";
import { useContextualNudge } from "@/hooks/useContextualNudge";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useEvents } from "@/hooks/useEvents";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  Target,
  Shield,
  Compass,
  Flame,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const { 
    primaryNudge, 
    secondaryNudges, 
    greeting, 
    contextMessage,
    isReturningUser,
    hasCompletedPulseToday,
    hasCompletedDebriefToday,
    streakMessage,
    timeContext,
  } = useContextualNudge();
  
  const { trackUsage } = useUsageLimit("unified");
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();
  const { scoresMap, isLoading: virtuesLoading } = useVirtueScores();
  const { events, isLoading: eventsLoading } = useEvents();
  const { streak } = useStreak();
  
  const virtues = {
    courage: scoresMap?.courage?.score ?? 50,
    temperance: scoresMap?.temperance?.score ?? 50,
    justice: scoresMap?.justice?.score ?? 50,
    wisdom: scoresMap?.wisdom?.score ?? 50,
  };

  // Only show welcome for returning users on first load
  useEffect(() => {
    if (!eventsLoading && isFirstLoad) {
      if (events.length === 0) {
        // New user - skip welcome
        setShowWelcome(false);
      }
      setIsFirstLoad(false);
    }
  }, [eventsLoading, events.length, isFirstLoad]);

  const handleTranscript = async (text: string) => {
    setInput(text);
    await trackUsage();
    await analyze({
      tool: primaryNudge.type === 'freeform' ? 'unified' : primaryNudge.type,
      input: text,
    });
  };

  const handleReset = () => {
    setInput("");
    reset();
  };

  const handleSecondaryNudge = (route: string) => {
    navigate(route);
  };

  // Welcome screen for returning users
  if (showWelcome && isReturningUser) {
    return <WelcomeBackScreen onComplete={() => setShowWelcome(false)} />;
  }

  // Response view after AI analysis
  if (response) {
    const PrimaryIcon = primaryNudge.icon;
    
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
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-1"
              style={{ backgroundColor: `${primaryNudge.accentColor}20` }}
            >
              <PrimaryIcon className="w-4 h-4" style={{ color: primaryNudge.accentColor }} />
              <span className="text-sm font-medium" style={{ color: primaryNudge.accentColor }}>
                Your Insight
              </span>
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
              Continue practicing
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const PrimaryIcon = primaryNudge.icon;

  // Main contextual home view
  return (
    <Layout showGreeting={false}>
      <UsageLimitGate toolName="unified">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header with greeting and context */}
          <div className="shrink-0 pt-2 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display text-xl font-bold text-foreground">
                {greeting}
              </h1>
              {streak >= 2 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-coral/10 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-coral" />
                  <span className="text-xs font-semibold text-coral">{streak}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{contextMessage}</p>
          </div>

          {/* Daily Progress Indicators */}
          {(timeContext === 'evening' || timeContext === 'night' || hasCompletedPulseToday) && (
            <div className="shrink-0 flex gap-2 mb-4">
              <div 
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                  hasCompletedPulseToday 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-muted/30 border-border/50"
                )}
              >
                {hasCompletedPulseToday ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  hasCompletedPulseToday ? "text-primary" : "text-muted-foreground"
                )}>
                  Morning Pulse
                </span>
              </div>
              <div 
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                  hasCompletedDebriefToday 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-muted/30 border-border/50"
                )}
              >
                {hasCompletedDebriefToday ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  hasCompletedDebriefToday ? "text-primary" : "text-muted-foreground"
                )}>
                  Evening Debrief
                </span>
              </div>
            </div>
          )}

          {/* PRIMARY ACTION - The main contextual nudge */}
          <div className="shrink-0 mb-4">
            <div 
              className="p-4 rounded-2xl border-2 transition-all"
              style={{ 
                borderColor: `${primaryNudge.accentColor}40`,
                background: `linear-gradient(135deg, ${primaryNudge.accentColor}08 0%, transparent 100%)`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: `${primaryNudge.accentColor}20` }}
                >
                  <PrimaryIcon className="w-5 h-5" style={{ color: primaryNudge.accentColor }} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {primaryNudge.headline}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {primaryNudge.subtext}
                  </p>
                </div>
              </div>
              
              <VoiceFirstInput
                onTranscript={handleTranscript}
                placeholder={primaryNudge.placeholder}
                processingText={primaryNudge.processingText}
                isProcessing={isLoading}
                className="py-2"
              />
            </div>
          </div>

          {/* SECONDARY OPTIONS - Quick access to other tools */}
          {secondaryNudges.length > 0 && (
            <div className="shrink-0 mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Or choose a specific situation
              </p>
              <HorizontalScroll className="pb-1 -mx-4 px-4">
                {secondaryNudges.map((nudge) => {
                  const NudgeIcon = nudge.icon;
                  return (
                    <button
                      key={nudge.type}
                      onClick={() => handleSecondaryNudge(nudge.route)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-card/50",
                        "hover:bg-card hover:border-border transition-all whitespace-nowrap shrink-0"
                      )}
                    >
                      <NudgeIcon 
                        className="w-4 h-4" 
                        style={{ color: nudge.accentColor }} 
                      />
                      <span className="text-sm font-medium text-foreground">
                        {nudge.headline}
                      </span>
                    </button>
                  );
                })}
              </HorizontalScroll>
            </div>
          )}

          {/* Virtue Balance - pushed to bottom with breathing space */}
          <div className="mt-auto shrink-0 pb-2">
            <StoicCard variant="glass" className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Virtues
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
        </div>
      </UsageLimitGate>
    </Layout>
  );
}
