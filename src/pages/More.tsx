import { Layout } from "@/components/wellwell/Layout";
import { FeatureButton } from "@/components/wellwell/FeatureButton";
import { Brain, Users, RotateCcw, BookOpen, Settings, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function More() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Tools & Settings
          </h1>
          <p className="text-muted-foreground">
            Additional clarity engines and preferences.
          </p>
        </div>

        {/* Clarity Tools */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
            Clarity Tools
          </h2>
          
          <FeatureButton
            icon={Brain}
            title="Decision Engine"
            description="Break down difficult choices"
            onClick={() => navigate("/decision")}
          />
          
          <FeatureButton
            icon={Users}
            title="Conflict Copilot"
            description="Reset interpersonal dynamics"
            onClick={() => navigate("/conflict")}
          />
          
          <FeatureButton
            icon={RotateCcw}
            title="Weekly Reset"
            description="Review your week's progress"
            onClick={() => navigate("/weekly-reset")}
          />
          
          <FeatureButton
            icon={BookOpen}
            title="Monthly Narrative"
            description="Your growth story this month"
            onClick={() => navigate("/monthly-narrative")}
          />
        </div>

        {/* Settings */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
            Preferences
          </h2>
          
          <FeatureButton
            icon={Settings}
            title="Settings"
            description="Persona, notifications, privacy"
            onClick={() => {}}
          />
          
          <FeatureButton
            icon={Info}
            title="About WellWell"
            description="Philosophy and principles"
            onClick={() => {}}
          />
        </div>
      </div>
    </Layout>
  );
}
