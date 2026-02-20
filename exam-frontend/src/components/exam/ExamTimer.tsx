'use client';
import { clsx } from 'clsx';
import { selectFormattedTime, selectIsWarning, selectProgressPercent } from '@/stores/timer.store';
import { useTimerStore } from '@/stores/timer.store';

interface ExamTimerProps {
  onExpire?: () => void;
  className?: string;
}

export function ExamTimer({ className }: ExamTimerProps) {
  const store = useTimerStore();
  const formatted = selectFormattedTime(store);
  const isWarning = selectIsWarning(store);
  const progress = selectProgressPercent(store);

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {/* Radial progress */}
      <div
        className={clsx(
          'radial-progress font-mono text-sm font-bold transition-colors',
          store.isExpired
            ? 'text-error'
            : isWarning
              ? 'animate-pulse text-warning'
              : 'text-primary',
        )}
        style={
          { '--value': progress, '--size': '3.5rem', '--thickness': '4px' } as React.CSSProperties
        }
        role="progressbar"
        aria-label={`Sisa waktu: ${formatted}`}
      >
        <span className="text-xs">{formatted}</span>
      </div>

      <div className="hidden sm:block">
        <p className="text-xs text-base-content/50">Sisa Waktu</p>
        <p
          className={clsx(
            'font-mono font-bold tabular-nums',
            store.isExpired ? 'text-error' : isWarning ? 'text-warning' : 'text-base-content',
          )}
        >
          {formatted}
        </p>
      </div>
    </div>
  );
}
