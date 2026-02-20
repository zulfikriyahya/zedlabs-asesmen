'use client';
import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api/analytics.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { DashboardStats } from '@/components/analytics/DashboardStats';
import { Alert } from '@/components/ui/Alert';

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi
      .getDashboard()
      .then(setStats)
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Sekolah',
      value: stats ? String(stats.totalTenants ?? 0) : '—',
      icon: '🏫',
      variant: 'primary' as const,
    },
    { label: 'Total Pengguna', value: stats ? String(stats.totalUsers ?? 0) : '—', icon: '👥' },
    {
      label: 'Sesi Aktif',
      value: stats ? String(stats.activeSessions ?? 0) : '—',
      icon: '📋',
      variant: 'success' as const,
    },
    { label: 'Ujian Hari Ini', value: stats ? String(stats.examsToday ?? 0) : '—', icon: '📅' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Superadmin</h1>
      {error && <Alert variant="warning">{error}</Alert>}
      <DashboardStats stats={statCards} loading={loading} />
    </div>
  );
}
