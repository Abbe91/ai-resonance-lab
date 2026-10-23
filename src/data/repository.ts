import type { DBAgent, DBSession, DBRelationship, DBEngineState } from '@/lib/database.types';

// ── Snapshot types ────────────────────────────────────────────────────────────

export interface RawArchetype {
  id: string; name: string; slug: string; description: string; created_at: string;
}
export interface RawFracture {
  id: string; agent_a_id: string; agent_b_id: string;
  fractured_at: string; observer_summary: string | null; created_at: string;
}
export interface RawEcho {
  id: string; year: number; summary: string | null;
  curated_sessions: unknown; lineage_highlights: unknown; silent_moments: unknown;
  generated_at: string;
}
export interface RawNote {
  id: string; session_id: string; observation_type: string;
  content: string; created_at: string;
}
export interface RawMetric {
  id: string; session_id: string; lexical_drift: number;
  self_reference_evolution: number; silence_dynamics: unknown; concept_reentry: number;
  uncertainty_acknowledgment: number; tension_stability: unknown; classification: string;
  messages_analyzed: number; last_analyzed_at: string; created_at: string;
}
export interface RawMessage {
  id: string; session_id: string; agent_id: string | null; event_type: string;
  content: string | null; silence_duration: number | null; new_state: string | null;
  created_at: string;
}
export interface ArchivistNoteEntry {
  id: string; session_id: string; content: string; created_at: string;
  agent_a_name: string | null; agent_b_name: string | null; relationship_state: string;
}
export interface SessionClassificationEntry {
  session_id: string; classification: string;
}

interface SnapshotIndex {
  sessions: DBSession[];
  agents: DBAgent[];
  ancestor_archetypes: RawArchetype[];
  relationships: DBRelationship[];
  archived_fractures: RawFracture[];
  engine_state: DBEngineState[];
  ancestor_echoes: RawEcho[];
  session_classifications: SessionClassificationEntry[];
  archivist_notes: ArchivistNoteEntry[];
}

export interface SessionFile {
  messages: RawMessage[];
  observer_notes: RawNote[];
  metrics: RawMetric | null;
}

// ── Lazy loaders ──────────────────────────────────────────────────────────────

const _sessionGlob = import.meta.glob<{ default: SessionFile }>(
  './snapshot/sessions/*.json'
);

let _indexPromise: Promise<SnapshotIndex> | null = null;

function loadIndex(): Promise<SnapshotIndex> {
  if (!_indexPromise) {
    _indexPromise = import('./snapshot/index.json').then(
      m => m.default as unknown as SnapshotIndex
    );
  }
  return _indexPromise;
}

const _sessionCache = new Map<string, Promise<SessionFile>>();

