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
    const errorString = error.toString().toLowerCase();

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

    // React Hooks violations - MUST be checked BEFORE config errors to prevent mis-categorization
    // React error #300: "Rendered fewer hooks than during the previous render"
    // Check multiple sources: message, stack, toString, and URL patterns
    const hasHooksViolationPattern = 
      errorMessage.includes('300') ||
      errorMessage.includes('rendered fewer hooks') ||
      errorMessage.includes('rendered more hooks') ||
      errorMessage.includes('rules of hooks') ||
      errorMessage.includes('minified react error #300') ||
      errorMessage.includes('react error #300') ||
      errorMessage.includes('invariant=300') ||
      errorStack.includes('invariant=300') ||
      errorStack.includes('react error #300') ||
      errorStack.includes('error #300') ||
      errorStack.includes('rendered fewer') ||
      errorStack.includes('rendered more') ||
      errorString.includes('300') ||
      errorString.includes('invariant=300') ||
      // Check for URL patterns in error message (React error decoder links)
      (errorMessage.includes('error-decoder') && errorMessage.includes('invariant=300')) ||
      (errorMessage.includes('reactjs.org') && errorMessage.includes('300'));

    if (hasHooksViolationPattern) {
      return {
        category: 'component',
        title: 'Component Error',
        message: 'A React hooks violation occurred. This usually happens when components conditionally call hooks. The error has been logged for investigation.',
        recoveryActions: [
          'Try reloading the page',
          'Clear your browser cache',
          'Go back to home and try again',
          'Contact support if this keeps happening',
        ],
        icon: Code,
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
    
    // Enhanced hooks violation detection - match the same patterns as categorizeError
    const errorMessageLower = error?.message?.toLowerCase() || '';
    const errorStackLower = error?.stack?.toLowerCase() || '';
    const errorStringLower = error?.toString()?.toLowerCase() || '';
    
    const isHooksError = 
      errorMessageLower.includes('hooks') || 
      errorMessageLower.includes('rendered') ||
      errorMessageLower.includes('300') ||
      errorMessageLower.includes('rules of hooks') ||
      errorMessageLower.includes('minified react error #300') ||
      errorMessageLower.includes('react error #300') ||
      errorMessageLower.includes('invariant=300') ||
      errorStackLower.includes('invariant=300') ||
      errorStackLower.includes('react error #300') ||
      errorStackLower.includes('error #300') ||
      errorStackLower.includes('rendered fewer') ||
      errorStackLower.includes('rendered more') ||
      errorStringLower.includes('300') ||
      errorStringLower.includes('invariant=300') ||
      (errorMessageLower.includes('error-decoder') && errorMessageLower.includes('invariant=300')) ||
      (errorMessageLower.includes('reactjs.org') && errorMessageLower.includes('300'));
    
    // Determine error category for logging
    const errorContext = this.categorizeError(error);
    
    // Comprehensive diagnostic logging
    logger.critical("Uncaught error in React component tree", {
      error: error?.message || 'NO ERROR MESSAGE',
      errorName: error?.name || 'NO ERROR NAME',
      errorStack: error?.stack || 'NO STACK',
      errorString: error?.toString(),
      componentStack: errorInfo.componentStack,
      componentName: componentName,
      allComponentNames: allComponentNames,
      isHooksError: isHooksError,
      categorizedAs: errorContext.category,
      errorTitle: errorContext.title,
      // Diagnostic: log what patterns matched
      patternMatches: {
        messageHas300: errorMessageLower.includes('300'),
        messageHasHooks: errorMessageLower.includes('hooks'),
        messageHasRendered: errorMessageLower.includes('rendered'),
        stackHasInvariant300: errorStackLower.includes('invariant=300'),
        stackHasReact300: errorStackLower.includes('react error #300'),
        stringHas300: errorStringLower.includes('300'),
        messageHasConfig: errorMessageLower.includes('config'),
        messageHasConfiguration: errorMessageLower.includes('configuration'),
      },
      // For hooks errors, log the full stack with enhanced details
      ...(isHooksError && { 
        fullComponentStack: errorInfo.componentStack,
        hooksViolationDetails: {
          errorCode: errorMessageLower.includes('300') ? '300' : 'unknown',
          errorType: errorMessageLower.includes('fewer') ? 'fewer_hooks' : 
                    errorMessageLower.includes('more') ? 'more_hooks' : 'unknown',
          componentNames: allComponentNames,
          stackTrace: error?.stack,
        }
      }),
    });
    
    // Also log to console in dev mode for easier debugging
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error toString:', error?.toString());
      console.error('Component stack:', errorInfo.componentStack);
      console.error('Categorized as:', errorContext.category, '-', errorContext.title);
      console.error('Pattern matches:', {
        messageHas300: errorMessageLower.includes('300'),
        messageHasHooks: errorMessageLower.includes('hooks'),
        messageHasRendered: errorMessageLower.includes('rendered'),
        stackHasInvariant300: errorStackLower.includes('invariant=300'),
        stackHasReact300: errorStackLower.includes('react error #300'),
        stringHas300: errorStringLower.includes('300'),
        messageHasConfig: errorMessageLower.includes('config'),
      });
      if (isHooksError) {
        console.error('🚨 HOOKS VIOLATION DETECTED 🚨');
        console.error('Error Code: React #300 (Hooks Order Violation)');
        console.error('Component names in stack:', allComponentNames);
        console.error('Full component stack:', errorInfo.componentStack);
        console.error('This usually means a component is conditionally calling hooks.');
        console.error('Check components:', allComponentNames.join(', '));
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
