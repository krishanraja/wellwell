import { Layout } from "@/components/wellwell/Layout";
import { FeatureButton } from "@/components/wellwell/FeatureButton";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { useNavigate } from "react-router-dom";
import { Sunrise, Flame, Moon, Scale, Swords } from "lucide-react";
import { getTodayStance } from "@/data/dailyStances";

export default function Home() {
  const navigate = useNavigate();
  const todayStance = getTodayStance();
  const virtues = { courage: 65, temperance: 72, justice: 58, wisdom: 80 };

  return (
    <Layout className="gap-3">
      <div className="stoic-card-compact text-center animate-fade-up">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's Stance</p>
        <p className="text-sm font-medium text-foreground">"{todayStance.stance}"</p>
        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 rounded-full text-xs text-primary capitalize">{todayStance.virtue}</span>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Daily Practice</p>
        <div className="grid grid-cols-3 gap-2">
          <FeatureButton icon={Sunrise} label="Pulse" sublabel="Morning" onClick={() => navigate("/pulse")} compact />
          <FeatureButton icon={Flame} label="Intervene" sublabel="Recalibrate" onClick={() => navigate("/intervene")} compact />
          <FeatureButton icon={Moon} label="Debrief" sublabel="Evening" onClick={() => navigate("/debrief")} compact />
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Tools</p>
        <div className="grid grid-cols-2 gap-2">
          <FeatureButton icon={Scale} label="Decision" sublabel="Navigate choices" onClick={() => navigate("/decision")} compact />
          <FeatureButton icon={Swords} label="Conflict" sublabel="Handle friction" onClick={() => navigate("/conflict")} compact />
        </div>
      </div>

      <div className="mt-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="stoic-card-compact">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Virtue Balance</p>
            <button onClick={() => navigate("/profile")} className="text-xs text-primary font-medium">View all</button>
          </div>
          <VirtueBar {...virtues} compact />
        </div>
      </div>
    </Layout>
  );
}
