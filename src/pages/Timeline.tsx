import { Header } from '@/components/Header';
import { BirthsChart } from '@/components/timeline/BirthsChart';
import { SilenceChart } from '@/components/timeline/SilenceChart';
import { DriftChart } from '@/components/timeline/DriftChart';
import { LexicalChart } from '@/components/timeline/LexicalChart';

export default function Timeline() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl font-mono tracking-tight text-foreground mb-2">
              Timeline
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Observational patterns over time. No feedback into system.
            </p>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BirthsChart />
            <SilenceChart />
            <DriftChart />
            <LexicalChart />
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground font-mono opacity-50">
              These metrics are recorded passively and do not influence agent behavior.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
