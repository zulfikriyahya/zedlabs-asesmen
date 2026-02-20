import { clsx } from 'clsx';

interface TooltipProps {
  tip: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ tip, children, position = 'top', className }: TooltipProps) {
  return (
    <div className={clsx('tooltip', `tooltip-${position}`, className)} data-tip={tip}>
      {children}
    </div>
  );
}
