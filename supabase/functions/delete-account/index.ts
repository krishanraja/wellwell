import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    logStep("ERROR", { message: "Missing required environment variables" });
    return new Response(
      JSON.stringify({ 
        error: "Server configuration error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  const supabaseClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.id) {
      throw new Error("User not authenticated or user ID not available");
    }
    
    const maskedEmail = user.email?.replace(/^(.{2})(.*)(@.*)$/, '$1***$3') || 'unknown';
    logStep("User authenticated", { userId: user.id, email: maskedEmail });

    // Delete user account using admin API (requires service role key)
    // This will cascade delete profile and all related data due to ON DELETE CASCADE
    logStep("Deleting user account", { userId: user.id });
    
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      logStep("ERROR", { message: deleteError.message, userId: user.id });
      throw new Error(`Failed to delete user account: ${deleteError.message}`);
    }

    logStep("Account deleted successfully", { userId: user.id });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Account deleted successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
