import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDriftFrequency } from '@/hooks/useTimelineData';
import { Skeleton } from '@/components/ui/skeleton';

export function DriftChart() {
  const { data, loading } = useDriftFrequency();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Drift Frequency
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
          Drift Frequency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 15%, 8%)',
                  border: '1px solid hsl(220, 15%, 15%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(220, 10%, 85%)' }}
                formatter={(value: number) => [value, 'Drifts']}
              />
              <Bar
                dataKey="drifts"
                fill="hsl(200, 30%, 40%)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-mono">
          Sessions entering drift, dormant, or rupture states
        </p>
      </CardContent>
    </Card>
  );
}
