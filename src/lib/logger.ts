/**
 * WellWell Logging Service
 * 
 * Centralized logging with structured format for debugging and analytics.
 * Captures: user interactions, AI calls, data operations, performance metrics.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  toolName?: string;
  component?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
  traceId: string;
}

// Generate a trace ID for the current session
const generateTraceId = (): string => {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Session trace ID (persists for the browser session)
let sessionTraceId: string | null = null;

const getTraceId = (): string => {
  if (!sessionTraceId) {
    sessionTraceId = generateTraceId();
  }
  return sessionTraceId;
};

// Log level priority for filtering
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

// Current log level (can be configured)
const getCurrentLogLevel = (): LogLevel => {
  // In production, default to 'info' to reduce noise
  const isDev = import.meta.env.DEV;
  return isDev ? 'debug' : 'info';
};

// Check if log should be output based on level
const shouldLog = (level: LogLevel): boolean => {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
};

// Format log entry for console
const formatLogEntry = (entry: LogEntry): string => {
  const contextStr = Object.keys(entry.context).length > 0
    ? ` | ${JSON.stringify(entry.context)}`
    : '';
  return `[${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
};

// Get console method for log level
const getConsoleMethod = (level: LogLevel): typeof console.log => {
  switch (level) {
    case 'debug':
      return console.debug;
    case 'info':
      return console.info;
    case 'warn':
      return console.warn;
    case 'error':
    case 'critical':
      return console.error;
    default:
      return console.log;
  }
};

// Core log function
const log = (level: LogLevel, message: string, context: LogContext = {}): LogEntry => {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    traceId: getTraceId(),
  };

  if (shouldLog(level)) {
    const consoleMethod = getConsoleMethod(level);
    consoleMethod(formatLogEntry(entry));
    
    // For errors, also log the full entry for debugging
    if (level === 'error' || level === 'critical') {
      console.groupCollapsed('Full log entry');
      console.log(entry);
      console.groupEnd();
    }
  }

  return entry;
};

// Public API
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  critical: (message: string, context?: LogContext) => log('critical', message, context),
  
  // Specialized loggers for common operations
  
  /**
   * Log user interaction (button clicks, form submissions, navigation)
   */
  interaction: (action: string, context?: LogContext) => {
    return log('info', `User: ${action}`, { action, ...context });
  },
  
  /**
   * Log AI/LLM operations
   */
  ai: (operation: string, context?: LogContext) => {
    return log('info', `AI: ${operation}`, { operation, ...context });
  },
  
  /**
   * Log database operations
   */
  db: (operation: string, table: string, context?: LogContext) => {
    return log('debug', `DB: ${operation} on ${table}`, { operation, table, ...context });
  },
  
  /**
   * Log performance metrics
   */
  perf: (metric: string, durationMs: number, context?: LogContext) => {
    return log('debug', `Perf: ${metric} took ${durationMs}ms`, { metric, duration: durationMs, ...context });
  },
  
  /**
   * Log API calls
   */
  api: (method: string, endpoint: string, status?: number, context?: LogContext) => {
    const level: LogLevel = status && status >= 400 ? 'error' : 'debug';
    return log(level, `API: ${method} ${endpoint}${status ? ` → ${status}` : ''}`, { method, endpoint, status, ...context });
  },
  
  /**
   * Start a timed operation (returns a function to call when complete)
   */
  startTimer: (operation: string, context?: LogContext): (() => number) => {
    const startTime = performance.now();
    log('debug', `Timer start: ${operation}`, context);
    
    return () => {
      const duration = Math.round(performance.now() - startTime);
      log('debug', `Timer end: ${operation} (${duration}ms)`, { ...context, duration });
      return duration;
    };
  },
  
  /**
   * Get current trace ID for linking logs
   */
  getTraceId,
  
  /**
   * Set user context for subsequent logs
   */
  setUserContext: (userId: string) => {
    log('info', 'User context set', { userId });
  },

  /**
   * Log auth funnel events (privacy-safe: no PII)
   */
  authFunnel: (event: string, context?: LogContext) => {
    // Privacy-safe: only log event name and metadata, never email or PII
    return log('info', `Auth Funnel: ${event}`, { 
      event,
      category: 'auth_funnel',
      ...context 
    });
  },

  /**
   * Log onboarding funnel events
   */
  onboardingFunnel: (event: string, step?: number, context?: LogContext) => {
    return log('info', `Onboarding Funnel: ${event}`, { 
      event,
      step,
      category: 'onboarding_funnel',
      ...context 
    });
  },
};

export default logger;
