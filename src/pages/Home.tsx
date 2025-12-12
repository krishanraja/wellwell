import { Layout } from "@/components/wellwell/Layout";
import { FeatureButton, FeatureCard } from "@/components/wellwell/FeatureButton";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { useNavigate } from "react-router-dom";
import { Sunrise, Flame, Moon, Scale, Swords, Quote, ChevronRight } from "lucide-react";
import { getTodayStance } from "@/data/dailyStances";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useVirtueScores } from "@/hooks/useVirtueScores";

export default function Home() {
  const navigate = useNavigate();
  const todayStance = getTodayStance();
  const timeTheme = useTimeOfDay();
  const { scoresMap, isLoading } = useVirtueScores();
  
  const virtues = {
    courage: scoresMap?.courage?.score ?? 50,
    temperance: scoresMap?.temperance?.score ?? 50,
    justice: scoresMap?.justice?.score ?? 50,
    wisdom: scoresMap?.wisdom?.score ?? 50,
  };

  // Time-based accent colors for practice buttons
  const practiceColors = {
    morning: { pulse: "hsl(45 100% 60%)", intervene: "hsl(187 100% 50%)", debrief: "hsl(260 80% 65%)" },
    afternoon: { pulse: "hsl(45 100% 60%)", intervene: "hsl(187 100% 50%)", debrief: "hsl(260 80% 65%)" },
    evening: { pulse: "hsl(45 100% 60%)", intervene: "hsl(187 100% 50%)", debrief: "hsl(260 80% 65%)" },
  };
  
  const colors = practiceColors[timeTheme.period];

  return (
    <Layout showGreeting className="gap-4 pb-4">
      {/* Hero: Today's Stance */}
      <div className="hero-card animate-fade-up">
        <div className="flex items-start gap-3 mb-3">
          <div 
            className="p-2 rounded-xl"
            style={{ 
              background: `linear-gradient(135deg, ${timeTheme.gradientFrom}20, ${timeTheme.gradientTo}20)` 
            }}
          >
            <Quote 
              className="w-5 h-5" 
              style={{ color: timeTheme.accent }}
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Stance
            </p>
            <span 
              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
              style={{ 
                backgroundColor: `${timeTheme.accent}20`,
                color: timeTheme.accent,
              }}
            >
              {todayStance.virtue}
            </span>
          </div>
        </div>
        <p className="text-lg font-display font-semibold text-foreground leading-relaxed">
          "{todayStance.stance}"
        </p>
      </div>

      {/* Daily Practice */}
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daily Practice
          </p>
          <div className="flex gap-1">
            {["pulse", "intervene", "debrief"].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-muted"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FeatureCard 
            icon={Sunrise} 
            label="Pulse" 
            sublabel="Morning Mindset"
            onClick={() => navigate("/pulse")} 
            accentColor={colors.pulse}
          />
          <FeatureCard 
            icon={Flame} 
            label="Intervene" 
            sublabel="Recalibrate Now"
            onClick={() => navigate("/intervene")} 
            accentColor={colors.intervene}
          />
          <FeatureCard 
            icon={Moon} 
            label="Debrief" 
            sublabel="Evening Reflection"
            onClick={() => navigate("/debrief")} 
            accentColor={colors.debrief}
          />
        </div>
      </div>

      {/* Tools */}
      <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Tools
        </p>
        <div className="grid grid-cols-2 gap-3">
          <FeatureButton 
            icon={Scale} 
            label="Decision" 
            sublabel="Navigate choices wisely"
            onClick={() => navigate("/decision")} 
            compact
            accentColor="hsl(187 100% 50%)"
          />
          <FeatureButton 
            icon={Swords} 
            label="Conflict" 
            sublabel="Handle friction with grace"
            onClick={() => navigate("/conflict")} 
            compact
            accentColor="hsl(8 100% 71%)"
          />
        </div>
      </div>

      {/* Virtue Balance */}
      <div className="mt-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
        <StoicCard variant="glass" className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Virtue Balance
            </p>
            <button 
              onClick={() => navigate("/profile")} 
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-2.5 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <VirtueBar {...virtues} showIcons />
          )}
        </StoicCard>
      </div>
    </Layout>
  );
}
