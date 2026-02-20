'use client';
import { useState } from 'react';
import { apiPost, apiGet } from '@/lib/api/client';
import { sessionsApi } from '@/lib/api/sessions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { useEffect } from 'react';
import type { ExamSession } from '@/types/exam';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';

type ReportFormat = 'pdf' | 'excel';

export default function LaporanPage() {
  const { success, error: toastError } = useToast();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [selectedSid, setSelectedSid] = useState('');
  const [format, setFormat] = useState<ReportFormat>('excel');
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    sessionsApi
      .list({ limit: 100 })
      .then((res) => setSessions(res.data))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedSid) return;
    setGenerating(true);
    setDownloadUrl(null);
    try {
      const res = await apiPost<{ jobId: string }>('reports/generate', {
        sessionId: selectedSid,
        format,
      });
      // Poll hingga selesai
      let url: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const status = await apiGet<{ status: string; url?: string }>(
          `reports/status/${res.jobId}`,
        );
        if (status.status === 'completed' && status.url) {
          url = status.url;
          break;
        }
        if (status.status === 'failed') throw new Error('Gagal generate laporan');
      }
      if (url) {
        setDownloadUrl(url);
        success('Laporan berhasil digenerate!');
      }
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  const sessionOptions = sessions.map((s) => ({ value: s.id, label: s.title }));

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Ekspor Laporan</h1>

      <Card bordered>
        <div className="space-y-4">
          <Select
            label="Pilih Sesi Ujian"
            options={sessionOptions}
            placeholder="Pilih sesi..."
            value={selectedSid}
            onChange={(e) => setSelectedSid(e.target.value)}
          />

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Format Laporan</span>
            </label>
            <div className="flex gap-3">
              {(['excel', 'pdf'] as const).map((f) => (
                <label
                  key={f}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-box border-2 py-3 text-sm font-medium transition-colors ${format === f ? 'border-primary bg-primary/5' : 'border-base-300'}`}
                >
                  <input
                    type="radio"
                    className="radio-primary radio radio-sm"
                    checked={format === f}
                    onChange={() => setFormat(f)}
                  />
                  {f === 'excel' ? '📊 Excel' : '📄 PDF'}
                </label>
              ))}
            </div>
          </div>

          {downloadUrl && (
            <Alert variant="success">
              Laporan siap!{' '}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-success font-medium"
              >
                Download di sini
              </a>
            </Alert>
          )}

          <Button
            className="w-full"
            disabled={!selectedSid}
            loading={generating}
            onClick={handleGenerate}
          >
            {generating ? 'Membuat laporan...' : 'Generate Laporan'}
          </Button>
        </div>
      </Card>

      <Card compact>
        <p className="mb-2 text-xs font-medium">Konten laporan:</p>
        <ul className="list-inside list-disc space-y-0.5 text-xs text-base-content/60">
          <li>Daftar peserta dan status pengerjaan</li>
          <li>Nilai per peserta (jika sudah dipublikasikan)</li>
          <li>Statistik soal (jawaban terbanyak, dll)</li>
          <li>Waktu mulai dan submit masing-masing peserta</li>
        </ul>
      </Card>
    </div>
  );
}
