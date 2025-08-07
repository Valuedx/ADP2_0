import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  breakdown?: Record<string, unknown>;
  color?: string;
}

export const StatCard = ({ title, value, breakdown, color }: StatCardProps) => (
  <Card className={color ? `border-${color}-200` : ''}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value ?? '-'}</div>
      {breakdown && (
        <pre className="text-xs mt-2 text-gray-500">{JSON.stringify(breakdown, null, 2)}</pre>
      )}
    </CardContent>
  </Card>
);
