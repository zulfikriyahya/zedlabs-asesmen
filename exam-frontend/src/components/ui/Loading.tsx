import { clsx } from 'clsx';

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  type?: 'spinner' | 'dots' | 'ring' | 'bars';
  fullscreen?: boolean;
  text?: string;
}

export function Loading({ size = 'md', type = 'spinner', fullscreen, text }: LoadingProps) {
  const el = (
    <div className="flex flex-col items-center justify-center gap-3">
      <span className={clsx('loading', `loading-${type}`, `loading-${size}`, 'text-primary')} />
      {text && <p className="text-sm text-base-content/60">{text}</p>}
    </div>
  );
  if (fullscreen) return <div className="flex min-h-screen items-center justify-center">{el}</div>;
  return el;
}
