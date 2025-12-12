import { Layout } from "@/components/wellwell/Layout";
import { FeatureButton } from "@/components/wellwell/FeatureButton";
import { VirtueBarCompact } from "@/components/wellwell/VirtueBar";
import { LogoFull } from "@/components/wellwell/Header";
import { Sun, Zap, Moon, Brain, Users, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // Mock virtue data
  const virtues = {
    courage: 72,
    temperance: 85,
    justice: 68,
    wisdom: 79,
  };

  return (
    <Layout showHeader={false}>
      <div className="space-y-8 stagger-children">
        {/* Hero Section */}
        <div className="pt-8 pb-4 animate-fade-up">
          <LogoFull className="h-8 mb-6" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Good morning
          </h1>
          <p className="text-muted-foreground">
            Think clean. Act clear.
          </p>
        </div>

        {/* Virtue Summary */}
        <div className="stoic-card animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Virtue Balance
            </span>
            <span className="text-sm font-display font-semibold gradient-text">
              76%
            </span>
          </div>
          <VirtueBarCompact virtues={virtues} />
        </div>

        {/* Core Actions */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
            Today
          </h2>
          
          <FeatureButton
            icon={Sun}
            title="Pulse"
            description="Set your stance for today"
            onClick={() => navigate("/pulse")}
            variant="highlight"
          />
          
          <FeatureButton
            icon={Zap}
            title="Intervene"
            description="Shift your state now"
            onClick={() => navigate("/intervene")}
          />
          
          <FeatureButton
            icon={Moon}
            title="Debrief"
            description="Close your day with clarity"
            onClick={() => navigate("/debrief")}
          />
        </div>

        {/* Tools */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
            Tools
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate("/decision")}
              className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Brain className="w-5 h-5 text-primary mb-3" />
              <span className="font-display font-medium text-sm text-foreground block">
                Decision
              </span>
              <span className="text-xs text-muted-foreground">
                Think clearly
              </span>
            </button>
            
            <button 
              onClick={() => navigate("/conflict")}
              className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Users className="w-5 h-5 text-primary mb-3" />
              <span className="font-display font-medium text-sm text-foreground block">
                Conflict
              </span>
              <span className="text-xs text-muted-foreground">
                Reset dynamics
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
