import { Layout } from "@/components/wellwell/Layout";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { LoadingScreen } from "@/components/wellwell/LoadingScreen";
import { PracticeScoreBadge, ScoreBreakdown } from "@/components/wellwell/ScoreChangeIndicator";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useStreak } from "@/hooks/useStreak";
import { useEvents } from "@/hooks/useEvents";
import { usePatterns } from "@/hooks/usePatterns";
import { usePracticeScore } from "@/hooks/usePracticeScore";
import { useCommitments } from "@/hooks/useCommitments";
import { useDailyCheckins } from "@/hooks/useDailyCheckins";
import { 
  Flame, Lightbulb, ChevronRight, TrendingUp, Settings, 
  Calendar, Target, CheckCircle, Activity, BarChart3, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const { currentScore, trend, todayChanges, todayProgress, history } = usePracticeScore();
  const { completionRate, activeCommitments } = useCommitments();
  const { todayCheckins } = useDailyCheckins();
  const [forceShow, setForceShow] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

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
  
  // Calculate days on WellWell
  const daysOnWellWell = profile?.created_at 
    ? differenceInDays(new Date(), new Date(profile.created_at))
    : 0;

  // Stats for quick view
  const stats = [
    { 
      label: "Days", 
      value: daysOnWellWell || 1, 
      icon: Calendar, 
      color: "text-sky-600 dark:text-sky-400" 
    },
    { 
      label: "Streak", 
      value: streak, 
      icon: Flame, 
      color: "text-amber-600 dark:text-amber-400" 
    },
    { 
      label: "Sessions", 
      value: events?.length || 0, 
      icon: Activity, 
      color: "text-primary" 
    },
    { 
      label: "Commits", 
      value: `${completionRate}%`, 
      icon: CheckCircle, 
      color: "text-emerald-600 dark:text-emerald-400" 
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-y-auto">
        
        {/* Header with name, practice score, and settings */}
        <div className="shrink-0 flex items-center justify-between py-2 mb-4">
          <div className="flex items-center gap-4">
            {/* Practice Score Badge */}
            <PracticeScoreBadge 
              score={currentScore} 
              trend={trend}
              size="md"
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            />
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                {displayName}
              </h1>
              {streak > 0 && (
                <div className="inline-flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{streak} day streak</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Score Breakdown Modal/Expandable */}
        {showScoreBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 mb-4 glass-card p-4"
          >
            <ScoreBreakdown 
              changes={todayChanges.map(c => ({ delta: c.delta, source: c.source, sourceType: c.source_type }))}
              currentScore={currentScore}
            />
          </motion.div>
        )}

        {/* Quick Stats Row */}
        <div className="shrink-0 grid grid-cols-4 gap-2 mb-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="flex flex-col items-center p-3 glass-card"
              >
                <Icon className={cn("w-4 h-4 mb-1", stat.color)} />
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Today's Progress */}
        {todayProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Today: +{todayProgress} points
                </span>
              </div>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                {todayCheckins.length} check-ins
              </span>
            </div>
          </motion.div>
        )}

        {/* Active Commitments */}
        {activeCommitments.length > 0 && (
          <div className="shrink-0 mb-4 glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Active Commitments</span>
              </div>
              <button 
                onClick={() => navigate("/history")}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {activeCommitments.slice(0, 2).map((commitment) => (
                <div 
                  key={commitment.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div className="w-4 h-4 rounded border border-border shrink-0" />
                  <span className="text-sm text-muted-foreground line-clamp-1 flex-1">
                    {commitment.commitment_text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Virtue Balance */}
        <div className="shrink-0 p-4 glass-card mb-4">
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

        {/* Insight Card */}
        <div className="shrink-0 p-4 glass-card bg-primary/5 mb-4">
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
        </div>

        {/* Quick Links */}
        <div className="shrink-0 space-y-2 mb-4">
          <button 
            onClick={() => navigate("/trends")}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card hover:bg-muted/50 border border-border/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">View 14-Day Trends</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => navigate("/history")}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card hover:bg-muted/50 border border-border/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/15">
                <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-medium text-foreground">View Full History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
