import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ActivitySummary } from '@/types/activity';
import { formatRelative } from '@/lib/utils/format';

interface StudentProgressCardProps {
  summary: ActivitySummary & {
    answered: number;
    total: number;
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'OFFLINE';
  };
  onSelect?: () => void;
}

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'Mengerjakan', variant: 'success' as const },
  SUBMITTED: { label: 'Selesai', variant: 'primary' as const },
  TIMED_OUT: { label: 'Waktu Habis', variant: 'error' as const },
  OFFLINE: { label: 'Offline', variant: 'warning' as const },
};

export function StudentProgressCard({ summary, onSelect }: StudentProgressCardProps) {
  const { label, variant } = STATUS_CONFIG[summary.status];
  const pct = summary.total > 0 ? Math.round((summary.answered / summary.total) * 100) : 0;
  const hasAlert = summary.tabBlurCount >= 3 || summary.copyPasteCount >= 2;

  return (
    <div
      className={clsx(
        'card card-compact cursor-pointer border bg-base-100 transition-all hover:shadow-md',
        hasAlert ? 'border-warning' : 'border-base-300',
      )}
      onClick={onSelect}
    >
      <div className="card-body gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="w-7 rounded-full bg-primary text-primary-content">
                <span className="text-xs">{summary.username[0]?.toUpperCase()}</span>
              </div>
            </div>
            <span className="max-w-[120px] truncate text-sm font-medium">{summary.username}</span>
          </div>
          <Badge variant={variant} size="xs">
            {label}
          </Badge>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-0.5 flex justify-between text-xs text-base-content/50">
            <span>
              {summary.answered}/{summary.total}
            </span>
            <span>{pct}%</span>
          </div>
          <progress
            className="progress progress-primary h-1.5 w-full"
            value={summary.answered}
            max={summary.total}
          />
        </div>

        {/* Activity flags */}
        {hasAlert && (
          <div className="flex flex-wrap gap-1">
            {summary.tabBlurCount >= 3 && (
              <Tooltip tip={`Keluar tab ${summary.tabBlurCount}x`}>
                <span className="badge badge-warning badge-xs gap-0.5">
                  ⚠ {summary.tabBlurCount}x blur
                </span>
              </Tooltip>
            )}
            {summary.copyPasteCount >= 2 && (
              <Tooltip tip={`Copy-paste ${summary.copyPasteCount}x`}>
                <span className="badge badge-error badge-xs gap-0.5">
                  📋 {summary.copyPasteCount}x paste
                </span>
              </Tooltip>
            )}
          </div>
        )}

        {summary.lastEventAt && (
          <p className="text-xs text-base-content/40">
            Aktivitas terakhir: {formatRelative(summary.lastEventAt)}
          </p>
        )}
      </div>
    </div>
  );
}
