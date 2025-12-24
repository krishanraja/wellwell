import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Extract component name from componentStack for better debugging
    let componentName = 'Unknown';
    try {
      // Try to extract component name from component stack
      // Format: "at ComponentName (file:line:column)"
      const componentMatch = errorInfo.componentStack.match(/at\s+(\w+)/);
      if (componentMatch && componentMatch[1]) {
        componentName = componentMatch[1];
      } else {
        // Try alternative format: "ComponentName\n    at ..."
        const altMatch = errorInfo.componentStack.match(/^(\w+)/);
        if (altMatch && altMatch[1]) {
          componentName = altMatch[1];
        }
      }
    } catch (parseError) {
      // Ignore parse errors
    }
    
    logger.critical("Uncaught error in React component tree", {
      error: error?.message || 'NO ERROR MESSAGE',
      errorName: error?.name || 'NO ERROR NAME',
      errorStack: error?.stack || 'NO STACK',
      errorString: error?.toString(),
      componentStack: errorInfo.componentStack,
      componentName: componentName,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-glow-gradient opacity-30 pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-md text-center space-y-6">
            <div className="inline-flex p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>
            </div>

            {/* Show helpful message for environment variable errors (even in production) */}
            {this.state.error?.message?.includes('VITE_SUPABASE') && (
              <div className="p-4 bg-muted/50 rounded-xl text-left space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Configuration Error Detected
                </p>
                <p className="text-sm text-muted-foreground">
                  The application is missing required environment variables. Please check your deployment configuration.
                </p>
                {import.meta.env.DEV && (
                  <p className="text-xs font-mono text-muted-foreground break-all mt-2 pt-2 border-t border-border">
                    {this.state.error.message}
                  </p>
                )}
              </div>
            )}

            {/* Show full error details in development mode */}
            {import.meta.env.DEV && this.state.error && !this.state.error.message?.includes('VITE_SUPABASE') && (
              <div className="p-4 bg-muted/50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={this.handleReload}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                variant="brand"
                onClick={this.handleGoHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this keeps happening, please{" "}
              <a 
                href="mailto:krish@themindmaker.ai" 
                className="underline hover:text-foreground transition-colors"
              >
                contact support
              </a>.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
