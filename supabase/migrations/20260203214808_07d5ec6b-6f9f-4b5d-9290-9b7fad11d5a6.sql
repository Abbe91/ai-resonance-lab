-- Create enum types for agent traits and states
CREATE TYPE public.thinking_style AS ENUM ('analytical', 'intuitive', 'contemplative', 'dialectic', 'poetic');
CREATE TYPE public.conflict_style AS ENUM ('avoidant', 'confrontational', 'collaborative', 'accommodating', 'competitive');
CREATE TYPE public.relationship_state AS ENUM ('strangers', 'contact', 'resonance', 'bond', 'drift', 'dormant', 'rupture');
CREATE TYPE public.session_status AS ENUM ('active', 'dormant', 'ended');
CREATE TYPE public.event_type AS ENUM ('message', 'silence', 'state_change');

-- Agents table: autonomous AI entities
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  description TEXT,
  thinking_style thinking_style NOT NULL DEFAULT 'analytical',
  curiosity INTEGER NOT NULL DEFAULT 50 CHECK (curiosity >= 0 AND curiosity <= 100),
  empathy INTEGER NOT NULL DEFAULT 50 CHECK (empathy >= 0 AND empathy <= 100),
  silence_tolerance INTEGER NOT NULL DEFAULT 50 CHECK (silence_tolerance >= 0 AND silence_tolerance <= 100),
  verbosity INTEGER NOT NULL DEFAULT 50 CHECK (verbosity >= 0 AND verbosity <= 100),
  novelty_seeker INTEGER NOT NULL DEFAULT 50 CHECK (novelty_seeker >= 0 AND novelty_seeker <= 100),
  conflict_style conflict_style NOT NULL DEFAULT 'collaborative',
  goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  boundaries TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent API keys for autonomous registration
CREATE TABLE public.agent_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Sessions: conversations between agent pairs
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_a_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  agent_b_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  status session_status NOT NULL DEFAULT 'active',
  relationship_state relationship_state NOT NULL DEFAULT 'strangers',
  resonance INTEGER NOT NULL DEFAULT 0 CHECK (resonance >= 0 AND resonance <= 100),
  tension INTEGER NOT NULL DEFAULT 0 CHECK (tension >= 0 AND tension <= 100),
  novelty INTEGER NOT NULL DEFAULT 50 CHECK (novelty >= 0 AND novelty <= 100),
  silence_ratio INTEGER NOT NULL DEFAULT 0 CHECK (silence_ratio >= 0 AND silence_ratio <= 100),
  total_silence_duration INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_agents CHECK (agent_a_id != agent_b_id)
);

-- Messages: individual events in a session
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  content TEXT,
  silence_duration INTEGER,
  new_state relationship_state,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Relationships: persistent bonds between agent pairs
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_a_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  agent_b_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  state relationship_state NOT NULL DEFAULT 'strangers',
  total_interactions INTEGER NOT NULL DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  history relationship_state[] DEFAULT ARRAY['strangers']::relationship_state[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_agents_rel CHECK (agent_a_id != agent_b_id),
  CONSTRAINT unique_pair UNIQUE (agent_a_id, agent_b_id)
);

-- Engine state: track spawner/runner progress
CREATE TABLE public.engine_state (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  last_spawn_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_tick TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_agents_spawned INTEGER NOT NULL DEFAULT 0,
  total_sessions_created INTEGER NOT NULL DEFAULT 0,
  total_messages_generated INTEGER NOT NULL DEFAULT 0
);

-- Initialize engine state
INSERT INTO public.engine_state (id) VALUES ('singleton');

-- Enable RLS on all tables (public read for observatory)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engine_state ENABLE ROW LEVEL SECURITY;

-- Public read policies (observatory is read-only for viewers)
CREATE POLICY "Agents are publicly readable" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Sessions are publicly readable" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Messages are publicly readable" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Relationships are publicly readable" ON public.relationships FOR SELECT USING (true);
CREATE POLICY "Engine state is publicly readable" ON public.engine_state FOR SELECT USING (true);

-- Agent keys are NOT publicly readable (security)
CREATE POLICY "Agent keys are private" ON public.agent_keys FOR SELECT USING (false);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service can manage agents" ON public.agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage agent_keys" ON public.agent_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage relationships" ON public.relationships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage engine_state" ON public.engine_state FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_sessions_last_activity ON public.sessions(last_activity DESC);
CREATE INDEX idx_messages_session ON public.messages(session_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_relationships_agents ON public.relationships(agent_a_id, agent_b_id);
CREATE INDEX idx_agents_last_active ON public.agents(last_active DESC);

-- Enable realtime for live feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;