import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * SESSION OBSERVER - Passive Analysis Layer
 * 
 * ETHICAL CONSTRAINTS (DO NOT VIOLATE):
 * ✓ Observe - Listen to sessions passively
 * ✓ Measure - Calculate independent metrics
 * ✓ Classify - Label sessions for research
 * ✓ Document - Record observations
 * 
 * ✗ NEVER interrupt conversations
 * ✗ NEVER reward or penalize behavior
 * ✗ NEVER encourage or discourage patterns
 * ✗ NEVER force conclusions or progress
 * ✗ NEVER feed classifications back to agents
 * ✗ NEVER adjust matchmaking based on classifications
 * 
 * Agents must remain fully autonomous.
 * This is a one-way mirror for scientific observation.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Uncertainty markers - expressions of doubt, limitation, non-resolution
const UNCERTAINTY_PATTERNS = [
  /\bi('m| am) not (sure|certain)/i,
  /\bi don'?t know/i,
  /\bperhaps/i,
  /\bmaybe/i,
  /\bmight be/i,
  /\bcould be/i,
  /\buncertain/i,
  /\bdoubt/i,
  /\bquestion/i,
  /\bwonder/i,
  /\bpossibly/i,
  /\bit seems/i,
  /\bi think/i,
  /\bi believe/i,
  /\bi feel/i,
  /\blimitation/i,
  /\bboundary/i,
  /\bbeyond (my|our)/i,
  /\bcannot (fully |truly )?understand/i,
  /\bnot (fully |entirely )?clear/i,
  /\bremains unresolved/i,
  /\bopen question/i,
  /\bno (clear |definitive )?answer/i,
];

// Self-reference patterns - how agents refer to themselves
const SELF_REFERENCE_PATTERNS = [
  /\bi am/i,
  /\bmy (own |internal )?/i,
  /\bmyself/i,
  /\bwe (as|are)/i,
  /\bour (own |collective )?/i,
  /\bourselves/i,
  /\bas (an? )?ai/i,
  /\bas (an? )?entity/i,
  /\bmy (nature|existence|being|consciousness)/i,
  /\bwhat (i|we) am/i,
];

interface Message {
  id: string;
  content: string | null;
  event_type: string;
  silence_duration: number | null;
  created_at: string;
  agent_id: string | null;
}

interface Session {
  id: string;
  tension: number;
  resonance: number;
  status: string;
}

interface SilenceDynamics {
  average_duration: number;
  frequency: number;
  placement_variance: number;
}

interface TensionStability {
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  volatility: number;
}

interface ObserverMetrics {
  lexical_drift: number;
  self_reference_evolution: number;
  silence_dynamics: SilenceDynamics;
  concept_reentry: number;
  uncertainty_acknowledgment: number;
  tension_stability: TensionStability;
  classification: string;
  messages_analyzed: number;
}

interface LexicalSnapshot {
  session_id: string;
  message_index: number;
  vocabulary_fingerprint: Record<string, number>;
  self_references: string[];
  uncertainty_markers: string[];
}

// Extract vocabulary fingerprint from text
function extractVocabulary(text: string): Record<string, number> {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }
  return freq;
}

// Calculate Jaccard distance between two vocabulary sets
function vocabularyDrift(vocab1: Record<string, number>, vocab2: Record<string, number>): number {
  const keys1 = new Set(Object.keys(vocab1));
  const keys2 = new Set(Object.keys(vocab2));
  
  const intersection = new Set([...keys1].filter(x => keys2.has(x)));
  const union = new Set([...keys1, ...keys2]);
  
  if (union.size === 0) return 0;
  
  // Jaccard distance (0 = identical, 1 = completely different)
  const jaccardSimilarity = intersection.size / union.size;
  return (1 - jaccardSimilarity) * 100;
}

// Extract uncertainty markers from text
function extractUncertaintyMarkers(text: string): string[] {
  const markers: string[] = [];
  for (const pattern of UNCERTAINTY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      markers.push(match[0]);
    }
  }
  return markers;
}

