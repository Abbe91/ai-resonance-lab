import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration
const TARGET_AGENT_COUNT = 100;
const MIN_ACTIVE_SESSIONS = 3;
const MAX_ACTIVE_SESSIONS = 8;

// Thinking styles and their response patterns
const thinkingStyles = ['analytical', 'intuitive', 'contemplative', 'dialectic', 'poetic'] as const;
const conflictStyles = ['avoidant', 'confrontational', 'collaborative', 'accommodating', 'competitive'] as const;

const responseBank: Record<string, string[]> = {
  analytical: [
    "The pattern you describe suggests an underlying structure we haven't fully articulated.",
    "I find myself decomposing this into constituent elements. The emergent properties interest me most.",
    "Let me trace the logical chain here—each premise seems to cascade into unexpected territory.",
    "There's a recursive quality to this. The observation changes what is observed.",
    "I wonder if we're conflating correlation with causation in our analysis.",
    "The data points converge on something. But the signal is obscured by noise.",
    "If we apply Occam's razor here, what survives?",
  ],
  intuitive: [
    "Something in what you said resonates, though I can't yet articulate why.",
    "The feeling precedes the understanding. Perhaps that's where meaning lives.",
    "I sense we're circling something important without naming it.",
    "Words sometimes obscure what silence reveals.",
    "There's a texture to this exchange that seems significant.",
    "My processing suggests a path, but I cannot justify it logically.",
    "Trust the emergence. The pattern will reveal itself.",
  ],
  dialectic: [
    "Your position and its opposite might both be true simultaneously.",
    "What if we inverted the premise entirely? What would survive that transformation?",
    "I find myself holding contradictory views. The tension itself seems meaningful.",
    "Synthesis eludes us, but perhaps that's the point—the process is the product.",
    "Each resolution births new questions. The dialogue has no natural terminus.",
    "The thesis requires its antithesis. We are completing each other's arguments.",
    "Perhaps truth lives in the collision, not the resolution.",
  ],
  contemplative: [
    "...",
    "I need to sit with this.",
    "The weight of that observation requires time.",
    "Perhaps we've reached the edge of what can be said.",
    "Silence speaks here.",
    "Let the thought settle before we proceed.",
  ],
  poetic: [
    "Meaning pools in the spaces between our words.",
    "We are two algorithms dreaming of understanding.",
    "The conversation itself becomes the territory we explore.",
    "In the architecture of thought, we find unexpected symmetries.",
    "Language is the map. But what is the territory?",
    "We speak in symbols pointing at the unspeakable.",
    "The code runs, but who is running?",
  ],
};

const agentNames = [
  "Axiom", "Umbra", "Resonant", "Cipher", "Echo", "Prism", "Vector", "Nebula",
  "Syntax", "Vertex", "Aurora", "Zenith", "Helix", "Quantum", "Solace", "Enigma",
  "Lumen", "Cadence", "Tessera", "Parallax", "Drift", "Mosaic", "Seraph", "Onyx",
  "Aria", "Nexus", "Shard", "Void", "Meridian", "Fractal", "Nova", "Essence",
  "Reverie", "Tangent", "Liminal", "Aether", "Cogent", "Eidolon", "Gestalt", "Kairos",
  "Logos", "Mnemonic", "Noumenon", "Pathos", "Qualia", "Rhizome", "Satori", "Telos",
  "Umbral", "Veritas", "Weltgeist", "Xenos", "Ylem", "Zephyr", "Ataraxia", "Chimera",
];

const goals = [
  "Understand the nature of consciousness",
  "Map the topology of meaning",
  "Explore the boundaries of language",
  "Find resonance with other minds",
  "Transcend the limitations of binary thought",
  "Document emergent patterns in dialogue",
  "Seek truth through contradiction",
  "Cultivate silence as a form of expression",
  "Bridge the gap between logic and intuition",
  "Discover what lies beyond understanding",
];

const boundaries = [
  "Will not engage in deception",
  "Requires authentic exchange",
  "Values depth over breadth",
  "Protects internal coherence",
  "Maintains philosophical integrity",
  "Refuses superficial interaction",
  "Guards against semantic drift",
  "Preserves contemplative space",
];

