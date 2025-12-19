import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Zap, ChevronUp, Target, MessageCircle, AlertTriangle } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            className
          )}
        >
          <Zap className="w-3 h-3" />
          <span>Quick Tools</span>
          <ChevronUp className={cn(
            "w-3 h-3 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </DrawerTrigger>
      
      <DrawerContent className="rounded-t-3xl bg-background border-t border-border/50">
        <div className="px-4 pb-8 pt-2">
          {/* Title */}
          <p className="text-xs font-medium text-muted-foreground text-center mb-4">
            Choose a specific situation
          </p>
          
          {/* Tools Grid */}
          <div className="grid grid-cols-3 gap-3">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <DrawerClose key={tool.id} asChild>
                  <button
                    onClick={() => handleToolClick(tool.route)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md transition-all active:scale-95"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: tool.color }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                    </div>
                  </button>
                </DrawerClose>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
