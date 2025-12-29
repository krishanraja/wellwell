import { Layout } from "@/components/wellwell/Layout";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { LoadingScreen } from "@/components/wellwell/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useStreak } from "@/hooks/useStreak";
import { useEvents } from "@/hooks/useEvents";
import { usePatterns } from "@/hooks/usePatterns";
import { Flame, Lightbulb, ChevronRight, TrendingUp, Settings } from "lucide-react";
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
  const { scoresMap } = useVirtueScores();
  const { streak } = useStreak();
  const { events } = useEvents();
  const { patterns, recommendedFocus } = usePatterns();
  const [forceShow, setForceShow] = useState(false);

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

  const isLoading = profileLoading && !forceShow;

  const virtues = {
    courage: scoresMap.courage?.score || 50,
    temperance: scoresMap.temperance?.score || 50,
    justice: scoresMap.justice?.score || 50,
    wisdom: scoresMap.wisdom?.score || 50,
  };

  const topPattern = patterns[0];
  const lastEvent = events?.[0];
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Stoic";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      {/* Simple flex layout - guaranteed to fit */}
      <div className="flex flex-col h-full">
        
        {/* Header with name, streak, and settings */}
        <div className="shrink-0 flex items-center justify-between py-2">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {displayName}'s Journey
            </h1>
            {streak > 0 && (
              <div className="inline-flex items-center gap-1 mt-1">
                <Flame className="w-4 h-4 text-coral animate-flame" />
                <span className="text-sm font-semibold text-coral">{streak} day streak</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Virtue Balance - main card */}
        <div className="shrink-0 p-4 glass-card mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Virtue Balance
            </p>
            {recommendedFocus && (
              <span className="text-xs text-primary font-medium capitalize px-2 py-0.5 bg-primary/10 rounded-full">
                Focus: {recommendedFocus}
              </span>
            )}
          </div>
          <VirtueBar {...virtues} />
        </div>

        {/* Insight Card - takes remaining space */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 p-4 glass-card bg-primary/5 flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Insight</p>
                <p className="text-base font-medium text-foreground">
                  {topPattern 
                    ? topPattern.title 
                    : lastEvent 
                      ? `Last activity: ${toolLabels[lastEvent.tool_name] || lastEvent.tool_name}`
                      : "Start using WellWell to discover insights"
                  }
                </p>
                {topPattern && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {topPattern.description}
                  </p>
                )}
                {lastEvent && !topPattern && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(lastEvent.created_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* View Trends link */}
            <button 
              onClick={() => navigate("/trends")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card hover:bg-muted/50 border border-border/50 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">View 14-Day Trends</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