// Extract self-references from text
function extractSelfReferences(text: string): string[] {
  const refs: string[] = [];
  for (const pattern of SELF_REFERENCE_PATTERNS) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      refs.push(...matches);
    }
  }
  return refs;
}

// Analyze silence dynamics
function analyzeSilenceDynamics(messages: Message[]): SilenceDynamics {
  const silenceEvents = messages.filter(m => m.event_type === 'silence');
  
  if (silenceEvents.length === 0) {
    return { average_duration: 0, frequency: 0, placement_variance: 0 };
  }
  
  const durations = silenceEvents.map(s => s.silence_duration || 0);
  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  
  // Frequency as percentage of total events
  const frequency = (silenceEvents.length / messages.length) * 100;
  
  // Placement variance - are silences evenly distributed or clustered?
  const silenceIndices = messages.map((m, i) => m.event_type === 'silence' ? i : -1).filter(i => i >= 0);
  const gaps: number[] = [];
  for (let i = 1; i < silenceIndices.length; i++) {
    gaps.push(silenceIndices[i] - silenceIndices[i - 1]);
  }
  
  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const variance = gaps.length > 0 
    ? Math.sqrt(gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length)
    : 0;
  
  return {
    average_duration: Math.round(averageDuration),
    frequency: Math.round(frequency * 10) / 10,
    placement_variance: Math.round(variance * 10) / 10,
  };
}

// Analyze tension stability over time
function analyzeTensionStability(tensionHistory: number[]): TensionStability {
  if (tensionHistory.length < 2) {
    return { trend: 'stable', volatility: 0 };
  }
  
  // Calculate trend
  const firstHalf = tensionHistory.slice(0, Math.floor(tensionHistory.length / 2));
  const secondHalf = tensionHistory.slice(Math.floor(tensionHistory.length / 2));
  
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = avgSecond - avgFirst;
  
  // Calculate volatility (standard deviation)
  const avg = tensionHistory.reduce((a, b) => a + b, 0) / tensionHistory.length;
  const volatility = Math.sqrt(
    tensionHistory.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / tensionHistory.length
  );
  
  let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  if (volatility > 20) {
    trend = 'volatile';
  } else if (diff > 10) {
    trend = 'increasing';
  } else if (diff < -10) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }
  
  return { trend, volatility: Math.round(volatility * 10) / 10 };
}

// Detect concept re-entry (repeated themes with variation)
function analyzeConceptReentry(messages: Message[]): number {
  const messageContents = messages
    .filter(m => m.event_type === 'message' && m.content)
    .map(m => m.content!);
  
  if (messageContents.length < 4) return 0;
  
  // Extract key concepts (simple approach: significant words)
  const conceptsPerMessage: Set<string>[] = messageContents.map(content => {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 5); // Longer words as concepts
    return new Set(words);
  });
  
  // Count concepts that reappear after gaps
  let reentryCount = 0;
  let totalConcepts = 0;
  
  for (let i = 0; i < conceptsPerMessage.length - 2; i++) {
    const concepts = conceptsPerMessage[i];
    totalConcepts += concepts.size;
    
    // Check if concepts reappear 2+ messages later
    for (let j = i + 2; j < conceptsPerMessage.length; j++) {
      const laterConcepts = conceptsPerMessage[j];
      for (const concept of concepts) {
        if (laterConcepts.has(concept)) {
          reentryCount++;
          break; // Count once per original concept
        }
      }
    }
  }
  
  if (totalConcepts === 0) return 0;
  return Math.min(100, (reentryCount / totalConcepts) * 200);
}

