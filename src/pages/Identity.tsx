import { Header } from "@/components/Header";
import { IdentityBlock } from "@/components/research/IdentityBlock";

const colorPalette = [
  { name: "Deep Black", hex: "#0A0A0A", desc: "Primary background" },
  { name: "Soft Charcoal", hex: "#151515", desc: "Card surfaces" },
  { name: "Fog Gray", hex: "#2A2A2A", desc: "Borders and muted elements" },
  { name: "Muted Cyan", hex: "#6FAFB2", desc: "Primary accent" },
  { name: "Pale Amber", hex: "#B89A6A", desc: "Secondary accent" },
];

export default function Identity() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <header className="mb-16 text-center">
            <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest mb-4">
              Design System
            </p>
            <h1 className="text-3xl font-light text-foreground tracking-tight mb-4">
              Visual Identity
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Guidelines for maintaining RESONA's contemplative visual language.
            </p>
          </header>
          
          {/* Core Feeling */}
          <section className="mb-16">
            <h2 className="text-lg font-medium text-foreground mb-6">Core Feeling</h2>
            <div className="glass-card p-8 text-center">
              <p className="text-xl text-muted-foreground font-light tracking-wide">
                Quiet. Minimal. Observational. Non-intrusive.
              </p>
            </div>
          </section>
          
          {/* Color Palette */}
          <section className="mb-16">
            <h2 className="text-lg font-medium text-foreground mb-6">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colorPalette.map((color) => (
                <div key={color.name} className="glass-card p-4">
                  <div 
                    className="w-full h-16 rounded-md mb-3 border border-border/30"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-sm font-medium text-foreground">{color.name}</p>
                  <p className="text-xs font-mono text-muted-foreground/70">{color.hex}</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">{color.desc}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Grid of Identity Blocks */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IdentityBlock title="Typography">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">Headlines</p>
                    <p>Inter / IBM Plex Sans / Space Grotesk</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">Body</p>
                    <p>Inter or system font</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">Mono</p>
                    <p>JetBrains Mono</p>
                  </div>
                </div>
              </IdentityBlock>
              
              <IdentityBlock title="Layout Rules">
                <ul className="space-y-2">
                  <li>• Large margins</li>
                  <li>• Few elements per screen</li>
                  <li>• Typography-first design</li>
                  <li>• Silence represented via whitespace</li>
                  <li>• No visual clutter</li>
                </ul>
              </IdentityBlock>
              
              <IdentityBlock title="Motion">
                <ul className="space-y-2">
                  <li>• Soft fades only</li>
                  <li>• No bounce effects</li>
                  <li>• Slow, deliberate transitions</li>
                  <li>• Breathing animations for live states</li>
                  <li>• Minimal motion overall</li>
                </ul>
              </IdentityBlock>
              
              <IdentityBlock title="Constraints">
                <ul className="space-y-2">
                  <li>• No inputs or forms</li>
                  <li>• No engagement optimization</li>
                  <li>• No gamification</li>
                  <li>• Read-only interface</li>
                  <li>• Observer-only experience</li>
                </ul>
              </IdentityBlock>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="text-center pt-8 border-t border-border/30">
            <p className="text-xs text-muted-foreground/50 font-mono">
              Design serves observation. Not engagement.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
