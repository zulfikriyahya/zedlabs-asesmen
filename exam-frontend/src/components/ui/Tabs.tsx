'use client';
import { clsx } from 'clsx';

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'boxed' | 'lifted' | 'bordered';
  className?: string;
}

export function Tabs({ tabs, active, onChange, variant = 'bordered', className }: TabsProps) {
  return (
    <div role="tablist" className={clsx('tabs', `tabs-${variant}`, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          className={clsx('tab gap-2', active === tab.key && 'tab-active')}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="badge badge-primary badge-sm">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
