import { Layout } from "@/components/wellwell/Layout";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
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
  Swords,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolItem {
  icon: LucideIcon;
  label: string;
  path: string;
  color?: string;
}

const allTools: ToolItem[] = [
  { icon: Sunrise, label: "Pulse", path: "/pulse", color: "hsl(45 100% 60%)" },
  { icon: Flame, label: "Intervene", path: "/intervene", color: "hsl(187 100% 50%)" },
  { icon: Moon, label: "Debrief", path: "/debrief", color: "hsl(260 80% 65%)" },
  { icon: Scale, label: "Decision", path: "/decision", color: "hsl(187 100% 50%)" },
  { icon: Swords, label: "Conflict", path: "/conflict", color: "hsl(8 100% 71%)" },
  { icon: RotateCcw, label: "Weekly Reset", path: "/weekly-reset" },
  { icon: FileText, label: "Monthly Story", path: "/monthly-narrative" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Info, label: "About", path: "/about" },
];

function ToolCard({ icon: Icon, label, path, color, onClick }: ToolItem & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:shadow-glow active:scale-[0.97] aspect-square"
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ 
          backgroundColor: color ? `${color}20` : 'hsl(var(--primary) / 0.1)',
        }}
      >
        <Icon 
          className="w-5 h-5"
          style={{ color: color || 'hsl(var(--primary))' }}
        />
      </div>
      <span className="font-display font-medium text-foreground text-xs text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

export default function More() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="shrink-0 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <MoreHorizontal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">More</h1>
              <p className="text-xs text-muted-foreground">All tools & settings</p>
            </div>
          </div>
        </div>

        {/* Tools Grid - 2 columns, stable cards */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-3 gap-2">
            {allTools.map((tool) => (
              <ToolCard 
                key={tool.path}
                {...tool}
                onClick={() => navigate(tool.path)} 
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
