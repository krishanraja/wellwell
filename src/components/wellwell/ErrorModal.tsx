import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
}

export function ErrorModal({ open, onOpenChange, title = "Error", description }: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing error modal state
export function useErrorModal() {
  const [error, setError] = useState<{ title?: string; description: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setOpen(true);
    }
  }, [error]);

  const showError = (description: string, title?: string) => {
    setError({ description, title });
  };

  const close = () => {
    setOpen(false);
    // Clear error after animation completes
    setTimeout(() => setError(null), 200);
  };

  return {
    showError,
    ErrorModal: error ? (
      <ErrorModal
        open={open}
        onOpenChange={setOpen}
        title={error.title}
        description={error.description}
      />
    ) : null,
  };
}
