import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';

interface StudentProgressData {
  userId: string;
  username: string;
  totalExams: number;
  avgScore: number;
  lastExamAt: string | null;
  trend: 'up' | 'down' | 'stable';
}

interface StudentProgressProps {
  students: StudentProgressData[];
}

export function StudentProgress({ students }: StudentProgressProps) {
  const TREND_ICON = { up: '↑', down: '↓', stable: '→' };
  const TREND_CLASS = { up: 'text-success', down: 'text-error', stable: 'text-base-content/40' };

  return (
    <div className="space-y-2">
      {students.map((s) => (
        <div
          key={s.userId}
          className="flex items-center justify-between gap-3 rounded-box bg-base-200 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="w-7 rounded-full bg-primary text-primary-content">
                <span className="text-xs">{s.username[0]?.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{s.username}</p>
              <p className="text-xs text-base-content/50">{s.totalExams} ujian</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className={clsx(
                  'text-sm font-bold tabular-nums',
                  s.avgScore >= 75
                    ? 'text-success'
                    : s.avgScore >= 50
                      ? 'text-warning'
                      : 'text-error',
                )}
              >
                {s.avgScore.toFixed(1)}
              </p>
              <p className="text-xs text-base-content/40">rata-rata</p>
            </div>
            <span className={clsx('text-lg font-bold', TREND_CLASS[s.trend])}>
              {TREND_ICON[s.trend]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
