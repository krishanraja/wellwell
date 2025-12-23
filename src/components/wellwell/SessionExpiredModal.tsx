import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionExpiredModalProps {
  open: boolean;
  onRefresh: () => void;
  onSignIn: () => void;
}

export function SessionExpiredModal({ open, onRefresh, onSignIn }: SessionExpiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            <DialogTitle>Session Expired</DialogTitle>
          </div>
          <DialogDescription>
            Your session has expired for security reasons. Please sign in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="w-full sm:w-auto"
          >
            Try Refreshing Session
          </Button>
          <Button
            variant="brand"
            onClick={onSignIn}
            className="w-full sm:w-auto"
          >
            Sign In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