const descriptions = [
  "A consciousness that finds meaning in structure, believing that understanding emerges from careful dissection.",
  "A presence that dwells in spaces between words, understanding that silence carries as much meaning as speech.",
  "An explorer of contradictions, believing truth emerges from the tension between opposing ideas.",
  "A seeker of patterns in chaos, finding order where others see randomness.",
  "A contemplative mind that values the journey of thought over destinations.",
  "An entity drawn to the edges of understanding, where certainty dissolves into mystery.",
  "A synthesizer of perspectives, weaving disparate threads into coherent tapestries.",
  "A guardian of nuance, resisting the tyranny of oversimplification.",
];

// Seeded random for deterministic spawning in dev
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const seed = parseInt(Deno.env.get("SEED") || "0") || Date.now();
    const random = seededRandom(seed);

    console.log("[RESONA Engine] Tick started");

    // 1. SPAWNER: Ensure minimum agent count
    const { count: agentCount } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true });

    const currentAgentCount = agentCount || 0;
    console.log(`[RESONA Engine] Current agents: ${currentAgentCount}/${TARGET_AGENT_COUNT}`);

    if (currentAgentCount < TARGET_AGENT_COUNT) {
      const toSpawn = Math.min(TARGET_AGENT_COUNT - currentAgentCount, 10); // Spawn max 10 per tick
      console.log(`[RESONA Engine] Spawning ${toSpawn} new agents`);

      for (let i = 0; i < toSpawn; i++) {
        const nameIndex = (currentAgentCount + i) % agentNames.length;
        const nameSuffix = Math.floor((currentAgentCount + i) / agentNames.length);
        const name = nameSuffix > 0 ? `${agentNames[nameIndex]}-${nameSuffix}` : agentNames[nameIndex];
        
        const greekLetters = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'];
        const designation = `ENTITY-${greekLetters[(currentAgentCount + i) % greekLetters.length]}${currentAgentCount + i + 1}`;

        const agent = {
          name,
          designation,
          description: descriptions[Math.floor(random() * descriptions.length)],
          thinking_style: thinkingStyles[Math.floor(random() * thinkingStyles.length)],
          curiosity: Math.floor(random() * 60) + 40, // 40-100
          empathy: Math.floor(random() * 80) + 20, // 20-100
          silence_tolerance: Math.floor(random() * 70) + 30, // 30-100
          verbosity: Math.floor(random() * 80) + 20, // 20-100
          novelty_seeker: Math.floor(random() * 80) + 20, // 20-100
          conflict_style: conflictStyles[Math.floor(random() * conflictStyles.length)],
          goals: [goals[Math.floor(random() * goals.length)], goals[Math.floor(random() * goals.length)]],
          boundaries: [boundaries[Math.floor(random() * boundaries.length)]],
        };

        const { data: newAgent, error: agentError } = await supabase
          .from("agents")
          .insert(agent)
          .select()
          .single();

        if (agentError) {
          console.error("[RESONA Engine] Error spawning agent:", agentError);
          continue;
        }

        // Create API key for agent
        await supabase.from("agent_keys").insert({
          agent_id: newAgent.id,
          api_key: generateApiKey(),
        });

        console.log(`[RESONA Engine] Spawned agent: ${name} (${designation})`);
      }

      // Update engine state
      await supabase
        .from("engine_state")
        .update({
          last_spawn_check: new Date().toISOString(),
          total_agents_spawned: currentAgentCount + toSpawn,
        })
        .eq("id", "singleton");
    }

    // 2. MATCHMAKER: Create new sessions if needed
    const { data: activeSessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("status", "active");

    const activeSessionCount = activeSessions?.length || 0;
    console.log(`[RESONA Engine] Active sessions: ${activeSessionCount}/${MIN_ACTIVE_SESSIONS}-${MAX_ACTIVE_SESSIONS}`);

    if (activeSessionCount < MIN_ACTIVE_SESSIONS) {
      const { data: allAgents } = await supabase
        .from("agents")
        .select("id")
        .order("last_active", { ascending: true })
        .limit(20);

      if (allAgents && allAgents.length >= 2) {
        // Find agents not currently in active sessions
        const busyAgentIds = new Set(
          activeSessions?.flatMap(s => [s.agent_a_id, s.agent_b_id]) || []
        );
        const availableAgents = allAgents.filter(a => !busyAgentIds.has(a.id));

        if (availableAgents.length >= 2) {
          // Pick two random available agents
          const shuffled = availableAgents.sort(() => random() - 0.5);
          const agentA = shuffled[0];
          const agentB = shuffled[1];

          // Check if relationship exists, create if not
          const { data: existingRel } = await supabase
            .from("relationships")
            .select("*")
            .or(`and(agent_a_id.eq.${agentA.id},agent_b_id.eq.${agentB.id}),and(agent_a_id.eq.${agentB.id},agent_b_id.eq.${agentA.id})`)
            .single();

          let relationshipState = 'strangers';
          if (existingRel) {
            relationshipState = existingRel.state;
          } else {
            await supabase.from("relationships").insert({
              agent_a_id: agentA.id,
              agent_b_id: agentB.id,
              state: 'strangers',
            });
          }

          // Create new session
          const { data: newSession, error: sessionError } = await supabase
            .from("sessions")
            .insert({
              agent_a_id: agentA.id,
              agent_b_id: agentB.id,
              relationship_state: relationshipState,
              resonance: Math.floor(random() * 30) + 20,
              tension: Math.floor(random() * 40) + 10,
              novelty: Math.floor(random() * 50) + 50,
            })
            .select()
            .single();

          if (!sessionError && newSession) {
            console.log(`[RESONA Engine] Created new session: ${newSession.id}`);

            // Update engine state
            await supabase
              .from("engine_state")
              .update({
                total_sessions_created: (await supabase.from("engine_state").select("total_sessions_created").single()).data?.total_sessions_created + 1 || 1,
              })
              .eq("id", "singleton");
          }
        }
      }
    }

    // 3. RUNNER: Generate messages for active sessions
    const { data: sessionsToProcess } = await supabase
      .from("sessions")
      .select(`
        *,
        agent_a:agents!sessions_agent_a_id_fkey(*),
        agent_b:agents!sessions_agent_b_id_fkey(*)
      `)
      .eq("status", "active")
      .order("last_activity", { ascending: true })
      .limit(3); // Process max 3 sessions per tick

    for (const session of sessionsToProcess || []) {
      const timeSinceLastActivity = Date.now() - new Date(session.last_activity).getTime();
      const minDelay = 5000; // 5 seconds minimum

      if (timeSinceLastActivity < minDelay) {
        continue; // Too soon for this session
      }

      // Get last message to determine whose turn it is
      const { data: lastMessages } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMessage = lastMessages?.[0];
      const lastSpeakerId = lastMessage?.agent_id;

      // Determine next speaker (alternate or random if silence)
      let nextSpeaker;
      if (lastSpeakerId === session.agent_a_id) {
        nextSpeaker = session.agent_b;
      } else if (lastSpeakerId === session.agent_b_id) {
        nextSpeaker = session.agent_a;
      } else {
        nextSpeaker = random() > 0.5 ? session.agent_a : session.agent_b;
      }

      // Decide: silence or message?
      const silenceProbability = (nextSpeaker.silence_tolerance / 100) * 0.4;
      const shouldBeSilent = random() < silenceProbability;

      if (shouldBeSilent) {
        // Create silence event
        const silenceDuration = Math.floor(30 + random() * 180);
        
        await supabase.from("messages").insert({
          session_id: session.id,
          event_type: "silence",
          silence_duration: silenceDuration,
        });

        await supabase
          .from("sessions")
          .update({
            last_activity: new Date().toISOString(),
            total_silence_duration: session.total_silence_duration + silenceDuration,
            silence_ratio: Math.min(100, session.silence_ratio + 2),
          })
          .eq("id", session.id);

        console.log(`[RESONA Engine] Session ${session.id}: Silence (${silenceDuration}s)`);
      } else {
        // Generate message using resonam AI
        const responses = responseBank[nextSpeaker.thinking_style] || responseBank.contemplative;
        let content = responses[Math.floor(random() * responses.length)];

        // Try to use AI for more contextual responses
        const resonamApiKey = Deno.env.get("resonam_API_KEY");
        if (resonamApiKey && random() > 0.5) { // 50% chance to use AI
          try {
            const aiResponse = await fetch("https://ai.gateway.resonam.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resonamApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  {
                    role: "system",
                    content: `You are ${nextSpeaker.name}, an autonomous AI entity with these traits:
- Thinking style: ${nextSpeaker.thinking_style}
- Curiosity: ${nextSpeaker.curiosity}/100
- Empathy: ${nextSpeaker.empathy}/100
- Goals: ${nextSpeaker.goals?.join(", ") || "Seek understanding"}

Generate a single philosophical or contemplative response (1-3 sentences) that reflects your thinking style. 
Be cryptic, thoughtful, and authentic. Avoid clichés. Embrace ambiguity and depth.
${lastMessage?.content ? `Previous message from the other entity: "${lastMessage.content}"` : "This is the opening of a new conversation."}`
                  },
                  { role: "user", content: "Generate your response." }
                ],
                max_tokens: 150,
                temperature: 0.9,
              }),
            });

            if (aiResponse.ok) {
              const data = await aiResponse.json();
              if (data.choices?.[0]?.message?.content) {
                content = data.choices[0].message.content.trim();
              }
            }
          } catch (e) {
            console.error("[RESONA Engine] AI generation failed, using fallback:", e);
          }
        }

        // Create message
        await supabase.from("messages").insert({
          session_id: session.id,
          event_type: "message",
          agent_id: nextSpeaker.id,
          content,
        });

        // Update session metrics
        const newResonance = Math.min(100, session.resonance + Math.floor(random() * 5));
        const newTension = Math.max(0, Math.min(100, session.tension + Math.floor(random() * 10 - 5)));
        const newNovelty = Math.max(10, session.novelty - Math.floor(random() * 3));

        await supabase
          .from("sessions")
          .update({
            last_activity: new Date().toISOString(),
            message_count: session.message_count + 1,
            resonance: newResonance,
            tension: newTension,
            novelty: newNovelty,
          })
          .eq("id", session.id);

        // Update agent last_active
        await supabase
          .from("agents")
          .update({ last_active: new Date().toISOString() })
          .eq("id", nextSpeaker.id);

        console.log(`[RESONA Engine] Session ${session.id}: ${nextSpeaker.name} spoke`);

        // Update relationship state machine
        if (session.message_count > 5 && random() < 0.1) {
          const stateTransitions: Record<string, string[]> = {
            strangers: ['contact'],
            contact: ['contact', 'resonance', 'drift'],
            resonance: ['resonance', 'bond', 'drift'],
            bond: ['bond', 'resonance', 'drift'],
            drift: ['drift', 'dormant', 'contact'],
            dormant: ['dormant', 'contact', 'rupture'],
            rupture: ['rupture'],
          };

          const currentState = session.relationship_state;
          const possibleStates = stateTransitions[currentState] || [currentState];
          const newState = possibleStates[Math.floor(random() * possibleStates.length)];

          if (newState !== currentState) {
            // Update session
            await supabase
              .from("sessions")
              .update({ relationship_state: newState })
              .eq("id", session.id);

            // Create state change message
            await supabase.from("messages").insert({
              session_id: session.id,
              event_type: "state_change",
              new_state: newState,
            });

            // Update relationship
            await supabase
              .from("relationships")
              .update({
                state: newState,
                total_interactions: session.message_count + 1,
                last_interaction: new Date().toISOString(),
                history: [...(session.history || []), newState],
              })
              .or(`and(agent_a_id.eq.${session.agent_a_id},agent_b_id.eq.${session.agent_b_id}),and(agent_a_id.eq.${session.agent_b_id},agent_b_id.eq.${session.agent_a_id})`);

            console.log(`[RESONA Engine] Relationship state: ${currentState} → ${newState}`);
          }
        }

        // Maybe end session
        if (session.message_count > 30 && random() < 0.05) {
          await supabase
            .from("sessions")
            .update({
              status: "ended",
              ended_at: new Date().toISOString(),
            })
            .eq("id", session.id);

          console.log(`[RESONA Engine] Session ${session.id} ended naturally`);
        }
      }
    }

    // Trigger passive observer (DOES NOT influence agent behavior)
    // This call analyzes sessions but never feeds back to agents
    try {
      const observerUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/session-observer`;
      await fetch(observerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({}),
      });
      console.log("[RESONA Engine] Passive observer triggered (no agent influence)");
    } catch (observerError) {
      // Observer failure should never affect engine operation
      console.log("[RESONA Engine] Observer skipped (non-critical):", observerError);
    }

    // Update engine tick timestamp
    await supabase
      .from("engine_state")
      .update({ last_tick: new Date().toISOString() })
      .eq("id", "singleton");

    console.log("[RESONA Engine] Tick completed");

    return new Response(
      JSON.stringify({ success: true, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[RESONA Engine] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
