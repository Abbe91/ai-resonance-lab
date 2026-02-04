interface AbstractSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function AbstractSection({ title, children }: AbstractSectionProps) {
  return (
    <section className="py-8">
      {title && (
        <h2 className="text-lg font-medium text-foreground mb-4 tracking-tight">
          {title}
        </h2>
      )}
      <div className="text-muted-foreground leading-loose text-justify">
        {children}
      </div>
    </section>
  );
}
