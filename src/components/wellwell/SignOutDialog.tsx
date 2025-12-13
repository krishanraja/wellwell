import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface SignOutDialogProps {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function SignOutDialog({ 
  variant = "outline", 
  size = "sm",
  className = "",
  children 
}: SignOutDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/landing");
    } finally {
      setIsSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button 
            variant={variant} 
            size={size} 
            className={`text-destructive hover:text-destructive ${className}`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You'll need to sign in again to access your insights and virtue progress.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default SignOutDialog;
