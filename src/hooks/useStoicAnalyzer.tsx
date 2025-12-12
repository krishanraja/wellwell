import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("stoic-analyzer", {
        body: {
          tool,
          input,
          profile_id: user.id,
        },
      });

      if (error) {
        logger.error("Stoic analyzer error", { error });
        toast.error("Failed to get insight. Please try again.");
        return null;
      }

      logger.info("Stoic analyzer response", { data });
      setResponse(data);

      // Update virtue scores if provided
      if (data.virtue_updates && Array.isArray(data.virtue_updates)) {
        for (const update of data.virtue_updates) {
          const { error: updateError } = await supabase
            .from("virtue_scores")
            .update({
              score: supabase.rpc ? undefined : update.delta, // Will use delta in real impl
              delta: update.delta,
            })
            .eq("profile_id", user.id)
            .eq("virtue", update.virtue);

          if (updateError) {
            logger.warn("Failed to update virtue score", { error: updateError, virtue: update.virtue });
          }
        }
      }

      return data;
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
