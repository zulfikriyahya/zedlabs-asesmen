'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { examPackagesApi } from '@/lib/api/exam-packages.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { ExamStatistics } from '@/components/analytics/ExamStatistics';
import { ItemAnalysisChart } from '@/components/analytics/ItemAnalysisChart';
import { DashboardStats } from '@/components/analytics/DashboardStats';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function PackageStatisticsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    examPackagesApi
      .getItemAnalysis(id)
      .then(setData)
      .catch((e) => setError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading fullscreen text="Memuat statistik..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <h1 className="text-2xl font-bold">Statistik Paket</h1>
      </div>

      {error && <Alert variant="warning">{error}</Alert>}

      {data && (
        <>
          <DashboardStats
            stats={[
              { label: 'Total Peserta', value: data.totalAttempts ?? 0, icon: '👥' },
              {
                label: 'Rata-rata Nilai',
                value: `${(data.avgScore ?? 0).toFixed(1)}%`,
                icon: '📊',
                variant: 'primary',
              },
              {
                label: 'Nilai Tertinggi',
                value: `${(data.maxScore ?? 0).toFixed(1)}%`,
                icon: '🏆',
                variant: 'success',
              },
              { label: 'Nilai Terendah', value: `${(data.minScore ?? 0).toFixed(1)}%`, icon: '📉' },
            ]}
          />

          {data.scoreDistribution && (
            <Card bordered>
              <ExamStatistics
                labels={Object.keys(data.scoreDistribution)}
                scores={Object.values(data.scoreDistribution) as number[]}
              />
            </Card>
          )}

          {data.itemAnalysis && data.itemAnalysis.length > 0 && (
            <Card bordered>
              <ItemAnalysisChart items={data.itemAnalysis} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
