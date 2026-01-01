import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Zap, Target, MessageCircle, AlertTriangle, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { SideTabTrigger } from "./SideTabTrigger";

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
    <>
      <SideTabTrigger
        side="left"
        icon={Zap}
        onClick={() => setOpen(true)}
        isOpen={open}
        label="Open quick tools"
        className={className}
      />
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-r-0">
          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="relative px-5 pt-6 pb-5">
              {/* Gradient accent line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, hsl(90 100% 79%) 0%, hsl(187 100% 60%) 100%)' }}
              />
              
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(90 100% 79% / 0.3) 0%, hsl(187 100% 60% / 0.3) 100%)',
                    border: '1px solid hsl(187 100% 60% / 0.3)'
                  }}
                >
                  <Zap className="w-6 h-6 text-aqua" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    Quick Tools
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Situational guidance
                  </p>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="mx-5 h-px bg-border/50" />
            
            {/* Tools */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
                Choose Your Challenge
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

            {/* Footer */}
            <div className="shrink-0 p-4 border-t border-border/50">
              <p className="text-[10px] text-center text-muted-foreground">
                Choose a tool based on your current challenge
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
