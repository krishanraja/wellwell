import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionCommitCardProps {
  action: string;
  virtue?: string;
  onCommit: () => void;
  onSkip?: () => void;
  className?: string;
}

export function ActionCommitCard({ 
  action, 
  virtue = "wisdom",
  onCommit, 
  onSkip,
  className 
}: ActionCommitCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4", className)}>
      <div className="action-commit-card w-full max-w-sm animate-scale-in">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Your One Action
              </p>
              <p className="text-xs text-primary capitalize">
                {virtue} in action
              </p>
            </div>
          </div>
          
          {/* Action text */}
          <p className="text-base font-medium text-foreground leading-relaxed mb-6">
            {action}
          </p>
          
          {/* Commit button */}
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 group"
            onClick={onCommit}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            I'll do this
            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Button>
        </div>
      </div>
      
      {/* Skip option */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Show me the full insight →
        </button>
      )}
    </div>
  );
}





