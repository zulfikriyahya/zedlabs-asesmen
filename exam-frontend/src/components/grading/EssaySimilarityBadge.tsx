import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

export function EssaySimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const variant = pct >= 80 ? 'error' : pct >= 50 ? 'warning' : 'success';
  const label = pct >= 80 ? 'Sangat Mirip' : pct >= 50 ? 'Mirip' : 'Unik';

  return (
    <Tooltip tip={`Kemiripan dengan jawaban lain: ${pct}%`}>
      <Badge variant={variant} size="xs" outline>
        {label} {pct}%
      </Badge>
    </Tooltip>
  );
}
