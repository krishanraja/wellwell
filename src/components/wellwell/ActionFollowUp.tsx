import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PendingAction {
  action: string;
  committedAt: string;
  input: string;
  virtue: string;
}

interface ActionFollowUpProps {
  pendingAction: PendingAction;
  onComplete: (completed: boolean, action: PendingAction) => void;
  onDismiss: () => void;
  className?: string;
}

export function ActionFollowUp({ 
  pendingAction, 
  onComplete, 
  onDismiss,
  className 
}: ActionFollowUpProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  const handleYes = () => {
    setShowCelebration(true);
    // Brief celebration before completing
    setTimeout(() => {
      onComplete(true, pendingAction);
    }, 1500);
  };

  const handleNo = () => {
    onComplete(false, pendingAction);
  };

  // Celebration view
  if (showCelebration) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in",
        className
      )}>
        <div className="text-center px-8 animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-breathe">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Well done
          </h2>
          <p className="text-sm text-muted-foreground">
            That's <span className="text-primary capitalize">{pendingAction.virtue}</span> in action.
          </p>
        </div>
      </div>
    );
  }

  // Follow-up prompt
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in",
      className
    )}>
      <div className="w-full max-w-lg mx-auto p-4 pb-safe animate-slide-up">
        <div className="glass-card-glow p-5 relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Check-in
              </p>
              <p className="text-xs text-muted-foreground">
                You committed to this earlier
              </p>
            </div>
          </div>
          
          {/* Action reminder */}
          <div className="p-3 bg-muted/30 rounded-xl mb-4">
            <p className="text-sm text-foreground leading-relaxed break-words">
              {pendingAction.action}
            </p>
          </div>
          
          {/* Question */}
          <p className="text-sm font-medium text-foreground mb-4">
            Did you complete this action?
          </p>
          
          {/* Response buttons */}
          <div className="flex gap-3 w-full">
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1 min-w-0"
              onClick={handleNo}
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">Not yet</span>
            </Button>
            <Button 
              size="lg" 
              className="flex-1 min-w-0 bg-primary hover:bg-primary/90"
              onClick={handleYes}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Yes, done</span>
            </Button>
          </div>
          
          {/* Re-commit option for "not yet" */}
          <button
            onClick={onDismiss}
            className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            <span>Remind me later</span>
          </button>
        </div>
      </div>
    </div>
  );
}






