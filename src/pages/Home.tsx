import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { VoiceFirstInput } from "@/components/wellwell/VoiceFirstInput";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import WelcomeBackScreen from "@/components/wellwell/WelcomeBackScreen";
import { RitualTimeIndicator } from "@/components/wellwell/RitualTimeIndicator";
import { CheckInTimeModal } from "@/components/wellwell/CheckInTimeModal";
import { QuickToolsSheet } from "@/components/wellwell/QuickToolsSheet";
import { ActionFollowUp } from "@/components/wellwell/ActionFollowUp";
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useContextualNudge } from "@/hooks/useContextualNudge";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useEvents } from "@/hooks/useEvents";
import { useStreak } from "@/hooks/useStreak";
import { usePendingActions } from "@/hooks/usePendingActions";
import { useAuth } from "@/hooks/useAuth";
import { RotateCcw, Target, Shield, Compass, Flame, X, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Daily Stoic quotes for inspiration - primary source material
const stoicQuotes = [
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "It is not things that disturb us, but our judgments about things.", author: "Epictetus" },
  { text: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "If an evil has been pondered beforehand, the blow is gentle when it comes.", author: "Seneca" },
];

// Local storage key to track if welcome has been shown
const WELCOME_SHOWN_KEY = 'wellwell_welcome_shown';

