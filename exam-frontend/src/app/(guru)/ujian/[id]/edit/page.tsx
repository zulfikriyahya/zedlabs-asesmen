'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { examPackagesApi } from '@/lib/api/exam-packages.api';
import { questionsApi } from '@/lib/api/questions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { createExamPackageSchema, type CreateExamPackageInput } from '@/schemas/exam.schema';
import type { Question } from '@/types/question';
import type { ExamPackage } from '@/types/exam';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useToast } from '@/hooks/use-toast';

export default function EditUjianPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { success } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [qSearch, setQSearch] = useState('');
  const [pkg, setPkg] = useState<ExamPackage | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamPackageInput>({
    resolver: zodResolver(createExamPackageSchema),
  });

  useEffect(() => {
    Promise.all([
      examPackagesApi.getById(id),
      questionsApi.list({ status: 'approved', limit: 100 }),
    ])
      .then(([pkgData, qRes]) => {
        setPkg(pkgData);
        setQuestions(qRes.data);
        reset({
          title: pkgData.title,
          description: pkgData.description ?? undefined,
          subjectId: pkgData.subjectId ?? undefined,
          settings: pkgData.settings,
        });
        // Load existing question IDs
        examPackagesApi.getById(id).then((p) => {
          // questionIds dari pkg jika ada
          setSelectedQIds((p as any).questionIds ?? []);
        });
      })
      .catch((e) => setLoadError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const toggleQ = (qid: string) =>
    setSelectedQIds((prev) =>
      prev.includes(qid) ? prev.filter((x) => x !== qid) : [...prev, qid],
    );

  const onSubmit = async (data: CreateExamPackageInput) => {
    setServerError(null);
    try {
      await examPackagesApi.update(id, {
        ...data,
        questionIds: selectedQIds.map((qId, i) => ({ questionId: qId, order: i + 1 })),
      } as any);
      success('Paket ujian berhasil diperbarui!');
      router.push('/guru/ujian');
    } catch (e) {
      setServerError(parseErrorMessage(e));
    }
  };

  if (loading) return <Loading fullscreen text="Memuat paket ujian..." />;
  if (loadError) return <Alert variant="error">{loadError}</Alert>;

  const filteredQ = questions.filter((q) =>
    q.content.text.toLowerCase().includes(qSearch.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Paket Ujian</h1>
          {pkg && <p className="text-sm text-base-content/60">{pkg.title}</p>}
        </div>
      </div>

      {pkg?.status === 'PUBLISHED' && (
        <Alert variant="warning" title="Paket Sudah Dipublikasikan">
          Mengubah paket yang sudah dipublikasikan dapat mempengaruhi sesi ujian yang sedang
          berjalan.
        </Alert>
      )}

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card bordered>
          <h2 className="mb-4 font-semibold">Informasi Paket</h2>
          <div className="space-y-4">
            <Input
              label="Judul Paket"
              placeholder="Contoh: UAS Matematika Kelas X"
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="Deskripsi (opsional)"
              placeholder="Deskripsi singkat paket ujian"
              {...register('description')}
            />
          </div>
        </Card>

        <Card bordered>
          <h2 className="mb-4 font-semibold">Pengaturan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input
              label="Durasi (menit)"
              type="number"
              error={(errors.settings?.duration as any)?.message}
              {...register('settings.duration', { valueAsNumber: true })}
            />
            <Input
              label="Maks. Percobaan"
              type="number"
              {...register('settings.maxAttempts', { valueAsNumber: true })}
            />
            <div className="col-span-2 space-y-2 pt-2 sm:col-span-1">
              {[
                { field: 'settings.shuffleQuestions', label: 'Acak urutan soal' },
                { field: 'settings.shuffleOptions', label: 'Acak pilihan jawaban' },
                { field: 'settings.showResult', label: 'Tampilkan hasil ke siswa' },
              ].map(({ field, label }) => (
                <label key={field} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                    {...register(field as any)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Card bordered>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Pilih Soal</h2>
            <Badge variant="primary" size="sm">
              {selectedQIds.length} dipilih
            </Badge>
          </div>
          <Input
            placeholder="Cari soal..."
            value={qSearch}
            onChange={(e) => setQSearch(e.target.value)}
            inputSize="sm"
            className="mb-3"
          />
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {filteredQ.map((q) => {
              const sel = selectedQIds.includes(q.id);
              return (
                <label
                  key={q.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-box p-2 text-sm transition-colors ${
                    sel ? 'border border-primary/30 bg-primary/5' : 'hover:bg-base-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm mt-0.5 shrink-0"
                    checked={sel}
                    onChange={() => toggleQ(q.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1">{q.content.text}</p>
                    <div className="mt-0.5 flex gap-1">
                      <Badge variant="neutral" size="xs">
                        {q.type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="ghost" size="xs">
                        {q.points}pt
                      </Badge>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={selectedQIds.length === 0}>
            Simpan Perubahan ({selectedQIds.length} soal)
          </Button>
        </div>
      </form>
    </div>
  );
}
