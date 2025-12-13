import { Layout } from "@/components/wellwell/Layout";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { useEvents } from "@/hooks/useEvents";
import { Clock, Sunrise, Flame, Moon, Scale, Swords, History as HistoryIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatRawInputForDisplay } from "@/lib/formatRawInput";

const toolConfig: Record<string, { label: string; icon: typeof Sunrise; color: string }> = {
  pulse: { label: "Morning Pulse", icon: Sunrise, color: "hsl(45 100% 60%)" },
  intervene: { label: "Intervene", icon: Flame, color: "hsl(187 100% 50%)" },
  debrief: { label: "Evening Debrief", icon: Moon, color: "hsl(260 80% 65%)" },
  decision: { label: "Decision Engine", icon: Scale, color: "hsl(187 100% 50%)" },
  conflict: { label: "Conflict Copilot", icon: Swords, color: "hsl(8 100% 71%)" },
};

export default function History() {
  const { events, isLoading } = useEvents();
  const [filter, setFilter] = useState<string | null>(null);

  const filteredEvents = filter 
    ? events.filter(e => e.tool_name === filter)
    : events;

  const filterOptions = [
    { key: null, label: "All" },
    { key: "pulse", label: "Pulse" },
    { key: "intervene", label: "Intervene" },
    { key: "debrief", label: "Debrief" },
    { key: "decision", label: "Decision" },
    { key: "conflict", label: "Conflict" },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-4 min-h-0">
        {/* Header - fixed */}
        <div className="text-center shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
            <HistoryIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">History</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Your Reflections</h1>
          <p className="text-muted-foreground text-sm mt-1">Review past insights and growth</p>
        </div>

        {/* Filter chips - fixed */}
        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 -mx-4 px-4">
          {filterOptions.map((option) => (
            <button
              key={option.key ?? "all"}
              onClick={() => setFilter(option.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                filter === option.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Events list - scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4">
          <div className="space-y-3 pb-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted rounded mb-1" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  No reflections yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Start your first practice session to see your history here.
                </p>
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const config = toolConfig[event.tool_name] || {
                  label: event.tool_name,
                  icon: Clock,
                  color: "hsl(var(--muted-foreground))",
                };
                const Icon = config.icon;

                return (
                  <StoicCard
                    key={event.id}
                    variant="glass"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="p-2.5 rounded-xl shrink-0"
                          style={{ backgroundColor: `${config.color}20` }}
                        >
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: config.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.created_at), "MMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {formatRawInputForDisplay(event.raw_input)}
                      </p>
                    </div>
                  </StoicCard>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
