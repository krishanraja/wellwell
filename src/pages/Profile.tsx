import { Layout } from "@/components/wellwell/Layout";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { VirtueChart } from "@/components/wellwell/VirtueChart";
import { LoadingScreen } from "@/components/wellwell/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useStreak } from "@/hooks/useStreak";
import { useEvents } from "@/hooks/useEvents";
import { usePatterns } from "@/hooks/usePatterns";
import { Flame, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const toolLabels: Record<string, string> = {
  pulse: "Morning Pulse",
  intervene: "Intervene",
  debrief: "Evening Debrief",
  decision: "Decision Engine",
  conflict: "Conflict Copilot",
  onboarding: "Onboarding",
  weekly_reset: "Weekly Reset",
};

// Maximum loading time before showing page anyway (5 seconds)
const MAX_LOADING_TIME = 5000;

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { scoresMap, isLoading: virtuesLoading } = useVirtueScores();
  const { streak, isLoading: streakLoading } = useStreak();
  const { events, isLoading: eventsLoading } = useEvents();
  const { patterns, recommendedFocus } = usePatterns();
  const [forceShow, setForceShow] = useState(false);

  // Only require profile to be loaded - other data can load in background
  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (profileLoading) {
      const timer = setTimeout(() => {
        setForceShow(true);
      }, MAX_LOADING_TIME);
      return () => clearTimeout(timer);
    } else {
      setForceShow(false);
    }
  }, [profileLoading]);

  // Show loading only if profile is still loading and we haven't hit the timeout
  const isLoading = profileLoading && !forceShow;

  const virtues = {
    courage: scoresMap.courage?.score || 50,
    temperance: scoresMap.temperance?.score || 50,
    justice: scoresMap.justice?.score || 50,
    wisdom: scoresMap.wisdom?.score || 50,
  };

  const recentEvents = events.slice(0, 3);
  const topPattern = patterns[0];
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Stoic";

  // Show loading screen only if profile is critical and still loading
  // Allow page to render even if other data is still loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If we don't have a user, something is wrong - but ProtectedRoute should handle this
  if (!user) {
    return null;
  }

  // Get just the most recent event for inline display
  const lastEvent = recentEvents[0];

  return (
    <Layout>
      {/* CSS Grid layout with explicit row heights - guarantees no overflow */}
      <div 
        className="grid gap-2 h-full"
        style={{
          gridTemplateRows: 'auto auto 1fr auto',
          maxHeight: '100%',
        }}
      >
        {/* Row 1: Header - auto height */}
        <div className="flex items-center justify-between py-1">
          <h1 className="font-display text-lg font-bold text-foreground">
            {displayName}'s Journey
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-coral" />
              <span className="font-display text-base font-bold text-foreground">{streak}</span>
            </div>
            <button 
              onClick={() => navigate("/settings")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
              <ChevronRight className="w-3 h-3 inline ml-0.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Virtue balance - auto height */}
        <div className="p-2 glass-card">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Virtue Balance</p>
            {recommendedFocus && (
              <span className="text-[9px] text-primary font-medium capitalize px-1.5 py-0.5 bg-primary/10 rounded-full">
                Focus: {recommendedFocus}
              </span>
            )}
          </div>
          <VirtueBar {...virtues} compact />
        </div>

        {/* Row 3: Chart - takes remaining space (1fr), with explicit min/max */}
        <div className="p-2 glass-card flex flex-col overflow-hidden" style={{ minHeight: '100px' }}>
          <div className="flex items-center gap-1.5 mb-1 shrink-0">
            <TrendingUp className="w-3 h-3 text-primary" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">14-Day Trends</p>
          </div>
          <div className="flex-1 min-h-0">
            <VirtueChart days={14} compact />
          </div>
        </div>

        {/* Row 4: Bottom insight - auto height, single line */}
        <div className="p-2 glass-card bg-primary/5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-xs text-foreground truncate flex-1">
              {topPattern ? topPattern.title : (lastEvent ? `Last: ${toolLabels[lastEvent.tool_name] || lastEvent.tool_name}` : "Start your Stoic journey")}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
