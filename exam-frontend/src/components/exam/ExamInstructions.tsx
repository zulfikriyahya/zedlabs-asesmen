import type { ExamPackageSettings } from '@/types/exam';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/exam/timer';

interface ExamInstructionsProps {
  title: string;
  settings: ExamPackageSettings;
  questionCount: number;
  totalPoints: number;
  onStart: () => void;
  loading?: boolean;
}

export function ExamInstructions({
  title,
  settings,
  questionCount,
  totalPoints,
  onStart,
  loading,
}: ExamInstructionsProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Soal', value: questionCount },
            { label: 'Durasi', value: formatDuration(settings.duration * 60) },
            { label: 'Total Poin', value: totalPoints },
            { label: 'Maks. Percobaan', value: settings.maxAttempts },
          ].map((item) => (
            <div key={item.label} className="rounded-box bg-base-200 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{item.value}</p>
              <p className="text-xs text-base-content/60">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Alert variant="warning" title="Perhatian">
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          <li>Pastikan koneksi internet stabil sebelum mulai</li>
          <li>Jangan tutup tab atau browser selama ujian berlangsung</li>
          <li>Jawaban tersimpan otomatis setiap ada perubahan</li>
          {settings.shuffleQuestions && <li>Urutan soal diacak secara otomatis</li>}
          {settings.shuffleOptions && <li>Urutan pilihan jawaban diacak</li>}
        </ul>
      </Alert>

      <Button wide className="w-full" onClick={onStart} loading={loading}>
        Mulai Ujian
      </Button>
    </div>
  );
}
