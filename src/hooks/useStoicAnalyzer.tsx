import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

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
}

const STORAGE_KEY_PREFIX = 'wellwell_analysis_';

export function useStoicAnalyzer() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<StoicResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);

  // Fallback response generator (Fix #6) - defined early for use in error handling
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
      toast.info("Analysis cancelled");
    }
  };

  const analyze = async ({ tool, input, requestId }: AnalyzeParams) => {
    if (!user) {
      toast.error("Please sign in to continue");
      return null;
    }

    // Guard against concurrent calls
    if (isLoading) {
      logger.warn("Analysis already in progress, ignoring duplicate call");
      toast.info("Analysis already in progress. Please wait.");
      return null;
    }

    // Generate or use provided request ID
    const reqId = requestId || generateRequestId(tool, input);
    currentRequestIdRef.current = reqId;

    // Check for existing event (idempotency)
    const exists = await checkExistingEvent(reqId);
    if (exists) {
      logger.info("Skipping duplicate request", { requestId: reqId });
      toast.info("This analysis was already completed");
      return null;
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setResponse(null);

    try {
      logger.info("Calling stoic-analyzer", { tool, userId: user.id, requestId: reqId });

      // Refresh profile context before AI call (Fix #8)
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
      const invokePromise = supabase.functions.invoke("stoic-analyzer", {
        body: payload,
      });

      // Check if cancelled
      if (signal.aborted) {
        logger.info("Analysis cancelled before API call");
        return null;
      }

      const { data, error } = await invokePromise;

      // Check if cancelled after API call
      if (signal.aborted) {
        logger.info("Analysis cancelled after API call");
        return null;
      }

      if (error) {
        logger.error("Stoic analyzer error", { error, requestId: reqId });
        
        // Specific error messages (Fix #9)
        let errorMessage = "Failed to get insight. Please try again.";
        if (error.message?.includes("rate limit") || error.message?.includes("429")) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.message?.includes("402") || error.message?.includes("limit")) {
          errorMessage = "AI usage limit reached. Please try again later.";
        } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        }
        
        toast.error(errorMessage);
        
        // Provide fallback response (Fix #6)
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
      
      // Save the event only after successful AI response (with request ID for idempotency)
      const { error: eventError } = await supabase.from("events").insert({
        profile_id: user.id,
        tool_name: tool,
        raw_input: input,
        question_key: reqId, // Use request ID instead of tool name
        structured_values: analysis ? { 
          ai_response: true,
          request_id: reqId,
          response: transformedResponse, // Store response for recovery
        } : null,
      });

      if (eventError) {
        logger.warn("Failed to save event", { error: eventError });
      }
      
      // Transform the response to match our expected format
      const transformedResponse: StoicResponse = {
        summary: analysis?.day_summary || analysis?.reality_check || analysis?.summary,
        control_map: Array.isArray(analysis?.control_map?.yours) 
          ? `Yours: ${analysis.control_map.yours.join(', ')}. Not yours: ${analysis.control_map.not_yours?.join(', ')}`
          : analysis?.control_map,
        virtue_focus: analysis?.virtue_rationale || analysis?.reframe || analysis?.virtue_focus,
        surprise_or_tension: analysis?.surprise_or_tension || analysis?.intensity_assessment,
        stance: analysis?.stance || analysis?.tomorrow_focus,
        action: analysis?.immediate_action || analysis?.grounding_prompt || (analysis?.key_actions?.[0]),
        virtue_updates: analysis?.virtue_movements?.map((vm: { virtue: string; delta: number }) => ({
          virtue: vm.virtue,
          delta: vm.delta,
        })) || (analysis?.virtue ? [{
          virtue: analysis.virtue,
          delta: 0,
        }] : undefined),
      };
      
      setResponse(transformedResponse);

      // Persist state to storage (Fix #2)
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

      // Update virtue scores if provided (Fix #7: Batch update for transaction-like behavior)
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
      
      // Provide fallback response on unexpected errors (Fix #6)
      const fallbackResponse = getFallbackResponse(tool, input);
      if (fallbackResponse) {
        logger.info("Using fallback response after error", { tool });
        setResponse(fallbackResponse);
        return fallbackResponse;
      }
      
      toast.error("Something went wrong. Please try again.");
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
    cancel, // Expose cancel function (Fix #1)
  };
}
