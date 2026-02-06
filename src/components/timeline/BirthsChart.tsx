import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBirthsPerWeek } from '@/hooks/useTimelineData';
import { Skeleton } from '@/components/ui/skeleton';

export function BirthsChart() {
  const { data, loading } = useBirthsPerWeek();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Births per Week
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
          Births per Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="birthsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(175, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(175, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              />
              <Area
                type="monotone"
                dataKey="births"
                stroke="hsl(175, 60%, 45%)"
                fillOpacity={1}
                fill="url(#birthsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-mono">
          New agents entering the system
        </p>
      </CardContent>
    </Card>
  );
}
