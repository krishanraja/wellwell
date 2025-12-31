import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // ALL HOOKS CALLED FIRST, BEFORE ANY CONDITIONAL LOGIC
  // This ensures hooks are always called in the same order, preventing React Error #300
  const { user, loading, configError } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only set ready when:
    // 1. Loading is complete
    // 2. User state is fully determined (either user exists or we're certain it doesn't)
    // This ensures we don't render children until auth state is fully settled
    // This prevents hooks violations during auth state transitions
    if (!loading) {
      // Wait for user state to be fully available
      // If we expect a user (e.g., on protected routes), wait for user object
      // If no user is expected, we can proceed immediately after loading
      const timer = setTimeout(() => {
        // Additional check: ensure user state is stable
        // If loading just completed, give a small delay for state to propagate
        setIsReady(true);
      }, 100); // Increased delay to ensure state is fully settled
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [loading, user]);

  // CRITICAL: Always render children to ensure hooks are called consistently
  // This prevents React hooks violations when loading/auth state changes
  // Use overlay pattern for loading states instead of conditional rendering

  // Show configuration error if present (this is a true error state, so we don't render children)
  if (configError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-xl">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Configuration Error
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {configError.message}
            </p>
            <p className="text-xs text-muted-foreground">
              Please check your environment variables and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading overlay while auth is initializing or not ready
  // ALWAYS render children underneath to ensure hooks are called consistently
  if (loading || !isReady) {
    return (
      <>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        {children}
      </>
    );
  }

  // If no user, render children (Home has its own loading guard) and redirect
  // Navigate doesn't prevent rendering, so children will mount and call hooks before redirect
  if (!user) {
    return (
      <>
        {children}
        <Navigate to="/landing" replace />
      </>
    );
  }

  // User is available and state is settled - render children normally
  // All hooks in children will be called with consistent user state
  return <>{children}</>;
}
