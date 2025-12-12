import { Layout } from "@/components/wellwell/Layout";
import { FeatureButton } from "@/components/wellwell/FeatureButton";
import { useNavigate } from "react-router-dom";
import { Calendar, BookOpen, Settings, Info, RotateCcw, FileText } from "lucide-react";

export default function More() {
  const navigate = useNavigate();
  const features = [
    { icon: RotateCcw, label: "Weekly Reset", sublabel: "Recalibrate", path: "/weekly-reset" },
    { icon: FileText, label: "Monthly Story", sublabel: "Narrative", path: "/monthly-narrative" },
    { icon: Calendar, label: "History", sublabel: "Past reflections", path: "/history" },
    { icon: BookOpen, label: "Library", sublabel: "Resources", path: "/library" },
    { icon: Settings, label: "Settings", sublabel: "Preferences", path: "/settings" },
    { icon: Info, label: "About", sublabel: "WellWell", path: "/about" },
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        <div className="py-3 animate-fade-up"><h1 className="font-display text-2xl font-bold text-foreground">More</h1><p className="text-sm text-muted-foreground">Extended tools and settings</p></div>
        <div className="grid grid-cols-2 gap-2 flex-1 content-start animate-fade-up" style={{ animationDelay: "100ms" }}>
          {features.map((feature, index) => (
            <FeatureButton key={feature.label} icon={feature.icon} label={feature.label} sublabel={feature.sublabel} onClick={() => navigate(feature.path)} compact style={{ animationDelay: `${150 + index * 50}ms` }} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
