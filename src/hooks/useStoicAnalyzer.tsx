import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { logger } from "@/lib/logger";

interface StoicResponse {
  summary?: string;
  control_map?: string;
  virtue_focus?: string;
  surprise_or_tension?: string;
  stance?: string;
  action?: string;
  virtue_updates?: Array<{
    virtue: string;
    delta: number;
  }>;
}

interface AnalyzeParams {
  tool: string;
  input: string;
  requestId?: string; // For idempotency
  onError?: (error: string) => void; // Error callback
}

const STORAGE_KEY_PREFIX = 'wellwell_analysis_';

export function useStoicAnalyzer() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<StoicResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);

  // Fallback response generator - defined early for use in error handling
  const getFallbackResponse = (tool: string, input: string): StoicResponse | null => {
    const baseResponse: StoicResponse = {
      control_map: "Focus on what you can control: your response, your effort, your composure. What's not yours: others' reactions, outcomes, timing.",
      virtue_focus: "Lead with wisdom and courage.",
      stance: "I will respond with clarity and intention.",
    };

    switch (tool) {
      case 'pulse':
        return {
          ...baseResponse,
          summary: `You're preparing for: "${input.slice(0, 100)}${input.length > 100 ? '...' : ''}"`,
        };
      case 'intervene':
        return {
          ...baseResponse,
          summary: "Take a moment. Breathe. This feeling will pass. Focus on what you can control right now.",
          action: "Pause and observe your reaction without judgment.",
        };
      case 'debrief':
        return {
          ...baseResponse,
          summary: "Reflect on what happened. What did you control? What didn't you? What will you do differently?",
        };
      default:
        return baseResponse;
    }
  };

  // Restore state from storage on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.response && parsed.timestamp) {
          // Only restore if less than 5 minutes old
          const age = Date.now() - parsed.timestamp;
          if (age < 5 * 60 * 1000) {
            setResponse(parsed.response);
            logger.debug("Restored analysis state from storage");
          } else {
            sessionStorage.removeItem(storageKey);
          }
        }
      }
    } catch (err) {
      logger.warn("Failed to restore analysis state", { error: err });
    }
  }, [user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Generate request ID for idempotency
  const generateRequestId = (tool: string, input: string): string => {
    // Create a hash-like ID from tool + input (first 50 chars) + timestamp
    const inputHash = input.slice(0, 50).replace(/\s/g, '');
    return `${tool}_${inputHash}_${Date.now()}`;
  };

  // Check for existing event with same request ID (idempotency)
  const checkExistingEvent = async (requestId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data } = await supabase
        .from("events")
        .select("id, structured_values")
        .eq("profile_id", user.id)
        .eq("question_key", requestId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        logger.info("Found existing event for request", { requestId });
        // Try to restore response from structured_values
        const structured = data.structured_values as Record<string, unknown> | null;
        if (structured?.ai_response) {
          return true; // Event exists, skip duplicate call
        }
      }
    } catch (err) {
      logger.warn("Failed to check existing event", { error: err });
    }
    return false;
  };

  const cancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      logger.info("Analysis cancelled by user");
    }
  };

  const analyze = async ({ tool, input, requestId, onError }: AnalyzeParams) => {
    if (!user) {
      onError?.("Please sign in to continue");
      return null;
    }

    // Guard against concurrent calls
    if (isLoading) {
      logger.warn("Analysis already in progress, ignoring duplicate call");
      onError?.("Analysis already in progress. Please wait.");
      return null;
    }

    // Generate or use provided request ID
    const reqId = requestId || generateRequestId(tool, input);
    currentRequestIdRef.current = reqId;

    // Check for existing event (idempotency)
    const exists = await checkExistingEvent(reqId);
    if (exists) {
      logger.info("Skipping duplicate request", { requestId: reqId });
      onError?.("This analysis was already completed");
      return null;
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setResponse(null);

    try {
      logger.info("Calling stoic-analyzer", { tool, userId: user.id, requestId: reqId });

      // Refresh profile context before AI call
      let freshProfile = profile;
      if (profileLoading || !profile) {
        // Fetch fresh profile if not available
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profileData) {
          freshProfile = profileData as typeof profile;
        }
      }

      // Build profile context for personalization (using fresh profile)
      const profileContext = freshProfile ? {
        persona: freshProfile.persona,
        challenges: freshProfile.challenges || [],
        goals: freshProfile.goals || [],
      } : undefined;

      // Determine request type and build payload
      let payload: Record<string, unknown>;
      
      if (tool === 'pulse') {
        payload = {
          type: 'pulse',
          challenge: input,
          profile_context: profileContext,
        };
      } else if (tool === 'intervene') {
        // Parse the input which contains trigger and intensity
        try {
          const parsed = JSON.parse(input);
          payload = {
            type: 'intervene',
            trigger: parsed.trigger,
            intensity: parsed.intensity || 5,
            profile_context: profileContext,
          };
        } catch {
          payload = {
            type: 'intervene',
            trigger: input,
            intensity: 5,
            profile_context: profileContext,
          };
        }
      } else if (tool === 'debrief') {
        // Parse debrief answers
        try {
          const parsed = JSON.parse(input);
          payload = {
            type: 'debrief',
            challenge_faced: parsed.controlled || '',
            response_given: parsed.escaped || '',
            would_do_differently: parsed.tomorrow || '',
            profile_context: profileContext,
          };
        } catch {
          payload = {
            type: 'debrief',
            challenge_faced: input,
            response_given: '',
            would_do_differently: '',
            profile_context: profileContext,
          };
        }
      } else if (tool === 'unified') {
        // New unified input mode - AI routes intelligently
        payload = {
          type: 'unified',
          input: input,
          profile_context: profileContext,
        };
      } else if (tool === 'decision') {
        // Single-input decision mode
        payload = {
          type: 'decision',
          dilemma: input,
          profile_context: profileContext,
        };
      } else if (tool === 'conflict') {
        // Single-input conflict mode
        payload = {
          type: 'conflict',
          situation: input,
          profile_context: profileContext,
        };
      } else {
        // Generic fallback
        payload = {
          type: 'pulse',
          challenge: input,
          profile_context: profileContext,
        };
      }

      // Call the edge function with abort signal support
      // #region agent log
      const session = await supabase.auth.getSession();
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStoicAnalyzer.tsx:analyze',message:'Before invoke: checking session',data:{hasSession:!!session.data.session,hasToken:!!session.data.session?.access_token,userId:user?.id,tool},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const invokePromise = supabase.functions.invoke("stoic-analyzer", {
        body: payload,
      });

      // Check if cancelled
      if (signal.aborted) {
        logger.info("Analysis cancelled before API call");
        return null;
      }

      const { data, error } = await invokePromise;

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStoicAnalyzer.tsx:analyze',message:'After invoke: response received',data:{hasError:!!error,errorMessage:error?.message,hasData:!!data,statusCode:error?.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Check if cancelled after API call
      if (signal.aborted) {
        logger.info("Analysis cancelled after API call");
        return null;
      }

      if (error) {
        logger.error("Stoic analyzer error", { error, requestId: reqId });
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useStoicAnalyzer.tsx:analyze',message:'Edge function error',data:{errorMessage:error.message,errorStatus:error.status,errorContext:error.context,isAuthError:error.message?.includes('Unauthorized')||error.status===401,fullError:JSON.stringify(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Specific error messages
        let errorMessage = "Failed to get insight. Please try again.";
        if (error.message?.includes("rate limit") || error.message?.includes("429")) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.message?.includes("402") || error.message?.includes("limit")) {
          errorMessage = "AI usage limit reached. Please try again later.";
        } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message?.includes("Unauthorized") || error.status === 401) {
          errorMessage = "Authentication failed. Please sign in again.";
        } else if (error.message?.includes("AI service not configured") || error.message?.includes("not configured")) {
          errorMessage = "AI service is not configured. Please contact support.";
        }
        
        onError?.(errorMessage);
        
        // Provide fallback response
        const fallbackResponse = getFallbackResponse(tool, input);
        if (fallbackResponse) {
          logger.info("Using fallback response", { tool });
          setResponse(fallbackResponse);
          return fallbackResponse;
        }
        
        return null;
      }

      logger.info("Stoic analyzer response", { data });
      
      // Extract the analysis from the response
      const analysis = data?.analysis || data;
      
      // CRITICAL FIX: Transform the response BEFORE using it in the event insert
      // Handle all possible response formats from different tool types
      let controlMapStr: string | undefined;
      if (analysis?.control_map) {
        if (typeof analysis.control_map === 'string') {
          controlMapStr = analysis.control_map;
        } else if (Array.isArray(analysis.control_map.yours)) {
          const yours = analysis.control_map.yours.join(', ');
          const notYours = Array.isArray(analysis.control_map.not_yours) 
            ? analysis.control_map.not_yours.join(', ') 
            : '';
          controlMapStr = `Yours: ${yours}. Not yours: ${notYours}`;
        }
      }

      // Extract virtue updates from various response formats
      let virtueUpdates: Array<{ virtue: string; delta: number }> | undefined;
      if (analysis?.virtue_movements && Array.isArray(analysis.virtue_movements)) {
        virtueUpdates = analysis.virtue_movements.map((vm: { virtue: string; delta: number }) => ({
          virtue: vm.virtue,
          delta: vm.delta || 0,
        }));
      } else if (analysis?.virtue) {
        // Single virtue from pulse/unified response
        virtueUpdates = [{
          virtue: analysis.virtue,
          delta: 0,
        }];
      } else if (analysis?.virtue_applicable) {
        // Intervene response format
        virtueUpdates = [{
          virtue: analysis.virtue_applicable,
          delta: 0,
        }];
      }

      const transformedResponse: StoicResponse = {
        summary: analysis?.day_summary || analysis?.reality_check || analysis?.summary || undefined,
        control_map: controlMapStr,
        virtue_focus: analysis?.virtue_rationale || analysis?.reframe || analysis?.virtue_focus || undefined,
        surprise_or_tension: analysis?.surprise_or_tension || analysis?.intensity_assessment || analysis?.key_insight || undefined,
        stance: analysis?.stance || analysis?.tomorrow_stance || analysis?.tomorrow_focus || undefined,
        action: analysis?.immediate_action || analysis?.grounding_prompt || (Array.isArray(analysis?.key_actions) ? analysis.key_actions[0] : undefined),
        virtue_updates: virtueUpdates,
      };
      
      // Save the event only after successful AI response (with request ID for idempotency)
      const { error: eventError } = await supabase.from("events").insert({
        profile_id: user.id,
        tool_name: tool,
        raw_input: input,
        question_key: reqId,
        structured_values: analysis ? { 
          ai_response: true,
          request_id: reqId,
          response: transformedResponse,
        } : null,
      });

      if (eventError) {
        logger.warn("Failed to save event", { error: eventError });
      }
      
      setResponse(transformedResponse);

      // Persist state to storage
      if (user.id) {
        try {
          const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
          sessionStorage.setItem(storageKey, JSON.stringify({
            response: transformedResponse,
            tool,
            input,
            timestamp: Date.now(),
            requestId: reqId,
          }));
        } catch (err) {
          logger.warn("Failed to persist analysis state", { error: err });
        }
      }

      // Update virtue scores if provided (Batch update for transaction-like behavior)
      if (transformedResponse.virtue_updates && Array.isArray(transformedResponse.virtue_updates)) {
        const updates = transformedResponse.virtue_updates.filter(u => u.delta !== 0);
        
        if (updates.length > 0) {
          // Get all current scores in one query
          const { data: currentScores } = await supabase
            .from("virtue_scores")
            .select("virtue, score")
            .eq("profile_id", user.id)
            .in("virtue", updates.map(u => u.virtue))
            .order("recorded_at", { ascending: false });

          // Group by virtue and get latest
          const latestScores = new Map<string, number>();
          if (currentScores) {
            for (const score of currentScores) {
              if (!latestScores.has(score.virtue)) {
                latestScores.set(score.virtue, score.score);
              }
            }
          }

          // Prepare batch insert
          const scoreInserts = updates.map(update => {
            const currentScore = latestScores.get(update.virtue) || 50;
            const newScore = Math.max(0, Math.min(100, currentScore + update.delta));
            return {
              profile_id: user.id,
              virtue: update.virtue,
              score: newScore,
              delta: update.delta,
            };
          });

          // Batch insert (closest we can get to transaction in Supabase)
          const { error: batchError } = await supabase
            .from("virtue_scores")
            .insert(scoreInserts);

          if (batchError) {
            logger.error("Failed to update virtue scores", { error: batchError });
            // Try individual updates as fallback
            for (const insert of scoreInserts) {
              const { error: updateError } = await supabase
                .from("virtue_scores")
                .insert(insert);
              if (updateError) {
                logger.warn("Failed to update individual virtue score", { 
                  error: updateError, 
                  virtue: insert.virtue 
                });
              }
            }
          } else {
            logger.info("Virtue scores updated successfully", { count: scoreInserts.length });
          }
        }
      }

      // Clear abort controller on success
      abortControllerRef.current = null;
      currentRequestIdRef.current = null;

      return transformedResponse;
    } catch (err) {
      // Check if it was a cancellation
      if (err instanceof Error && err.name === 'AbortError') {
        logger.info("Analysis cancelled");
        return null;
      }

      logger.error("Unexpected error in stoic analyzer", { error: err, requestId: reqId });
      
      // Provide fallback response on unexpected errors
      const fallbackResponse = getFallbackResponse(tool, input);
      if (fallbackResponse) {
        logger.info("Using fallback response after error", { tool });
        setResponse(fallbackResponse);
        return fallbackResponse;
      }
      
      onError?.("Something went wrong. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const reset = () => {
    setResponse(null);
    if (user?.id) {
      const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
      sessionStorage.removeItem(storageKey);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return {
    analyze,
    isLoading,
    response,
    reset,
    cancel,
  };
}
