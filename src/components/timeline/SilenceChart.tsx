import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSilenceRatioOverTime } from '@/hooks/useTimelineData';
import { Skeleton } from '@/components/ui/skeleton';

export function SilenceChart() {
  const { data, loading } = useSilenceRatioOverTime();

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Silence Ratio Over Time
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
          Silence Ratio Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(220, 15%, 15%)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 15%, 8%)',
                  border: '1px solid hsl(220, 15%, 15%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(220, 10%, 85%)' }}
                formatter={(value: number) => [`${value}%`, 'Silence']}
              />
              <Line
                type="monotone"
                dataKey="silenceRatio"
                stroke="hsl(220, 10%, 35%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(220, 10%, 35%)', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: 'hsl(220, 10%, 50%)', strokeWidth: 0, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-mono">
          Average silence as percentage of session time
        </p>
      </CardContent>
    </Card>
  );
}
