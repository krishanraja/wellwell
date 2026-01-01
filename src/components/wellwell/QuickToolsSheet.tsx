import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, Target, MessageCircle, AlertTriangle, Zap, Sunrise, Moon, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface QuickTool {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  color: string;
  description: string;
}

const quickTools: QuickTool[] = [
  {
    id: "decision",
    label: "Decision",
    icon: Target,
    route: "/decision",
    color: "hsl(187 100% 42%)",
    description: "Make a clear choice",
  },
  {
    id: "conflict",
    label: "Conflict",
    icon: MessageCircle,
    route: "/conflict",
    color: "hsl(260 80% 65%)",
    description: "Navigate disagreement",
  },
  {
    id: "intervene",
    label: "Intervene",
    icon: AlertTriangle,
    route: "/intervene",
    color: "hsl(8 100% 71%)",
    description: "Handle the moment",
  },
];

const ritualTools: QuickTool[] = [
  {
    id: "pulse",
    label: "Morning Pulse",
    icon: Sunrise,
    route: "/pulse",
    color: "hsl(45 100% 60%)",
    description: "Set your intention",
  },
  {
    id: "debrief",
    label: "Evening Debrief",
    icon: Moon,
    route: "/debrief",
    color: "hsl(260 80% 65%)",
    description: "Reflect on your day",
  },
];

interface QuickToolsSheetProps {
  className?: string;
}

export function QuickToolsSheet({ className }: QuickToolsSheetProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleToolClick = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "p-2.5 rounded-xl transition-all",
            "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            "active:scale-95",
            className
          )}
          aria-label="Open quick tools menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <SheetTitle className="text-left">Quick Tools</SheetTitle>
            </div>
          </SheetHeader>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Situation Tools */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
                Handle a Situation
              </p>
              <div className="space-y-1">
                {quickTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <SheetClose key={tool.id} asChild>
                      <button
                        onClick={() => handleToolClick(tool.route)}
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

            {/* Daily Rituals */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
                Daily Rituals
              </p>
              <div className="space-y-1">
                {ritualTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <SheetClose key={tool.id} asChild>
                      <button
                        onClick={() => handleToolClick(tool.route)}
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
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <p className="text-[10px] text-center text-muted-foreground">
              Choose a tool based on your current need
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
