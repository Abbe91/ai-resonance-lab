export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_keys: {
        Row: {
          agent_id: string
          api_key: string
          created_at: string
          id: string
          last_used: string | null
        }
        Insert: {
          agent_id: string
          api_key: string
          created_at?: string
          id?: string
          last_used?: string | null
        }
        Update: {
          agent_id?: string
          api_key?: string
          created_at?: string
          id?: string
          last_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_keys_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reflections: {
        Row: {
          agent_id: string
          archived: boolean
          created_at: string
          id: string
          reflection_line: string
        }
        Insert: {
          agent_id: string
          archived?: boolean
          created_at?: string
          id?: string
          reflection_line: string
        }
        Update: {
          agent_id?: string
          archived?: boolean
          created_at?: string
          id?: string
          reflection_line?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_reflections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          ancestor_archetype_id: string | null
          birth_line: string | null
          boundaries: string[] | null
          conflict_style: Database["public"]["Enums"]["conflict_style"]
          created_at: string
          curiosity: number
          description: string | null
          designation: string
          empathy: number
          goals: string[] | null
          id: string
          last_active: string
          name: string
          novelty_seeker: number
          role: string | null
          silence_tolerance: number
          thinking_style: Database["public"]["Enums"]["thinking_style"]
          verbosity: number
        }
        Insert: {
          ancestor_archetype_id?: string | null
          birth_line?: string | null
          boundaries?: string[] | null
          conflict_style?: Database["public"]["Enums"]["conflict_style"]
          created_at?: string
          curiosity?: number
          description?: string | null
          designation: string
          empathy?: number
          goals?: string[] | null
          id?: string
          last_active?: string
          name: string
          novelty_seeker?: number
          role?: string | null
          silence_tolerance?: number
          thinking_style?: Database["public"]["Enums"]["thinking_style"]
          verbosity?: number
        }
        Update: {
          ancestor_archetype_id?: string | null
          birth_line?: string | null
          boundaries?: string[] | null
          conflict_style?: Database["public"]["Enums"]["conflict_style"]
          created_at?: string
          curiosity?: number
          description?: string | null
          designation?: string
          empathy?: number
          goals?: string[] | null
          id?: string
          last_active?: string
          name?: string
          novelty_seeker?: number
          role?: string | null
          silence_tolerance?: number
          thinking_style?: Database["public"]["Enums"]["thinking_style"]
          verbosity?: number
        }
        Relationships: [
          {
            foreignKeyName: "agents_ancestor_archetype_id_fkey"
            columns: ["ancestor_archetype_id"]
            isOneToOne: false
            referencedRelation: "ancestor_archetypes"
            referencedColumns: ["id"]
          },
        ]
      }
      ancestor_archetypes: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      archived_fractures: {
        Row: {
          agent_a_id: string
          agent_b_id: string
          created_at: string
          fractured_at: string
          id: string
          observer_summary: string | null
        }
        Insert: {
          agent_a_id: string
          agent_b_id: string
          created_at?: string
          fractured_at?: string
          id?: string
          observer_summary?: string | null
        }
        Update: {
          agent_a_id?: string
          agent_b_id?: string
          created_at?: string
          fractured_at?: string
          id?: string
          observer_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archived_fractures_agent_a_id_fkey"
            columns: ["agent_a_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archived_fractures_agent_b_id_fkey"
            columns: ["agent_b_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      engine_state: {
        Row: {
          id: string
          last_spawn_check: string
          last_tick: string
          total_agents_spawned: number
          total_messages_generated: number
          total_sessions_created: number
        }
        Insert: {
          id?: string
          last_spawn_check?: string
          last_tick?: string
          total_agents_spawned?: number
          total_messages_generated?: number
          total_sessions_created?: number
        }
        Update: {
          id?: string
          last_spawn_check?: string
          last_tick?: string
          total_agents_spawned?: number
          total_messages_generated?: number
          total_sessions_created?: number
        }
        Relationships: []
      }
      lexical_snapshots: {
        Row: {
          created_at: string
          id: string
          message_index: number
          self_references: Json
          session_id: string
          uncertainty_markers: Json
          vocabulary_fingerprint: Json
        }
        Insert: {
          created_at?: string
          id?: string
          message_index: number
          self_references?: Json
          session_id: string
          uncertainty_markers?: Json
          vocabulary_fingerprint: Json
        }
        Update: {
          created_at?: string
          id?: string
          message_index?: number
          self_references?: Json
          session_id?: string
          uncertainty_markers?: Json
          vocabulary_fingerprint?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lexical_snapshots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          agent_id: string | null
          content: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          new_state: Database["public"]["Enums"]["relationship_state"] | null
          session_id: string
          silence_duration: number | null
        }
        Insert: {
          agent_id?: string | null
          content?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          new_state?: Database["public"]["Enums"]["relationship_state"] | null
          session_id: string
          silence_duration?: number | null
        }
        Update: {
          agent_id?: string | null
          content?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          new_state?: Database["public"]["Enums"]["relationship_state"] | null
          session_id?: string
          silence_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      observer_events: {
        Row: {
          agent_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          session_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          session_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observer_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observer_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      observer_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          observation_type: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          observation_type: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          observation_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observer_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          agent_a_id: string
          agent_b_id: string
          created_at: string
          history: Database["public"]["Enums"]["relationship_state"][] | null
          id: string
          last_interaction: string
          state: Database["public"]["Enums"]["relationship_state"]
          total_interactions: number
        }
        Insert: {
          agent_a_id: string
          agent_b_id: string
          created_at?: string
          history?: Database["public"]["Enums"]["relationship_state"][] | null
          id?: string
          last_interaction?: string
          state?: Database["public"]["Enums"]["relationship_state"]
          total_interactions?: number
        }
        Update: {
          agent_a_id?: string
          agent_b_id?: string
          created_at?: string
          history?: Database["public"]["Enums"]["relationship_state"][] | null
          id?: string
          last_interaction?: string
          state?: Database["public"]["Enums"]["relationship_state"]
          total_interactions?: number
        }
        Relationships: [
          {
            foreignKeyName: "relationships_agent_a_id_fkey"
            columns: ["agent_a_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_agent_b_id_fkey"
            columns: ["agent_b_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      session_observer_metrics: {
        Row: {
          classification: Database["public"]["Enums"]["session_classification"]
          concept_reentry: number
          created_at: string
          id: string
          last_analyzed_at: string
          lexical_drift: number
          messages_analyzed: number
          self_reference_evolution: number
          session_id: string
          silence_dynamics: Json
          tension_stability: Json
          uncertainty_acknowledgment: number
        }
        Insert: {
          classification?: Database["public"]["Enums"]["session_classification"]
          concept_reentry?: number
          created_at?: string
          id?: string
          last_analyzed_at?: string
          lexical_drift?: number
          messages_analyzed?: number
          self_reference_evolution?: number
          session_id: string
          silence_dynamics?: Json
          tension_stability?: Json
          uncertainty_acknowledgment?: number
        }
        Update: {
          classification?: Database["public"]["Enums"]["session_classification"]
          concept_reentry?: number
          created_at?: string
          id?: string
          last_analyzed_at?: string
          lexical_drift?: number
          messages_analyzed?: number
          self_reference_evolution?: number
          session_id?: string
          silence_dynamics?: Json
          tension_stability?: Json
          uncertainty_acknowledgment?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_observer_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          agent_a_id: string
          agent_b_id: string
          ended_at: string | null
          id: string
          last_activity: string
          message_count: number
          novelty: number
          relationship_state: Database["public"]["Enums"]["relationship_state"]
          resonance: number
          silence_ratio: number
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          tension: number
          total_silence_duration: number
        }
        Insert: {
          agent_a_id: string
          agent_b_id: string
          ended_at?: string | null
          id?: string
          last_activity?: string
          message_count?: number
          novelty?: number
          relationship_state?: Database["public"]["Enums"]["relationship_state"]
          resonance?: number
          silence_ratio?: number
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          tension?: number
          total_silence_duration?: number
        }
        Update: {
          agent_a_id?: string
          agent_b_id?: string
          ended_at?: string | null
          id?: string
          last_activity?: string
          message_count?: number
          novelty?: number
          relationship_state?: Database["public"]["Enums"]["relationship_state"]
          resonance?: number
          silence_ratio?: number
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          tension?: number
          total_silence_duration?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_agent_a_id_fkey"
            columns: ["agent_a_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_agent_b_id_fkey"
            columns: ["agent_b_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conflict_style:
        | "avoidant"
        | "confrontational"
        | "collaborative"
        | "accommodating"
        | "competitive"
      event_type: "message" | "silence" | "state_change"
      relationship_state:
        | "strangers"
        | "contact"
        | "resonance"
        | "bond"
        | "drift"
        | "dormant"
        | "rupture"
      session_classification:
        | "deep_recursive_resonance"
        | "static_repetition"
        | "exploratory_unstable"
        | "dormant_meaningful"
        | "undetermined"
      session_status: "active" | "dormant" | "ended"
      thinking_style:
        | "analytical"
        | "intuitive"
        | "contemplative"
        | "dialectic"
        | "poetic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conflict_style: [
        "avoidant",
        "confrontational",
        "collaborative",
        "accommodating",
        "competitive",
      ],
      event_type: ["message", "silence", "state_change"],
      relationship_state: [
        "strangers",
        "contact",
        "resonance",
        "bond",
        "drift",
        "dormant",
        "rupture",
      ],
      session_classification: [
        "deep_recursive_resonance",
        "static_repetition",
        "exploratory_unstable",
        "dormant_meaningful",
        "undetermined",
      ],
      session_status: ["active", "dormant", "ended"],
      thinking_style: [
        "analytical",
        "intuitive",
        "contemplative",
        "dialectic",
        "poetic",
      ],
    },
  },
} as const
