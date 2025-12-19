import { useState, useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { StoicCard, StoicCardContent } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import WelcomeBackScreen from "@/components/wellwell/WelcomeBackScreen";
import { RitualTimeIndicator } from "@/components/wellwell/RitualTimeIndicator";
import { CheckInTimeModal } from "@/components/wellwell/CheckInTimeModal";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useNavigate } from "react-router-dom";
import { useContextualNudge } from "@/hooks/useContextualNudge";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useEvents } from "@/hooks/useEvents";
import { useStreak } from "@/hooks/useStreak";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  RotateCcw,
  Target,
  Shield,
  Compass,
  Flame,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Local storage key to track if welcome has been shown (Fix #10: Persist across sessions)
const WELCOME_SHOWN_KEY = 'wellwell_welcome_shown';

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  
  // Check localStorage to see if welcome was already shown (Fix #10)
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SHOWN_KEY) !== 'true';
  });
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
  
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("unified");
  const { analyze, isLoading, response, reset, cancel } = useStoicAnalyzer();
  const { events, isLoading: eventsLoading } = useEvents();
  const { streak } = useStreak();
  const { profile, isLoading: profileLoading } = useProfile();
  
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Only show welcome for returning users on first load of the session
  useEffect(() => {
    if (!eventsLoading && isFirstLoad) {
      if (events.length === 0) {
        // New user - skip welcome
        setShowWelcome(false);
      }
      setIsFirstLoad(false);
    }
  }, [eventsLoading, events.length, isFirstLoad]);

  // Mark welcome as shown when it completes (Fix #10: Use localStorage)
  const handleWelcomeComplete = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setShowWelcome(false);
  };

  const handleTranscript = async (text: string) => {
    setInput(text);
    // Fix #4: Move usage tracking AFTER AI success
    const result = await analyze({
      tool: primaryNudge.type === 'freeform' ? 'unified' : primaryNudge.type,
      input: text,
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
    setInput("");
    reset();
  };

  const handleSecondaryNudge = (route: string) => {
    navigate(route);
  };

  // Welcome screen for returning users - only on first session load
  if (showWelcome && isReturningUser) {
    return (
      <>
        {ErrorModal}
        <WelcomeBackScreen onComplete={handleWelcomeComplete} />
      </>
    );
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

  // Main contextual home view - CSS Grid for guaranteed no-scroll layout
  return (
    <>
      {ErrorModal}
      <Layout showGreeting={false}>
        <UsageLimitGate toolName="unified">
          {/* CSS Grid with explicit row sizing - guarantees no overflow */}
          <div 
            className="grid gap-2 h-full"
            style={{
              gridTemplateRows: secondaryNudges.length > 0 ? 'auto auto 1fr auto' : 'auto auto 1fr',
              maxHeight: '100%',
            }}
          >
            {/* Row 1: Header - auto height */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-0.5">
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

            {/* Row 2: Ritual Indicators - auto height */}
            <RitualTimeIndicator
              hasCompletedPulseToday={hasCompletedPulseToday}
              hasCompletedDebriefToday={hasCompletedDebriefToday}
              onSetTimeClick={() => setShowTimeModal(true)}
            />
            
            {/* Check-in Time Modal */}
            <CheckInTimeModal 
              open={showTimeModal} 
              onOpenChange={setShowTimeModal}
            />

            {/* Row 3: Primary Action Card - takes remaining space (1fr) */}
            <div 
              className="p-3 rounded-2xl border-2 flex flex-col overflow-hidden"
              style={{ 
                borderColor: `${primaryNudge.accentColor}40`,
                background: `linear-gradient(135deg, ${primaryNudge.accentColor}10 0%, ${primaryNudge.accentColor}05 50%, transparent 100%)`,
                minHeight: '120px',
              }}
            >
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <div 
                  className="p-1.5 rounded-xl"
                  style={{ backgroundColor: `${primaryNudge.accentColor}20` }}
                >
                  <PrimaryIcon className="w-4 h-4" style={{ color: primaryNudge.accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-base font-bold text-foreground leading-tight">
                    {primaryNudge.headline}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {primaryNudge.subtext}
                  </p>
                </div>
              </div>
              
              {/* Voice input - fills remaining card space */}
              <div className="flex-1 min-h-0 flex flex-col relative">
                <VoiceFirstInput
                  onTranscript={handleTranscript}
                  placeholder={primaryNudge.placeholder}
                  processingText={primaryNudge.processingText}
                  isProcessing={isLoading}
                  className="flex-1 min-h-0"
                />
                {isLoading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancel}
                    className="absolute top-1 right-1 z-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Row 4: Secondary Options - auto height, compact grid */}
            {secondaryNudges.length > 0 && (
              <div>
                <div className="grid grid-cols-3 gap-1">
                  {secondaryNudges.map((nudge) => {
                    const NudgeIcon = nudge.icon;
                    return (
                      <button
                        key={nudge.type}
                        onClick={() => handleSecondaryNudge(nudge.route)}
                        className={cn(
                          "flex items-center gap-1.5 py-1.5 px-2 rounded-lg border border-border/50 bg-card/50",
                          "hover:bg-card hover:border-border transition-all active:scale-[0.98]"
                        )}
                      >
                        <div 
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${nudge.accentColor}20` }}
                        >
                          <NudgeIcon 
                            className="w-3 h-3" 
                            style={{ color: nudge.accentColor }} 
                          />
                        </div>
                        <span className="text-[10px] font-medium text-foreground truncate">
                          {nudge.headline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </UsageLimitGate>
      </Layout>
    </>
  );
}
