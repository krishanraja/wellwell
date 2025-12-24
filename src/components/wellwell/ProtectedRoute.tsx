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
    // Only set ready when loading is complete
    // This ensures we don't render children until auth state is fully determined
    if (!loading) {
      // Small delay to ensure all state updates have propagated
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [loading]);

  // NOW handle conditional rendering (no hooks after this point)
  // Show configuration error if present
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

  // Always render children to ensure hooks are called consistently
  // Show loading overlay if needed, but children are always mounted
  // Only redirect if we're certain there's no user (after loading completes)
  if (!user && !loading && isReady) {
    return <Navigate to="/landing" replace />;
  }

  // Always render children - this ensures hooks are called on every render
  // Show loading overlay on top if loading or not ready
  return (
    <>
      {(loading || !isReady) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </>
  );
}
