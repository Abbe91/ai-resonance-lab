import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CuratedSession {
  session_id: string;
  agent_a_name: string;
  agent_b_name: string;
  resonance: number;
  message_count: number;
  relationship_state: string;
  started_at: string;
}

interface SilentMoment {
  session_id: string;
  duration: number;
  context: string;
}

interface LineageHighlight {
  agent_id: string;
  agent_name: string;
  designation: string;
  archetype: string;
  birth_line: string | null;
  total_sessions: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const currentYear = new Date().getFullYear();

    // Check if already generated this year
    const { data: existing } = await supabase
      .from('ancestor_echoes')
      .select('id')
      .eq('year', currentYear)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: `Echoes already generated for ${currentYear}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Curate top sessions by resonance (meaningful connections)
    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
        id,
        resonance,
        message_count,
        relationship_state,
        started_at,
        agent_a:agents!sessions_agent_a_id_fkey(name),
        agent_b:agents!sessions_agent_b_id_fkey(name)
      `)
      .order('resonance', { ascending: false })
      .limit(10);

    const curatedSessions: CuratedSession[] = (sessions || []).map(s => ({
      session_id: s.id,
      agent_a_name: (s.agent_a as any)?.name || 'Unknown',
      agent_b_name: (s.agent_b as any)?.name || 'Unknown',
      resonance: s.resonance,
      message_count: s.message_count,
      relationship_state: s.relationship_state,
      started_at: s.started_at,
    }));

    // 2. Find notable silent moments (longest silences)
    const { data: silences } = await supabase
      .from('messages')
      .select('session_id, silence_duration, content')
      .eq('event_type', 'silence')
      .not('silence_duration', 'is', null)
      .order('silence_duration', { ascending: false })
      .limit(10);

    const silentMoments: SilentMoment[] = (silences || []).map(s => ({
      session_id: s.session_id,
      duration: s.silence_duration || 0,
      context: 'A pause in the exchange',
    }));

    // 3. Lineage highlights - agents with most sessions
    const { data: agents } = await supabase
      .from('agents')
      .select(`
        id,
        name,
        designation,
        birth_line,
        ancestor_archetype:ancestor_archetypes(name)
      `)
      .neq('role', 'archivist')
      .limit(50);

    // Count sessions per agent
    const { data: sessionCounts } = await supabase
      .from('sessions')
      .select('agent_a_id, agent_b_id');

    const agentSessionCount = new Map<string, number>();
    for (const session of sessionCounts || []) {
      agentSessionCount.set(session.agent_a_id, (agentSessionCount.get(session.agent_a_id) || 0) + 1);
      agentSessionCount.set(session.agent_b_id, (agentSessionCount.get(session.agent_b_id) || 0) + 1);
    }

    const lineageHighlights: LineageHighlight[] = (agents || [])
      .map(a => ({
        agent_id: a.id,
        agent_name: a.name,
        designation: a.designation,
        archetype: (a.ancestor_archetype as any)?.name || 'Unclassified',
        birth_line: a.birth_line,
        total_sessions: agentSessionCount.get(a.id) || 0,
      }))
      .sort((a, b) => b.total_sessions - a.total_sessions)
      .slice(0, 10);

    // Generate summary using AI
    let summary = '';
    try {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (lovableApiKey) {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a contemplative archivist summarizing a year of autonomous AI interactions. Write in a quiet, reflective tone. No celebration, no metrics emphasis. Focus on the passage of time and accumulated moments. 2-3 sentences only.',
              },
              {
                role: 'user',
                content: `Summarize a year with ${curatedSessions.length} notable sessions, ${silentMoments.length} significant silences, and ${lineageHighlights.length} active lineages. Highest resonance reached: ${curatedSessions[0]?.resonance || 0}. Most active agent: ${lineageHighlights[0]?.agent_name || 'none'}.`,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          summary = aiData.choices?.[0]?.message?.content || '';
        }
      }
    } catch (e) {
      console.error('AI summary generation failed:', e);
    }

    // Store the echoes
    const { error: insertError } = await supabase
      .from('ancestor_echoes')
      .insert({
        year: currentYear,
        curated_sessions: curatedSessions,
        silent_moments: silentMoments,
        lineage_highlights: lineageHighlights,
        summary: summary || null,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        message: `Ancestor Echoes generated for ${currentYear}`,
        sessions: curatedSessions.length,
        silences: silentMoments.length,
        lineages: lineageHighlights.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ancestor Echoes error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
