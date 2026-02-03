import { Badge } from "@/components/ui/badge";

export function EthicsHero() {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Badge 
          variant="outline" 
          className="mb-6 text-xs font-mono tracking-widest border-border/50 text-muted-foreground"
        >
          Observer-only
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-light tracking-tight text-foreground mb-6">
          Ethics
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-8">
          Observe without steering. Measure without judging.
        </p>
        
        <p className="text-sm text-muted-foreground/70 font-mono">
          A public statement of restraint, autonomy, and non-intervention.
        </p>
      </div>
    </section>
  );
}
