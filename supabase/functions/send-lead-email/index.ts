import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadEmailRequest {
  type: 'signup' | 'waitlist' | 'contact';
  email: string;
  name?: string;
  message?: string;
  source?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-LEAD-EMAIL] ${step}${detailsStr}`);
  
  // Debug logging for verification
  console.log(`[DEBUG] ${step} | ${JSON.stringify(details || {})}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    logStep("ERROR", { message: "RESEND_API_KEY is not configured" });
    return new Response(
      JSON.stringify({ 
        error: "Email service not configured",
        details: "RESEND_API_KEY environment variable is missing"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  try {
    logStep("Function started");
    
    const body: LeadEmailRequest = await req.json();
    logStep("Request received", { type: body.type, email: body.email?.substring(0, 3) + '***' });
    
    if (!body.email || !body.type) {
      throw new Error("Missing required fields: email and type");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw new Error("Invalid email format");
    }

    // Build email content based on type
    let subject: string;
    let htmlContent: string;
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    switch (body.type) {
      case 'signup':
        subject = `🎉 New WellWell Signup: ${body.email}`;
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981; margin-bottom: 20px;">New User Signup!</h1>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${body.email}</p>
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${body.name || 'Not provided'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Source:</strong> ${body.source || 'Direct signup'}</p>
              <p style="margin: 0;"><strong>Time:</strong> ${timestamp}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">A new user has created an account on WellWell. They're ready to start their Stoic journey!</p>
          </div>
        `;
        break;
        
      case 'waitlist':
        subject = `📋 New WellWell Waitlist: ${body.email}`;
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981; margin-bottom: 20px;">New Waitlist Signup!</h1>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${body.email}</p>
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${body.name || 'Not provided'}</p>
              <p style="margin: 0;"><strong>Time:</strong> ${timestamp}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Someone is interested in WellWell and joined the waitlist.</p>
          </div>
        `;
        break;
        
      case 'contact':
        subject = `💬 WellWell Contact Form: ${body.email}`;
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981; margin-bottom: 20px;">New Contact Form Submission</h1>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${body.email}</p>
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${body.name || 'Not provided'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${timestamp}</p>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
              <p style="margin: 0; white-space: pre-wrap;">${body.message || 'No message provided'}</p>
            </div>
          </div>
        `;
        break;
        
      default:
        throw new Error(`Unknown lead type: ${body.type}`);
    }

    logStep("Sending email via Resend", { type: body.type });
    
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WellWell Leads <leads@themindmaker.ai>",
        to: ["krish@themindmaker.ai"],
        subject: subject,
        html: htmlContent,
        reply_to: body.email,
      }),
    });

    const resendData = await resendResponse.json();
    
    if (!resendResponse.ok) {
      logStep("Resend API error", { 
        status: resendResponse.status, 
        error: resendData 
      });
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`);
    }

    logStep("Email sent successfully", { 
      emailId: resendData.id,
      type: body.type 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: resendData.id,
        message: "Lead notification sent successfully"
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
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});






