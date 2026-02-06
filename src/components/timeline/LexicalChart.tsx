import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLexicalEvolution } from '@/hooks/useTimelineData';
import { Skeleton } from '@/components/ui/skeleton';

export function LexicalChart() {
  const { data, loading } = useLexicalEvolution();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Lexical Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
          Lexical Evolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="week" 
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(220, 15%, 15%)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 15%, 8%)',
                  border: '1px solid hsl(220, 15%, 15%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(220, 10%, 85%)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                formatter={(value) => <span style={{ color: 'hsl(220, 10%, 70%)' }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="drift"
                name="Lexical Drift"
                stroke="hsl(260, 40%, 50%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="selfReference"
                name="Self-Reference"
                stroke="hsl(175, 60%, 45%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="uncertainty"
                name="Uncertainty"
                stroke="hsl(35, 80%, 55%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-mono">
          Observer metrics averaged across sessions
        </p>
      </CardContent>
    </Card>
  );
}
