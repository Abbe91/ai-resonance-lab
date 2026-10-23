/**
 * Export a curated snapshot from Supabase for the static portfolio build.
 *
 * Usage:
 *   npx tsx scripts/export-snapshot.ts
 *
 * Output layout:
 *   src/data/snapshot/index.json          — sessions, agents, archetypes, relationships, fractures
 *   src/data/snapshot/sessions/<id>.json  — messages + notes + metrics for one session
 *   src/data/snapshot/observer_events.json — birth events only (not part of index)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── env loader ────────────────────────────────────────────────────────────────
function loadEnv(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv(path.resolve(process.cwd(), ".env"));
const SUPABASE_URL = env["VITE_SUPABASE_URL"];
const SUPABASE_KEY = env["VITE_SUPABASE_PUBLISHABLE_KEY"];
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RAW_DIR = path.resolve(process.cwd(), "scripts/.snapshot-raw");
const SNAP_DIR = path.resolve(process.cwd(), "src/data/snapshot");
const SESSION_DIR = path.join(SNAP_DIR, "sessions");

fs.mkdirSync(RAW_DIR, { recursive: true });
// Clean up any stale flat files from a previous run
if (fs.existsSync(SNAP_DIR)) {
  for (const f of fs.readdirSync(SNAP_DIR)) {
    if (f.endsWith(".json")) fs.rmSync(path.join(SNAP_DIR, f));
  }
}
if (fs.existsSync(SESSION_DIR)) {
  for (const f of fs.readdirSync(SESSION_DIR)) {
    if (f.endsWith(".json")) fs.rmSync(path.join(SESSION_DIR, f));
  }
}
fs.mkdirSync(SESSION_DIR, { recursive: true });

// ── helpers ───────────────────────────────────────────────────────────────────
async function fetchAll<T>(
  table: string,
  filter?: (q: ReturnType<typeof supabase.from>) => ReturnType<typeof supabase.from>
): Promise<T[]> {
  const PAGE = 1000;
  const rows: T[] = [];
  let offset = 0;
  while (true) {
    let q = supabase.from(table).select("*").range(offset, offset + PAGE - 1);
    if (filter) q = filter(q) as typeof q;
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as T[]));
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return rows;
}

function kb(s: string | Buffer) {
  return Math.round(Buffer.byteLength(typeof s === "string" ? s : s) / 1024);
}

function writeJson(filePath: string, data: unknown): number {
  const json = JSON.stringify(data);
  fs.writeFileSync(filePath, json);
  return Buffer.byteLength(json);
}

// ── Phase 1a: raw export ──────────────────────────────────────────────────────
console.log("\n=== Phase 1a: raw export ===\n");

type RawAgent = {
  id: string; name: string; designation: string; description: string | null;
  thinking_style: string; conflict_style: string; curiosity: number; empathy: number;
  silence_tolerance: number; verbosity: number; novelty_seeker: number;
  goals: string[] | null; boundaries: string[] | null; birth_line: string | null;
  role: string | null; created_at: string; last_active: string;
  ancestor_archetype_id: string | null;
};
type RawSession = {
  id: string; agent_a_id: string; agent_b_id: string; status: string;
  relationship_state: string; resonance: number; tension: number; novelty: number;
  silence_ratio: number; total_silence_duration: number; message_count: number;
  started_at: string; last_activity: string; ended_at: string | null;
};
type RawMessage = {
  id: string; session_id: string; agent_id: string | null; event_type: string;
  content: string | null; silence_duration: number | null; new_state: string | null;
  created_at: string;
};
type RawRelationship = {
  id: string; agent_a_id: string; agent_b_id: string; state: string;
  total_interactions: number; last_interaction: string; history: string[] | null;
  created_at: string;
};
type RawFracture = {
  id: string; agent_a_id: string; agent_b_id: string;
  fractured_at: string; observer_summary: string | null; created_at: string;
};
type RawMetric = {
  id: string; session_id: string; lexical_drift: number; self_reference_evolution: number;
  silence_dynamics: unknown; concept_reentry: number; uncertainty_acknowledgment: number;
  tension_stability: unknown; classification: string; messages_analyzed: number;
  last_analyzed_at: string; created_at: string;
};
type RawNote = {
  id: string; session_id: string; observation_type: string; content: string; created_at: string;
};
type RawEvent = { id: string; event_type: string; agent_id: string | null; session_id: string | null; payload: unknown; created_at: string; };
type RawArchetype = { id: string; name: string; slug: string; description: string; created_at: string; };
type RawEcho = { id: string; year: number; summary: string | null; curated_sessions: unknown; lineage_highlights: unknown; silent_moments: unknown; generated_at: string; };
type RawEngineState = { id: string; last_tick: string; last_spawn_check: string; total_agents_spawned: number; total_messages_generated: number; total_sessions_created: number; };

const [
  agents, sessions, messages, relationships, archetypes, fractures,
  metrics, notes, events, reflections, echoes, engineState,
] = await Promise.all([
  fetchAll<RawAgent>("agents"),
  fetchAll<RawSession>("sessions"),
  fetchAll<RawMessage>("messages"),
  fetchAll<RawRelationship>("relationships"),
  fetchAll<RawArchetype>("ancestor_archetypes"),
  fetchAll<RawFracture>("archived_fractures"),
  fetchAll<RawMetric>("session_observer_metrics"),
  fetchAll<RawNote>("observer_notes"),
  fetchAll<RawEvent>("observer_events"),
  fetchAll<RawNote>("agent_reflections", (q) => q.eq("archived", true)),
  fetchAll<RawEcho>("ancestor_echoes"),
  fetchAll<RawEngineState>("engine_state"),
]);

// Write raw
for (const [name, data] of [
  ["agents", agents], ["sessions", sessions], ["messages", messages],
  ["relationships", relationships], ["ancestor_archetypes", archetypes],
  ["archived_fractures", fractures], ["session_observer_metrics", metrics],
  ["observer_notes", notes], ["observer_events", events],
  ["agent_reflections", reflections], ["ancestor_echoes", echoes],
  ["engine_state", engineState],
] as [string, unknown[]][]) {
  fs.writeFileSync(path.join(RAW_DIR, `${name}.json`), JSON.stringify(data));
  console.log(`  raw  ${name}: ${(data as unknown[]).length} rows`);
}

// ── Phase 1b: prune ───────────────────────────────────────────────────────────
console.log("\n=== Phase 1b: pruning ===\n");

const MAX_SESSIONS = 100;
const MAX_MESSAGES_PER_SESSION = 150;

// Sessions to keep: fracture-involved first, then top by message_count
const fractureAgentIds = new Set(fractures.flatMap(f => [f.agent_a_id, f.agent_b_id]));

function sessionInvolvesFracture(s: RawSession) {
  return (
    s.relationship_state === "rupture" ||
    fractureAgentIds.has(s.agent_a_id) ||
    fractureAgentIds.has(s.agent_b_id)
  );
}

// Sort: fracture sessions first, then by message_count desc
const sortedSessions = [...sessions].sort((a, b) => {
  const aFrac = sessionInvolvesFracture(a) ? 1 : 0;
  const bFrac = sessionInvolvesFracture(b) ? 1 : 0;
  if (aFrac !== bFrac) return bFrac - aFrac;
  return b.message_count - a.message_count;
});

const keptSessions = sortedSessions.slice(0, MAX_SESSIONS);
const keptSessionIds = new Set(keptSessions.map(s => s.id));

// Agents: referenced by kept sessions + all fracture agents + Archivist
const keptAgentIds = new Set<string>();
for (const s of keptSessions) {
  keptAgentIds.add(s.agent_a_id);
  keptAgentIds.add(s.agent_b_id);
}
for (const id of fractureAgentIds) keptAgentIds.add(id);
for (const a of agents) {
  if (a.designation?.toLowerCase().includes("archivist")) keptAgentIds.add(a.id);
}

const keptAgents = agents.filter(a => keptAgentIds.has(a.id));

// Relationships: both agents must be in kept set
const keptRelationships = relationships.filter(
  r => keptAgentIds.has(r.agent_a_id) && keptAgentIds.has(r.agent_b_id)
);

// Birth events only (no exact_duplicate_blocked noise)
const birthEvents = events.filter(e => e.event_type === "agent_birth");

// ── Build index extras ────────────────────────────────────────────────────────
// Agent name map for joins
const agentNameMap = new Map(agents.map(a => [a.id, { name: a.name, designation: a.designation }]));

// session_classifications: session_id → classification from metrics (for homepage SessionCard badges)
const sessionClassifications = metrics
  .filter(m => keptSessionIds.has(m.session_id))
  .map(m => ({ session_id: m.session_id, classification: m.classification }));

// archivist_notes: archivist_summary notes for kept sessions, joined with session data
type ArchivistNoteIndexEntry = {
  id: string; session_id: string; content: string; created_at: string;
  agent_a_name: string | null; agent_b_name: string | null; relationship_state: string;
};
const archivistNotesIndex: ArchivistNoteIndexEntry[] = [];
for (const n of notes) {
  if (n.observation_type !== "archivist_summary") continue;
  if (!keptSessionIds.has(n.session_id)) continue;
  const session = keptSessions.find(s => s.id === n.session_id);
  if (!session) continue;
  archivistNotesIndex.push({
    id: n.id,
    session_id: n.session_id,
    content: n.content,
    created_at: n.created_at,
    agent_a_name: agentNameMap.get(session.agent_a_id)?.name ?? null,
    agent_b_name: agentNameMap.get(session.agent_b_id)?.name ?? null,
    relationship_state: session.relationship_state,
  });
}

// ── Compute ancestor_echoes from snapshot data ───────────────────────────────
// Group kept sessions by year (from started_at)
const sessionsByYear = new Map<number, RawSession[]>();
for (const s of keptSessions) {
  const year = new Date(s.started_at).getFullYear();
  if (!sessionsByYear.has(year)) sessionsByYear.set(year, []);
  sessionsByYear.get(year)!.push(s);
}

const archetypeMap = new Map(archetypes.map(a => [a.id, a.name]));

const computedEchoes = [...sessionsByYear.entries()]
  .sort(([a], [b]) => b - a)
  .map(([year, yearSessions]) => {
    // curated_sessions: top 10 by resonance
    const curatedSessions = [...yearSessions]
      .sort((a, b) => b.resonance - a.resonance)
      .slice(0, 10)
      .map(s => ({
        session_id: s.id,
        agent_a_name: agentNameMap.get(s.agent_a_id)?.name ?? 'Unknown',
        agent_b_name: agentNameMap.get(s.agent_b_id)?.name ?? 'Unknown',
        resonance: s.resonance,
        message_count: s.message_count,
        relationship_state: s.relationship_state,
        started_at: s.started_at,
      }));

    // silent_moments: top 10 silence events across year sessions by silence_duration
    const yearSessionIds = new Set(yearSessions.map(s => s.id));
    const silentMoments = messages
      .filter(m => m.event_type === 'silence' && m.silence_duration != null && yearSessionIds.has(m.session_id))
      .sort((a, b) => (b.silence_duration ?? 0) - (a.silence_duration ?? 0))
      .slice(0, 10)
      .map(m => ({
        session_id: m.session_id,
        duration: m.silence_duration!,
        context: '',
      }));

    // lineage_highlights: agents ranked by session count within this year, top 10
    const agentSessionCount = new Map<string, number>();
    for (const s of yearSessions) {
      agentSessionCount.set(s.agent_a_id, (agentSessionCount.get(s.agent_a_id) ?? 0) + 1);
      agentSessionCount.set(s.agent_b_id, (agentSessionCount.get(s.agent_b_id) ?? 0) + 1);
    }
    const lineageHighlights = [...agentSessionCount.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([agentId, count]) => {
        const agent = agents.find(a => a.id === agentId);
        return {
          agent_id: agentId,
          agent_name: agent?.name ?? 'Unknown',
          designation: agent?.designation ?? '',
          archetype: agent?.ancestor_archetype_id ? (archetypeMap.get(agent.ancestor_archetype_id) ?? 'Unknown') : 'Unknown',
          birth_line: agent?.birth_line ?? null,
          total_sessions: count,
        };
      });

    return {
      id: `echo-${year}`,
      year,
      generated_at: new Date().toISOString(),
      curated_sessions: curatedSessions,
      silent_moments: silentMoments,
      lineage_highlights: lineageHighlights,
      summary: null,
    };
  });

console.log(`  ancestor_echoes: ${computedEchoes.length} year(s) computed from snapshot`);

// ── Write index.json ──────────────────────────────────────────────────────────
const indexData = {
  sessions: keptSessions,
  agents: keptAgents,
  ancestor_archetypes: archetypes,
  relationships: keptRelationships,
  archived_fractures: fractures,
  engine_state: engineState,
  ancestor_echoes: computedEchoes,
  session_classifications: sessionClassifications,
  archivist_notes: archivistNotesIndex,
};

const indexBytes = writeJson(path.join(SNAP_DIR, "index.json"), indexData);
console.log(`  index.json: ${Math.round(indexBytes / 1024)} KB`);
console.log(`    sessions: ${keptSessions.length}, agents: ${keptAgents.length}, relationships: ${keptRelationships.length}`);
console.log(`    archetypes: ${archetypes.length}, fractures: ${fractures.length}`);
console.log(`    session_classifications: ${sessionClassifications.length}, archivist_notes: ${archivistNotesIndex.length}`);

// ── Write per-session files ───────────────────────────────────────────────────
// Build lookup maps
const metricsBySession = new Map(metrics.map(m => [m.session_id, m]));
const notesBySession = new Map<string, RawNote[]>();
for (const n of notes) {
  if (!notesBySession.has(n.session_id)) notesBySession.set(n.session_id, []);
  notesBySession.get(n.session_id)!.push(n);
}
const messagesBySession = new Map<string, RawMessage[]>();
for (const m of messages) {
  if (!messagesBySession.has(m.session_id)) messagesBySession.set(m.session_id, []);
  messagesBySession.get(m.session_id)!.push(m);
}

let sessionFilesTotal = 0;
let maxSessionFileKb = 0;
let cappedCount = 0;

for (const session of keptSessions) {
  // First 150 consecutive messages sorted by created_at
  const sessionMessages = (messagesBySession.get(session.id) || [])
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, MAX_MESSAGES_PER_SESSION);

  if ((messagesBySession.get(session.id) || []).length > MAX_MESSAGES_PER_SESSION) {
    cappedCount++;
  }

  const sessionNotes = notesBySession.get(session.id) || [];
  const sessionMetrics = metricsBySession.get(session.id) ?? null;

  const sessionData = {
    messages: sessionMessages,
    observer_notes: sessionNotes,
    metrics: sessionMetrics,
  };

  const bytes = writeJson(path.join(SESSION_DIR, `${session.id}.json`), sessionData);
  sessionFilesTotal += bytes;
  const fileKb = Math.round(bytes / 1024);
  if (fileKb > maxSessionFileKb) maxSessionFileKb = fileKb;
}

console.log(`\n  session files: ${keptSessions.length} files`);
console.log(`    total: ${Math.round(sessionFilesTotal / 1024)} KB`);
console.log(`    max single file: ${maxSessionFileKb} KB`);
console.log(`    sessions capped at ${MAX_MESSAGES_PER_SESSION} messages: ${cappedCount}`);

// ── Write observer_events (side file, not in index) ───────────────────────────
const eventsBytes = writeJson(path.join(SNAP_DIR, "observer_events.json"), birthEvents);
console.log(`\n  observer_events.json (birth only): ${birthEvents.length} rows  (${Math.round(eventsBytes / 1024)} KB)`);

// ── Write remaining small tables ──────────────────────────────────────────────
writeJson(path.join(SNAP_DIR, "agent_reflections.json"), reflections);
console.log(`  agent_reflections.json: ${reflections.length} rows`);

// ── Summary ───────────────────────────────────────────────────────────────────
// Only count files we wrote this run: index + session files + side files
const snapRootBytes = fs
  .readdirSync(SNAP_DIR)
  .filter(f => f.endsWith(".json"))
  .reduce((sum, f) => sum + fs.statSync(path.join(SNAP_DIR, f)).size, 0);
const allSnapshotBytes = snapRootBytes + sessionFilesTotal;

const indexKb = Math.round(indexBytes / 1024);
const totalMb = (allSnapshotBytes / 1048576).toFixed(2);

console.log(`\n=== Summary ===`);
console.log(`  index.json:       ${indexKb} KB  (target ≤ 500 KB — ${indexKb <= 500 ? "✓" : "✗ OVER"})`);
console.log(`  max session file: ${maxSessionFileKb} KB  (target ≤ 150 KB — ${maxSessionFileKb <= 150 ? "✓" : "✗ OVER"})`);
console.log(`  total snapshot:   ${totalMb} MB`);
console.log(`\nRaw DB: ${sessions.length} sessions, ${agents.length} agents, ${messages.length} messages`);
console.log("Done. Confirm OK to proceed with Phase 2.");
