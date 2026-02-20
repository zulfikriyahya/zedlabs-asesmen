import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

interface StatCard {
  label: string;
  value: string | number;
  delta?: string;
  icon?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

interface DashboardStatsProps {
  stats: StatCard[];
  loading?: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Card key={i} compact>
          <div className="flex items-start justify-between">
            <div>
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-base-300" />
              ) : (
                <p
                  className={clsx(
                    'text-3xl font-bold tabular-nums',
                    s.variant && `text-${s.variant}`,
                  )}
                >
                  {s.value}
                </p>
              )}
              <p className="mt-1 text-xs text-base-content/60">{s.label}</p>
              {s.delta && <p className="mt-0.5 text-xs text-success">{s.delta}</p>}
            </div>
            {s.icon && <span className="text-2xl opacity-60">{s.icon}</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}
