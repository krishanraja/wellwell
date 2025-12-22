/**
 * Auth Debug Panel (Dev Only)
 * 
 * Shows current auth state, session info, and route guard decisions.
 * Only renders in development mode.
 */

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { determineAuthState } from "@/lib/authStateMachine";

export function AuthDebugPanel() {
  const { user, session, loading, sessionExpired } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();

  // Only render in development
  if (import.meta.env.PROD) {
    return null;
  }

  const authState = determineAuthState(
    user,
    session,
    false // TODO: Track local progress
  );

  const maskToken = (token: string | undefined) => {
    if (!token) return 'null';
    return token.substring(0, 20) + '...' + token.substring(token.length - 10);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'null';
    return new Date(date).toLocaleString();
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto z-50 bg-background/95 backdrop-blur border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Auth Debug Panel (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Auth State */}
        <div>
          <div className="font-semibold mb-1">Auth State</div>
          <Badge variant="outline">{authState}</Badge>
          {sessionExpired && <Badge variant="destructive" className="ml-2">Expired</Badge>}
        </div>

        {/* Loading States */}
        <div>
          <div className="font-semibold mb-1">Loading</div>
          <div className="space-y-1">
            <div>Auth: {loading ? '⏳' : '✅'}</div>
            <div>Profile: {isProfileLoading ? '⏳' : '✅'}</div>
          </div>
        </div>

        {/* User Info */}
        <div>
          <div className="font-semibold mb-1">User</div>
          <div className="space-y-1 font-mono text-xs">
            <div>ID: {user?.id || 'null'}</div>
            <div>Email: {user?.email || 'null'}</div>
            <div>Verified: {user?.email_confirmed_at ? '✅' : '❌'}</div>
            <div>Created: {formatDate(user?.created_at)}</div>
          </div>
        </div>

        {/* Session Info */}
        <div>
          <div className="font-semibold mb-1">Session</div>
          <div className="space-y-1 font-mono text-xs break-all">
            <div>Access Token: {maskToken(session?.access_token)}</div>
            <div>Refresh Token: {maskToken(session?.refresh_token)}</div>
            <div>Expires: {formatDate(session?.expires_at)}</div>
            <div>Expires In: {session?.expires_at 
              ? `${Math.round((new Date(session.expires_at).getTime() - Date.now()) / 1000 / 60)} min`
              : 'null'}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div>
          <div className="font-semibold mb-1">Profile</div>
          <div className="space-y-1 font-mono text-xs">
            <div>Exists: {profile ? '✅' : '❌'}</div>
            {profile && (
              <>
                <div>Display Name: {profile.display_name || 'null'}</div>
                <div>Persona: {profile.persona || 'null'}</div>
                <div>Challenges: {profile.challenges?.length || 0}</div>
                <div>Goals: {profile.goals?.length || 0}</div>
              </>
            )}
          </div>
        </div>

        {/* Route Guard Decision */}
        <div>
          <div className="font-semibold mb-1">Route Guard</div>
          <div className="space-y-1">
            <div>Allowed: {user ? '✅' : '❌'}</div>
            <div>Reason: {user ? 'Authenticated' : 'Not authenticated'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

