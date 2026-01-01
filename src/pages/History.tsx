import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { HorizontalScroll } from "@/components/wellwell/HorizontalScroll";
import { useEvents } from "@/hooks/useEvents";
import { useDailyCheckins } from "@/hooks/useDailyCheckins";
import { useCommitments } from "@/hooks/useCommitments";
import { 
  Clock, Sunrise, Flame, Moon, Scale, Swords, 
  History as HistoryIcon, MessageSquare, Target, 
  CheckCircle, Activity, Sparkles, TrendingUp,
  ChevronRight, Calendar
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatRawInputForDisplay } from "@/lib/formatRawInput";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityType } from "@/types/database";

// Tool configuration
const toolConfig: Record<string, { label: string; icon: typeof Sunrise; color: string; scoreImpact: number }> = {
  pulse: { label: "Morning Pulse", icon: Sunrise, color: "hsl(45 100% 60%)", scoreImpact: 5 },
  intervene: { label: "Intervene", icon: Flame, color: "hsl(187 100% 50%)", scoreImpact: 3 },
  debrief: { label: "Evening Debrief", icon: Moon, color: "hsl(260 80% 65%)", scoreImpact: 5 },
  decision: { label: "Decision Engine", icon: Scale, color: "hsl(187 100% 50%)", scoreImpact: 3 },
  conflict: { label: "Conflict Copilot", icon: Swords, color: "hsl(8 100% 71%)", scoreImpact: 3 },
};

// Activity configuration
const activityConfig: Record<ActivityType, { label: string; icon: typeof Sunrise; color: string }> = {
  reflection_prompt: { label: "Reflection", icon: MessageSquare, color: "hsl(45 100% 60%)" },
  quick_challenge: { label: "Challenge", icon: Target, color: "hsl(187 100% 50%)" },
  wisdom_card: { label: "Wisdom", icon: Sparkles, color: "hsl(260 80% 65%)" },
  energy_checkin: { label: "Energy Check", icon: Activity, color: "hsl(166 100% 50%)" },
  micro_commitment: { label: "Commitment", icon: CheckCircle, color: "hsl(142 70% 45%)" },
  pattern_insight: { label: "Pattern", icon: TrendingUp, color: "hsl(200 80% 55%)" },
  streak_celebration: { label: "Celebration", icon: Flame, color: "hsl(8 100% 65%)" },
};

type TabType = 'all' | 'sessions' | 'checkins' | 'commitments';

