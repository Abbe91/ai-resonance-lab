import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrincipleCardProps {
  number: number;
  title: string;
  description: string;
}

export function PrincipleCard({ number, title, description }: PrincipleCardProps) {
  return (
    <Card className="glass-card border-border/30 hover:border-border/50 transition-colors duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <span className="text-4xl font-light text-muted-foreground/30 font-mono">
            {number.toString().padStart(2, '0')}
          </span>
          <CardTitle className="text-lg font-medium text-foreground leading-tight pt-2">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
