'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gradingApi } from '@/lib/api/grading.api';
import { parseErrorMessage } from '@/lib/utils/error';
import type { ManualGradingItem } from '@/types/answer';
import { ManualGradingCard } from '@/components/grading/ManualGradingCard';
import { GradingRubric } from '@/components/grading/GradingRubric';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

export default function AttemptGradingPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.id as string; // ← ganti dari params.attemptId
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<ManualGradingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    gradingApi
      .listPending({ status: 'MANUAL_REQUIRED' })
      .then((res) => setItems(res.data.filter((i) => i.attemptId === attemptId)))
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await gradingApi.completeGrading(attemptId);
      await gradingApi.publishResult({ attemptId });
      success('Penilaian selesai dan hasil dipublikasikan!');
      router.replace('/guru/grading');
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <Loading fullscreen text="Memuat data penilaian..." />;

  const allGraded = items.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <h1 className="text-xl font-bold">
          Nilai Attempt: <span className="font-mono text-base">{attemptId.slice(0, 8)}</span>
        </h1>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {allGraded ? (
        <div className="space-y-4">
          <Alert variant="success" title="Semua jawaban sudah dinilai!">
            Klik tombol di bawah untuk menyelesaikan penilaian dan mempublikasikan hasil ke siswa.
          </Alert>
          <Button className="w-full" loading={completing} onClick={handleComplete}>
            Selesaikan & Publikasikan Hasil
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {items.map((item) => (
              <ManualGradingCard
                key={item.answerId}
                item={item}
                onGraded={() =>
                  setItems((prev) => prev.filter((i) => i.answerId !== item.answerId))
                }
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <GradingRubric maxScore={items[0]?.maxScore ?? 10} />
          </div>
        </div>
      )}
    </div>
  );
}