export default function History() {
  const { events, isLoading: eventsLoading } = useEvents();
  const { recentCheckins, isLoading: checkinsLoading } = useDailyCheckins();
  const { allCommitments, completeCommitment, isLoading: commitmentsLoading } = useCommitments();
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filter, setFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isLoading = eventsLoading || checkinsLoading || commitmentsLoading;

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: events.length + recentCheckins.length },
    { key: 'sessions', label: 'Sessions', count: events.length },
    { key: 'checkins', label: 'Check-ins', count: recentCheckins.length },
    { key: 'commitments', label: 'Commitments', count: allCommitments.length },
  ];

  const filterOptions = [
    { key: null, label: "All" },
    { key: "pulse", label: "Pulse" },
    { key: "intervene", label: "Intervene" },
    { key: "debrief", label: "Debrief" },
    { key: "decision", label: "Decision" },
    { key: "conflict", label: "Conflict" },
  ];

  const filteredEvents = filter 
    ? events.filter(e => e.tool_name === filter)
    : events;

  // Combine and sort all items for 'all' view
  const allItems = activeTab === 'all' 
    ? [
        ...events.map(e => ({ ...e, type: 'event' as const })),
        ...recentCheckins.map(c => ({ ...c, type: 'checkin' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCompleteCommitment = async (commitmentId: string) => {
    try {
      await completeCommitment(commitmentId);
    } catch (error) {
      console.error('Failed to complete commitment:', error);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden gap-3">
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <HistoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">History</h1>
            <p className="text-xs text-muted-foreground">Your journey of practice</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 -mx-4 px-4">
          <HorizontalScroll className="pb-1 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {tab.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-xs",
                  activeTab === tab.key 
                    ? "bg-black/20" 
                    : "bg-white/10"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </HorizontalScroll>
        </div>

        {/* Filter chips (for sessions tab) */}
        {activeTab === 'sessions' && (
          <div className="shrink-0 -mx-4 px-4">
            <HorizontalScroll className="pb-1 gap-1.5">
              {filterOptions.map((option) => (
                <button
                  key={option.key ?? "all"}
                  onClick={() => setFilter(option.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                    filter === option.key
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </HorizontalScroll>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 pb-2"
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-muted rounded mb-1" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-12 bg-muted rounded" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 pb-4"
              >
                {/* ALL TAB */}
                {activeTab === 'all' && (
                  allItems.length === 0 ? (
                    <EmptyState 
                      icon={Clock} 
                      title="No history yet" 
                      message="Start your first practice session to begin your journey." 
                    />
                  ) : (
                    allItems.map((item) => (
                      item.type === 'event' ? (
                        <EventCard 
                          key={item.id} 
                          event={item} 
                          expanded={expandedId === item.id}
                          onToggle={() => handleToggleExpand(item.id)}
                        />
                      ) : (
                        <CheckinCard 
                          key={item.id} 
                          checkin={item} 
                        />
                      )
                    ))
                  )
                )}

                {/* SESSIONS TAB */}
                {activeTab === 'sessions' && (
                  filteredEvents.length === 0 ? (
                    <EmptyState 
                      icon={Sparkles} 
                      title="No sessions yet" 
                      message="Complete a Pulse, Debrief, or other practice to see it here." 
                    />
                  ) : (
                    filteredEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        expanded={expandedId === event.id}
                        onToggle={() => handleToggleExpand(event.id)}
                        showScoreImpact
                      />
                    ))
                  )
                )}

                {/* CHECK-INS TAB */}
                {activeTab === 'checkins' && (
                  recentCheckins.length === 0 ? (
                    <EmptyState 
                      icon={Activity} 
                      title="No check-ins yet" 
                      message="Complete your daily welcome activities to see them here." 
                    />
                  ) : (
                    recentCheckins.map((checkin) => (
                      <CheckinCard key={checkin.id} checkin={checkin} />
                    ))
                  )
                )}

                {/* COMMITMENTS TAB */}
                {activeTab === 'commitments' && (
                  allCommitments.length === 0 ? (
                    <EmptyState 
                      icon={CheckCircle} 
                      title="No commitments yet" 
                      message="Make micro-commitments during your welcome activities." 
                    />
                  ) : (
                    allCommitments.map((commitment) => (
                      <CommitmentCard 
                        key={commitment.id} 
                        commitment={commitment}
                        onComplete={() => handleCompleteCommitment(commitment.id)}
                      />
                    ))
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  expanded, 
  onToggle,
  showScoreImpact = false,
}: { 
  event: { id: string; tool_name: string; raw_input: string; created_at: string };
  expanded: boolean;
  onToggle: () => void;
  showScoreImpact?: boolean;
}) {
  const config = toolConfig[event.tool_name] || {
    label: event.tool_name,
    icon: Clock,
    color: "hsl(var(--muted-foreground))",
    scoreImpact: 0,
  };
  const Icon = config.icon;

  return (
    <motion.div layout>
      <StoicCard variant="glass">
        <button 
          onClick={onToggle}
          className="w-full text-left p-4"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div 
              className="p-2.5 rounded-xl shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-foreground">{config.label}</p>
                {showScoreImpact && config.scoreImpact > 0 && (
                  <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                    +{config.scoreImpact}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(event.created_at), "MMM d, yyyy • h:mm a")}</span>
              </div>
              <p className={cn(
                "text-sm text-muted-foreground",
                !expanded && "line-clamp-2"
              )}>
                {formatRawInputForDisplay(event.raw_input)}
              </p>
            </div>

            <ChevronRight 
              className={cn(
                "w-5 h-5 text-muted-foreground shrink-0 transition-transform",
                expanded && "rotate-90"
              )} 
            />
          </div>
        </button>
      </StoicCard>
    </motion.div>
  );
}

// Check-in Card Component
function CheckinCard({ checkin }: { checkin: { id: string; activity_type: string; prompt?: string | null; response_data: Record<string, unknown>; score_impact: number; created_at: string } }) {
  const config = activityConfig[checkin.activity_type as ActivityType] || {
    label: checkin.activity_type,
    icon: Activity,
    color: "hsl(var(--muted-foreground))",
  };
  const Icon = config.icon;

  // Extract display content from response_data
  const getDisplayContent = () => {
    const data = checkin.response_data;
    if (data.text) return data.text as string;
    if (data.commitment) return data.commitment as string;
    if (data.items && Array.isArray(data.items)) return (data.items as string[]).join(', ');
    if (data.mood !== undefined) {
      return `Mood: ${data.mood}/5, Energy: ${data.energy}/5, Clarity: ${data.clarity}/5`;
    }
    if (data.quote) return `"${data.quote}"`;
    return null;
  };

  const displayContent = getDisplayContent();

  return (
    <StoicCard variant="glass">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div 
            className="p-2.5 rounded-xl shrink-0"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">{config.label}</p>
              {checkin.score_impact > 0 && (
                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  +{checkin.score_impact}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(checkin.created_at), { addSuffix: true })}</span>
            </div>
            {checkin.prompt && (
              <p className="text-xs text-muted-foreground/70 mb-1 italic">
                "{checkin.prompt.length > 60 ? checkin.prompt.slice(0, 60) + '...' : checkin.prompt}"
              </p>
            )}
            {displayContent && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {displayContent}
              </p>
            )}
          </div>
        </div>
      </div>
    </StoicCard>
  );
}

// Commitment Card Component
function CommitmentCard({ 
  commitment, 
  onComplete,
}: { 
  commitment: { id: string; commitment_text: string; completed: boolean; completed_at: string | null; created_at: string };
  onComplete: () => void;
}) {
  return (
    <StoicCard variant="glass">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onComplete}
            disabled={commitment.completed}
            className={cn(
              "mt-0.5 w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all",
              commitment.completed 
                ? "bg-green-500 border-green-500" 
                : "border-white/30 hover:border-primary hover:bg-primary/10"
            )}
          >
            {commitment.completed && <CheckCircle className="w-4 h-4 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm",
              commitment.completed 
                ? "text-muted-foreground line-through" 
                : "text-foreground"
            )}>
              {commitment.commitment_text}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {commitment.completed 
                ? `Completed ${formatDistanceToNow(new Date(commitment.completed_at!), { addSuffix: true })}`
                : `Made ${formatDistanceToNow(new Date(commitment.created_at), { addSuffix: true })}`
              }
            </p>
          </div>

          {/* Score impact */}
          {commitment.completed && (
            <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full shrink-0">
              +4
            </span>
          )}
        </div>
      </div>
    </StoicCard>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  message,
}: { 
  icon: typeof Clock;
  title: string;
  message: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {message}
      </p>
    </div>
  );
}
