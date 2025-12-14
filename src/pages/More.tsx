import { useState } from "react";
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
  MoreHorizontal,
  ChevronDown,
  Clock,
  Zap,
  TrendingUp,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolItem {
  icon: LucideIcon;
  label: string;
  path: string;
  color?: string;
  description?: string;
}

interface Category {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  tools: ToolItem[];
}

const categories: Category[] = [
  {
    id: "daily-rituals",
    icon: Clock,
    label: "Daily Rituals",
    description: "Start and end your day with intention",
    color: "hsl(45 100% 60%)",
    tools: [
      { icon: Sunrise, label: "Morning Pulse", path: "/pulse", color: "hsl(45 100% 60%)", description: "Prepare your mind" },
      { icon: Moon, label: "Evening Debrief", path: "/debrief", color: "hsl(260 80% 65%)", description: "Reflect on your day" },
    ],
  },
  {
    id: "situational-tools",
    icon: Zap,
    label: "Situational Tools",
    description: "Navigate life's challenges in real-time",
    color: "hsl(187 100% 50%)",
    tools: [
      { icon: Flame, label: "Intervene", path: "/intervene", color: "hsl(187 100% 50%)", description: "Recalibrate when triggered" },
      { icon: Scale, label: "Decision", path: "/decision", color: "hsl(187 100% 50%)", description: "Clarify tough choices" },
      { icon: Swords, label: "Conflict", path: "/conflict", color: "hsl(8 100% 71%)", description: "Navigate tension" },
    ],
  },
  {
    id: "personal-growth",
    icon: TrendingUp,
    label: "Personal Growth",
    description: "Track your Stoic journey over time",
    color: "hsl(166 100% 50%)",
    tools: [
      { icon: RotateCcw, label: "Weekly Reset", path: "/weekly-reset", description: "Review your week" },
      { icon: FileText, label: "Monthly Story", path: "/monthly-narrative", description: "Your narrative arc" },
    ],
  },
  {
    id: "wisdom-library",
    icon: Lightbulb,
    label: "Wisdom Library",
    description: "Ancient philosophy for modern life",
    color: "hsl(45 100% 60%)",
    tools: [
      { icon: BookOpen, label: "Library", path: "/library", color: "hsl(260 80% 65%)", description: "Explore Stoic wisdom" },
    ],
  },
];

function AccordionCategory({ 
  category, 
  isOpen, 
  onToggle, 
  onNavigate 
}: { 
  category: Category; 
  isOpen: boolean; 
  onToggle: () => void; 
  onNavigate: (path: string) => void;
}) {
  const Icon = category.icon;
  
  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-3 p-4 transition-all",
          "hover:bg-muted/30 active:bg-muted/50",
          isOpen && "bg-muted/20"
        )}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon 
            className="w-5 h-5"
            style={{ color: category.color }}
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm">
            {category.label}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {category.description}
          </p>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      {/* Expanded Tools */}
      <div 
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-1">
            {category.tools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <button
                  key={tool.path}
                  onClick={() => onNavigate(tool.path)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl",
                    "bg-background/50 border border-border/30",
                    "hover:bg-muted/50 hover:border-border transition-all",
                    "active:scale-[0.98]"
                  )}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: tool.color ? `${tool.color}15` : 'hsl(var(--primary) / 0.1)' }}
                  >
                    <ToolIcon 
                      className="w-4 h-4"
                      style={{ color: tool.color || 'hsl(var(--primary))' }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-foreground text-sm block">
                      {tool.label}
                    </span>
                    {tool.description && (
                      <span className="text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function More() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleToggle = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  return (
    <Layout scrollable>
      <div className="flex flex-col min-h-full pb-4">
        {/* Header */}
        <div className="shrink-0 pb-4">
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

        {/* Accordion Categories */}
        <div className="flex-1 space-y-3">
          {categories.map((category) => (
            <AccordionCategory
              key={category.id}
              category={category}
              isOpen={openCategory === category.id}
              onToggle={() => handleToggle(category.id)}
              onNavigate={(path) => navigate(path)}
            />
          ))}
        </div>

        {/* Settings & About - Always visible */}
        <div className="shrink-0 mt-6 pt-4 border-t border-border/30">
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/settings")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                "bg-muted/30 border border-border/50",
                "hover:bg-muted/50 hover:border-border transition-all",
                "active:scale-[0.98]"
              )}
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">Settings</span>
            </button>
            <button
              onClick={() => navigate("/about")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                "bg-muted/30 border border-border/50",
                "hover:bg-muted/50 hover:border-border transition-all",
                "active:scale-[0.98]"
              )}
            >
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">About</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
