import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  User, 
  Flame, 
  Settings, 
  Info, 
  LogOut, 
  ChevronRight,
  Sunrise,
  Moon,
  RotateCcw,
  FileText,
  BookOpen,
  Sparkles
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { SideTabTrigger } from "./SideTabTrigger";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";

interface ToolItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  color: string;
  description: string;
}

interface ToolCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  tools: ToolItem[];
}

const toolCategories: ToolCategory[] = [
  {
    id: "daily-rituals",
    label: "Daily Rituals",
    icon: Sunrise,
    color: "hsl(45 100% 60%)",
    tools: [
      { id: "pulse", label: "Morning Pulse", icon: Sunrise, route: "/pulse", color: "hsl(45 100% 60%)", description: "Set your daily intention" },
      { id: "debrief", label: "Evening Debrief", icon: Moon, route: "/debrief", color: "hsl(260 80% 65%)", description: "Reflect on your day" },
    ],
  },
  {
    id: "personal-growth",
    label: "Personal Growth",
    icon: Sparkles,
    color: "hsl(166 100% 50%)",
    tools: [
      { id: "weekly-reset", label: "Weekly Reset", icon: RotateCcw, route: "/weekly-reset", color: "hsl(166 100% 50%)", description: "Review your week" },
      { id: "monthly-story", label: "Monthly Story", icon: FileText, route: "/monthly-narrative", color: "hsl(166 100% 50%)", description: "Your narrative arc" },
    ],
  },
  {
    id: "wisdom-library",
    label: "Wisdom Library",
    icon: BookOpen,
    color: "hsl(260 80% 65%)",
    tools: [
      { id: "library", label: "Stoic Library", icon: BookOpen, route: "/library", color: "hsl(260 80% 65%)", description: "Explore ancient wisdom" },
    ],
  },
];

interface ProfileHubSheetProps {
  className?: string;
}

export function ProfileHubSheet({ className }: ProfileHubSheetProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { streak } = useStreak();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Stoic";

  const handleNavigate = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/landing");
  };

  return (
    <>
      <SideTabTrigger
        side="right"
        icon={User}
        onClick={() => setOpen(true)}
        isOpen={open}
        label="Open profile and tools"
        className={className}
      />
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 border-l-0">
          <div className="flex flex-col h-full bg-background">
            {/* Profile Header */}
            <div className="relative px-5 pt-6 pb-5">
              {/* Gradient accent line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, hsl(90 100% 79%) 0%, hsl(187 100% 60%) 100%)' }}
              />
              
              <div className="flex items-center gap-4">
                {/* Avatar with gradient ring */}
                <div className="relative shrink-0">
                  <div 
                    className="absolute -inset-1 rounded-full opacity-70"
                    style={{ background: 'linear-gradient(135deg, hsl(90 100% 79%) 0%, hsl(187 100% 60%) 100%)' }}
                  />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                </div>
                
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-lg truncate">
                    {displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                
                {/* Streak badge */}
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral/10 shrink-0">
                    <Flame className="w-4 h-4 text-coral animate-flame" />
                    <span className="text-sm font-semibold text-coral">{streak}</span>
                  </div>
                )}
              </div>
              
              {/* View Profile button */}
              <button
                onClick={() => handleNavigate('/profile')}
                className={cn(
                  "mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
                  "bg-gradient-to-r from-[hsl(90_100%_79%/0.2)] to-[hsl(187_100%_60%/0.2)]",
                  "border border-[hsl(187_100%_60%/0.3)]",
                  "text-sm font-medium text-foreground",
                  "hover:from-[hsl(90_100%_79%/0.3)] hover:to-[hsl(187_100%_60%/0.3)]",
                  "transition-all duration-200 active:scale-[0.98]"
                )}
              >
                View Journey
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Divider */}
            <div className="mx-5 h-px bg-border/50" />
            
            {/* Tool Categories */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {toolCategories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.id}>
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <CategoryIcon 
                        className="w-4 h-4" 
                        style={{ color: category.color }}
                      />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {category.label}
                      </span>
                    </div>
                    
                    {/* Tools */}
                    <div className="space-y-1">
                      {category.tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <SheetClose key={tool.id} asChild>
                            <button
                              onClick={() => handleNavigate(tool.route)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all active:scale-[0.98] group"
                            >
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${tool.color}20` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: tool.color }} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-foreground">{tool.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer - Settings, About, Sign Out */}
            <div className="shrink-0 border-t border-border/50 p-4 space-y-1">
              <SheetClose asChild>
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all active:scale-[0.98] group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple/10">
                    <Settings className="w-5 h-5 text-purple" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Settings</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </button>
              </SheetClose>
              
              <SheetClose asChild>
                <button
                  onClick={() => handleNavigate('/about')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all active:scale-[0.98] group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted">
                    <Info className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">About</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </button>
              </SheetClose>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-all active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-destructive/10">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-sm font-medium text-destructive">Sign Out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