export default function Home() {
  // ALL HOOKS CALLED FIRST, BEFORE ANY CONDITIONAL LOGIC
  // This ensures hooks are always called in the same order, preventing React Error #300
  
  // Auth state - used for loading guard
  const { user, loading: authLoading } = useAuth();
  
  // State hooks
  const [input, setInput] = useState("");
  const [voiceInputKey, setVoiceInputKey] = useState(0);
  const [hasCommitted, setHasCommitted] = useState(false);
  
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SHOWN_KEY) !== 'true';
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Data hooks - all called unconditionally
  const { 
    primaryNudge, 
    greeting, 
    isReturningUser,
    hasCompletedPulseToday,
    hasCompletedDebriefToday,
    daysSinceLastUse,
  } = useContextualNudge();
  
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("unified");
  const { analyze, isLoading, response, reset, cancel } = useStoicAnalyzer();
  const { events, isLoading: eventsLoading } = useEvents();
  const { streak } = useStreak();
  const { 
    pendingAction, 
    shouldShowFollowUp, 
    commitAction, 
    dismissFollowUp, 
    completeAction 
  } = usePendingActions();
  
  const [showTimeModal, setShowTimeModal] = useState(false);
  
  // Effect for welcome screen logic - MUST be before any early returns
  // Welcome screen shows on EVERY login (once per day) with rotating mini-activities
  useEffect(() => {
    if (!eventsLoading && isFirstLoad) {
      // Check if welcome was already shown today
      const lastWelcomeDate = localStorage.getItem('wellwell_welcome_date');
      const today = new Date().toDateString();
      
      // Always show welcome on first visit of the day
      if (lastWelcomeDate !== today) {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }
      
      setIsFirstLoad(false);
    }
  }, [eventsLoading, isFirstLoad]);
  
  // Get daily quote based on date - MUST be before any early returns
  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return stoicQuotes[dayOfYear % stoicQuotes.length];
  }, []);
  
  // Loading guard: Don't render content until user is fully available
  // This prevents hooks violations during auth state transitions
  if (authLoading || !user) {
    return (
      <Layout showGreeting={false}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const handleWelcomeComplete = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    localStorage.setItem('wellwell_welcome_date', new Date().toDateString());
    setShowWelcome(false);
  };

  const handleTranscript = async (text: string) => {
    setInput(text);
    setHasCommitted(false);
    const result = await analyze({
      tool: primaryNudge.type === 'freeform' ? 'unified' : primaryNudge.type,
      input: text,
      onError: showError,
    });
    
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
    setHasCommitted(false);
    reset();
    setVoiceInputKey(prev => prev + 1);
  };

  const handleCommitAction = () => {
    setHasCommitted(true);
    // Store the committed action for follow-up using the hook
    if (response?.action) {
      commitAction({
        action: response.action,
        committedAt: new Date().toISOString(),
        input: input,
        virtue: response.virtue_updates?.[0]?.virtue || 'wisdom',
      });
    }
  };

  // Welcome screen with rotating mini-activities - shows daily
  if (showWelcome) {
    return (
      <>
        {ErrorModal}
        <WelcomeBackScreen 
          onComplete={handleWelcomeComplete} 
          daysSinceLastUse={daysSinceLastUse}
        />
      </>
    );
  }

  // Response view after AI analysis
  if (response) {
    const PrimaryIcon = primaryNudge.icon;
    
    // Action-First View: Show action prominently before other cards
    if (response.action && !hasCommitted) {
      return (
        <Layout showGreeting={false}>
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="text-center py-3 shrink-0">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                style={{ backgroundColor: `${primaryNudge.accentColor}20` }}
              >
                <PrimaryIcon className="w-4 h-4" style={{ color: primaryNudge.accentColor }} />
                <span className="text-sm font-medium" style={{ color: primaryNudge.accentColor }}>
                  Your One Action
                </span>
              </div>
              <p className="text-xs text-muted-foreground px-4 line-clamp-1">
                "{input.slice(0, 50)}{input.length > 50 ? '...' : ''}"
              </p>
            </div>
            
            {/* Action Card - Prominent */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
              <div className="action-commit-card w-full max-w-sm animate-scale-in">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Do This Now</p>
                      <p className="text-xs text-primary capitalize">{response.virtue_updates?.[0]?.virtue || 'Wisdom'} in action</p>
                    </div>
                  </div>
                  
                  <p className="text-base font-medium text-foreground leading-relaxed mb-6">
                    {response.action}
                  </p>
                  
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleCommitAction}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    I'll do this
                  </Button>
                </div>
              </div>
              
              {/* Skip option */}
              <button
                onClick={() => setHasCommitted(true)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Show me the full insight →
              </button>
            </div>
          </div>
        </Layout>
      );
    }
    
    // Full insight view (after commitment or if no action)
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
            {hasCommitted && response.action && (
              <p className="text-xs text-primary mt-1 px-4">
                ✓ Committed to action
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

  // Main home view
  return (
    <>
      {ErrorModal}
      
      {/* Action Follow-Up Modal */}
      {shouldShowFollowUp && pendingAction && (
        <ActionFollowUp
          pendingAction={pendingAction}
          onComplete={completeAction}
          onDismiss={dismissFollowUp}
        />
      )}
      
      <Layout showGreeting={false}>
        <UsageLimitGate toolName="unified">
          <div className="flex flex-col h-full">
            
            {/* Top Section: Greeting with streak */}
            <div className="shrink-0 text-center pt-2 pb-4">
              {/* Streak badge */}
              {streak >= 2 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-coral/10 rounded-full mb-2 animate-flame">
                  <Flame className="w-4 h-4 text-coral" />
                  <span className="text-sm font-semibold text-coral">{streak} day streak</span>
                </div>
              )}
              
              {/* Warm greeting */}
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                {greeting}
              </h1>
              <p className="text-sm text-muted-foreground">
                What needs your clarity right now?
              </p>
            </div>

            {/* Middle Section: Voice input */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative">
              {/* Inspirational quote */}
              <div className="absolute top-0 left-0 right-0 text-center px-4">
                <p className="text-sm text-muted-foreground/80 italic">
                  "{dailyQuote.text}"
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  — {dailyQuote.author}
                </p>
              </div>
              
              {/* Voice input - centered */}
              <div className="flex-1 flex items-center justify-center w-full px-4">
                <VoiceFirstInput
                  key={voiceInputKey}
                  onTranscript={handleTranscript}
                  onError={showError}
                  placeholder="Tap to speak"
                  processingText="Finding your clarity..."
                  isProcessing={isLoading}
                  className="w-full max-w-xs"
                />
              </div>
              
              {/* Cancel button during processing */}
              {isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancel}
                  className="absolute bottom-4 right-4"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>

            {/* Bottom Section: Philosophy credential + ritual indicators */}
            <div className="shrink-0 py-3 border-t border-border/30">
              {/* Philosophy credential */}
              <p className="text-[10px] text-center text-muted-foreground/60 mb-2">
                Trained on 2000 years of Stoic philosophy • Tuned for modern challenges
              </p>
              
              <div className="flex items-center justify-center">
                {/* Ritual chips */}
                <RitualTimeIndicator
                  hasCompletedPulseToday={hasCompletedPulseToday}
                  hasCompletedDebriefToday={hasCompletedDebriefToday}
                  onSetTimeClick={() => setShowTimeModal(true)}
                />
              </div>
            </div>
            
            {/* Quick Tools - Left side floating trigger */}
            <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
              <QuickToolsSheet />
            </div>
            
            {/* Check-in Time Modal */}
            <CheckInTimeModal 
              open={showTimeModal} 
              onOpenChange={setShowTimeModal}
            />
          </div>
        </UsageLimitGate>
      </Layout>
    </>
  );
}
