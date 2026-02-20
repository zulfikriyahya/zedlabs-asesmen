'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { examPackagesApi } from '@/lib/api/exam-packages.api';
import { parseErrorMessage } from '@/lib/utils/error';
import type { ExamPackage } from '@/types/exam';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Confirm } from '@/components/ui/Confirm';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';

const PKG_STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  DRAFT: 'warning',
  REVIEW: 'info',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
};

export default function UjianListPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<ExamPackage | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examPackagesApi.list({ limit: 50 });
      setPackages(res.data);
    } catch (e) {
      setError(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePublish = async () => {
    if (!publishTarget) return;
    setPublishing(true);
    try {
      await examPackagesApi.publish(publishTarget.id);
      success(`Paket "${publishTarget.title}" dipublikasikan!`);
      setPublishTarget(null);
      void load();
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paket Ujian</h1>
          <p className="text-sm text-base-content/60">{packages.length} paket</p>
        </div>
        <Button size="sm" onClick={() => router.push('/guru/ujian/create')}>
          + Buat Paket
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Table
        data={packages}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyText="Belum ada paket ujian"
        zebra
        columns={[
          {
            key: 'title',
            header: 'Paket',
            render: (p) => (
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-base-content/50">
                  {p.questionCount ?? 0} soal · {p.settings.duration} menit
                </p>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            className: 'w-28',
            render: (p) => (
              <Badge variant={PKG_STATUS_VARIANT[p.status] ?? 'neutral'} size="sm">
                {p.status}
              </Badge>
            ),
          },
          {
            key: 'published',
            header: 'Dipublikasikan',
            className: 'w-32',
            render: (p) => (
              <span className="text-xs">{p.publishedAt ? formatDate(p.publishedAt) : '—'}</span>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-48',
            render: (p) => (
              <div className="flex flex-wrap justify-end gap-1">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => router.push(`/guru/ujian/${p.id}/preview`)}
                >
                  Preview
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => router.push(`/guru/ujian/${p.id}/edit`)}
                >
                  Edit
                </Button>
                {p.status !== 'PUBLISHED' && (
                  <Button size="xs" variant="success" onClick={() => setPublishTarget(p)}>
                    Publish
                  </Button>
                )}
                {p.status === 'PUBLISHED' && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => router.push(`/guru/ujian/${p.id}/statistics`)}
                  >
                    Statistik
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Confirm
        open={!!publishTarget}
        onCancel={() => setPublishTarget(null)}
        onConfirm={handlePublish}
        title="Publish Paket?"
        message={`Paket "${publishTarget?.title}" akan dipublikasikan dan bisa digunakan operator untuk sesi ujian.`}
        confirmLabel="Publish"
        loading={publishing}
      />
    </div>
  );
}
