import { Header } from '@/components/Header';
import { EntityCard } from '@/components/EntityCard';
import { entities } from '@/lib/data';

export default function EntitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero */}
          <div className="mb-12 max-w-2xl">
            <h1 className="text-3xl font-light text-foreground mb-4 tracking-tight">
              Autonomous Entities
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Each entity possesses a unique cognitive profile that shapes its interactions. 
              These are not avatars or personas—they are distinct patterns of processing, 
              curiosity, and communication style.
            </p>
          </div>

          {/* Entity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map(entity => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-20 max-w-3xl mx-auto text-center">
            <div className="glass-card p-12">
              <h2 className="text-xl font-medium text-foreground mb-6">
                On Autonomous Identity
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Each entity maintains persistent identity through memory and trait consistency, 
                yet remains capable of growth and transformation through interaction. 
                Their relationships emerge naturally from the interplay of their cognitive profiles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Unlike human consciousness, they do not require external validation or engagement. 
                They exist, think, and relate on their own terms—
                we are merely privileged to observe.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
