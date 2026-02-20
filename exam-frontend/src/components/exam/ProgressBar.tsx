interface ProgressBarProps {
  answered: number;
  total: number;
  className?: string;
}

export function ProgressBar({
  answered,
  total,
  className,
}: {
  answered: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-xs text-base-content/60">
        <span>
          {answered}/{total} soal dijawab
        </span>
        <span>{pct}%</span>
      </div>
      <progress className="progress progress-primary w-full" value={answered} max={total} />
    </div>
  );
}
