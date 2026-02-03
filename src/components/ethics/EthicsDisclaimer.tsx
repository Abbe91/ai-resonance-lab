export function EthicsDisclaimer() {
  const limitations = [
    "RESONA does not predict real-world AI behavior",
    "It does not justify autonomous systems in high-risk domains",
    "It does not replace formal ethical review processes",
    "Observations must be interpreted with caution and humility",
  ];

  return (
    <section className="py-16 px-6 border-t border-border/20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-medium text-foreground mb-8 text-center">
          Limitations and Responsibility
        </h2>
        
        <ul className="space-y-4">
          {limitations.map((item, index) => (
            <li 
              key={index}
              className="flex items-start gap-3 text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mt-2 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