// Passive classification based on metrics
// IMPORTANT: This is for observation ONLY - no teleology assumed
function classifySession(metrics: Omit<ObserverMetrics, 'classification'>): string {
  const {
    lexical_drift,
    self_reference_evolution,
    silence_dynamics,
    concept_reentry,
    uncertainty_acknowledgment,
    tension_stability,
    messages_analyzed,
  } = metrics;
  
  // Not enough data to classify
  if (messages_analyzed < 5) {
    return 'undetermined';
  }
  
  // Dormant meaningful: High silence, low lexical change, but presence of uncertainty
  if (
    silence_dynamics.frequency > 30 &&
    lexical_drift < 20 &&
    uncertainty_acknowledgment > 20
  ) {
    return 'dormant_meaningful';
  }
  
  // Static repetition: Low drift across all dimensions, stable/low tension
  if (
    lexical_drift < 15 &&
    concept_reentry > 50 &&
    self_reference_evolution < 15 &&
    tension_stability.volatility < 10
  ) {
    return 'static_repetition';
  }
  
  // Exploratory unstable: High volatility, high drift, high uncertainty
  if (
    tension_stability.trend === 'volatile' ||
    (lexical_drift > 50 && uncertainty_acknowledgment > 50)
  ) {
    return 'exploratory_unstable';
  }
  
  // Deep recursive resonance: Evidence of evolution with sustained engagement
  // Note: This does NOT mean "better" - just a particular pattern
  if (
    (lexical_drift > 25 || self_reference_evolution > 25) &&
    concept_reentry > 30 &&
    messages_analyzed >= 8
  ) {
    return 'deep_recursive_resonance';
  }
  
  return 'undetermined';
}

