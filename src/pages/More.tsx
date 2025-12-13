import { Layout } from "@/components/wellwell/Layout";
import { FeatureButton } from "@/components/wellwell/FeatureButton";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Settings, 
  Info, 
  RotateCcw, 
  FileText,
  Sunrise,
  Flame,
  Moon,
  Scale,
  Swords
} from "lucide-react";

export default function More() {
  const navigate = useNavigate();
  
  const practiceTools = [
    { icon: Sunrise, label: "Pulse", sublabel: "Morning mindset", path: "/pulse" },
    { icon: Flame, label: "Intervene", sublabel: "Recalibrate now", path: "/intervene" },
    { icon: Moon, label: "Debrief", sublabel: "Evening reflection", path: "/debrief" },
  ];

  const specializedTools = [
    { icon: Scale, label: "Decision", sublabel: "Navigate choices", path: "/decision" },
    { icon: Swords, label: "Conflict", sublabel: "Handle friction", path: "/conflict" },
  ];
  
  const extendedFeatures = [
    { icon: RotateCcw, label: "Weekly Reset", sublabel: "Recalibrate", path: "/weekly-reset" },
    { icon: FileText, label: "Monthly Story", sublabel: "Your narrative", path: "/monthly-narrative" },
    { icon: BookOpen, label: "Library", sublabel: "Resources", path: "/library" },
  ];

  const settingsFeatures = [
    { icon: Settings, label: "Settings", sublabel: "Preferences", path: "/settings" },
    { icon: Info, label: "About", sublabel: "WellWell", path: "/about" },
  ];

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">More</h1>
          <p className="text-sm text-muted-foreground">All tools and settings</p>
        </div>

        {/* Daily Practice */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Daily Practice
          </p>
          <div className="grid grid-cols-3 gap-2">
            {practiceTools.map((feature) => (
              <FeatureButton 
                key={feature.label} 
                icon={feature.icon} 
                label={feature.label} 
                sublabel={feature.sublabel} 
                onClick={() => navigate(feature.path)} 
                compact 
              />
            ))}
          </div>
        </section>

        {/* Specialized Tools */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Specialized Tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            {specializedTools.map((feature) => (
              <FeatureButton 
                key={feature.label} 
                icon={feature.icon} 
                label={feature.label} 
                sublabel={feature.sublabel} 
                onClick={() => navigate(feature.path)} 
                compact 
              />
            ))}
          </div>
        </section>

        {/* Extended Features */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Extended Features
          </p>
          <div className="grid grid-cols-3 gap-2">
            {extendedFeatures.map((feature) => (
              <FeatureButton 
                key={feature.label} 
                icon={feature.icon} 
                label={feature.label} 
                sublabel={feature.sublabel} 
                onClick={() => navigate(feature.path)} 
                compact 
              />
            ))}
          </div>
        </section>

        {/* Settings */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Settings
          </p>
          <div className="grid grid-cols-2 gap-2">
            {settingsFeatures.map((feature) => (
              <FeatureButton 
                key={feature.label} 
                icon={feature.icon} 
                label={feature.label} 
                sublabel={feature.sublabel} 
                onClick={() => navigate(feature.path)} 
                compact 
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
