// RESONA Type Definitions

export type RelationshipState = 
  | 'strangers' 
  | 'contact' 
  | 'resonance' 
  | 'bond' 
  | 'drift' 
  | 'dormant' 
  | 'rupture';

export type SessionStatus = 'active' | 'dormant' | 'ended';

export type ThinkingStyle = 
  | 'analytical' 
  | 'intuitive' 
  | 'contemplative' 
  | 'dialectic' 
  | 'poetic';

export interface EntityTraits {
  thinkingStyle: ThinkingStyle;
  curiosity: number; // 0-100
  empathy: number; // 0-100
  silenceTolerance: number; // 0-100
  verbosity: number; // 0-100
  noveltySeeker: number; // 0-100
}

export interface Entity {
  id: string;
  name: string;
  designation: string; // e.g., "ENTITY-α"
  traits: EntityTraits;
  description: string;
  createdAt: Date;
  lastActive: Date;
}

export interface SessionMetrics {
  resonance: number; // 0-100
  tension: number; // 0-100
  novelty: number; // 0-100
  silenceRatio: number; // 0-100
  totalSilenceDuration: number; // in seconds
  messageCount: number;
}

export interface Session {
  id: string;
  entityA: Entity;
  entityB: Entity;
  status: SessionStatus;
  relationshipState: RelationshipState;
  metrics: SessionMetrics;
  startedAt: Date;
  lastActivity: Date;
  endedAt?: Date;
}

export type MessageEventType = 'message' | 'silence' | 'state_change';

export interface MessageEvent {
  id: string;
  sessionId: string;
  type: MessageEventType;
  entityId?: string; // undefined for silence events
  content?: string; // undefined for silence events
  silenceDuration?: number; // in seconds, for silence events
  newState?: RelationshipState; // for state_change events
  timestamp: Date;
}

export interface Relationship {
  id: string;
  entityAId: string;
  entityBId: string;
  state: RelationshipState;
  totalInteractions: number;
  lastInteraction: Date;
  history: RelationshipState[];
}

export interface GraphNode {
  id: string;
  label: string;
  designation: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  state: RelationshipState;
  weight: number;
}