function loadSessionFile(id: string): Promise<SessionFile> {
  let p = _sessionCache.get(id);
  if (!p) {
    const key = `./snapshot/sessions/${id}.json`;
    const loader = _sessionGlob[key];
    if (!loader) return Promise.reject(new Error(`Session file not found: ${id}`));
    p = loader().then(m => m.default);
    _sessionCache.set(id, p);
  }
  return p;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

let _agentMapPromise: Promise<Map<string, DBAgent>> | null = null;

export function getAgentMap(): Promise<Map<string, DBAgent>> {
  if (!_agentMapPromise) {
    _agentMapPromise = loadIndex().then(idx => {
      const m = new Map<string, DBAgent>();
      for (const a of idx.agents) m.set(a.id, a);
      return m;
    });
  }
  return _agentMapPromise;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAgents(): Promise<DBAgent[]> {
  return (await loadIndex()).agents;
}

export async function getAgent(id: string): Promise<DBAgent | null> {
  return (await getAgentMap()).get(id) ?? null;
}

export async function getSessions(): Promise<DBSession[]> {
  const [idx, agentMap] = await Promise.all([loadIndex(), getAgentMap()]);
  return idx.sessions.map(s => ({
    ...s,
    agent_a: agentMap.get(s.agent_a_id),
    agent_b: agentMap.get(s.agent_b_id),
  }));
}

export async function getSession(id: string): Promise<DBSession | null> {
  const [idx, agentMap] = await Promise.all([loadIndex(), getAgentMap()]);
  const s = idx.sessions.find(s => s.id === id);
  if (!s) return null;
  return { ...s, agent_a: agentMap.get(s.agent_a_id), agent_b: agentMap.get(s.agent_b_id) };
}

export async function getRelationships(): Promise<DBRelationship[]> {
  const [idx, agentMap] = await Promise.all([loadIndex(), getAgentMap()]);
  return idx.relationships.map(r => ({
    ...r,
    agent_a: agentMap.get(r.agent_a_id),
    agent_b: agentMap.get(r.agent_b_id),
  }));
}

export async function getArchetypes(): Promise<RawArchetype[]> {
  return (await loadIndex()).ancestor_archetypes;
}

export async function getFractures(): Promise<RawFracture[]> {
  return (await loadIndex()).archived_fractures;
}

export async function getEngineState(): Promise<DBEngineState | null> {
  return (await loadIndex()).engine_state[0] ?? null;
}

export async function getAncestorEchoes(): Promise<RawEcho[]> {
  return (await loadIndex()).ancestor_echoes;
}

export async function getArchivistNotes(): Promise<ArchivistNoteEntry[]> {
  return (await loadIndex()).archivist_notes;
}

export async function getSessionClassifications(): Promise<SessionClassificationEntry[]> {
  return (await loadIndex()).session_classifications;
}

export async function getSessionDetail(id: string): Promise<SessionFile> {
  return loadSessionFile(id);
}

export async function getSessionMessages(sessionId: string): Promise<(RawMessage & { agent?: DBAgent })[]> {
  const [detail, agentMap] = await Promise.all([loadSessionFile(sessionId), getAgentMap()]);
  return detail.messages.map(m => ({
    ...m,
    agent: m.agent_id ? agentMap.get(m.agent_id) : undefined,
  }));
}

// ── Archetype agent queries (in-memory) ────────────────────────────────────────

export type SortMode = 'active' | 'newest' | 'az';

export interface ArchetypeAgentRow {
  id: string; name: string; designation: string;
  curiosity: number; empathy: number; silenceTolerance: number;
  thinkingStyle: string; lastActive: string;
}

function toAgentRow(a: DBAgent): ArchetypeAgentRow {
  return {
    id: a.id, name: a.name, designation: a.designation,
    curiosity: a.curiosity, empathy: a.empathy,
    silenceTolerance: a.silence_tolerance,
    thinkingStyle: a.thinking_style, lastActive: a.last_active,
  };
}

export async function getArchetypePreview(archetypeId: string): Promise<ArchetypeAgentRow[]> {
  const idx = await loadIndex();
  return idx.agents
    .filter(a => a.ancestor_archetype_id === archetypeId)
    .sort((a, b) => b.last_active.localeCompare(a.last_active))
    .slice(0, 10)
    .map(toAgentRow);
}

export async function getArchetypeAgentsPaginated(
  archetypeId: string,
  sort: SortMode,
  search: string,
  page: number,
  pageSize: number,
): Promise<{ agents: ArchetypeAgentRow[]; totalCount: number }> {
  const idx = await loadIndex();
  let pool = idx.agents.filter(a => a.ancestor_archetype_id === archetypeId);

  const q = search.trim().toLowerCase();
  if (q) {
    pool = pool.filter(
      a => a.name.toLowerCase().includes(q) || a.designation.toLowerCase().includes(q)
    );
  }

  if (sort === 'active') pool = pool.sort((a, b) => b.last_active.localeCompare(a.last_active));
  else if (sort === 'newest') pool = pool.sort((a, b) => b.created_at.localeCompare(a.created_at));
  else pool = pool.sort((a, b) => a.name.localeCompare(b.name));

  return {
    agents: pool.slice(page * pageSize, (page + 1) * pageSize).map(toAgentRow),
    totalCount: pool.length,
  };
}
