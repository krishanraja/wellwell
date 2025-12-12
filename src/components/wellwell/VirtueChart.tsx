import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useVirtueHistory } from '@/hooks/useVirtueHistory';
import { Loader2 } from 'lucide-react';

interface VirtueChartProps {
  days?: number;
  compact?: boolean;
}

const virtueColors = {
  courage: 'hsl(var(--coral))',
  temperance: 'hsl(var(--cinder))',
  justice: 'hsl(var(--primary))',
  wisdom: 'hsl(160, 50%, 60%)',
};

export function VirtueChart({ days = 14, compact = false }: VirtueChartProps) {
  const { history, isLoading } = useVirtueHistory(days);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Start using WellWell to see your virtue trends
      </div>
    );
  }

  // Format dates for display
  const formattedData = history.map(point => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  return (
    <div className={compact ? 'h-32' : 'h-48'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          {!compact && (
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => <span className="capitalize text-foreground">{value}</span>}
            />
          )}
          <Line 
            type="monotone" 
            dataKey="courage" 
            stroke={virtueColors.courage}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="temperance" 
            stroke={virtueColors.temperance}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="justice" 
            stroke={virtueColors.justice}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="wisdom" 
            stroke={virtueColors.wisdom}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
