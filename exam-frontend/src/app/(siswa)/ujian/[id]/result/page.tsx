'use client';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { submissionsApi } from '@/lib/api/submissions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { formatDateTime } from '@/lib/utils/format';
import type { ExamResult } from '@/types/exam';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const GRADING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu',
  AUTO_GRADED: 'Sudah Dinilai',
  MANUAL_REQUIRED: 'Menunggu Guru',
  COMPLETED: 'Selesai Dinilai',
  PUBLISHED: 'Nilai Dipublikasikan',
};

export default function ResultPage() {
  const params = useParams();
  // const { activeAttempt, clearExam } = useExamStore()
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const attemptId = activeAttempt?.id ?? (params.sessionId as string)
  const attemptId = activeAttempt?.id ?? (params.id as string);
  useEffect(() => {
    if (!attemptId) return;
    submissionsApi
      .getResult(attemptId)
      .then(setResult)
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    // Bersihkan exam state setelah result dimuat
    return () => {
      clearExam();
    };
  }, [clearExam]);

  if (loading) return <Loading fullscreen text="Memuat hasil ujian..." />;
  if (error)
    return (
      <div className="mx-auto max-w-md pt-16">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  if (!result) return null;

  const pct = result.percentage;
  const scoreColor = pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-error';

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{result.sessionTitle}</h1>
        <p className="text-sm text-base-content/60">
          Dikumpulkan: {formatDateTime(result.submittedAt)}
        </p>
        <Badge variant={result.gradingStatus === 'PUBLISHED' ? 'success' : 'warning'} size="sm">
          {GRADING_STATUS_LABEL[result.gradingStatus]}
        </Badge>
      </div>

      {result.gradingStatus === 'PUBLISHED' ? (
        <>
          {/* Score card */}
          <Card className="text-center">
            <div className={`text-6xl font-bold tabular-nums ${scoreColor}`}>{Math.round(pct)}</div>
            <p className="mt-1 text-base-content/60">Nilai (%)</p>
            <p className="mt-2 text-sm">
              {result.totalScore} / {result.maxScore} poin
            </p>
          </Card>

          {/* Breakdown */}
          {result.answers && result.answers.length > 0 && (
            <Card>
              <h3 className="mb-3 font-semibold">Rincian Jawaban</h3>
              <div className="space-y-2">
                {result.answers.map((a, i) => (
                  <div key={a.questionId} className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Soal {i + 1}</span>
                    <div className="flex items-center gap-2">
                      {a.feedback && (
                        <span className="text-xs italic text-base-content/50">{a.feedback}</span>
                      )}
                      <span
                        className={
                          a.score === a.maxScore ? 'font-medium text-success' : 'text-base-content'
                        }
                      >
                        {a.score ?? '-'}/{a.maxScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Alert variant="info" title="Nilai belum tersedia">
          {result.gradingStatus === 'MANUAL_REQUIRED'
            ? 'Ujian Anda mengandung soal esai yang perlu dinilai manual oleh guru.'
            : 'Nilai sedang diproses. Silakan cek kembali nanti.'}
        </Alert>
      )}
    </div>
  );
}
