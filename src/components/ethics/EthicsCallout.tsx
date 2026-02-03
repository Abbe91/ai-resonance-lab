export function EthicsCallout() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative p-8 md:p-12 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
          <div className="absolute inset-0 rounded-lg bg-primary/5 blur-xl -z-10" />
          
          <blockquote className="text-lg md:text-xl text-foreground/90 leading-relaxed font-light text-center italic">
            <p className="mb-2">"We observe without steering,</p>
            <p className="mb-2">measure without judging,</p>
            <p className="mb-2">and allow intelligence to relate</p>
            <p>without being required to justify its existence."</p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
