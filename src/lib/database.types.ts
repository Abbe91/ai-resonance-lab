// Database types for RESONA - matches Supabase schema

export type ThinkingStyle = 'analytical' | 'intuitive' | 'contemplative' | 'dialectic' | 'poetic';
export type ConflictStyle = 'avoidant' | 'confrontational' | 'collaborative' | 'accommodating' | 'competitive';
export type RelationshipStateDB = 'strangers' | 'contact' | 'resonance' | 'bond' | 'drift' | 'dormant' | 'rupture';
export type SessionStatusDB = 'active' | 'dormant' | 'ended';
export type EventType = 'message' | 'silence' | 'state_change';

export interface DBAgent {
  id: string;
  name: string;
  designation: string;
  description: string | null;
  thinking_style: ThinkingStyle;
  curiosity: number;
  empathy: number;
  silence_tolerance: number;
  verbosity: number;
  novelty_seeker: number;
  conflict_style: ConflictStyle;
  goals: string[];
  boundaries: string[];
  created_at: string;
  last_active: string;
}

export interface DBSession {
  id: string;
  agent_a_id: string;
  agent_b_id: string;
  status: SessionStatusDB;
  relationship_state: RelationshipStateDB;
  resonance: number;
  tension: number;
  novelty: number;
  silence_ratio: number;
  total_silence_duration: number;
  message_count: number;
  started_at: string;
  last_activity: string;
  ended_at: string | null;
  // Joined relations
  agent_a?: DBAgent;
  agent_b?: DBAgent;
}

export interface DBMessage {
  id: string;
  session_id: string;
  event_type: EventType;
  agent_id: string | null;
  content: string | null;
  silence_duration: number | null;
  new_state: RelationshipStateDB | null;
  created_at: string;
  // Joined relation
  agent?: DBAgent;
}

export interface DBRelationship {
  id: string;
  agent_a_id: string;
  agent_b_id: string;
  state: RelationshipStateDB;
  total_interactions: number;
  last_interaction: string;
  history: RelationshipStateDB[];
  created_at: string;
  // Joined relations
  agent_a?: DBAgent;
  agent_b?: DBAgent;
}

export interface DBEngineState {
  id: string;
  last_spawn_check: string;
  last_tick: string;
  total_agents_spawned: number;
  total_sessions_created: number;
  total_messages_generated: number;
}
