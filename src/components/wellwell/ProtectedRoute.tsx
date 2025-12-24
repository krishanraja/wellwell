import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, configError } = useAuth();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}
