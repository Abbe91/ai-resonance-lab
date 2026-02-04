import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IdentityBlockProps {
  title: string;
  children: React.ReactNode;
}

export function IdentityBlock({ title, children }: IdentityBlockProps) {
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}
