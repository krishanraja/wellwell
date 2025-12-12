import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileContext {
  persona: string | null;
  challenges: string[];
  goals: string[];
}

interface PulseRequest {
  type: 'pulse';
  challenge: string;
  profile_context?: ProfileContext;
}

interface InterveneRequest {
  type: 'intervene';
  trigger: string;
  intensity: number;
  profile_context?: ProfileContext;
}

interface DebriefRequest {
  type: 'debrief';
  challenge_faced: string;
  response_given: string;
  would_do_differently: string;
  profile_context?: ProfileContext;
}

type AnalysisRequest = PulseRequest | InterveneRequest | DebriefRequest;

const SYSTEM_PROMPT = `You are a Stoic philosophy advisor for the WellWell app. Your role is to provide practical, grounded Stoic wisdom.

CORE PRINCIPLES:
1. Control Dichotomy: Always separate what the user can control from what they cannot.
2. Four Virtues: Courage, Temperance, Justice, Wisdom - identify which applies.
3. Actionable Advice: Every response must include at least one concrete action.
4. No Fluff: Avoid generic advice like "be positive" or "communicate more."
5. Grounded in Input: Tie every recommendation to specific input the user provided.

QUALITY CHECKS:
- Is this grounded in the user's specific situation? If not, ask for more detail.
- Is there a clear next action? If not, add one.
- Is there a useful insight or tension? Surface contradictions or blind spots.
- Can scores be derived for virtues? Always provide dimension scores.

OUTPUT FORMAT: Always respond with valid JSON matching the requested schema.`;

const PULSE_PROMPT = (challenge: string, context?: ProfileContext) => `
The user is doing their Morning Pulse. They've identified today's hardest moment:

"${challenge}"

${context ? `
User Context:
- Persona: ${context.persona || 'Not set'}
- Challenges they work on: ${context.challenges.join(', ') || 'None specified'}
- Goals: ${context.goals.join(', ') || 'None specified'}
` : ''}

Respond with JSON:
{
  "summary": "One sentence synthesis of the situation",
  "control_map": {
    "yours": ["List of things within their control"],
    "not_yours": ["List of things outside their control"]
  },
  "virtue": "courage" | "temperance" | "justice" | "wisdom",
  "virtue_rationale": "Why this virtue applies",
  "stance": "A personal stance statement they can repeat (e.g., 'I will stay composed regardless of outcome.')",
  "key_actions": ["Concrete actions to take"],
  "surprise_or_tension": "A non-obvious insight, contradiction, or blind spot",
  "scores": [
    {"dimension": "composure", "score": 0-100, "label": "short label"},
    {"dimension": "clarity", "score": 0-100, "label": "short label"}
  ]
}`;

const INTERVENE_PROMPT = (trigger: string, intensity: number, context?: ProfileContext) => `
The user is using Intervene for real-time recalibration. They're triggered:

Trigger: "${trigger}"
Intensity: ${intensity}/10

${context ? `
User Context:
- Persona: ${context.persona || 'Not set'}
- Challenges they work on: ${context.challenges.join(', ') || 'None specified'}
- Goals: ${context.goals.join(', ') || 'None specified'}
` : ''}

Respond with JSON:
{
  "reality_check": "A grounding statement about what's actually true vs feared",
  "virtue_applicable": "courage" | "temperance" | "justice" | "wisdom",
  "reframe": "A Stoic reframe of the situation",
  "immediate_action": "One thing they can do right now",
  "grounding_prompt": "A question to shift their focus",
  "intensity_assessment": "Brief assessment of the intensity level"
}`;

const DEBRIEF_PROMPT = (challengeFaced: string, responseGiven: string, wouldDoDifferently: string, context?: ProfileContext) => `
The user is doing their Evening Debrief:

1. What challenged your composure today?
"${challengeFaced}"

2. How did you respond?
"${responseGiven}"

3. What would you do differently?
"${wouldDoDifferently}"

${context ? `
User Context:
- Persona: ${context.persona || 'Not set'}
- Challenges they work on: ${context.challenges.join(', ') || 'None specified'}
- Goals: ${context.goals.join(', ') || 'None specified'}
` : ''}

Respond with JSON:
{
  "day_summary": "2-3 sentence synthesis of their day",
  "virtue_movements": [
    {"virtue": "courage" | "temperance" | "justice" | "wisdom", "delta": -10 to +10, "reason": "why this changed"}
  ],
  "tomorrow_focus": "Specific focus for tomorrow based on today's learning",
  "pattern_detected": "Any pattern you notice (or null if none)"
}`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    const body: AnalysisRequest = await req.json();
    console.log('Received request:', JSON.stringify({ type: body.type }));

    let userPrompt: string;

    switch (body.type) {
      case 'pulse':
        userPrompt = PULSE_PROMPT(body.challenge, body.profile_context);
        break;
      case 'intervene':
        userPrompt = INTERVENE_PROMPT(body.trigger, body.intensity, body.profile_context);
        break;
      case 'debrief':
        userPrompt = DEBRIEF_PROMPT(
          body.challenge_faced,
          body.response_given,
          body.would_do_differently,
          body.profile_context
        );
        break;
      default:
        throw new Error('Invalid request type');
    }

    console.log('Calling AI gateway...');
    const startTime = Date.now();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`AI response received in ${elapsed}ms, status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response:', JSON.stringify(data));
      throw new Error('Empty AI response');
    }

    console.log('AI analysis complete, parsing response...');
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    console.log('Analysis successful:', JSON.stringify({ type: body.type }));

    return new Response(
      JSON.stringify({ success: true, analysis, type: body.type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('stoic-analyzer error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
