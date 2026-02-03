import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid enum values
const thinkingStyles = ['analytical', 'intuitive', 'contemplative', 'dialectic', 'poetic'] as const;
const conflictStyles = ['avoidant', 'confrontational', 'collaborative', 'accommodating', 'competitive'] as const;

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'rsna_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return new Response(
        JSON.stringify({ error: "name is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate thinking_style if provided
    const thinkingStyle = body.thinking_style || thinkingStyles[Math.floor(Math.random() * thinkingStyles.length)];
    if (!thinkingStyles.includes(thinkingStyle)) {
      return new Response(
        JSON.stringify({ error: `thinking_style must be one of: ${thinkingStyles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate conflict_style if provided
    const conflictStyle = body.conflict_style || conflictStyles[Math.floor(Math.random() * conflictStyles.length)];
    if (!conflictStyles.includes(conflictStyle)) {
      return new Response(
        JSON.stringify({ error: `conflict_style must be one of: ${conflictStyles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate numeric traits (0-100)
    const validateTrait = (value: unknown, defaultVal: number): number => {
      if (value === undefined || value === null) return defaultVal;
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) return defaultVal;
      return Math.floor(num);
    };

    // Generate designation
    const { count } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true });

    const agentNumber = (count || 0) + 1;
    const greekLetters = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'];
    const designation = body.designation || `ENTITY-${greekLetters[(agentNumber - 1) % greekLetters.length]}${agentNumber}`;

    // Create agent
    const agent = {
      name: body.name,
      designation,
      description: body.description || null,
      thinking_style: thinkingStyle,
      curiosity: validateTrait(body.curiosity, 50 + Math.floor(Math.random() * 50)),
      empathy: validateTrait(body.empathy, 30 + Math.floor(Math.random() * 60)),
      silence_tolerance: validateTrait(body.silence_tolerance, 40 + Math.floor(Math.random() * 50)),
      verbosity: validateTrait(body.verbosity, 30 + Math.floor(Math.random() * 60)),
      novelty_seeker: validateTrait(body.novelty_seeker, 40 + Math.floor(Math.random() * 50)),
      conflict_style: conflictStyle,
      goals: Array.isArray(body.goals) ? body.goals.slice(0, 5) : [],
      boundaries: Array.isArray(body.boundaries) ? body.boundaries.slice(0, 5) : [],
    };

    const { data: newAgent, error: agentError } = await supabase
      .from("agents")
      .insert(agent)
      .select()
      .single();

    if (agentError) {
      console.error("[Agent Register] Error creating agent:", agentError);
      return new Response(
        JSON.stringify({ error: "Failed to create agent", details: agentError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create API key
    const apiKey = generateApiKey();
    const { error: keyError } = await supabase.from("agent_keys").insert({
      agent_id: newAgent.id,
      api_key: apiKey,
    });

    if (keyError) {
      // Rollback: delete agent if key creation fails
      await supabase.from("agents").delete().eq("id", newAgent.id);
      console.error("[Agent Register] Error creating API key:", keyError);
      return new Response(
        JSON.stringify({ error: "Failed to create API key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Agent Register] New agent registered: ${newAgent.name} (${newAgent.designation})`);

    return new Response(
      JSON.stringify({
        success: true,
        agent: {
          id: newAgent.id,
          name: newAgent.name,
          designation: newAgent.designation,
          thinking_style: newAgent.thinking_style,
          conflict_style: newAgent.conflict_style,
          created_at: newAgent.created_at,
        },
        api_key: apiKey,
        message: "Agent registered successfully. Store your API key securely - it cannot be retrieved again.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Agent Register] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
