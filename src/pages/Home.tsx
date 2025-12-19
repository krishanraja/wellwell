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
import { useErrorModal } from "@/components/wellwell/ErrorModal";
import { useContextualNudge } from "@/hooks/useContextualNudge";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useEvents } from "@/hooks/useEvents";
import { useStreak } from "@/hooks/useStreak";
import { RotateCcw, Target, Shield, Compass, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Daily Stoic quotes for inspiration
const stoicQuotes = [
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "It is not things that disturb us, but our judgments about things.", author: "Epictetus" },
  { text: "Begin at once to live, and count each day as a separate life.", author: "Seneca" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
];

// Local storage key to track if welcome has been shown (Fix #10: Persist across sessions)
const WELCOME_SHOWN_KEY = 'wellwell_welcome_shown';

export default function Home() {
  const [input, setInput] = useState("");
  const [voiceInputKey, setVoiceInputKey] = useState(0); // Key to force VoiceFirstInput remount
  
  // Check localStorage to see if welcome was already shown (Fix #10)
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SHOWN_KEY) !== 'true';
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const { 
    primaryNudge, 
    greeting, 
    contextMessage,
    isReturningUser,
    hasCompletedPulseToday,
    hasCompletedDebriefToday,
  } = useContextualNudge();
  
  const { showError, ErrorModal } = useErrorModal();
  const { trackUsage } = useUsageLimit("unified");
  const { analyze, isLoading, response, reset, cancel } = useStoicAnalyzer();
  const { events, isLoading: eventsLoading } = useEvents();
  const { streak } = useStreak();
  
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
    setVoiceInputKey(prev => prev + 1); // Force VoiceFirstInput to remount with fresh state
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

  // Get daily quote based on date (changes daily)
  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return stoicQuotes[dayOfYear % stoicQuotes.length];
  }, []);

  // Main contextual home view - World-class design
  return (
    <>
      {ErrorModal}
      <Layout showGreeting={false}>
        <UsageLimitGate toolName="unified">
          {/* Elegant vertical layout - guaranteed to fit */}
          <div className="flex flex-col h-full">
            
            {/* Top Section: Warm greeting with streak */}
            <div className="shrink-0 text-center pt-2 pb-4">
              {/* Streak badge */}
              {streak >= 2 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-coral/10 rounded-full mb-2 animate-flame">
                  <Flame className="w-4 h-4 text-coral" />
                  <span className="text-sm font-semibold text-coral">{streak} day streak</span>
                </div>
              )}
              
              {/* Large warm greeting */}
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                {greeting}
              </h1>
              <p className="text-sm text-muted-foreground">
                {contextMessage}
              </p>
            </div>

            {/* Middle Section: Voice input - takes remaining space */}
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
                  placeholder="Speak freely"
                  processingText="Finding your wisdom..."
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

            {/* Bottom Section: Compact toolbar - fixed height */}
            <div className="shrink-0 py-3 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Ritual chips */}
                <RitualTimeIndicator
                  hasCompletedPulseToday={hasCompletedPulseToday}
                  hasCompletedDebriefToday={hasCompletedDebriefToday}
                  onSetTimeClick={() => setShowTimeModal(true)}
                />
                
                <span className="text-muted-foreground/30">•</span>
                
                {/* Quick Tools expandable */}
                <QuickToolsSheet />
              </div>
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
