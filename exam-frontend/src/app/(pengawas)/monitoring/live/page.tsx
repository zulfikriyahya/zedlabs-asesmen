'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessionsApi } from '@/lib/api/sessions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import type { ExamSession } from '@/types/exam';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { formatDateTime } from '@/lib/utils/format';

export default function LiveSessionListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sessionsApi
      .list({ limit: 50 })
      .then((res) =>
        setSessions(res.data.filter((s) => s.status === 'ACTIVE' || s.status === 'PAUSED')),
      )
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading fullscreen text="Memuat sesi aktif..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sesi Aktif</h1>
        <p className="text-sm text-base-content/60">Pilih sesi untuk mulai monitoring</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="mb-3 text-4xl">🔍</span>
          <p className="font-medium">Tidak ada sesi aktif saat ini</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              bordered
              className="cursor-pointer transition-all hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{session.title}</h3>
                  <Badge variant={session.status === 'ACTIVE' ? 'success' : 'warning'} size="xs">
                    {session.status === 'ACTIVE' ? '🟢 Aktif' : '⏸ Jeda'}
                  </Badge>
                </div>
                <p className="text-xs text-base-content/60">{session.examPackage?.title ?? '—'}</p>
                <div className="space-y-0.5 text-xs text-base-content/50">
                  <p>Mulai: {formatDateTime(session.startTime)}</p>
                  <p>Selesai: {formatDateTime(session.endTime)}</p>
                  {session.studentCount !== undefined && <p>{session.studentCount} peserta</p>}
                </div>
                <button
                  className="btn btn-primary btn-sm mt-2 w-full"
                  onClick={() => router.push(`/pengawas/monitoring/${session.id}`)}
                >
                  Monitor Sesi →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
