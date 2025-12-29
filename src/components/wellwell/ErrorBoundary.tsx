import { Component, ErrorInfo, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff, Settings, Code, ChevronDown, ChevronUp } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

type ErrorCategory = 'network' | 'component' | 'config' | 'validation' | 'unknown';

interface ErrorContext {
  category: ErrorCategory;
  title: string;
  message: string;
  recoveryActions: string[];
  icon: typeof AlertTriangle;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private categorizeError(error: Error | null): ErrorContext {
    if (!error) {
      return {
        category: 'unknown',
        title: 'Something went wrong',
        message: 'An unexpected error occurred.',
        recoveryActions: ['Try reloading the page', 'Go back to home'],
        icon: AlertTriangle,
      };
    }

    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    // Network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('failed to fetch') ||
      errorStack.includes('networkerror') ||
      errorStack.includes('typeerror: failed to fetch')
    ) {
      return {
        category: 'network',
        title: 'Connection Issue',
        message: 'Unable to connect to our servers. This might be a temporary network problem.',
        recoveryActions: [
          'Check your internet connection',
          'Wait a moment and try reloading',
          'If using a VPN, try disabling it',
        ],
        icon: WifiOff,
      };
    }

    // Configuration errors
    if (
      errorMessage.includes('vite_supabase') ||
      errorMessage.includes('environment') ||
      errorMessage.includes('configuration') ||
      errorMessage.includes('config')
    ) {
      return {
        category: 'config',
        title: 'Configuration Problem',
        message: 'The application is missing required configuration. This is a setup issue.',
        recoveryActions: [
          'Check your environment variables',
          'Verify your deployment configuration',
          'Contact support if this persists',
        ],
        icon: Settings,
      };
    }

    // Validation errors
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('required') ||
      errorMessage.includes('missing')
    ) {
      return {
        category: 'validation',
        title: 'Validation Error',
        message: 'Some data was invalid or missing. This might be a temporary issue.',
        recoveryActions: [
          'Try reloading the page',
          'Clear your browser cache',
          'Go back and try again',
        ],
        icon: AlertTriangle,
      };
    }

    // Component/React errors
    if (
      errorMessage.includes('component') ||
      errorMessage.includes('render') ||
      errorMessage.includes('hooks') ||
      errorMessage.includes('rendered')
    ) {
      return {
        category: 'component',
        title: 'Something Broke',
        message: 'A component encountered an error. This has been logged and we\'ll look into it.',
        recoveryActions: [
          'Try reloading the page',
          'Go back to home and try again',
          'Clear your browser cache if it keeps happening',
        ],
        icon: Code,
      };
    }

    // Default/Unknown errors
    return {
      category: 'unknown',
      title: 'Something went wrong',
      message: 'An unexpected error occurred. This has been logged and we\'ll look into it.',
      recoveryActions: [
        'Try reloading the page',
        'Go back to home',
        'Contact support if this keeps happening',
      ],
      icon: AlertTriangle,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Extract component name from componentStack for better debugging
    let componentName = 'Unknown';
    let allComponentNames: string[] = [];
    try {
      // Extract all component names from the stack
      const componentMatches = errorInfo.componentStack.matchAll(/at\s+(\w+)/g);
      for (const match of componentMatches) {
        if (match[1]) {
          allComponentNames.push(match[1]);
        }
      }
      
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
    
    // Log full component stack for hooks violations
    const isHooksError = error?.message?.includes('hooks') || error?.message?.includes('Rendered');
    
    logger.critical("Uncaught error in React component tree", {
      error: error?.message || 'NO ERROR MESSAGE',
      errorName: error?.name || 'NO ERROR NAME',
      errorStack: error?.stack || 'NO STACK',
      errorString: error?.toString(),
      componentStack: errorInfo.componentStack,
      componentName: componentName,
      allComponentNames: allComponentNames,
      isHooksError: isHooksError,
      // For hooks errors, log the full stack
      ...(isHooksError && { fullComponentStack: errorInfo.componentStack }),
    });
    
    // Also log to console in dev mode for easier debugging
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error);
      console.error('Component stack:', errorInfo.componentStack);
      if (isHooksError) {
        console.error('HOOKS VIOLATION DETECTED - Component names in stack:', allComponentNames);
      }
    }
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

      const errorContext = this.categorizeError(this.state.error);
      const ErrorIcon = errorContext.icon;

      return (
        <ErrorDisplay
          errorContext={errorContext}
          error={this.state.error}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Separate functional component for error display with hooks
function ErrorDisplay({
  errorContext,
  error,
  onReload,
  onGoHome,
}: {
  errorContext: ErrorContext;
  error: Error | null;
  onReload: () => void;
  onGoHome: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const ErrorIcon = errorContext.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-glow-gradient opacity-30 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md text-center space-y-6">
        <div className="inline-flex p-4 bg-destructive/10 rounded-full">
          <ErrorIcon className="w-10 h-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {errorContext.title}
          </h1>
          <p className="text-muted-foreground">
            {errorContext.message}
          </p>
        </div>

        {/* Recovery Actions */}
        <div className="p-4 bg-muted/50 rounded-xl text-left space-y-2">
          <p className="text-sm font-semibold text-foreground mb-2">
            What you can try:
          </p>
          <ul className="space-y-1.5">
            {errorContext.recoveryActions.map((action, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Details (Collapsible) */}
        {error && (
          <div className="space-y-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide technical details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show technical details
                </>
              )}
            </button>
            {showDetails && (
              <div className="p-4 bg-muted/50 rounded-xl text-left overflow-auto max-h-60 space-y-2">
                <p className="text-xs font-semibold text-foreground mb-2">
                  Error Details:
                </p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message || 'No error message available'}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Stack trace
                    </summary>
                    <pre className="text-xs font-mono text-muted-foreground break-all mt-2 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onReload}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </Button>
          <Button
            variant="brand"
            onClick={onGoHome}
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

export default ErrorBoundary;
