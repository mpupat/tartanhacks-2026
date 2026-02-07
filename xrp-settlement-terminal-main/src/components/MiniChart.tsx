import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: { price: number }[];
  isPositive: boolean;
}

export function MiniChart({ data, isPositive }: MiniChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? 'hsl(120, 100%, 50%)' : 'hsl(0, 100%, 50%)'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}