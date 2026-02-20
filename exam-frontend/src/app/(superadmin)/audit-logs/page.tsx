'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api/client';
import { parseErrorMessage } from '@/lib/utils/error';
import { formatDateTime } from '@/lib/utils/format';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { username: string };
}

const ACTION_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  login: 'success',
  logout: 'info',
  start_exam: 'info',
  submit_exam: 'success',
  grade_answer: 'warning',
  publish_result: 'success',
  delete: 'error',
  lock_device: 'error',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${search}&limit=100` : '?limit=100';
      const res = await apiGet<{ data: AuditLog[] }>(`audit-logs${params}`);
      setLogs(res.data);
    } catch (e) {
      setError(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <Input
        placeholder="Cari aksi, entity..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        inputSize="sm"
        className="max-w-sm"
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Table
        data={logs}
        keyExtractor={(l) => l.id}
        loading={loading}
        emptyText="Tidak ada log"
        compact
        columns={[
          {
            key: 'time',
            header: 'Waktu',
            className: 'w-36',
            render: (l) => <span className="font-mono text-xs">{formatDateTime(l.createdAt)}</span>,
          },
          {
            key: 'user',
            header: 'Pengguna',
            className: 'w-32',
            render: (l) => (
              <span className="text-sm">
                {l.user?.username ?? l.userId?.slice(0, 8) ?? 'System'}
              </span>
            ),
          },
          {
            key: 'action',
            header: 'Aksi',
            className: 'w-36',
            render: (l) => (
              <Badge variant={ACTION_VARIANT[l.action] ?? 'neutral'} size="xs">
                {l.action}
              </Badge>
            ),
          },
          {
            key: 'entity',
            header: 'Entity',
            render: (l) => (
              <span className="text-xs text-base-content/60">
                {l.entityType} · <code>{l.entityId.slice(0, 8)}</code>
              </span>
            ),
          },
          {
            key: 'ip',
            header: 'IP',
            className: 'w-28',
            render: (l) => (
              <code className="text-xs text-base-content/40">{l.ipAddress ?? '—'}</code>
            ),
          },
        ]}
      />
    </div>
  );
}
