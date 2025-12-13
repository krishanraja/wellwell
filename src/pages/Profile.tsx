import { Layout } from "@/components/wellwell/Layout";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { VirtueChart } from "@/components/wellwell/VirtueChart";
import { Button } from "@/components/ui/button";
import { SignOutDialog } from "@/components/wellwell/SignOutDialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useStreak } from "@/hooks/useStreak";
import { useEvents } from "@/hooks/useEvents";
import { usePatterns } from "@/hooks/usePatterns";
import { User, Flame, Settings, Loader2, TrendingUp, Lightbulb } from "lucide-react";
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden gap-2">
        {/* Profile header - fixed */}
        <div className="shrink-0 flex items-center gap-3 p-3 glass-card">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-base font-bold text-foreground truncate">
              {profile?.display_name || user?.email?.split("@")[0] || "Stoic"}
            </h1>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Flame className="w-4 h-4 text-coral" />
            <span className="font-display text-lg font-bold text-foreground">{streak}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {/* Virtue balance */}
          <div className="p-3 glass-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Virtue Balance</p>
            <VirtueBar {...virtues} compact />
          </div>

          {/* Virtue Trends Chart */}
          <div className="p-3 glass-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">14-Day Trends</p>
            </div>
            <VirtueChart days={14} compact />
          </div>

          {/* Pattern Insight */}
          {topPattern && (
            <div className="p-3 glass-card bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{topPattern.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topPattern.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="p-3 glass-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</p>
            <div className="space-y-1.5 text-sm">
              {recentEvents.length > 0 ? (
                recentEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className={`flex items-center justify-between py-1 ${
                      index < recentEvents.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <span className="text-sm text-foreground">
                      {toolLabels[event.tool_name] || event.tool_name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-2 text-xs">No activity yet</p>
              )}
            </div>
          </div>

          {/* Recommended focus */}
          {recommendedFocus && (
            <div className="text-center py-1">
              <p className="text-xs text-muted-foreground">
                Recommended focus: <span className="text-primary font-medium capitalize">{recommendedFocus}</span>
              </p>
            </div>
          )}
        </div>

        {/* Action buttons - fixed at bottom */}
        <div className="shrink-0 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")} className="w-full">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <SignOutDialog size="sm" className="w-full" />
        </div>
      </div>
    </Layout>
  );
}
