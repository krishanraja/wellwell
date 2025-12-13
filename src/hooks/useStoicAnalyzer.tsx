import { useState } from "react";
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
}

export function useStoicAnalyzer() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<StoicResponse | null>(null);

  const analyze = async ({ tool, input }: AnalyzeParams) => {
    if (!user) {
      toast.error("Please sign in to continue");
      return null;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      logger.info("Calling stoic-analyzer", { tool, userId: user.id });

      // Save the event first
      const { error: eventError } = await supabase.from("events").insert({
        profile_id: user.id,
        tool_name: tool,
        raw_input: input,
        question_key: tool,
      });

      if (eventError) {
        logger.warn("Failed to save event", { error: eventError });
      }

      // Build profile context for personalization
      const profileContext = profile ? {
        persona: profile.persona,
        challenges: profile.challenges || [],
        goals: profile.goals || [],
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

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("stoic-analyzer", {
        body: payload,
      });

      if (error) {
        logger.error("Stoic analyzer error", { error });
        toast.error("Failed to get insight. Please try again.");
        return null;
      }

      logger.info("Stoic analyzer response", { data });
      
      // Extract the analysis from the response
      const analysis = data?.analysis || data;
      
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

      // Update virtue scores if provided
      if (transformedResponse.virtue_updates && Array.isArray(transformedResponse.virtue_updates)) {
        for (const update of transformedResponse.virtue_updates) {
          if (update.delta !== 0) {
            // Get current score
            const { data: currentScores } = await supabase
              .from("virtue_scores")
              .select("score")
              .eq("profile_id", user.id)
              .eq("virtue", update.virtue)
              .order("recorded_at", { ascending: false })
              .limit(1);

            const currentScore = currentScores?.[0]?.score || 50;
            const newScore = Math.max(0, Math.min(100, currentScore + update.delta));

            const { error: updateError } = await supabase
              .from("virtue_scores")
              .insert({
                profile_id: user.id,
                virtue: update.virtue,
                score: newScore,
                delta: update.delta,
              });

            if (updateError) {
              logger.warn("Failed to update virtue score", { error: updateError, virtue: update.virtue });
            }
          }
        }
      }

      return transformedResponse;
    } catch (err) {
      logger.error("Unexpected error in stoic analyzer", { error: err });
      toast.error("Something went wrong. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResponse(null);
  };

  return {
    analyze,
    isLoading,
    response,
    reset,
  };
}
