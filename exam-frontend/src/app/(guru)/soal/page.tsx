'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { questionsApi, type QuestionQueryParams } from '@/lib/api/questions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import type { Question } from '@/types/question';
import type { QuestionType } from '@/types/common';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Confirm } from '@/components/ui/Confirm';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
  { value: 'COMPLEX_MULTIPLE_CHOICE', label: 'PG Kompleks' },
  { value: 'TRUE_FALSE', label: 'Benar/Salah' },
  { value: 'MATCHING', label: 'Menjodohkan' },
  { value: 'SHORT_ANSWER', label: 'Jawaban Singkat' },
  { value: 'ESSAY', label: 'Esai' },
];

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  draft: 'warning',
  review: 'info',
  approved: 'success',
};

export default function SoalListPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: QuestionQueryParams = { page, limit: LIMIT };
      if (search) params.search = search;
      if (type) params.type = type as QuestionType;
      const res = await questionsApi.list(params);
      setQuestions(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await questionsApi.delete(deleteTarget.id);
      success('Soal berhasil dihapus');
      setDeleteTarget(null);
      void load();
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await questionsApi.approve(id);
      success('Soal disetujui');
      void load();
    } catch (e) {
      toastError(parseErrorMessage(e));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bank Soal</h1>
          <p className="text-sm text-base-content/60">{total} soal tersedia</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => router.push('/guru/soal/import')}>
            📥 Import
          </Button>
          <Button size="sm" onClick={() => router.push('/guru/soal/create')}>
            + Buat Soal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="min-w-48 flex-1">
          <Input
            placeholder="Cari soal..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            inputSize="sm"
          />
        </div>
        <div className="w-44">
          <Select
            options={TYPE_OPTIONS}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Table
        data={questions}
        keyExtractor={(q) => q.id}
        loading={loading}
        emptyText="Tidak ada soal ditemukan"
        zebra
        columns={[
          {
            key: 'content',
            header: 'Soal',
            render: (q) => (
              <div>
                <p className="line-clamp-2 text-sm">{q.content.text}</p>
                <div className="mt-1 flex gap-1.5">
                  <Badge variant="neutral" size="xs">
                    {q.type.replace(/_/g, ' ')}
                  </Badge>
                  {q.tags?.map((t) => (
                    <Badge key={t.id} variant="ghost" size="xs">
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            className: 'w-28',
            render: (q) => (
              <Badge variant={STATUS_VARIANT[q.status] ?? 'neutral'} size="sm">
                {q.status}
              </Badge>
            ),
          },
          {
            key: 'points',
            header: 'Poin',
            className: 'w-16 text-center',
            render: (q) => <span className="font-mono text-sm">{q.points}</span>,
          },
          {
            key: 'difficulty',
            header: 'Kesulitan',
            className: 'w-24',
            render: (q) => (
              <span>
                {'★'.repeat(q.difficulty)}
                {'☆'.repeat(5 - q.difficulty)}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-40',
            render: (q) => (
              <div className="flex justify-end gap-1">
                {q.status === 'review' && (
                  <Button size="xs" variant="success" onClick={() => void handleApprove(q.id)}>
                    ✓ Setuju
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => router.push(`/guru/soal/${q.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setDeleteTarget(q)}
                  className="text-error"
                >
                  Hapus
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <Button
            size="xs"
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="xs"
              variant={p === page ? 'primary' : 'ghost'}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            size="xs"
            variant="ghost"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </Button>
        </div>
      )}

      <Confirm
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Soal?"
        message={`Soal ini akan dihapus permanen. Tindakan tidak bisa dibatalkan.`}
        variant="error"
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  );
}
