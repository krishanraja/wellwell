import { Layout } from "@/components/wellwell/Layout";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { VirtueChart } from "@/components/wellwell/VirtueChart";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useStreak } from "@/hooks/useStreak";
import { useEvents } from "@/hooks/useEvents";
import { usePatterns } from "@/hooks/usePatterns";
import { User, Flame, LogOut, Settings, Loader2, TrendingUp, Lightbulb } from "lucide-react";
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
  const { user, signOut } = useAuth();
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
      <div className="space-y-3">
        {/* Profile header */}
        <div className="stoic-card-compact flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-foreground truncate">
              {profile?.display_name || user?.email?.split("@")[0] || "Stoic"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="stoic-card-compact text-center">
            <p className="text-xs text-muted-foreground mb-1">Persona</p>
            <p className="font-display font-semibold text-foreground capitalize">
              {profile?.persona || "Strategist"}
            </p>
          </div>
          <div className="stoic-card-compact text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-coral" />
              <span className="font-display text-xl font-bold text-foreground">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
        </div>

        {/* Virtue balance */}
        <div className="stoic-card-compact">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Virtue Balance</p>
          <VirtueBar {...virtues} />
        </div>

        {/* Virtue Trends Chart */}
        <div className="stoic-card-compact">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">14-Day Trends</p>
          </div>
          <VirtueChart days={14} compact />
        </div>

        {/* Pattern Insight */}
        {topPattern && (
          <div className="stoic-card-compact bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{topPattern.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{topPattern.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="stoic-card-compact">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</p>
          <div className="space-y-2 text-sm">
            {recentEvents.length > 0 ? (
              recentEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className={`flex items-center justify-between py-1.5 ${
                    index < recentEvents.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <span className="text-foreground">
                    {toolLabels[event.tool_name] || event.tool_name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-2">No activity yet</p>
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

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={() => navigate("/settings")} className="w-full">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={async () => { 
              await signOut(); 
              navigate("/landing"); 
            }} 
            className="w-full text-coral hover:text-coral"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
