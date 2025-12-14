import { Layout } from "@/components/wellwell/Layout";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { HorizontalScroll } from "@/components/wellwell/HorizontalScroll";
import { dailyStances, DailyStance } from "@/data/dailyStances";
import { ScrollText, Flame, Droplets, Scale, Lightbulb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const virtueConfig: Record<string, { icon: typeof Flame; color: string; label: string }> = {
  courage: { icon: Flame, color: "hsl(8 100% 65%)", label: "Courage" },
  temperance: { icon: Droplets, color: "hsl(90 80% 65%)", label: "Temperance" },
  justice: { icon: Scale, color: "hsl(187 100% 50%)", label: "Justice" },
  wisdom: { icon: Lightbulb, color: "hsl(45 80% 50%)", label: "Wisdom" },
};

export default function DailyStancesLibrary() {
  const [filter, setFilter] = useState<string | null>(null);
  
  const filteredStances = filter 
    ? dailyStances.filter(s => s.virtue === filter)
    : dailyStances;

  const filterOptions = [
    { key: null, label: "All" },
    { key: "courage", label: "Courage" },
    { key: "temperance", label: "Temperance" },
    { key: "justice", label: "Justice" },
    { key: "wisdom", label: "Wisdom" },
  ];

  return (
    <Layout scrollable>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
            <ScrollText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Daily Stances</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">30 Stoic Principles</h1>
          <p className="text-muted-foreground text-sm mt-1">One stance for each day of the month</p>
        </div>

        {/* Filter chips */}
        <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
          <HorizontalScroll className="pb-2">
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
          </HorizontalScroll>
        </div>

        {/* Stances list */}
        <div className="space-y-3">
          {filteredStances.map((stance, index) => {
            const config = virtueConfig[stance.virtue];
            const Icon = config.icon;
            
            return (
              <StoicCard
                key={stance.day}
                variant="glass"
                className="animate-fade-up"
                style={{ animationDelay: `${(index % 10) * 30}ms` }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm"
                        style={{ 
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                        }}
                      >
                        {stance.day}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium leading-relaxed">
                        "{stance.stance}"
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Icon 
                          className="w-3.5 h-3.5" 
                          style={{ color: config.color }}
                        />
                        <span 
                          className="text-xs font-medium capitalize"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </StoicCard>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
