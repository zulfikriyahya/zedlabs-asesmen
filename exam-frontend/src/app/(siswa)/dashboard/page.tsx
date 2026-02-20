'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submissionsApi } from '@/lib/api/submissions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { formatDateTime } from '@/lib/utils/format';
import type { ExamAttempt } from '@/types/exam';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/stores/auth.store';

const STATUS_LABEL: Record<
  string,
  { label: string; variant: 'primary' | 'success' | 'error' | 'warning' }
> = {
  IN_PROGRESS: { label: 'Sedang Berlangsung', variant: 'warning' },
  SUBMITTED: { label: 'Selesai', variant: 'success' },
  TIMED_OUT: { label: 'Waktu Habis', variant: 'error' },
  ABANDONED: { label: 'Dibatalkan', variant: 'error' },
};

export default function SiswaDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    submissionsApi
      .getAttempts()
      .then(setAttempts)
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Memuat data..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Selamat Datang, {user?.username ?? 'Siswa'}</h1>
        <p className="text-sm text-base-content/60">Riwayat ujian dan akses cepat</p>
      </div>

      <Button onClick={() => router.push('/siswa/ujian/download')} className="w-full sm:w-auto">
        + Mulai Ujian Baru
      </Button>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-3">
        <h2 className="font-semibold">Riwayat Ujian</h2>
        {attempts.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center text-base-content/40">
            <span className="mb-2 text-4xl">📋</span>
            <p>Belum ada riwayat ujian.</p>
          </div>
        ) : (
          attempts.map((attempt) => {
            const cfg = STATUS_LABEL[attempt.status];
            return (
              <Card
                key={attempt.id}
                compact
                bordered
                className="flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="font-mono text-sm font-medium">{attempt.id.slice(0, 8)}...</p>
                  <p className="text-xs text-base-content/50">
                    {formatDateTime(attempt.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cfg?.variant ?? 'neutral'} size="xs">
                    {cfg?.label}
                  </Badge>
                  {attempt.status === 'SUBMITTED' && attempt.gradingStatus === 'PUBLISHED' && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => router.push(`/siswa/ujian/${attempt.sessionId}/result`)}
                    >
                      Lihat Nilai
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
