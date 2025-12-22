import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PendingAction {
  action: string;
  committedAt: string;
  input: string;
  virtue: string;
}

const STORAGE_KEY = 'wellwell_pending_action';
const FOLLOW_UP_DELAY_MS = 2 * 60 * 60 * 1000; // 2 hours

export function usePendingActions() {
  const { user } = useAuth();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [shouldShowFollowUp, setShouldShowFollowUp] = useState(false);

  // Load pending action from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PendingAction;
        setPendingAction(parsed);
        
        // Check if enough time has passed to show follow-up
        const committedTime = new Date(parsed.committedAt).getTime();
        const now = Date.now();
        const elapsed = now - committedTime;
        
        // Show follow-up if committed more than 2 hours ago (or on app return)
        if (elapsed >= FOLLOW_UP_DELAY_MS) {
          setShouldShowFollowUp(true);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Commit a new action
  const commitAction = useCallback((action: PendingAction) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(action));
    setPendingAction(action);
    setShouldShowFollowUp(false);
  }, []);

  // Clear the pending action
  const clearPendingAction = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingAction(null);
    setShouldShowFollowUp(false);
  }, []);

  // Dismiss follow-up without clearing (remind later)
  const dismissFollowUp = useCallback(() => {
    setShouldShowFollowUp(false);
    // Update committed time to delay next follow-up
    if (pendingAction) {
      const updated = {
        ...pendingAction,
        committedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPendingAction(updated);
    }
  }, [pendingAction]);

  // Complete the action (yes or no)
  const completeAction = useCallback(async (completed: boolean, action: PendingAction) => {
    // Log to events if user is authenticated
    if (user?.id) {
      try {
        await supabase.from('events').insert({
          profile_id: user.id,
          tool_name: 'action_follow_up',
          raw_input: action.action,
          structured_values: {
            completed,
            virtue: action.virtue,
            original_input: action.input,
            committed_at: action.committedAt,
            completed_at: new Date().toISOString(),
          },
        });

        // If completed, give virtue points
        if (completed) {
          await supabase.from('virtue_scores').insert({
            profile_id: user.id,
            virtue: action.virtue,
            score: 55, // Slight boost for completing action
            delta: 5,
          });
        }
      } catch (err) {
        console.warn('Failed to log action completion', err);
      }
    }

    // Clear the pending action
    clearPendingAction();
  }, [user?.id, clearPendingAction]);

  // Check for follow-up on visibility change (app return)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingAction) {
        const committedTime = new Date(pendingAction.committedAt).getTime();
        const now = Date.now();
        const elapsed = now - committedTime;
        
        if (elapsed >= FOLLOW_UP_DELAY_MS) {
          setShouldShowFollowUp(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pendingAction]);

  return {
    pendingAction,
    shouldShowFollowUp,
    commitAction,
    clearPendingAction,
    dismissFollowUp,
    completeAction,
  };
}

