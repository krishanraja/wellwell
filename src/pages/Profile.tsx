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

const toolLabels: Record<string, string> = {
  pulse: "Morning Pulse",
  intervene: "Intervene",
  debrief: "Evening Debrief",
  decision: "Decision Engine",
  conflict: "Conflict Copilot",
  onboarding: "Onboarding",
  weekly_reset: "Weekly Reset",
};

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { scoresMap, isLoading: virtuesLoading } = useVirtueScores();
  const { streak, isLoading: streakLoading } = useStreak();
  const { events, isLoading: eventsLoading } = useEvents();
  const { patterns, recommendedFocus } = usePatterns();

  const isLoading = profileLoading || virtuesLoading || streakLoading || eventsLoading;

  const virtues = {
    courage: scoresMap.courage?.score || 50,
    temperance: scoresMap.temperance?.score || 50,
    justice: scoresMap.justice?.score || 50,
    wisdom: scoresMap.wisdom?.score || 50,
  };

  const recentEvents = events.slice(0, 3);
  const topPattern = patterns[0];
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Stoic";

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Compact header with name and streak inline */}
        <div className="shrink-0 flex items-center justify-between py-1 mb-2">
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

        {/* Scrollable content - more compact */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 scrollbar-hide pb-20">
          {/* Virtue balance - compact */}
          <div className="p-2.5 glass-card">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Virtue Balance</p>
              {recommendedFocus && (
                <span className="text-[10px] text-primary font-medium capitalize px-1.5 py-0.5 bg-primary/10 rounded-full">
                  Focus: {recommendedFocus}
                </span>
              )}
            </div>
            <VirtueBar {...virtues} compact />
          </div>

          {/* Virtue Trends Chart - more compact */}
          <div className="p-2.5 glass-card">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">14-Day Trends</p>
            </div>
            <VirtueChart days={14} compact />
          </div>

          {/* Pattern Insight - compact */}
          {topPattern && (
            <div className="p-2.5 glass-card bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-primary/10 shrink-0">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{topPattern.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{topPattern.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent activity - compact inline list */}
          <div className="p-2.5 glass-card mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Recent Activity</p>
            <div className="space-y-1">
              {recentEvents.length > 0 ? (
                recentEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className={`flex items-center justify-between py-0.5 ${
                      index < recentEvents.length - 1 ? "border-b border-border/30" : ""
                    }`}
                  >
                    <span className="text-sm text-foreground">
                      {toolLabels[event.tool_name] || event.tool_name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-1 text-xs">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