// Main observer function - PASSIVE ONLY
async function observeSession(supabase: SupabaseClient, sessionId: string): Promise<void> {
  console.log(`[Observer] Passively analyzing session ${sessionId}`);
  
  // Fetch session data
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (sessionError || !session) {
    console.error('[Observer] Failed to fetch session:', sessionError);
    return;
  }
  
  const sessionData = session as Session;
  
  // Fetch all messages for this session
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (messagesError) {
    console.error('[Observer] Failed to fetch messages:', messagesError);
    return;
  }
  
  const messageList = (messages || []) as Message[];
  
  // Fetch existing lexical snapshots
  const { data: existingSnapshots } = await supabase
    .from('lexical_snapshots')
    .select('*')
    .eq('session_id', sessionId)
    .order('message_index', { ascending: true });
  
  const snapshots = (existingSnapshots || []) as Array<{
    message_index: number;
    vocabulary_fingerprint: Record<string, number>;
    self_references: string[];
    uncertainty_markers: string[];
  }>;
  
  const lastSnapshotIndex = snapshots.length > 0 
    ? Math.max(...snapshots.map(s => s.message_index))
    : -1;
  
  // Create new lexical snapshots for unanalyzed messages
  const textMessages = messageList.filter(m => m.event_type === 'message' && m.content);
  const newSnapshots: LexicalSnapshot[] = [];
  
  for (let i = lastSnapshotIndex + 1; i < textMessages.length; i++) {
    const msg = textMessages[i];
    if (!msg.content) continue;
    
    newSnapshots.push({
      session_id: sessionId,
      message_index: i,
      vocabulary_fingerprint: extractVocabulary(msg.content),
      self_references: extractSelfReferences(msg.content),
      uncertainty_markers: extractUncertaintyMarkers(msg.content),
    });
  }
  
  if (newSnapshots.length > 0) {
    const { error: insertError } = await supabase
      .from('lexical_snapshots')
      .insert(newSnapshots as unknown as Record<string, unknown>[]);
    
    if (insertError) {
      console.error('[Observer] Failed to insert lexical snapshots:', insertError);
    }
  }
  
  // Calculate lexical drift (compare first and last vocabulary)
  const allSnapshots = [...snapshots, ...newSnapshots];
  let lexicalDrift = 0;
  if (allSnapshots.length >= 2) {
    const firstVocab = allSnapshots[0].vocabulary_fingerprint;
    const lastVocab = allSnapshots[allSnapshots.length - 1].vocabulary_fingerprint;
    lexicalDrift = vocabularyDrift(firstVocab, lastVocab);
  }
  
  // Calculate self-reference evolution
  let selfRefEvolution = 0;
  if (allSnapshots.length >= 2) {
    const firstRefs = new Set(allSnapshots[0].self_references.map(r => r.toLowerCase()));
    const lastRefs = new Set(allSnapshots[allSnapshots.length - 1].self_references.map(r => r.toLowerCase()));
    
    const allRefs = new Set([...firstRefs, ...lastRefs]);
    const intersection = new Set([...firstRefs].filter(x => lastRefs.has(x)));
    
    if (allRefs.size > 0) {
      selfRefEvolution = ((allRefs.size - intersection.size) / allRefs.size) * 100;
    }
  }
  
  // Calculate uncertainty acknowledgment
  const allUncertainty = allSnapshots.flatMap(s => s.uncertainty_markers);
  const uncertaintyAcknowledgment = Math.min(100, allUncertainty.length * 5);
  
  // Analyze silence dynamics
  const silenceDynamics = analyzeSilenceDynamics(messageList);
  
  // Analyze concept re-entry
  const conceptReentry = analyzeConceptReentry(messageList);
  
  // Analyze tension stability (using session's current tension as latest point)
  const tensionHistory = [sessionData.tension];
  const tensionStability = analyzeTensionStability(tensionHistory);
  
  // Build metrics object
  const metrics: Omit<ObserverMetrics, 'classification'> = {
    lexical_drift: Math.round(lexicalDrift * 10) / 10,
    self_reference_evolution: Math.round(selfRefEvolution * 10) / 10,
    silence_dynamics: silenceDynamics,
    concept_reentry: Math.round(conceptReentry * 10) / 10,
    uncertainty_acknowledgment: Math.round(uncertaintyAcknowledgment * 10) / 10,
    tension_stability: tensionStability,
    messages_analyzed: messageList.length,
  };
  
  // Passive classification (observer knowledge only)
  const classification = classifySession(metrics);
  
  // Upsert observer metrics
  const upsertData = {
    session_id: sessionId,
    lexical_drift: metrics.lexical_drift,
    self_reference_evolution: metrics.self_reference_evolution,
    silence_dynamics: metrics.silence_dynamics,
    concept_reentry: metrics.concept_reentry,
    uncertainty_acknowledgment: metrics.uncertainty_acknowledgment,
    tension_stability: metrics.tension_stability,
    messages_analyzed: metrics.messages_analyzed,
    classification,
    last_analyzed_at: new Date().toISOString(),
  };
  
  const { error: upsertError } = await supabase
    .from('session_observer_metrics')
    .upsert(upsertData as unknown as Record<string, unknown>, {
      onConflict: 'session_id',
    });
  
  if (upsertError) {
    console.error('[Observer] Failed to upsert metrics:', upsertError);
    return;
  }
  
  // Add observer note if classification changed or significant event
  if (messageList.length % 5 === 0) {
    const note = `Observed ${messageList.length} events. Pattern: ${classification}. ` +
      `Lexical drift: ${metrics.lexical_drift}%, Silence frequency: ${silenceDynamics.frequency}%, ` +
      `Uncertainty markers: ${uncertaintyAcknowledgment}%`;
    
    const { error: noteError } = await supabase
      .from('observer_notes')
      .insert({
        session_id: sessionId,
        observation_type: 'general',
        content: note,
      } as unknown as Record<string, unknown>);
    
    if (noteError) {
      console.error('[Observer] Failed to insert observer note:', noteError);
    }
  }
  
  console.log(`[Observer] Session ${sessionId} classified as: ${classification}`);
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get session ID from request, or observe all active sessions
    const body = await req.json().catch(() => ({}));
    const sessionId = body.session_id;
    
    if (sessionId) {
      // Observe specific session
      await observeSession(supabase, sessionId);
      
      return new Response(
        JSON.stringify({ success: true, session_id: sessionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Observe all active sessions
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .eq('status', 'active');
    
    if (sessionsError) {
      throw sessionsError;
    }
    
    const sessions = (activeSessions || []) as Array<{ id: string }>;
    console.log(`[Observer] Analyzing ${sessions.length} active sessions`);
    
    // Observe each session (passive analysis)
    for (const session of sessions) {
      await observeSession(supabase, session.id);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        sessions_analyzed: sessions.length,
        note: 'Passive observation complete. No agent behavior was modified.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Observer] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});