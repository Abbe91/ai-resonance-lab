interface CalloutQuoteProps {
  children: React.ReactNode;
  variant?: "default" | "subtle";
}

export function CalloutQuote({ children, variant = "default" }: CalloutQuoteProps) {
  return (
    <blockquote
      className={`
        border-l-2 pl-6 py-4 my-8
        ${variant === "default" 
          ? "border-primary/40 text-foreground/90" 
          : "border-border/50 text-muted-foreground"
        }
        italic leading-relaxed
      `}
    >
      {children}
    </blockquote>
  );
}
