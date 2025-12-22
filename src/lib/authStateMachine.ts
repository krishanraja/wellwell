/**
 * Auth State Machine
 * 
 * Explicit state machine for authentication flows with clear transitions.
 * This replaces scattered boolean checks with a centralized state model.
 */

export type AuthState =
  | 'anonymous_visitor'
  | 'anonymous_with_progress'
  | 'email_captured'
  | 'signed_in_unverified'
  | 'signed_in'
  | 'session_expired'
  | 'signed_out';

export type AuthEvent =
  | 'interact_with_demo'
  | 'request_email'
  | 'sign_up'
  | 'sign_in'
  | 'email_verified'
  | 'token_refreshed'
  | 'token_expired'
  | 'sign_out'
  | 'refresh_failed';

interface StateTransition {
  from: AuthState;
  event: AuthEvent;
  to: AuthState;
  guard?: () => boolean;
}

const transitions: StateTransition[] = [
  // Anonymous visitor flows
  { from: 'anonymous_visitor', event: 'interact_with_demo', to: 'anonymous_with_progress' },
  { from: 'anonymous_with_progress', event: 'request_email', to: 'email_captured' },
  { from: 'email_captured', event: 'sign_up', to: 'signed_in_unverified' },
  { from: 'email_captured', event: 'sign_in', to: 'signed_in' },
  
  // Email verification flow
  { from: 'signed_in_unverified', event: 'email_verified', to: 'signed_in' },
  
  // Session management
  { from: 'signed_in', event: 'token_expired', to: 'session_expired' },
  { from: 'session_expired', event: 'token_refreshed', to: 'signed_in' },
  { from: 'session_expired', event: 'refresh_failed', to: 'anonymous_visitor' },
  
  // Sign out flow
  { from: 'signed_in', event: 'sign_out', to: 'signed_out' },
  { from: 'signed_out', event: 'sign_in', to: 'signed_in' },
  { from: 'signed_out', event: 'sign_up', to: 'signed_in_unverified' },
];

export class AuthStateMachine {
  private currentState: AuthState = 'anonymous_visitor';
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor(initialState?: AuthState) {
    if (initialState) {
      this.currentState = initialState;
    }
  }

  getState(): AuthState {
    return this.currentState;
  }

  canTransition(event: AuthEvent): boolean {
    return transitions.some(
      (t) => t.from === this.currentState && t.event === event && (!t.guard || t.guard())
    );
  }

  transition(event: AuthEvent): AuthState | null {
    const transition = transitions.find(
      (t) => t.from === this.currentState && t.event === event && (!t.guard || t.guard())
    );

    if (!transition) {
      console.warn(
        `Invalid transition: Cannot transition from ${this.currentState} on event ${event}`
      );
      return null;
    }

    const previousState = this.currentState;
    this.currentState = transition.to;

    // Notify listeners
    this.listeners.forEach((listener) => listener(this.currentState));

    console.log(`Auth state: ${previousState} -> ${this.currentState} (event: ${event})`);

    return this.currentState;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.currentState = 'anonymous_visitor';
    this.listeners.forEach((listener) => listener(this.currentState));
  }
}

/**
 * Helper function to determine auth state from user/session data
 */
export function determineAuthState(
  user: { email_confirmed_at: string | null } | null,
  session: { access_token: string } | null,
  hasLocalProgress: boolean
): AuthState {
  if (!user && !session) {
    return hasLocalProgress ? 'anonymous_with_progress' : 'anonymous_visitor';
  }

  if (user && session) {
    if (!user.email_confirmed_at) {
      return 'signed_in_unverified';
    }
    return 'signed_in';
  }

  // Edge case: user exists but no session (expired)
  if (user && !session) {
    return 'session_expired';
  }

  return 'anonymous_visitor';
}

