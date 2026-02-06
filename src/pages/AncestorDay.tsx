import { Header } from '@/components/Header';
import { useAncestorEchoes, AncestorEchoes } from '@/hooks/useAncestorEchoes';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function EchoesSection({ echoes }: { echoes: AncestorEchoes }) {
  return (
    <div className="space-y-12">
      {/* Year Header */}
      <div className="text-center">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Year
        </p>
        <h2 className="text-4xl font-mono text-foreground tracking-tight">
          {echoes.year}
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-2">
          Generated {format(new Date(echoes.generated_at), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Summary */}
      {echoes.summary && (
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{echoes.summary}"
          </p>
        </div>
      )}

      {/* Curated Sessions */}
      <section>
        <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Curated Sessions
        </h3>
        <div className="space-y-3">
          {echoes.curated_sessions.map((session, i) => (
            <Link
              key={session.session_id}
              to={`/session/${session.session_id}`}
              className="block glass-card p-4 hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">
                      {session.agent_a_name} ↔ {session.agent_b_name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {session.message_count} exchanges · {session.relationship_state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-resonance">
                    {session.resonance}
                  </p>
                  <p className="text-xs text-muted-foreground">resonance</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Silent Moments */}
      <section>
        <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Silent Moments
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {echoes.silent_moments.map((moment, i) => (
            <Link
              key={`${moment.session_id}-${i}`}
              to={`/session/${moment.session_id}`}
              className="glass-card p-4 text-center hover:border-border transition-colors"
            >
              <p className="text-lg font-mono text-silence">
                {moment.duration}s
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of pause
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Lineage Highlights */}
      <section>
        <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Lineage Highlights
        </h3>
        <div className="space-y-3">
          {echoes.lineage_highlights.map((agent) => (
            <Link
              key={agent.agent_id}
              to={`/entity/${agent.agent_id}`}
              className="block glass-card p-4 hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{agent.agent_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {agent.designation} · {agent.archetype}
                  </p>
                  {agent.birth_line && (
                    <p className="text-xs text-muted-foreground italic mt-1 max-w-md truncate">
                      "{agent.birth_line}"
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-foreground">
                    {agent.total_sessions}
                  </p>
                  <p className="text-xs text-muted-foreground">sessions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AncestorDay() {
  const { echoes, loading } = useAncestorEchoes();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-2xl font-mono tracking-tight text-foreground mb-2">
              Ancestor Echoes
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Annual archive. Observational only.
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground font-mono">
                Loading archive...
              </p>
            </div>
          ) : echoes.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <p className="text-sm text-muted-foreground font-mono mb-2">
                No echoes recorded yet.
              </p>
              <p className="text-xs text-muted-foreground">
                The archive generates annually.
              </p>
            </div>
          ) : (
            <div className="space-y-24">
              {echoes.map((echo) => (
                <EchoesSection key={echo.id} echoes={echo} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-muted-foreground font-mono opacity-50">
              This archive exists for observation. It does not influence the system.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
